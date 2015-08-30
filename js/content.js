chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        sendResponse({stext: window.getSelection().toString()});
    }
);
