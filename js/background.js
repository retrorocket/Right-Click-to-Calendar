//イベントウィンドウに引き渡す値
var args = null;

//content scriptと通信して選択したテキストを取得
var res = function (response) {
    //var stext = info.selectionText; //現在選択しているテキスト
    var stext = response.stext; //改行も含めたテキスト
    stext = stext.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { //全角英数を半角に変換
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });

    if (localStorage["expSwitch"]) {
        args = expDate(stext);
    }
    if (!args) {
        args = expDefault(stext);
    }

    //デフォルトはポップアップにしておく。
    var window_type = localStorage["window_type"] || "popup";
    //イベント設定ウィンドウを呼び出す
    chrome.windows.create({
        "url": "setEvent.html",
        "width": 580,
        "height": 810,
        "type": window_type
    });
};

function getClickHandler() {
    return function (info, tab) {
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
            message: "hello"
        }, res);
    }
}
//コンテキストメニューに登録
var parentId = chrome.contextMenus.create({
    "title": "選択したテキストをカレンダーに投稿",
    "type": "normal",
    "contexts": ["selection"], //テキストを選択した時のみ
    "onclick": getClickHandler()
});