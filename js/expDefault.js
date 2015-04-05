function expDefault(stext) {
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

	args = {
		"start":{"year":syear, "month":mon, "day":day,
		 "hour":shour, "min":smin},
		"end":{"year":syear, "month":mon, "day":day,
		"hour":shour, "min":smin},
		"title":title,
		"detail":"",
		"selected_text":stext
	};

	return args;
}
