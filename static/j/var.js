'use strict';
var tabs = [
	{ key: 'face', name: '脸型', icon: 'static/i/tabs/tab-face.png' },
	{ key: 'eye', name: '眼睛', icon: 'static/i/tabs/tab-eye.png' },
	{ key: 'brow', name: '眉毛', icon: 'static/i/tabs/tab-brow.png' },
	{ key: 'beard', name: '胡须', icon: 'static/i/tabs/tab-beard.png' },
	{ key: 'nose', name: '鼻子', icon: 'static/i/tabs/tab-nose.png' },
	{ key: 'hair', name: '头发', icon: 'static/i/tabs/tab-hair.png' },
	{ key: 'lips', name: '嘴巴', icon: 'static/i/tabs/tab-lips.png' },
	{ key: 'glass', name: '眼镜', icon: 'static/i/tabs/tab-glass.png' },
	{ key: 'gesture', name: '手势', icon: 'static/i/tabs/tab-gesture.png' },
	{ key: 'headdress', name: '头饰', icon: 'static/i/tabs/tab-hat.png' }
];
var boards = [
	{
		key: 'face', isface: 1, zindex: 0, dragged: false, items: [
			{ id: 1, icon: 'static/i/icon/icon-face-1.png', src: 'static/i/emoji/emoji-face-1.png', pos: { left: '50%', top: '50%' } },
			{ id: 57, icon: 'static/i/icon/icon-face-57.png', src: 'static/i/emoji/emoji-face-57.png', pos: { left: 0, top: 0 } },
			{ id: 58, icon: 'static/i/icon/icon-face-58.png', src: 'static/i/emoji/emoji-face-58.png', pos: { left: 0, top: 0 } },
			{ id: 59, icon: 'static/i/icon/icon-face-59.png', src: 'static/i/emoji/emoji-face-59.png', pos: { left: 0, top: 0 } },
			{ id: 60, icon: 'static/i/icon/icon-face-60.png', src: 'static/i/emoji/emoji-face-60.png', pos: { left: 0, top: 0 } },
			{ id: 61, icon: 'static/i/icon/icon-face-61.png', src: 'static/i/emoji/emoji-face-61.png', pos: { left: 0, top: 0 } },
			{ id: 62, icon: 'static/i/icon/icon-face-62.png', src: 'static/i/emoji/emoji-face-62.png', pos: { left: 0, top: 0 } },
			{ id: 63, icon: 'static/i/icon/icon-face-63.png', src: 'static/i/emoji/emoji-face-63.png', pos: { left: 0, top: 0 } },
			{ id: 64, icon: 'static/i/icon/icon-face-64.png', src: 'static/i/emoji/emoji-face-64.png', pos: { left: 0, top: 0 } },
			{ id: 65, icon: 'static/i/icon/icon-face-65.png', src: 'static/i/emoji/emoji-face-65.png', pos: { left: 0, top: 0 } },

			{ id: 55, icon: 'static/i/icon/icon-face-55.png', src: 'static/i/emoji/emoji-face-55.png', pos: { left: '50%', top: 0 } },
			{ id: 56, icon: 'static/i/icon/icon-face-56.png', src: 'static/i/emoji/emoji-face-56.png', pos: { left: '50%', top: 0 } },
			{ id: 47, icon: 'static/i/icon/icon-face-47.png', src: 'static/i/emoji/emoji-face-47.png', pos: { left: '50%', top: 0 } },
			{ id: 48, icon: 'static/i/icon/icon-face-48.png', src: 'static/i/emoji/emoji-face-48.png', pos: { left: '50%', top: 0 } },
			{ id: 53, icon: 'static/i/icon/icon-face-53.png', src: 'static/i/emoji/emoji-face-53.png', pos: { left: '50%', top: 0 } },

			{ id: 2, icon: 'static/i/icon/icon-face-2.png', src: 'static/i/emoji/emoji-face-2.png', pos: { left: '50%', top: '50%' } },
			{ id: 3, icon: 'static/i/icon/icon-face-3.png', src: 'static/i/emoji/emoji-face-3.png', pos: { left: '50%', top: '50%' } },
			{ id: 4, icon: 'static/i/icon/icon-face-4.png', src: 'static/i/emoji/emoji-face-4.png', pos: { left: '50%', top: '50%' } },
			{ id: 5, icon: 'static/i/icon/icon-face-5.png', src: 'static/i/emoji/emoji-face-5.png', pos: { left: '50%', top: '50%' } },
			{ id: 6, icon: 'static/i/icon/icon-face-6.png', src: 'static/i/emoji/emoji-face-6.png', pos: { left: '50%', top: '50%' } },
			{ id: 7, icon: 'static/i/icon/icon-face-7.png', src: 'static/i/emoji/emoji-face-7.png', pos: { left: '50%', top: '50%' } },
			{ id: 8, icon: 'static/i/icon/icon-face-8.png', src: 'static/i/emoji/emoji-face-8.png', pos: { left: '50%', top: '50%' } },
			{ id: 9, icon: 'static/i/icon/icon-face-9.png', src: 'static/i/emoji/emoji-face-9.png', pos: { left: '50%', top: '50%' } },
			{ id: 10, icon: 'static/i/icon/icon-face-10.png', src: 'static/i/emoji/emoji-face-10.png', pos: { left: '50%', top: '50%' } },
			{ id: 11, icon: 'static/i/icon/icon-face-11.png', src: 'static/i/emoji/emoji-face-11.png', pos: { left: '50%', top: '50%' } },
			{ id: 12, icon: 'static/i/icon/icon-face-12.png', src: 'static/i/emoji/emoji-face-12.png', pos: { left: '50%', top: '50%' } }
		]
	},
	{
		key: 'eye', isface: 0, zindex: 1, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 57, icon: 'static/i/icon/icon-eye-57.png', src: 'static/i/emoji/emoji-eye-57.png', pos: { left: 42, top: 121 } },
			{ id: 58, icon: 'static/i/icon/icon-eye-58.png', src: 'static/i/emoji/emoji-eye-58.png', pos: { left: 115, top: 113 } },
			{ id: 59, icon: 'static/i/icon/icon-eye-59.png', src: 'static/i/emoji/emoji-eye-59.png', pos: { left: 109, top: 159 } },
			{ id: 60, icon: 'static/i/icon/icon-eye-60.png', src: 'static/i/emoji/emoji-eye-60.png', pos: { left: 109, top: 212 } },
			{ id: 61, icon: 'static/i/icon/icon-eye-61.png', src: 'static/i/emoji/emoji-eye-61.png', pos: { left: 111, top: 191 } },
			{ id: 62, icon: 'static/i/icon/icon-eye-62.png', src: 'static/i/emoji/emoji-eye-62.png', pos: { left: 117, top: 159 } },
			{ id: 63, icon: 'static/i/icon/icon-eye-63.png', src: 'static/i/emoji/emoji-eye-63.png', pos: { left: 102, top: 203 } },
			{ id: 64, icon: 'static/i/icon/icon-eye-64.png', src: 'static/i/emoji/emoji-eye-64.png', pos: { left: 118, top: 194 } },
			{ id: 65, icon: 'static/i/icon/icon-eye-65.png', src: 'static/i/emoji/emoji-eye-65.png', pos: { left: 111, top: 167 } },
		]
	},
	{
		key: 'brow', isface: 0, zindex: 2, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 50, icon: 'static/i/icon/icon-brow-50.png', src: 'static/i/emoji/emoji-brow-50.png', pos: { left: 97, top: 182 } },
			{ id: 51, icon: 'static/i/icon/icon-brow-51.png', src: 'static/i/emoji/emoji-brow-51.png', pos: { left: 93, top: 144 } },
			{ id: 52, icon: 'static/i/icon/icon-brow-52.png', src: 'static/i/emoji/emoji-brow-52.png', pos: { left: 97, top: 178 } },
			{ id: 53, icon: 'static/i/icon/icon-brow-53.png', src: 'static/i/emoji/emoji-brow-53.png', pos: { left: 93, top: 181 } },
			{ id: 54, icon: 'static/i/icon/icon-brow-54.png', src: 'static/i/emoji/emoji-brow-54.png', pos: { left: 105, top: 193 } },
			{ id: 55, icon: 'static/i/icon/icon-brow-55.png', src: 'static/i/emoji/emoji-brow-55.png', pos: { left: 104, top: 152 } },

			// {id:66,icon:'static/i/icon/icon-brow-66.png',src:'static/i/emoji/emoji-brow-66.png',pos:{left:'50%',top:75}},
			{ id: 67, icon: 'static/i/icon/icon-brow-46.png', src: 'static/i/emoji/emoji-brow-46.png', pos: { left: '50%', top: 75 } },
			{ id: 68, icon: 'static/i/icon/icon-brow-47.png', src: 'static/i/emoji/emoji-brow-47.png', pos: { left: '50%', top: 40 } },
			{ id: 69, icon: 'static/i/icon/icon-brow-48.png', src: 'static/i/emoji/emoji-brow-48.png', pos: { left: '50%', top: 10 } },
			{ id: 70, icon: 'static/i/icon/icon-brow-49.png', src: 'static/i/emoji/emoji-brow-49.png', pos: { left: '50%', top: 0 } }
		]
	},
	{
		key: 'beard', isface: 0, zindex: 5, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 1, icon: 'static/i/icon/icon-beard-1.png', src: 'static/i/emoji/emoji-beard-1.png', pos: { left: 130, top: 254 } },
			{ id: 2, icon: 'static/i/icon/icon-beard-2.png', src: 'static/i/emoji/emoji-beard-2.png', pos: { left: '50%', top: 258 } },
			{ id: 3, icon: 'static/i/icon/icon-beard-3.png', src: 'static/i/emoji/emoji-beard-3.png', pos: { left: '50%', top: 254 } },
			{ id: 4, icon: 'static/i/icon/icon-beard-4.png', src: 'static/i/emoji/emoji-beard-4.png', pos: { left: '50%', top: 254 } },
			{ id: 5, icon: 'static/i/icon/icon-beard-5.png', src: 'static/i/emoji/emoji-beard-5.png', pos: { left: '50%', top: 244 } },
			{ id: 6, icon: 'static/i/icon/icon-beard-6.png', src: 'static/i/emoji/emoji-beard-6.png', pos: { left: '50%', top: 244 } },
			{ id: 7, icon: 'static/i/icon/icon-beard-7.png', src: 'static/i/emoji/emoji-beard-7.png', pos: { left: '50%', top: 244 } },
			{ id: 8, icon: 'static/i/icon/icon-beard-8.png', src: 'static/i/emoji/emoji-beard-8.png', pos: { left: '50%', top: 244 } },
			{ id: 9, icon: 'static/i/icon/icon-beard-9.png', src: 'static/i/emoji/emoji-beard-9.png', pos: { left: '50%', top: 244 } },
			{ id: 10, icon: 'static/i/icon/icon-beard-10.png', src: 'static/i/emoji/emoji-beard-10.png', pos: { left: '50%', top: 244 } }
		]
	},
	{
		key: 'nose', isface: 0, zindex: 4, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 40, icon: 'static/i/icon/icon-nose-40.png', src: 'static/i/emoji/emoji-nose-40.png', pos: { left: 166, top: 195 } },
			{ id: 41, icon: 'static/i/icon/icon-nose-41.png', src: 'static/i/emoji/emoji-nose-41.png', pos: { left: 66, top: 220 } },
			{ id: 42, icon: 'static/i/icon/icon-nose-42.png', src: 'static/i/emoji/emoji-nose-42.png', pos: { left: 169, top: 223 } },
			{ id: 43, icon: 'static/i/icon/icon-nose-43.png', src: 'static/i/emoji/emoji-nose-43.png', pos: { left: 162, top: 205 } },
			{ id: 44, icon: 'static/i/icon/icon-nose-44.png', src: 'static/i/emoji/emoji-nose-44.png', pos: { left: 169, top: 200 } },
			{ id: 45, icon: 'static/i/icon/icon-nose-45.png', src: 'static/i/emoji/emoji-nose-45.png', pos: { left: 160, top: 175 } },
			{ id: 46, icon: 'static/i/icon/icon-nose-46.png', src: 'static/i/emoji/emoji-nose-46.png', pos: { left: 228, top: 237 } },
			{ id: 47, icon: 'static/i/icon/icon-nose-47.png', src: 'static/i/emoji/emoji-nose-47.png', pos: { left: 176, top: 213 } },
			{ id: 48, icon: 'static/i/icon/icon-nose-48.png', src: 'static/i/emoji/emoji-nose-48.png', pos: { left: 170, top: 225 } }
		]
	},
	{
		key: 'hair', isface: 0, zindex: 6, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 41, icon: 'static/i/icon/icon-hair-41.png', src: 'static/i/emoji/emoji-hair-41.png', pos: { left: 3, top: 2 } },
			{ id: 42, icon: 'static/i/icon/icon-hair-42.png', src: 'static/i/emoji/emoji-hair-42.png', pos: { left: 1, top: 2 } },
			{ id: 43, icon: 'static/i/icon/icon-hair-43.png', src: 'static/i/emoji/emoji-hair-43.png', pos: { left: 1, top: 2 } },
			{ id: 44, icon: 'static/i/icon/icon-hair-44.png', src: 'static/i/emoji/emoji-hair-44.png', pos: { left: 3, top: 2 } },

			{ id: 1, icon: 'static/i/icon/icon-hair-1.png', src: 'static/i/emoji/emoji-hair-1.png', pos: { left: '50%', top: -16 } },
			{ id: 2, icon: 'static/i/icon/icon-hair-2.png', src: 'static/i/emoji/emoji-hair-2.png', pos: { left: '50%', top: -16 } },
			{ id: 3, icon: 'static/i/icon/icon-hair-3.png', src: 'static/i/emoji/emoji-hair-3.png', pos: { left: '50%', top: -16 } },
			{ id: 4, icon: 'static/i/icon/icon-hair-4.png', src: 'static/i/emoji/emoji-hair-4.png', pos: { left: '50%', top: 0 } },
			{ id: 5, icon: 'static/i/icon/icon-hair-5.png', src: 'static/i/emoji/emoji-hair-5.png', pos: { left: '50%', top: 0 } }
		]
	},
	{
		key: 'lips', isface: 0, zindex: 3, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 52, icon: 'static/i/icon/icon-lips-52.png', src: 'static/i/emoji/emoji-lips-52.png', pos: { left: 162, top: 304 } },
			{ id: 53, icon: 'static/i/icon/icon-lips-53.png', src: 'static/i/emoji/emoji-lips-53.png', pos: { left: 129, top: 253 } },
			{ id: 54, icon: 'static/i/icon/icon-lips-54.png', src: 'static/i/emoji/emoji-lips-54.png', pos: { left: 156, top: 297 } },
			{ id: 55, icon: 'static/i/icon/icon-lips-55.png', src: 'static/i/emoji/emoji-lips-55.png', pos: { left: 125, top: 281 } },
			{ id: 56, icon: 'static/i/icon/icon-lips-56.png', src: 'static/i/emoji/emoji-lips-56.png', pos: { left: 153, top: 313 } },
			{ id: 57, icon: 'static/i/icon/icon-lips-57.png', src: 'static/i/emoji/emoji-lips-57.png', pos: { left: 143, top: 283 } },
			{ id: 58, icon: 'static/i/icon/icon-lips-58.png', src: 'static/i/emoji/emoji-lips-58.png', pos: { left: 55, top: 259 } },
			{ id: 59, icon: 'static/i/icon/icon-lips-59.png', src: 'static/i/emoji/emoji-lips-59.png', pos: { left: 145, top: 294 } },
			{ id: 60, icon: 'static/i/icon/icon-lips-60.png', src: 'static/i/emoji/emoji-lips-60.png', pos: { left: 127, top: 264 } }
		]
	},
	{
		key: 'glass', isface: 0, zindex: 7, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 41, icon: 'static/i/icon/icon-glass-41.png', src: 'static/i/emoji/emoji-glass-41.png', pos: { left: 63, top: 164 } },
			{ id: 42, icon: 'static/i/icon/icon-glass-42.png', src: 'static/i/emoji/emoji-glass-42.png', pos: { left: 63, top: 164 } },
			{ id: 43, icon: 'static/i/icon/icon-glass-43.png', src: 'static/i/emoji/emoji-glass-43.png', pos: { left: 63, top: 164 } },

			{ id: 1, icon: 'static/i/icon/icon-glass-1.png', src: 'static/i/emoji/emoji-glass-1.png', pos: { left: '50%', top: 107 } },
			{ id: 2, icon: 'static/i/icon/icon-glass-2.png', src: 'static/i/emoji/emoji-glass-2.png', pos: { left: '50%', top: 107 } },
			{ id: 3, icon: 'static/i/icon/icon-glass-3.png', src: 'static/i/emoji/emoji-glass-3.png', pos: { left: '50%', top: 107 } },
			{ id: 4, icon: 'static/i/icon/icon-glass-4.png', src: 'static/i/emoji/emoji-glass-4.png', pos: { left: '50%', top: 110 } },
			{ id: 5, icon: 'static/i/icon/icon-glass-5.png', src: 'static/i/emoji/emoji-glass-5.png', pos: { left: '50%', top: 110 } },
			{ id: 6, icon: 'static/i/icon/icon-glass-6.png', src: 'static/i/emoji/emoji-glass-6.png', pos: { left: '50%', top: 110 } }
		]
	},
	{
		key: 'gesture', isface: 0, zindex: 9, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 48, icon: 'static/i/icon/icon-gesture-48.png', src: 'static/i/emoji/emoji-gesture-48.png', pos: { left: '50%', top: 60 } },
			{ id: 49, icon: 'static/i/icon/icon-gesture-49.png', src: 'static/i/emoji/emoji-gesture-49.png', pos: { left: 100, top: 280 } },
			{ id: 46, icon: 'static/i/icon/icon-gesture-46.png', src: 'static/i/emoji/emoji-gesture-46.png', pos: { left: 75, top: 170 } },
			{ id: 47, icon: 'static/i/icon/icon-gesture-47.png', src: 'static/i/emoji/emoji-gesture-47.png', pos: { left: 90, top: 180 } },

			{ id: 1, icon: 'static/i/icon/icon-gesture-1.png', src: 'static/i/emoji/emoji-gesture-1.png', pos: { left: 2, top: 229 } },
			{ id: 2, icon: 'static/i/icon/icon-gesture-2.png', src: 'static/i/emoji/emoji-gesture-2.png', pos: { left: 287, top: 223 } },
			{ id: 3, icon: 'static/i/icon/icon-gesture-3.png', src: 'static/i/emoji/emoji-gesture-3.png', pos: { left: '50%', top: 331 } },
			{ id: 4, icon: 'static/i/icon/icon-gesture-4.png', src: 'static/i/emoji/emoji-gesture-4.png', pos: { left: 241, top: 235 } },
			{ id: 5, icon: 'static/i/icon/icon-gesture-5.png', src: 'static/i/emoji/emoji-gesture-5.png', pos: { left: 38, top: 236 } }

		]
	},
	{
		key: 'headdress', isface: 0, zindex: 8, dragged: true, items: [
			{ id: 0, isdelete: true, icon: 'static/i/icon-delete2.png', src: '', pos: {} },
			{ id: 48, icon: 'static/i/icon/icon-headdress-48.png', src: 'static/i/emoji/emoji-headdress-48.png', pos: { left: 69, top: 90 } },
			{ id: 49, icon: 'static/i/icon/icon-headdress-49.png', src: 'static/i/emoji/emoji-headdress-49.png', pos: { left: 17, top: 251 } },
			{ id: 50, icon: 'static/i/icon/icon-headdress-50.png', src: 'static/i/emoji/emoji-headdress-50.png', pos: { left: 243, top: 242 } },
			{ id: 51, icon: 'static/i/icon/icon-headdress-51.png', src: 'static/i/emoji/emoji-headdress-51.png', pos: { left: 243, top: 242 } },
			{ id: 52, icon: 'static/i/icon/icon-headdress-52.png', src: 'static/i/emoji/emoji-headdress-52.png', pos: { left: 243, top: 242 } },
			{ id: 53, icon: 'static/i/icon/icon-headdress-53.png', src: 'static/i/emoji/emoji-headdress-53.png', pos: { left: 26, top: 233 } },
			{ id: 54, icon: 'static/i/icon/icon-headdress-54.png', src: 'static/i/emoji/emoji-headdress-54.png', pos: { left: 243, top: 242 } },
			{ id: 55, icon: 'static/i/icon/icon-headdress-55.png', src: 'static/i/emoji/emoji-headdress-55.png', pos: { left: 243, top: 242 } },
			{ id: 56, icon: 'static/i/icon/icon-headdress-56.png', src: 'static/i/emoji/emoji-headdress-56.png', pos: { left: 69, top: 90 } }
		]
	}
];
