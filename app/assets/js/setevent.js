import { expDefault } from './expdefault.js';
import { expDate } from './expdate.js';
import { checkToken } from './tokenutil.js';
import timezones from './vendor/timezones.json' assert { type: 'json' };

const DateTime = luxon.DateTime;

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
    const offset = document.getElementById("timezone-list").value;
    const timezone = `:00.000${offset}`
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
          ? "\n📹 " + data.conferenceData.entryPoints[0].uri
          : "\nMeetのURLはカレンダーから確認してください。";
      }
      alert(`${input.title}を登録しました。${meetUrl}`);
      window.close();
    })
    .catch(error => {
      if (error.message === "401") {
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            alert("無効なアクセストークンを削除しました。オプションページで再度Google Calendarへのアクセスを承認してください。");
          });
        return;
      } else {
        alert("予期せぬエラーが発生しました。再度登録を行ってください。");
        return;
      }
    });
};

const addEvent = (input) => {
  if (localStorage["useChromium"]) {
    chrome.storage.local.get("accessToken", result => {
      checkToken(result.accessToken)
        .then(() => {
          addEventRequest(input, result.accessToken)
        })
    });
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
    const toDate = DateTime.fromISO(toDateVal).plus({ days: 1 });
    toDateVal = toDate.toFormat("yyyy-MM-dd");

    const fromDate = DateTime.fromISO(fromDateVal);
    isValidRange = (toDate.diff(fromDate, "days").days > 0);
  } else {
    const toDate = DateTime.fromISO(toDateVal + "T" + toTimeVal);
    const fromDate = DateTime.fromISO(fromDateVal + "T" + fromTimeVal);
    isValidRange = (toDate.diff(fromDate, "minutes").minutes >= 0);
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
    alert("正しい日時を入力してください。");
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
        const targetCalendar = list[i];
        child.textContent = targetCalendar.summary;
        child.value = targetCalendar.id;
        document.getElementById("selected-calendar").appendChild(child);
        if (targetCalendar.id === localStorage["calenId"]) {
          document.getElementById("selected-calendar").value = localStorage["calenId"];
        }
      }
    })
    .catch(error => {
      if (!accessToken) {
        chrome.tabs.create({
          url: "options.html"
        });
      }
      if (error.message === "401") {
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            alert("無効なアクセストークンを削除しました。オプションページで再度Google Calendarへのアクセスを承認してください。ウィンドウを閉じます。");
            window.close();
          });
        return;
      } else {
        alert("予期せぬエラーが発生しました。ウィンドウを閉じます。");
        window.close();
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

  // argsの中身はNumberとは限らないが、融通がきくのでluxonに処理させる
  let fromDate = DateTime.fromObject({
    year: args.start.year,
    month: args.start.month,
    day: args.start.day,
  });

  const fromTime = DateTime.fromObject({
    hour: args.start.hour,
    minute: args.start.min,
  });

  let toDate = DateTime.fromObject({
    year: args.end.year,
    month: args.end.month,
    day: args.end.day,
  });

  const toTime = DateTime.fromObject({
    hour: args.end.hour,
    minute: args.end.min,
  });

  if (fromDate.isValid) {
    if (args.start.tf) {
      fromDate = fromDate.plus({ days: 1 });
    }
    document.getElementById("from-date").value = fromDate.toFormat("yyyy-MM-dd");
  }
  if (fromTime.isValid) {
    document.getElementById("from-time").value = fromTime.toFormat("HH:mm");
  }
  if (toDate.isValid) {
    if (args.end.tf) {
      toDate = toDate.plus({ days: 1 });
    }
    document.getElementById("to-date").value = toDate.toFormat("yyyy-MM-dd");
  }
  if (toTime.isValid) {
    document.getElementById("to-time").value = toTime.toFormat("HH:mm");
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

// タイムゾーン設定の作成
const tzlength = timezones.length;
for (let i = 0; i < tzlength; i++) {
  const child = document.createElement('option');
  const targetTZ = timezones[i];
  child.textContent = targetTZ.text;
  const ret = targetTZ.text.match(/\(UTC(.+?)\)/);
  child.value = (ret && ret.length > 1) ? ret[1] : "Z";
  if (targetTZ.value.includes("Japan")) {
    child.selected = true;
  }
  document.getElementById("timezone-list").appendChild(child);
}

// タイムゾーン設定はデフォルト無効
document.getElementById("timezone-list").disabled = true;
document.getElementById("to-timezone").addEventListener('click', event => {
  document.getElementById("timezone-list").disabled = !event.target.checked;
});

// 終日設定
document.getElementById("allday").addEventListener('click', event => {
  document.querySelectorAll('input[type="time"]').forEach(elem => {
    elem.disabled = event.target.checked;
  });
  // 終日設定が有効のときタイムゾーンは無効
  document.getElementById("to-timezone").disabled = event.target.checked;
  document.getElementById("timezone-list").disabled = event.target.checked;
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
    chrome.storage.local.get("accessToken", result => {
      checkToken(result.accessToken)
        .then(() => {
          fetchCalendarId(result.accessToken)
        })
        .catch()
    });
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

// Chromiumでカレンダーがロードできなかった時に再ロードする
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (localStorage["useChromium"] && changes.accessToken) {
    const newToken = changes.accessToken.newValue;
    checkToken(newToken)
      .then(() => {
        fetchCalendarId(newToken)
      })
  }
});
