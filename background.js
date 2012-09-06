//コンテキストメニューに登録
var parentId = chrome.contextMenus.create({
	"title" : "カレンダーに投稿",
	"type" : "normal",
	"contexts" : ["selection"],//テキストを選択した時のみ
	"onclick" : getClickHandler()
});

var oauth = ChromeExOAuth.initBackgroundPage({//OAuth設定
	"request_url": "https://www.google.com/accounts/OAuthGetRequestToken",
	"authorize_url": "https://www.google.com/accounts/OAuthAuthorizeToken",
	"access_url": "https://www.google.com/accounts/OAuthGetAccessToken",
	"consumer_key": "anonymous",
	"consumer_secret": "anonymous",
	"scope": "https://www.google.com/calendar/feeds/"
});

//↓できればよかったけどめんどくさい
//CalendarIDをすべて取得→ユーザーに選択させる

function getClickHandler() {
	return function(info, tab) {

		//ID登録させる
		if (localStorage["calenId"] == "" || localStorage["calenId"] == null ||localStorage["calenId"] == undefined){
			alert ("オプションでカレンダーIDを設定してください");
			return false;
		}
		var stext=info.selectionText; //現在選択しているテキスト
		stext = stext.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {//全角英数を半角に変換
			return String.fromCharCode(s.charCodeAt(0) - 65248);
		});

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

		/*var tt = stext.match(/^(.+)(\d+| |\n)/);//タイトル
		  if(tt){
		  title = tt[1];console.log("bbb");

		  }*/

		/*****************************************************/

		var args = new Array(title, mon, day, shour, smin, stext, syear);

		//イベント設定ウィンドウを呼び出す
		var returnValue = window.showModalDialog("setEvent.html", args, "dialogHeight:550;dialogWidth:500;status:no;");

		//設定終了後にイベント登録
		if(returnValue != false){
			//console.log(returnValue);
			oauth.authorize(function(){

				/**開始～終了日時設定**/

				var st ="";//開始日時
				var en ="";//終了日時

				if(returnValue["check"]){//終日設定
					st = returnValue["f_mon"];
					en = returnValue["e_mon"];
				}
				else {
					st = returnValue["f_mon"] + "T" + returnValue["f_hour"] + ":" + returnValue["f_min"] + ":00.000+09:00";
					en = returnValue["e_mon"] + "T" + returnValue["e_hour"] + ":" + returnValue["e_min"] + ":00.000+09:00";
				}
			/**設定終わり**/

			var body = JSON.stringify({

				"data": {
					"title": returnValue["title"],
					"details": returnValue["detail"],
				"transparency": "opaque",
				"status": "confirmed",
				//"location": "場所",
				"when": [
			{
				"start": st,
				"end": en
			}
			]
				}
			});

			oauth.sendSignedRequest(

					//オプションで登録したID
					"https://www.google.com/calendar/feeds/" +  localStorage.getItem( "calenId" ) + "/private/full",

					function(response){
						try{
							var p_res = JSON.parse(response);
							if(p_res.error){//エラー処理
								var err = p_res.error;
								alert("Error:" + err.message);
							}else{
								alert("【" + returnValue["title"] + "】" + "を登録しました");
							}
						} catch(e) {
							alert("Error:" + response);
						}
					},

					{
						"method": "POST",
						"headers": {"Content-Type": "application/json"},
						"body" : body

					});
			});

		}

	}

}

