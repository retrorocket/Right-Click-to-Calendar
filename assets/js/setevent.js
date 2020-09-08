//@ts-check
"use strict";

/**
 * イベントをカレンダーに投稿する
 */
const addEvent = (input) => {
  chrome.identity.getAuthToken({
      'interactive': true
    },
    accessToken => {

      //// 開始～終了日時設定 ////
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

      //// API投稿用のオブジェクトを作成 ////
      const body = JSON.stringify({
        "description": input.detail,
        "location": input.location,
        "summary": input.title,
        "transparency": "opaque",
        "status": "confirmed",
        "start": from,
        "end": to
      });

      const xhr = new XMLHttpRequest();
      xhr.onloadend = () => {

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
          const data = JSON.parse(xhr.responseText);
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
          const data = JSON.parse(xhr.responseText);
          Swal.fire({
            title: "error!",
            text: data.error.code + " : " + data.error.message,
            animation: false
          });
          return;

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

/**
 * 日時の検証, イベント投稿用のオブジェクトを作成する
 */
const createAndAddEventInput = () => {

  let isValidRange = false;
  let fromDateVal = $("#from-date").val();
  let fromTimeVal = $("#from-time").val();
  let toDateVal = $("#to-date").val();
  let toTimeVal = $("#to-time").val();

  if ($('#allday').prop('checked')) {
    // 終日設定は最終日に24時間足さないと認識されない
    const toDate = moment(toDateVal);
    toDate.add(1, "days");
    toDateVal = toDate.format("YYYY-MM-DD");

    const fromDate = moment(fromDateVal);
    isValidRange = (toDate.diff(fromDate, "days") > 0);
  } else {
    const toDate = moment(toDateVal + " " + toTimeVal);
    const fromDate = moment(fromDateVal + " " + fromTimeVal);
    isValidRange = (toDate.diff(fromDate, "minutes") >= 0);
  }

  if (isValidRange) {
    const input = {
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

  const xhr = new XMLHttpRequest();

  xhr.onloadend = () => {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      const list = data.items;
      for (let i = 0; i < list.length; i++) {
        $("#selected-calendar").append($('<option>').html(list[i].summary).val(list[i].id));
      }
      $("#selected-calendar").val(localStorage["calenId"]);

    } else if (xhr.status === 401) {
      const data = JSON.parse(xhr.responseText);
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
  };
  xhr.open('GET',
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
    true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.send(null);

};

/**
 * 選択されたテキストに正規表現を適用してフォームにセットする
 */
const convertSelectedTextToForm = (stext) => {

  // テキストに正規表現を適用
  let args = null;
  if (localStorage["expSwitch"]) {
    args = expDate(stext);
  }
  if (!args) {
    args = expDefault(stext);
  }

  // argsの中身はNumberとは限らないが、融通がきくのでmomentに処理させる
  const fromDate = moment({
    year: args.start.year,
    month: args.start.month,
    day: args.start.day,
  });

  const fromTime = moment({
    hour: args.start.hour,
    minute: args.start.min,
  });

  const toDate = moment({
    year: args.end.year,
    month: args.end.month,
    day: args.end.day,
  });

  const toTime = moment({
    hour: args.end.hour,
    minute: args.end.min,
  });

  if (fromDate.isValid()) {
    if (args.start.tf) {
      fromDate.add(1, "days");
    }
    $("#from-date").val(fromDate.format("YYYY-MM-DD"));
  }
  if (fromTime.isValid()) {
    $("#from-time").val(fromTime.format("HH:mm"));
  }
  if (toDate.isValid()) {
    if (args.end.tf) {
      toDate.add(1, "days");
    }
    $("#to-date").val(toDate.format("YYYY-MM-DD"));
  }
  if (toTime.isValid()) {
    $("#to-time").val(toTime.format("HH:mm"));
  }

  $("#tit").val(args.title);
  $("#main-text").val(args.selected_text);
  $("#detail").val(args.detail);
  $("#location").val(args.location);
};

// カレンダーIDのセット
chrome.identity.getAuthToken({
    'interactive': true
  },
  accessToken => {
    fetchCalendarId(accessToken)
  }
);

// イベント投稿
$("#sub").on("click", () => {
  createAndAddEventInput()
});

// 終日設定
$("#allday").on("click", event => {
  if ($(event.currentTarget).prop('checked')) {
    $('input[type="time"]').prop("disabled", true);
  } else {
    $('input[type="time"]').prop("disabled", false);
  }
});

// カレンダーを直接表示
$("#create-cal").on("click", () => {
  chrome.windows.create({
    "url": "https://calendar.google.com/calendar/",
    "width": 800,
    "height": 810,
    "type": "popup"
  });
});

// content scriptと通信して選択されたテキストを取得する
let tabId = parseInt(location.search.split("=")[1], 10);
chrome.tabs.sendMessage(tabId, {
  message: "eventpageLoaded",
}, response => {
  // 取得したテキストをフォームにセットする
  convertSelectedTextToForm(response.message)
});
