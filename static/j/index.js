!function(){}
'use strict';
$(function(){
	document.addEventListener('touchmove', function (e){e.preventDefault()},isPassive()?{capture:false,passive:false}:false);
	$(document).on(touchSupport()?'touchstart':'mousedown', '*[clickbtn="true"]', function(){
		$(this).addClass('clickbtn');
	}).on(touchSupport()?'touchend':'mouseup', '*[clickbtn="true"]', function(){
		$(this).removeClass('clickbtn');
	});
});
$(window).load(function(){
	initPageData();
	inIOSApp()?initPageSize():initPageSizeRatio();
	tabScroller = new IScroll('#tabs-list', {
		scrollX: true,
		scrollY: false,
		mouseWheel: false,
		tap: true,
		click: true
	});
	var xNums;/*xNums:每行个数*/
	if(inIOSApp()&&$(window).height() <= 480) {
		var xNums = 5;
	} else {
		var xNums = 6;
	}
	tabSwiper = new Swiper('#tabs-swiper', {
		direction: 'horizontal',
		touchRatio: 1,
		threshold: 5,
		touchAngle: 15,
		mousewheelControl: false,
		keyboardControl: false,
		loop: false,
		noSwipingClass: 'no-swiping',
		onInit: function(swiper){
			$('#iscroller>ul>li').eq(swiper.activeIndex).addClass('curr');
			initTabsBoard(swiper.activeIndex, xNums);
		},
		onTouchStart: function(swiper,event) {},
		onSliderMove: function(swiper,event) {
			$('.iScrollHorizontalScrollbar,.iScrollVerticalScrollbar').hide();
		},
		onTouchEnd: function(swiper,event) {},
		onTransitionStart: function(swiper) {
			$('.iScrollHorizontalScrollbar,.iScrollVerticalScrollbar').hide();
		},
		onTransitionEnd: function(swiper) {
			$('.iScrollHorizontalScrollbar,.iScrollVerticalScrollbar').show();
			tabScrollerScrollToIndex(swiper.activeIndex);
		},
		onSlideChangeStart: function(swiper){
			initTabsBoard(swiper.activeIndex, xNums);
		},
		onSlideChangeEnd: function(swiper){}
	});
	$('#iscroller>ul>li').hammer().bind('click',function(e){
		console.log('click tabs li');
		var index = $('#iscroller>ul>li').index(this);
		$('#iscroller>ul>li').removeClass('curr').eq(index).addClass('curr');
		tabSwiper.slideTo(index);
		e.stopPropagation();
	});
	var faceHeight;
	setTimeout(function(){
		faceHeight = (200*$('#emaker-drawboard').height()/318).toFixed(5);
		emojiMaker = $('#emaker-drawboard').emojiMaker({baseWidth:400,baseHeight:400,padding:0,imgExportFormat:'png',imgExportQuality:100,yScaleRatio:(faceHeight/400).toFixed(5)}).data('emojiMaker');
		emakerAppendChild($('#tabs-swiper>.swiper-wrapper>.swiper-slide:first .emoji-item[icon-delete!="true"]:first').attr('id'), false, false);
	},10);

	$('.btn-save').hammer().bind('click', function() {
		var $img = $('<img src="'+emojiMaker.save()+'"/>');
		$('#emojiMaker-preview').remove();
		$('#wrapper').append('<div id="emojiMaker-preview" class="emojiMaker-preview"></div>');
		$('#emojiMaker-preview').append($img).append('<a style="position:absolute;right:5%;top:2.5%;" href="javascript:;" onclick="javascript:$(\'#emojiMaker-preview\').hide();">关闭</a><p class="xcenter" style="position:absolute;left:50%;bottom:5%">长按图片可以保存。</p>');
	});
	$('.btn-reset').hammer().bind('click', function() {
		emojiMaker.isChanged() && showConfirm('确定要重置吗？', function(){reset()});
	});
	if(inIOSApp()){setTimeout(function(){window.webkit.messageHandlers.hideLoadingIndicator.postMessage('')}, 100)}
});

/** 控制tabScroller激活当前tab并将当前tab惰性滚动至可见区域
 *	@param index Integer 当前索引值
 */
function tabScrollerScrollToIndex(index) {
	$('#iscroller>ul>li').removeClass('curr').eq(index).addClass('curr');
	var timeout = 600;
	var currElementOffsetX = [0,0];
	for(var i=0;i<index;i++) {
		currElementOffsetX[0] += $('#iscroller>ul>li').eq(i).outerWidth(true);
	}
	currElementOffsetX[1] = currElementOffsetX[0] + $('#iscroller>ul>li').eq(index).outerWidth(true);
	if(tabScroller.x + currElementOffsetX[0] < 0) {
		tabScroller.scrollBy( -1*(currElementOffsetX[0] + tabScroller.x), 0, timeout);
	}
	if(tabScroller.x + currElementOffsetX[1] > $('#tabs-list').width()) {
		tabScroller.scrollBy( -1*(currElementOffsetX[1] + tabScroller.x - $('#tabs-list').width()), 0, timeout);
	}
}

function emakerAppendChild(id, ani, changed) {
	if(emojiMaker.isLocked()) {
		return false;
	}
	var id = isUndefined(id) ? '' : id;
	var ani = isUndefined(ani) ? true : (ani?true:false);
	var changed = isUndefined(changed) ? true : (changed?true:false);
	if(id.length < 1) {
		return false;
	}
	var em = $((id.indexOf('#')==0?'':'#')+id);
	if((emojiBoardMode == 0 && emojiMaker.hasChildByKey($(em).attr('emoji-key')))) {
		return false;
	} else {
		var emojiId = 'maker-'+$(em).attr('id');
		var emojiFace = $(em).attr('emoji-face');
		if(emojiMaker.hasChild(emojiId)) {
			return false;
		}

		if(!emojiFace && emojiMaker.findFaceChild().size() < 1) {
			showAlert('No Face Selected');
			return false;
		}

		if(emojiMaker.hasChildByKey($(em).attr('emoji-key'))) {
			emojiMaker.removeChildByKey($(em).attr('emoji-key'));
			$('.emaker-boards .emoji-item[emoji-key="'+$(em).attr('emoji-key')+'"]').removeClass(emojiItemActiveClass);
		}
		var boardId = $(em).attr('board-id');
		var indexId = $(em).attr('index-id');
		var emojiKey = $(em).attr('emoji-key');
		var emojiSrc = boards[boardId]['items'][indexId]['src'];
		var zindex = boards[boardId]['zindex'];
		var dragged = boards[boardId]['dragged'];
		var params = {src:emojiSrc,zindex:zindex,dragged:dragged,ani:ani,changed:changed,yAutosize:true};
		if(boards[boardId]['items'][indexId]['pos']) {
			var pos = boards[boardId]['items'][indexId]['pos'];
			if(pos.left == '50%' || pos.left == 'center') {
				params.xCenter = true;
			} else {
				params.xCenter = false;
			}
			if(pos.top == '50%' || pos.top == 'center') {
				params.yCenter = true;
			} else {
				params.yCenter = false;
			}
			params.left = pos.left;
			params.top = pos.top;
		}
		if(emojiMaker.appendChild($('<img id="'+emojiId+'"'+(emojiFace?' emoji-face="true"':'')+' emoji-key="'+emojiKey+'" />'),params,function(){if(changed)hasEdited=true},function(params){$('#'+(params.id).replace('maker-','')).removeClass(emojiItemActiveClass)})) {
			$(em).addClass(emojiItemActiveClass);
			if($(em).attr('emoji-face')) {
				$('.emaker-boards .emoji-item[emoji-face!="true"][icon-delete!="true"]>.emoji-item-inner').css('background-image','url('+$(em).children().children('img:first').attr('src')+')');
			}
			$('#board-'+emojiKey+'-'+boardId+' .emoji-item[icon-delete="true"]').addClass('active');
		}
	}
	return true;
}

var dataForWeixinShare = {
    title: 'EmojiMaker',
    content: '表情在线制作',
    imgurl: 'https://www.bolatoo.com/h5/emojimaker/static/i/share.png',
    contenturl: 'https://www.bolatoo.com/h5/emojimaker/?ADTAG=tec.wc.sh'
}
var dataForWeixinShareTmp = {};
var bindShared = false;
function bindShare(dataForShare) {
	var title = dataForShare.title;
	var desc = dataForShare.content;
	var link = dataForShare.contenturl;
	var imgUrl = dataForShare.imgurl;
	wx.onMenuShareTimeline({
		title: desc,
		link: link,
		imgUrl: imgUrl,
		success: function (res) {
			try{MtaH5.clickStat('wxTimeline_succ')}catch(e){}
		},
		cancel: function (res) {
			try{MtaH5.clickStat('wxTimeline_cancel')}catch(e){}
		},
		fail: function (res) {
			try{MtaH5.clickStat('wxTimeline_fail')}catch(e){}
		}
	});
	wx.onMenuShareAppMessage({
		title: title,
		desc: desc,
		link: link,
		imgUrl: imgUrl,
		success: function (res) {
			try{MtaH5.clickStat('wxAppmessage_succ')}catch(e){}
		},
		cancel: function (res) {
			try{MtaH5.clickStat('wxAppmessage_cancel')}catch(e){}
		},
		fail: function (res) {
			try{MtaH5.clickStat('wxAppmessage_fail')}catch(e){}
		}
	});
	wx.onMenuShareQQ({
		title: title,
		desc: desc,
		link: link,
		imgUrl: imgUrl,
		success: function (res) {
			try{MtaH5.clickStat('wxShareQQ_succ')}catch(e){}
		},
		cancel: function (res) {
			try{MtaH5.clickStat('wxShareQQ_cancel')}catch(e){}
		},
		fail: function (res) {
			try{MtaH5.clickStat('wxShareQQ_fail')}catch(e){}
		}
	});
	wx.onMenuShareWeibo({
		title: title,
		desc: desc,
		link: link,
		imgUrl: imgUrl,
		success: function (res) {
			try{MtaH5.clickStat('wxShareWeibo_succ')}catch(e){}
		},
		cancel: function (res) {
			try{MtaH5.clickStat('wxShareWeibo_cancel')}catch(e){}
		},
		fail: function (res) {
			try{MtaH5.clickStat('wxShareWeibo_fail')}catch(e){}
		}
	});
	wx.onMenuShareQZone({
		title: title,
		desc: desc,
		link: link,
		imgUrl: imgUrl,
		success: function (res) {
			try{MtaH5.clickStat('wxShareQzone_succ')}catch(e){}
		},
		cancel: function (res) {
			try{MtaH5.clickStat('wxShareQzone_cancel')}catch(e){}
		},
		fail: function (res) {
			try{MtaH5.clickStat('wxShareQzone_fail')}catch(e){}
		}
	});
}

$(function () {
    dataForWeixinShareTmp = $.extend(dataForWeixinShareTmp, dataForWeixinShare);
    if (isWeiXin()) {
        appendscript('//res.wx.qq.com/open/js/jweixin-1.2.0.js', '', function () {
            appendscript('//www.bolatoo.com/api/weixin/jssdk/wxconfig.php?rurl=' + encodeURIComponent(document.location.href), '', function () {
                var wxconfig = window['wxconfig'] || '';
                if (wxconfig) {
                    wx.config({
                        appId: wxconfig.appId,
                        timestamp: wxconfig.timestamp,
                        nonceStr: wxconfig.nonceStr,
                        signature: wxconfig.signature,
                        jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone']
                    });
                    wx.ready(function () {
                        bindShare(dataForWeixinShareTmp);
												bindShared = true;
                    });
                }
            });
        });
    }
});
