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
        }
      } else {
        selectedText = document.getSelection().toString();
      }
      chrome.storage.local.get("selectionText", result => {
        selectedText = selectedText || result.selectionText;
        // 全角英数を半角英数に変換
        selectedText = selectedText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
          return String.fromCharCode(s.charCodeAt(0) - 65248);
        });
        sendResponse({ message: selectedText });
        chrome.storage.local.remove("selectionText");
      });
    }
    return true;
  }
);

/**
 * launchWebAuthFlowなしでOAuth 2.0 フローを実行してトークンを取得する
 */
const getTokenForChromium = () => {
  const responseUrl = document.location.href;
  // DNSエラーの出ないダミーページをコールバックしてトークンを取得する
  if (responseUrl.startsWith("https://rcapi.retrorocket.biz/oauth2")) {
    const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));
    chrome.storage.local.get("state", result => {
      chrome.storage.local.remove("state");
      if (params.get("state") === result.state && params.get("access_token")) {
        chrome.storage.local.set({ "accessToken": params.get("access_token") }, () => {
          alert("アクセストークンを取得しました。このウィンドウを手動で閉じてください。\n\nオプションページからトークンを取得した場合：\nウィンドウを閉じたあと、オプションページをリロードしてください。\n\nイベント設定ウィンドウに登録対象のカレンダーが表示されていない場合：\nウィンドウを閉じたあと、イベント設定ウィンドウ内の「再取得」ボタンをクリックしてください。クリック後予定が登録できるようになります。");
        });
      } else {
        alert("アクセストークンを取得できませんでした。このウィンドウを閉じてオプションページから再度登録を行ってください。");
      }
    });
  }
};

getTokenForChromium();
