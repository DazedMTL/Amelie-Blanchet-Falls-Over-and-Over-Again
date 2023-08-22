//=============================================================================
// TRP_CORE.js
//=============================================================================
// このソフトウェアの一部にMITライセンスで配布されている製作物が含まれています。
// http://www.opensource.org/licenses/mit-license

/*:
 * @target MZ
 * @plugindesc 基盤プラグイン(なるべく前に配置)
 * @author Thirop
 * @help
 * 基盤関数の定義を行っているプラグイン。
 * プラグイン設定にてなるべく前に配置
 *
 * 【更新履歴】
 * 1.28 2022/01/28 修正:pixi-picture_for_MZ_160.js導入順の依存解消
 * 1.25 2022/01/20 追加:プラグインパラメータのパース機能
 * 1.24 2022/01/19 追加:ブレンドフィルターサポート。独自TilingSprite。
 * 1.17 2022/01/10 修正:MVでの画像書き出し機能不具合
 * 1.14 2022/12/24 修正:ウィンドウリサイズ不具合@コアv1.6.0
 * 1.07 2022/11/14 追加:タイル画像の描画関数
 *
 * 
 *
 * @param backupPath
 * @text バックアップ保存パス
 * @desc マップ保存時のバックアップファイルの保存パス。デフォ値は「_dev/backup/」
 * @default _dev/backup/
 * @type string
 *
 *
 */
//============================================================================= 
// nw.Window.get().showDevTools();



//================================================
// [TRP_CORE]
//================================================
// Core Class Extend
// Other Utils
// Random Number
// FadableSprite
// DrawTileImage


//================================================
// [TRP_Sprite]
//================================================
// TRP_Animator
// AnimationBase
// Sequence
// Set
// Skew
// TRP_Container
// TRP_Sprite
// TRP_TilingSprites
// ApplyBlendFilter

//================================================
// [DevFuncs]
//================================================
// File Access
// Window_TrpDevToolsBase
// Debug Text
// Tonner > _Dev.tonnerTiles()
// Resize Window
// Clipboard
// Save Image
// Save Map
// Others





var TRP_CORE = TRP_CORE || {};
function TRP_Animator() {
	this.initialize.apply(this, arguments);
}




//=============================================================================
// [TRP_CORE]
//=============================================================================
(function () {
	'use strict';

	var pluginName = 'TRP_CORE';
	var parameters = PluginManager.parameters(pluginName);
	var isMZ = Utils.RPGMAKER_NAME === "MZ";



	var _Scene_Boot_initialize = Scene_Boot.prototype.initialize;
	Scene_Boot.prototype.initialize = function () {
		TRP_CORE.USE_BLEND_FILTER = !!(PIXI.picture && PIXI.picture.getBlendFilter);
		_Scene_Boot_initialize.call(this, ...arguments);
	};


	TRP_CORE.BACK_UP_DIR = parameters.backupPath || '_dev/backup/'
	if (TRP_CORE.BACK_UP_DIR[TRP_CORE.BACK_UP_DIR.length - 1] !== '/') {
		TRP_CORE.BACK_UP_DIR = TRP_CORE.BACK_UP_DIR + '/';
	}

	TRP_CORE.mapFileName = function (mapId = $gameMap._mapId) {
		return 'Map' + mapId.padZero(3) + '.json';
	};
	TRP_CORE.mapFilePath = function (mapId = $gameMap._mapId) {
		return 'data/' + this.mapFileName(mapId);
	};
	TRP_CORE.backupMapFilePath = function (mapId = $gameMap._mapId) {
		return TRP_CORE.BACK_UP_DIR + this.mapFileName(mapId);
	}



	/* supplement
	===================================*/
	TRP_CORE.supplement = function (defaultValue, optionArg) {
		if (optionArg === undefined) {
			return defaultValue;
		}
		return optionArg;
	};
	TRP_CORE.supplementNum = function (defaultValue, optionArg) {
		return Number(TRP_CORE.supplement(defaultValue, optionArg));
	};

	TRP_CORE.supplementDef = function (defaultValue, optionArg, otherWords) {
		var value = TRP_CORE.supplement(defaultValue, optionArg);

		var defTargetWords = otherWords || [];
		defTargetWords.push('default');
		defTargetWords.push('def');
		defTargetWords.push('d');
		for (var i = 0; i < defTargetWords.length; i++) {
			var target = defTargetWords[i];
			if (value === target) {
				value = defaultValue;
				break;
			}
		}
		return value;
	};
	TRP_CORE.supplementDefNum = function (defaultValue, optionArg, otherWords) {
		var value = TRP_CORE.supplementDef(defaultValue, optionArg, otherWords);
		return Number(value);
	};
	TRP_CORE.supplementDefBool = function (defaultValue, optionArg, otherWords) {
		var value = TRP_CORE.supplementDef(defaultValue, optionArg, otherWords);
		if (value === 'true' || value === 't') {
			value = true;
		} else if (value === 'false' || value === 'f') {
			value = false;
		} else if (value) {
			value = true;
		} else {
			value = false;
		}
		return value;
	};


	//=============================================================================
	// Core Class Extend
	//=============================================================================
	TRP_CORE.randomRateWithRange = function (range = 0.0, rand = Math.random()) {
		return 1 - range + 2 * range * rand;
	};

	TRP_CORE.randomRound = function (value, rand = Math.random()) {
		var lower = Math.floor(value);
		var decimal = value - lower;
		return (rand <= decimal) ? lower : lower + 1;
	};



	/* Array
	===================================*/
	TRP_CORE.packValues = function (arr, value, length = arr.length) {
		for (var i = 0; i < length; i = (i + 1) | 0) {
			arr[i] = value;
		}
		return arr;
	};
	TRP_CORE.packSequence = function (arr, length, v0 = 0) {
		for (var i = 0; i < length; i = (i + 1) | 0) {
			arr[i] = v0 + i;
		}
		return arr;
	}

	TRP_CORE.last = function (arr) {
		return arr.length > 0 ? arr[arr.length - 1] : null;
	}
	TRP_CORE.remove = function (arr, target) {
		for (var i = arr.length - 1; i >= 0; i = (i - 1) | 0) {
			if (arr[i] === target) {
				arr.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	TRP_CORE.random = function (arr, rand = Math.random()) {
		if (arr.length <= 0) return null;
		var n = Math.floor(rand * arr.length);
		return arr[n];
	};
	TRP_CORE.randomShift = function (arr, rand = Math.random()) {
		if (arr.length <= 0) return null;
		var n = Math.floor(rand * arr.length);
		var ret = arr[n];
		arr.splice(n, 1);
		return ret;
	};
	TRP_CORE.removeArray = function (arr, arr2) {
		if (!arr || !arr2) return;
		for (var i = arr.length - 1; i >= 0; i = (i - 1) | 0) {
			if (arr2.indexOf(arr[i]) >= 0) {
				arr.splice(i, 1);
				if (arr2.length === 0) return;
			}
		}
	};
	TRP_CORE.uniquePush = function (arr, target) {
		if (arr.indexOf(target) < 0) {
			arr.push(target);
			return true;
		}
		return false;
	};
	TRP_CORE.uniquePushArray = function (arr, target) {
		for (const elem of target) {
			this.uniquePush(arr, elem);
		}
	};
	TRP_CORE.shuffle = function (arr) {
		var length = arr.length;
		for (var i = length - 1; i > 0; i = (i - 1) | 0) {
			var r = Math.floor(Math.random() * (i + 1));
			var tmp = arr[i];
			arr[i] = arr[r];
			arr[r] = tmp;
		}
		return arr;
	};
	TRP_CORE.prepareArray = function (arr) {
		arr.length = 0;
		return arr;
	}



	/* str
	===================================*/
	TRP_CORE.capitalize = function (str) {
		return str[0].toUpperCase() + str.substring(1);
	}


	/* Number
	===================================*/
	TRP_CORE.decimal = function (num) {
		var numStr = String(num);
		var index = numStr.indexOf('.');
		if (index < 0) {
			return 0;
		} else {
			return numStr.length - (index + 1);
		}
	};
	TRP_CORE.withDecimal = function (num, length) {
		if (length <= 0) return String(num);

		num = Number(num);
		for (var i = 0; i < length; i = (i + 1) | 0) {
			num *= 10;
		}
		num = Math.round(num);

		var sign = num < 0 ? '-' : '';
		num = Math.abs(num);

		var numStr = String(num);
		var numLen = numStr.length;
		while (numStr.length < length) {
			numStr = '0' + numStr;
		}

		numStr = numStr.substring(0, numStr.length - length) + '.' + numStr.substr(numStr.length - length);
		if (numStr[0] === '.') {
			numStr = '0' + numStr;
		}
		return sign + numStr;
	};




	//=============================================================================
	// Other Utils
	//=============================================================================
	TRP_CORE.snap = function (stage, width = Graphics.width, height = Graphics.height) {
		var bitmap = new Bitmap(width, height);
		var renderTexture = PIXI.RenderTexture.create(width, height);
		if (stage) {
			var renderer = isMZ ? Graphics.app.renderer : Graphics._renderer;
			renderer.render(stage, renderTexture);
			stage.worldTransform.identity();
			var canvas;
			if (isMZ) {
				canvas = renderer.extract.canvas(renderTexture);
			} else {
				if (Graphics.isWebGL()) {
					canvas = Graphics._renderer.extract.canvas(renderTexture);
				} else {
					canvas = renderTexture.baseTexture._canvasRenderTarget.canvas;
				}
			}
			bitmap.context.drawImage(canvas, 0, 0);
			canvas.width = 0;
			canvas.height = 0;
		}
		renderTexture.destroy({ destroyBase: true });

		if (isMZ) {
			bitmap.baseTexture.update();
		} else {
			bitmap._setDirty();
		}
		return bitmap;
	};

	TRP_CORE.parsePluginParameters = function (parameters) {
		return JSON.parse(JSON.stringify(parameters, function (key, value) {
			try {
				if (typeof value === 'string') {
					if (value[0] === '"') {
						return value.substring(1, value.length - 1);
					} else if (value[0] === '[' || value[0] === '{') {
						return JSON.parse(value)
					} else if (!isNaN(value)) {
						return Number(value);
					} else if (value === 'true') {
						return true;
					} else if (value === 'false') {
						return false;
					} else {
						return value;
					}
				} else {
					return value;
				}
			} catch (e) {
				return value;
			}
		}));
	}



	//=============================================================================
	// Random Number
	//=============================================================================
	TRP_CORE.randomFloat = function (max, min) {
		return new RandomFloat(max, min);
	}
	var RandomFloat = TRP_CORE.RandomFloat = function RandomFloat() {
		this.initialize.apply(this, arguments);
	};
	RandomFloat.prototype = Object.create(Number.prototype);
	RandomFloat.prototype.constructor = RandomFloat;

	RandomFloat.prototype.initialize = function (max, min = 0) {
		this._max = max;
		this._min = min;
	};
	RandomFloat.prototype.valueOf = function () {
		return Math.random() * (this._max - this._min) + this._min;
	};
	RandomFloat.prototype.toString = function () {
		return String(this.valueOf());
	};


	TRP_CORE.randomInt = function (max, min) {
		return new RandomInt(max, min);
	}
	var RandomInt = TRP_CORE.RandomInt = function RandomInt() {
		this.initialize.apply(this, arguments);
	};
	RandomInt.prototype = Object.create(Number.prototype);
	RandomInt.prototype.constructor = RandomInt;

	RandomInt.prototype.initialize = function (max, min = 0) {
		this._max = max;
		this._min = min;
	};
	RandomInt.prototype.valueOf = function () {
		return Math.randomInt(this._max - this._min + 1) + this._min
	};
	RandomInt.prototype.toString = function () {
		return String(this.valueOf());
	};







	//=============================================================================
	// FadableSprite
	//=============================================================================
	var FadableSprite = TRP_CORE.FadableSprite = function FadableSprite() {
		this.initialize.apply(this, arguments);
	}
	FadableSprite.prototype = Object.create(Sprite.prototype);
	FadableSprite.prototype.constructor = FadableSprite;
	FadableSprite.prototype.initialize = function (bitmap) {
		Sprite.prototype.initialize.call(this, bitmap);
		this.clearFade();
	};
	FadableSprite.prototype.terminate = function () {
		this._fadeCompletion = null;
	};

	FadableSprite.prototype.update = function () {
		if (this._fadeDelay > 0) {
			this._fadeDelay -= 1;
		} else if (this._fadeCount > 0) {
			this.opacity -= this.opacity / this._fadeCount;
			this._fadeCount -= 1;
			if (this._fadeCount <= 0) {
				this._fadeCount = 0;
				this.opacity -= this.opacity / this._fadeCount;
				this.visible = false;

				if (this._fadeCompletion) {
					this._fadeCompletion(this);
					this._fadeCompletion = null;
				}
			}
		}

		if (this.children.length > 0) {
			for (var i = this.children.length - 1; i >= 0; i = (i - 1) | 0) {
				var child = this.children[i];
				if (child.update) child.update();
			}
		}
	};
	FadableSprite.prototype.clearFade = function () {
		this._fadeDelay = 0;
		this._fadeCount = -1;
		this._fadeCompletion = null;
		this.visible = true;
	};
	FadableSprite.prototype.startFadeOut = function (duration, delay = 0, completion = null) {
		this._fadeDelay = delay;
		this._fadeCount = duration;
		this._fadeCompletion = completion;

		this.opacity = 255;
		this.visible = true;
	};




	//=============================================================================
	// DrawTileImage
	//=============================================================================
	TRP_CORE.activeTilemap = function () {
		return SceneManager._scene._spriteset._tilemap
	};
	TRP_CORE.bltImage = function (bitmap, source, sx, sy, sw, sh, dx, dy, dw, dh) {
		if (isMZ) {
			bitmap.blt(source, sx, sy, sw, sh, dx, dy, dw, dh);
		} else {
			bitmap.bltImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
		}
	}
	TRP_CORE._drawTile = function (bitmap, tileId, dx, dy, bitmaps) {
		if (Tilemap.isVisibleTile(tileId)) {
			if (Tilemap.isAutotile(tileId)) {
				this._drawAutotile(bitmap, tileId, dx, dy, bitmaps);
			} else {
				this._drawNormalTile(bitmap, tileId, dx, dy, bitmaps);
			}
		}
	};
	TRP_CORE._drawNormalTile = function (bitmap, tileId, dx, dy, bitmaps) {
		var setNumber = 0;
		if (Tilemap.isTileA5(tileId)) {
			setNumber = 4;
		} else {
			setNumber = 5 + Math.floor(tileId / 256);
		}
		var w = $gameMap.tileWidth();
		var h = $gameMap.tileHeight();
		var sx = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * w;
		var sy = (Math.floor(tileId % 256 / 8) % 16) * h;
		var source = bitmaps[setNumber];
		if (source) {
			TRP_CORE.bltImage(bitmap, source, sx, sy, w, h, dx, dy, w, h);
		}
	};
	TRP_CORE._drawAutotile = function (bitmap, tileId, dx, dy, bitmaps) {
		var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
		var kind = Tilemap.getAutotileKind(tileId);
		var shape = Tilemap.getAutotileShape(tileId);
		var tx = kind % 8;
		var ty = Math.floor(kind / 8);
		var bx = 0;
		var by = 0;
		var setNumber = 0;
		var isTable = false;
		if (Tilemap.isTileA1(tileId)) {
			var waterSurfaceIndex = 0; //[0, 1, 2, 1][this.animationFrame % 4];
			setNumber = 0;
			if (kind === 0) {
				bx = waterSurfaceIndex * 2;
				by = 0;
			} else if (kind === 1) {
				bx = waterSurfaceIndex * 2;
				by = 3;
			} else if (kind === 2) {
				bx = 6;
				by = 0;
			} else if (kind === 3) {
				bx = 6;
				by = 3;
			} else {
				bx = Math.floor(tx / 4) * 8;
				by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
				if (kind % 2 === 0) {
					bx += waterSurfaceIndex * 2;
				}
				else {
					bx += 6;
					autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
					by += 0; //this.animationFrame % 3;
				}
			}
		} else if (Tilemap.isTileA2(tileId)) {
			setNumber = 1;
			bx = tx * 2;
			by = (ty - 2) * 3;
			isTable = this.activeTilemap()._isTableTile(tileId);
		} else if (Tilemap.isTileA3(tileId)) {
			setNumber = 2;
			bx = tx * 2;
			by = (ty - 6) * 2;
			autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
		} else if (Tilemap.isTileA4(tileId)) {
			setNumber = 3;
			bx = tx * 2;
			by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
			if (ty % 2 === 1) {
				autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
			}
		}

		var table = autotileTable[shape];
		var source = bitmaps[setNumber];

		if (table && source) {
			var w1 = $gameMap.tileWidth() / 2;
			var h1 = $gameMap.tileHeight() / 2;
			for (var i = 0; i < 4; i++) {
				var qsx = table[i][0];
				var qsy = table[i][1];
				var sx1 = (bx * 2 + qsx) * w1;
				var sy1 = (by * 2 + qsy) * h1;
				var dx1 = dx + (i % 2) * w1;
				var dy1 = dy + Math.floor(i / 2) * h1;
				if (isTable && (qsy === 1 || qsy === 5)) {
					var qsx2 = qsx;
					var qsy2 = 3;
					if (qsy === 1) {
						qsx2 = [0, 3, 2, 1][qsx];
					}
					var sx2 = (bx * 2 + qsx2) * w1;
					var sy2 = (by * 2 + qsy2) * h1;
					TRP_CORE.bltImage(bitmap, source, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
					dy1 += h1 / 2;
					TRP_CORE.bltImage(bitmap, source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
				} else {
					TRP_CORE.bltImage(bitmap, source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
				}
			}
		}
	};
	TRP_CORE._drawTableEdge = function (bitmap, tileId, dx, dy, bitmaps) {
		if (Tilemap.isTileA2(tileId)) {
			var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
			var kind = Tilemap.getAutotileKind(tileId);
			var shape = Tilemap.getAutotileShape(tileId);
			var tx = kind % 8;
			var ty = Math.floor(kind / 8);
			var setNumber = 1;
			var bx = tx * 2;
			var by = (ty - 2) * 3;
			var table = autotileTable[shape];
			if (table) {
				var source = bitmaps[setNumber];
				var w1 = $gameMap.tileWidth() / 2;
				var h1 = $gameMap.tileHeight() / 2;
				for (var i = 0; i < 2; i++) {
					var qsx = table[2 + i][0];
					var qsy = table[2 + i][1];
					var sx1 = (bx * 2 + qsx) * w1;
					var sy1 = (by * 2 + qsy) * h1 + h1 / 2;
					var dx1 = dx + (i % 2) * w1;
					var dy1 = dy + Math.floor(i / 2) * h1;
					TRP_CORE.bltImage(bitmap, source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
				}
			}
		}
	};



	/* instance cache
	===================================*/
	TRP_CORE._cache = {};
	TRP_CORE.get = function (targetClass) {
		var key = targetClass.prototype.constructor.name;
		if (key) {
			if (this._cache[key] && this._cache[key].length > 0) {
				return this._cache[key].pop();
			}
		}
		return new targetClass();
	};
	TRP_CORE.cache = function (instance) {
		instance.clearForCache();

		var key = instance.constructor.name;
		if (!this._cache[key]) {
			this._cache[key] = []
		}
		if (!this._cache[key].includes(instance)) {
			this._cache[key].push(instance);
		}
	};





})();// end [TRP_CORE]

//=============================================================================
// [TRP_Sprite]
//=============================================================================
(function () {
	'use strict';

	var isMZ = Utils.RPGMAKER_NAME === "MZ";


	//=============================================================================
	// TRP_Animator
	//=============================================================================
	TRP_Animator.prototype.initialize = function () {
		this._animations = [];
	};
	TRP_Animator.prototype.clearForCache = function () {
		for (var i = this._animations.length - 1; i >= 0; i = (i - 1) | 0) {
			TRP_CORE.cache(this._animations[i]);
		}
		this._animations.length = 0;
	};

	TRP_Animator.prototype.update = function (parent) {
		var animation = this._animations[0];
		if (!animation) return;

		if (!animation.isStarted()) {
			animation.start(parent);
		}
		animation.update(parent);
		if (animation.isEnd()) {
			this._animations.shift();
			TRP_CORE.cache(animation);
		}
	};

	TRP_Animator.prototype.push = function (animation) {
		this._animations.push(animation);
		return this;
	};
	TRP_Animator.prototype.add = TRP_Animator.prototype.push;
	TRP_Animator.prototype.unshift = function (animation) {
		this._animations.unshift(animation);
		return this;
	};


	/* helper
	===================================*/
	TRP_Animator.prototype.setSrcPosition = function (x, y, relative) {
		for (const anim of this._animations) {
			anim.setSrcPosition(x, y, relative);
		}
	};



	var $ = TRP_Animator;
	/* factory
	===================================*/
	TRP_Animator.animationsWithArray = function (array) {
		var animations = [];
		for (const anim of array) {
			var type = anim[0];
			switch (type) {
				case 'sequence':
				case 'loop':
				case 'set':
					animations.push(
						this[type](
							this.animationsWithArray(anim.slice(1))
						)
					);
					break;
				default:
					animations.push(
						this[type](...(anim.slice(1)))
					);
					break;
			}
		}

		return animations;
	};





	//=============================================================================
	// AnimationBase
	//=============================================================================
	var Base = $.Base = function Animation___Base() {
		this.initialize.apply(this, arguments);
	}
	$.Wait = $.Base;
	function AnimationBase() {
		this.initialize.apply(this, arguments);
	}

	$.wait = function (duration) {
		return TRP_CORE.get($.Wait).setup(duration);
	};
	$.prototype.wait = function () {
		return this.add($.wait(...arguments));
	};

	/* initialize
	===================================*/
	Base.prototype.initialize = function () {
		this._durationValue = 0;
		this._easing = null;
		this._loop = false;

		this._duration = 0;
		this._count = 0;
	};
	Base.prototype.clearForCache = function () { };
	Base.prototype.setup = function (duration = 0, easing = null, loop = false) {
		this._durationValue = duration;
		this._easing = easing;
		this._loop = loop;

		this._duration = 0;
		this._count = 0;

		return this;
	};

	Base.prototype.isStarted = function () {
		return (this._count !== 0) ? true : false;
	};
	Base.prototype.isEnd = function () {
		return (this._count >= this._duration) ? true : false;
	};

	Base.prototype.update = function (parent) {
		this._count += 1;
	};
	Base.prototype.frameRate = function () {
		if (!this._easing) return this._count / this._duration;
		return TRP_CORE.easing[this._easing](this._count / this._duration);
	};

	Base.prototype.start = function (parent) {
		this._isStarted = true;
		this._duration = this._duration || Number(this._durationValue) || 1;
	};
	Base.prototype.reset = function () {
		this._count = 0;
		this._duration = 0;
		this._isStarted = false;
	};
	Base.prototype.duration = function () {
		if (!this._duration) this._duration = Number(this._durationValue);
		return this._duration;
	};
	Base.prototype.stopLoop = function () { };

	Base.prototype.setSrcPosition = function (x, y, relative) { };

	//=============================================================================
	// Sequence
	//=============================================================================
	var Sequence = $.Sequence = function Animation___Sequence() {
		this.initialize.apply(this, arguments);
	};

	$.sequence = function (animations, loop, easing) {
		return TRP_CORE.get($.Sequence).setup(animations, loop, easing);
	};
	$.prototype.sequence = function (animations, loop, easing) {
		return this.add($.sequence(...arguments));
	};
	$.loop = function (animations, easing) {
		return TRP_CORE.get($.Sequence).setup(animations, true, easing);
	};
	$.prototype.loop = function (animations, easing) {
		return this.add($.sequence(animations, true, easing));
	};


	/* initialize
	===================================*/
	Sequence.prototype = Object.create($.Base.prototype);
	Sequence.prototype.constructor = Sequence;
	Sequence.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._animations = null;
		this._currentIndex = 0;
		this._currentAnimation = null;
		this._loop = false;
	};

	Sequence.prototype.clearForCache = function () {
		Base.prototype.clearForCache.call(this);

		if (this._animations) {
			for (var i = this._animations.length - 1; i >= 0; i = (i - 1) | 0) {
				TRP_CORE.cache(this._animations[i]);
			}
		}
		this._animations = null;
		this._currentAnimation = null;
	};
	Sequence.prototype.setup = function (animations, loop, easing) {
		var duration = 0;
		for (const animation of animations) {
			duration += animation.duration();
		}
		Base.prototype.setup.call(this, duration, easing, loop);

		this._animations = animations.concat();
		this._currentIndex = 0;
		this._currentAnimation = null;
		return this;
	};
	Sequence.prototype.update = function (parent) {
		var length = this._animations.length;
		var animation = this._currentAnimation;
		if (!animation) {
			animation = this._animations[this._currentIndex];
			this._currentAnimation = animation;
			animation.reset();
			animation.start(parent);
		}
		animation.update(parent);
		if (animation.isEnd()) {
			animation._count = 0;
			animation._isStarted = false;

			this._currentAnimation = null;
			this._currentIndex += 1;
		}

		if (this.isEnd() && this._loop) {
			this._currentIndex = 0;
			this._count = 0;
		} else {
			this._count += 1;
		}
	};
	Sequence.prototype.stopLoop = function () {
		this._loop = false;
	};
	Sequence.prototype.isEnd = function () {
		return (this._currentIndex === this._animations.length);
	};
	Sequence.prototype.start = function (parent) {
		this._currentIndex = 0;
	};
	Sequence.prototype.releaseHandler = function () {
		this._animations.forEach(function (animation) {
			if (animation.releaseHandler) animation.releaseHandler();
		});
	};

	Sequence.prototype.duration = function () {
		var frame = 0;
		var length = this._animations.length;
		for (var i = length - 1; i >= 0; i--) {
			var animation = this._animations[i];
			frame += animation.duration();
		}

		return frame;
	};
	Sequence.prototype.setSrcPosition = function (x, y, relative = false) {
		var anim = this._animations ? this._animations[this._currentIndex] : null;
		if (anim) {
			anim.setSrcPosition(x, y, relative);
		}
	};


	//=============================================================================
	// Animation.Set
	//=============================================================================
	var Set = $.Set = function Animation___Set() {
		this.initialize.apply(this, arguments);
	};
	$.set = function (animations) {
		return TRP_CORE.get($.Set).setup(...arguments);
	};
	$.prototype.set = function (animations) {
		return this.add($.set(...arguments));
	};

	Set.prototype = Object.create($.Base.prototype);
	Set.prototype.constructor = Set;
	Set.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._animations = null;
		this._isStarted = false;
		this._isEnd = false;
	};
	Set.prototype.clearForCache = function () {
		Base.prototype.clearForCache.call(this);
		this._animations = null;
	};
	Set.prototype.setup = function (animations) {
		this._animations = animations;
		this._isStarted = false;
		this._isEnd = false;
		return this;
	};

	Set.prototype.update = function (parent) {
		if (this._isEnd) return;

		var length = this._animations.length;
		var isEnd = true;
		for (var i = length - 1; i >= 0; i -= 1) {
			var animation = this._animations[i];
			if (!animation.isEnd()) {
				animation.update(parent);
			}

			if (!animation._loop &&
				!animation.isEnd()) {
				isEnd = false;
			}
		}
		this._isEnd = isEnd;
	};
	Set.prototype.isEnd = function () {
		return this._isEnd;
	};
	Set.prototype.reset = function () {
		this._animations.forEach(function (animation) {
			animation.reset();
		});
		this._isStarted = false;
		this._isEnd = false;
	};
	Set.prototype.start = function (parent) {
		this._isStarted = true;
		var length = this._animations.length;
		for (var i = 0; i < length; i++) {
			var animation = this._animations[i];
			animation.start(parent);
		}
	};
	Set.prototype.isStarted = function () {
		return this._isStarted;
	};
	Set.prototype.releaseHandler = function () {
		this._animations.forEach(function (animation) {
			if (animation.releaseHandler) animation.releaseHandler();
		});
	};
	Set.prototype.duration = function () {
		var maxFrame = 0;
		var length = this._animations.length;
		for (var i = length - 1; i >= 0; i--) {
			var animation = this._animations[i];
			var frame = animation.duration();
			if (maxFrame < frame) {
				maxFrame = frame;
			}
		}
		return maxFrame;
	};
	Set.prototype.setSrcPosition = function (x, y, relative) {
		if (!this._animations) return;
		for (const anim of this._animations) {
			anim.setSrcPosition(x, y, relative);
		}
	};


	//=============================================================================
	// Move
	//=============================================================================
	var Move = $.Move = function Animation___Move() {
		this.initialize.apply(this, arguments);
	}
	$.move = function (duration, x, y, relative, easing) {
		return TRP_CORE.get($.Move).setup(...arguments);
	}
	$.prototype.move = function () {
		return this.add($.move(...arguments))
	}
	Move.prototype = Object.create(Base.prototype);
	Move.prototype.constructor = Move;
	Move.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._xValue = 0;
		this._yValue = 0;
		this._relative = true;
		this._srcX = 0;
		this._srcY = 0;
		this._dstX = 0;
		this._dstY = 0;
	};
	Move.prototype.setup = function (duration, x, y, relative = true, easing) {
		Base.prototype.setup.call(this, duration, easing);
		this._xValue = x;
		this._yValue = y;
		this._relative = relative;
		return this;
	};
	Move.prototype.start = function (parent) {
		Base.prototype.start.call(this, parent);
		this._srcX = parent.x;
		this._srcY = parent.y;
		this._dstX = Number(this._xValue);
		this._dstY = Number(this._yValue);
		if (this._relative) {
			this._dstX += parent.x;
			this._dstY += parent.y;
		}
	};
	Move.prototype.update = function (parent) {
		Base.prototype.update.call(this, parent);

		var fr = this.frameRate();
		parent.x = this._srcX + ((this._dstX - this._srcX) * fr);
		parent.y = this._srcY + ((this._dstY - this._srcY) * fr);
	};

	Move.prototype.setSrcPosition = function (x, y, relative = false) {
		var dx, dy;
		if (relative) {
			dx = x;
			dy = y;
		} else {
			dx = x - this._srcX;
			dy = y - this._srcY;
		}
		this._srcX += dx;
		this._srcY += dy;
		if (this._relative) {
			this._dstX += dx;
			this._dstY += dy;
		}
	};



	//=============================================================================
	// Scale
	//=============================================================================
	var Scale = $.Scale = function Animation___Scale() {
		this.initialize.apply(this, arguments);
	};
	$.scale = function (duration, scaleX, scaleY, relative, easing) {
		return TRP_CORE.get($.Scale).setup(...arguments);
	};
	$.prototype.scale = function (duration, scaleX, scaleY, relative, easing) {
		return this.ad($.scale(...arguments));
	};

	Scale.prototype = Object.create(Base.prototype);
	Scale.prototype.constructor = Scale;
	Scale.prototype.initialize = function () {
		Base.prototype.initialize.call(this);

		this._xValue = 0;
		this._yValue = 0;
		this._relative = false;

		this._dstX = 0;
		this._dstY = 0;
		this._srcX = 0;
		this._srcY = 0;
	};
	Scale.prototype.setup = function (duration, scaleX, scaleY, relative = false, easing) {
		Base.prototype.setup.call(this, duration, easing);
		this._xValue = scaleX;
		this._yValue = scaleY;
		this._relative = relative;
		return this;
	};
	Scale.prototype.start = function (parent) {
		Base.prototype.start.call(this, parent);
		this._srcX = parent.scale.x;
		this._srcY = parent.scale.y;
		this._dstX = Number(this._xValue);
		this._dstY = Number(this._yValue);
		if (this._relative) {
			this._dstX *= this._srcX;
			this._dstY *= this._srcY;
		}
	};
	Scale.prototype.update = function (parent) {
		Base.prototype.update.call(this, parent);

		var fr = this.frameRate();
		parent.scale.set(
			this._srcX + ((this._dstX - this._srcX) * fr)
			, this._srcY + ((this._dstY - this._srcY) * fr)
		);
	};




	//=============================================================================
	// Rotation
	//=============================================================================
	var Rotation = $.Rotation = function Animation___Rotation() {
		this.initialize.apply(this, arguments);
	};
	$.rotation = function (duration, rotation, relative, easing) {
		return TRP_CORE.get($.Rotation).setup(duration, rotation, relative, easing);
	};
	$.rotate = $.rotation;

	$.prototype.rotation = function (duration, rotation, relative, easing) {
		return this.add($.rotation(...arguments));
	};
	$.prototype.rotate = $.prototype.rotation;

	$.angle = function (duration, angle, relative, easing) {
		return TRP_CORE.get($.Rotation).setup(duration, angle * Math.PI / 180, relative, easing);
	};
	$.prototype.angle = function () {
		return this.add($.angle(...arguments));
	};

	Rotation.prototype = Object.create(Base.prototype);
	Rotation.prototype.constructor = Rotation;
	Rotation.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._relative = true;
		this._rotationValue = 0;
		this._srcRotation = 0;
		this._dstRotation = 0;
	};
	Rotation.prototype.setup = function (duration, rotation, relative = true, easing) {
		Base.prototype.setup.call(this, duration, easing);
		this._relative = relative;
		this._rotationValue = rotation;
		return this;
	};
	Rotation.prototype.start = function (parent) {
		Base.prototype.start.call(this, parent);
		this._srcRotation = parent.rotation;
		this._dstRotation = Number(this._rotationValue);

		if (this._relative) {
			this._dstRotation += parent.rotation;
		}
	};
	Rotation.prototype.update = function (parent) {
		Base.prototype.update.call(this, parent);

		if (parent.rotation !== undefined) {
			parent.rotation = this._srcRotation + ((this._dstRotation - this._srcRotation) * this.frameRate());
		}
	};




	//=============================================================================
	// Opacity
	//=============================================================================
	var Opacity = $.Opacity = function Animation___Opacity() {
		this.initialize.apply(this, arguments);
	};
	$.opacity = function (duration, opacity, easing) {
		return TRP_Container.get($.Opacity).setup(duration, opacity, easing);
	}
	$.prototype.opacity = function (duration, opacity, easing) {
		return this.add($.opacity(...arguments));
	};

	Opacity.prototype = Object.create(Base.prototype);
	Opacity.prototype.constructor = Opacity;
	Opacity.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._opacityValue = 0;
		this._dstAlpha = 0;
		this._srcAlpha = 0;
	};
	Opacity.prototype.setup = function (duration, opacity, easing) {
		Base.prototype.setup.call(this, duration, easing);

		this._opacityValue = opacity;
		return this;
	};
	Opacity.prototype.start = function (parent) {
		Base.prototype.start.call(this, parent);
		this._dstAlpha = Number(this._opacityValue) / 255;
		this._srcAlpha = parent.alpha;
	};
	Opacity.prototype.update = function (parent) {
		Base.prototype.update.call(this, parent);

		if (parent.alpha !== undefined) {
			parent.alpha = this._srcAlpha + ((this._dstAlpha - this._srcAlpha) * this.frameRate());
		}
	};





	//=============================================================================
	// Skew
	//=============================================================================
	var Skew = $.Skew = function Animation___Skew() {
		this.initialize.apply(this, arguments);
	};
	$.skew = function (duration, x, y, relative, easing) {
		return TRP_CORE.get($.Skew).setup(...arguments);
	}
	$.prototype.skew = function (duration, x, y, relative, easing) {
		return this.add($.skew(...arguments));
	};

	/* initialize
	===================================*/
	$.Skew.prototype = Object.create(Base.prototype);
	$.Skew.prototype.constructor = $.Skew;

	Skew.prototype.initialize = function () {
		Base.prototype.initialize.call(this);
		this._relative = false;
		this._xValue = 0;
		this._yValue = 0;
	};
	Skew.prototype.setup = function (duration, x = 0, y = 0, relative = false, easing = null) {
		Base.prototype.setup.call(this, duration, easing);
		this._relative = !!relative;
		this._xValue = x;
		this._yValue = y;
		return this;
	};
	Skew.prototype.start = function (parent) {
		Base.prototype.start.call(this, parent);

		this._srcX = parent.skew.x;
		this._srcY = parent.skew.y;
		this._dstX = Number(this._xValue) * Math.PI / 180;
		this._dstY = Number(this._yValue) * Math.PI / 180;
		if (this._relative) {
			this._dstX += parent.skew.x;
			this._dstY += parent.skew.y;
		}
	};
	Skew.prototype.update = function (parent) {
		Base.prototype.update.call(this, parent);

		var fr = this.frameRate();
		parent.skew.set(
			this._srcX + ((this._dstX - this._srcX) * fr),
			this._srcY + ((this._dstY - this._srcY) * fr),
		);
	};














	//=============================================================================
	// TRP_Container
	//=============================================================================
	var TRP_Container = TRP_CORE.TRP_Container = function TRP_Container() {
		this.initialize.apply(this, arguments);
	}

	TRP_Container.prototype = Object.create(PIXI.Container.prototype);
	TRP_Container.prototype.constructor = TRP_Container;

	TRP_Container.prototype.initialize = function (texture) {
		PIXI.Container.call(this, texture);

		this.width = Graphics.width;
		this.height = Graphics.height;
		this._animator = null;
	};
	Object.defineProperty(TRP_Container.prototype, 'opacity', {
		get: function () {
			return this.alpha * 255;
		},
		set: function (value) {
			this.alpha = value.clamp(0, 255) / 255;
		},
		configurable: true
	});

	Object.defineProperty(TRP_Container.prototype, 'animator', {
		get: function () {
			if (!this._animator) {
				this._animator = new TRP_Animator();
			}
			return this._animator;
		}, set: function (value) {
			this._animator = value;
		},
		configurable: true
	});


	TRP_Container.prototype.update = function () {
		if (this._animator && this._animator._animations.length) {
			this._animator.update(this);
		}

		var children = this.children;
		var length = children.length;
		var i = length - 1;
		for (; i >= 0; i -= 1) {
			var child = children[i];
			if (child && child.update) {
				child.update();
			}
		}
	};




	//=============================================================================
	// TRP_Sprite
	//=============================================================================
	var TRP_Sprite = TRP_CORE.TRP_Sprite = function TRP_Sprite() {
		this.initialize.apply(this, arguments);
	};

	TRP_Sprite.prototype = Object.create(Sprite.prototype);
	TRP_Sprite.prototype.constructor = TRP_Sprite;
	TRP_Sprite.prototype.initialize = function (bitmap) {
		Sprite.prototype.initialize.call(this, bitmap);
		this._animator = null;
	};
	TRP_Sprite.prototype.clear = function () {
		if (this._animator) {
			TRP_CORE.cache(this._animator);
		}
		this.x = this.y = 0;
		this.rotation = 0;

		this.anchor.set(0, 0);
		this.scale.set(1, 1);
		this.skew.set(0, 0);

		this.tint = 0xffffff;

		if (!isMZ) {
			this._isPicture = false;
		}
	};

	Object.defineProperty(TRP_Sprite.prototype, 'animator', {
		get: function () {
			if (!this._animator) {
				this._animator = new TRP_Animator();
			}
			return this._animator;
		}, set: function (value) {
			this._animator = value;
		},
		configurable: true
	});


	TRP_Sprite.prototype.update = function () {
		if (this._animator && this._animator._animations.length) {
			this._animator.update(this);
		}

		var children = this.children;
		var length = children.length;
		var i = length - 1;
		for (; i >= 0; i -= 1) {
			var child = children[i];
			if (child && child.update) {
				child.update();
			}
		}
	};











	// --------------------------------------------------
	// easing.js v0.5.4
	// Generic set of easing functions with AMD support
	// https://github.com/danro/easing-js
	// This code may be freely distributed under the MIT license
	// http://danro.mit-license.org/
	// --------------------------------------------------
	// All functions adapted from Thomas Fuchs & Jeremy Kahn
	// Easing Equations (c) 2003 Robert Penner, BSD license
	// https://raw.github.com/danro/easing-js/master/LICENSE
	// --------------------------------------------------
	TRP_CORE.easing = {
		linear: function (pos) { return pos },

		easeIn: function (pos) { return Math.pow(pos, 2); },
		easeOut: function (pos) { return -(Math.pow((pos - 1), 2) - 1); },
		easeInOut: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
			return -0.5 * ((pos -= 2) * pos - 2);
		},

		quadIn: function (pos) { return Math.pow(pos, 2); },
		quadOut: function (pos) { return -(Math.pow((pos - 1), 2) - 1); },
		quadInOut: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
			return -0.5 * ((pos -= 2) * pos - 2);
		},

		cubicIn: function (pos) { return Math.pow(pos, 3); },
		cubicOut: function (pos) { return (Math.pow((pos - 1), 3) + 1); },
		cubicInOut: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
			return 0.5 * (Math.pow((pos - 2), 3) + 2);
		},

		quartIn: function (pos) { return Math.pow(pos, 4); },
		quartOut: function (pos) { return -(Math.pow((pos - 1), 4) - 1); },
		quartInOut: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
			return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
		},

		quintIn: function (pos) { return Math.pow(pos, 5); },
		quintOut: function (pos) { return (Math.pow((pos - 1), 5) + 1); },
		quintInOut: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 5);
			return 0.5 * (Math.pow((pos - 2), 5) + 2);
		},

		sineIn: function (pos) { return -Math.cos(pos * (Math.PI / 2)) + 1; },
		sineOut: function (pos) { return Math.sin(pos * (Math.PI / 2)); },
		sineInOut: function (pos) {
			return (-0.5 * (Math.cos(Math.PI * pos) - 1));
		},

		expoIn: function (pos) { return (pos === 0) ? 0 : Math.pow(2, 10 * (pos - 1)); },
		expoOut: function (pos) { return (pos === 1) ? 1 : -Math.pow(2, -10 * pos) + 1; },
		expoInOut: function (pos) {
			if (pos === 0) return 0;
			if (pos === 1) return 1;
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
			return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
		},

		circIn: function (pos) { return -(Math.sqrt(1 - (pos * pos)) - 1); },
		circOut: function (pos) { return Math.sqrt(1 - Math.pow((pos - 1), 2)); },
		circInOut: function (pos) {
			if ((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
			return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
		},

		bounceOut: function (pos) {
			if ((pos) < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
			}
		},

		backIn: function (pos) {
			return (pos) * pos * ((1.70158 + 1) * pos - 1.70158);
		},
		backOut: function (pos) {
			return (pos = pos - 1) * pos * ((2.70158) * pos + 1.70158) + 1;
		},
		backInOut: function (pos) {
			var s = 1.70158;
			if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
			return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
		},

		elastic: function (pos) { return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1; },

		swingFromTo: function (pos) {
			var s = 1.70158;
			return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
				0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
		},

		swingFrom: function (pos) {
			var s = 1.70158;
			return pos * pos * ((s + 1) * pos - s);
		},

		swingTo: function (pos) {
			var s = 1.70158;
			return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
		},

		bounce: function (pos) {
			if (pos < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
			}
		},

		bouncePast: function (pos) {
			if (pos < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
			} else if (pos < (2.5 / 2.75)) {
				return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
			} else {
				return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
			}
		},

		easeFromTo: function (pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
			return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
		},

		easeFrom: function (pos) {
			return Math.pow(pos, 4);
		},

		easeTo: function (pos) {
			return Math.pow(pos, 0.25);
		}
	};


	//=============================================================================
	// TRP_TilingSprites
	//=============================================================================
	var TRP_TilingSprites = TRP_CORE.TRP_TilingSprites = function TRP_TilingSprites() {
		this.initialize.apply(this, arguments);
	};


	TRP_TilingSprites.prototype = Object.create(TRP_Container.prototype);
	TRP_TilingSprites.prototype.constructor = TRP_TilingSprites;
	TRP_TilingSprites.prototype.initialize = function (width = Graphics.width, height = Graphics.height) {
		TRP_Container.prototype.initialize.call(this);
		this._width = width;
		this._height = height;
		this._blendMode = 0;

		this.noMask = false;
		this._maskSprite = null;

		this._bitmap = null;
		this._container = new TRP_Container();
		this.addChild(this._container);
		this._sprites = [];

		this._scaleX = 1;
		this._scaleY = 1;

		this.origin = new Point(0, 0);
		this._lastOx = Number.MAX_SAFE_INTEGER;
		this._lastOy = Number.MAX_SAFE_INTEGER;
	};


	Object.defineProperty(TRP_TilingSprites.prototype, 'bitmap', {
		get: function () {
			return this._bitmap
		}, set: function (value) {
			if (this._bitmap !== value) {
				this._bitmap = value;
				this.refresh();
			}
		},
		configurable: true
	});

	TRP_TilingSprites.prototype.setScale = function (scaleX = 1, scaleY = 1, noRefresh = false) {
		if (this._scaleX === scaleX && this._scaleY === this._scaleY) return;
		this._scaleX = scaleX;
		this._scaleY = scaleY;
		if (!noRefresh) {
			this.refresh();
		}
	};

	Object.defineProperty(TRP_TilingSprites.prototype, 'blendMode', {
		get: function () {
			return this._blendMode;
		}, set: function (value) {
			if (this._blendMode === value) return;
			this._blendMode = value;

			TRP_CORE.setBlendMode(this, value);
			if (this._sprites) {
				for (const sprite of this._sprites) {
					sprite.blendMode = value;
				}
			}
		},
		configurable: true
	});


	TRP_TilingSprites.prototype.refresh = function () {
		var bitmap = this.bitmap;
		if (!bitmap) return;
		if (!bitmap.isReady()) {
			bitmap.addLoadListener(this.refresh.bind(this));
			return;
		}

		var width = this._width;
		var height = this._height;

		var w = bitmap.width * this._scaleX;
		var h = bitmap.height * this._scaleY;
		var col = Math.ceil(width / w) + 1;
		var row = Math.ceil(height / h) + 1;
		this._col = col;
		this._row = row;
		this._elemW = w;
		this._elemH = h;

		this.setupSprites(bitmap, col, row);
		this.setupMask()
		this.updateOrigin();

		this._container.scale.set(this._scaleX, this._scaleY);
	};

	TRP_TilingSprites.prototype.update = function () {
		if (this._animator && this._animator._animations.length) {
			this._animator.update(this);
		}
		if (!this.bitmap || !this.visible || this.opacity === 0) return;

		if (this.origin.x !== this._lastOx || this.origin.y !== this._lastOy) {
			this.updateOrigin();
		}
	};

	TRP_TilingSprites.prototype.updateOrigin = function () {
		this._lastOx = this.origin.x;
		this._lastOy = this.origin.y;

		var ox = this.origin.x % this._elemW;
		var oy = this.origin.y % this._elemH;
		if (ox < 0) {
			ox += this._elemW;
		}
		if (oy < 0) {
			oy += this._elemH;
		}
		this._container.x = -ox;
		this._container.y = -oy;
	};

	TRP_TilingSprites.MASK_SIZE = 100;
	TRP_TilingSprites.prototype.setupMask = function () {
		if (this.noMask) {
			if (this._maskSprite) {
				this._container.mask = null;
				this.removeChild(this._maskSprite);
				this._maskSprite.destroy();
				this._maskSprite = null;
			}
		} else {
			var size = TRP_TilingSprites.MASK_SIZE;
			if (!this._maskSprite) {
				var mask = new PIXI.Graphics();
				mask.beginFill(0xffffff)
					.drawRect(0, 0, size, size)
					.endFill();

				this._maskSprite = mask;
				this._container.mask = mask;
				this.addChild(mask);
			}
			this._maskSprite.scale.set(
				this._width / size, this._height / size
			);
		}
	};

	TRP_TilingSprites.prototype.setupSprites = function (bitmap, col, row) {
		var num = col * row;
		var w = this.bitmap.width;
		var h = this.bitmap.height;
		for (var i = this._sprites.length; i < num; i = (i + 1) | 0) {
			var sprite = new Sprite();
			this._sprites.push(sprite);
			this._container.addChild(sprite);
		}
		for (var i = 0; i < num; i = (i + 1) | 0) {
			var sprite = this._sprites[i];
			sprite.bitmap = bitmap;

			var c = i % col;
			var r = Math.floor(i / col);
			sprite.x = c * w;
			sprite.y = r * h;
		}
		for (var i = num; i < this._sprites.length; i = (i + 1) | 0) {
			sprite = this._sprites[i];
			sprite.parent.removeChild(sprite);
			sprite.destroy();
		}
		this._sprites.length = num;
	};




	//=============================================================================
	// ApplyBlendFilter
	//=============================================================================
	TRP_CORE.USE_BLEND_FILTER = !!(PIXI.picture && PIXI.picture.getBlendFilter);
	TRP_CORE.useBlendFilter = function (blendMode = 0) {
		if (!TRP_CORE.USE_BLEND_FILTER) return false;
		return blendMode === 4;
	};
	if (TRP_CORE.USE_BLEND_FILTER) {
		TRP_CORE.setBlendMode = function (target, blendMode = 0) {
			if (target.blendMode === blendMode) return;
			if (TRP_CORE.useBlendFilter(target.blendMode) && target.filters) {
				this.tryRemoveBlendFilter(target);
			}

			target.blendMode = blendMode;
			if (TRP_CORE.useBlendFilter(blendMode)) {
				target.filters = target.filters || [];
				var filter = PIXI.picture.getBlendFilter(blendMode);
				if (filter) {
					target.filters.push(filter);
				}
			}
		};
		TRP_CORE.tryRemoveBlendFilter = function (target) {
			for (var i = target.filters.length - 1; i >= 0; i = (i - 1) | 0) {
				var filter = target.filters[i];
				if (filter instanceof PIXI.picture.BlendFilter) {
					this.remove(target.filters, filter);
				}
			}
		};
	} else {
		TRP_CORE.tryRemoveBlendFilter = function (target) { };

		if (!isMZ) {
			TRP_CORE.setBlendMode = function (target, blendMode = 0) {
				target.blendMode = blendMode;
				if (target._isPicture !== undefined) {
					target._isPicture = blendMode === 4;
				}
			};
		} else {
			TRP_CORE.setBlendMode = function (target, blendMode = 0) {
				target.blendMode = blendMode;
			};
		}
	}


})();





//=============================================================================
// [DevFuncs]
//=============================================================================
(function () {
	'use strict';

	if (!Utils.isNwjs() || !Utils.isOptionValid('test')) return;

	var isMZ = Utils.RPGMAKER_NAME === "MZ";
	var pluginName = 'TRP_MapDecorator_DevFuncs';
	var parameters = PluginManager.parameters(pluginName);


	var _Dev = TRP_CORE.DevFuncs = function () { };

	_Dev.throwError = function (error) {
		console.log.apply(console, arguments);
		debugger;
		throw new Error(error);
	}
	_Dev.throwNewError = _Dev.throwError;




	//=============================================================================
	// File Access
	//=============================================================================
	_Dev.saveFile = function (data, url) {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}
		this._saveFile(data, url);
	};
	_Dev._saveFile = function (data, url) {
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var filePath = path.join(base, url);
		fs.writeFileSync(filePath, data);
	};
	_Dev.readFile = function (url) {
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var filePath = path.join(base, url);

		if (!fs.existsSync(filePath)) return null;
		return fs.readFileSync(filePath, { encoding: 'utf8' });
	};
	_Dev.readdirSync = function (url) {
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dirPath = path.join(base, url);
		var files = fs.readdirSync(dirPath)
		return file
	};

	_Dev.checkDirectoriesExists = function (url) {
		return this.ensureDirectoriesWithFilePath(url, true);
	};
	_Dev.ensureDirectoriesWithFilePath = function (url, onlyCheck = false) {
		var dirs = url.split('/');
		dirs.pop();

		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dirPath = base;

		for (const dir of dirs) {
			dirPath = path.join(dirPath, dir);
			if (!fs.existsSync(dirPath)) {
				if (onlyCheck) return false;
				fs.mkdirSync(dirPath);
			}
		}
		return true;
	};
	_Dev.existsSync = function (url) {
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var dirPath = path.join(base, url);
		return fs.existsSync(dirPath);
	};





	//=============================================================================
	// Window_TrpDevToolsBase
	//=============================================================================
	var _SceneManager_onKeyDown = SceneManager.onKeyDown;
	SceneManager.onKeyDown = function (event) {
		if (event.ctrlKey || event.metaKey) {
			if (_Dev.onKeyDownForDevTools(event)) {
				return;
			}
		}
		_SceneManager_onKeyDown.call(this, ...arguments);
	};

	_Dev.isKeyDownDisabled = function () {
		if (TRP_CORE.devToolsDisabled) return true;
		if (TRP_CORE.showingToolsWindow) return true;

		if (SceneManager._scene) {
			if (SceneManager._scene.update !== SceneManager._scene.constructor.prototype.update) {
				//update override maybe for any devTool
				return true;
			}
			if (SceneManager._scene._particleEditor || SceneManager._scene._particleGroupEditor) {
				//particle editor
				return true;
			}
		}
		if (window.TRP_SkitDevPicker && TRP_SkitDevPicker._expPicker) {
			//exp picker
			return true;
		}
		return false;
	}

	_Dev.onKeyDownForDevTools = function (event) {
		if (this.isKeyDownDisabled()) return;

		var key = event.key;
		if (event.shiftKey) {
			key = key.toUpperCase();
		}
		if (key.length === 1) {
			var oppositeKey = (key === key.toLowerCase() ? key.toUpperCase() : key.toLowerCase());
			var name1 = this.keyTargetName(key);
			var name2 = this.keyTargetName(oppositeKey);
			if (name1 || name2) {
				this.showTempText('commandHelp', [
					(name1 || 'なし'),
					'↔ ' + (name2 || 'なし'),
				], 'rgb(255,255,200)');
			}
		}

		if (key === 't') {
			_Dev.showToolsWindow(key);
			return true;
		} else if (keyToolWindowMap[key]) {
			_Dev.showToolsWindow(key);
			return true;
		} else if (keyCommandMap[key]) {
			_Dev.processToolsCommand(keyCommandMap[key]);
			SoundManager.playCursor();
			return true;
		}
		return false;
	}

	_Dev.keyTargetName = function (key) {
		var window = keyToolWindowMap[key];
		if (window) {
			return window.name;
		}
		var command = keyCommandMap[key];
		if (command) {
			if (command.name) return command.name;
			return command.param.substring(0, 10);
		}

		return null;
	};


	var keyToolWindowMap = _Dev.keyToolWindowMap = {};
	var keyCommandMap = _Dev.keyCommandMap = {};
	var idToolWindowMap = _Dev.idToolWindowMap = {};
	_Dev.registerToolCommands = function (setting) {
		if (setting.key !== undefined) {
			keyToolWindowMap[setting.key] = setting;
		}
		if (setting.id !== undefined) {
			idToolWindowMap[setting.id] = setting;
		}
		var commands = setting.commands;
		for (var j = commands.length - 1; j >= 0; j = (j - 1) | 0) {
			var command = commands[j];
			if (command.key) {
				keyCommandMap[command.key] = command;
			}
		}
	};

	_Dev.showingToolsSettings = [];
	_Dev.showingToolsWindow = null;
	_Dev.showToolsWindow = function (key) {
		var setting = keyToolWindowMap[key];
		if (!setting) {
			SoundManager.playBuzzer();
			return;
		}
		SoundManager.playOk();

		this._showToolsWindow(setting);
	};

	_Dev._updateSwappedForDevTools = false;
	_Dev._showToolsWindow = function (setting) {
		if (!_Dev.showingToolsSettings.contains(setting)) {
			_Dev.showingToolsSettings.push(setting);
		}

		var window = new Window_TrpDevToolsBase(setting);
		_Dev.showingToolsWindow = window;

		var scene = SceneManager._scene;
		scene.addChild(window);
		window.setup();

		if (!_Dev._updateSwappedForDevTools) {
			_Dev._updateSwappedForDevTools = true;
			var update = scene.update;
			scene.update = function () {
				var w = _Dev.showingToolsWindow;
				if (!w) return;

				w.update();
				if (w.isClosed()) {
					_Dev.showingToolsWindow = null;
					_Dev.showingToolsSettings.pop();
					if (!w.processed && _Dev.showingToolsSettings.length) {
						var next = TRP_CORE.last(_Dev.showingToolsSettings);
						_Dev._showToolsWindow(next);
					} else {
						scene.update = update;
						_Dev._updateSwappedForDevTools = false;
					}
				}
			};
		}
	};
	_Dev.showToolsWindowWithId = function (symbol) {
		var setting = idToolWindowMap[symbol];
		if (!setting) {
			SoundManager.playBuzzer();
			return;
		}
		this._showToolsWindow(setting);
	};


	_Dev.processToolsCommand = function (command) {
		switch (command.type) {
			case 'commonEvent':
				$gameTemp.reserveCommonEvent(Number(command.param));
				break;
			case 'window':
				this.showToolsWindowWithId(command.param);
				break;
			case 'script':
				this.processEval(command.param);
				break;
			case 'input':
				var script = window.prompt('スクリプトを入力', command.param || '');
				this.processEval(script);

				if (parameters.redoKey) {
					var newCommand = JsonEx.makeDeepCopy(command);
					newCommand.param = script;
					ConfigManager.trpDevLastCommand = newCommand;
					ConfigManager.save();
				}
				break;
		};
	};
	_Dev.processEval = function (script) {
		try {
			eval(script);
		} catch (e) {
			var lines = [
				'【スクリプトエラー】',
				'スクリプト:' + script,
				'エラー:' + e.message
			];
			this.showTempAlert(lines);
			SoundManager.playBuzzer();
		}
	};


	(() => {
		if (!parameters.redefineCoreWindows) return;
		function Window_Selectable() { this.initialize.apply(this, arguments) } Window_Selectable.prototype = Object.create(Window_Base.prototype), Window_Selectable.prototype.constructor = Window_Selectable, Window_Selectable.prototype.initialize = function (a, b, c, d) { Window_Base.prototype.initialize.call(this, a, b, c, d), this._index = -1, this._cursorFixed = !1, this._cursorAll = !1, this._stayCount = 0, this._helpWindow = null, this._handlers = {}, this._touching = !1, this._scrollX = 0, this._scrollY = 0, this.deactivate() }, Window_Selectable.prototype.index = function () { return this._index }, Window_Selectable.prototype.cursorFixed = function () { return this._cursorFixed }, Window_Selectable.prototype.setCursorFixed = function (a) { this._cursorFixed = a }, Window_Selectable.prototype.cursorAll = function () { return this._cursorAll }, Window_Selectable.prototype.setCursorAll = function (a) { this._cursorAll = a }, Window_Selectable.prototype.maxCols = function () { return 1 }, Window_Selectable.prototype.maxItems = function () { return 0 }, Window_Selectable.prototype.spacing = function () { return 12 }, Window_Selectable.prototype.itemWidth = function () { return Math.floor((this.width - 2 * this.padding + this.spacing()) / this.maxCols() - this.spacing()) }, Window_Selectable.prototype.itemHeight = function () { return this.lineHeight() }, Window_Selectable.prototype.maxRows = function () { return Math.max(Math.ceil(this.maxItems() / this.maxCols()), 1) }, Window_Selectable.prototype.activate = function () { Window_Base.prototype.activate.call(this), this.reselect() }, Window_Selectable.prototype.deactivate = function () { Window_Base.prototype.deactivate.call(this), this.reselect() }, Window_Selectable.prototype.select = function (a) { this._index = a, this._stayCount = 0, this.ensureCursorVisible(), this.updateCursor(), this.callUpdateHelp() }, Window_Selectable.prototype.deselect = function () { this.select(-1) }, Window_Selectable.prototype.reselect = function () { this.select(this._index) }, Window_Selectable.prototype.row = function () { return Math.floor(this.index() / this.maxCols()) }, Window_Selectable.prototype.topRow = function () { return Math.floor(this._scrollY / this.itemHeight()) }, Window_Selectable.prototype.maxTopRow = function () { return Math.max(0, this.maxRows() - this.maxPageRows()) }, Window_Selectable.prototype.setTopRow = function (b) { var a = b.clamp(0, this.maxTopRow()) * this.itemHeight(); this._scrollY !== a && (this._scrollY = a, this.refresh(), this.updateCursor()) }, Window_Selectable.prototype.resetScroll = function () { this.setTopRow(0) }, Window_Selectable.prototype.maxPageRows = function () { return Math.floor((this.height - 2 * this.padding) / this.itemHeight()) }, Window_Selectable.prototype.maxPageItems = function () { return this.maxPageRows() * this.maxCols() }, Window_Selectable.prototype.isHorizontal = function () { return 1 === this.maxPageRows() }, Window_Selectable.prototype.bottomRow = function () { return Math.max(0, this.topRow() + this.maxPageRows() - 1) }, Window_Selectable.prototype.setBottomRow = function (a) { this.setTopRow(a - (this.maxPageRows() - 1)) }, Window_Selectable.prototype.topIndex = function () { return this.topRow() * this.maxCols() }, Window_Selectable.prototype.itemRect = function (b) { var a = new Rectangle, c = this.maxCols(); return a.width = this.itemWidth(), a.height = this.itemHeight(), a.x = b % c * (a.width + this.spacing()) - this._scrollX, a.y = Math.floor(b / c) * a.height - this._scrollY, a }, Window_Selectable.prototype.itemRectForText = function (b) { var a = this.itemRect(b); return a.x += 6, a.width -= 2 * 6, a }, Window_Selectable.prototype.setHelpWindow = function (a) { this._helpWindow = a, this.callUpdateHelp() }, Window_Selectable.prototype.showHelpWindow = function () { this._helpWindow && this._helpWindow.show() }, Window_Selectable.prototype.hideHelpWindow = function () { this._helpWindow && this._helpWindow.hide() }, Window_Selectable.prototype.setHandler = function (a, b) { this._handlers[a] = b }, Window_Selectable.prototype.isHandled = function (a) { return !!this._handlers[a] }, Window_Selectable.prototype.callHandler = function (a) { this.isHandled(a) && this._handlers[a]() }, Window_Selectable.prototype.isOpenAndActive = function () { return this.isOpen() && this.active }, Window_Selectable.prototype.isCursorMovable = function () { return this.isOpenAndActive() && !this._cursorFixed && !this._cursorAll && this.maxItems() > 0 }, Window_Selectable.prototype.cursorDown = function (d) { var b = this.index(), c = this.maxItems(), a = this.maxCols(); (b < c - a || d && 1 === a) && this.select((b + a) % c) }, Window_Selectable.prototype.cursorUp = function (d) { var b = this.index(), c = this.maxItems(), a = this.maxCols(); (b >= a || d && 1 === a) && this.select((b - a + c) % c) }, Window_Selectable.prototype.cursorRight = function (c) { var a = this.index(), b = this.maxItems(); this.maxCols() >= 2 && (a < b - 1 || c && this.isHorizontal()) && this.select((a + 1) % b) }, Window_Selectable.prototype.cursorLeft = function (c) { var a = this.index(), b = this.maxItems(); this.maxCols() >= 2 && (a > 0 || c && this.isHorizontal()) && this.select((a - 1 + b) % b) }, Window_Selectable.prototype.cursorPagedown = function () { var a = this.index(), b = this.maxItems(); this.topRow() + this.maxPageRows() < this.maxRows() && (this.setTopRow(this.topRow() + this.maxPageRows()), this.select(Math.min(a + this.maxPageItems(), b - 1))) }, Window_Selectable.prototype.cursorPageup = function () { var a = this.index(); this.topRow() > 0 && (this.setTopRow(this.topRow() - this.maxPageRows()), this.select(Math.max(a - this.maxPageItems(), 0))) }, Window_Selectable.prototype.scrollDown = function () { this.topRow() + 1 < this.maxRows() && this.setTopRow(this.topRow() + 1) }, Window_Selectable.prototype.scrollUp = function () { this.topRow() > 0 && this.setTopRow(this.topRow() - 1) }, Window_Selectable.prototype.update = function () { Window_Base.prototype.update.call(this), this.updateArrows(), this.processCursorMove(), this.processHandling(), this.processWheel(), this.processTouch(), this._stayCount++ }, Window_Selectable.prototype.updateArrows = function () { var a = this.topRow(), b = this.maxTopRow(); this.downArrowVisible = b > 0 && a < b, this.upArrowVisible = a > 0 }, Window_Selectable.prototype.processCursorMove = function () { if (this.isCursorMovable()) { var a = this.index(); Input.isRepeated("down") && this.cursorDown(Input.isTriggered("down")), Input.isRepeated("up") && this.cursorUp(Input.isTriggered("up")), Input.isRepeated("right") && this.cursorRight(Input.isTriggered("right")), Input.isRepeated("left") && this.cursorLeft(Input.isTriggered("left")), !this.isHandled("pagedown") && Input.isTriggered("pagedown") && this.cursorPagedown(), !this.isHandled("pageup") && Input.isTriggered("pageup") && this.cursorPageup(), this.index() !== a && SoundManager.playCursor() } }, Window_Selectable.prototype.processHandling = function () { this.isOpenAndActive() && (this.isOkEnabled() && this.isOkTriggered() ? this.processOk() : this.isCancelEnabled() && this.isCancelTriggered() ? this.processCancel() : this.isHandled("pagedown") && Input.isTriggered("pagedown") ? this.processPagedown() : this.isHandled("pageup") && Input.isTriggered("pageup") && this.processPageup()) }, Window_Selectable.prototype.processWheel = function () { if (this.isOpenAndActive()) { var a = 20; TouchInput.wheelY >= a && this.scrollDown(), TouchInput.wheelY <= -a && this.scrollUp() } }, Window_Selectable.prototype.processTouch = function () { this.isOpenAndActive() ? (TouchInput.isTriggered() && this.isTouchedInsideFrame() ? (this._touching = !0, this.onTouch(!0)) : TouchInput.isCancelled() && this.isCancelEnabled() && this.processCancel(), this._touching && (TouchInput.isPressed() ? this.onTouch(!1) : this._touching = !1)) : this._touching = !1 }, Window_Selectable.prototype.isTouchedInsideFrame = function () { var a = this.canvasToLocalX(TouchInput.x), b = this.canvasToLocalY(TouchInput.y); return a >= 0 && b >= 0 && a < this.width && b < this.height }, Window_Selectable.prototype.onTouch = function (c) { var d = this.index(), e = this.canvasToLocalX(TouchInput.x), a = this.canvasToLocalY(TouchInput.y), b = this.hitTest(e, a); b >= 0 ? b === this.index() ? c && this.isTouchOkEnabled() && this.processOk() : this.isCursorMovable() && this.select(b) : this._stayCount >= 10 && (a < this.padding ? this.cursorUp() : a >= this.height - this.padding && this.cursorDown()), this.index() !== d && SoundManager.playCursor() }, Window_Selectable.prototype.hitTest = function (d, e) { if (this.isContentsArea(d, e)) for (var f = d - this.padding, g = e - this.padding, h = this.topIndex(), b = 0; b < this.maxPageItems(); b++) { var c = h + b; if (c < this.maxItems()) { var a = this.itemRect(c), i = a.x + a.width, j = a.y + a.height; if (f >= a.x && g >= a.y && f < i && g < j) return c } } return -1 }, Window_Selectable.prototype.isContentsArea = function (a, b) { var c = this.padding, d = this.padding, e = this.width - this.padding, f = this.height - this.padding; return a >= c && b >= d && a < e && b < f }, Window_Selectable.prototype.isTouchOkEnabled = function () { return this.isOkEnabled() }, Window_Selectable.prototype.isOkEnabled = function () { return this.isHandled("ok") }, Window_Selectable.prototype.isCancelEnabled = function () { return this.isHandled("cancel") }, Window_Selectable.prototype.isOkTriggered = function () { return Input.isRepeated("ok") }, Window_Selectable.prototype.isCancelTriggered = function () { return Input.isRepeated("cancel") }, Window_Selectable.prototype.processOk = function () { this.isCurrentItemEnabled() ? (this.playOkSound(), this.updateInputData(), this.deactivate(), this.callOkHandler()) : this.playBuzzerSound() }, Window_Selectable.prototype.playOkSound = function () { SoundManager.playOk() }, Window_Selectable.prototype.playBuzzerSound = function () { SoundManager.playBuzzer() }, Window_Selectable.prototype.callOkHandler = function () { this.callHandler("ok") }, Window_Selectable.prototype.processCancel = function () { SoundManager.playCancel(), this.updateInputData(), this.deactivate(), this.callCancelHandler() }, Window_Selectable.prototype.callCancelHandler = function () { this.callHandler("cancel") }, Window_Selectable.prototype.processPageup = function () { SoundManager.playCursor(), this.updateInputData(), this.deactivate(), this.callHandler("pageup") }, Window_Selectable.prototype.processPagedown = function () { SoundManager.playCursor(), this.updateInputData(), this.deactivate(), this.callHandler("pagedown") }, Window_Selectable.prototype.updateInputData = function () { Input.update(), TouchInput.update() }, Window_Selectable.prototype.updateCursor = function () { if (this._cursorAll) { var b = this.maxRows() * this.itemHeight(); this.setCursorRect(0, 0, this.contents.width, b), this.setTopRow(0) } else if (this.isCursorVisible()) { var a = this.itemRect(this.index()); this.setCursorRect(a.x, a.y, a.width, a.height) } else this.setCursorRect(0, 0, 0, 0) }, Window_Selectable.prototype.isCursorVisible = function () { var a = this.row(); return a >= this.topRow() && a <= this.bottomRow() }, Window_Selectable.prototype.ensureCursorVisible = function () { var a = this.row(); a < this.topRow() ? this.setTopRow(a) : a > this.bottomRow() && this.setBottomRow(a) }, Window_Selectable.prototype.callUpdateHelp = function () { this.active && this._helpWindow && this.updateHelp() }, Window_Selectable.prototype.updateHelp = function () { this._helpWindow.clear() }, Window_Selectable.prototype.setHelpWindowItem = function (a) { this._helpWindow && this._helpWindow.setItem(a) }, Window_Selectable.prototype.isCurrentItemEnabled = function () { return !0 }, Window_Selectable.prototype.drawAllItems = function () { for (var c = this.topIndex(), a = 0; a < this.maxPageItems(); a++) { var b = c + a; b < this.maxItems() && this.drawItem(b) } }, Window_Selectable.prototype.clearItem = function (b) { var a = this.itemRect(b); this.contents.clearRect(a.x, a.y, a.width, a.height) }, Window_Selectable.prototype.redrawItem = function (a) { a >= 0 && (this.clearItem(a), this.drawItem(a)) }, Window_Selectable.prototype.redrawCurrentItem = function () { this.redrawItem(this.index()) }, Window_Selectable.prototype.refresh = function () { this.contents && (this.contents.clear(), this.drawAllItems()) };
		function Window_Command() { this.initialize.apply(this, arguments) } Window_Command.prototype = Object.create(Window_Selectable.prototype), Window_Command.prototype.constructor = Window_Command, Window_Command.prototype.initialize = function (a, b) { this.clearCommandList(), this.makeCommandList(); var c = this.windowWidth(), d = this.windowHeight(); Window_Selectable.prototype.initialize.call(this, a, b, c, d), this.refresh(), this.select(0), this.activate() }, Window_Command.prototype.windowWidth = function () { return 240 }, Window_Command.prototype.windowHeight = function () { return this.fittingHeight(this.numVisibleRows()) }, Window_Command.prototype.numVisibleRows = function () { return Math.ceil(this.maxItems() / this.maxCols()) }, Window_Command.prototype.maxItems = function () { return this._list.length }, Window_Command.prototype.clearCommandList = function () { this._list = [] }, Window_Command.prototype.makeCommandList = function () { }, Window_Command.prototype.addCommand = function (c, d, a, b) { void 0 === a && (a = !0), void 0 === b && (b = null), this._list.push({ name: c, symbol: d, enabled: a, ext: b }) }, Window_Command.prototype.commandName = function (a) { return this._list[a].name }, Window_Command.prototype.commandSymbol = function (a) { return this._list[a].symbol }, Window_Command.prototype.isCommandEnabled = function (a) { return this._list[a].enabled }, Window_Command.prototype.currentData = function () { return this.index() >= 0 ? this._list[this.index()] : null }, Window_Command.prototype.isCurrentItemEnabled = function () { return !!this.currentData() && this.currentData().enabled }, Window_Command.prototype.currentSymbol = function () { return this.currentData() ? this.currentData().symbol : null }, Window_Command.prototype.currentExt = function () { return this.currentData() ? this.currentData().ext : null }, Window_Command.prototype.findSymbol = function (b) { for (var a = 0; a < this._list.length; a++)if (this._list[a].symbol === b) return a; return -1 }, Window_Command.prototype.selectSymbol = function (b) { var a = this.findSymbol(b); a >= 0 ? this.select(a) : this.select(0) }, Window_Command.prototype.findExt = function (b) { for (var a = 0; a < this._list.length; a++)if (this._list[a].ext === b) return a; return -1 }, Window_Command.prototype.selectExt = function (b) { var a = this.findExt(b); a >= 0 ? this.select(a) : this.select(0) }, Window_Command.prototype.drawItem = function (a) { var b = this.itemRectForText(a), c = this.itemTextAlign(); this.resetTextColor(), this.changePaintOpacity(this.isCommandEnabled(a)), this.drawText(this.commandName(a), b.x, b.y, b.width, c) }, Window_Command.prototype.itemTextAlign = function () { return "left" }, Window_Command.prototype.isOkEnabled = function () { return !0 }, Window_Command.prototype.callOkHandler = function () { var a = this.currentSymbol(); this.isHandled(a) ? this.callHandler(a) : this.isHandled("ok") ? Window_Selectable.prototype.callOkHandler.call(this) : this.activate() }, Window_Command.prototype.refresh = function () { this.clearCommandList(), this.makeCommandList(), this.createContents(), Window_Selectable.prototype.refresh.call(this) }
	})();
	function Window_TrpDevToolsBase() {
		this.initialize.apply(this, arguments);
	}
	Window_TrpDevToolsBase.prototype = Object.create(Window_Command.prototype);
	Window_TrpDevToolsBase.prototype.constructor = Window_TrpDevToolsBase;
	Window_TrpDevToolsBase.prototype.initialize = function (setting) {
		this._setting = setting;
		this.processed = false;

		var width = this.windowWidth();
		var height = this.windowHeight();
		var x = (Graphics.width - width) / 2;
		var y = (Graphics.height - height) / 2;

		if (isMZ) {
			var rect = new Rectangle(x, y, width, height)
			Window_Command.prototype.initialize.call(this, rect);
		} else {
			Window_Command.prototype.initialize.call(this, x, y);
		}

		this.openness = 0;
		this.deactivate();


		var commands = setting.commands;
		var length = commands.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			this.registerCommandHandler(i, commands[i]);
		}
		this.setHandler('cancel', () => {
			this.close();
		});
	};
	Window_TrpDevToolsBase.prototype.registerCommandHandler = function (i, command) {
		this.setHandler('command:' + i, () => {
			_Dev.processToolsCommand(command);

			if (command.closeWindow) {
				this.processed = true;
				this.visible = false;
				this.close();
			} else {
				this.activate();
			}
		});
	};

	Window_TrpDevToolsBase.prototype.windowWidth = function () {
		return Math.min(Graphics.width - 100, 500);
	};
	Window_TrpDevToolsBase.prototype.windowHeight = function () {
		var lines = this.commands().length;

		var height;
		do {
			height = this.fittingHeight(lines);
			lines -= 1;
		} while (height > Graphics.height - 10 && lines > 0);

		return height;
	};
	Window_TrpDevToolsBase.prototype.makeCommandList = function () {
		var commands = this.commands();
		var names = this.commandNames(commands);
		var length = commands.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var command = commands[i];
			var name = names[i];
			this.addCommand(name, command);
		}
	};
	Window_TrpDevToolsBase.prototype.setup = function () {
		this.refresh();
		if (isMZ) {
			this.forceSelect(0);
		} else {
			this.select(0);
		}
		this.activate();
		this.open();
	};

	Window_TrpDevToolsBase.prototype.commands = function () {
		var commands = [];
		var length = this._setting.commands.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			commands.push('command:' + i)
		}
		commands.push('cancel');

		return commands;
	};
	Window_TrpDevToolsBase.prototype.commandNames = function (commands) {
		var names = [];
		var commands = this._setting.commands;
		for (const command of commands) {
			var name = Window_TrpDevToolsBase.commandName(command);
			if (command.key) {
				name += '<' + command.key + '>';
			}
			names.push(name);
		}
		if (_Dev.showingToolsSettings.length > 1) {
			names.push('戻る');
		} else {
			names.push('キャンセル');
		}
		return names;
	};

	Window_TrpDevToolsBase.commandName = function (command) {
		return command.name;
	};



	//================================================
	// TestTypeSetup <T>
	//================================================
	_Dev.registerToolCommands({
		key: 't',
		id: 'test1',
		name: 'テストタイプSetup',
		commands: [{
			name: '次のウィンドウ',
			type: 'window',
			param: 'test2'
			, key: '',
			closeWindow: true,
		}]
	});
	_Dev.registerToolCommands({
		key: '',
		id: 'test2',
		name: 'テストタイプSetup',
		commands: [{
			name: 'あう',
			type: 'script',
			param: 'SoundManager.playSave()'
			, key: '',
			closeWindow: true,
		}]
	});









	//=============================================================================
	// Window_TrpDevTools
	//=============================================================================
	function Window_TrpDevTools() {
		this.initialize(...arguments);
	};
	Window_TrpDevTools.prototype = Object.create(Window_TrpDevToolsBase.prototype);
	Window_TrpDevTools.prototype.constructor = Window_TrpDevTools;

	Window_TrpDevTools.prototype.initialize = function () {
		Window_TrpDevToolsBase.prototype.initialize.call(this);

		this.setHandler('animation', () => {
			this.close();
			TRP_CORE.AnimationViewer.start(0, null);
		});
		this.setHandler('se', () => {
			TRP_CORE.SeEditor.start('', null);
			this.visible = false;
			this.close();
		});
		this.setHandler('particle', () => {
			TRP_CORE.ParticleViewer.start(null, true, false);
			this.visible = false;
			this.close();
		});
		this.setHandler('particleGroup', () => {
			TRP_CORE.ParticleViewer.start(null, true, true);
			this.visible = false;
			this.close();
		});
	};

	Window_TrpDevTools.prototype.commands = function () {
		var commands = [];
		if (PluginManager._scripts.contains('TRP_AnimationEx')) {
			commands.push('animation');
		}
		if (PluginManager._scripts.contains('TRP_SEPicker')) {
			commands.push('se');
		}
		if (PluginManager._scripts.contains('TRP_ParticleMZ_ExViewer')) {
			commands.push('particle');
			if (PluginManager._scripts.contains('TRP_ParticleMZ_Group')
				|| PluginManager._scripts.contains('TRP_Particle_Group')
			) {
				commands.push('particleGroup');
			}
		}
		commands.push('cancel');

		return commands;
	}
	Window_TrpDevTools.COMMAND_NAMES = {
		animation: 'アニメーションピッカー',
		se: 'SEピッカー',
		particle: 'パーティクルピッカー',
		particleGroup: 'パーティクルグループピッカー',
		cancel: 'キャンセル',
	};
	Window_TrpDevTools.prototype.commandNames = function (commands = this.commands()) {
		var names = [];
		for (const command of commands) {
			names.push(Window_TrpDevTools.COMMAND_NAMES[command]);
		}
		return names;
	}





	//=============================================================================
	// Debug Text
	//=============================================================================
	var debugTexts = [];
	var debugTextUId = 0;
	_Dev.showTempAlert = function (value) {
		this.showTempText(null, value, 'red');
		console.log(value);
	}
	_Dev.showTempText = function (key, value, color) {
		if (!value) {
			value = key;
			key = 'AUTO:' + (debugTextUId++);
		} else if (key === null) {
			key = 'AUTO:' + (debugTextUId++);
		}
		this.showText(key, value, color, true);
	}
	_Dev.textSprites = function () {
		return debugTexts.map(t => t.sprite);
	}
	_Dev.hideText = function (key, value, color) {
		return debugTexts.some(i => {
			if (i.key === key) {
				this.showText(key, null);
				return true;
			}
			return false;
		});
	}
	_Dev.showText = function (key, value, color = 'white', autoHide = false) {
		this.prepareDebugTextContainer();

		var info = null;
		if (!debugTexts.some(i => {
			if (i.key === key) {
				info = i;
				return true;
			}
			return false;
		})) {
			if (!value) return;
			info = this.makeDebugTextInfo(key, value, color, autoHide);
		}
		this.setDebugText(info, value, color, autoHide);
	};

	_Dev.updateTexts = function () {
		debugTexts.forEach(t => t.sprite.update());
	};


	_Dev.debugTextContainer = null;
	_Dev.prepareDebugTextContainer = function () {
		var container = _Dev.debugTextContainer;
		if (!container || !container.transform) {
			container = _Dev.debugTextContainer = new TRP_CORE.TRP_Container();

			var texts = debugTexts;
			debugTexts = [];

			for (const info of texts) {
				this.showText(info.key, info.value, info.color, info.autoHide);
			}
		}
		SceneManager._scene.addChild(container);
	};
	_Dev.readdDebugTextContainer = _Dev.prepareDebugTextContainer;



	_Dev.makeDebugTextInfo = function (key, value, color, autoHide) {
		var width = DEBUG_TEXT_WIDTH;
		var height = DEBUG_TEXT_LINE_HEIGHT;
		if (Array.isArray(value)) {
			height *= value.length;
		}

		var sprite = new TRP_CORE.FadableSprite();
		sprite.bitmap = new Bitmap(width, height);
		this.debugTextContainer.addChild(sprite);

		var index = debugTexts.length;
		sprite.x = 4;

		for (const i of debugTexts) {
			sprite.y += i.sprite.height + DEBUG_TEXT_MARGIN;
		}

		var info = {
			key,
			value: null,
			sprite,
			color,
			autoHide
		};
		debugTexts.push(info);

		return info;
	};



	var DEBUG_TEXT_FONT_SIZE = 17;
	var DEBUG_TEXT_LINE_HEIGHT = DEBUG_TEXT_FONT_SIZE + 4;
	var DEBUG_TEXT_WIDTH = 400;
	var DEBUG_TEXT_MARGIN = DEBUG_TEXT_LINE_HEIGHT / 2;

	_Dev.setDebugText = function (info, value, color = 'white', autoHide = false) {
		if (color === 'red') {
			color = 'rgb(255,100,100)';
		}

		if (Array.isArray(value)) {
			if (value.equals(info.value)) {
				return;
			}
		} else {
			if (info.value === value) return;
		}

		info.value = value;
		info.color = color;
		info.autoHide = autoHide;

		var sprite = info.sprite;
		sprite.clearFade();

		if ((!value && value !== 0)) {
			var height = sprite.height;
			sprite.parent.removeChild(sprite);
			sprite.terminate();

			var idx = debugTexts.indexOf(info);
			debugTexts.splice(idx, 1);

			var length = debugTexts.length;
			for (; idx < length; idx = (idx + 1) | 0) {
				var i = debugTexts[idx];
				i.sprite.y -= height - DEBUG_TEXT_MARGIN;
			}
			return info;
		}

		var lineH = DEBUG_TEXT_LINE_HEIGHT;
		var values = Array.isArray(value) ? value : [value];
		var length = values.length;
		var width = DEBUG_TEXT_WIDTH;
		if (sprite._frame.height !== lineH * length) {
			var height = lineH * length;
			var dy = height - sprite._frame.height;

			var idx = debugTexts.indexOf(info) + 1;
			var length = debugTexts.length;
			for (; idx < length; idx = (idx + 1) | 0) {
				var i = debugTexts[idx];
				i.sprite.y += dy;
			}

			sprite.bitmap = new Bitmap(width, height);
		}


		var fr = sprite._frame;
		var bitmap = sprite.bitmap;
		bitmap.clearRect(fr.x, fr.y, fr.width, fr.height);
		bitmap.fontSize = DEBUG_TEXT_FONT_SIZE;
		bitmap.textColor = color || 'white';
		bitmap.outlineWidth = 5;
		bitmap.outlineColor = 'black';

		length = values.length;
		var maxW = 0;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var value = values[i];
			var y = i * lineH;
			bitmap.drawText(value, fr.x + 2, fr.y + y, width - 4, lineH);
			maxW = Math.max(maxW, (bitmap.measureTextWidth(value) + 4).clamp(0, DEBUG_TEXT_WIDTH));
		}
		sprite._frame.width = maxW;
		sprite._refresh();

		if (autoHide) {
			sprite.startFadeOut(30, 60 * length, () => {
				debugTexts.some(i => {
					if (i.key === info.key && i.value === info.value) {
						_Dev.showText(info.key, null);
						return true;
					}
				});
			});
		}

		return info;
	};


	//=============================================================================
	// Tonner > _Dev.tonnerTiles()
	//=============================================================================
	_Dev.tonnerSprite = null;
	_Dev.tonnerTilesIndexes = function (indexes, autoRemove = false, color = 'red', texts = null, tonnerTiles = null, drawText = null) {
		var positions = [];
		var width = $dataMap.width;
		var length = indexes.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var pos = indexes[i];
			positions.push(pos % width);
			positions.push(Math.floor(pos / width));
		}
		return this.tonnerTiles(positions, autoRemove, color, texts, tonnerTiles, drawText);
	};
	_Dev.tonnerTilesRegionIndexes = function (indexes, autoRemove = false, color = 'red') {
		var positions = [];
		var width = $dataMap.width;
		var length = indexes.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var pos = indexes[i];
			positions.push(pos % 1000);
			positions.push(Math.floor(pos / 1000));
		}
		return this.tonnerTiles(positions, autoRemove, color);
	};
	_Dev.tonnerTiles = function (positions, autoRemove = false, color = 'red', texts = null, tonnerTiles = null, drawText = null) {
		if (positions.length === 0) return null;
		var length = positions.length;

		//check is indexes
		var width = $dataMap.width;
		var height = $dataMap.height;
		for (var i = 0; i < length; i = (i + 2) | 0) {
			var x = positions[i];
			var y = positions[i + 1];
			if (x >= width || y >= height) {
				return this.tonnerTilesIndexes(positions, autoRemove, color, texts, tonnerTiles, drawText);
			}
		}

		var x0 = Number.MAX_SAFE_INTEGER;
		var y0 = Number.MAX_SAFE_INTEGER;
		var x1 = 0;
		var y1 = 0;
		var tileW = $gameMap.tileWidth();
		var tileH = $gameMap.tileHeight();
		for (var i = 0; i < length; i = (i + 2) | 0) {
			var x = positions[i];
			var y = positions[i + 1];

			if (x < x0) x0 = x;
			if (x > x1) x1 = x;
			if (y < y0) y0 = y;
			if (y > y1) y1 = y;
		}

		var bitmap = new Bitmap(tileW * (x1 - x0 + 1), tileH * (y1 - y0 + 1));
		var ctx = bitmap._context;
		ctx.save();

		var isColorArr = Array.isArray(color);
		if (!isColorArr) {
			ctx.fillStyle = color;
		}

		if (tonnerTiles) {
			tonnerTiles(ctx, x0, y0);
		} else {
			ctx.beginPath();
			for (var i = 0; i < length; i = (i + 2) | 0) {
				var x = (positions[i] - x0) * tileW;
				var y = (positions[i + 1] - y0) * tileH;
				ctx.moveTo(x, y);
				ctx.lineTo(x + tileW, y);
				ctx.lineTo(x + tileW, y + tileH);
				ctx.lineTo(x, y + tileH);
				ctx.lineTo(x, y);
				if (isColorArr) {
					ctx.closePath();
					ctx.fillStyle = color[i / 2];
					ctx.fill();
					ctx.restore();
					if (i < length - 1) {
						ctx.beginPath();
					}
				}
			}

			if (!isColorArr) {
				ctx.closePath();
				ctx.fill();
			}
		}
		ctx.restore();

		if (bitmap._setDirty) {
			bitmap._setDirty();
		}

		bitmap.fontSize = 20;
		for (var i = 0; i < length; i = (i + 2) | 0) {
			var x = (positions[i] - x0) * tileW;
			var y = (positions[i + 1] - y0) * tileH;
			var text = texts ? texts[i / 2] : i / 2;
			if (drawText) {
				drawText(bitmap, x, y, text, i / 2);
			} else {
				bitmap.drawText(text, x, y, tileW, tileH, 'center');
			}
		}


		if (!_Dev.tonnerSprite) {
			_Dev.tonnerSprite = new Sprite();
		}
		var sprite = _Dev.tonnerSprite;
		sprite.bitmap = bitmap;
		sprite.z = 9;
		sprite.update = function () {
			for (var i = this.children.length - 1; i >= 0; i = (i - 1) | 0) {
				if (this.children[i].update) {
					this.children[i].update();
				}
			}

			this.x = Math.ceil($gameMap.adjustX(x0) * tileW);
			this.y = Math.ceil($gameMap.adjustY(y0) * tileH);
		};

		sprite.opacity = 180;
		if (autoRemove && sprite.addAnimation) {
			sprite.clearAnimations();
			sprite.addAnimation(Animation.wait(90))
			sprite.addAnimation(Animation.opacity(60, 0));
			sprite.addAnimation(Animation.remove(0));
		}

		SceneManager._scene._spriteset._tilemap.addChild(sprite);

		return sprite;
	}



	//=============================================================================
	// Resize Window
	//=============================================================================
	_Dev._originalW = 0;
	_Dev._originalH = 0;
	_Dev.resizeWindow = function (width = 0, height = Graphics.height) {
		if (!width) {
			width = this._originalW || 450;
			this._originalW = 0;
		} else {
			this._originalW = this._originalW || Graphics.width;
		}
		if (!height) {
			height = this._originalH || 800;
			this._originalH = 0;
		} else {
			this._originalH = this._originalH || Graphics.height;
		}

		var w0 = window.innerWidth;
		var h0 = window.innerHeight;
		var dw = Graphics.width - Graphics.boxWidth;
		var dh = Graphics.height - Graphics.boxHeight;

		if (isMZ) {
			Graphics.resize(width, height);
		} else {
			SceneManager._screenWidth = width;
			SceneManager._boxWidth = width;
			SceneManager._screenHeight = height;
			SceneManager._boxHeight = height;
			Graphics.width = width;
			Graphics.height = height;
		}
		Graphics.boxWidth = width - dw;
		Graphics.boxHeight = height - dh;

		Graphics._updateAllElements();

		var dw = width - w0;
		var dh = height - h0;


		if (width > w0) {
			window.moveBy(-dw / 2, -dh / 2);
		}

		window.resizeBy(dw, dh);
		if (width < w0) {
			window.moveBy(-dw / 2, -dh / 2);
		}

		if (!isMZ) {
			var sprset = SceneManager._scene._spriteset;
			sprset.setFrame(0, 0, width, height);
			if (sprset._baseSprite) {
				sprset._baseSprite.setFrame(0, 0, width, height);
			}
			if (Graphics.isWebGL()) {
				sprset.createToneChanger();
			}

			var windowLayer = SceneManager._scene._windowLayer;
			if (windowLayer) {
				windowLayer.width = width;
				windowLayer.height = height;
			}
		}
	};



	//=============================================================================
	// Clipboard
	//=============================================================================
	_Dev.copyToClipboard = function (text, noLog = false) {
		if (typeof text === 'object') {
			text = JSON.stringify(text);
		}

		var listener = function (e) {
			e.clipboardData.setData('text/plain', text);
			e.preventDefault();
			document.removeEventListener('copy', listener);
		}
		document.addEventListener('copy', listener);
		document.execCommand('copy');

		if (!noLog) {
			this.showTempText('clip', 'クリップボードにコピー')
			console.log(text);
		}
	};




	//=============================================================================
	// Save Image
	//=============================================================================
	_Dev.saveSpriteImage = function (sprite, filePath, zeroPos = false) {
		if (!filePath) {
			SoundManager.playBuzzer();
			return null;
		}
		if (!filePath.contains('.png')) {
			filePath = filePath + '.png';
		}

		var w = sprite.width * sprite.scale.x;
		var h = sprite.height * sprite.scale.y;
		var ax = sprite.anchor.x;
		var ay = sprite.anchor.y;
		sprite.anchor.set(0, 0);

		var x = sprite.x;
		var y = sprite.y;
		if (zeroPos) {
			sprite.x = 0;
			sprite.y = 0;
		}

		var bitmap = TRP_CORE.snap(sprite, w, h);
		_Dev.saveCanvas(bitmap, filePath);

		sprite.x = x;
		sprite.y = y;

		sprite.anchor.set(ax, ay);
		return bitmap;
	};

	_Dev.saveCanvas = function (bitmap, name, folder) {
		name = (name || "image");
		if (!name.contains('.png')) name += '.png';

		if (folder) {
			if (folder[folder.length - 1] !== '/') {
				folder += '/';
			}
			name = folder + name;
		}

		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var filePath = path.join(base, name);
		var base64Data = this.bitmapBase64Data(bitmap);
		fs.writeFileSync(filePath, base64Data, 'base64');
	};

	_Dev.bitmapBase64Data = function (bitmap) {
		var urlData = bitmap._canvas.toDataURL('image/png')
		var regex = (/^data:image\/png;base64,/);
		var base64Data = urlData.replace(regex, "");
		return base64Data;
	};



	//=============================================================================
	// Save Map
	//=============================================================================
	_Dev.saveMapFile = function (dataMap = $dataMap, mapId = $gameMap._mapId) {
		var filePath = TRP_CORE.mapFilePath(mapId);
		var backupPath = TRP_CORE.backupMapFilePath(mapId);


		//save backup
		var lastFile = _Dev.readFile(filePath);
		_Dev.ensureDirectoriesWithFilePath(backupPath);
		_Dev.saveFile(lastFile, backupPath);


		//delete meta
		var mapMeta = dataMap.meta;
		delete dataMap.meta;

		var metas = [];
		for (const event of dataMap.events) {
			if (!event) continue;
			metas.push(event.meta);
			delete event.meta;
		}

		//save data
		var file = JSON.stringify(dataMap);
		_Dev.saveFile(file, filePath);

		//restore meta
		dataMap.meta = mapMeta;
		for (const event of dataMap.events) {
			if (!event) continue;
			event.meta = metas.shift();
		}


		//info text
		var texts = ['マップデータを保存&バックアップしました！'];
		if (!isMZ) {
			texts.push('ゲームを閉じてプロジェクトを開き直してください。')
		}
		_Dev.showTempAlert(texts);
		SoundManager.playSave();
	};

	_Dev.restoreFromBackup = function () {
		var filePath = TRP_CORE.mapFilePath();
		var backupPath = TRP_CORE.backupMapFilePath();

		var file = null;
		if (_Dev.checkDirectoriesExists(backupPath)) {
			file = _Dev.readFile(backupPath);
		}
		if (!file) {
			SoundManager.playBuzzer();
			_Dev.showTempAlert('このマップのバックアップデータが存在しません。');
			return;
		}

		_Dev.saveFile(file, filePath);

		//info text
		var texts = ['バックアップから復元しました。'];
		if (!isMZ) {
			texts.push('ゲームを閉じてプロジェクトを開き直してください。')
		}
		_Dev.showTempAlert(texts);
		SoundManager.playLoad();
	};



	//=============================================================================
	// Others
	//=============================================================================
	_Dev.isAnyDevToolsBusy = function () {
		if (TRP_CORE.devToolsDisabled) return true;
		if (TRP_CORE.showingToolsWindow) return true;

		if (SceneManager._scene) {
			if (SceneManager._scene.update !== SceneManager._scene.constructor.prototype.update) {
				//update override maybe for any devTool
				return true;
			}
			if (SceneManager._scene._particleEditor || SceneManager._scene._particleGroupEditor) {
				//particle editor
				return true;
			}
		}
		if (window.TRP_SkitDevPicker && TRP_SkitDevPicker._expPicker) {
			//exp picker
			return true;
		}
		return false;
	};


})();