function isValidDate(y,m,d){
	y = parseInt(y, 10);
	m = parseInt(m, 10);
	d = parseInt(d, 10);
	var di = new Date(y,m-1,d);
	if(di.getFullYear() == y && di.getMonth() == m-1 && di.getDate() == d){
		return true;
	}
	return false;
}

function checkRange(start, shour, smin, end, ehour, emin){
	try{

		if(!time_checker(shour,smin) || !time_checker(ehour,emin)){
			return false;
		}
		var s_d  = start + " " + checker(shour) + " " + checker(smin);
		var e_d  = end + " " + checker(ehour) + " " + checker(emin);

		var sDate = $.exDate(s_d, "yyyy-mm-dd hh mi");
		var eDate = $.exDate(e_d, "yyyy-mm-dd hh mi");

		if( (eDate.getTime() - sDate.getTime() )  <  0 ){
			return false;
		}

		return true;
	}
	catch( e ){
		return false;
	}
}

function time_checker(h, m){
	//console.log(h,m);
	if(parseInt(h,10) < 24 && parseInt(h,10) >= 0 && parseInt(m,10) < 60 && parseInt(m,10) >= 0){
		return true
	}
	return false;
}

function checker(ch){
	//console.log(ch + "→" +parseInt(ch,10));
	if(parseInt(ch,10) < 10 ){
		ch= "0"+ parseInt(ch,10);
	}
	return ch;
}

$(document).ready(function(){

	$( "#from" ).datepicker({
		dateFormat: "yy-mm-dd",
	onSelect: function( selectedDate ) {
		$( "#to" ).datepicker( "option", "minDate", selectedDate );
	}
	});
	$( "#to" ).datepicker({
		dateFormat: "yy-mm-dd",
		onSelect: function( selectedDate ) {
			$( "#from" ).datepicker( "option", "maxDate", selectedDate );
		}
	});

	jQuery("#formID").validationEngine('attach');
	window.returnValue = false;

	var year  = window.dialogArguments[6];

	var start_month = window.dialogArguments[1];
	var start_day = window.dialogArguments[2];

	var end_month = window.dialogArguments[1];
	var end_day = window.dialogArguments[2];

	var start_hour = window.dialogArguments[3];
	var start_min = window.dialogArguments[4];

	var end_hour = window.dialogArguments[3];
	var end_min = window.dialogArguments[4];

	if(isValidDate(year,start_month,start_day)){
		$("#from").val(year + "-" + checker(start_month) + "-" + checker(start_day));
	}

	if(isValidDate(year,end_month,end_day)){
		$("#to").val(year + "-" + checker(end_month) + "-" + checker(end_day));
	}

	if(time_checker(start_hour,start_min)){
		$("#f_hour").val(checker(start_hour));
		$("#f_min").val(checker(start_min));
	}

	if(time_checker(end_hour,end_min)){
		$("#e_hour").val(checker(end_hour));
		$("#e_min").val(checker(end_min));
	}

	$("#tit").val(window.dialogArguments[0]);

	$("#main_text").val(window.dialogArguments[5]);

	$("#sub").click(function(){

		var range_bool = false;

		var from = $("#from").val();
		var to = $("#to").val();

		if ($('#check').attr('checked')){
			var myDate = $.exDate(to, "yyyy-mm-dd");
			console.log(myDate);
			myDate.setDate(myDate.getDate() + 1);
			to = myDate.toChar('yyyy-mm-dd');

			range_bool = checkRange(from,"0","0",to,"0","0");

		}
		else{
			range_bool = checkRange(from, $("#f_hour").val(), $("#f_min").val(), to, $("#e_hour").val(), $("#e_min").val());
		}

	if(range_bool){
		console.log(range_bool);
		var obj = {
			title :$("#tit").val(),
			detail :$("#detail").val(),
			f_mon : from,

			f_hour : checker($("#f_hour").val()),
			f_min : checker($("#f_min").val()),

			check : $('#check').attr('checked'),

			e_hour : checker($("#e_hour").val()),
			e_min: checker($("#e_min").val()),

			e_mon : to
		};

		window.returnValue = obj;//backgroundに入力した内容を渡す
		//console.log(obj);
		window.close();
	}
	else{
		alert ("日時が正しくありません");
	}
	});

	$("#check").click(
			function () {
				if (!this.checked) {
					$("input.time").removeAttr("disabled");
				}
				else {
					$("input.time").attr("disabled", true);
				}
			});
});

