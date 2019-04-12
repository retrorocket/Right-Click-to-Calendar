"use strict";

const setRegExps = () => {
    $("#exp-field").find(":input").each((i, elem) => {
        let id_name = $(elem).attr("id");
        if (id_name === "reg_set") {
            return true; // continue;
        }
        $("#" + id_name).val(localStorage[id_name]);
    });
    if (localStorage["check_str"]) {
        $("#check_str").val(localStorage["check_str"]);
    }
};

const addList = () => {
    chrome.identity.getAuthToken({
        'interactive': true
    }, accessToken => {

        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            localStorage.removeItem("calenId");
            $("#check").text("このページをリロードして再度認証を実施して下さい。");
            return;
        }

        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    let data = JSON.parse(xhr.responseText);
                    let list = data.items;
                    if (!localStorage["calenId"]) {
                        localStorage["calenId"] = list[0].id;
                    }
                    for (let i = 0; i < list.length; i++) {
                        $("#selected-calendar").append($('<option>').html(list[i].summary).val(list[i].id));
                    }

                    $("#selected-calendar").val(localStorage["calenId"]);
                    $("#setter").show();
                    $("#check").text("OAuth認証済みです。");
                } else if (xhr.status === 401) {
                    let data = JSON.parse(xhr.responseText);
                    chrome.identity.removeCachedAuthToken({
                            'token': accessToken
                        },
                        () => {
                            alert("無効なアクセストークンを削除しました。" + data.error.code + " : " + data.error.message);
                            $("#check").text("このページをリロードして再度認証を実施してください。");
                            localStorage.removeItem("calenId");
                        });
                    return;
                } else {
                    let data = JSON.parse(xhr.responseText);
                    alert("リストの取得に失敗しました。オプションページをリロードしてください" + data.error.code + " : " + data.error.message);
                    $("#check").text("リストの取得に失敗しました。このページをリロードしてください。");
                    localStorage.removeItem("calenId");
                }
            }
        }
        xhr.open('GET',
            "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
            true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.send(null);
    });

};

const checkRegExps = () => {
    let regExp = new RegExp($("#exp_str").val());
    let checkString = $("#check_str").val();
    let matches = checkString.match(regExp);
    if (!matches) {
        $("#regexp-group").append("<li>検証用文字列が正規表現にマッチしません。</li>");
        return false;
    }
    let machedLength = matches.length;
    for (let i = 0; i < machedLength; i++) {
        $("#regexp-group").append("<li>group(" + i + "): " + matches[i] + "</li>");
    }
};

$(function () {

    $("#check").text("OAuth認証されていません。自動的に認証が始まります。");
    $("#selected-calendar").empty();
    $("#setter").hide();
    addList();

    $("#sub").on("click", () => {
        localStorage["calenId"] = $("#selected-calendar").val();
        $("#comp").text("設定を保存しました");
    });

    $("#selected-calendar").change(() => {
        $("#comp").text("");
    });

    $("#exp-field").hide();
    $("#exp-test-field").hide();
    if (localStorage["expSwitch"]) {
        $("#exp-switch").prop("checked", true);
        $("#exp-field").show();
        $("#exp-test-field").show();
        setRegExps();
    }

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

    $("#reg-set").on("click", () => {
        $("#exp-field").find(":input").each((i, elem) => {
            let id_name = $(elem).attr("id");
            if (id_name === "reg-set") {
                return true; // continue;
            }
            localStorage[id_name] = $("#" + id_name).val();
        });
        $("#edited").text("設定しました。");
    });

    $("#check-regexp").on("click", () => {
        $("#regexp-group").empty();
        localStorage["check_str"] = $("#check_str").val();
        checkRegExps();
    });

});