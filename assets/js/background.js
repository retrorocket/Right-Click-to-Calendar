"use strict";

// イベントウィンドウに引き渡す値
let args = null;

/** argsをイベント設定ページに送信する */
// const, letはwindowから取得できないためvarで定義する
var getArgs = () => {
    return args;
}

/**  content scriptと通信して選択したテキストを取得 */
const res = (response) => {
    //let stext = info.selectionText; //現在選択しているテキスト
    let stext = response.stext; //改行も含めたテキスト
    stext = stext.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => { //全角英数を半角に変換
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });

    if (localStorage["expSwitch"]) {
        args = expDate(stext);
    }
    if (!args) {
        args = expDefault(stext);
    }

    //イベント設定ウィンドウを呼び出す
    chrome.windows.create({
        "url": "setevent.html",
        "width": 530,
        "height": 700,
        "type": "popup"
    });
};

const getClickHandler = (info, tab) => {

    args = null;
    if (!localStorage["calenId"]) {
        alert("オプションページで認証を行ってください");
        chrome.tabs.create({
            "url": chrome.extension.getURL("options.html"),
        });
        return false;
    }
    // content scriptにメッセージを送る
    chrome.tabs.sendMessage(tab.id, {
        message: "textSelected",
        infoText: info.selectionText,
    }, response => {
        res(response)
    });
    return true;

};

/** コンテキストメニューに登録 */
let parentId = chrome.contextMenus.create({
    "title": "選択したテキストをカレンダーに投稿",
    "type": "normal",
    "contexts": ["selection"], //テキストを選択した時のみ
    "onclick": (info, tab) => {
        getClickHandler(info, tab)
    }
});