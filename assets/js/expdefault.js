"use strict";

/** オプションで正規表現編集が指定されていない場合、もしくは、正規表現にマッチしなかった場合に使用される、デフォルトの判定メソッド */
const expDefault = (stext) => {
    // 年月日・曜日・時分秒の取得
    let d = new Date();

    /** 正規表現で日付処理（てきとうすぎて使えない．関数を作ってそこで処理すべき） **/
    let mon = d.getMonth() + 1;
    let day = d.getDate();
    let syear = d.getFullYear();

    let shour = d.getHours();
    let smin = d.getMinutes();

    let title = stext;

    let matched = false;

    let m = stext.match(/(\d{1,2})(\/|月)(\d{1,2})/); //日付
    if (m) {
        mon = m[1];
        day = m[3];
        matched = true;
    }

    let mm = stext.match(/(\d{2,4})(\/|年)(\d{1,2})(\/|月)(\d{1,2})/); //日付
    if (mm) {
        syear = parseInt(mm[1]);
        if (syear < 2000) {
            syear += 2000;
        }
        mon = mm[3];
        day = mm[5];
        matched = true;
    }

    let rr = stext.match(/(\d{1,2})(:|時)/); //開始時刻
    if (rr) {
        shour = rr[1];
        smin = 0;
        matched = true;
    }

    let r = stext.match(/(\d{1,2})(:|時)(\d{1,2})/); //開始時刻
    if (r) {
        shour = r[1];
        smin = r[3];
        matched = true;
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

    mon = ((parseInt(mon) - 1) > -1) ? (parseInt(mon) - 1) : mon;
    let args = {
        "start": {
            "year": syear,
            "month": mon,
            "day": day,
            "hour": shour,
            "min": smin,
        },
        "end": {
            "year": syear,
            "month": mon,
            "day": day,
            "hour": shour,
            "min": smin,
        },
        "title": title,
        "detail": "",
        "location": location,
        "selected_text": stext
    };

    return args;
};