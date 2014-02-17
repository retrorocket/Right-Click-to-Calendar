var bg = chrome.extension.getBackgroundPage();

$(document).ready(function(){

	checkOAuth();

	$("#txt").val(localStorage["calenId"]);//既にIDが登録されている場合

	$("#sub").click(function(){
		localStorage["calenId"] = $("#example").val();
		console.log(localStorage["calenId"] + $("#txt").val());
		$("#comp").text("設定を保存しました");
	});

	$("#Odel").click(function(){
		bg.google.clearAccessToken();
		localStorage.removeItem("calenId");
		checkOAuth();
	});

	$("#Oget").click(function(){
		addList();
	});

});

function checkOAuth(){
	$("#example").empty();
	$("#setter").hide();

	if(bg.google.getAccessToken()){
		addList();
	}
	else {
		$("#Odel").hide();
		$("#Oget").show();
		$("#check").text("OAuth認証されていません．");
	}
}

function addList(){
	bg.google.authorize(function(){
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange =  function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				//console.log(data);
				var list = data.items;
				if(localStorage.getItem("calenId")  == undefined){
					localStorage["calenId"] = list[0].id;
				}
				for (var i = 0; i < list.length; i++){
					$("#example").append($('<option>').html(list[i].summary).val(list[i].id));
				}

				$("#example").val(localStorage["calenId"]);
				$("#setter").show();
			}
			else {
				var data  =  JSON.parse(xhr.responseText);
				//console.log(data);
				alert("リストの取得に失敗しました。オプションページをリロードしてください" + data.error.code + " : " + data.error.message);
			}
		}
	}
	//var calenid = encodeURIComponent(localStorage.getItem( "calenId" ));
	xhr.open('GET',
		"https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner",
	true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Authorization', 'Bearer ' + bg.google.getAccessToken());
	xhr.send(null);
	});
	$("#check").text("OAuth認証済みです");
	$("#Oget").hide();
	$("#Odel").show();

}
