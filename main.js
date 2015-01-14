var locations = [];
var prev = [];
var first;
var on = false;
var loading, topz;
var loading_el;
var first_diff;
var activated;
loading = true;
var forbackpress;
var rows = []
var checkedend = false
var last
var popup = document.createElement("IFRAME")
popup.src = chrome.extension.getURL("popup.html")
popup.style.position = "fixed"
popup.style.color = "blue"
popup.style.top = "50%"
var resizing;
var url = document.URL

function jq_img(element) {
    var ref = element.getAttribute("qs_updown")
    return $("[qs_updown = '" + ref +"']")
}

function height(element) {
    return jq_img(element).outerHeight()
}
function width(element) {
    return jq_img(element).outerWidth();
}
function size(e) {
    return height(e) * width(e);
}
function simsize(a, b) {
    return (size(a) < size(b) * 2 && 
            size(a) > size(b) * 0.5 &&
            height(a) < height(b) * 1.5 &&
            height(a) > height(b) * 0.75);
}

function sim_pos(y1, y2) {
    return (y1 < y2 + 30 && y1 > y2 - 30);
}

function Row(y_pos, first_img_col_pos, first_img) {
    this.pos = y_pos
    this.col_pos = first_img_col_pos
    this.imgs = [first_img]
}

function in_row(img, row) {
    if (simsize(img, row.imgs[0]) &&
        sim_pos(img.getAttribute("y_pos"), row.pos)) {
        return true
    } 
    return false
}

// Return true if thinks current page is catalog-type and appends row offsets to LOCATIONS
function detect() {
    chrome.runtime.sendMessage({message: "loading"}, function(response){});
    loading = true
    console.log("detect");
    // if (locations.length != 0) {
    //     console.log("locations exist")
    //     on = true
    //     return true
    // }

    if (activated) {
        if (locations.length == 0) {
            console.log("activated, known false")
            return false
        }
        else if (Math.round(window.pageYOffset + window.innerHeight/2) <= locations[locations.length - 1]) {
            console.log("activated, known true")
            return true
        }
    }

    if (last) {
        var i = parseInt(last.getAttribute("qs_updown").substring(3))
    }
    else {
        var i = 0
    }
    console.log("start index: " + i)
    var list = $("img");
    var rows_len = rows.length
    for (i; i < list.length; i++) {
        var img = list[i]
        img.setAttribute("qs_updown", "ref" + i);
        var jq = jq_img(img)
        var y = Math.round(jq.offset().top + height(img)/2)
        var x = Math.round(jq.offset().left + width(img)/2)
        if (y < locations[locations.length - 1]) {
            continue;
        }
        if (y > 0 && x > 0 && size(img) > 25000) {
            img.setAttribute("y_pos", y);
            img.setAttribute("x_pos", x);
            var p = rows.length - 1
            while (p >= 0 && rows[p].pos > y) {
                p -= 1
            }
            var r = new Row(y, x, img)
            if (p < 0) {
                rows.splice(0, 0, r)
            }
            else if (in_row(img, rows[p])) {
                rows[p].imgs.push(img)
            }
            else {
                rows.splice(p + 1, 0, r)
            }
        }
    }
    if (rows.length == 0) {
        console.log("no rows found")
        return false
    }

    if (locations.length > 0 && rows.length == rows_len) {
        console.log("no change")
        console.log(locations)
        console.log(prev)
        return true
    }

    prev = locations.slice(0)

    var occurance = {};
    var max_len = [0, 0]
    for (var i = 0; i < rows.length; i++) {
        var len = rows[i].imgs.length;
        if (occurance[len]) {
            occurance[len] += 1
        }
        else {
            occurance[len] = 1
        }
        if (occurance[len] > max_len[1]) {
            max_len[0] = len
            max_len[1] = occurance[len]
        }
    }

    if (max_len[1] < 2 && max_len[0] < 3) {
        console.log(rows)
        console.log("false, max_len < 2")
        return false
    }

    var less_rows = []
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].imgs.length == max_len[0])  {
            less_rows.push(rows[i])
        }
    }

    if (less_rows.length == 0) {
        console.log("no lessrows found")
        return false
    }

    var modelrow = less_rows[Math.round(less_rows.length/3) - 1]
    if (modelrow == null) {
        console.log("no modelrow found")
        console.log(less_rows)
        console.log(rows)
        return false
    }

    for (var i = 0; i < rows.length; i++) {
        if (sim_pos(rows[i].col_pos, modelrow.col_pos) &&
            simsize(rows[i].imgs[0], modelrow.imgs[0])) {
            if (!first) {
                first = rows[i].imgs[0]
            }
            if (locations.length == 0 ||
                rows[i].pos > locations[locations.length - 1]) {
                locations.push(rows[i].pos)
                last = rows[i].imgs[0]
            }
        }
    }
    
    if (locations.length < 2 && max_len[0] < 3) {
        console.log(rows)
        console.log(occurance)
        console.log(less_rows)
        console.log(modelrow)
        console.log(max_len)
        console.log(locations)
        console.log("false, locations < 3")
        locations = []
        return false
    }

    if (max_len[0] == 1 && locations.length < 10) {
        console.log("false, columns = 1 and locations < 10")
        locations = []
        return false
    }

    console.log("locations: " + locations)
    on = true;
    console.log("true")
    return true
}


function next_ud(direction) {
    var curr = Math.round(window.pageYOffset + window.innerHeight/2);
    var diff;
    if (direction == "Down") {
        for (var i = 0; i < locations.length; i++) {
            diff = locations[i] - curr
            if (diff > 1.5) {
                return diff;
            }
        }
    }
    if (direction == "Up") {
        for (var i = locations.length - 1; i > -1 ; i--) {
            diff = locations[i] - curr
            if (diff < -1.5) {
                return diff;
            }
        }
    }
    return null;
}

function processKeyEvent(event) {
    if (!on) {
        return
    }
    switch (event.keyIdentifier) {
        case 'Up':
        case 'Down':
            if (event.keyIdentifier == 'Down') {
                var curr = Math.round(window.pageYOffset + window.innerHeight/2);
                if (!checkedend && curr >= locations[locations.length -1] + height(first)) {
                    detect();
                    chrome.runtime.sendMessage({message: "shoptime"}, function(response){});
                    console.log(locations)
                    console.log(prev)
                    // next line true if end has not changed since re detect
                    checkedend = locations.toString() == prev.toString();
                    if (prev.length == 0) {
                        checkedend = true
                    }
                    prev = locations
                    event.preventDefault();
                    break;
                }
            }
            var diff = next_ud(event.keyIdentifier);
            if (diff != null) {
                event.preventDefault();
                var ftop = first.getAttribute("y_pos")
                if (ftop != locations[0]) {
                    diff = diff + (ftop - locations[0])
                }
                console.log("scrollBy: " + diff)
                window.scrollBy(0, diff);

            }
            break;
        case 'Left':
        case 'Right':
            // window.postMessage("spinstart", "*")
            document.body.style.opacity = "0.65"
            loading = true
            forbackpress = true
            var next = next_lr(event.keyIdentifier);
            console.log(next)
            if (next != null) {
                next.click();
            }
            else {
                console.log(guides)
                console.log(occurance)
                console.log(pages)
                forbackpress = false
                document.body.style.opacity = "1"
            }
            break;
    }
}





chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "detect") {
            console.log("detect-rec")
            var bool = detect()
            if (!bool) {
                if (loading && forbackpress) {
                    location.reload()
                    forbackpress = false
                }
                chrome.runtime.sendMessage({message: "not-shoptime"}, function(response){});
                document.body.style.opacity = "1"
            }
            else {
                if (prev != null && forbackpress && locations.toString() == prev.toString()) {
                    console.log('forback with exact same locations, need reset')
                    url = null
                    chrome.runtime.sendMessage({message: "reload"}, function(response){});
                    forbackpress = false
                } 
                else {
                    forbackpress = false
                    console.log('should be green')
                    if (on) {
                        chrome.runtime.sendMessage({message: "shoptime"}, function(response){});
                    }
                    else {
                        chrome.runtime.sendMessage({message: "nowant"}, function(response){});
                    }

                    document.body.style.opacity = "1"
                }
            }
            if (loading) {
                // console.log("I WANT TO STOP SPINNING")
                // window.postMessage("spinstop", "*")
                loading = null
            }
        }

        else if (request.message == "reset") {
            if (resizing || document.URL != url) {
                locations = []
                rows = []
                first = null
                last = null
                prev = null
                checkedend = false
                activated = false
                resizing = false
                url = document.URL
            }
        }
        else if (request.message == "activate") {
            activated = true;
        }

        else if (request.message == "checkon") {
            console.log(on)
            console.log(forbackpress)
            if (on || forbackpress) {
                chrome.runtime.sendMessage({message: "reload"}, function(response){});
            }
            else {
                chrome.runtime.sendMessage({message: "notshoptime"}, function(response){});
                console.log("off, no action")
            }
        }

        else if (request.message == "toggle") {
            if (locations.length == 0) {
                activated = false
                chrome.runtime.sendMessage({message: "reload"}, function(response){});
            }
            else {
                on = !on;
                if (on) {
                    chrome.runtime.sendMessage({message: "reload"}, function(response){});
                }
                else {
                    chrome.runtime.sendMessage({message: "nowant"}, function(response){});
                }
            }
            console.log("toggle-done")
        }
    });


window.addEventListener('keydown', processKeyEvent)
window.addEventListener('resize', function() {
    resizing = true
    chrome.runtime.sendMessage({message: "reload"}, function(response) {
    });
    });



// Gets position of one page link element to use as a guide to determine others
// since page numbers are usually in a straight line on a page.
// This is needed in case current page is not a link. Ignores possibility
// that there could be other href elements with innerHTML "somenumber" 


// ***********add something for if pages returns <= 1 item list********

// Get unique page element (curr page)
function tag(e) {
    return e.tagName;
}

function cname(e) {
    return e.className;
}

function color_func(e) {
    var sty = window.getComputedStyle(e);
    return sty.color;
}

function weight_func(e) {
    var sty = window.getComputedStyle(e);
    return sty.fontWeight;
}

var attr_func_list = [tag, cname, color_func, weight_func];

// Gets the one unique string from a STR_ARRAY, if none or more than one, return null
function get_unique(str_array) {
    var s = str_array[0];
    if (str_array.length == 2) {
        return s;
    }    
    var diff = [];
    for (var i = 1; i < str_array.length; i++) {
        if (str_array[i] != s) {
            diff.push(str_array[i]);
        }
    }
    if (diff.length == 1) {
        return diff[0];
    }
    else if (diff.length == str_array.length - 1) {
        return s;
    }
    return null;
}

// Gets the element with the link to the next page using a specified ATTR 
// to compare the page number elements from PAGES
function get_next_page(attr, next) {
    var attr_list = [];
    for (var i = 0; i < pages.length; i++) {
        attr_list.push(attr(pages[i]));
    }
    var u_attr = get_unique(attr_list);
    if (u_attr == null) {
        return null;
    }
    console.log(u_attr)
    console.log(pages)
    for (i = 0; i < pages.length; i++) {
        if (attr(pages[i]) == u_attr) {
            if (next != "Right") {
                if (i - 1 >= 0) {
                    return pages[i - 1];
                }
            }
            else if (i + 1 < pages.length) {
                return pages[i + 1];
            return null;
            }
        } 
    }
    return null;
}

function jq_img_fb(element) {
    var ref = element.getAttribute("qs_forback")
    return $("[qs_forback = '" + ref +"']")
}

function height_fb(element) {
    return jq_img_fb(element).outerHeight()
}
function width_fb(element) {
    return jq_img_fb(element).outerWidth();
}
function size_fb(e) {
    return height(e) * width(e);
}
function simsize_fb(a, b) {
    return (size(a) < size(b) * 3 && 
            size(a) > size(b) * 0.3 &&
            height(a) < height(b) * 3 &&
            height(a) > height(b) * 0.3);
}

function sim_pos_fb(y1, y2) {
    return (y1 < y2 + 10 && y1 > y2 - 10);
}

var patt = /^[0-9]+$/;
var pages = [];
var e, pos;
var guides = []
var occurance = {}
var max_len = [0, 0]
var list = document.getElementsByTagName("*");

function next_lr(direction) {
    pages = [];

    guides = []
    for (i = 0; i < list.length; i++) {
        e = list[i];
        if (e.innerHTML.match(patt)) {
            guides.push(e)
        }
    }
    occurance = {};
    max_len = [0, 0]
    
    for (var i = 0; i < guides.length; i++) {
        var num = guides[i]
        num.setAttribute("qs_forback", "ref" + i);
        var y = Math.round($("[qs_forback |= 'ref" + i + "']").offset().top + height_fb(num)/2)
        num.setAttribute("page-y_pos", y);
        if (y == null || y < locations[locations.length - 1]) {
            continue;
        }
        if (occurance[y]) {
            occurance[y].push(num)
        }
        else {
            occurance[y] = [num]
        }
        if (occurance[y].length > max_len[1]) {
            max_len[0] = y
            max_len[1] = occurance[y].length
        }
    }
    // Pushes page number elements to PAGES
    pages = occurance[max_len[0]]
    if (pages == null) {
        console.log("could not find pages")
        return null
    }

    for (var i = 0; i < attr_func_list.length; i++) {
        var next_el = get_next_page(attr_func_list[i], direction);
        if (next_el != null) {
            break;
        }
    }
    return next_el;
}