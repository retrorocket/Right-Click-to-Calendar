"use strict";

let selectedText = "";

/**
 * イベントページと登録ウインドウからのメッセージを受け取る
 */
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    //// 選択中のテキストを取得する ////
    if (request.message === "textSelected") {
      selectedText = "";
      const tagName = (document.activeElement.tagName).toUpperCase();
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
      // 全角英数を半角英数に変換
      selectedText = selectedText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      });
      sendResponse({
        message: "return",
      });

      //// イベント登録ウインドウに選択中のテキストを返却する ////
    } else if (request.message === "eventpageLoaded") {
      sendResponse({
        message: selectedText,
      });
    }
  }
);
