var bg = chrome.extension.getBackgroundPage();

function isValidDate(y, m, d) {
    y = parseInt(y, 10);
    m = parseInt(m, 10);
    d = parseInt(d, 10);
    var di = new Date(y, m - 1, d);
    if (di.getFullYear() == y && di.getMonth() == m - 1 && di.getDate() == d) {
        return true;
    }
    return false;
}

function checkRange(start, shour, smin, end, ehour, emin) {
    try {

        if (!time_checker(shour, smin) || !time_checker(ehour, emin)) {
            return false;
        }
        var s_d = start + " " + checker(shour) + " " + checker(smin);
        var e_d = end + " " + checker(ehour) + " " + checker(emin);

        var sDate = $.exDate(s_d, "yyyy-mm-dd hh mi");
        var eDate = $.exDate(e_d, "yyyy-mm-dd hh mi");

        if ((eDate.getTime() - sDate.getTime()) < 0) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

function time_checker(h, m) {
    //console.log(h,m);
    if (parseInt(h, 10) < 24 && parseInt(h, 10) >= 0 && parseInt(m, 10) < 60 && parseInt(m, 10) >= 0) {
        return true
    }
    return false;
}

function checker(ch) {
    //console.log(ch + "→" +parseInt(ch,10));
    if (parseInt(ch, 10) < 10) {
        ch = "0" + parseInt(ch, 10);
    }
    return ch;
}

$(document).ready(function () {

    chrome.identity.getAuthToken({
            'interactive': true
        },
        function (access_token) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        //console.log(data);
                        var list = data.items;
                        for (var i = 0; i < list.length; i++) {
                            $("#example").append($('<option>').html(list[i].summary).val(list[i].id));
                        }

                        $("#example").val(localStorage["calenId"]);
                    } else if (xhr.status === 401) {
                        var data = JSON.parse(xhr.responseText);
                        chrome.identity.removeCachedAuthToken({
                                'token': access_token
                            },
                            function () {
                                //alert("無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message);
                                swal({
                                        title: "invalid AccessToken!",
                                        text: "無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message,
                                        animation: false
                                    },
                                    function () {
                                        window.close();
                                    });
                                //window.close();
                            });
                        return;
                    } else {
                        var data = JSON.parse(xhr.responseText);
                        //console.log(data);
                        //alert("リストの取得に失敗しました。ウインドウを閉じます。");
                        swal({
                                title: "Acquisition failure!",
                                text: "リストの取得に失敗しました。ウインドウを閉じます",
                                animation: false
                            },
                            function () {
                                window.close();
                            });
                        return;
                    }
                }
            }
            xhr.open('GET',
                "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
                true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            xhr.send(null);
        }
    );

    $("#from").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (selectedDate) {
            $("#to").datepicker("option", "minDate", selectedDate);
        }
    });
    $("#to").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (selectedDate) {
            $("#from").datepicker("option", "maxDate", selectedDate);
        }
    });

    jQuery("#formID").validationEngine('attach');
    //window.returnValue = false;

    var start_year = bg.args.start.year;
    var start_month = bg.args.start.month;
    var start_day = bg.args.start.day;
    var start_hour = bg.args.start.hour;
    var start_min = bg.args.start.min;

    var end_year = bg.args.end.year;
    var end_month = bg.args.end.month;
    var end_day = bg.args.end.day;
    var end_hour = bg.args.end.hour;
    var end_min = bg.args.end.min;

    if (isValidDate(start_year, start_month, start_day)) {
        $("#from").val(start_year + "-" + checker(start_month) + "-" + checker(start_day));
    }

    if (isValidDate(end_year, end_month, end_day)) {
        $("#to").val(end_year + "-" + checker(end_month) + "-" + checker(end_day));
    }

    if (time_checker(start_hour, start_min)) {
        $("#f_hour").val(checker(start_hour));
        $("#f_min").val(checker(start_min));
    }

    if (time_checker(end_hour, end_min)) {
        $("#e_hour").val(checker(end_hour));
        $("#e_min").val(checker(end_min));
    }

    $("#tit").val(bg.args.title);

    $("#main_text").val(bg.args.selected_text);

    $("#detail").val(bg.args.detail);

    $("#sub").click(function () {

        var range_bool = false;

        var from = $("#from").val();
        var to = $("#to").val();

        if ($('#check').attr('checked')) {
            var myDate = $.exDate(to, "yyyy-mm-dd");
            //console.log(myDate);
            myDate.setDate(myDate.getDate() + 1);
            to = myDate.toChar('yyyy-mm-dd');

            range_bool = checkRange(from, "0", "0", to, "0", "0");

        } else {
            range_bool = checkRange(from, $("#f_hour").val(), $("#f_min").val(), to, $("#e_hour").val(), $("#e_min").val());
        }

        if (range_bool) {
            var obj = {
                title: $("#tit").val(),
                detail: $("#detail").val(),
                f_mon: from,

                f_hour: checker($("#f_hour").val()),
                f_min: checker($("#f_min").val()),

                check: $('#check').attr('checked'),

                e_hour: checker($("#e_hour").val()),
                e_min: checker($("#e_min").val()),

                e_mon: to,

                calen: $("#example").val()
            };

            //イベント投稿
            add_event(obj);
        } else {
            swal({
                title: "invalid date!",
                text: "日時が正しくありません",
                animation: false
            });
            //alert ("日時が正しくありません");
        }
    });

    $("#check").click(
        function () {
            if (!this.checked) {
                $("input.time").removeAttr("disabled");
            } else {
                $("input.time").attr("disabled", true);
            }
        });

    $("#create_cal").hide();
    if (localStorage["window_type"] === "panel") {
        $("#create_cal").show();
    }

    $("#create_cal").click(
        function () {
            chrome.windows.create({
                "url": "https://www.google.com/calendar/",
                "width": 800,
                "height": 810,
                "type": "panel"
            });
        });

});

function add_event(returnValue) {
    chrome.identity.getAuthToken({
            'interactive': true
        },
        function (access_token) {
            /**開始～終了日時設定**/

            var st = ""; //開始日時
            var en = ""; //終了日時

            var start_array;
            var end_array;

            if (returnValue["check"]) { //終日設定
                st = returnValue["f_mon"];
                en = returnValue["e_mon"];
                start_array = {
                    "date": st
                };
                end_array = {
                    "date": en
                };
            } else {
                st = returnValue["f_mon"] + "T" + returnValue["f_hour"] + ":" + returnValue["f_min"] + ":00.000+09:00";
                en = returnValue["e_mon"] + "T" + returnValue["e_hour"] + ":" + returnValue["e_min"] + ":00.000+09:00";
                start_array = {
                    "dateTime": st
                };
                end_array = {
                    "dateTime": en
                };
            }

            /**設定終わり**/

            var body = JSON.stringify({
                "description": returnValue["detail"],
                "summary": returnValue["title"],
                "transparency": "opaque",
                "status": "confirmed",
                "start": start_array,
                "end": end_array
            });

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        //alert("【"+ returnValue["title"] + "】" +"を登録しました");
                        swal({
                                title: "succeed!",
                                text: "【" + returnValue["title"] + "】" + "を登録しました",
                                animation: false
                            },
                            function () {
                                window.close();
                            });
                        //window.close();
                    } else if (xhr.status === 401) {
                        var data = JSON.parse(xhr.responseText);
                        chrome.identity.removeCachedAuthToken({
                                'token': access_token
                            },
                            function () {
                                //alert("無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message);
                                swal({
                                    title: "invalid AccessToken",
                                    text: "無効なアクセストークンを削除しました。オプションページで再認証してください。" + data.error.code + " : " + data.error.message,
                                    animation: false
                                });
                            });
                        return;
                    } else {
                        var data = JSON.parse(xhr.responseText);
                        //alert("(Error)" + data.error.code + " : " + data.error.message);
                        swal({
                            title: "error!",
                            text: data.error.code + " : " + data.error.message,
                            animation: false
                        });
                        return;
                    }
                }
            }
            var calenid = returnValue["calen"];
            xhr.open('POST',
                "https://www.googleapis.com/calendar/v3/calendars/" + calenid + "/events",
                true);

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            xhr.send(body);
        }
    );
}