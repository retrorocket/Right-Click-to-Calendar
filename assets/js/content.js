"use strict";

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.message === "textSelected") {
            let selectedText = "";
            let tagName = (document.activeElement.tagName).toUpperCase();
            if (tagName === "IFRAME" || tagName === "FRAME") {
                try {
                    selectedText = document.activeElement.contentWindow.getSelection().toString();
                } catch (ignore) {
                    // console.log(ignore.message);
                }
            } else {
                selectedText = document.getSelection().toString();
            }
            selectedText = selectedText || request.infoText;
            sendResponse({
                stext: selectedText,
            });
        }
    }
);