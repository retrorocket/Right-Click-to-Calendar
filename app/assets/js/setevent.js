import { expDefault } from './expdefault.js';
import { expDate } from './expdate.js';
import { checkToken } from './tokenutil.js';

/**
 * イベントをカレンダーに投稿する
 */
const addEventRequest = (input, accessToken) => {

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
  const body = {
    "description": input.detail,
    "location": input.location,
    "summary": input.title,
    "transparency": "opaque",
    "status": "confirmed",
    "start": from,
    "end": to,
  };
  let conferenceDataVersionParam = "";
  if (input.hangoutsMeet) {
    conferenceDataVersionParam = "?conferenceDataVersion=1";
    const requestId = Math.random().toString(32).substring(2);
    body.conferenceData = {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        },
      }
    };
  }

  fetch(`https://www.googleapis.com/calendar/v3/calendars/${input.calendar}/events${conferenceDataVersionParam}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      let meetUrl = "";
      if (input.hangoutsMeet) {
        meetUrl = (data.conferenceData.createRequest.status.statusCode === "success")
          ? "<br>📞 " + data.conferenceData.entryPoints[0].uri
          : "<br>MeetのURLはカレンダーから確認してください。";
      }
      Swal.fire({
        html: '<span style="font-weight: bold;">' + escapeHTML(input.title) + "</span>" + " を登録しました。" + meetUrl,
        animation: false,
        onClose: () => {
          window.close();
        }
      });
    })
    .catch(error => {
      if (error.message === "401") {
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            Swal.fire({
              title: "Invalid AccessToken",
              text: "無効なアクセストークンを削除しました。オプションページで再度アプリケーションを承認してください。",
              animation: false
            });
          });
        return;
      } else {
        Swal.fire({
          title: "An error occurred",
          text: "An unexpected error occurred",
          animation: false
        });
        return;
      }
    });
};

const addEvent = (input) => {
  if (localStorage["useChromium"]) {
    checkToken(localStorage["accessToken"])
      .then(() => {
        addEventRequest(input, localStorage["accessToken"])
      })
  } else {
    chrome.identity.getAuthToken({
      'interactive': true
    }, accessToken => {
      addEventRequest(input, accessToken);
    });
  }
};

/**
 * 日時の検証, イベント投稿用のオブジェクトを作成する
 */
const createAndAddEventInput = () => {

  let isValidRange = false;
  const fromDateVal = document.getElementById("from-date").value;
  const fromTimeVal = document.getElementById("from-time").value;
  let toDateVal = document.getElementById("to-date").value;
  const toTimeVal = document.getElementById("to-time").value;

  if (document.getElementById("allday").checked) {
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
      title: document.getElementById("tit").value,
      detail: document.getElementById("detail").value,
      location: document.getElementById("location").value,
      fromDate: fromDateVal,
      fromTime: fromTimeVal,
      toDate: toDateVal,
      toTime: toTimeVal,
      allday: document.getElementById("allday").checked,
      calendar: document.getElementById("selected-calendar").value,
      hangoutsMeet: document.getElementById("hangoutsMeet").checked,
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

  fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner", {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      const list = data.items;
      for (let i = 0; i < list.length; i++) {
        const child = document.createElement('option');
        child.textContent = list[i].summary;
        child.value = list[i].id;
        document.getElementById("selected-calendar").appendChild(child);
      }
      document.getElementById("selected-calendar").value = localStorage["calenId"];
    })
    .catch(error => {
      if (error.message === "401") {
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            Swal.fire({
              title: "Invalid AccessToken",
              text: "無効なアクセストークンを削除しました。オプションページで再度アプリケーションを承認してください。",
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
    })
};

/**
 * 選択されたテキストに正規表現を適用してフォームにセットする
 */
export const convertSelectedTextToForm = (stext) => {

  // テキストに正規表現を適用
  let args = null;
  if (localStorage["expSwitch"]) {
    args = expDate(stext);
  }
  // 正規表現に合致しなかった、もしくは正規表現が設定されていない場合
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
    document.getElementById("from-date").value = fromDate.format("YYYY-MM-DD");
  }
  if (fromTime.isValid()) {
    document.getElementById("from-time").value = fromTime.format("HH:mm");
  }
  if (toDate.isValid()) {
    if (args.end.tf) {
      toDate.add(1, "days");
    }
    document.getElementById("to-date").value = toDate.format("YYYY-MM-DD");
  }
  if (toTime.isValid()) {
    document.getElementById("to-time").value = toTime.format("HH:mm");
  }

  document.getElementById("tit").value = args.title;
  document.getElementById("main-text").value = args.selected_text;
  document.getElementById("detail").value = args.detail;
  document.getElementById("location").value = args.location;
};

// イベント投稿
document.getElementById("sub").addEventListener("click", () => {
  createAndAddEventInput()
});

// 終日設定
document.getElementById("allday").addEventListener('click', event => {
  if (event.target.checked) {
    document.querySelectorAll('input[type="time"]').forEach(elem => {
      elem.disabled = true;
    });
  } else {
    document.querySelectorAll('input[type="time"]').forEach(elem => {
      elem.disabled = false;
    });
  }
});

// カレンダーを直接表示
document.getElementById("create-cal").addEventListener("click", () => {
  chrome.windows.create({
    "url": "https://calendar.google.com/calendar/",
    "width": 800,
    "height": 810,
    "type": "popup"
  });
});

// content scriptと通信して選択されたテキストを取得する
const tabId = parseInt(location.search.split("=")[1], 10);
chrome.tabs.sendMessage(tabId, {
  message: "eventpageLoaded",
}, response => {
  convertSelectedTextToForm(response.message);
  // カレンダーIDのセット

  if (localStorage["useChromium"]) {
    checkToken(localStorage["accessToken"])
      .then(() => {
        fetchCalendarId(localStorage["accessToken"])
      })
  } else {
    chrome.identity.getAuthToken({
      'interactive': true
    },
      accessToken => {
        fetchCalendarId(accessToken)
      }
    );
  }
});

// SweetAlert向けに文字列をサニタイズする
const escapeHTML = (str) => {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
