function expDate(selectedText) {
	var base_str = selectedText; // 検索対象となる文字列
	var exp_str = localStorage["exp_str"];
	var regexp = new RegExp(exp_str);
	var match_arr = base_str.match(regexp);

	if(!match_arr){
		return null;
	}

	// 年月日・曜日・時分秒の取得
	var d = new Date();	

	/**正規表現で日付処理**/
	var mon = d.getMonth() + 1;
	var day =  d.getDate();
	var syear =  d.getFullYear();

	var shour = d.getHours();
	var smin = d.getMinutes();

	var title = base_str;

	if(localStorage["start_year"]){
		var int_year = parseInt(localStorage["start_year"]);
		if(int_year <= match_arr.length) {
			syear = match_arr[int_year];
		}
	}
	if(localStorage["start_mon"]){
		var int_mon = parseInt(localStorage["start_mon"]);
		if(int_mon <= match_arr.length) {
			mon = match_arr[int_mon];
		}
	}
	if(localStorage["start_day"]){
		var int_day = parseInt(localStorage["start_day"]);
		if(int_day <= match_arr.length) {
			day = match_arr[int_day];
		}
	}
	if(localStorage["start_hour"]){
		var int_hour = parseInt(localStorage["start_hour"]);
		if(int_hour <= match_arr.length) {
			shour = match_arr[int_hour];
		}
	}
	if(localStorage["start_min"]){
		var int_min = parseInt(localStorage["start_min"]);
		if(int_min <= match_arr.length) {
			smin = match_arr[int_min];
		}
	}
	if(localStorage["title"]){
		var int_title = parseInt(localStorage["title"]);
		if(int_title <= match_arr.length) {
			title = match_arr[int_title];
		}
	}

	var args = new Array(title, mon, day, shour, smin, base_str, syear);

	return args;
}
