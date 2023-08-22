//=============================================================================
// TRP_MapDecorator_Template.js
//=============================================================================

// Plugin Command
// Info Character
// Analyze
// type:baseFloor
// type:wall
// type:criff
// type:water
// type:accessory
// type:objPalette
// type:variation
// type:variationOneSize

//============================================================================= 
/*:
 * @author Thirop
 * @target MZ
 * @plugindesc 自動装飾テンプレート<開発用>
 * @base TRP_CORE
 * @base TRP_MapDecorator
 * @orderAfter TRP_CORE
 * @orderAfter TRP_MapDecorator
 *
 * 
 *
 *
 *
 * @help
 * 【導入】
 * 以下のプラグインより下に配置
 * ・TRP_CORE.js<必須>
 * ・TRP_MapDecorator.js<必須>
 *
 *
 * 【更新履歴】
 * 1.14 2023/01/08 拡張:設定「共有パレットマップID」の追加
 * 1.12 2022/12/11 拡張:置換プロセスの手動実行に対応
 * 1.10 2022/12/04 拡張:置換処理拡張に対応
 * 1.00 2022/11/05 初版
 *
 *
 * 【MV形式コマンド】
 * □shift：タイルをシフト（ずらす）
 * 『decoratorTemplate shift 対象のX座標 シフト量』
 * ・対象のX座標：指定したX座標より右のタイル全てずらします
 * ・シフト量：プラスで右、マイナスで左にずらす
 *
 * 指定のX座標より右のタイルを右にシフト(ずらす)するコマンド。
 * タイルが右にはみ出ないようマップ幅をとること。
 * 
 * テンプレート整理などにご活用ください。
 * 直前のマップファイルのバックアップはデフォルトで
 * 「_dev/backup」フォルダにあるので
 * 万が一破損などした場合はこのフォルダ内の破損したマップデータを
 * 「data」フォルダにうつして復元してください。
 * 
 *
 *
 *
 * @command shift
 * @text [テンプレ整理]右にシフト
 * @desc 指定のX座標より右のタイルを右にシフト(ずらす)。タイルが右にはみ出ないようマップ幅をとること
 *
 * @arg x
 * @text 対象のX座標
 * @desc 対象のX座標。指定したX座標より右のタイル全てずらします
 * @default 0
 * @min 0
 * @type number
 * 
 * @arg value
 * @text シフト量
 * @desc シフト量（プラスで右、マイナスで左にずらす）
 * @default 0
 * @min -1000
 * @type number
 *
 *
 *
 *
 *
 *
 * ================================================
 * @param command
 * @text コマンド名(MV)
 * @desc MV形式プラグインコマンドのコマンド名
 * @default decoratorTemplate
 * @type string
 *
 *
 * @param commonMapId
 * @text 共有パレットマップID
 * @desc 共有パレットとして使用するテンプレート用のマップID
 * @default 0
 * @type number
 * @min 0 
 *
 *
 */
//============================================================================= 



(function () {
	'use strict';

	if (!Utils.isNwjs() || !Utils.isOptionValid('test')) return;

	var pluginName = 'TRP_MapDecorator_Template';
	var parameters = PluginManager.parameters(pluginName);
	var commonMapId = Number(parameters.commonMapId) || 0;

	var _Dev = TRP_CORE.DevFuncs;
	var MapDecorator = TRP_MapDecorator;
	var MapObject = TRP_CORE.MapObject || null;

	var isMZ = Utils.RPGMAKER_NAME === "MZ";

	MapDecorator.analyzeInfo = null;
	MapDecorator.processList = null;






	//=============================================================================
	// Plugin Command
	//=============================================================================
	(() => {
		if (isMZ) {
			['shift'].forEach(command => PluginManager.registerCommand(pluginName, command, function (args) {
				var argsArr = Object.values(args)
				argsArr.unshift(command);

				pluginCommand(argsArr, this);
			}));
		}

		var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
		Game_Interpreter.prototype.pluginCommand = function (command, args) {
			if (command === parameters.command) {
				pluginCommand(args, this);
			} else {
				_Game_Interpreter_pluginCommand.call(this, ...arguments);
			}
		};

		function pluginCommand(args, interpreter) {
			var name = args[0];
			if (name === 'shift') {
				processCommandShift(args, interpreter);
			}
		};

		function processCommandShift(args, interpreter) {
			var idx = 1;
			var x = Number(args[idx++]);
			var value = Number(args[idx++]);

			if (isNaN(x) || x < 0 || x >= $dataMap.width) {
				SoundManager.playBuzzer();
				alert('対象のX座標が無効です。(x=%1)'.format(args[1]));
				return;
			}
			if (isNaN(value) || !value) {
				SoundManager.playBuzzer();
				alert('シフト量が無効です。(value=%1)'.format(args[2]));
				return;
			}


			/* init events from json
			===================================*/
			var mapFilePath = TRP_CORE.mapFilePath($gameMap._mapId);
			var dataMap = JSON.parse(_Dev.readFile(mapFilePath));
			$dataMap.events = dataMap.events;
			for (const data of dataMap.events) {
				if (data && data.note !== undefined) {
					DataManager.extractMetadata(data);
				}
			}


			/* check tile or event exists
			===================================*/
			var x0, w;
			if (value >= 0) {
				x0 = $dataMap.width - value;
				w = value;
			} else {
				x0 = x + value;
				w = -value;
			}
			if (checkAnyTileExists(x0, w)) {
				return;
			}
			if (checkAnyEventExists(x0, w)) {
				return;
			}


			/* shift
			===================================*/
			shiftTiles(x, value);
			shiftEvents(x, value);

			MapDecorator.requestRefreshTilemap();

			var listener = (event) => {
				if (event.metaKey || event.ctrlKey) {
					if (event.key === 's') {
						if (confirm('シフト調整したマップを保存しますか？')) {
							_Dev.showText('shiftConfirm', null);
							document.removeEventListener('keydown', listener);
							SoundManager.playSave();
							_Dev.saveMapFile();
						}
					}
				}
			};
			document.addEventListener('keydown', listener);

			$gamePlayer._through = true;
			$gamePlayer._moveSpeed = 5;
			_Dev.showText('shiftConfirm', 'Ctrl(MacはCmd)+Sで保存', 'red');
		};

		function checkAnyTileExists(x0, w) {
			var data = $dataMap.data;
			var width = $dataMap.width;
			var height = $dataMap.height;
			var zLayerSize = width * height;

			for (var dx = 0; dx < w; dx = (dx + 1) | 0) {
				var x = x0 + dx;
				for (var y = 0; y < height; y = (y + 1) | 0) {
					var idx = x + y * width;
					for (var z = 0; z < 5; z = (z + 1) | 0) {
						if (data[z * zLayerSize + idx]) {
							SoundManager.playBuzzer();
							alert('x:%1,y:%2,にタイルまたはリージョンがあるためシフトできません'.format(x, y));
							return true;
						}
					}
				}
			}
			return false;
		}
		function shiftTiles(tx, shift) {
			var srcData = $dataMap.data;
			var dstData = $dataMap.data.concat()
			var width = $dataMap.width;
			var height = $dataMap.height;
			var zLayerSize = width * height;

			for (var proc = 0; proc < 2; proc = (proc + 1) | 0) {
				for (var x = tx; x < width; x = (x + 1) | 0) {
					for (var y = 0; y < height; y = (y + 1) | 0) {
						var baseIdx = x + y * width;
						for (var z = 0; z < 6; z = (z + 1) | 0) {
							var idx = z * zLayerSize + baseIdx;
							if (proc === 0) {
								dstData[idx] = 0;
							} else {
								if (x + shift >= 0 && x + shift < width) {
									dstData[idx + shift] = srcData[idx];
								}
							}
						}
					}
				}
			}

			$dataMap.data.length = 0;
			Array.prototype.push.apply($dataMap.data, dstData);
		}
		function checkAnyEventExists(x0, w) {
			var events = $dataMap.events;
			var width = $dataMap.width;
			var height = $dataMap.height;

			for (const event of events) {
				if (!event) continue;
				if (event.x >= x0 && event.x < x0 + w) {
					SoundManager.playBuzzer();
					alert('x:%1,y:%2,にイベントがあるためシフトできません'.format(event.x, event.y));
					return true;
				}
			}
			return false;
		}
		function shiftEvents(x, shift) {
			var events = $dataMap.events;
			var width = $dataMap.width;
			var height = $dataMap.height;

			for (const event of events) {
				if (!event) continue;
				if (event.x >= x) {
					event.x += shift;
				}
			}


			/* shift Display events
			===================================*/
			for (const event of $gameMap._events) {
				if (!event) continue;
				if (event._x >= x) {
					event._x = event._realX += shift;
				}
			}

			//Map object
			if (MapObject) {
				var objects = $dataTrpMapObjects;
				for (const obj of objects) {
					if (obj.tileX() >= x) {
						obj.shift(shift, 0);
					}
				}
			}
		}
	})();





	//=============================================================================
	// Info Character
	//=============================================================================
	MapDecorator.prepareInfoCharacterTypes = function () {
		this.INFO_CHARACTER_TYPE_KEYS = Object.keys(this.INFO_CHARACTER_TYPES);
	};
	MapDecorator.infoCharacterType = function (x = 0, y = 0) {
		return this.infoCharacterTypeWithIdx(x + y * width);
	};
	MapDecorator.infoCharacterTypeWithIdx = function (idx) {
		var event = posEventMap[idx];
		if (!event) return null;
		return this.infoCharacterTypeWithEvent(event);
	};
	MapDecorator.infoCharacterTypeWithEvent = function (event) {
		var image = event.pages[0].image;
		if (image.characterName !== this.INFO_CHARACTER_NAME) return null;

		for (const type of this.INFO_CHARACTER_TYPE_KEYS) {
			var info = this.INFO_CHARACTER_TYPES[type];
			if (info[0] !== image.characterIndex) continue;
			if (info[1] !== image.direction) continue;
			if (info[2] !== image.pattern) continue;

			return type;
		}
		return null;
	};

	function isBigObjEmptyTile(x, y = 0) {
		return MapDecorator.infoCharacterType(x, y) === 'bigObjEmptyTile';
	}




	//=============================================================================
	// env variables
	//=============================================================================
	var ENV_VARS = {};
	var data;
	var width;
	var height;
	var zLayerSize;
	var zRegion;
	var zAcc;
	var zObj1;
	var zObj2;
	var zShadow;
	var zRegion;

	var baseObjEnabled;
	var objRate;
	var bigObjRate;
	var variationRate;

	var posEventMap = [];
	var tilesetFlags;
	var tileset;

	var procTiming = null;
	MapDecorator.procGroupId = 1;


	//=============================================================================
	// Utiles
	//=============================================================================
	function setupEnvVariables(dataMap) {
		data = dataMap.data;
		width = dataMap.width;
		height = dataMap.height;
		zLayerSize = width * height;
		zAcc = 1 * zLayerSize;
		zObj1 = 2 * zLayerSize;
		zObj2 = 3 * zLayerSize;
		zShadow = 4 * zLayerSize;
		zRegion = 5 * zLayerSize;

		//acc setting params
		baseObjEnabled = false;
		objRate = 1;
		bigObjRate = 1;
		variationRate = 1;


		//posEventMap
		posEventMap.length = 0;
		TRP_CORE.packValues(posEventMap, zLayerSize, 0);
		dataMap.events.forEach(event => {
			if (!event) return;
			if (event.pages[0].image.characterName === '$EventInfo') return;

			DataManager.extractMetadata(event);
			posEventMap[event.x + event.y * width] = event;
		});

		//tileset
		tilesetFlags = $dataTilesets[dataMap.tilesetId].flags;


		ENV_VARS = {
			data, width, height, zLayerSize, zAcc, zObj1, zObj2, zShadow, zRegion,
			baseObjEnabled, posEventMap
		};
		MapDecorator.TEMPLATE_ANALYZER_ENV_VARS = ENV_VARS;
	};

	var baseTileId = MapDecorator.baseTileId;
	function anyTileId(idx) {
		return MapDecorator.anyTileId(idx, ENV_VARS);
	};
	function layeredTileIds(idx) {
		return MapDecorator.layeredTileIds(idx, ENV_VARS);
	};






	//=============================================================================
	// Start Analyze
	//=============================================================================
	MapDecorator._templateMapId = 0;
	MapDecorator.TEMPLATE_ANALYZER_ENV_VARS = null;
	MapDecorator.analyzeTemplate = function (mapId) {
		var commonInfo = null;
		if (commonMapId && commonMapId !== mapId) {
			commonInfo = this.analyzeTemplate(commonMapId);
		}

		this._templateMapId = mapId;
		this.prepareInfoCharacterTypes();

		var filePath = TRP_CORE.mapFilePath(mapId);
		var file = _Dev.readFile(filePath);
		var dataMap = JSON.parse(file);

		setupEnvVariables(dataMap);


		procTiming = 'afterSupply';
		MapDecorator.processList = {};
		MapDecorator.processList[procTiming] = [];


		var info = this._analyzeTemplate();
		MapDecorator.analyzeInfo = info;


		//register common palette info
		if (commonInfo) {
			if (commonInfo.objIds) {
				if (info.objIds) {
					info.objIds = commonInfo.objIds.concat(info.objIds);
				} else {
					info.objIds = commonInfo.objIds;
				}
			}
			if (commonInfo.bigObjIds) {
				if (info.bigObjIds) {
					info.bigObjIds = commonInfo.bigObjIds.concat(info.bigObjIds);
				} else {
					info.bigObjIds = commonInfo.bigObjIds;
				}
			}
		}



		//release env vars
		posEventMap.length = 0;
		MapDecorator.TEMPLATE_ANALYZER_ENV_VARS = ENV_VARS = null;

		return info;
	};



	//=============================================================================
	// MapObject
	//=============================================================================
	MapDecorator.mapObjectTemplate = [null];
	MapDecorator.registerMapObjectTemplate = function (event) {
		var tag = this.mapObjectTemplate.length;
		var template = MapObject.makeTemplateWithEvent(tag, event);
		this.mapObjectTemplate.push(template);
		return template;
	};

	MapDecorator.registerMapObjectTemplateWithMapObject = function (obj) {
		var tag = this.mapObjectTemplate.length;
		obj.tag = tag;

		var template = obj.makeTemplate(tag);
		this.mapObjectTemplate.push(template);
		return template;
	};




	//=============================================================================
	// Analyze
	//=============================================================================
	MapDecorator._analyzeTemplate = function () {
		var allInfo = [];

		var x = 0;
		var type = 'baseFloor';
		var info = this.makeBaseFloorInfo(x);
		allInfo.push(info);

		for (; x < width; x = (x + 1) | 0) {
			var tileId = anyTileId(x);
			var nextType = this.tileSettingType(x);
			if (nextType) {
				if (nextType === 'return') {
					break;
				} else if (nextType === 'processGroup') {
					procTiming = 'group:' + (MapDecorator.procGroupId++);
					MapDecorator.processList[procTiming] = MapDecorator.processList[procTiming] || [];
					x = nextEmptyX(x, true);
					continue;
				}

				this.setupTileTypeSettings(x, nextType);
				type = nextType;

				if (x > 0 && type === 'baseFloor') {
					//setup base info
					setupSeparateLocateObjAccIds(info)

					info = this.makeBaseFloorInfo(x);
					allInfo.push(info);
				}
			}

			if (!tileId
				// && !(posEventMap[x]&&!this.infoCharacterType(x))
				&& !(posEventMap[x] && !nextType)
			) {
				continue;
			}

			if (!type) {
				// _Dev.showText('tileTypeErr','タイルタイプが不明です。<x:'+x,',y:0>','red');
				// SoundManager.playBuzzer();
				// debugger;
			} else {
				x = this.processTemplateTiles(info, x, type);
				if (isNaN(x)) {
					_Dev.throwError('processTemplateTilesの返り値が不正. 返り値:<x>の終わり値. ret=' + x);
				}
				type = null;

				x = nextEmptyX(x, true);
				x -= 1;
			}
		}
		setupSeparateLocateObjAccIds(info);

		return allInfo;
	};


	MapDecorator.makeBaseFloorInfo = function (x) {
		var setting = {};
		var event = posEventMap[x];
		if (event) {
			var list = event.pages[0].list;
			var index = 0;
			var command = null;
			var validKeys = null;
			this.tryOverwriteSettingsWithList(
				list, index, command, validKeys, setting
			);
		}

		return {
			setting,
			keys: Object.keys(setting),

			floorBaseId: 0,
			floorVariationIds: null,
			floorFixVariationIds: null,
			allObjIds: [],
			objIds: null,
			bigObjIds: null,

			ceilingBaseId: 0,
			wallTileIds: null,

			criffTopBaseId: 0,
			criffWallBaseId: 0,
			criffTopSubId: 0,

			waterBaseId: 0,
			waterAccIds: null,
			waterBigObjIds: null,

			//acc seeting
			accSettings: {},
			separateLocateObjAccIds: [],
		};
	};

	function setupSeparateLocateObjAccIds(info) {
		var accIds = Object.keys(info.accSettings);
		var objIds = info.objIds;
		var bigObjIds = info.bigObjIds;
		for (const accId of accIds) {
			var accInfo = info.accSettings[accId];
			if (accInfo.objRate !== 1
				|| accInfo.bigObjRate !== 1
				|| !accInfo.objIds.equals(objIds)
				|| !accInfo.bigObjIds.equals(bigObjIds)
			) {
				info.separateLocateObjAccIds.push(Number(accId));
			}
		}
	};


	function nextNotEmptyXWithCheckTypeChange(x, allowCurrent = false, allowBigObjEmptyTile = false) {
		var prevEmpty = allowCurrent;
		var idx = 0;
		for (; x < width; x = (x + 1) | 0) {
			if ((idx++) && MapDecorator.tileSettingType(x)) {
				return -1;
			}

			var tileId = anyTileId(x);
			if (tileId) {
				if (prevEmpty) return x;
			} else if (allowBigObjEmptyTile && isBigObjEmptyTile(x, 0)) {
				if (prevEmpty) return x;
			} else if (posEventMap[x]) {
				if (prevEmpty) return x;
			} else {
				prevEmpty = true;
			}
		}
		return width;
	};
	function nextEmptyX(x, allowCurrent = false) {
		var prevExists = allowCurrent;
		var idx = 0;
		for (; x < width; x = (x + 1) | 0) {
			var tileId = anyTileId(x);
			if (!tileId) {
				if (prevExists) return x;

			} else {
				prevExists = true;
			}
		}
		return width;
	};


	function nextNotEmptyY(x, y, allowCurrent = false, allowBigObjEmptyTile = false) {
		var prevEmpty = allowCurrent;
		for (; y < height; y = (y + 1) | 0) {
			var tileId = anyTileId(x + y * width);
			if (tileId) {
				if (prevEmpty) return y;
			} else if (allowBigObjEmptyTile && isBigObjEmptyTile(x, y)) {
				if (prevEmpty) return y;
			} else if (posEventMap[x + y * width]) {
				if (prevEmpty) return y;
			} else {
				prevEmpty = true;
			}
		}
		return height;
	};

	/* setupTileTypeSettings
	===================================*/
	MapDecorator.setupTileTypeSettings = function (x, nextType) {
		baseObjEnabled = true;
		objRate = 1;
		bigObjRate = 1;
		variationRate = 1;


		for (var y = 1; y < height - 1; y = (y + 1) | 0) {
			var value = data[zRegion + x + (y + 1) * width];

			switch (this.infoCharacterType(x, y)) {
				case 'baseObjEnabled':
					baseObjEnabled = true;
					break;
				case 'baseObjDisabled':
					baseObjEnabled = false;
					break;
				case 'objRate':
					objRate = value / 100;
					break;
				case 'bigObjRate':
					bigObjRate = value / 100;
					break;
				case 'variationRate':
					variationRate = value / 100;
					break;

				default:
			}
		}

		ENV_VARS.baseObjEnabled = baseObjEnabled;
	};


	/* template type with event
	===================================*/
	MapDecorator.tileSettingType = function (x, infoType = this.infoCharacterType(x, 0)) {
		if (!infoType) return null;

		switch (infoType) {
			case 'tileTypeBase':
				return 'baseFloor';
			case 'tileTypeWater':
				return 'water';
			case 'tileTypeAccessory':
				return 'accessory';
			case 'wall':
				return 'wall';
			case 'criff':
				return 'criff';
			case 'objPalette':
				return 'objPalette';

			case 'variation':
				return 'variation';
			case 'variationOneSize':
				return 'variationOneSize';

			case 'processGroup':
				return 'processGroup';


			case 'return':
				return 'return';

			default:
				return null;
		}
	};



	/* process
	===================================*/
	MapDecorator.processTemplateTiles = function (info, x, type) {
		var analyzer = this.Analyzers[type];
		if (!analyzer) {
			SoundManager.playBuzzer();
			_Dev.throwError('不正なタイルタイプ:' + type + '<x:' + x + ',y:0>');
		}

		return analyzer.call(this.Analyzers, info, x);
	};

	var Analyzers = MapDecorator.Analyzers = {};





	//=============================================================================
	// type:baseFloor
	//=============================================================================
	Analyzers.baseFloor = (info, x, type) => {
		var floorBaseId = baseTileId(data[x]);
		var floorVariationIds = weightedBaseTileIdsInSequence(x, 1);
		var floorFixVariationIds = [];
		for (var i = floorVariationIds.length - 1; i >= 0; i = (i - 1) | 0) {
			var id = floorVariationIds[i];
			if (!Tilemap.isAutotile(id)) {
				floorVariationIds.splice(i, 1);
				floorFixVariationIds.push(id);
			}
		}

		info.floorBaseId = floorBaseId;
		info.floorVariationIds = floorVariationIds;
		info.floorFixVariationIds = floorFixVariationIds;

		var nx = nextNotEmptyXWithCheckTypeChange(x);
		if (nx < 0 || nx >= width) return x;
		x = nx;
		info.objIds = weightedLayeredTileIdsInSequence(x, 0);
		tryRegisterObjIdsToAllObjIds(info, info.objIds);


		//bigObj
		while (true) {
			var nx = nextNotEmptyXWithCheckTypeChange(x);
			if (nx < 0 || nx >= width) break;
			x = nx;

			var bigObjIds = weightedBigObjLayeredTileIds(x, 0);
			if (info.bigObjIds) info.bigObjIds = info.bigObjIds.concat(bigObjIds);
			else info.bigObjIds = bigObjIds;
		}
		tryRegisterObjIdsToAllObjIds(info, info.bigObjIds);

		return x;
	};

	function tryRegisterObjIdsToAllObjIds(info, objIds, allObjIds = info.allObjIds) {
		if (!objIds) return;
		var data;
		for (const ids of objIds) {
			var isMapObj = false;

			if (Array.isArray(ids)) {
				if (Array.isArray(ids[0])) {
					//bigObj
					data = ids[0];
				} else if (MapObject && ids[0] instanceof MapObject) {
					//mapObj
					data = ids[0];
					isMapObj = true;
				} else {
					data = ids;
				}
			} else {
				//obj
				isMapObj = true;
				data = ids;
			}

			var found = false;
			for (const child of allObjIds) {
				if (isMapObj) {
					if (data === child) {
						found = true;
						break;
					}
				} else {
					if (data.equals(child)) {
						found = true;
						break;
					}
				}
			}
			if (found) continue;

			allObjIds.push(data);
		}
	};

	function weightedBaseTileIdsInSequence(x, y, layer = -1) {
		var ids = [];
		for (; y < height; y = (y + 1) | 0) {
			var idx = x + y * width;

			var tileId = layer >= 0 ? data[idx + layer * zLayerSize] : anyTileId(idx);
			if (!tileId) break;

			tileId = baseTileId(tileId);

			var num = data[idx + zRegion] || 1;
			for (; num > 0; num = (num - 1) | 0) {
				ids.push(tileId);
			}
		}
		return ids;
	};

	function weightedLayeredTileIdsInSequence(x, y) {
		var ids = [];
		for (; y < height; y = (y + 1) | 0) {
			var idx = x + y * width;

			var obj = layeredTileIds(idx);
			if (!obj) {
				var event = posEventMap[idx];
				if (!event) break;

				if (MapObject && MapObject.metaParam(event)) {
					var template = MapDecorator.registerMapObjectTemplate(event);
					obj = MapObject.objectFromTemplateData(template);
				}
			}
			if (!obj) continue;

			var num = data[idx + zRegion] || 1;
			for (; num > 0; num = (num - 1) | 0) {
				ids.push(obj);
			}
		}
		return ids;
	};

	function weightedBigObjLayeredTileIds(x, y) {
		var ids = [];

		var allowBigObjEmptyTile = true;
		for (; y < height; y = nextNotEmptyY(x, y, false, allowBigObjEmptyTile)) {
			var baseIdx = x + y * width;
			var num = data[baseIdx + zRegion] || 1;

			var objData, onFloorFlagData;
			var event = posEventMap[baseIdx];
			var isMapObject = false;
			if (event && MapObject && MapObject.metaParam(event)) {
				isMapObject = true;
				var template = MapDecorator.registerMapObjectTemplate(event);
				objData = MapObject.objectFromTemplateData(template);
				onFloorFlagData = MapObject.onFloorFlagData(event);
			} else {
				objData = [];
				onFloorFlagData = [];
			}

			if (!isMapObject) {
				for (var dx = 0; x + dx < width; dx = (dx + 1) | 0) {
					var idx = baseIdx + dx;
					var tileIds = layeredTileIds(idx);
					if (!tileIds) {
						if (isBigObjEmptyTile(x + dx, y)) {
							//emptyEvent
						} else {
							break;
						}
					}

					var col = [];
					objData.push(col);
					var onFloorFlagsCol = [];
					onFloorFlagData.push(onFloorFlagsCol)

					for (var dy = 0; y + dy < height; dy = (dy + 1) | 0) {
						var idx = baseIdx + dx + dy * width;
						var tileIds = layeredTileIds(idx);
						if (!tileIds && !isBigObjEmptyTile(x + dx, y + dy)) break;

						col.push(tileIds);

						var onFloor = 0
						if (MapDecorator.infoCharacterTypeWithIdx(idx) === 'objUnderLocateEnabled') {
							onFloor = 0;
						} else if (tileIds) {
							for (const tileId of tileIds) {
								if (tileId && !isHigherTile(tileId)) {
									onFloor = 1;
									break;
								}
							}
						}
						onFloorFlagsCol.push(onFloor);
					}
				}
			}

			if (!objData || objData.length === 0) continue;

			for (var ni = num - 1; ni >= 0; ni = (ni - 1) | 0) {
				ids.push([objData, onFloorFlagData]);
			}
		}

		return ids;
	};
	function isHigherTile(tileId) {
		return tilesetFlags[tileId] & 0x10;
	}

	if (MapObject) {
		MapObject.onFloorFlagData = function (event) {
			//[col][row]
			var flags = [];

			var w = Number(event.meta.w) || 1;
			var h = Number(event.meta.h) || 1;
			var priority = event.pages[0].priorityType;
			var baseTileId = event.pages[0].image.tileId;

			for (var x = 0; x < w; x = (x + 1) | 0) {
				var col = [];
				flags.push(col);
				for (var y = 0; y < h; y = (y + 1) | 0) {
					if (priority === 0) {
						col.push(1);
					} else if (priority >= 2) {
						col.push(0);
					} else if (baseTileId) {
						var tileId = MapObject.tileIdInImage(baseTileId, x, y);
						col.push(isHigherTile(tileId) ? 0 : 1);
					} else {
						col.push(1);
					}
				}
			}
			return flags;
		};
	}



	//=============================================================================
	// type:wall
	//=============================================================================
	Analyzers.wall = (info, x, type) => {
		var idx = x;
		var tileId = baseTileId(data[idx]);
		if (Tilemap.isWallTopTile(tileId)) {
			info.ceilingBaseId = tileId;
			idx += width;
			tileId = baseTileId(data[idx]);
		}

		if (tileId) {
			info.wallTileIds = [];
			while (tileId && idx < zLayerSize) {
				info.wallTileIds.push(tileId);

				idx += width;
				tileId = baseTileId(data[idx]);
			}
		}

		return x;
	};



	//=============================================================================
	// type:criff
	//=============================================================================
	Analyzers.criff = (info, x, type) => {
		var idx = x;
		var tileId = baseTileId(data[idx]);
		if (Tilemap.isWallTopTile(tileId)) {
			info.criffTopBaseId = tileId;
		}

		idx += width;
		tileId = baseTileId(data[idx]);
		if (Tilemap.isWallSideTile(tileId)) {
			info.criffWallBaseId = tileId;
		}

		idx += width
		tileId = baseTileId(data[idx]);
		if (Tilemap.isWallTopTile(tileId)) {
			info.criffTopSubId = tileId;
		}


		return x;
	};





	//=============================================================================
	// type:water
	//=============================================================================
	Analyzers.water = (info, x, type) => {
		var waterBaseId = baseTileId(data[x + zAcc] || data[x]);
		var accLayer = 1;
		var waterAccIds = weightedBaseTileIdsInSequence(x, 1, accLayer);

		info.waterBaseId = waterBaseId;
		info.waterAccIds = waterAccIds;

		var nx = nextNotEmptyXWithCheckTypeChange(x);
		if (nx < 0 || nx >= width) return x;
		x = nx;

		var objIds = weightedLayeredTileIdsInSequence(x, 0);
		info.waterObjIds = objIds;
		tryRegisterObjIdsToAllObjIds(info, info.waterObjIds);


		//bigObj
		while (true) {
			var nx = nextNotEmptyXWithCheckTypeChange(x);
			if (nx < 0 || nx >= width) break;
			x = nx;

			var bigObjIds = weightedBigObjLayeredTileIds(x, 0);
			if (info.waterBigObjIds) info.waterBigObjIds = info.waterBigObjIds.concat(bigObjIds);
			else info.waterBigObjIds = bigObjIds;
		}
		tryRegisterObjIdsToAllObjIds(info, info.waterBigObjIds);

		return x;
	};





	//=============================================================================
	// type:accessory
	//=============================================================================
	Analyzers.accessory = (info, x, type) => {
		var baseId = baseTileId(data[x]) || baseTileId(data[x + zAcc]);

		var y = 1;
		if (data[x + y * width]) {
			_Dev.throwError('装飾タイル設定の１列目は「装飾タイル」「１マス空き」「縁バリエーション」の順です。<x=%1>'.format(x));
		}
		y += 1;

		var variationIds = analyzeFloorAccVariationIds(x, y, baseId);
		if (!variationIds) {
			variationRate = 0;
		}


		var accInfo = info.accSettings[baseId] = {
			baseId: baseId,
			variationIds,
			variationRate,

			objRate,
			bigObjRate,
			objIds: [],
			bigObjIds: [],
		};


		if (baseObjEnabled) {
			if (info.objIds) {
				accInfo.objIds = info.objIds.concat();
			}
			if (info.bigObjIds) {
				accInfo.bigObjIds = info.bigObjIds.concat();
			}
		}


		var nx = nextNotEmptyXWithCheckTypeChange(x);
		if (nx < 0 || nx >= width) return x;
		x = nx;
		var objIds = weightedLayeredTileIdsInSequence(x, 0);
		if (objIds) {
			if (accInfo.objIds) accInfo.objIds = accInfo.objIds.concat(objIds);
			else accInfo.objIds = objIds;
		}
		tryRegisterObjIdsToAllObjIds(info, accInfo.objIds);


		//bigObj
		while (true) {
			var nx = nextNotEmptyXWithCheckTypeChange(x);
			if (nx < 0 || nx >= width) break;
			x = nx;

			var bigObjIds = weightedBigObjLayeredTileIds(x, 0);
			if (accInfo.bigObjIds) accInfo.bigObjIds = accInfo.bigObjIds.concat(bigObjIds);
			else accInfo.bigObjIds = bigObjIds;
		}
		tryRegisterObjIdsToAllObjIds(info, accInfo.bigObjIds);

		return x;
	};


	function analyzeFloorAccVariationIds(x, y, baseId) {
		var ids = {};
		var variationExists = false;
		var shapes = [
			//rect
			[34, 20, 36],
			[16, 0, 24],
			[40, 28, 38],

			//cross
			[-1, 42, -1],
			[43, 15, 45],
			[-1, 44, -1],
		];

		var rows = shapes.length;
		for (var r = 0; r < rows; r = (r + 1) | 0) {
			var ty = y + r;
			var row = shapes[r];
			var cols = row.length;
			for (var c = 0; c < cols; c = (c + 1) | 0) {
				var shape = row[c];
				if (shape < 0) continue;

				var tx = x + c;
				var tileId = anyTileId(tx + ty * width);
				if (tileId && baseTileId(tileId) !== baseId) {
					ids[shape] = tileId;

					if (c <= 1) {
						variationExists = true;

						//c===2 -> in case obj ids
					}
				}
			}
		}

		return variationExists ? ids : null;
	};





	//=============================================================================
	// type:objPalette
	//=============================================================================
	MapDecorator.paletteObjects = [];
	Analyzers.objPalette = (info, x, type) => {
		var objIds = weightedLayeredTileIdsInSequence(x, 0);
		tryRegisterObjIdsToAllObjIds(info, objIds);
		tryRegisterObjIdsToAllObjIds(null, objIds, MapDecorator.paletteObjects);


		//bigObj
		var bigObjIds = [];
		while (true) {
			var nx = nextNotEmptyXWithCheckTypeChange(x);
			if (nx < 0 || nx >= width) break;
			x = nx;

			bigObjIds = bigObjIds.concat(
				weightedBigObjLayeredTileIds(x, 0)
			);
		}
		tryRegisterObjIdsToAllObjIds(info, bigObjIds);
		tryRegisterObjIdsToAllObjIds(null, bigObjIds, MapDecorator.paletteObjects);


		return x;
	};



	//=============================================================================
	// type:variation
	//=============================================================================
	Analyzers.variation = function (info, x, type) {
		var list = MapDecorator.processList[procTiming];
		var allowBigObjEmptyTile = true;
		while (true) {
			var y = 0;

			var tileIds = this.bigObjLayeredTileIdsWithFlags(x, y);
			if (!tileIds || tileIds.length === 0) break;

			var rate = (data[zRegion + x] / 100) || 1;
			y = nextNotEmptyY(x, 0, false, allowBigObjEmptyTile);

			var candidates = this.sequenceBigObjLayeredTileIdsWithFlags(x, y);
			if (candidates && candidates.length > 0) {
				var proc = this.replaceProcessData(tileIds, candidates, rate, x);
				list.push(proc);
			}

			x += tileIds.length;

			var nx = nextNotEmptyXWithCheckTypeChange(x, false);
			if (nx < 0 || nx >= width) break;
			x = nx;
		}

		return x;
	};


	var PROCESS_TYPES = MapDecorator.PROCESS_TYPES;
	var PROCESS_FLAGS = MapDecorator.PROCESS_FLAGS;

	MapDecorator.SUPPLY_BACK_TILE_ID = -1;
	MapDecorator.SHADOW_ID_BEGIN = -10;
	MapDecorator.SHADOW_ID_END = -25;
	MapDecorator.REGION_ID_BEGIN = -30;
	MapDecorator.REGION_ID_END = -30 - 255;
	Analyzers.layeredTileIdsWithFlags = function (idx) {
		var tileIds = layeredTileIds(idx);
		var flags = null;

		//shadow
		if (data[idx + zShadow]) {
			tileIds = tileIds || [];
			tileIds.push(
				(MapDecorator.SHADOW_ID_BEGIN - data[idx + zShadow])
					.clamp(MapDecorator.SHADOW_ID_END, MapDecorator.SHADOW_ID_BEGIN)
			);
		}

		var event = posEventMap[idx];
		if (event) {
			var infoType = MapDecorator.infoCharacterTypeWithEvent(event);
			var nextType = MapDecorator.tileSettingType(-1, infoType);
			if (nextType) return null;


			var meta = event.meta;
			var type = MapDecorator.infoCharacterTypeWithEvent(event);

			//regionId
			if (meta.region || meta.regionId) {
				tileIds = tileIds || [];
				tileIds.push(
					(MapDecorator.REGION_ID_BEGIN - Number(meta.region || meta.regionId || 0))
						.clamp(MapDecorator.REGION_ID_END, MapDecorator.REGION_ID_BEGIN)
				);
			}

			//suplyBack
			if (type === 'supplyBack' || meta.supplyBack) {
				tileIds = tileIds || [];
				tileIds.unshift(MapDecorator.SUPPLY_BACK_TILE_ID);
			}

			//condition:Not
			if (type === 'condNot' || meta.not) {
				flags = flags || [];
				flags.push(PROCESS_FLAGS.condNot);
			}

			//noShape
			if (meta.noShape || type === 'noShape' || type === 'noShape2') {
				flags = flags || [];
				flags.push(PROCESS_FLAGS.noShape);
			}

			//noErase
			if (meta.noErase || type === 'noErase') {
				flags = flags || [];
				flags.push(PROCESS_FLAGS.noErase);
			}

			//noShadow
			if (meta.noShadow) {
				tileIds = tileIds || [];
				tileIds.push(MapDecorator.SHADOW_ID_BEGIN);
			}
		}

		if (flags) {
			tileIds = tileIds || [];
			tileIds.push(flags);
		}

		if (!tileIds || !tileIds.length) return null;
		return tileIds;
	};
	Analyzers.sequenceBigObjLayeredTileIdsWithFlags = function (x, y) {
		var ids = [];
		var allowBigObjEmptyTile = true;
		for (; y < height; y = nextNotEmptyY(x, y, false, allowBigObjEmptyTile)) {
			var baseIdx = x + y * width;
			var objData = this.bigObjLayeredTileIdsWithFlags(x, y);
			if (!objData || objData.length === 0) continue;

			var num = data[baseIdx + zRegion] || 1;
			for (var ni = num - 1; ni >= 0; ni = (ni - 1) | 0) {
				ids.push(objData);
			}
		}
		return ids;
	};

	Analyzers.bigObjLayeredTileIdsWithFlags = function (x, y) {
		var baseIdx = x + y * width;


		var event = posEventMap[baseIdx];
		if (event) {
			if (MapObject && MapObject.metaParam(event)) {
				var template = MapDecorator.registerMapObjectTemplate(event);
				return MapObject.objectFromTemplateData(template);
			}
		}

		var objData = [];
		for (var dx = 0; x + dx < width; dx = (dx + 1) | 0) {
			var idx = baseIdx + dx;

			var event = posEventMap[idx];
			if (event) {
				var infoType = MapDecorator.infoCharacterTypeWithEvent(event);
				var nextType = MapDecorator.tileSettingType(-1, infoType);
				if (nextType) {
					break;
				}
			}

			var tileIds = this.layeredTileIdsWithFlags(idx);
			if (!tileIds && !event) {
				break;
			}

			var col = [];
			objData.push(col);
			for (var dy = 0; y + dy < height; dy = (dy + 1) | 0) {
				var idx = baseIdx + dx + dy * width;
				var tileIds = this.layeredTileIdsWithFlags(idx);
				if (!tileIds && !isBigObjEmptyTile(x + dx, y + dy)) break;

				col.push(tileIds);
			}
		}
		return objData;
	};

	//=============================================================================
	// type:variationOneSize
	//=============================================================================
	Analyzers.variationOneSize = function (info, x, type) {
		//bigObj
		var list = MapDecorator.processList[procTiming];

		while (true) {
			var tileIds = this.layeredTileIdsWithFlags(x);
			if (!tileIds) break;
			var rate = (data[zRegion + x] / 100) || 1;

			var candidates = [];
			for (var y = 2; y < height; y = (y + 1) | 0) {
				var dstTileIds = this.layeredTileIdsWithFlags(x + y * width);
				if (!dstTileIds) break;

				var num = data[zRegion + x + y * width] || 1;
				for (var i = 0; i < num; i = (i + 1) | 0) {
					candidates.push(dstTileIds);
				}
			}
			if (candidates.length) {
				var proc = this.replaceProcessData(tileIds, candidates, rate, x);
				list.push(proc);
			}

			var nx = nextNotEmptyXWithCheckTypeChange(x + 1, true);
			if (nx < 0 || nx >= width) break;
			x = nx;
		}

		return x;
	};


	Analyzers.replaceProcessData = function (tileIds, candidates, rate = 1.0, x = -1) {
		return {
			type: PROCESS_TYPES.replace,
			tileIds,
			candidates,
			rate,
			sx: x,//srcX for dev
		};
	};








})();