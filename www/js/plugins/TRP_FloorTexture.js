//=============================================================================
// TRP_FloorTexture.js
//=============================================================================
/*:
 * @author Thirop
 * @plugindesc 床テクスチャプラグイン[負荷注意:ヘルプに詳細]
 * @help
 * マップにテクスチャを重ねて濃淡の質感を出すプラグイン。
 *
 *
 * ◆ブレンド(合成)モード「オーバーレイ」の負荷について
 * スマートフォンで動作テストを行いましたが
 * 思っていた以上に負荷が高かったです…。
 *
 * 「床に濃淡をつけて情報量を増やす」という方向性で
 * オーバーレイを使わずいい感じにテクスチャを活用できないか
 * 検討してアップデートを行う予定です。
 *
 * 
 * ◆ブレンド(合成)モード「オーバーレイ」の動作について
 * ツクールMZではデフォルトでは未対応です。
 *
 * MZではコアスクリプトver1.6.0以降かつ、
 * 「pixi-picture_for_MZ_160.js」を導入することで
 * ブレンドモード「オーバーレイ」に対応します。
 *
 *
 *
 *
 * 
 * 【使い方】
 * □編集の開始
 * プラグインコマンド「編集開始」を実行してエディタを呼び出す
 * └MVでは「floorTexture edit」
 * └スクリプトでは「TRP_CORE.FloorTextureSprite.edit()」
 *
 * □マップのメモ欄設定
 * エディタ終了時にクリップボードに設定パラメータがコピーされるので
 * マップのメモ欄にペーストすればOK。
 *
 *
 * 【テクスチャ画像】
 * 「img/floor_textures」フォルダ内に
 * floor_texture1.png、floor_texture2.png〜の形式のファイル名で
 * 画像を準備してください。
 * （「ExPluginSet/materials/floor_textures」フォルダにプリセット素材があります）
 * 
 *
 *
 * @command edit
 * @text 編集開始
 * @desc テクスチャの編集開始
 * 
 * @requiredAssets img/floor_textures/floor_texture1
 * @requiredAssets img/floor_textures/floor_texture2
 * @requiredAssets img/floor_textures/floor_texture3
 * @requiredAssets img/floor_textures/floor_texture4
 * @requiredAssets img/floor_textures/floor_texture5
 * @requiredAssets img/floor_textures/floor_texture6
 * @requiredAssets img/floor_textures/floor_texture7
 * @requiredAssets img/floor_textures/floor_texture8
 * @requiredAssets img/floor_textures/floor_texture9
 * 
 *
 */
//============================================================================= 


(function () {
	'use strict';

	var useBlendFilter = PIXI.picture && PIXI.picture.getBlendFilter;
	var isMZ = Utils.RPGMAKER_NAME === "MZ";
	var isMac = navigator.userAgent.contains('Macintosh');
	var ctrlKey = isMac ? 'Cmd' : 'Ctrl';
	var pluginName = 'TRP_FloorTexture';




	//=============================================================================
	// Plugin Command
	//=============================================================================
	if (isMZ) {
		PluginManager.registerCommand(pluginName, 'edit', function (args) {
			FloorTextureSprite.edit();
		});
	};

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if (command === 'floorTexture') {
			FloorTextureSprite.edit();
		} else {
			_Game_Interpreter_pluginCommand.call(this, ...arguments);
		}
	};



	//=============================================================================
	// Managers
	//=============================================================================
	ImageManager.loadFloorTexture = function (filename) {
		return this.loadBitmap("img/floor_textures/", filename);
	};


	//=============================================================================
	// Spriteset_Map
	//=============================================================================
	var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
	Spriteset_Map.prototype.createLowerLayer = function () {
		_Spriteset_Map_createLowerLayer.call(this);
		this.createTrpFloorTextureSprites();
	};
	Spriteset_Map.prototype.createTrpFloorTextureSprites = function () {
		this._trpFloorTextureSprite = null;

		var paramsStr = $dataMap.meta.floorTexture;
		if (!paramsStr) return;
		if (!this._tilemap) return;

		var sprite = new FloorTextureSprite();
		this._trpFloorTextureSprite = sprite;

		var params = JSON.parse(paramsStr);
		sprite.setup(...params);

		this._tilemap.addChild(sprite);
	};


	//=============================================================================
	// FloorTextureSprite
	//=============================================================================
	var FloorTextureSprite = TRP_CORE.FloorTextureSprite = function FloorTextureSprite() {
		this.initialize.apply(
			this, arguments);
	};

	FloorTextureSprite.prototype = Object.create(TilingSprite.prototype);
	FloorTextureSprite.prototype.constructor = FloorTextureSprite;
	FloorTextureSprite.fracSpriteId = 0;
	FloorTextureSprite.MARGIN = 4;
	FloorTextureSprite.prototype.initialize = function () {
		TilingSprite.prototype.initialize.call(this);

		this.fracSpriteId = FloorTextureSprite.fracSpriteId++;
		this._scaleX = 1;
		this._scaleY = 1;
		this._lastDispX = Number.MAX_SAFE_INTEGER;
		this._lastDispY = Number.MAX_SAFE_INTEGER;
		this._setupId = 0;
		this.x = -FloorTextureSprite.MARGIN;
		this.y = -FloorTextureSprite.MARGIN;
		this._image = null;
		this._useFilter = false;
		this._currentParams = null;
	};

	FloorTextureSprite.prototype.setup = function (image = 1, blendMode = 1, scale = 1, aspectRatio = 1, z = 4, gamma = 1, contrast = 1, brightness = 1, alpha = 1) {
		this._currentParams = { image, blendMode, scale, aspectRatio, z, gamma, contrast, brightness, alpha };
		this._setupId += 1;
		var setupId = this._setupId;

		if (typeof image === 'number') {
			image = 'floor_texture' + image;
		}
		var useFilter = gamma !== 1 || contrast !== 1 || brightness !== 1;

		if (this._image === image && !useFilter && !this._useFilter) {
			this._setup(this.bitmap, setupId, image, blendMode, scale, aspectRatio, z, gamma, contrast, brightness, alpha);
		} else {
			var bitmap = ImageManager.loadFloorTexture(image);
			bitmap.addLoadListener(this._setup.bind(this, bitmap, setupId, image, blendMode, scale, aspectRatio, z, gamma, contrast, brightness, alpha));
		}
	};

	FloorTextureSprite.prototype._setup = function (bitmap, setupId, image, blendMode, scale, aspectRatio, z, gamma, contrast, brightness, alpha) {
		if (this._setupId !== setupId) return;

		this._image = image;


		var m = FloorTextureSprite.MARGIN;
		var useFilter = gamma !== 1 || contrast !== 1 || brightness !== 1;
		this._useFilter = useFilter;

		var contents;
		if (useFilter) {
			var sprite = new Sprite();
			sprite.bitmap = bitmap;
			var w = sprite.width;
			var h = sprite.height;

			var filterId = 'fracAdjust:' + sprite.fracSpriteId;
			var params = [gamma, 1, contrast, brightness, 1, 1, 1, alpha];
			TRP_FilterManager.filterCreate(filterId, null, 'adjustment', sprite, params);
			contents = TRP_CORE.snap(sprite, w, h);
			TRP_FilterManager.filterClear(filterId);
			this.opacity = 255;
		} else {
			contents = bitmap;
			this.opacity = 255 * alpha;
		}

		this.bitmap = contents;
		this.scale.set(scale, scale * aspectRatio);
		this._scaleX = this.scale.x;
		this._scaleY = this.scale.y;

		blendMode = blendMode.clamp(0, 10);
		if (this.blendMode !== blendMode) {
			this.blendMode = blendMode;

			if (useBlendFilter) {
				this.filters = null;
				if (blendMode === 4) {
					this.filters = [PIXI.picture.getBlendFilter(PIXI.BLEND_MODES.OVERLAY)];
				}
			}
		}

		this.z = z;
		this.width = Graphics.width / this.scale.x + 2 * m;
		this.height = Graphics.height / this.scale.y + 2 * m;
	};

	FloorTextureSprite.prototype.update = function () {
		TilingSprite.prototype.update.call(this);

		this.origin.x = ($gameMap._displayX * 48 / this._scaleX);
		this.origin.y = ($gameMap._displayY * 48 / this._scaleY);
	};









	//=============================================================================
	// Filter Editor
	//=============================================================================
	(() => {
		if (!Utils.isOptionValid('test')) {
			FloorTextureSprite.edit = function () { };
			return;
		}


		var _Dev = TRP_CORE.DevFuncs;

		FloorTextureSprite.edit = function () {
			var sprite;
			var spriteset = SceneManager._scene._spriteset;
			if (spriteset && spriteset._trpFloorTextureSprite) {
				sprite = spriteset._trpFloorTextureSprite;
			} else {
				sprite = new FloorTextureSprite();
				spriteset._trpFloorTextureSprite = sprite;
				SceneManager._scene._spriteset._tilemap.addChild(sprite);
				sprite.setup();
			}

			try {
				Editor.start(sprite);
			} catch (e) {
				SoundManager.playBuzzer();
			}
		};




		//=============================================================================
		// Editor
		//=============================================================================
		var Editor = FloorTextureSprite.Editor = function Editor() {
			this.initialize.apply(this, arguments);
		};

		var backspaceKey = Input.keyMapper[8] || 'backspace';
		Input.keyMapper[8] = backspaceKey;

		Editor._savedUpdate = null;
		Editor.isActive = false;

		Editor.start = function (sprite) {
			this.isActive = true;

			this._savedUpdate = SceneManager._scene.update;
			var editor = new Editor(sprite)
			var scene = SceneManager._scene;
			scene.addChild(editor);

			scene.update = function () {
				_Dev.updateTexts();

				if (!editor.update()) {
					SceneManager._scene.update = this._savedUpdate;

					this._savedUpdate = null;
					scene.removeChild(editor);
					editor.destroy();
					this.isActive = false;
				}
			}.bind(this);
		};

		Editor.prototype = Object.create(Sprite.prototype);
		Editor.prototype.constructor = Editor;
		Editor.prototype.initialize = function (sprite) {
			Sprite.prototype.initialize.call(this);
			this.initMembers();
			this._target = sprite;

			this._data = JsonEx.makeDeepCopy(sprite._currentParams);
			this._keys = Object.keys(this._data);


			SoundManager.playOk();
			this.registerKeyListeners();
			this.createSelectorSprite();
			this.createLines();

			this.prepareInputtingCandidates();

			_Dev.showText('floorTextureEditHelp', [
				'←→：値の調整(+Shiftで微調整)',
				ctrlKey + '+D：一時的に表示/非表示',
				ctrlKey + '+W：編集終了&パラメータコピー',
			]);
		};
		Editor.prototype.initMembers = function () {
			this.clearKeyDownListeneres();

			this._end = false;

			this._lastEditingIndex = -1;
			this._editingIndex = -1;

			this._data = null;
			this._keys = null;

			this._parts = null;
			this._commands = null;

			this._inputtingWords = '';
			this._inputtingCandidates = null;
		};



		Editor.PARAMS_UNIT = {
			image: 1,
			blendMode: 1,
			scale: 0.1,
			aspectRatio: 0.1,
			z: 1,
			gamma: 0.1,
			saturation: 0.1,
			contrast: 0.1,
			brightness: 0.1,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			alpha: 0.1,
		};
		Editor.INT_PARAMS = [
			'image', 'blendMode', 'z'
		];


		Editor.prototype.update = function () {
			if (TouchInput.isTriggered() || TouchInput.isPressed()) {
				this.processTouch();
			} else if (Input._latestButton || this._keyCode) {
				this.processInput();
			}
			this._keyCode = 0;
			this._key = '';
			return !this._end;
		};
		Editor.prototype.processTouch = function () {
			var allParts = this._parts;
			var length = allParts.length;
			var x = TouchInput.x;
			var y = TouchInput.y;

			var margin = Editor.SELECTOR_MARGIN;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var parts = allParts[i];
				if (parts.processTouch(x, y, margin)) {
					TouchInput.clear();
					this.startEditing(i);
					return;
				}
			}
		};

		Editor.prototype.processInput = function () {
			if (this._end) return;

			if (Input.isRepeated('down') && this._keyCode !== 98) {
				var index = this._editingIndex;
				index = (index + 1) % this._parts.length;

				this.startEditing(index);
				this.resetInputingWords();
			} else if (Input.isRepeated('up') && this._keyCode !== 104) {
				var index = this._editingIndex;
				index -= 1;
				if (index < 0) index = this._parts.length - 1;

				this.startEditing(index);
				this.resetInputingWords();
			} else if (Input.isRepeated('right')) {
				this.addValue(Input.isPressed('shift') ? 0.1 : 1);
			} else if (Input.isRepeated('left')) {
				this.addValue(Input.isPressed('shift') ? -0.1 : -1);
			} else if (this._keyCode >= KEY_CODE.alphabet && this._keyCode <= KEY_CODE.alphabetEnd) {
				this.pushInputtingCharacter(String.fromCharCode(this._keyCode));
			} else {
				var editing = this._editingIndex >= 0 ? this.editingParts() : null;
				if (editing) {
					if (!editing.processInput(this._keyCode, this._key)) {
						this.endEditing();
					} else {
						this.selectParts(this._editingIndex);
					}
				}
				if (this._keyCode !== 0) {
					this.resetInputingWords();
				}
			}
		};

		Editor.prototype.setFilterParams = function (innerData, params) {
			var idx = 0;
			var data = innerData.data;
			for (const parts of this._parts) {
				if (parts._data !== data) continue;

				var value = params[idx++];
				parts.setValue(value);
			}
		};

		Editor.prototype.addValue = function (rate) {
			var parts = this.editingParts()
			if (!parts) return;
			parts.addValue(rate);
		};


		Editor.prototype.end = function () {
			this._end = true;
			this.resignKeyListeners();

			var lines = this._parts;
			var length = lines.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var line = lines[i];
				line._target = null;
			}


			//copy data
			var text = this.resultText();

			_Dev.copyToClipboard(text, true);
			_Dev.showTempText('clip', 'クリップボードにフィルター設定をコピー')
			SoundManager.playSave();

			_Dev.showText('floorTextureEditHelp', null);

			if (this._completion) {
				this._completion(text);
				this._completion = null;
			}
		};
		Editor.prototype.resultText = function () {
			var params = [];
			for (const key of this._keys) {
				params.push(this._data[key]);
			}
			return '<floorTexture:' + JSON.stringify(params) + '>';
		};

		Editor.prototype.startEditing = function (index) {
			if (index < 0) return;

			if (this._editingIndex === index) return;
			SoundManager.playCursor();

			var target = this._parts[index];
			if (this._editingIndex >= 0) {
				this._endEditing();
				index = this._parts.indexOf(target);
				if (index < 0) {
					this._editingIndex = -1;
					this.deselectParts();
					return;
				}
			}

			this._editingIndex = index;
			target.startEditing();
			this.selectParts(index);
		};
		Editor.prototype.endEditing = function () {
			SoundManager.playCancel();

			this._lastEditingIndex = this._editingIndex;
			this._endEditing();

			this._editingIndex = -1;
			this.deselectParts();
		};
		Editor.prototype._endEditing = function () {
			var editing = this.editingParts();
			if (editing) {
				editing.endEditing();
			}
		}
		Editor.prototype.editingParts = function () {
			return this._parts[this._editingIndex];
		};

		Editor.prototype.registerKeyListeners = function () {
			var listener = this._onKeyDown.bind(this);
			this._keydownListener = listener;
			document.addEventListener('keydown', listener);
		};
		Editor.prototype.clearKeyDownListeneres = function () {
			this._keydownListener = null;
			this._copyListener = null;
		};
		Editor.prototype.resignKeyListeners = function () {
			if (this._keydownListener) {
				document.removeEventListener('keydown', this._keydownListener);
			}
			if (this._copyListener) {
				document.removeEventListener('copy', this._copyListener);
			}

			this.clearKeyDownListeneres();
		};

		Editor.prototype._onKeyDown = function (event) {
			if (event.ctrlKey || event.metaKey) {
				if (event.key === 'g') {
					if (this.alpha === 1) {
						this.alpha = 0.25;
					} else {
						this.alpha = 1;
					}
					SoundManager.playCursor();
				} else if (event.key === 'd') {
					this._target.visible = !this._target.visible;
					SoundManager.playCursor();
				} else if (event.key === 'w') {
					this.end();
				} else if (!isNaN(event.key)) {
					this.tryLoadUserPreset(Number(event.key));
				}
			} else if (!event.ctrlKey && !event.altKey) {
				this._keyCode = event.keyCode;
				this._key = event.key;
			}
		};





		/* selector
		===================================*/
		Editor.prototype.createSelectorSprite = function () {
			var size = EditorLine.LINE_HEIGHT;
			var bitmap = new Bitmap(size, size);
			bitmap.fillAll('rgb(180,180,180)');

			var sprite = new Sprite(bitmap);
			sprite.opacity = 150;
			this._selectorSprite = sprite;
			this.addChild(sprite);
			sprite.visible = false;
		};
		Editor.SELECTOR_MARGIN = 20;
		Editor.prototype.selectParts = function (index) {
			var parts = this._parts[index];
			var sprite = this._selectorSprite;

			var size = sprite.bitmap.height;
			sprite.y = parts.y;

			sprite.anchor.set(1, 0);
			sprite.x = Graphics.width;

			sprite.scale.x = (parts._width + Editor.SELECTOR_MARGIN) / size;
			sprite.visible = true;

		};


		Editor.prototype.deselectParts = function () {
			this._selectorSprite.visible = false;
		};


		/* editor line
		===================================*/
		Editor.SELECTION_WIDHT = 24;
		Editor.prototype.createLines = function () {
			var y = 20;
			var lineH = 24;
			var categoryMargin = 14;
			this._parts = [];
			this._commands = [];

			var data = this._data;
			for (const key of this._keys) {
				if (key === 'gamma') {
					y += categoryMargin;
				}

				var line = new EditorLine(key, data, this._target);
				line.y = y;
				line.refresh();

				this._parts.push(line);
				this._commands.push(key.toUpperCase());

				this.addChild(line);

				y += lineH;
			}
		};




		/* word inputting
		===================================*/
		Editor.prototype.resetInputingWords = function () {
			if (this._inputtingWords === '') return;

			this._inputtingWords = '';
			this.prepareInputtingCandidates();
		};
		Editor.prototype.prepareInputtingCandidates = function () {
			this._inputtingCandidates = this._commands.concat();
		};
		Editor.prototype.pushInputtingCharacter = function (chara) {
			this._inputtingWords += chara;
			var words = this._inputtingWords;
			var candidates = this._inputtingCandidates;
			var length = candidates.length;
			var firstHit = null;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var word = candidates[i];
				if (word.indexOf(words) !== 0) {
					candidates.splice(i, 1);
					i -= 1;
					length -= 1;
				} else {
					firstHit = firstHit || word;
				}
			}

			if (!firstHit) {
				this.prepareInputtingCandidates();
				candidates = this._inputtingCandidates
				var length = candidates.length;
				while (words.length > 0 && !firstHit) {
					for (var i = 0; i < length; i = (i + 1) | 0) {
						if (candidates[i].indexOf(words) !== 0) continue;
						firstHit = candidates[i];
						break;
					}
					if (!firstHit) {
						words = words.substr(1);
					}
				}
				if (firstHit) {
					for (var i = length - 1; i >= 0; i = (i - 1) | 0) {
						if (candidates[i].indexOf(words) !== 0) continue;
						candidates.splice(i, 1);
					}
				}
				this._inputtingWords = words;
			}

			if (firstHit) {
				this.tryInputtingFirstHit(firstHit)
			}
		};
		Editor.prototype.tryInputtingFirstHit = function (firstHit) {
			var perfectHit = this._inputtingWords === firstHit;
			var index = this._commands.indexOf(firstHit);
			this.startEditing(index);
		};





		//=============================================================================
		// EditorLine
		//=============================================================================
		function EditorLine() {
			this.initialize.apply(this, arguments);
		};
		EditorLine.FONT_SIZE = 18;
		EditorLine.LINE_HEIGHT = EditorLine.FONT_SIZE + 4;

		EditorLine.prototype = Object.create(PIXI.Container.prototype);
		EditorLine.prototype.constructor = EditorLine;
		EditorLine.prototype.initialize = function (key, data, target) {
			PIXI.Container.call(this);
			this.width = Graphics.width;
			this.height = Graphics.height;

			this._key = key;
			this._data = data;
			this._target = target;

			this._width = 0;
			this._height = EditorLine.LINE_HEIGHT;

			this._titleWidth = 0;
			this._titleSprite = null;
			this._parts = [];
			this._textsCache = [];

			this._editingIndex = -1;
			this._inputting = '';
		};

		EditorLine.prototype.titleText = function () {
			var title;
			if ($gameSystem.isJapanese()) {
				title = EditorLine.paramTitleJapanese(this._key);
			} else {
				title = this._key;
			}
			return '[' + title + ']';
		};
		EditorLine.paramTitleJapanese = function (key) {
			switch (key) {
				case "z": return "Z値";
				case "image": return "画像番号";
				case "scale": return "拡大率";
				case "aspectRatio": return "アスペクト(縦/横比率)";
				case "blendMode": return "ブレンドモード";

				case "gamma": return "ガンマ";
				case "contrast": return "コントラスト";
				case "brightness": return "明るさ";
				case "alpha": return "アルファ";
			}
		};


		EditorLine.prototype.type = function () {
			return 'value';
		};
		EditorLine.prototype.refreshWithConfigData = function (config) {
			this.refresh();
		};
		EditorLine.prototype.refresh = function () {
			this.refreshParts();
		};
		EditorLine.prototype.titleColor = function () {
			return 'rgb(100,200,255)';
		};
		EditorLine.prototype.partsColor = function () {
			return 'rgb(200,255,255)';
		};
		EditorLine.prototype.createTitleSprite = function () {
			var sprite = new Sprite();
			this.addChild(sprite);
			this._titleSprite = sprite;

			this.refreshTitleSprite();
		};
		EditorLine.prototype.refreshTitleSprite = function () {
			var text = this.titleText();

			var sprite = this._titleSprite;
			var bitmap = sprite.bitmap;

			var fontSize = EditorLine.FONT_SIZE;
			var width = text.length * fontSize + 4;
			var height = fontSize + 4;
			if (bitmap && bitmap.width < width) {
				bitmap.clear();
			} else {
				bitmap = new Bitmap(width, height);
				sprite.bitmap = bitmap;
			}

			sprite.anchor.set(1, 0);

			bitmap.fontSize = fontSize;
			bitmap.outlineColor = 'black';
			bitmap.outlineWidth = 5;
			bitmap.textColor = this.titleColor();
			bitmap.drawText(text, 0, 0, width, height, 'right');

			this._titleWidth = bitmap.measureTextWidth(text);
		};

		EditorLine.prototype.refreshParts = function () {
			var parts = this._parts;
			var length = this.partsNum();

			for (var i = 0; i < length; i = (i + 1) | 0) {
				var text = this.partsText(i);
				var sprite = parts[i];
				if (!sprite) {
					sprite = this.createPartsSprite();
					this.addChild(sprite);
					parts[i] = sprite;
					this._textsCache[i] = null;
				} else {
					sprite.visible = true;
				}
				if (this.checkChangeFromCache(text, i)) {
					this.refreshPartsText(sprite, text, i);
				}
			}

			var partsLen = parts.length;
			for (; i < partsLen; i = (i + 1) | 0) {
				parts[i].parent.removeChild(parts[i]);
			}
			parts.length = length;

			this.layout();
		};

		EditorLine.prototype.checkChangeFromCache = function (text, i) {
			if (this._textsCache[i] === text) {
				return false;
			}

			this._textsCache[i] = text;
			return true;
		};

		EditorLine.prototype.partsNum = function () {
			return 1;
		};

		EditorLine.prototype.partsText = function (index) {
			return this._inputting || this._data[this._key];
		};
		EditorLine.prototype.defaultValue = function () {
			return 0;
		};

		EditorLine.prototype.pushSaveDataParams = function (data) {
		};


		EditorLine.prototype.configValue = function (configName, config) {
			var elems = configName.split('.');
			config = config || this._config;
			while (elems.length > 0 && config) {
				var elem = elems.shift();
				config = config[elem];
			}
			return config || this.defaultValue();
		};
		EditorLine.prototype.defaultValue = function () {
			return 0;
		};

		EditorLine.prototype.addValue = function (rate) {
			var unit = Editor.PARAMS_UNIT[this._key] || 0.1;
			var value = this.value();

			if (Editor.INT_PARAMS.contains(this._key)) {
				value += rate > 0 ? 1 : -1;
			} else {
				value += unit * rate;
				value = Math.round(value / unit * 10) * unit / 10 + 0.000000001;
			}
			this.setValue(value);
		};

		EditorLine.prototype.setValue = function (value) {
			if (Math.abs(value) <= 0.000001) value = 0;

			if (Editor.INT_PARAMS.contains(this._key)) {
				this._inputting = String(value);
			} else {
				var unit = Editor.PARAMS_UNIT[this._key] || 0.1;
				var decimal = TRP_CORE.decimal(unit) + 1;
				this._inputting = TRP_CORE.withDecimal(value, decimal);
			}

			var idx = this._editingIndex;
			this._editingIndex = 0;
			this.applyEditing();
			this._editingIndex = idx;
		};

		EditorLine.MAX_PARTS_WIDTH = 128;
		EditorLine.prototype.maxPartsWidth = function () {
			return EditorLine.MAX_PARTS_WIDTH;
		};

		EditorLine.prototype.createPartsSprite = function () {
			var fontSize = EditorLine.FONT_SIZE;
			var width = this.maxPartsWidth();
			var height = fontSize + 4;

			var bitmap = new Bitmap(width, height);
			bitmap.fontSize = fontSize;
			bitmap.outlineColor = 'black';
			bitmap.outlineWidth = 5;
			bitmap.textColor = this.partsColor();
			var sprite = new Sprite(bitmap);

			return sprite;
		};

		EditorLine.prototype.refreshPartsText = function (sprite, text, i) {
			var bitmap = sprite.bitmap;
			bitmap.clear();

			var width = bitmap.width;
			var height = bitmap.height;
			var textWidth = Math.min(width, bitmap.measureTextWidth(text) + 2);
			bitmap.drawText(text, 1, 0, width - 2, height);

			sprite._frame.width = textWidth;
			sprite._refresh();
		};


		EditorLine.prototype.layout = function () {
			if (!this._titleSprite) {
				this.createTitleSprite();
			}

			var margin = 5;
			var x;
			var rightAlign = true;

			var title = this._titleSprite;
			if (rightAlign) {
				x = Graphics.width - margin;
			} else {
				x = margin;
				title.x = x;
				x += this._titleWidth + margin;
			}


			var allParts = this._parts;
			var length = allParts.length;
			if (rightAlign) {
				for (var i = length - 1; i >= 0; i = (i - 1) | 0) {
					var parts = allParts[i];
					parts.visible = !this._hidden;
					if (!parts.visible) continue;

					x -= parts.width;
					parts.x = x;
					x -= margin;
				}
			} else {
				for (var i = 0; i < length; i = (i + 1) | 0) {
					var parts = allParts[i];
					parts.visible = !this._hidden;
					if (!parts.visible) continue;

					parts.x = x;
					x += parts.width + margin;
				}
			}

			var title = this._titleSprite;
			if (rightAlign) {
				title.x = x;
				this._width = Graphics.width - x + this._titleWidth;
			} else {
				this._width = x - margin;
			}
		};

		EditorLine.prototype.show = function () {
			if (!this._hidden) return;
			this._hidden = false;
			this.layout();
		};
		EditorLine.prototype.hide = function () {
			if (this._hidden) return;
			this._hidden = true;
			this.layout();
		};


		/* edit
		===================================*/
		EditorLine.prototype.processTouch = function (x, y, margin) {
			if (y < this.y) return false;
			if (y > this.y + this._height) return false;

			var rightAlign = true;
			if (rightAlign) {
				if (x < Graphics.width - this._width - margin) return false;
			} else {
				if (this._width + margin < x) return false;
			}

			var allParts = this._parts;
			var length = allParts.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var parts = allParts[i];
				if (parts.x <= x && x <= parts.x + parts.width) {
					this.setEditing(i);
					return true;
				}
			}
			return true;
		};

		EditorLine.prototype.startEditing = function () {
			this.setEditing(Math.max(0, this._editingIndex));
		};
		EditorLine.prototype.setEditing = function (index) {
			var parts = this._parts;
			var length = parts.length;
			index = index % length;
			this._editingIndex = index;
			this.clearInputting();

			for (var i = 0; i < length; i = (i + 1) | 0) {
				parts[i].opacity = i === index ? 255 : 150;
			}
			this.refreshParts();
		};
		EditorLine.prototype.endEditing = function () {
			var needsRefresh = this._editingIndex >= 0;
			this._editingIndex = -1;
			var parts = this._parts;
			var length = parts.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				parts[i].opacity = 255;
			}

			if (needsRefresh) {
				this.refreshParts();
			}
		};

		EditorLine.KEY_CODE = {
			backSpace: 8,
			tab: 9,
			delete: 46,
			num: 48,
			alphabet: 65,
			a: 65,
			c: 67,
			d: 68,
			e: 69,
			f: 70,
			g: 71,
			i: 73,
			l: 76,
			p: 80,
			s: 83,
			t: 84,
			v: 86,
			w: 87,
			alphabetEnd: 90,
			tenkey: 96,
			minus: 189,
			tenkeyMinus: 109,
			dot: 190,
			tenkeyDot: 110,
			at: 192,
			bracket: 219
		};
		var KEY_CODE = EditorLine.KEY_CODE;

		EditorLine.prototype.processInput = function (keyCode, key) {
			if (Input.isTriggered('ok')) {
				this.clearInputting();
			} else if (keyCode === KEY_CODE.backSpace) {
				this.clearInputting(true);
				this.applyEditing();
			} else {
				this._processCharacterInput(keyCode, key);
			}

			return true;
		};
		EditorLine.prototype._processCharacterInput = function (keyCode) {
			var numKeyCode = KEY_CODE.num;
			var tenKeyCode = KEY_CODE.tenkey;
			var chara = null;

			if (keyCode >= numKeyCode && keyCode < numKeyCode + 10) {
				chara = Number(keyCode - numKeyCode);
			} else if (keyCode >= tenKeyCode && keyCode < tenKeyCode + 10) {
				chara = Number(keyCode - tenKeyCode);
			} else if (keyCode === KEY_CODE.minus || keyCode === KEY_CODE.tenkeyMinus) {
				chara = '-';
				this._inputting = '';
			} else if (keyCode === KEY_CODE.dot || keyCode === KEY_CODE.tenkeyDot) {
				if (!this._inputting.contains('.')) {
					chara = '.';
				}
			}
			if (chara !== null) {
				this._inputting += chara;
				this.applyEditing();
			}
		};



		EditorLine.prototype.clearInputting = function () {
			this._inputting = '';
		};

		EditorLine.prototype.applyEditing = function () {
			var index = this._editingIndex;
			if (index < 0) return;

			var value = Number(this._inputting) || 0;;
			this._data[this._key] = value;

			var key = this._key;
			var keys = this._key.split('_');
			var obj = this._data;
			var length = keys.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var key = keys[i];
				if (i < length - 1) {
					obj = obj[key];
				} else {
					obj[key] = value;
				}
			}

			var params = Object.keys(this._data).map(key => this._data[key]);
			this._target.setup(...params);
			this.refreshParts();
		};

		EditorLine.prototype.valueWithInputting = function () {
			var input = this._inputting;
			var value = Number(this._inputting);
			if (value === NaN) {
				value = this.value(this._editingIndex);
				this._inputting = String(value);
			}
			return value;
		};

		EditorLine.prototype.value = function () {
			return this._data[this._key];
		};


	})();



})();