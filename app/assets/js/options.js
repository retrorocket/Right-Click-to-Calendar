import { checkToken } from './tokenutil.js';

/**
 * 正規表現の設定
 */
const setRegExps = () => {
  document.getElementById("exp-field").querySelectorAll("input").forEach(elem => {
    const id_name = elem.getAttribute("id");
    if (id_name === "reg_set") {
      return true; // continue;
    }
    document.getElementById(id_name).value = localStorage[id_name] || "";
  });
  if (localStorage["check_str"]) {
    document.getElementById("check_str").value = localStorage["check_str"];
  }
};

const loadCalendarIdRequest = (accessToken) => {
  fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer", {
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
      if (!localStorage["calenId"]) {
        localStorage["calenId"] = list[0].id;
        chrome.storage.local.set({ "calenId": list[0].id });
      } else {
        chrome.storage.local.get("calenId", result => {
          if (!result.calenId) {
            chrome.storage.local.set({ "calenId": localStorage["calenId"] });
          }
        });
      }
      for (let i = 0; i < list.length; i++) {
        const child = document.createElement('option');
        child.textContent = list[i].summary;
        child.value = list[i].id;
        document.getElementById("selected-calendar").appendChild(child);
      }

      document.getElementById("selected-calendar").value = localStorage["calenId"];
      document.getElementById("setter").style.display = "block";
      document.getElementById("check").textContent = "Google Calendarへのアクセスを承認済みです。";
      if (location.search.split("=")[1]) {
        alert("アクセストークンを再取得しました。再度コンテキストメニューからカレンダーに予定を登録してください。");
      }
    })
    .catch(error => {
      if (error.message === "401") {
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            alert("無効なアクセストークンを削除しました。このページをリロードして再度Google Calendarへのアクセスを承認してください。");
            document.getElementById("check").textContent = "このページをリロードして再度Google Calendarへのアクセスを承認してください。";
            localStorage.removeItem("calenId");
            chrome.storage.local.remove("calenId");
          });
      } else {
        alert("カレンダーリストの取得に失敗しました。このページをリロードしてください。");
        document.getElementById("check").textContent = "カレンダーリストの取得に失敗しました。このページをリロードしてください。";
        localStorage.removeItem("calenId");
        chrome.storage.local.remove("calenId");
      }
    });
};

/**
 * カレンダー一覧の読み込み
 * Chromiumの場合はここでaccessTokenを取得する
 */
const loadCalendarId = () => {
  if (localStorage["useChromium"]) {
    chrome.storage.local.get("accessToken", result => {
      checkToken(result.accessToken)
        .then(() => loadCalendarIdRequest(result.accessToken))
        .catch(() => {
          localStorage.removeItem("calenId");
          chrome.storage.local.remove("calenId");
          document.getElementById("check").textContent = "このページをリロードして再度Google Calendarへのアクセスを承認してください。";
        });
    });
  } else {
    chrome.identity.getAuthToken({
      'interactive': true
    }, accessToken => {
      if (chrome.runtime.lastError) {
        localStorage.removeItem("calenId");
        chrome.storage.local.remove("calenId");
        document.getElementById("check").textContent = "このページをリロードして再度Google Calendarへのアクセスを承認してください。Google Chrome以外を使用している場合は、詳細設定を行ってください。";
        alert("トークンが存在しないため予定を登録できません。このページをリロードして再度Google Calendarへのアクセスを承認してください。\nGoogle Chrome以外を使用している場合は、このページから詳細設定を行ってください。");
      } else {
        loadCalendarIdRequest(accessToken);
      }
    });
  }
};

/**
 * 正規表現のチェック
 */
const checkRegExps = () => {
  const regExp = new RegExp(document.getElementById("exp_str").value);
  const checkString = document.getElementById("check_str").value;
  const matches = checkString.match(regExp);
  if (!matches) {
    const child = document.createElement('li');
    child.textContent = "検証用文字列が正規表現にマッチしません。";
    document.getElementById("regexp-group").appendChild(child);
    return false;
  }
  const machedLength = matches.length;
  for (let i = 0; i < machedLength; i++) {
    const child = document.createElement('li');
    child.textContent = `group(${i}): ${matches[i]}`;
    document.getElementById("regexp-group").appendChild(child);
  }
};

// ページ読み込み時の初期設定
const formatCalenderId = () => {
  document.getElementById("check").textContent = "Google Calendarへのアクセスが承認されていません。自動で承認用のページが表示されます。";
  document.getElementById("selected-calendar").innerHTML = "";
  document.getElementById("setter").style.display = "none";
  // カレンダーの読み込み
  loadCalendarId();
}
formatCalenderId();

// デフォルトで登録するカレンダーの設定
document.getElementById("sub").addEventListener('click', () => {
  localStorage["calenId"] = document.getElementById("selected-calendar").value;
  document.getElementById("comp").textContent = "設定を保存しました";
});
document.getElementById("selected-calendar").addEventListener("change", () => {
  document.getElementById("comp").textContent = "";
});

// 正規表現設定用のフォームの表示
document.getElementById("exp-field").style.display = "none";
document.getElementById("exp-test-field").style.display = "none";
if (localStorage["expSwitch"]) {
  document.getElementById("exp-switch").checked = true;
  document.getElementById("exp-field").style.display = "block";
  document.getElementById("exp-test-field").style.display = "block";
  setRegExps();
}

// 正規表現設定用のフォームの表示
document.getElementById("exp-switch").addEventListener('click', event => {
  if (event.target.checked) {
    localStorage["expSwitch"] = true;
    document.getElementById("exp-field").style.display = "block";
    document.getElementById("exp-test-field").style.display = "block";
    setRegExps();
  } else {
    localStorage.removeItem("expSwitch");
    document.getElementById("exp-field").style.display = "none";
    document.getElementById("exp-test-field").style.display = "none";
  }
});

// 選択したテキストを詳細に設定する
if (localStorage["detailSwitch"]) {
  document.getElementById("detail-switch").checked = true;
}
document.getElementById("detail-switch").addEventListener('click', event => {
  if (event.target.checked) {
    localStorage["detailSwitch"] = true;
  } else {
    localStorage.removeItem("detailSwitch");
  }
});

// Chromiumを使用する
document.getElementById("chromium-notice").style.display = "none";
if (localStorage["useChromium"]) {
  document.getElementById("chromium-switch").checked = true;
  document.getElementById("chromium-notice").style.display = "block";
}
document.getElementById("chromium-switch").addEventListener('click', event => {
  if (event.target.checked) {
    localStorage["useChromium"] = true;
    document.getElementById("chromium-notice").style.display = "block";
  } else {
    localStorage.removeItem("useChromium");
    document.getElementById("chromium-notice").style.display = "none";
  }
  formatCalenderId();
});

// Chromiumでカレンダーがロードできなかった時に再ロードする
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace == "local" && localStorage["useChromium"] && changes.accessToken) {
    formatCalenderId();
  }
});

// 正規表現の設定
document.getElementById("reg-set").addEventListener('click', () => {
  document.getElementById("exp-field").querySelectorAll("input").forEach(elem => {
    const id_name = elem.getAttribute("id");
    if (id_name === "reg-set") {
      return true; // continue;
    }
    localStorage[id_name] = document.getElementById(id_name).value;
  });
  document.getElementById("edited").textContent = "設定しました。";
});

// 正規表現のチェック
document.getElementById("check-regexp").addEventListener("click", () => {
  document.getElementById("regexp-group").innerHTML = "";
  localStorage["check_str"] = document.getElementById("check_str").value;
  checkRegExps();
});
