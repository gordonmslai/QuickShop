function detect() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "detect"}, function(response) {
            console.log("detect-sent");
        });
    });
}

function reset() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "reset"}, function(response) {
            console.log("reset-sent");
        });
    });
    detect();
}

// chrome.tabs.onCreated.addListener(function() {
//     console.log("tabcreated")
//     detect()});
chrome.tabs.onActivated.addListener(function() {
    console.log("tabactivated")
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "activate"}, function(response) {
            console.log("activate-sent");
        });
    });
    detect()});

var auto_on = false;

chrome.tabs.onUpdated.addListener(function() {
    console.log("tabupdated")
    console.log(auto_on)
    if (auto_on) {
        reset();
    }
    else {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "checkon"}, function(response) {
                console.log("checkon-sent");
            });
        });
    }
    });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "shoptime") {
            auto_on = true;
            console.log("detected_shopping")
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log("show-icon")
                chrome.browserAction.setIcon({tabId: tabs[0].id, path: "icon38_g.png"});
                });
        }
        else if (request.message == "not-shoptime") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log("hide-icon")
                chrome.browserAction.setIcon({tabId: tabs[0].id, path: "icon38_b.png"});
                });
        }
        else if (request.message == "nowant") {
            auto_on = false;
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log("black-icon")
                chrome.browserAction.setIcon({tabId: tabs[0].id, path: "icon38.png"});
                });
        }

        else if (request.message == "reload") {
            reset();
        }

        else if (request.message == "loading") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log("load-icon")
                chrome.browserAction.setIcon({tabId: tabs[0].id, path: "icon38_l.png"});
                });
        }
    });

chrome.browserAction.onClicked.addListener(function(tab) {
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "toggle"}, function(response) {
                console.log("toggle-sent");
            });
    });
});