$(document).ready(function(){

	$("#check").text("OAuth認証されていません。自動的に認証が始まります。");
	$("#example").empty();
	$("#setter").hide();
	addList();

	$("#sub").click(function(){
		localStorage["calenId"] = $("#example").val();
		$("#comp").text("設定を保存しました");
	});

	$("#exp_field").hide();
	if(localStorage["expSwitch"]){
		$("#expSwitch").attr("checked", true );
		$("#exp_field").show();
		setRegExps();
	}

	$("#expSwitch").click(function(){
		if ($(this).is(":checked")) {
			localStorage["expSwitch"] = true;
			$("#exp_field").show();
			setRegExps();
		}
		else {
			localStorage.removeItem("expSwitch");
			$("#exp_field").hide();
		}
	});

	$("#reg_set").click(function(){
		localStorage["exp_str"] = $("#reg").val();
		localStorage["start_year"] = $("#start_year").val();
		localStorage["start_mon"] = $("#start_mon").val();
		localStorage["start_day"] = $("#start_day").val();
		localStorage["start_hour"] = $("#start_hour").val();
		localStorage["start_min"] = $("#start_min").val();
		localStorage["title"] = $("#reg_title").val();
		$("#edited").text("設定しました。");
	});

});

function setRegExps(){
	$("#reg").val(localStorage["exp_str"] );
	$("#start_year").val(localStorage["start_year"] );
	$("#start_mon").val(localStorage["start_mon"] );
	$("#start_day").val(localStorage["start_day"] );
	$("#start_hour").val(localStorage["start_hour"] );
	$("#start_min").val(localStorage["start_min"]);
	$("#reg_title").val(localStorage["title"]);
}

function addList(){
	chrome.identity.getAuthToken({ 'interactive': true }, function(access_token) {

		if (chrome.runtime.lastError) {
			alert(chrome.runtime.lastError.message);
			localStorage.clear();
			$("#check").text("このページをリロードして再度認証を実施して下さい。");
			return;
		}

		var xhr = new XMLHttpRequest();
	
		xhr.onreadystatechange =  function() {
			if(xhr.readyState == 4) {
				if(xhr.status == 200) {
					var data = JSON.parse(xhr.responseText);
					var list = data.items;
					if(!localStorage["calenId"]){
						localStorage["calenId"] = list[0].id;
					}
					for (var i = 0; i < list.length; i++){
						$("#example").append($('<option>').html(list[i].summary).val(list[i].id));
					}
	
					$("#example").val(localStorage["calenId"]);
					$("#setter").show();
					$("#check").text("OAuth認証済みです。");
				}
				else if(xhr.status === 401){
					var data  =  JSON.parse(xhr.responseText);
					chrome.identity.removeCachedAuthToken(
           					{ 'token': access_token },
						function(){
							alert("無効なアクセストークンを削除しました。" + data.error.code + " : " + data.error.message);
							$("#check").text("このページをリロードして再度認証を実施してください。");
							localStorage.clear();
						});
					return;
				}
				else {
					var data  =  JSON.parse(xhr.responseText);
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
