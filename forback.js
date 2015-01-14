var list = document.getElementsByTagName("*");
var patt = /^[0-9]+$/;
var pages = [];
var e, pos;

// Gets position of one page link element to use as a guide to determine others
// since page numbers are usually in a straight line on a page.
// This is needed in case current page is not a link. Ignores possibility
// that there could be other href elements with innerHTML "somenumber" 

for (i = 0; i < list.length; i++) {
    e = list[i];
    if (e.innerHTML.match(patt) && e.tagName == "A") {
        e.setAttribute("qs_scroll", "guide");
        pos = $("[qs_scroll |= 'guide']").offset().top;
        break;
    }
}

// Pushes page number elements to PAGES
for (i = 0; i < list.length; i++) {
    e = list[i];
    e.setAttribute("qs_scroll", "ref" + i);
    if (e.innerHTML.match(patt) && pos == $("[qs_scroll |= 'ref" + i + "']").offset().top) {
        pages.push(list[i]);
    }
}

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
    for (i = 0; i < pages.length; i++) {
        if (attr(pages[i]) == u_attr) {
            if (next != "Right") {
                if (i - 1 > 0) {
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

function next_lr(direction) {
    for (var i = 0; i < attr_func_list.length; i++) {
        var next_el = get_next_page(attr_func_list[i], direction);
        if (next_el != null) {
            break;
        }
    }
    return next_el;
}