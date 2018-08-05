'use strict';
var CSSLOADED = [];/*css动态载入标识数组*/
var JSLOADED = [];/*javascript动态载入标识数组*/
var evalscripts = [];/*js相关*/
var CSSPATH = typeof CSSPATH == 'undefined' ? 'static/c/' : CSSPATH;
var VERHASH = typeof VERHASH == 'undefined' ? '1.0' : VERHASH;

function $id(id) {
	return document.getElementById(id) ? document.getElementById(id) : null;
}

function $C(classname, ele, tag) {
	var returns = [];
	var ele = isUndefined(ele) ? '' : ele;
	ele = typeof ele == 'object' ? ele : (ele !== '' ? ($id(ele) ? $id(ele) : null) : document);
	if(!ele)
		return returns;
	tag = tag || '*';
	if(ele.getElementsByClassName) {
		var eles = ele.getElementsByClassName(classname);
		if(tag != '*') {
			for (var i = 0, L = eles.length; i < L; i++) {
				if (eles[i].tagName.toLowerCase() == tag.toLowerCase()) {
					returns.push(eles[i]);
				}
			}
		} else {
			returns = eles;
		}
	} else {
		eles = ele.getElementsByTagName(tag);
		var pattern = new RegExp("(^|\\s)"+classname+"(\\s|$)");
		for (i = 0, L = eles.length; i < L; i++) {
			if (pattern.test(eles[i].className)) {
				returns.push(eles[i]);
			}
		}
	}
	return returns;
}

function isUndefined(val) {
	return typeof val == 'undefined' ? true : false;
}

function getFilename(filename) {
	return filename.substr(filename.lastIndexOf('/') + 1);
}

/**	功能 获取url参数值
 *	@param arg String 要获取的参数名
 *	@param url String url地址 可选,缺省为当前页面的地址
 *	@return String 要获取的参数值 参数不存在则为""
 */
function getUrlArg(arg, url){
	var arg = isUndefined(arg) ? '' : arg;
	var url = isUndefined(url) || url === '' ? document.location.href : url;
	if(url.indexOf('?') == -1 || arg == '')
		return '';
	url = url.substr(url.indexOf('?')+1);
	var expr = new RegExp('(\\w+)=(\\w+)','ig');
	var args = [];
	while((tmp = expr.exec(url)) != null){
		args[tmp[1]] = tmp[2];
	}
	return isUndefined(args[arg]) ? '' : args[arg];
}

function in_array(needle, haystack){
	if(typeof haystack == 'undefined')return false;
	if(typeof needle == 'string' || typeof needle == 'number'){
		for(var i in haystack){
			if(haystack[i] == needle){
				return true;
			}
		}
	}
	return false;
}

function trim(str) {
	return (str + '').replace(/(\s+)$/g, '').replace(/^\s+/g, '');
}

function preg_replace(search, replace, str, regswitch) {
	var regswitch = !regswitch ? 'ig' : regswitch;
	var len = search.length;
	for(var i = 0; i < len; i++) {
		re = new RegExp(search[i], regswitch);
		str = str.replace(re, typeof replace == 'string' ? replace : (replace[i] ? replace[i] : replace[0]));
	}
	return str;
}

function isLoaded(callback) {
	var callback = typeof callback == 'undefined' ? function(){} : callback;
	if(window.document.readyState == 'complete') {
		if(typeof callback == 'function') {
			callback();
		}
		return true;
	}
	setTimeout(isLoaded, 100, callback);
}

function isWeiXin(){
	if(window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	}
	return false;
}

function isQQ() {
	return /qq\s*\//i.test(window.navigator.userAgent);
}

function isIOS() {
	return (/(iphone|ipad|ios)/i).test(window.navigator.userAgent);
}

function isAndroid() {
	return /android[\/\s]+([\d\.]+)/i.test(window.navigator.userAgent)
}

function inIOSApp() {
	return isIOS() && / Typany/i.test(window.navigator.userAgent);
}

function inAndroidApp() {
	return typeof JSMethod != 'undefined' && typeof JSMethod.isAndroidApp == 'function' ? true : false;
}

function touchSupport() {
	return 'ontouchend' in document;
}

function screen_mode() {
	var mode;
	if('orientation' in window) {
		if(window.orientation != 90 && window.orientation != -90) {
			mode = 1;
		} else {
			mode = 0;
		}
	} else {
		if($(window).width() < $(window).height()) {
			mode = 1;
		} else {
			mode = 0;
		}
	}
	return mode;
}

function getEvent() {
	if(document.all) return window.event;
	func = getEvent.caller;
	while(func != null) {
		var arg0 = func.arguments[0];
		if (arg0) {
			if((arg0.constructor  == Event || arg0.constructor == MouseEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
				return arg0;
			}
		}
		func = func.caller;
	}
	return null;
}

function doane(event, preventDefault, stopPropagation) {
	var preventDefault = isUndefined(preventDefault) ? 1 : preventDefault;
	var stopPropagation = isUndefined(stopPropagation) ? 1 : stopPropagation;
	e = event ? event : window.event;
	if(!e) {
		e = getEvent();
	}
	if(!e) {
		return null;
	}
	if(preventDefault) {
		if(e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	}
	if(stopPropagation) {
		if(e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	}
	return e;
}

function hash(string, length) {
	var length = length ? length : 32;
	var start = 0;
	var i = 0;
	var result = '';
	var filllen = length - string.length % length;
	for(i = 0; i < filllen; i++){
		string += "0";
	}
	while(start < string.length) {
		result = stringxor(result, string.substr(start, length));
		start += length;
	}
	return result;
}

function stringxor(s1, s2) {
	var s = '';
	var hash = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var max = Math.max(s1.length, s2.length);
	for(var i=0; i<max; i++) {
		var k = s1.charCodeAt(i) ^ s2.charCodeAt(i);
		s += hash.charAt(k % 52);
	}
	return s;
}

/**  add javascript
 *  @param src String
 *  @param text String
 *	@param callback function
 *  @param reload Int 0/1
 *  @param targetid String possible value{htmlhead,htmlbody,...}
 *  @param charset String
 *  @return void
 */
function appendscript(src, text, callback, reload, targetid, charset) {
	var src = isUndefined(src) ? '' : src;
	var text = isUndefined(text) ? '' : text;
	var callback = isUndefined(callback) ? '' : callback;
	var targetid = (isUndefined(targetid) || targetid == '' || targetid == null) ? 'htmlhead' : targetid;
	var reload = isUndefined(reload) ? 0 : (parseInt(reload) == 1 ? 1 : 0);
	var charset = isUndefined(charset) ? '' : charset;
	var id = hash(src + text);
	if(!src && !text) return;
	if(targetid != 'htmlhead' && targetid != 'htmlbody' && !$id(targetid)) return;
	if(!reload && in_array(id, evalscripts)) return;
	if(reload && $id(id)) {
		$id(id).parentNode.removeChild($id(id));
	}

	evalscripts.push(id);
	var scriptNode = document.createElement("script");
	scriptNode.type = "text/javascript";
	scriptNode.id = id;
	scriptNode.charset = charset ? charset : '';
	try {
		if(src) {
			scriptNode.src = src;
			scriptNode.onloadDone = false;
			scriptNode.onload = function () {
				scriptNode.onloadDone = true;
				JSLOADED[src] = 1;
				if(callback)
					try{eval('callback()')} catch(e) {}
			};
			scriptNode.onreadystatechange = function () {
				if((scriptNode.readyState == 'loaded' || scriptNode.readyState == 'complete') && !scriptNode.onloadDone) {
					scriptNode.onloadDone = true;
					JSLOADED[src] = 1;
					if(callback)
						try{eval('callback()')} catch(e) {}
				}
			};
		} else if(text){
			scriptNode.text = text;
		}
		if(targetid == 'htmlhead') {
			document.getElementsByTagName('head')[0].appendChild(scriptNode);
		} else if(targetid == 'htmlbody') {
			document.getElementsByTagName('body')[0].appendChild(scriptNode);
		} else {
			$id(targetid).appendChild(scriptNode);
		}
	} catch(e) {}
}

/* 动态载入css */
/* 变量STYLEID */
function loadcss(cssname) {
	if(!CSSLOADED[cssname]) {
		if(!$id('css_' + cssname)) {
			var css = document.createElement('link');
			css.id = 'css_' + cssname,
			css.type = 'text/css';
			css.rel = 'stylesheet';
			css.href = CSSPATH + cssname + '.css?' + VERHASH;
			var headNode = document.getElementsByTagName("head")[0];
			headNode.appendChild(css);
		} else {
			$id('css_' + cssname).href = CSSPATH + cssname + '.css?' + VERHASH;
		}
		CSSLOADED[cssname] = 1;
	}
}

function getSiteUrl() {
	var url = window.location.pathname.substr(0,1) == '/' ? window.location.pathname : ('/'+window.location.pathname);
	url = url.replace(/\/[^\/]+$/, '/');
	url = window.location.protocol + '//' + window.location.host + url;
	url += url.substr(url.length-1, 1) == '/' ? '' : '/';
	return url;
}
