"use strict";

/**
 * コンテキストメニュー押下時のアクション
 */
const getClickHandler = (info, tab) => {

  if (!localStorage["calenId"]) {
    alert("オプションページで認証を行ってください");
    chrome.tabs.create({
      "url": chrome.extension.getURL("options.html"),
    });
    return;
  }
  // content scriptで選択中のテキストを取得する
  chrome.tabs.sendMessage(tab.id, {
    message: "textSelected",
    infoText: info.selectionText,

  }, response => {
    // イベント登録ページの生成
    chrome.windows.create({
      "url": "setevent.html?id=" + tab.id,
      "width": 530,
      "height": 700,
      "type": "popup"
    });
  });
};

/**
 * コンテキストメニューに登録
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    "title": "選択したテキストをカレンダーに投稿",
    "type": "normal",
    "id": "createEvent",
    "contexts": ["selection"], //テキストを選択した時のみ
  })
});

/**
 * コンテキストメニュー押下時のアクションを登録
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  getClickHandler(info, tab)
});