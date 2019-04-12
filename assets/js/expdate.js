"use strict";

/** 正規表現で値を抜き出す */
const checkDates = (key, max, match_arr) => {
    if (localStorage[key]) {
        var int_key = parseInt(localStorage[key]);
        if (int_key >= 0 && int_key <= max) {
            return match_arr[int_key];
        }
    }
    return null;
};

/** オプションで正規表現編集が指定されている場合に使用されるメソッド */
const expDate = (selectedText) => {
    let base_str = selectedText; // 検索対象となる文字列
    let exp_str = localStorage["exp_str"];
    let regexp = new RegExp(exp_str);
    let match_arr = base_str.match(regexp);

    if (!match_arr) {
        return null;
    }
    let max = match_arr.length;

    // 年月日・曜日・時分秒の取得
    let d = new Date();

    /**正規表現で日付処理**/
    /** setting **/
    // start
    let syear = checkDates("start_year", max, match_arr) || d.getFullYear();
    let smon = checkDates("start_mon", max, match_arr) || d.getMonth() + 1;
    let sday = checkDates("start_day", max, match_arr) || d.getDate();
    let shour = checkDates("start_hour", max, match_arr) || d.getHours();
    let smin = checkDates("start_min", max, match_arr) || d.getMinutes();

    // end
    let eyear = checkDates("end_year", max, match_arr) || d.getFullYear();
    let emon = checkDates("end_mon", max, match_arr) || d.getMonth() + 1;
    let eday = checkDates("end_day", max, match_arr) || d.getDate();
    let ehour = checkDates("end_hour", max, match_arr) || d.getHours();
    let emin = checkDates("end_min", max, match_arr) || d.getMinutes();

    // title
    let title = checkDates("title", max, match_arr) || base_str;

    // detail
    let detail = checkDates("detail", max, match_arr) || "";

    // location
    let location = checkDates("location", max, match_arr) || "";

    let args = {
        "start": {
            "year": syear,
            "month": ((parseInt(smon) - 1) > -1) ? (parseInt(smon) - 1) : smon,
            "day": sday,
            "hour": shour,
            "min": smin
        },
        "end": {
            "year": eyear,
            "month": ((parseInt(emon) - 1) > -1) ? (parseInt(emon) - 1) : emon,
            "day": eday,
            "hour": ehour,
            "min": emin
        },
        "title": title,
        "detail": detail,
        "selected_text": base_str,
        "location": location
    };

    return args;
};
