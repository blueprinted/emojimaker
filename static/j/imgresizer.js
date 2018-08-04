/*
  imgresizer.js
  v1.0.0
  用Lanczos采样放缩算法进行图片缩放
  参考地址：http://stackoverflow.com/questions/2303690/resizing-an-image-in-an-html5-canvas
 */
function imgresizer(options) {
	this.options = {
		img: null,/* image object */
		canvas: null,/* canvas object */
		dwidth: 100,
		lobes: 3, /* 采样窗口大小 */
		returnType: 0,/* 0:undefined, 1:dataURI, 2:canvas's imageData */
		imgExportQuality: 100
	};
	var options = options || {};
	for (var k in options) {
		this.options[k] = options[k];
	}
	this.img;
	this.ext;
	this.canvas;
	this.ctx;
	this.src;
	this.dest;
	this.lobes;
	this.lanczos;
	this.ratio;
	this.rcp_ratio;
	this.range2;
	this.cacheLanc;
	this.center;
	this.icenter;
    this.cacheLanc;
    this.center;
    this.icenter;
	this.init();
}

imgresizer.prototype = {
	init: function() {
		this.img = this.options.img;
		if((matches = this.img.getAttribute('src').match(/^data:image\/(\w+);base64,/i))) {
			this.ext = matches[1].toLowerCase();
		} else if((matches = this.img.getAttribute('src').match(/\S+\.(png|jpg|jpeg|gif)(\?.*)?/i))) {
			this.ext = matches[1].toLowerCase();
		} else {
			this.ext = 'png';
		}
		this.canvas = this.options.canvas;
		this.resizeCanvas(this.canvas, this.img.width, this.img.height);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.drawImage(this.img, 0, 0);
		this.src = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
		this.dest = {
			width : this.options.dwidth,
			height : Math.round(this.img.height * this.options.dwidth / this.img.width),
		};
		this.dest.data = new Array(this.dest.width * this.dest.height * 3);
		this.lobes = this.options.lobes;
		this.lanczos = this.lanczosCreate(this.lobes);
		this.ratio = this.img.width / this.options.dwidth;
		this.rcp_ratio = 2 / this.ratio;
		this.range2 = Math.ceil(this.ratio * this.lobes / 2);
		this.cacheLanc = {};
		this.center = {};
		this.icenter = {};
		this.cacheLanc = {};
		this.center = {};
		this.icenter = {};
	},
	resizeCanvas: function(canvas, width, height) {
		canvas.style.width = canvas.width = width;
		canvas.style.height = canvas.height = height;
		canvas.getContext('2d').clearRect(0, 0, width, height);
	},
	/* returns a function that calculates lanczos weight */
	lanczosCreate: function (lobes) {
		return function(x) {
			if (x > lobes)
				return 0;
			x *= Math.PI;
			if (Math.abs(x) < 1e-16)
				return 1;
			var xx = x / lobes;
			return Math.sin(x) * Math.sin(xx) / x / xx;
		};
	},
	run: function() {
		return this.process1(this, 0);
	},
	process1: function(self, u) {
		self.center.x = (u + 0.5) * self.ratio;
		self.icenter.x = Math.floor(self.center.x);
		for (var v = 0; v < self.dest.height; v++) {
			self.center.y = (v + 0.5) * self.ratio;
			self.icenter.y = Math.floor(self.center.y);
			var a, r, g, b;
			a = r = g = b = 0;
			for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
				if (i < 0 || i >= self.src.width)
					continue;
				var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
				if (!self.cacheLanc[f_x])
					self.cacheLanc[f_x] = {};
				for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
					if (j < 0 || j >= self.src.height)
						continue;
					var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
					if (self.cacheLanc[f_x][f_y] == undefined)
						self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2)
								+ Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
					weight = self.cacheLanc[f_x][f_y];
					if (weight > 0) {
						var idx = (j * self.src.width + i) * 4;
						a += weight;
						r += weight * self.src.data[idx];
						g += weight * self.src.data[idx + 1];
						b += weight * self.src.data[idx + 2];
					}
				}
			}
			
			var idx = (v * self.dest.width + u) * 3;
			self.dest.data[idx] = r / a;
			self.dest.data[idx + 1] = g / a;
			self.dest.data[idx + 2] = b / a;
		}

		if (++u < self.dest.width)
			return self.process1(self, u);
		else
			return self.process2(self);
	},
	process2: function(self) {
		self.resizeCanvas(self.canvas, self.dest.width, self.dest.height);
		self.ctx.drawImage(self.img, 0, 0, self.dest.width, self.dest.height);
		self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
		var idx, idx2;
		for (var i = 0; i < self.dest.width; i++) {
			for (var j = 0; j < self.dest.height; j++) {
				idx = (j * self.dest.width + i) * 3;
				idx2 = (j * self.dest.width + i) * 4;
				self.src.data[idx2] = self.dest.data[idx];
				self.src.data[idx2 + 1] = self.dest.data[idx + 1];
				self.src.data[idx2 + 2] = self.dest.data[idx + 2];
			}
		}
		if(self.options.returnType == 0) { /* undefined */
			self.ctx.putImageData(self.src, 0, 0);
		} else if(self.options.returnType == 1) { /* dataURI */
			self.ctx.putImageData(self.src, 0, 0);
			if(self.ext == 'jpeg' || self.ext == 'jpg') {
				return self.canvas.toDataURL('image/jpeg', self.options.imgExportQuality/100);
			} else {
				return self.canvas.toDataURL('image/'+self.ext, self.options.imgExportQuality/100);
			}
		} else { /* imageData */
			return self.src;
		}
	}
}