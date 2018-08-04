'use strict';
var toolBarHeight = inIOSApp() || inAndroidApp() ? 0 : 64;
var tabScroller,tabSwiper,boardScroller,emojiMaker;
var emojiBoardMode = 1;/*0:同类别emoji不可以相互挤掉,需要先删除然后才能添加至编辑器; 1:同类别emoji可以相互挤掉*/
var emojiItemActiveClass = 'grayfilter';
/*ref https://github.com/WICG/EventListenerOptions/pull/30*/
function isPassive() {
	var supportsPassiveOption = false;
	try {
		addEventListener("test", null, Object.defineProperty({}, 'passive', {
			get: function () {
				supportsPassiveOption = true;
			}
		}));
	} catch(e) {}
	return supportsPassiveOption;
}
/*初始化单个board*/
function initTabsBoard(index, xNums) {
	if(!$('#tabs-swiper .swiper-slide').eq(index).attr('initialized')) {
		var board = boards[index];
		var items = board.items;
		var yNums = Math.ceil($(items).size()/xNums);
		var boardScrollId = 'board-'+board.key+'-'+index;
		var _html = '';
		if($(items).size() > 0) {
			_html += '<div id="'+boardScrollId+'" class="iscroller-board"><div class="iscroller-inner"><ul><li class="cl">';
			for(var jj=0;jj<$(items).size();jj++) {
				var item = items[jj];
				var emojiItemId = board.key+'-'+jj;
				var animationStyle = '';
				var extraAttr = '';
				var extraClass = '';
				if((jj+1)%xNums == 0) {/*last col*/
					extraClass += ' col-last';
				}
				if((jj+1)%xNums == 1) {/*first col*/
					extraClass += ' col-first';
				}
				if((jj+1) <= xNums) {/*first row*/
					extraClass += ' row-first';
				}
				if(xNums*yNums - (jj+1) < xNums) {/*last row*/
					extraClass += ' row-last';
				}
				if(item.isdelete) {
					extraAttr += ' icon-delete="true"';
				}
				_html += '<span id="'+emojiItemId+'"'+extraAttr+' board-id="'+index+'" index-id="'+jj+'" emoji-key="'+board.key+'"'+(board.isface?' emoji-face="true"':'')+' class="emoji-item ani'+extraClass+'"'+animationStyle+'><span class="emoji-item-inner"><img src="'+item.icon+'" onerror="this.style.opacity=0;this.onerror=null;" /></span></span>';
				if((jj+1) % xNums == 0) {
					_html += '</li><li class="cl">';
				}
			}
			_html += '</li></div></div>';
		}
		$('#tabs-swiper .swiper-slide').eq(index).append(_html).attr({initialized:true});
		/*calculate size start*/
		var calculateBased = 0;/*基于宽度或高度[0:宽度,1:高度]*/
		var boardsListParam = {
			boardsBaseWidth: 750,
			boardsBaseHeight: 478,
			liBaseWidth: 88,
			liBaseMargin: 17,
			liFirstBaseMarginLeft: 26,
			liFirstBaseMarginTop: 24
		};
		if(calculateBased) {
			var liRealWidth = boardsListParam.liBaseWidth*$('#emaker-boards').height()/boardsListParam.boardsBaseHeight;
			var liRealMargin = boardsListParam.liBaseMargin*$('#emaker-boards').height()/boardsListParam.boardsBaseHeight;
			var liFirstRealMarginLeft = boardsListParam.liFirstBaseMarginLeft*$('#emaker-boards').height()/boardsListParam.boardsBaseHeight;
			var liFirstRealMarginTop = boardsListParam.liFirstBaseMarginTop*$('#emaker-boards').height()/boardsListParam.boardsBaseHeight;
		} else {
			var liRealWidth = boardsListParam.liBaseWidth*$(window).width()/boardsListParam.boardsBaseWidth;
			var liRealMargin = boardsListParam.liBaseMargin*$(window).width()/boardsListParam.boardsBaseWidth;
			var liFirstRealMarginLeft = boardsListParam.liFirstBaseMarginLeft*$(window).width()/boardsListParam.boardsBaseWidth;
			var liFirstRealMarginTop = boardsListParam.liFirstBaseMarginTop*$(window).width()/boardsListParam.boardsBaseWidth;
		}
		$('#'+boardScrollId+' ul>li>.emoji-item').each(function(idx){
			$(this).css({
				width:liRealWidth+'px',
				height:liRealWidth+'px',
				margin: liRealMargin+'px'
			});
			if(idx < xNums) {
				$(this).css({marginTop:liFirstRealMarginTop+'px'});
			}
			if(idx%xNums == 0) {
				$(this).css({marginLeft:liFirstRealMarginLeft+'px'});
			}
			if(idx%xNums == xNums-1) {
				$(this).css({marginRight:liFirstRealMarginLeft+'px'});
			}
		});
		/*calculate size end*/
		if($('#emaker-boards .emoji-item[emoji-face="true"]').size() > 0) {
			$('#'+boardScrollId+' .emoji-item[icon-delete!="true"][emoji-face!="true"]>.emoji-item-inner').css('background-image', 'url('+$('#emaker-boards .emoji-item.'+emojiItemActiveClass+'[emoji-face="true"]>span>img:first').attr('src')+')');
		}
		$('#'+boardScrollId+' span.emoji-item[icon-delete!="true"]').hammer().bind('click', function(e) {
			console.log('click emoji-item[icon-delete!="true"]');
			emakerAppendChild($(this).attr('id'));
			e.stopPropagation();
		});
		$('#'+boardScrollId+' span.emoji-item[icon-delete="true"]').hammer().bind('click', function(e) {
			console.log('click emoji-item[icon-delete="true"]');
			var emojiKey = $(this).attr('emoji-key');
			var boardId = $(this).attr('board-id');
			if(emojiKey == 'face') {
			} else {
				if(emojiMaker.hasChildByKey(emojiKey) && emojiMaker.removeChildByKey(emojiKey)) {
					$(this).removeClass('active');
				}
				$('#board-'+emojiKey+'-'+boardId).find('span.'+emojiItemActiveClass).removeClass(emojiItemActiveClass);
			}
			e.stopPropagation();
		});
		if(!boardScroller[index]) {
			boardScroller[index] = new IScroll('#'+boardScrollId, {
				scrollX: false,
				scrollY: true,
				mouseWheel: false,
				tap: true,
				click: true,
				scrollbars: 'custom',
				interactiveScrollbars: false,
				shrinkScrollbars: true,
				fadeScrollbars: false,
				bounceEasing: 'linear',
				bounceTime: 800
			});
		}
	}
}
/*初始化页面数据*/
function initPageData() {
	$('.emaker-tabs .tabs-wrapper').append(function(){
		var _html = '';
		_html += '<div id="tabs-list" class="iscroll-wrap"><div id="iscroller" class="iscroller"><ul class="iscroll-slider">';
		for(var ii=0;ii<$(tabs).size();ii++) {
			_html += '<li emoji-key="'+tabs[ii].key+'"'+(tabs[ii].icon?' style="background:url('+tabs[ii].icon+') no-repeat scroll 50% 50%;background-size:contain;"':'')+'><span><em></em></span>'+tabs[ii].name+'</li>';
		}
		_html += '</ul></div></div>';
		return _html;
	});
	$('.emaker-boards').append(function(){
		var _html = '<div id="tabs-swiper" class="swiper-container tabs-swiper-container"><div class="swiper-wrapper tabs-swiper-wrapper">';
		for(var ii=0;ii<$(tabs).size();ii++) {
			_html += '<div class="swiper-slide tabs-swiper-slide"></div>';
		}
		_html += '</div></div>';
		return _html;
	});
	boardScroller = [];
	for(var ii=0;ii<$(tabs).size();ii++) {
		boardScroller[ii] = null;
	}
}

/*初始化页面尺寸*/
function initPageSize() {
	var iscrollerWidth = 0;
	$('#tabs-list ul>li').each(function(){
		iscrollerWidth += $(this).outerWidth(true);
	});
	$('#iscroller').css({width:(iscrollerWidth<=$(window).width()?$(window).width()+2:iscrollerWidth)+'px'});
}

/*按比例初始化页面尺寸*/
function initPageSizeRatio() {
	var resize = function() {
		var windowWidth = $(window).width();
		var windowHeight;
		/*android's webview通过jQuery取窗口高度有异常，所以用此方法获取窗口高度*/
		if(inAndroidApp()) {
			if($(window).height() < 0.6*JSMethod.getWindowHeight()) {
				windowHeight = JSMethod.getWindowHeight()*452/534;
			} else {
				windowHeight = $(window).height();
			}
		} else {
			windowHeight = $(window).height();
		}
		var pageWidth = 375;
		var pageHeight = 1334 - (inAndroidApp()?128:0);
		var elements = {
			'#emaker-head' : {
				height: inAndroidApp() ? 0 : 128
			},
			'#emaker-drawboard' : {
				height: 636
			},
			'#emaker-tabs' : {
				height: '*'
			},
			'#emaker-boards' : {
				height: 478
			}
		}
		$('#emaker-head').css({height:windowHeight*elements['#emaker-head'].height/pageHeight+'px'});
		$('#emaker-drawboard').css({height:windowHeight*elements['#emaker-drawboard'].height/pageHeight+'px'});
		$('#emaker-boards').css({height:windowHeight*elements['#emaker-boards'].height/pageHeight+'px'});
		$('#emaker-tabs').css({
			height:(windowHeight-$('#emaker-head').height()-$('#emaker-drawboard').height()-$('#emaker-boards').height()-2)+'px'
		});
		$('.emojiMaker').css({width:$('#emaker-drawboard').width()+'px',height:$('#emaker-drawboard').height()+'px'});
	};
	resize();
	if(!$(window).attr('bindResized')) {
		$(window).resize(function(){resize()});
		$(window).attr('bindResized',true);
	}
	/*tabs start*/
	var windowWidth = $(window).width();
	var calculateBased = 0;/*基于宽度或高度[0:宽度,1:高度]*/
	var iscrollerWidth = 0;
	var tabsListParam = {
		iscrollerBaseWidth: 750,
		iscrollerBaseHeight: 90,
		liBaseWidth: 68,
		liBaseMargin: 15,
		liFirstBaseMargin: 24
	};
	if(calculateBased) {
		var liRealWidth = tabsListParam.liBaseWidth*$('#emaker-tabs').height()/tabsListParam.iscrollerBaseHeight;
		var liRealMargin = tabsListParam.liBaseMargin*$('#emaker-tabs').height()/tabsListParam.iscrollerBaseHeight;
		var liFirstRealMargin = tabsListParam.liFirstBaseMargin*$('#emaker-tabs').height()/tabsListParam.iscrollerBaseHeight;
	} else {
		var liRealWidth = tabsListParam.liBaseWidth*windowWidth/tabsListParam.iscrollerBaseWidth;
		var liRealMargin = tabsListParam.liBaseMargin*windowWidth/tabsListParam.iscrollerBaseWidth;
		var liFirstRealMargin = tabsListParam.liFirstBaseMargin*windowWidth/tabsListParam.iscrollerBaseWidth;
	}
	$('#tabs-list ul>li').each(function(idx){
		if(idx == 0) {
			$(this).css({width:liRealWidth+'px',margin:'0 '+liRealMargin+'px 0 '+liFirstRealMargin+'px'});
		} else if(idx == $('#tabs-list ul>li').size()-1) {
			$(this).css({width:liRealWidth+'px',margin:'0 '+liFirstRealMargin+'px 0 '+liRealMargin+'px'});
		} else {
			$(this).css({width:liRealWidth+'px',margin:'0 '+liRealMargin+'px 0 '+liRealMargin+'px'});
		}
		iscrollerWidth += Math.ceil($(this).outerWidth(true));
	});
	$('#iscroller').css({width:(iscrollerWidth<=windowWidth?windowWidth+2:iscrollerWidth)+'px'});
	/*tabs end*/
}

var ST_SHOWALERT;
function showAlert(msg, callback, timeout, title) {
	var msg = typeof msg == 'undefined' ? '' : msg;
	if(inIOSApp() || inAndroidApp()) {
		alert(msg);
		if(typeof callback == 'function'){callback()}
		return;
	}
	var timeout = typeof timeout == 'undefined' ? 0 : parseFloat(timeout);
	timeout = isNaN(timeout) ? 0 : timeout;
	var title = typeof title == 'undefined' ? '\u63d0\u793a\u6d88\u606f' : title;
	var id = 'js-menu-alert';
	var selector = '#js-menu-alert';
	var id_cover = 'js-menu-alert-cover';
	var selector_cover = '#js-menu-alert-cover';
	var hide = function() {
		$(selector).remove();
		$(selector_cover).remove();
		try{clearTimeout(ST_SHOWALERT)}catch(e){}
		if(typeof callback == 'function'){callback()}
	}
	if($(selector).size() > 0) {hide()}
	var jsalert_cover = '';
	jsalert_cover = '<div id="'+id_cover+'" class="js-menu-cover"></div>';
	var jsalert = '';
	jsalert += '<div id="'+id+'" class="js-menu alert" title="'+title+'">';
	jsalert += '<div class="js-menu-body">'+msg+'</div>';
	jsalert += '<div class="js-menu-foot">';
	jsalert += '<span class="js-menu-button js-menu-btn-mid js-menu-btn-yes" clickbtn="true">确认</span>';
	jsalert += '</div>';
	jsalert += '</div>';
	$('body').append(jsalert_cover).append(jsalert);
	$(selector_cover).css({
		width:'100%',
		height:($(window).height()>$(document).height()?$(window).height():$(document).height())+'px'
	});
	$(selector).css({
		width: 0.6*$(window).width()>320?320:0.6*$(window).width()+'px',
		height: 0.16*$(window).height()<100?100:0.16*$(window).height()+'px'
	});
	$(selector).css({
		left: ($(window).width()-$(selector).width())/2+'px',
		top: ($(window).height()-$(selector).height())/2+'px'
	});
	$(selector).find('.js-menu-body').css({
		width: $(selector).width()+'px',
		height: 0.6*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-foot').css({
		width: $(selector).width()+'px',
		height: 0.4*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-button').css({
		lineHeight:  0.4*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-btn-yes').hammer().bind('click', function(){
		hide();
	});
	if(timeout > 0) {
		ST_SHOWALERT = setTimeout(function(){hide()}, timeout*1000);
	}
}
function showConfirm(msg, okFunc, canFunc, title) {
	var msg = typeof msg == 'undefined' ? '' : msg;
	var okFunc = typeof okFunc == 'function' ? okFunc : null;
	var canFunc = typeof canFunc == 'function' ? canFunc : null;
	var title = typeof title == 'undefined' ? '\u63d0\u793a\u6d88\u606f' : title;

	if(inIOSApp()) {
		if(confirm(msg)) {
			if(typeof okFunc == 'function'){okFunc()}
		} else {
			if(typeof canFunc == 'function'){canFunc()}
		}
		return;
	}

	var id = 'js-menu-confirm';
	var selector = '#js-menu-confirm';
	var id_cover = 'js-menu-confirm-cover';
	var selector_cover = '#js-menu-confirm-cover';
	var hide = function() {
		$(selector).remove();
		$(selector_cover).remove();
	}
	if($(selector).size() > 0) {
		hide();
	}
	var jsconfirm_cover = '';
	jsconfirm_cover = '<div id="'+id_cover+'" class="js-menu-cover"></div>';
	var jsconfirm = '';
	jsconfirm += '<div id="'+id+'" class="js-menu alert" title="'+title+'">';
	jsconfirm += '<div class="js-menu-body">'+msg+'</div>';
	jsconfirm += '<div class="js-menu-foot">';
	jsconfirm += '<span class="js-menu-button js-menu-btn-left js-menu-btn-yes" clickbtn="true">确认</span>';
	jsconfirm += '<span class="js-menu-button js-menu-btn-right js-menu-btn-no" clickbtn="true">取消</span>';
	jsconfirm += '</div>';
	jsconfirm += '</div>';

	$('body').append(jsconfirm_cover).append(jsconfirm);
	$(selector_cover).css({
		width:'100%',
		height:($(window).height()>$(document).height()?$(window).height():$(document).height())+'px',
	});

	$(selector).css({
		width: 0.6*$(window).width()>320?320:0.6*$(window).width()+'px',
		height: 0.16*$(window).height()<100?100:0.16*$(window).height()+'px'
	});
	$(selector).css({
		left: ($(window).width()-$(selector).width())/2+'px',
		top: ($(window).height()-$(selector).height())/2+'px'
	});
	$(selector).find('.js-menu-body').css({
		width: $(selector).width()+'px',
		height: 0.6*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-foot').css({
		width: $(selector).width()+'px',
		height: 0.4*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-button').css({
		lineHeight:  0.4*$(selector).height()+'px'
	});
	$(selector).find('.js-menu-btn-yes').hammer().bind('click', function(){
		hide();
		if(typeof okFunc == 'function'){okFunc()}
	});
	$(selector).find('.js-menu-btn-no').hammer().bind('tap', function(){
		hide();
		if(typeof canFunc == 'function'){canFunc()}
	});
}
