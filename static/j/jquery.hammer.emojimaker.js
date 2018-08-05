/*
  jquery.hammer.emojimaker.js
  v1.0.0
  blueprinted@qq.com
  2016-12-07
 */
(function(factory){
	'use strict';
	//noinspection JSUnresolvedVariable
	if (typeof define === 'function' && define.amd) { // jshint ignore:line
		// AMD. Register as an anonymous module.
		define(['jquery', 'hammer'], factory); // jshint ignore:line
	} else { // noinspection JSUnresolvedVariable
		if (typeof module === 'object' && module.exports) { // jshint ignore:line
			// Node/CommonJS
			// noinspection JSUnresolvedVariable
			module.exports = factory(require('jquery'), require('hammer')); // jshint ignore:line
		} else {
			// Browser globals
			factory(window.jQuery, window.Hammer);
		}
	}
}(function ($, Hammer) {
	'use strict';
	var emojiMaker,hasFileAPISupport;
	var isIE = function (ver) {
        // check for IE versions < 11
        if (navigator.appName !== 'Microsoft Internet Explorer') {
            return false;
        }
        if (ver === 10) {
            return new RegExp('msie\\s' + ver, 'i').test(navigator.userAgent);
        }
        var div = document.createElement("div"), status;
        div.innerHTML = "<!--[if IE " + ver + "]> <i></i> <![endif]-->";
        status = div.getElementsByTagName("i").length;
        document.body.appendChild(div);
        div.parentNode.removeChild(div);
        return status;
    };
	hasFileAPISupport = function () {
        return !!(window.File && window.FileReader);
    };

	emojiMaker = function(element, options) {
		var self = this;
		self.$element = $(element);
		if (self._validate()) {
			self._init(options);
		} else {
			self.$element.removeClass('emojiMaker-loading');
		}
	}
	emojiMaker.prototype = {
		constructor: emojiMaker,
		_init: function (options) {
			var self = this, $el = self.$element;
            self.options = options;
			self.children = {};
			self.yScaleRatio = self.options.yScaleRatio;
			self.changed = false;
			self.locked = false;/*appendChild lock*/
			self.$container = $('<div class="emojiMaker"></div>');
			$(self.$container).css({width:$($el).width()+'px',height:$($el).height()+'px'}).appendTo($($el));
			self.originPointX = ($($el).width()-400*self.yScaleRatio )/2;
			self.originPointY = ($($el).height()-400*self.yScaleRatio )/2;
		},
		_validate: function() {
            var self = this, $exception;
            if (!hasFileAPISupport() && !isIE(9)) {
				$exception = '<div class="help-block alert alert-warning">' +
					'<h4>Browser is not support emojiMaker tool.</h4>' +
					'</div>';
				self.$element.after($exception);
				return false;
			}
			return true;
        },
		_isFaceAttr: function(attr) {
			return typeof attr == 'undefined' || attr == 'false' ? false : true;
		},
		isChanged: function() {
			return this.changed;
		},
		setChanged: function() {
			return this.changed = false;
		},
		isLocked: function() {
			return this.locked;
		},
		removeChild: function(id) {
			var self = this;
			self.$container.find('#'+id).remove();
			delete self.children[id];
			return true;
		},
		removeAllChildren: function() {
			var self = this;
			var counter = 0;
			for(var id in self.children) {
				self.removeChild(id);
				counter++;
			}
			return counter;
		},
		appendChild: function($ele, params, succFunc, failFunc) {
			var self = this;
			var $container = self.$container;
			var $ele = $($ele);
			var params = params || {};
			var eId = $ele.attr('id') || params.id;
			if((eId ? $ele.attr('id', eId) : null) === null) {
				return false;
			}
			if($container.find($ele).size() > 0 || self.children[eId]) {
				return false;
			}
			self.locked = true;
			$ele.addClass('maker-emoji-item').css({
				display: 'none',
				position:'absolute',
				left: 0,
				top: 0,
				zIndex: params.zindex ? params.zindex : 0
			}).appendTo($container);
			//When rendering new parts, clear them first
		  self._clearOutlineAndBtn($container);
			$ele[0].onload = function() {
				$ele.attr({'real-width':this.width,'real-height':this.height,yScaleRatio:self.yScaleRatio});
				if(params.yAutosize) {/*按y方向自动适配宽高*/
					$ele.css({
						width: 'auto',
						height: Math.round($ele.height()*self.yScaleRatio)
					});
				}
				if(params.xCenter) {
					$ele.css({left: ($container.width()-$ele.width())/2+'px'});
				} else {
					if(self._isFaceAttr($ele.attr('emoji-face'))) {
						$ele.css({left: (self.originPointX+params.left*self.yScaleRatio)+'px'});
					} else {
						$ele.css({
							left: (self.originPointX+params.left*self.yScaleRatio)+'px'
						});
					}
				}
				if(params.yCenter) {
					$ele.css({top: ($container.height()-$ele.height())/2+'px'});
				} else {
					if(self._isFaceAttr($ele.attr('emoji-face'))) {
						$ele.css({top: (self.originPointY+params.top*self.yScaleRatio)+'px'});
					} else {
						$ele.css({
							top: (self.originPointY+params.top*self.yScaleRatio)+'px'
						});
					}
				}
				$ele.data('hammer', new Hammer($ele[0]), {});//hammer instance
				$ele.attr({posX:parseInt($ele.css('left')),posY:parseInt($ele.css('top')),lastPosX:parseInt($ele.css('left')),lastPosY:parseInt($ele.css('top'))});

				//after the animation ends, create the outline and buttons
				$ele.on("animationend webkitAnimationEnd",function(){
						if(!self._isFaceAttr($ele.attr('emoji-face'))){
						self._createOutlineAndBtn($ele,$container,self);
						//bind zoom
						self._zoom($ele, $container,"proportion")
						//tap cancelBtn and delete
						self._cancelEle($ele,$container,self)
						}
				})

				/*bind drag*/
				if(params.dragged) {
					$ele.data('hammer').get('pan').set({threshold:1});/*设置灵敏度*/
					var isCenter = true;
					$ele.data('hammer').on('panstart panmove panend', function (e) {
						e.preventDefault();
						if($(this).attr('dragabled') == 'false') {
						} else {
							switch (e.type) {
								case 'panstart':
									isCenter = self._isCenter($ele);
	                self._drawBgLine();
	                self._clearOutlineAndBtn($container)
	                self._createOutlineAndBtn($ele,$container,self);
	                //tap cancelBtn and delete
	                self._cancelEle($ele,$container,self);
	                //bind zoom
	                self._zoom($ele, $container,"proportion");
									break;
								case 'panmove':
									var posX = e.deltaX + parseInt($ele.attr('lastPosX'));
									posX = posX < 0 ? 0 : (posX > $container.width() - $ele.width() ? $container.width() - $ele.width() : posX);/*limited boundary*/
									var posY = e.deltaY + parseInt($ele.attr('lastPosY'));
									posY = posY < 0 ? 0 : (posY > $container.height() - $ele.height() ? $container.height() - $ele.height() : posY);/*limited boundary*/
									$ele.attr({
										posX: posX,
										posY: posY
									});
									//change the position of the button
                  self._changeBtnPos($ele);
                  //set outline
                  self._setOutline($ele);
									break;
								case 'panend':
									// console.log(e.deltaX)
									//close to the vertical line
									if(!isCenter){
											var $face = $("[emoji-key='face']");
											var centerX = parseInt($face.attr('posX'))+$face.width()/2;
											if(Math.abs(parseInt($ele.attr('posX'))+$ele.width()/2 - centerX) < self.options.offsetDistance ){
													$ele.css({
															"outline":"1px solid #4B53E5",
															"left": centerX- parseInt($ele.width())/2
													});
													$ele.attr({
															posX: centerX- parseInt($ele.width())/2
													});
													//change the position of the button
													self._changeBtnPos($ele);
											}else{
													$ele.css({"outline":"1px solid #B1B8CC"});
											}
									}
									$ele.attr({
										lastPosX: parseInt($ele.attr('posX')),
										lastPosY: parseInt($ele.attr('posY'))
									});
									//clear background line
                  self._clearBgLine();
									break;
							}
							$ele.css({left:$ele.attr('posX')+'px',top:$ele.attr('posY')+'px'});
						}
					});
				}

				//tap emoji
        $ele.data('hammer').on('tap', function (e) {
            e.preventDefault();

            if(self._isFaceAttr($ele.attr('emoji-face'))){
                return;
            }
            //clear outline and button
            self._clearOutlineAndBtn($container)

            //create outline and button
            self._createOutlineAndBtn($ele,$container,self);

            //bind zoom
            self._zoom($ele, $container,"proportion")

            //tap cancelBtn and delete
            self._cancelEle($ele,$container,self);
            var emojiKey = $ele.attr("emoji-key")

            //click and scroll
            var index = $('#iscroller>ul>li').index($("li[emoji-key="+emojiKey+"]"));
            $('#iscroller>ul>li').removeClass('curr').eq(index).addClass('curr');
            tabSwiper.slideTo(index);

        });
       //tap outside of emoji
        $(".wrapper").on("click",function(e){
            if(!($(e.target).hasClass("maker-emoji-item") || $(e.target).hasClass("zoomBtn") || $(e.target).hasClass("cancelBtn"))){
               self._clearOutlineAndBtn($container)
            }
        });

				if(typeof params.ani != 'undefined' && !params.ani) {
				} else {
					$ele.addClass('fadeInUp animated');
				}
				$ele.css({display:'block'});
				if(typeof params.changed != 'undefined' && !params.changed) {
				} else {
					self.changed = true;
				}

				self.children[eId] = $ele;

				setTimeout(function(){self.locked = false}, 400);/*等待上屏动画结束再解锁,可以通过js获取动画时间,这里为了简化没有这么做*/

				if(typeof succFunc == 'function') {
					succFunc($.extend(params,{id:eId}));
				}
			}
			$ele[0].onerror = function() {
				$ele.remove();
				if(typeof failFunc == 'function') {
					failFunc($.extend(params,{id:eId}));
				}
				self.locked = false;
				try{
					showAlert('Fail to load emoji.');
				}catch(e){
					window.alert('Fail to load emoji.');
				}
			}

			$ele[0].src = params.src;

			return true;
		},
		hasChild: function(id) {
			var self = this;
			return id === '' || typeof id == 'undefined' ? (self.$container.children().size() > 0 ? true : false) : (self.children[id] ? true : false);
		},
		hasChildByKey: function(key) {
			var self = this;
			for(var id in self.children) {
				if(self.children[id].attr('emoji-key') && self.children[id].attr('emoji-key') == key)
					return true;
			}
			return false;
		},
		removeChildByKey: function(key) {
			var self = this;
			var counter = 0;
			for(var id in self.children) {
				if(self.children[id].attr('emoji-key') && self.children[id].attr('emoji-key') == key) {
					self.removeChild(id);
					counter++;
				}
			}
			return counter;
		},
		findFaceChild: function() {
			var self = this;
			for(var id in self.children) {
				if(self._isFaceAttr(self.children[id].attr('emoji-face')))
					return self.children[id];
			}
			return $([]);
		},
		getAllChildrenOrderByZindex: function(order) {
			var order = typeof order == 'undefined' ? 'asc' : (order.toLowerCase() == 'asc' ? 'asc' : 'desc');
			var self = this;
			var sets = [];
			for(var id in self.children) {
				var zindex = parseInt(self.children[id].css('z-index'));
				if(!sets[zindex]) {
					sets[zindex] = [];
				}
				sets[zindex].push(self.children[id]);
			}
			if(order == 'desc') {
				sets.reverse();
			}
			return sets;
		},
		getPadding: function(padding) {
			if(/^\d+$/.test(padding)) {
				padding = parseInt(padding) < 0 ? 0 : parseInt(padding);
				return {
					top: padding,
					right: padding,
					bottom: padding,
					left: padding
				};
			} else if(Object.prototype.toString.call(padding) === '[object Array]') {
				return {
					top: padding[0] < 0 ? 0 : padding[0],
					right: padding[1] < 0 ? 0 : padding[1],
					bottom: padding[2] < 0 ? 0 : padding[2],
					left: padding[3] < 0 ? 0 : padding[3]
				};
			} else if(Object.prototype.toString.call(padding) === '[object Object]') {
				return {
					top: padding.top < 0 ? 0 : padding.top,
					right: padding.right < 0 ? 0 : padding.right,
					bottom: padding.bottom < 0 ? 0 : padding.bottom,
					left: padding.left < 0 ? 0 : padding.left
				};
			}
			return {top:0,right:0,bottom:0,left:0};
		},
		findMinArea: function() {
			var self = this;
			var coords = {x1: self.$container.width(), x2: 0, y1: self.$container.height(), y2: 0};
			for(var id in self.children) {
				var $img = self.children[id];
				if(coords.x1 > $img.position().left) {
					coords.x1 = $img.position().left;
				}
				if(coords.x2 < $img.position().left + $img.width()) {
					coords.x2 = $img.position().left + $img.width();
				}
				if(coords.y1 > $img.position().top) {
					coords.y1 = $img.position().top;
				}
				if(coords.y2 < $img.position().top + $img.height()) {
					coords.y2 = $img.position().top + $img.height();
				}
			}
			return coords;
		},
		saveNoResize: function() {
			var self = this;
			var $container = self.$container;
			if(!self.hasChild()) {
				try{
					showAlert('Nothing to save.');
				}catch(e){
					window.alert('Nothing to save.');
				}
				return '';
			}
			var children = self.children;
			if($('canvas#emojiMaker-canvas').size() > 0) {
				var $canvas = $('canvas#emojiMaker-canvas');
			} else {
				var $canvas = $('<canvas id="emojiMaker-canvas" class="emojiMaker-canvas"></canvas>').css({position:'absolute'}).insertBefore($container);
			}
			/*calculate canvas size*/
			var canvasWidth = $container.width();
			var canvasHeight = $container.height();
			self._resizeCanvas($canvas[0], canvasWidth, canvasHeight);
			$canvas[0].getContext('2d').fillStyle = 'rgba(255,255,255,0)';
			$canvas[0].getContext('2d').fillRect(0, 0, canvasWidth, canvasHeight);
			$canvas[0].getContext('2d').globalCompositeOperation = 'source-over';

			var sets = self.getAllChildrenOrderByZindex('asc');
			var coords = self.findMinArea();

			for(var ii=0;ii<$(sets).size();ii++) {
				for(var jj=0;jj<$(sets[ii]).size();jj++) {
					var $img = sets[ii][jj];
					$canvas[0].getContext('2d').drawImage($img[0], 0, 0, $img.attr('real-width'), $img.attr('real-height'), $img.attr('posx'), $img.attr('posy'), $img.width(), $img.height());
				}
			}

			var dataURI;
			var clipX = coords.x1;
			var clipY = coords.y1;
			var clipWidth = coords.x2-coords.x1;
			var clipHeight = coords.y2-coords.y1;
			var imgData = $canvas[0].getContext('2d').getImageData(clipX, clipY, clipWidth, clipHeight);
			self._resizeCanvas($canvas[0], clipWidth, clipHeight);
			$canvas[0].getContext('2d').fillStyle = 'rgba(255,255,255,0)';
			$canvas[0].getContext('2d').fillRect(0, 0, clipWidth, clipHeight);
			$canvas[0].getContext('2d').putImageData(imgData, 0, 0);

			if(self.options.imgExportFormat.toLowerCase() == 'jpg' || self.options.imgExportFormat.toLowerCase() == 'jpeg') {
				var encoder = new JPEGEncoder();
				dataURI = encoder.encode($canvas[0].getContext('2d').getImageData(0,0,clipWidth,clipHeight), self.options.imgExportQuality);
			} else {
				dataURI = $canvas[0].toDataURL('image/png', self.options.imgExportQuality/100);
			}
			return dataURI;
		},
		save: function() {
			var self = this;
			if(!self.options.resize) {
				return self.saveNoResize();
			}
			var $container = self.$container;
			if(!self.hasChild()) {
				try{
					showAlert('Nothing to save.');
				}catch(e){
					window.alert('Nothing to save.');
				}
				return '';
			}
			var children = self.children;
			if($('canvas#emojiMaker-canvas').size() > 0) {
				var $canvas = $('canvas#emojiMaker-canvas');
			} else {
				var $canvas = $('<canvas id="emojiMaker-canvas" class="emojiMaker-canvas"></canvas>').css({position:'absolute'}).insertBefore($container);
			}

			/*calculate actual size*/
			var cWidth = $container.width()/self.yScaleRatio;
			var cHeight = $container.height()/self.yScaleRatio;

			/* find all children and min-area */
			var sets = self.getAllChildrenOrderByZindex('asc');
			var coords = self.findMinArea();

			/* resize to actual size */
			var clipX = coords.x1/self.yScaleRatio;
			var clipY = coords.y1/self.yScaleRatio;
			var clipWidth = (coords.x2-coords.x1)/self.yScaleRatio;
			var clipHeight = (coords.y2-coords.y1)/self.yScaleRatio;

			/* resize to base size (realWidthTmp<=baseWidth, realHeightTmp<=baseWidth)*/
			var realWidthTmp,realHeightTmp;
			if(clipWidth/clipHeight > self.options.baseWidth/self.options.baseHeight) {
				realWidthTmp = self.options.baseWidth;
				realHeightTmp = realWidthTmp*clipHeight/clipWidth;
			} else {
				realHeightTmp = self.options.baseHeight;
				realWidthTmp = realHeightTmp*clipWidth/clipHeight;
			}

			var ratio = realWidthTmp/clipWidth; /* ratio always less than 1 or equal 1 */

			var padding = self.getPadding(self.options.padding);
			var tmpWidth = realWidthTmp-padding.left-padding.right;
			var tmpHeight = realHeightTmp-padding.top-padding.bottom;
			var realWidth,realHeight,rtype;
			if(realWidthTmp/realHeightTmp > tmpWidth/tmpHeight) {
				rtype = 0;
				realWidth = tmpWidth;
				realHeight = realWidth*realHeightTmp/realWidthTmp;
			} else {
				rtype = 1;
				realHeight = tmpHeight;
				realWidth = realHeight*realWidthTmp/realHeightTmp;
			}
			var ratio2 = realWidth/realWidthTmp;

			/* calculate canvas size */
			var canvasWidth = cWidth*ratio;
			var canvasHeight = cHeight*ratio;
			self._resizeCanvas($canvas[0], canvasWidth, canvasHeight);
			$canvas[0].getContext('2d').fillStyle = 'rgba(255,255,255,0)';
			$canvas[0].getContext('2d').fillRect(0, 0, canvasHeight, canvasHeight);

			/* resize image and draw into canvas */
			for(var ii=0;ii<$(sets).size();ii++) {
				for(var jj=0;jj<$(sets[ii]).size();jj++) {
					var $img = sets[ii][jj];
					$canvas[0].getContext('2d').drawImage($img[0], 0, 0, $img.attr('real-width'), $img.attr('real-height'),
						ratio*ratio2*$img.attr('posx')/self.yScaleRatio,
						ratio*ratio2*$img.attr('posy')/self.yScaleRatio,
						ratio*ratio2*$img.width()/self.yScaleRatio,
						ratio*ratio2*$img.height()/self.yScaleRatio
					);
				}

			}

			var imgData = $canvas[0].getContext('2d').getImageData(clipX*ratio*ratio2-(rtype==0?padding.left:(realWidthTmp-realWidth)/2), clipY*ratio*ratio2-(rtype==1?padding.top:(realHeightTmp-realHeight)/2), clipWidth*ratio, clipHeight*ratio);
			var dataURI;
			if(self.options.imgExportFormat.toLowerCase() == 'jpg' || self.options.imgExportFormat.toLowerCase() == 'jpeg') {
				var encoder = new JPEGEncoder();
				dataURI = encoder.encode(imgData, self.options.imgExportQuality);
			} else {
				self._resizeCanvas($canvas[0], clipWidth*ratio, clipHeight*ratio);
				$canvas[0].getContext('2d').putImageData(imgData, 0, 0);
				dataURI = $canvas[0].toDataURL('image/png', self.options.imgExportQuality/100);
			}

			return dataURI;
		},
		reset: function(callback) {
			this.removeAllChildren();
			this.changed = false;
			if(typeof callback == 'function')
				callback();
			return true;
		},
		_resizeCanvas: function(canvas, width, height) {
			canvas.style.width = canvas.width = width;
			canvas.style.height = canvas.height = height;
			canvas.getContext('2d').clearRect(0, 0, width, height);
		},
		_drawBgLine:function(){
				var $face = $("[emoji-key='face']");
				var centerX = parseInt($face.attr('posX'))+$face.width()/2;
				var centerY =  parseInt($face.attr('posY'))+$face.height()/2;


				var c=document.getElementById("bg-line");
				var ctx=c.getContext("2d");

				ctx.beginPath();
				ctx.moveTo(0,centerY-0.5);
				ctx.lineTo(400,centerY-0.5);

				ctx.strokeStyle="grey";
				ctx.setLineDash([6, 6]);
				ctx.stroke();



				var ctx2=c.getContext("2d");
				ctx2.beginPath();
				ctx2.moveTo(centerX-0.5,0);
				ctx2.lineTo(centerX-0.5,400);

				ctx2.strokeStyle="grey";
				ctx2.setLineDash([6, 6]);
				ctx2.stroke();
		},
		_clearBgLine:function(){
				var c=document.getElementById("bg-line");
				var cxt=c.getContext("2d");
				cxt.clearRect(0,0,c.width,c.height);
		},
		_isCenter:function($ele){
				var $face = $("[emoji-key='face']");
				var centerX = parseInt($face.attr('posX'))+$face.width()/2;
				var isCenter = Math.abs(parseInt($ele.attr('posX'))+$ele.width()/2 - centerX) < 2 ? true : false;
			 return isCenter
		},
		_setOutline:function($ele){
				//distributed along the longitudinal line
				var $face = $("[emoji-key='face']");
				var centerX = parseInt($face.attr('posX'))+$face.width()/2;

				if(Math.abs(parseInt($ele.attr('posX'))+$ele.width()/2 - centerX) <2){
						$ele.css({"outline":"1px solid #4B53E5"});
				}else{
						$ele.css({"outline":"1px solid #B1B8CC"});
				}
		},
		_createOutlineAndBtn:function($ele,$container,self){
				//set outline
				self._setOutline($ele)

				//set buttons
				$ele.before("<span class='cancelBtn fadeIn animated'></span>");
				$ele.after("<span class='zoomBtn fadeIn animated'></span>");
				var zoomBtnWidth = $(".zoomBtn").eq(0).width();
				var cancelBtnWidth = $(".cancelBtn").eq(0).width();
				var zoomBtnX  = parseFloat($ele.attr("posx"))+parseFloat($ele.css("width"))-zoomBtnWidth/2;
				var zoomBtnY  = parseFloat($ele.attr("posy"))+parseFloat($ele.css("height"))-zoomBtnWidth/2;
				var cancelBtnX  = parseFloat($ele.attr("posx"))-cancelBtnWidth/2;
				var cancelBtnY  = parseFloat($ele.attr("posy"))-cancelBtnWidth/2;

				$(".zoomBtn").css({"display":"block","position":"absolute","top":zoomBtnY,"left":zoomBtnX,"z-index":1112})
				$(".zoomBtn").attr({"initZoomX":zoomBtnX,"initZoomY":zoomBtnY});
				$(".cancelBtn").css({"display":"block","position":"absolute","top":cancelBtnY,"left":cancelBtnX,"z-index":1112})
				$(".cancelBtn").attr({"initCancelX":cancelBtnX,"initCancelY":cancelBtnY});

		},
		_clearOutlineAndBtn:function($container){
				$container.find(".zoomBtn").remove();
				$container.find(".cancelBtn").remove();
				$(".maker-emoji-item").css({"outline":"none"})
		},
		_changeBtnPos:function($ele){

				 var zoomBtnWidth = $(".zoomBtn").eq(0).width();
				 var cancelBtnWidth = $(".cancelBtn").eq(0).width();

				 var x1 = parseInt($ele.attr("posX"))+parseInt($ele.css("width"))-zoomBtnWidth/2;
				 var y1 = parseInt($ele.attr("posY"))+parseInt($ele.css("height"))-zoomBtnWidth/2;
				 $(".zoomBtn").css({"position":"absolute",left:x1+'px',top:y1+'px'});

				 var x2 = parseInt($ele.attr("posX"))-cancelBtnWidth/2;
				 var y2 = parseInt($ele.attr("posY"))-cancelBtnWidth/2;
				 $(".cancelBtn").css({"position":"absolute",left:x2+'px',top:y2+'px'});
		},
		_cancelEle: function($ele,$container,self){
				$(".cancelBtn").data('hammer', new Hammer($(".cancelBtn")[0]), {});//hammer instance
				$(".cancelBtn").data('hammer').on('tap', function (e) {
						self._clearOutlineAndBtn($container)

						var emojiKey = $ele.attr('emoji-key');
						self.removeChildByKey(emojiKey);
						$("[emoji-key="+emojiKey+"]").removeClass("grayfilter")
						$("#"+emojiKey+"-0").removeClass("active")
				})
		},
		_zoom:function($ele, $container,origin){
				var self = this;

				var initWidth = $ele.attr("real-width")*$ele.attr("yscaleratio");
				var initHeight = $ele.attr("real-height")*$ele.attr("yscaleratio");
				$(".zoomBtn").data('hammer', new Hammer($(".zoomBtn")[0]), {});//hammer instance
				$(".zoomBtn").data('hammer').on('panstart', function (e) {
								e.preventDefault();

								self._drawBgLine();

								// Save initial value
								var centerX = e.center.x;
								var centerY = e.center.y;

								var owidth = $ele[0].width;
								var oheight = $ele[0].height;

								var oposx = $ele.attr("posx");
								var oposy = $ele.attr("posy");

						$(".zoomBtn").data('hammer').on('panmove', function (e) {

								e.preventDefault();
								if(origin=="center"){
										$ele.css({
										"left":oposx - (e.center.x - centerX),
										"top":oposy - (e.center.y - centerY),
										"width":owidth + 2*(e.center.x - centerX),
										"height":oheight + 2*(e.center.y - centerY)
										});

										$ele.attr({
												"posX":oposx - (e.center.x - centerX),
												"posY":oposy - (e.center.y - centerY)
										});

								}else if(origin == "proportion"){
										var curWidth,curHeight,curLeft,curTop;
										var minScale = self.options.minScale , maxScale = self.options.maxScale;


										curWidth = owidth + 2*(e.center.x - centerX);

										//limits the bounds of zoom
										if(curWidth > initWidth*maxScale ){
												curWidth = initWidth*maxScale;
												curHeight = initHeight*maxScale;
										}else if( curWidth < initWidth * minScale){
												curWidth = initWidth * minScale;
												curHeight = initHeight * minScale;
										}else{
												curWidth = owidth + 2*(e.center.x - centerX);
												curHeight =curWidth/owidth*oheight;
										}
								curLeft = oposx - (curWidth-owidth)/2;
								curTop = oposy-(curHeight-oheight)/2;
										$ele.css({
												"left":curLeft,
												"top":curTop,
												"width":curWidth,
												"height":curHeight
												});

												$ele.attr({
														"posX":curLeft,
														"posY":curTop
												});
								}else{
										$ele.css({
												"width":owidth + e.center.x - centerX,
												"height":oheight + e.center.y - centerY
										});
								}

								// $(".cancelBtn,.zoomBtn").hide()
								self._changeBtnPos($ele);
						});
				});
				$(".zoomBtn").data('hammer').on('panend', function (e) {
						e.preventDefault();
						// $(".cancelBtn,.zoomBtn").show()
						self._clearBgLine();
						//Reset the properties
						$ele.attr({
								"lastPosX": parseInt($ele.attr('posX')),
								"lastPosY": parseInt($ele.attr('posY'))
						});
				});
		}
	}
	$.fn.emojiMaker = function (option) {
        var args = Array.apply(null, arguments), retvals = [];
        args.shift();
        this.each(function () {
            var self = $(this), data = self.data('emojiMaker'),
				options = typeof option === 'object' && option,
                opts;
            if (!data) {
                opts = $.extend($.fn.emojiMaker.defaults, options,
                    self.data());
                data = new emojiMaker(this, opts);
                self.data('emojiMaker', data);
            }
            if (typeof option === 'string') {
                retvals.push(data[option].apply(data, args));
            }
        });
        switch (retvals.length) {
            case 0:
                return this;
            case 1:
                return retvals[0];
            default:
                return retvals;
        }
    };

	$.fn.emojiMaker.defaults = {
		baseWidth: 400, /* emoji save to max width */
		baseHeight: 400, /* emoji save to max height */
		padding: 0, /* 保存图片的填充留白宽度,该参数不影响输出的baseWidth及baseHeight参数 */
		resize: true, /* 保存时是否对合成的emoji图做resize处理,此项为false时忽略baseWidth,baseHeight及padding参数 */
		imgExportFormat: 'png',
		imgExportQuality: 90,
		yScaleRatio: 1,
		minScale:0.5,
    maxScale:2,
    offsetDistance:30
	};

	$.fn.emojiMaker.Constructor = emojiMaker;
}));

/*

  Basic GUI blocking jpeg encoder ported to JavaScript and optimized by
  Andreas Ritter, www.bytestrom.eu, 11/2009.

  Example usage is given at the bottom of this file.

  ---------

  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

  * Neither the name of Adobe Systems Incorporated nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function JPEGEncoder(quality) {
  var self = this;
    var fround = Math.round;
    var ffloor = Math.floor;
    var YTable = new Array(64);
    var UVTable = new Array(64);
    var fdtbl_Y = new Array(64);
    var fdtbl_UV = new Array(64);
    var YDC_HT;
    var UVDC_HT;
    var YAC_HT;
    var UVAC_HT;

    var bitcode = new Array(65535);
    var category = new Array(65535);
    var outputfDCTQuant = new Array(64);
    var DU = new Array(64);
    var byteout = [];
    var bytenew = 0;
    var bytepos = 7;

    var YDU = new Array(64);
    var UDU = new Array(64);
    var VDU = new Array(64);
    var clt = new Array(256);
    var RGB_YUV_TABLE = new Array(2048);
    var currentQuality;

    var ZigZag = [
             0, 1, 5, 6,14,15,27,28,
             2, 4, 7,13,16,26,29,42,
             3, 8,12,17,25,30,41,43,
             9,11,18,24,31,40,44,53,
            10,19,23,32,39,45,52,54,
            20,22,33,38,46,51,55,60,
            21,34,37,47,50,56,59,61,
            35,36,48,49,57,58,62,63
        ];

    var std_dc_luminance_nrcodes = [0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
    var std_dc_luminance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
    var std_ac_luminance_nrcodes = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
    var std_ac_luminance_values = [
            0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,
            0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,
            0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,
            0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
            0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,
            0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,
            0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,
            0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
            0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,
            0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
            0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,
            0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
            0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,
            0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,
            0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,
            0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
            0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,
            0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,
            0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,
            0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
            0xf9,0xfa
        ];

    var std_dc_chrominance_nrcodes = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
    var std_dc_chrominance_values = [0,1,2,3,4,5,6,7,8,9,10,11];
    var std_ac_chrominance_nrcodes = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
    var std_ac_chrominance_values = [
            0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,
            0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,
            0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,
            0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,
            0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,
            0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,
            0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,
            0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,
            0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,
            0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,
            0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,
            0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,
            0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,
            0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,
            0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,
            0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,
            0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,
            0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,
            0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,
            0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,
            0xf9,0xfa
        ];

    function initQuantTables(sf){
            var YQT = [
                16, 11, 10, 16, 24, 40, 51, 61,
                12, 12, 14, 19, 26, 58, 60, 55,
                14, 13, 16, 24, 40, 57, 69, 56,
                14, 17, 22, 29, 51, 87, 80, 62,
                18, 22, 37, 56, 68,109,103, 77,
                24, 35, 55, 64, 81,104,113, 92,
                49, 64, 78, 87,103,121,120,101,
                72, 92, 95, 98,112,100,103, 99
            ];

            for (var i = 0; i < 64; i++) {
                var t = ffloor((YQT[i]*sf+50)/100);
                if (t < 1) {
                    t = 1;
                } else if (t > 255) {
                    t = 255;
                }
                YTable[ZigZag[i]] = t;
            }
            var UVQT = [
                17, 18, 24, 47, 99, 99, 99, 99,
                18, 21, 26, 66, 99, 99, 99, 99,
                24, 26, 56, 99, 99, 99, 99, 99,
                47, 66, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99
            ];
            for (var j = 0; j < 64; j++) {
                var u = ffloor((UVQT[j]*sf+50)/100);
                if (u < 1) {
                    u = 1;
                } else if (u > 255) {
                    u = 255;
                }
                UVTable[ZigZag[j]] = u;
            }
            var aasf = [
                1.0, 1.387039845, 1.306562965, 1.175875602,
                1.0, 0.785694958, 0.541196100, 0.275899379
            ];
            var k = 0;
            for (var row = 0; row < 8; row++)
            {
                for (var col = 0; col < 8; col++)
                {
                    fdtbl_Y[k]  = (1.0 / (YTable [ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
                    fdtbl_UV[k] = (1.0 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
                    k++;
                }
            }
        }

        function computeHuffmanTbl(nrcodes, std_table){
            var codevalue = 0;
            var pos_in_table = 0;
            var HT = new Array();
            for (var k = 1; k <= 16; k++) {
                for (var j = 1; j <= nrcodes[k]; j++) {
                    HT[std_table[pos_in_table]] = [];
                    HT[std_table[pos_in_table]][0] = codevalue;
                    HT[std_table[pos_in_table]][1] = k;
                    pos_in_table++;
                    codevalue++;
                }
                codevalue*=2;
            }
            return HT;
        }

        function initHuffmanTbl()
        {
            YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes,std_dc_luminance_values);
            UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes,std_dc_chrominance_values);
            YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes,std_ac_luminance_values);
            UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes,std_ac_chrominance_values);
        }

        function initCategoryNumber()
        {
            var nrlower = 1;
            var nrupper = 2;
            for (var cat = 1; cat <= 15; cat++) {
                //Positive numbers
                for (var nr = nrlower; nr<nrupper; nr++) {
                    category[32767+nr] = cat;
                    bitcode[32767+nr] = [];
                    bitcode[32767+nr][1] = cat;
                    bitcode[32767+nr][0] = nr;
                }
                //Negative numbers
                for (var nrneg =-(nrupper-1); nrneg<=-nrlower; nrneg++) {
                    category[32767+nrneg] = cat;
                    bitcode[32767+nrneg] = [];
                    bitcode[32767+nrneg][1] = cat;
                    bitcode[32767+nrneg][0] = nrupper-1+nrneg;
                }
                nrlower <<= 1;
                nrupper <<= 1;
            }
        }

        function initRGBYUVTable() {
            for(var i = 0; i < 256;i++) {
                RGB_YUV_TABLE[i]              =  19595 * i;
                RGB_YUV_TABLE[(i+ 256)>>0]     =  38470 * i;
                RGB_YUV_TABLE[(i+ 512)>>0]     =   7471 * i + 0x8000;
                RGB_YUV_TABLE[(i+ 768)>>0]     = -11059 * i;
                RGB_YUV_TABLE[(i+1024)>>0]     = -21709 * i;
                RGB_YUV_TABLE[(i+1280)>>0]     =  32768 * i + 0x807FFF;
                RGB_YUV_TABLE[(i+1536)>>0]     = -27439 * i;
                RGB_YUV_TABLE[(i+1792)>>0]     = - 5329 * i;
            }
        }

        // IO functions
        function writeBits(bs)
        {
            var value = bs[0];
            var posval = bs[1]-1;
            while ( posval >= 0 ) {
                if (value & (1 << posval) ) {
                    bytenew |= (1 << bytepos);
                }
                posval--;
                bytepos--;
                if (bytepos < 0) {
                    if (bytenew == 0xFF) {
                        writeByte(0xFF);
                        writeByte(0);
                    }
                    else {
                        writeByte(bytenew);
                    }
                    bytepos=7;
                    bytenew=0;
                }
            }
        }

        function writeByte(value)
        {
            byteout.push(clt[value]); // write char directly instead of converting later
        }

        function writeWord(value)
        {
            writeByte((value>>8)&0xFF);
            writeByte((value   )&0xFF);
        }

        // DCT & quantization core
        function fDCTQuant(data, fdtbl)
        {
            var d0, d1, d2, d3, d4, d5, d6, d7;
            /* Pass 1: process rows. */
            var dataOff=0;
            var i;
            const I8 = 8;
            const I64 = 64;
            for (i=0; i<I8; ++i)
            {
                d0 = data[dataOff];
                d1 = data[dataOff+1];
                d2 = data[dataOff+2];
                d3 = data[dataOff+3];
                d4 = data[dataOff+4];
                d5 = data[dataOff+5];
                d6 = data[dataOff+6];
                d7 = data[dataOff+7];

                var tmp0 = d0 + d7;
                var tmp7 = d0 - d7;
                var tmp1 = d1 + d6;
                var tmp6 = d1 - d6;
                var tmp2 = d2 + d5;
                var tmp5 = d2 - d5;
                var tmp3 = d3 + d4;
                var tmp4 = d3 - d4;

                /* Even part */
                var tmp10 = tmp0 + tmp3;    /* phase 2 */
                var tmp13 = tmp0 - tmp3;
                var tmp11 = tmp1 + tmp2;
                var tmp12 = tmp1 - tmp2;

                data[dataOff] = tmp10 + tmp11; /* phase 3 */
                data[dataOff+4] = tmp10 - tmp11;

                var z1 = (tmp12 + tmp13) * 0.707106781; /* c4 */
                data[dataOff+2] = tmp13 + z1; /* phase 5 */
                data[dataOff+6] = tmp13 - z1;

                /* Odd part */
                tmp10 = tmp4 + tmp5; /* phase 2 */
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;

                /* The rotator is modified from fig 4-8 to avoid extra negations. */
                var z5 = (tmp10 - tmp12) * 0.382683433; /* c6 */
                var z2 = 0.541196100 * tmp10 + z5; /* c2-c6 */
                var z4 = 1.306562965 * tmp12 + z5; /* c2+c6 */
                var z3 = tmp11 * 0.707106781; /* c4 */

                var z11 = tmp7 + z3;    /* phase 5 */
                var z13 = tmp7 - z3;

                data[dataOff+5] = z13 + z2;    /* phase 6 */
                data[dataOff+3] = z13 - z2;
                data[dataOff+1] = z11 + z4;
                data[dataOff+7] = z11 - z4;

                dataOff += 8; /* advance pointer to next row */
            }

            /* Pass 2: process columns. */
            dataOff = 0;
            for (i=0; i<I8; ++i)
            {
                d0 = data[dataOff];
                d1 = data[dataOff + 8];
                d2 = data[dataOff + 16];
                d3 = data[dataOff + 24];
                d4 = data[dataOff + 32];
                d5 = data[dataOff + 40];
                d6 = data[dataOff + 48];
                d7 = data[dataOff + 56];

                var tmp0p2 = d0 + d7;
                var tmp7p2 = d0 - d7;
                var tmp1p2 = d1 + d6;
                var tmp6p2 = d1 - d6;
                var tmp2p2 = d2 + d5;
                var tmp5p2 = d2 - d5;
                var tmp3p2 = d3 + d4;
                var tmp4p2 = d3 - d4;

                /* Even part */
                var tmp10p2 = tmp0p2 + tmp3p2;    /* phase 2 */
                var tmp13p2 = tmp0p2 - tmp3p2;
                var tmp11p2 = tmp1p2 + tmp2p2;
                var tmp12p2 = tmp1p2 - tmp2p2;

                data[dataOff] = tmp10p2 + tmp11p2; /* phase 3 */
                data[dataOff+32] = tmp10p2 - tmp11p2;

                var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781; /* c4 */
                data[dataOff+16] = tmp13p2 + z1p2; /* phase 5 */
                data[dataOff+48] = tmp13p2 - z1p2;

                /* Odd part */
                tmp10p2 = tmp4p2 + tmp5p2; /* phase 2 */
                tmp11p2 = tmp5p2 + tmp6p2;
                tmp12p2 = tmp6p2 + tmp7p2;

                /* The rotator is modified from fig 4-8 to avoid extra negations. */
                var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433; /* c6 */
                var z2p2 = 0.541196100 * tmp10p2 + z5p2; /* c2-c6 */
                var z4p2 = 1.306562965 * tmp12p2 + z5p2; /* c2+c6 */
                var z3p2 = tmp11p2 * 0.707106781; /* c4 */
                var z11p2 = tmp7p2 + z3p2;    /* phase 5 */
                var z13p2 = tmp7p2 - z3p2;

                data[dataOff+40] = z13p2 + z2p2; /* phase 6 */
                data[dataOff+24] = z13p2 - z2p2;
                data[dataOff+ 8] = z11p2 + z4p2;
                data[dataOff+56] = z11p2 - z4p2;

                dataOff++; /* advance pointer to next column */
            }

            // Quantize/descale the coefficients
            var fDCTQuant;
            for (i=0; i<I64; ++i)
            {
                // Apply the quantization and scaling factor & Round to nearest integer
                fDCTQuant = data[i]*fdtbl[i];
                outputfDCTQuant[i] = (fDCTQuant > 0.0) ? ((fDCTQuant + 0.5)|0) : ((fDCTQuant - 0.5)|0);
                //outputfDCTQuant[i] = fround(fDCTQuant);

            }
            return outputfDCTQuant;
        }

        function writeAPP0()
        {
            writeWord(0xFFE0); // marker
            writeWord(16); // length
            writeByte(0x4A); // J
            writeByte(0x46); // F
            writeByte(0x49); // I
            writeByte(0x46); // F
            writeByte(0); // = "JFIF",'\0'
            writeByte(1); // versionhi
            writeByte(1); // versionlo
            writeByte(0); // xyunits
            writeWord(1); // xdensity
            writeWord(1); // ydensity
            writeByte(0); // thumbnwidth
            writeByte(0); // thumbnheight
        }

        function writeSOF0(width, height)
        {
            writeWord(0xFFC0); // marker
            writeWord(17);   // length, truecolor YUV JPG
            writeByte(8);    // precision
            writeWord(height);
            writeWord(width);
            writeByte(3);    // nrofcomponents
            writeByte(1);    // IdY
            writeByte(0x11); // HVY
            writeByte(0);    // QTY
            writeByte(2);    // IdU
            writeByte(0x11); // HVU
            writeByte(1);    // QTU
            writeByte(3);    // IdV
            writeByte(0x11); // HVV
            writeByte(1);    // QTV
        }

        function writeDQT()
        {
            writeWord(0xFFDB); // marker
            writeWord(132);       // length
            writeByte(0);
            for (var i=0; i<64; i++) {
                writeByte(YTable[i]);
            }
            writeByte(1);
            for (var j=0; j<64; j++) {
                writeByte(UVTable[j]);
            }
        }

        function writeDHT()
        {
            writeWord(0xFFC4); // marker
            writeWord(0x01A2); // length

            writeByte(0); // HTYDCinfo
            for (var i=0; i<16; i++) {
                writeByte(std_dc_luminance_nrcodes[i+1]);
            }
            for (var j=0; j<=11; j++) {
                writeByte(std_dc_luminance_values[j]);
            }

            writeByte(0x10); // HTYACinfo
            for (var k=0; k<16; k++) {
                writeByte(std_ac_luminance_nrcodes[k+1]);
            }
            for (var l=0; l<=161; l++) {
                writeByte(std_ac_luminance_values[l]);
            }

            writeByte(1); // HTUDCinfo
            for (var m=0; m<16; m++) {
                writeByte(std_dc_chrominance_nrcodes[m+1]);
            }
            for (var n=0; n<=11; n++) {
                writeByte(std_dc_chrominance_values[n]);
            }

            writeByte(0x11); // HTUACinfo
            for (var o=0; o<16; o++) {
                writeByte(std_ac_chrominance_nrcodes[o+1]);
            }
            for (var p=0; p<=161; p++) {
                writeByte(std_ac_chrominance_values[p]);
            }
        }

        function writeSOS()
        {
            writeWord(0xFFDA); // marker
            writeWord(12); // length
            writeByte(3); // nrofcomponents
            writeByte(1); // IdY
            writeByte(0); // HTY
            writeByte(2); // IdU
            writeByte(0x11); // HTU
            writeByte(3); // IdV
            writeByte(0x11); // HTV
            writeByte(0); // Ss
            writeByte(0x3f); // Se
            writeByte(0); // Bf
        }

        function processDU(CDU, fdtbl, DC, HTDC, HTAC){
            var EOB = HTAC[0x00];
            var M16zeroes = HTAC[0xF0];
            var pos;
            const I16 = 16;
            const I63 = 63;
            const I64 = 64;
            var DU_DCT = fDCTQuant(CDU, fdtbl);
            //ZigZag reorder
            for (var j=0;j<I64;++j) {
                DU[ZigZag[j]]=DU_DCT[j];
            }
            var Diff = DU[0] - DC; DC = DU[0];
            //Encode DC
            if (Diff==0) {
                writeBits(HTDC[0]); // Diff might be 0
            } else {
                pos = 32767+Diff;
                writeBits(HTDC[category[pos]]);
                writeBits(bitcode[pos]);
            }
            //Encode ACs
            var end0pos = 63; // was const... which is crazy
            for (; (end0pos>0)&&(DU[end0pos]==0); end0pos--) {};
            //end0pos = first element in reverse order !=0
            if ( end0pos == 0) {
                writeBits(EOB);
                return DC;
            }
            var i = 1;
            var lng;
            while ( i <= end0pos ) {
                var startpos = i;
                for (; (DU[i]==0) && (i<=end0pos); ++i) {}
                var nrzeroes = i-startpos;
                if ( nrzeroes >= I16 ) {
                    lng = nrzeroes>>4;
                    for (var nrmarker=1; nrmarker <= lng; ++nrmarker)
                        writeBits(M16zeroes);
                    nrzeroes = nrzeroes&0xF;
                }
                pos = 32767+DU[i];
                writeBits(HTAC[(nrzeroes<<4)+category[pos]]);
                writeBits(bitcode[pos]);
                i++;
            }
            if ( end0pos != I63 ) {
                writeBits(EOB);
            }
            return DC;
        }

        function initCharLookupTable(){
            var sfcc = String.fromCharCode;
            for(var i=0; i < 256; i++){ ///// ACHTUNG // 255
                clt[i] = sfcc(i);
            }
        }

        this.encode = function(image,quality,toRaw) // image data object
        {
            var time_start = new Date().getTime();

            if(quality) setQuality(quality);

            // Initialize bit writer
            byteout = new Array();
            bytenew=0;
            bytepos=7;

            // Add JPEG headers
            writeWord(0xFFD8); // SOI
            writeAPP0();
            writeDQT();
            writeSOF0(image.width,image.height);
            writeDHT();
            writeSOS();

            // Encode 8x8 macroblocks
            var DCY=0;
            var DCU=0;
            var DCV=0;

            bytenew=0;
            bytepos=7;

            this.encode.displayName = "_encode_";

            var imageData = image.data;
            var width = image.width;
            var height = image.height;

            var quadWidth = width*4;
            var tripleWidth = width*3;

            var x, y = 0;
            var r, g, b;
            var start,p, col,row,pos;
            while(y < height){
                x = 0;
                while(x < quadWidth){
                start = quadWidth * y + x;
                p = start;
                col = -1;
                row = 0;

                for(pos=0; pos < 64; pos++){
                    row = pos >> 3;// /8
                    col = ( pos & 7 ) * 4; // %8
                    p = start + ( row * quadWidth ) + col;

                    if(y+row >= height){ // padding bottom
                        p-= (quadWidth*(y+1+row-height));
                    }

                    if(x+col >= quadWidth){ // padding right
                        p-= ((x+col) - quadWidth +4)
                    }

                    r = imageData[ p++ ];
                    g = imageData[ p++ ];
                    b = imageData[ p++ ];

                    /* // calculate YUV values dynamically
                    YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
                    UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
                    VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
                    */

                    // use lookup table (slightly faster)
                    YDU[pos] = ((RGB_YUV_TABLE[r]             + RGB_YUV_TABLE[(g +  256)>>0] + RGB_YUV_TABLE[(b +  512)>>0]) >> 16)-128;
                    UDU[pos] = ((RGB_YUV_TABLE[(r +  768)>>0] + RGB_YUV_TABLE[(g + 1024)>>0] + RGB_YUV_TABLE[(b + 1280)>>0]) >> 16)-128;
                    VDU[pos] = ((RGB_YUV_TABLE[(r + 1280)>>0] + RGB_YUV_TABLE[(g + 1536)>>0] + RGB_YUV_TABLE[(b + 1792)>>0]) >> 16)-128;

                }

                DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
                DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
                DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
                x+=32;
                }
                y+=8;
            }

            ////////////////////////////////////////////////////////////////

            // Do the bit alignment of the EOI marker
            if ( bytepos >= 0 ) {
                var fillbits = [];
                fillbits[1] = bytepos+1;
                fillbits[0] = (1<<(bytepos+1))-1;
                writeBits(fillbits);
            }

            writeWord(0xFFD9); //EOI

            if(toRaw) {
                var len = byteout.length;
                var data = new Uint8Array(len);

                for (var i=0; i<len; i++ ) {
                    data[i] = byteout[i].charCodeAt();
                }

                //cleanup
                byteout = [];

                // benchmarking
                var duration = new Date().getTime() - time_start;
                console.log('Encoding time: '+ duration + 'ms');

                return data;
            }

            var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));

            byteout = [];

            // benchmarking
            var duration = new Date().getTime() - time_start;
            console.log('Encoding time: '+ duration + 'ms');

            return jpegDataUri
    }

    function setQuality(quality){
        if (quality <= 0) {
            quality = 1;
        }
        if (quality > 100) {
            quality = 100;
        }

        if(currentQuality == quality) return // don't recalc if unchanged

        var sf = 0;
        if (quality < 50) {
            sf = Math.floor(5000 / quality);
        } else {
            sf = Math.floor(200 - quality*2);
        }

        initQuantTables(sf);
        currentQuality = quality;
        console.log('Quality set to: '+quality +'%');
    }

    function init(){
        var time_start = new Date().getTime();
        if(!quality) quality = 50;
        // Create tables
        initCharLookupTable()
        initHuffmanTbl();
        initCategoryNumber();
        initRGBYUVTable();

        setQuality(quality);
        var duration = new Date().getTime() - time_start;
        console.log('Initialization '+ duration + 'ms');
    }

    init();

};
