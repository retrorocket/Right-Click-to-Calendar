"use strict";

/**
 * コンテキストメニュー押下時のアクション
 */
const getClickHandler = (info, tab) => {
  // イベント登録ページの生成
  chrome.storage.session.set({ "selectionText": info.selectionText }, () => {
    chrome.windows.create({
      "url": "setevent.html?id=" + tab.id,
      "width": 560,
      "height": 730,
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
