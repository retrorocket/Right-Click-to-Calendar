$(document).ready(function () {

    $("#check").text("OAuth認証されていません。自動的に認証が始まります。");
    $("#example").empty();
    $("#setter").hide();
    addList();

    $("#sub").click(function () {
        localStorage["calenId"] = $("#example").val();
        $("#comp").text("設定を保存しました");
    });

    $("#exp_field").hide();
    if (localStorage["expSwitch"]) {
        $("#expSwitch").attr("checked", true);
        $("#exp_field").show();
        setRegExps();
    }

    $("#expSwitch").click(function () {
        if ($(this).is(":checked")) {
            localStorage["expSwitch"] = true;
            $("#exp_field").show();
            setRegExps();
        } else {
            localStorage.removeItem("expSwitch");
            $("#exp_field").hide();
        }
    });

    $("#reg_set").click(function () {
        $("#exp_field").find(":input").each(function (i, elem) {
            var id_name = $(elem).attr("id");
            if (id_name === "reg_set") {
                return true; // continue;
            }
            localStorage[id_name] = $("#" + id_name).val();
        });
        $("#edited").text("設定しました。");
    });
    
    // window flag enabler
    $("#panel_enabler").click(function() {
         chrome.tabs.create({ url: "chrome://flags/#enable-panels" });
    });
    
    if(localStorage["window_type"]){
        $("#window_setter_val").val(localStorage["window_type"]);
    }
    
    $("#sub_window").click(function(){
        var selectVal = $("#window_setter_val").val();
        localStorage["window_type"] = selectVal;
        $("#comp_window").text("設定を保存しました");
    });

});

function setRegExps() {
    $("#exp_field").find(":input").each(function (i, elem) {
        var id_name = $(elem).attr("id");
        if (id_name === "reg_set") {
            return true; // continue;
        }
        $("#" + id_name).val(localStorage[id_name]);
    });
}

function addList() {
    chrome.identity.getAuthToken({
        'interactive': true
    }, function (access_token) {

        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            localStorage.clear();
            $("#check").text("このページをリロードして再度認証を実施して下さい。");
            return;
        }

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = JSON.parse(xhr.responseText);
                    var list = data.items;
                    if (!localStorage["calenId"]) {
                        localStorage["calenId"] = list[0].id;
                    }
                    for (var i = 0; i < list.length; i++) {
                        $("#example").append($('<option>').html(list[i].summary).val(list[i].id));
                    }

                    $("#example").val(localStorage["calenId"]);
                    $("#setter").show();
                    $("#check").text("OAuth認証済みです。");
                } else if (xhr.status === 401) {
                    var data = JSON.parse(xhr.responseText);
                    chrome.identity.removeCachedAuthToken({
                            'token': access_token
                        },
                        function () {
                            alert("無効なアクセストークンを削除しました。" + data.error.code + " : " + data.error.message);
                            $("#check").text("このページをリロードして再度認証を実施してください。");
                            localStorage.clear();
                        });
                    return;
                } else {
                    var data = JSON.parse(xhr.responseText);
                    alert("リストの取得に失敗しました。オプションページをリロードしてください" + data.error.code + " : " + data.error.message);
                    $("#check").text("リストの取得に失敗しました。このページをリロードしてください。");
                    localStorage.clear();
                }
            }
        }
        xhr.open('GET',
            "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
            true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.send(null);
    });

}