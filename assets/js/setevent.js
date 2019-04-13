"use strict";

const addEvent = (input) => {
    chrome.identity.getAuthToken({
            'interactive': true
        },
        accessToken => {
            /**開始～終了日時設定**/

            let from;
            let to;

            if (input.allday) { //終日設定
                from = {
                    "date": input.fromDate,
                };
                to = {
                    "date": input.toDate,
                };
            } else {
                const timezone = ":00.000+09:00";
                from = {
                    "dateTime": input.fromDate + "T" + input.fromTime + timezone,
                };
                to = {
                    "dateTime": input.toDate + "T" + input.toTime + timezone,
                };
            }

            /**設定終わり**/

            let body = JSON.stringify({
                "description": input.detail,
                "location": input.location,
                "summary": input.title,
                "transparency": "opaque",
                "status": "confirmed",
                "start": from,
                "end": to
            });

            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        Swal.fire({
                            title: "succeed!",
                            text: "【" + input.title + "】" + "を登録しました",
                            animation: false,
                            onClose: () => {
                                window.close();
                            }
                        });
                    } else if (xhr.status === 401) {
                        let data = JSON.parse(xhr.responseText);
                        chrome.identity.removeCachedAuthToken({
                                'token': accessToken
                            },
                            () => {
                                Swal.fire({
                                    title: "Invalid AccessToken",
                                    text: "無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message,
                                    animation: false
                                });
                            });
                        return;
                    } else {
                        let data = JSON.parse(xhr.responseText);
                        Swal.fire({
                            title: "error!",
                            text: data.error.code + " : " + data.error.message,
                            animation: false
                        });
                        return;
                    }
                }
            };
            xhr.open('POST',
                "https://www.googleapis.com/calendar/v3/calendars/" + input.calendar + "/events",
                true);

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.send(body);
        }
    );
};

const createAndAddEventInput = () => {

    let isValidRange = false;
    let fromDateVal = $("#from-date").val();
    let fromTimeVal = $("#from-time").val();
    let toDateVal = $("#to-date").val();
    let toTimeVal = $("#to-time").val();

    if ($('#allday').prop('checked')) {
        // 終日設定は最終日に24時間足さないと認識されない
        let toDate = moment(toDateVal);
        toDate.add(1, "days");
        toDateVal = toDate.format("YYYY-MM-DD");

        let fromDate = moment(fromDateVal);
        isValidRange = (toDate.diff(fromDate, "days") > 0);
    } else {
        let toDate = moment(toDateVal + " " + toTimeVal);
        let fromDate = moment(fromDateVal + " " + fromTimeVal);
        isValidRange = (toDate.diff(fromDate, "minutes") >= 0);
    }

    if (isValidRange) {
        let input = {
            title: $("#tit").val(),
            detail: $("#detail").val(),
            location: $("#location").val(),
            fromDate: fromDateVal,
            fromTime: fromTimeVal,
            toDate: toDateVal,
            toTime: toTimeVal,
            allday: $('#allday').prop('checked'),
            calendar: $("#selected-calendar").val()
        };

        //イベント投稿
        addEvent(input);
    } else {
        Swal.fire({
            title: "Invalid date",
            text: "日時が正しくありません",
            animation: false
        });
    }
};

const fetchCalendarId = (accessToken) => {

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                let list = data.items;
                for (let i = 0; i < list.length; i++) {
                    $("#selected-calendar").append($('<option>').html(list[i].summary).val(list[i].id));
                }

                $("#selected-calendar").val(localStorage["calenId"]);
            } else if (xhr.status === 401) {
                let data = JSON.parse(xhr.responseText);
                chrome.identity.removeCachedAuthToken({
                        'token': accessToken
                    },
                    () => {
                        Swal.fire({
                            title: "Invalid AccessToken",
                            text: "無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message,
                            animation: false,
                            onClose: () => {
                                window.close();
                            },
                        });
                    });
                return;
            } else {
                let data = JSON.parse(xhr.responseText);
                Swal.fire({
                    title: "Acquisition failure",
                    text: "リストの取得に失敗しました。ウインドウを閉じます",
                    animation: false,
                    onClose: () => {
                        window.close();
                    }
                });
                return;
            }
        }
    };
    xhr.open('GET',
        "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
        true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(null);

};

const setBgValToForm = () => {

    let bg = chrome.extension.getBackgroundPage();
    let bgArgs = bg.getArgs();

    // bgの中身はNumberとは限らないが、融通がきくのでmomentに処理させる
    let bgFromDate = moment({
        year: bgArgs.start.year,
        month: bgArgs.start.month,
        day: bgArgs.start.day,
    });

    let bgFromTime = moment({
        hour: bgArgs.start.hour,
        minute: bgArgs.start.min,
    });

    let bgToDate = moment({
        year: bgArgs.end.year,
        month: bgArgs.end.month,

        day: bgArgs.end.day,
    });

    let bgToTime = moment({
        hour: bgArgs.end.hour,
        minute: bgArgs.end.min,
    });

    if (bgFromDate.isValid()) {
        $("#from-date").val(bgFromDate.format("YYYY-MM-DD"));
    }
    if (bgFromTime.isValid()) {
        $("#from-time").val(bgFromTime.format("HH:mm"));
    }
    if (bgToDate.isValid()) {
        $("#to-date").val(bgToDate.format("YYYY-MM-DD"));
    }
    if (bgToTime.isValid()) {
        $("#to-time").val(bgToTime.format("HH:mm"));
    }

    $("#tit").val(bgArgs.title);
    $("#main-text").val(bgArgs.selected_text);
    $("#detail").val(bgArgs.detail);
    $("#location").val(bgArgs.location);
};

$(function () {
    // カレンダーIDのセット
    chrome.identity.getAuthToken({
            'interactive': true
        },
        accessToken => {
            fetchCalendarId(accessToken)
        }
    );

    /// フォームに正規表現で取得した結果をセット
    setBgValToForm();

    // イベント投稿
    $("#sub").on("click", () => {
        createAndAddEventInput()
    });

    // 終日設定
    $("#allday").on("click",
        event => {
            if ($(event.currentTarget).prop('checked')) {
                $('input[type="time"]').prop("disabled", true);
            } else {
                $('input[type="time"]').prop("disabled", false);
            }
        });

    // カレンダー表示
    $("#create-cal").on("click",
        () => {
            chrome.windows.create({
                "url": "https://calendar.google.com/calendar/",
                "width": 800,
                "height": 810,
                "type": "popup"
            });
        });

});