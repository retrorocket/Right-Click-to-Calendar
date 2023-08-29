/**
 * デフォルトの判定メソッド
 * オプションで正規表現編集が指定されていない場合
 * もしくは、正規表現にマッチしなかった場合に使用される
 */
export const expDefault = (stext) => {
  // 年月日の初期設定
  const d = new Date();

  let smon = d.getMonth() + 1;
  let sday = d.getDate();
  let syear = d.getFullYear();

  let emon = d.getMonth() + 1;
  let eday = d.getDate();
  let eyear = d.getFullYear();

  let shour = d.getHours();
  let smin = d.getMinutes();

  let ehour = d.getHours();
  let emin = d.getMinutes();

  let title = stext;

  let matched = false;
  let stf = false;
  let etf = false;

  const detail = localStorage.getItem("detailSwitch") ? stext : "";

  // 開始年日付
  const mm = stext.match(/(\d{2,4})(\/|年|\.|-)(\d{1,2})(\/|月|\.|-)(\d{1,2})/);
  if (mm) {
    syear = parseInt(mm[1], 10);
    if (syear < 100) {
      syear += 2000;
    }
    smon = mm[3];
    sday = mm[5];
    matched = true;
  } else {
    // 開始日付
    const m = stext.match(/(\d{1,2})(\/|月|\.|-)(\d{1,2})/);
    if (m) {
      smon = m[1];
      sday = m[3];
      matched = true;
    }
  }

  // 開始時刻
  const rr = stext.match(/(\d{1,2})(:|時)(\d{1,2}|)/);
  if (rr) {
    shour = parseInt(rr[1], 10);
    const checkPm = stext.match(/(午前|AM|午後|PM)/);
    if (checkPm && (checkPm[0] === "午後" || checkPm[0] === "PM")) {
      if (shour < 12) {
        shour += 12;
      }
    } else if (shour >= 24) {
      shour -= 24;
      stf = true;
    }
    smin = rr[3] || 0;
    matched = true;
  }

  // 終了年日付
  const em = stext.match(
    /\d{1,2}(\/|月|\.|-)\d{1,2}(?!\/|\d)[\s\S]*(\d{2,4})(\/|年|\.|-)(\d{1,2})(\/|月|\.|-)(\d{1,2})(?!\/|\d)/
  );
  if (em) {
    eyear = em[2];
    eyear = parseInt(eyear, 10);
    if (eyear < 100) {
      eyear += 2000;
    }
    emon = em[4];
    eday = em[6];
    matched = true;
  } else {
    const emm =
      stext.match(
        /\d{1,2}(\/|月|\.|-)\d{1,2}(?!\/|\d)[\s\S]*(\d{2})(\/|月|\.|-)(\d{1,2})(?!\/|\d)/
      ) ||
      stext.match(
        /\d{1,2}(\/|月|\.|-)\d{1,2}(?!\/|\d)[\s\S]*(\d{1})(\/|月|\.|-)(\d{1,2})(?!\/|\d)/
      );
    if (emm) {
      emon = emm[2];
      eday = emm[4];
      matched = true;
    } else {
      eyear = syear;
      emon = smon;
      eday = sday;
      etf = stf;
    }
  }

  // 終了時刻
  const er =
    stext.match(/\d{1,2}(:|時)([\s\S]*)(\d{2})(:|時)(\d{1,2}|)/) ||
    stext.match(/\d{1,2}(:|時)([\s\S]*)(\d{1})(:|時)(\d{1,2}|)/);
  if (er) {
    ehour = parseInt(er[3], 10);
    if (er[2].match(/(午後|PM)/)) {
      if (ehour < 12) {
        ehour += 12;
      }
    } else if (ehour >= 24) {
      ehour -= 24;
      etf = true;
    }
    emin = er[5] || 0;
    matched = true;
  } else {
    ehour = shour;
    emin = smin;
  }

  // 英語月を数字に変換する
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthsPattern =
    "(?<mon>Jan(?:uary){0,1}|Feb(?:ruary){0,1}|Mar(?:ch){0,1}|Apr(?:il){0,1}|May|Jun(?:e){0,1}|Jul(?:y){0,1}|Aug(?:ust){0,1}|Sep(?:tember){0,1}|Oct(?:ober){0,1}|Nov(?:ember){0,1}|Dec(?:ember){0,1})";
  let enMatch = [
    ...stext.matchAll(
      new RegExp(
        String.raw`\b${monthsPattern}\.? (?<day>\d{1,2})(?:[a-z]{2}){0,1}\b(?:,? ?(?<year>\d{4}))?`,
        "ig"
      )
    ),
  ].map((match) => match.groups);
  if (enMatch.length < 1) {
    enMatch = [
      ...stext.matchAll(
        new RegExp(
          String.raw`\b(?<day>\d{1,2})(?:[a-z]{2}){0,1} ${monthsPattern}\.?(?:,? ?(?<year>\d{4}))?`,
          "ig"
        )
      ),
    ].map((match) => match.groups);
  }
  if (enMatch.length > 0) {
    const em0 = enMatch[0];
    smon = em0.mon
      ? months.indexOf(em0.mon.substring(0, 3).toLowerCase()) + 1
      : smon;
    sday = em0.day ? em0.day : sday;
    syear = em0.year ? em0.year : syear;
    if (enMatch.length > 1) {
      const em1 = enMatch[1];
      emon = em1.mon
        ? months.indexOf(em1.mon.substring(0, 3).toLowerCase()) + 1
        : emon;
      eday = em1.day ? em1.day : eday;
      eyear = em1.year ? em1.year : eyear;
    }
  }

  // タイトル
  const t = stext.match(/(\n|\s)(\D{1,2}\S+)(\n|$)/);
  if (t && matched) {
    title = t[2];
  }

  // 場所
  const l = stext.match(/場所(\S?\n|\S?|\s?)(\S+)($|\n)/);
  const location = l ? l[2] : "";

  const args = {
    start: {
      year: syear,
      month: smon,
      day: sday,
      hour: shour,
      min: smin,
      tf: stf,
    },
    end: {
      year: eyear,
      month: emon,
      day: eday,
      hour: ehour,
      min: emin,
      tf: etf,
    },
    title: title,
    detail: detail,
    location: location,
    selected_text: stext,
  };

  return args;
};
