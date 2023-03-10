"use strict";

let selectedText = "";

/**
 * イベントページと登録ウインドウからのメッセージを受け取る
 */
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    //// イベント登録ウインドウに選択中のテキストを返却する ////
    if (request.message === "eventpageLoaded") {
      selectedText = "";
      const tagName = (document.activeElement.tagName).toUpperCase();
      if (tagName === "IFRAME" || tagName === "FRAME") {
        try {
          selectedText = document.activeElement.contentWindow.getSelection().toString();
        } catch (ignore) {
          //console.log(ignore);
        }
      } else {
        selectedText = document.getSelection().toString();
      }
      chrome.storage.session.get("selectionText", result => {
        selectedText = selectedText || result.selectionText;
        // 全角英数を半角英数に変換
        selectedText = selectedText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        });
        sendResponse({ message: selectedText });
        chrome.storage.session.remove("selectionText");
      });
    }
    return true;
  }
);
