/**
 * オプションで設定された正規表現のグループ番号と合致した値を返却する
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

  // start
  const syear = parseInt(checkDates("start_year", max, match_arr), 10) || d.getFullYear();
  const smon = parseInt(checkDates("start_mon", max, match_arr), 10) || d.getMonth() + 1;
  const sday = parseInt(checkDates("start_day", max, match_arr), 10) || d.getDate();

  const start_hour = parseInt(checkDates("start_hour", max, match_arr), 10);
  const shour = start_hour >= 0 ? start_hour : d.getHours();

  const start_min = parseInt(checkDates("start_min", max, match_arr), 10);
  const smin = start_min >= 0 ? start_min : d.getMinutes();

  // end
  const eyear = parseInt(checkDates("end_year", max, match_arr), 10) || d.getFullYear();
  const emon = parseInt(checkDates("end_mon", max, match_arr), 10) || d.getMonth() + 1;
  const eday = parseInt(checkDates("end_day", max, match_arr), 10) || d.getDate();

  const end_hour = parseInt(checkDates("end_hour", max, match_arr), 10);
  const ehour = end_hour >= 0 ? end_hour : d.getHours();

  const end_min = parseInt(checkDates("end_min", max, match_arr), 10);
  const emin = end_min >= 0 ? end_min : d.getMinutes();

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
