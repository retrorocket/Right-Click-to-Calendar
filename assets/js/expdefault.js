"use strict";

/**
 * デフォルトの判定メソッド
 * オプションで正規表現編集が指定されていない場合
 * もしくは、正規表現にマッチしなかった場合に使用される
 */
const expDefault = (stext) => {

    // 年月日の初期設定
    let d = new Date();

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

    let m = stext.match(/(\d{1,2})(\/|月)(\d{1,2})/); // 開始日付
    if (m) {
        smon = m[1];
        sday = m[3];
        matched = true;
    }

    let mm = stext.match(/(\d{2,4})(\/|年)(\d{1,2})(\/|月)(\d{1,2})/); // 年日付
    if (mm) {
        syear = parseInt(mm[1], 10);
        if (syear < 2000) {
            syear += 2000;
        }
        smon = mm[3];
        sday = mm[5];
        matched = true;
    }

    let em = stext.match(/(\d{1,2})(\/|月)[\s\S]*(\d{2,4}|)(\/|年|)(\d{2})(\/|月)(\d{1,2})[^\/]/); // 終了日付
    let emm = stext.match(/(\d{1,2})(\/|月)[\s\S]*(\d{2,4}|)(\/|年|)(\d{1})(\/|月)(\d{1,2})[^\/]/); // 終了日付
    if (em) {
        eyear = em[3] || syear;
        emon = em[5];
        eday = em[7];
        matched = true;
    } else if (emm) {
        eyear = emm[3] || syear;
        emon = emm[5];
        eday = emm[7];
        matched = true;
    } else {
        eyear = syear;
        emon = smon;
        eday = sday;
    }
    eyear = parseInt(eyear, 10);
    if (eyear < 2000) {
        eyear += 2000;
    }

    let rr = stext.match(/(\d{1,2})(:|時)(\d{1,2}|)/); // 開始時刻
    if (rr) {
        shour = rr[1];
        smin = rr[3] || 0;
        matched = true;
    }

    let er = stext.match(/(\d{1,2})(:|時)[\s\S]*(\d{2})(:|時)(\d{1,2}|)/); // 終了時刻
    let err = stext.match(/(\d{1,2})(:|時)[\s\S]*(\d{1})(:|時)(\d{1,2}|)/); // 終了時刻
    if (er) {
        ehour = er[3];
        emin = er[5] || 0;
        matched = true;
    } else if (err) {
        ehour = err[3];
        emin = err[5] || 0;
        matched = true;
    } else {
        ehour = shour;
        emin = smin;
    }

    let t = stext.match(/(\n|\s)(\D{1,2}\S+)(\n|$)/); //タイトル
    if (t && matched) {
        title = t[2];
    }

    let location = "";
    let l = stext.match(/場所(\S?\n|\S?|\s?)(\S+)($|\n)/); //場所
    if (l) {
        location = l[2];
    }

    smon = ((parseInt(smon, 10) - 1) > -1) ? (parseInt(smon, 10) - 1) : smon;
    emon = ((parseInt(emon, 10) - 1) > -1) ? (parseInt(emon, 10) - 1) : emon;
    let args = {
        "start": {
            "year": syear,
            "month": smon,
            "day": sday,
            "hour": shour,
            "min": smin,
        },
        "end": {
            "year": eyear,
            "month": emon,
            "day": eday,
            "hour": ehour,
            "min": emin,
        },
        "title": title,
        "detail": "",
        "location": location,
        "selected_text": stext
    };

    return args;
};