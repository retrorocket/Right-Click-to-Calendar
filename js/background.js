//コンテキストメニューに登録
var parentId = chrome.contextMenus.create({
	"title" : "選択したテキストをカレンダーに投稿",
	"type" : "normal",
	"contexts" : ["selection"],//テキストを選択した時のみ
	"onclick" : getClickHandler()
});

//イベントウィンドウに引き渡す値
var args;

function getClickHandler() {
	return function(info, tab) {

		if(!localStorage["calenId"])
		{
			alert ("オプションページで認証を行ってください");
			chrome.tabs.create({
  			  "url": chrome.extension.getURL("options.html"),
			});
			return false;
		}

		var stext=info.selectionText; //現在選択しているテキスト
		stext = stext.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {//全角英数を半角に変換
			return String.fromCharCode(s.charCodeAt(0) - 65248);
		});

		if(localStorage["expSwitch"]) {
			args = expDate(stext);
			if(args) { // 正規表現に合致した場合のみ
				chrome.windows.create({"url":"setEvent.html", "width":580, "height":810, "type": "panel"});
				return;
			}
		}

		// 年月日・曜日・時分秒の取得
		var d = new Date();	

		/**正規表現で日付処理（てきとうすぎて使えない．関数を作ってそこで処理すべき）**/
		var mon = d.getMonth() + 1;
		var day =  d.getDate();
		var syear =  d.getFullYear();

		var shour = d.getHours();
		var smin = d.getMinutes();

		var title = stext;

		var m = stext.match(/(\d{1,2})(\/|月)(\d{1,2})/);//日付
		if(m){
			mon = m[1];
			day = m[3];
		}

		var rr = stext.match(/(\d{1,2})(:|時)/);//開始時刻
		if(rr){
			shour = rr[1];
			smin = 0;
		}

		var r = stext.match(/(\d{1,2})(:|時)(\d{1,2})/);//開始時刻
		if(r){
			shour = r[1];
			smin = r[3];
		}

		var t = stext.match(/(\d+| |\n)(\S+)$/);//タイトル
		if(t){
			title = t[2];
		}

		args = new Array(title, mon, day, shour, smin, stext, syear);
		//イベント設定ウィンドウを呼び出す
		chrome.windows.create({"url":"setEvent.html", "width":580, "height":810, "type": "panel"});
	}
}

