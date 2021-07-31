"use strict";

/**
 * コンテキストメニュー押下時のアクション
 */
const getClickHandler = (info, tab) => {

  chrome.storage.local.get("calenId", result => {

    if (!result.calenId) {
      chrome.tabs.create({
        "url": "options.html?alert=true"
      });
      return;
    }

    // イベント登録ページの生成
    chrome.storage.local.set({ "selectionText": info.selectionText }, () => {
      chrome.windows.create({
        "url": "setevent.html?id=" + tab.id,
        "width": 530,
        "height": 700,
        "type": "popup"
      });
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
