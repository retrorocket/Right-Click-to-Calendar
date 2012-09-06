/*
 * 	exDate 1.0 - jQuery plugin
 *	written by Cyokodog	
 *
 *	Copyright (c) 2009 Cyokodog (http://d.hatena.ne.jp/cyokodog/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */
(function($j){
	$j.ex=$j.ex||{};
	$j.ex.lpad=function(s,l,pad){
		var pads='';
		pad=(pad==undefined)?' ':pad;
		for(var i=0;i<l;i++)pads+=pad;		
		s=pads+s;
		return s.slice(s.length-l);
	};
	$j.exDate=function(dateStr,format){
		if(!(this instanceof $j.exDate))
			return new $j.exDate(dateStr,format);
		return this.toDate(dateStr,format);
	};
	$j.extend($j.exDate.prototype,{
		toDate:function(dateStr,format){
			var o=this;
			var date=new Date();
			if(dateStr!=undefined){
				var tmp={
					y:date.getFullYear(),
					m:1,
					d:1,
					h:0,
					mi:0,
					s:0
				};
				(format||o._defaultFormat).replace(o._exprMatch,
					function(key,pos,format){
						var num=dateStr.substr(pos,key.replace('hh24','hh').length)-0;
						var exp=o._expr[key];
						if(exp)tmp[exp.type]=exp.toDate?exp.toDate(num):num;
					}
				);
				date=new Date(tmp.y,tmp.m,tmp.d,tmp.h,tmp.mi,tmp.s);
			}
			var methods=['lastDay','addMonths','toChar','toDate'];
			for(var i=0;i<methods.length;i++)
				o._bindMethod(o,date,methods[i]);
			return o._date=date;
		},
		toChar:function(format){
			var o=this;
			return (format||o._defaultFormat).replace(o._exprMatch,
				function(key,pos,format){
					var expr=o._expr[key];
					return expr && expr.toChar?expr.toChar(o):key;
				}
			);
		},
		lastDay:function(){
			var o=this;
			var y=o.toChar('yyyy')-0;
			var m=o.toChar('mm')-0+1;
			if(m>12){m=1;y+=1;}
			var d=$j.exDate($j.ex.lpad(y,4,'0')+'/'+$j.ex.lpad(m,2,'0')+'/'+'01');
			d.setTime(d.getTime()-60*60*24*1000);
			o._applyTime(o,d);
			return d;
		},
		addMonths:function(month){
			var o=this;
			var csr=o.toChar('yyyymmdd');
			var fg=month<0?-1:1;
			month=Math.abs(month);
			var y=Math.floor(month/12);
			var m=month%12;
			y=csr.substr(0,4)-0+y*fg;
			m=csr.substr(4,2)-0+m*fg;
			var addDay=$j.exDate($j.ex.lpad(y,4,'0')+$j.ex.lpad(m,2,'0')+'01','yyyymmdd');
			var lastDay=addDay.lastDay().toChar('dd');
			d=csr.substr(6,2);
			d=lastDay<d?lastDay:d;
			var date=$j.exDate(
				$j.ex.lpad(y,4,'0')+$j.ex.lpad(m,2,'0')+d,
				'yyyymmdd'
			);
			o._applyTime(o,date);
			return date;
		},
		_defaultFormat:'yyyy/mm/dd',
		_dafaultDayFormat:['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		_bindMethod:function(obj,date,method){
			date[method]=function(){
				return obj[method].apply(obj,arguments);
			}
		},
		_applyTime:function(from,to){
			var o=this;
			to.setHours(from.toChar('hh24'));
			to.setMinutes(from.toChar('mi'));
			to.setSeconds(from.toChar('ss'));
		},
		_exprMatch:'',
		_expr:{
			'yyyy':{
				type:'y',
				toChar:function(o){return o._date.getFullYear();}
			},
			'mm':{
				type:'m',
				toChar:function(o){
					return $j.ex.lpad(o._date.getMonth()+1,2,'0');
				},
				toDate : function(n){return n-1}
			},
			'dd':{
				type:'d',
				toChar:function(o){
					return $j.ex.lpad(o._date.getDate(),2,'0');
				}
			},
			'hh24':{
				type:'h',
				toChar:function(o){
					return $j.ex.lpad(o._date.getHours(),2,'0');
				}
			},
			'hh':{
				type:'h',
				toChar:function(o){
					return $j.ex.lpad(o._date.getHours()%12,2,'0');
				}
			},
			'mi':{
				type:'mi',
				toChar:function(o){
					return $j.ex.lpad(o._date.getMinutes(),2,'0');
				}
			},
			'ss':{
				type:'s',
				toChar:function(o){
					return $j.ex.lpad(o._date.getSeconds(),2,'0');
				}
			},
			'day':{
				type:'day',
				toChar:function(o){
					return o._dafaultDayFormat[o._date.getDay()];
				}
			}
		}
	});
	(function(proto){
		s='';
		for(var i in proto._expr)s+=('|'+i);
		proto._exprMatch=new RegExp(s.slice(1),'g');
	})($j.exDate.prototype);
})(jQuery);
