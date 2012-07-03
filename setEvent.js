function isValidDate(y,m,d){
	var di = new Date(y,m-1,d);
	if(di.getFullYear() == y && di.getMonth() == m-1 && di.getDate() == d){
		return true;
	}
	return false;
}

function checkDateRange(yf, mf, df, yt, mt, dt){
	var dayf = new Date(yf, mf-1, df);
	var dayt = new Date(yt, mt-1, dt);

	if( (dayt.getTime() - dayf.getTime() ) < 0 ){
		return false;
	}
	return true;
}

function time_checker(h, m){
	//console.log(h,m);
	if(parseInt(h,10) < 24 && parseInt(h,10) >= 0 && parseInt(m,10) < 60 && parseInt(m,10) >= 0){
		return true
	}
	return false;
}

function checker(ch){
	if(parseInt(ch,10) < 10){
		ch= "0"+ parseInt(ch,10);
	}
	return ch;
}

$(document).ready(function(){

	jQuery("#formID").validationEngine('attach');
	window.returnValue = false;

	$("#tit").val(window.dialogArguments[0]);

	$("#f_year").val(window.dialogArguments[6]);

	$("#f_mon").val(window.dialogArguments[1]);
	$("#f_day").val(window.dialogArguments[2]);

	$("#e_mon").val(window.dialogArguments[1]);
	$("#e_day").val(window.dialogArguments[2]);

	$("#f_hour").val(window.dialogArguments[3]);
	$("#f_min").val(window.dialogArguments[4]);

	$("#e_hour").val(window.dialogArguments[3]);
	$("#e_min").val(window.dialogArguments[4]);

	$("#main_text").val(window.dialogArguments[5]);

	$("#sub").click(function(){

		var days = new Array($("#f_year").val(), $("#f_mon").val(), $("#f_day").val(), $("#e_mon").val(), $("#e_day").val());
		var times = new Array($("#f_hour").val(), $("#f_min").val(), $("#e_hour").val(), $("#e_min").val());

		var f_day_bool =  isValidDate(parseInt(days[0]),parseInt(days[1]),parseInt(days[2]));
		var e_day_bool =  isValidDate(parseInt(days[0]),parseInt(days[3]),parseInt(days[4]));

		var range_bool = checkDateRange(parseInt(days[0]),parseInt(days[1]),parseInt(days[2]),parseInt(days[0]),parseInt(days[3]),parseInt(days[4]));
		var f_time_bool;
		var e_time_bool;


		if ($('#check').attr('checked')){
			days[4]= parseInt(days[4])+1;
			f_time_bool = true;
			e_time_bool = true;
		}
		else{	
			f_time_bool = time_checker(times[0],times[1]);
			e_time_bool = time_checker(times[2],times[3]);
		}
		//console.log(f_time_bool);
		if(f_time_bool && e_time_bool && f_day_bool && e_day_bool && range_bool){
			var obj = {
				title :checker($("#tit").val()),

				f_mon : checker($("#f_mon").val()),
				f_day : checker($("#f_day").val()),

				f_hour : checker($("#f_hour").val()),
				f_min : checker($("#f_min").val()),

				check : $('#check').attr('checked'),

				e_hour : checker($("#e_hour").val()),
				e_min: checker($("#e_min").val()),

				e_mon : checker($("#e_mon").val()),
				e_day : checker(days[4]),

				f_year : checker($("#f_year").val()),

			};

			window.returnValue = obj;//backgroundに入力した内容を渡す
			window.close();
		}
		else{alert ("日時が正しくありません");}
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

