function expDate(selectedText) {
	var base_str = selectedText; // 検索対象となる文字列
	var exp_str = localStorage["exp_str"];
	var regexp = new RegExp(exp_str);
	var match_arr = base_str.match(regexp);

	if(!match_arr){
		return null;
	}
	var max = match_arr.length;

	// 年月日・曜日・時分秒の取得
	var d = new Date();	

	/**正規表現で日付処理**/
	/** setting **/
	// start
	var syear = checkDates("start_year", max, match_arr) || d.getFullYear();
	var smon = checkDates("start_mon", max, match_arr) || d.getMonth() + 1;
	var sday = checkDates("start_day", max, match_arr) || d.getDate();
	var shour = checkDates("start_hour", max, match_arr) || d.getHours();
	var smin = checkDates("start_min", max, match_arr) || d.getMinutes();

	// end
	var eyear = checkDates("end_year", max, match_arr) || d.getFullYear();
	var emon = checkDates("end_mon", max, match_arr) || d.getMonth() + 1;
	var eday = checkDates("end_day", max, match_arr) || d.getDate();
	var ehour = checkDates("end_hour", max, match_arr) || d.getHours();
	var emin = checkDates("end_min", max, match_arr) || d.getMinutes();

	// title
	var title = checkDates("title", max, match_arr) || base_str;

	//detail
	var detail = checkDates("detail", max, match_arr) || "";

	var args = {
		"start":{"year":syear, "month":smon, "day":sday,
			 "hour":shour, "min":smin},
		"end":{"year":eyear, "month":emon, "day":eday,
			 "hour":ehour, "min":emin},
		"title":title,
		"detail":detail,
		"selected_text":base_str
	};

	return args;
}

function checkDates(key, max, match_arr){
	if(localStorage[key]){
		var int_key = parseInt(localStorage[key]);
		if(int_key >= 0 && int_key <= max) {
			return match_arr[int_key];
		}
	}
	return null;
}