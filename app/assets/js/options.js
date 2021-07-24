"use strict";

/**
 * 正規表現の設定
 */
const setRegExps = () => {
  $("#exp-field").find(":input").each((i, elem) => {
    const id_name = $(elem).attr("id");
    if (id_name === "reg_set") {
      return true; // continue;
    }
    $("#" + id_name).val(localStorage[id_name]);
  });
  if (localStorage["check_str"]) {
    $("#check_str").val(localStorage["check_str"]);
  }
};

/**
 * カレンダー一覧の読み込み
 */
const loadCalendarId = () => {
  chrome.identity.getAuthToken({
    'interactive': true
  }, accessToken => {

    if (chrome.runtime.lastError) {
      alert(chrome.runtime.lastError.message);
      localStorage.removeItem("calenId");
      chrome.storage.local.remove("calenId");
      $("#check").text("このページをリロードして再度アプリケーションを承認してください。");
      if (location.search.split("=")[1]) {
        alert("トークンが存在しないため予定を登録できません。このページをリロードして再度アプリケーションを承認してください。");
      }
      return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onloadend = () => {
      if (xhr.status == 200) {
        const data = JSON.parse(xhr.responseText);
        const list = data.items;
        if (!localStorage["calenId"]) {
          localStorage["calenId"] = list[0].id;
          chrome.storage.local.set({ "calenId": list[0].id });
        }
        chrome.storage.local.get("calenId", result => {
          if (!result.calenId) {
            chrome.storage.local.set({ "calenId": localStorage["calenId"] });
          }
        });
        for (let i = 0; i < list.length; i++) {
          $("#selected-calendar").append($('<option>').html(list[i].summary).val(list[i].id));
        }

        $("#selected-calendar").val(localStorage["calenId"]);
        $("#setter").show();
        $("#check").text("アプリケーションを承認済みです。");
        if (location.search.split("=")[1]) {
          alert("アクセストークンを再取得しました。再度コンテキストメニューからカレンダーに予定を登録してください。");
        }
      } else if (xhr.status === 401) {
        const data = JSON.parse(xhr.responseText);
        chrome.identity.removeCachedAuthToken({
          'token': accessToken
        },
          () => {
            alert("無効なアクセストークンを削除しました。このページをリロードして再度アプリケーションを承認してください。\n" + data.error.code + " : " + data.error.message);
            $("#check").text("このページをリロードして再度アプリケーションを承認してください。");
            localStorage.removeItem("calenId");
            chrome.storage.local.remove("calenId");
          });
        return;
      } else {
        const data = JSON.parse(xhr.responseText);
        alert("カレンダーリストの取得に失敗しました。オプションページをリロードしてください。\n" + data.error.code + " : " + data.error.message);
        $("#check").text("カレンダーリストの取得に失敗しました。このページをリロードしてください。");
        localStorage.removeItem("calenId");
        chrome.storage.local.remove("calenId");
      }

    };
    xhr.open('GET',
      "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer",
      true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(null);
  });

};

/**
 * 正規表現のチェック
 */
const checkRegExps = () => {
  const regExp = new RegExp($("#exp_str").val());
  const checkString = $("#check_str").val();
  const matches = checkString.match(regExp);
  if (!matches) {
    $("#regexp-group").append("<li>検証用文字列が正規表現にマッチしません。</li>");
    return false;
  }
  const machedLength = matches.length;
  for (let i = 0; i < machedLength; i++) {
    $("#regexp-group").append("<li>group(" + i + "): " + matches[i] + "</li>");
  }
};

// ページ読み込み時の初期設定
$("#check").text("アプリケーションが承認されていません。自動で承認用のページが表示されます。");
$("#selected-calendar").empty();
$("#setter").hide();
// カレンダーの読み込み
loadCalendarId();

// デフォルトで登録するカレンダーの設定
$("#sub").on("click", () => {
  localStorage["calenId"] = $("#selected-calendar").val();
  $("#comp").text("設定を保存しました");
});
$("#selected-calendar").change(() => {
  $("#comp").text("");
});

// 正規表現設定用のフォームの表示
$("#exp-field").hide();
$("#exp-test-field").hide();
if (localStorage["expSwitch"]) {
  $("#exp-switch").prop("checked", true);
  $("#exp-field").show();
  $("#exp-test-field").show();
  setRegExps();
}

// 正規表現設定用のフォームの表示
$("#exp-switch").on("click", event => {
  if ($(event.currentTarget).prop('checked')) {
    localStorage["expSwitch"] = true;
    $("#exp-field").show();
    $("#exp-test-field").show();
    setRegExps();
  } else {
    localStorage.removeItem("expSwitch");
    $("#exp-field").hide();
    $("#exp-test-field").hide();
  }
});

// 選択したテキストを詳細に設定する
if (localStorage["detailSwitch"]) {
  $("#detail-switch").prop("checked", true);
}
$("#detail-switch").on("click", event => {
  if ($(event.currentTarget).prop('checked')) {
    localStorage["detailSwitch"] = true;
  } else {
    localStorage.removeItem("detailSwitch");
  }
});

// 正規表現の設定
$("#reg-set").on("click", () => {
  $("#exp-field").find(":input").each((i, elem) => {
    const id_name = $(elem).attr("id");
    if (id_name === "reg-set") {
      return true; // continue;
    }
    localStorage[id_name] = $("#" + id_name).val();
  });
  $("#edited").text("設定しました。");
});

// 正規表現のチェック
$("#check-regexp").on("click", () => {
  $("#regexp-group").empty();
  localStorage["check_str"] = $("#check_str").val();
  checkRegExps();
});
