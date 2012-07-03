var bg = chrome.extension.getBackgroundPage();

$(document).ready(function(){

	checkOAuth();

	$("#txt").val(localStorage["calenId"]);//既にIDが登録されている場合

	$("#sub").click(function(){
		localStorage["calenId"] = $("#txt").val();
		console.log(localStorage["calenId"] + $("#txt").val());
		$("#comp").text("設定を保存しました");
	});

	$("#Odel").click(function(){
		//$("#comp").text("設定を保存しました");
		bg.oauth.clearTokens();
		checkOAuth();
	});

});

function checkOAuth(){
	if(bg.oauth.getToken()){
		$("#check").text("OAuth認証済みです");
	}
	else {
		$("#Odel").hide();
		$("#check").text("OAuth認証されていません．（※イベントの初回登録時に認証します）");
	}
}

