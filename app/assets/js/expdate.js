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
export const expDate = (selectedText, selectedUrl) => {
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
  let defaultStartYear,
    defaultEndYear = d.getFullYear();
  let defaultStartMonth,
    defaultEndMonth = d.getMonth() + 1;
  let defaultStartDay,
    defaultEndDay = d.getDate();
  let defaultStartHour,
    defaultEndHour = d.getHours();
  let defaultStartMin,
    defaultEndMin = d.getMinutes();

  if (localStorage.getItem("defaultTimeSwitch")) {
    defaultStartYear =
      parseInt(localStorage["default_start_year"], 10) || defaultStartYear;
    defaultStartMonth =
      parseInt(localStorage["default_start_mon"], 10) || defaultStartMonth;
    defaultStartDay =
      parseInt(localStorage["default_start_day"], 10) || defaultStartDay;
    defaultStartHour =
      parseInt(localStorage["default_start_hour"], 10) || defaultStartHour;
    defaultStartMin =
      parseInt(localStorage["default_start_min"], 10) || defaultStartMin;

    defaultEndYear =
      parseInt(localStorage["default_end_year"], 10) || defaultEndYear;
    defaultEndMonth =
      parseInt(localStorage["default_end_mon"], 10) || defaultEndMonth;
    defaultEndDay =
      parseInt(localStorage["default_end_day"], 10) || defaultEndDay;
    defaultEndHour =
      parseInt(localStorage["default_end_hour"], 10) || defaultEndHour;
    defaultEndMin =
      parseInt(localStorage["default_end_min"], 10) || defaultEndMin;
  }

  // start
  const syear =
    parseInt(checkDates("start_year", max, match_arr), 10) || defaultStartYear;
  const smon =
    parseInt(checkDates("start_mon", max, match_arr), 10) || defaultStartMonth;
  const sday =
    parseInt(checkDates("start_day", max, match_arr), 10) || defaultStartDay;

  const start_hour = parseInt(checkDates("start_hour", max, match_arr), 10);
  const shour = start_hour >= 0 ? start_hour : defaultStartHour;

  const start_min = parseInt(checkDates("start_min", max, match_arr), 10);
  const smin = start_min >= 0 ? start_min : defaultStartMin;

  // end
  const eyear =
    parseInt(checkDates("end_year", max, match_arr), 10) || defaultEndYear;
  const emon =
    parseInt(checkDates("end_mon", max, match_arr), 10) || defaultEndMonth;
  const eday =
    parseInt(checkDates("end_day", max, match_arr), 10) || defaultEndDay;

  const end_hour = parseInt(checkDates("end_hour", max, match_arr), 10);
  const ehour = end_hour >= 0 ? end_hour : defaultEndHour;

  const end_min = parseInt(checkDates("end_min", max, match_arr), 10);
  const emin = end_min >= 0 ? end_min : defaultEndMin;

  // title
  const title = checkDates("title", max, match_arr) || base_str;

  // detail
  let tempdetail = localStorage.getItem("detailSwitch") ? selectedText : "";
  tempdetail = localStorage.getItem("taburlSwitch")
    ? selectedUrl + (tempdetail === "" ? "" : "\n") + tempdetail
    : tempdetail;
  const detail = checkDates("detail", max, match_arr) || tempdetail;

  // location
  const location = checkDates("location", max, match_arr) || "";

  const args = {
    start: {
      year: syear,
      month: smon,
      day: sday,
      hour: shour,
      min: smin,
    },
    end: {
      year: eyear,
      month: emon,
      day: eday,
      hour: ehour,
      min: emin,
    },
    title: title,
    detail: detail,
    selected_text: base_str,
    location: location,
  };

  return args;
};
