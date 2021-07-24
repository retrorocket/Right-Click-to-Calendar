"use strict";

let selectedText = "";
const getStorage = (key = null) => new Promise(resolve => {
  chrome.storage.local.get(key, (data) => { resolve(data) });
});

/**
 * イベントページと登録ウインドウからのメッセージを受け取る
 */
chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    //// イベント登録ウインドウに選択中のテキストを返却する ////
    if (request.message === "eventpageLoaded") {
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
      const selectionText = await getStorage("selectionText");
      selectedText = selectedText || selectionText.selectionText;
      // 全角英数を半角英数に変換
      selectedText = selectedText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      });
      chrome.runtime.sendMessage({ type: "response", message: selectedText });
    }
    return true;
  }
);
