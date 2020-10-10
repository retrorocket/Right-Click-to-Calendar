/**
 * 正規表現で値を抜き出す
 */
const checkDates = (key, max, match_arr) => {
  if (localStorage[key]) {
    const int_key = parseInt(localStorage[key], 10);
    if (int_key >= 0 && int_key <= max) {
      return match_arr[int_key];
    }
  }
  return null;
};

/**
 * オプションで正規表現編集が指定されている場合に使用されるメソッド
 */
export default (selectedText) => {
  const base_str = selectedText; // 検索対象となる文字列
  const exp_str = localStorage["exp_str"];
  const regexp = new RegExp(exp_str);
  const match_arr = base_str.match(regexp);

  if (!match_arr) {
    return null;
  }
  const max = match_arr.length;

  // 年月日・曜日・時分秒の取得
  const d = new Date();

  /** 正規表現で日付処理 **/
  /** setting **/
  // start
  const syear = checkDates("start_year", max, match_arr) || d.getFullYear();
  const smon = checkDates("start_mon", max, match_arr) || d.getMonth() + 1;
  const sday = checkDates("start_day", max, match_arr) || d.getDate();
  const shour = checkDates("start_hour", max, match_arr) || d.getHours();
  const smin = checkDates("start_min", max, match_arr) || d.getMinutes();

  // end
  const eyear = checkDates("end_year", max, match_arr) || d.getFullYear();
  const emon = checkDates("end_mon", max, match_arr) || d.getMonth() + 1;
  const eday = checkDates("end_day", max, match_arr) || d.getDate();
  const ehour = checkDates("end_hour", max, match_arr) || d.getHours();
  const emin = checkDates("end_min", max, match_arr) || d.getMinutes();

  // title
  const title = checkDates("title", max, match_arr) || base_str;

  // detail
  const detail = checkDates("detail", max, match_arr) || "";

  // location
  const location = checkDates("location", max, match_arr) || "";

  const args = {
    "start": {
      "year": syear,
      "month": ((parseInt(smon, 10) - 1) > -1) ? (parseInt(smon, 10) - 1) : smon,
      "day": sday,
      "hour": shour,
      "min": smin
    },
    "end": {
      "year": eyear,
      "month": ((parseInt(emon, 10) - 1) > -1) ? (parseInt(emon, 10) - 1) : emon,
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
}
