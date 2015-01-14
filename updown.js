var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);

function height(element) {
    return window.getComputedStyle(element).height.slice(0, -2);
}

function width(element) {
    return window.getComputedStyle(element).width.slice(0, -2);
}

function size(e) {
    return height(e) * width(e);
}

function simsize(a, b) {
    return size(a) > size(b) * 2 || size(a) < size(b) * 0.5;
}

var locations = [];

// Return true if thinks current page is catalog-type and appends row offsets to LOCATIONS
function detect() {
    var imgs = document.getElementsByTagName("IMG");
    var dict = {}
    var dict2 = {}
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].setAttribute("qs_updown", "ref" + i);
        var pos = $("[qs_updown |= 'ref" + i + "']").offset().top + height(imgs[i])/2;
        for (var key in dict) {
            if (pos < parseInt(key) + height(imgs[i])/8 &&
                pos > parseInt(key) - height(imgs[i])/8) {
                pos = key;
                if (simsize(dict[key][0], imgs[i])) {
                    pos += 1;
                    continue;
                }
                break;
            }
        }
        if (dict[pos] == null) {
            dict[pos] = [imgs[i]];
        }
        else {
            dict[pos].push(imgs[i]);
        }
    }
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].setAttribute("qs_updown2", "ref" + i);
        var pos = $("[qs_updown2 |= 'ref" + i + "']").offset().left + width(imgs[i])/2;
        for (var key in dict2) {
            if (pos < parseInt(key) + height(imgs[i])/8 &&
                pos > parseInt(key) - height(imgs[i])/8) {
                pos = key;
                if (simsize(dict2[key][0], imgs[i])) {
                    pos += 1;
                    continue;
                }
                break;
            }
        }
        if (dict2[pos] == null) {
            dict2[pos] = [imgs[i]];
        }
        else {
            dict2[pos].push(imgs[i]);
        }

    }
    var maxoccur_dict = [0, 0];
    for (var key in dict) {
        var count = 0;
        var len = dict[key].length;
        if (len == 1) {
            continue;
        }
        for (var key2 in dict) {
            if (dict[key2].length == len) {
                count += 1;
            }
        }
        if (count > maxoccur_dict[1]) {
            maxoccur_dict[1] = count;
            maxoccur_dict[0] = len;
        }
    }

    var max_dict2 = 0;
    for (var key in dict2) {
        var len = dict2[key].length;
        var count = 0;
        if (len == 1) {
            continue;
        }
        for (var key in dict2) {
            var len2 = dict2[key].length;
            if ((len < len2 * 1.15 && len > len2 * 0.85) ||
                len < len2 + 1 && len > len2 - 1) {
                count += 1;
            }
        }
        if (count == maxoccur_dict[0]) {
            max_dict2 = count;
        }
    }

    // console.log([maxoccur_dict[0], max_dict2]);
    // console.log(dict);
    // console.log(dict2);

    if (maxoccur_dict[0] == max_dict2 && 
        maxoccur_dict[0] > 1 &&
        max_dict2 > 2) {
        for (var key in dict) {
            var e = dict[key];
            if (e.length == max_dict2) {
                locations.push($("[qs_updown |= '" + e[0].getAttribute("qs_updown") +"']").offset().top + height(e[0])/2);
            } 
        }
        return true;
    }
    return false;
}

function next_ud(direction) {
    var curr = window.pageYOffset;
    var next;
    for (var i = 0; i < locations.length; i++) {
        if (direction == "Down" && locations[i] > curr) {
            next = locations[i];
            break;
        }
        else if (locations[i] < curr) {
            next = locations[i];
            break;
    }
    return next;
}