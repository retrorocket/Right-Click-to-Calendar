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
export const expDate = (selectedText) => {
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
  const syear = parseInt(checkDates("start_year", max, match_arr), 10) || d.getFullYear();
  const smon = parseInt(checkDates("start_mon", max, match_arr), 10) || d.getMonth() + 1;
  const sday = parseInt(checkDates("start_day", max, match_arr), 10) || d.getDate();
  const shour = parseInt(checkDates("start_hour", max, match_arr), 10) || d.getHours();
  const smin = parseInt(checkDates("start_min", max, match_arr), 10) || d.getMinutes();

  // end
  const eyear = parseInt(checkDates("end_year", max, match_arr), 10) || d.getFullYear();
  const emon = parseInt(checkDates("end_mon", max, match_arr), 10) || d.getMonth() + 1;
  const eday = parseInt(checkDates("end_day", max, match_arr), 10) || d.getDate();
  const ehour = parseInt(checkDates("end_hour", max, match_arr), 10) || d.getHours();
  const emin = parseInt(checkDates("end_min", max, match_arr), 10) || d.getMinutes();

  // title
  const title = checkDates("title", max, match_arr) || base_str;

  // detail
  const detail = checkDates("detail", max, match_arr) || "";

  // location
  const location = checkDates("location", max, match_arr) || "";

  const args = {
    "start": {
      "year": syear,
      "month": smon,
      "day": sday,
      "hour": shour,
      "min": smin
    },
    "end": {
      "year": eyear,
      "month": emon,
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
