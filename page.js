function send() {
    if (detect()) {
        console.log("shopping-page")
        chrome.runtime.sendMessage({message: "shoptime"}, function(response) {
            console.log("sent")
        });
    }
    else {
        console.log("not-shopping-page")
        chrome.runtime.sendMessage({message: "notshoptime"}, function(response) {
            console.log("sent")
        });
    }
}
$(window).on("load", send)

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("off-received")
        if (request.message == "shutoff") {
            console.log("shutoff_req")
            $(window).off("load")
            console.log("off")
        }
    });