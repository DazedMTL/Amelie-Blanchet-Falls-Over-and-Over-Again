//=============================================================================
// TRP_MapDecorator.js
//=============================================================================

// SETTING
// Plugin Command
// Start
// Mode / Update
// process ZMap
// processCriff
// Supply Walls
// Supply Ceilings
// supply BackTiles
// Supply Shadows
// Room Select


// MODE: PaintFloor
// MODE: LocateObject
// MODE: ManualPaint
// MODE: ManualLocate
// MODE: ObjectPalette
// MODE: UserProcess
// User Process

// MapObject
// Util Funcs
// Restore Map
// Auto Tile Connection
// ColorPicker


//============================================================================= 
/*:
 * @author Thirop
 * @target MZ
 * @plugindesc 自動装飾プラグイン<開発用>
 * @base TRP_CORE
 * @base TRP_MapDecorator_Template
 * @orderAfter TRP_CORE
 * @orderAfter TRP_MapObject
 *
 * @help
 * 【導入】
 * 以下のプラグインより下に配置
 * ・TRP_CORE.js<必須>
 * ・TRP_MapObject.js<オプション>
 *
 * 以下のプラグインより上に配置
 * ・TRP_MapDecorator_Template.js<必須>
 * 
 *
 * 【更新履歴】
 * 1.21 2023/01/15 修正:zMap確認後にモードが戻れない不具合修正
 * 1.20 2023/01/10 修正:水場ロック後の水場へのオブジェ抽選の不具合修正
 * 1.19 2023/01/10 修正:オブジェ配置済みマップを再編集後にオブジェが消える不具合修正
 * 1.15 2023/01/09 修正:オブジェドラッグ移動の不具合修正
 * 1.14 2022/12/25 拡張:オブジェクトパレット
 *                 修正:「全処理の取り消し」
 *                 修正:手動配置時の座標ズレ、ほか細かな不具合
 * 1.13 2022/12/19 修正:裏タイル補完時の影プロセスの不具合
 * 1.12 2022/12/11 拡張:指定部屋の編集、置換プロセスの手動実行
 * 1.11 2022/12/04 不具合修正:B-E天井タイル裏への水タイル塗布に関するバグ修正
 * 1.10 2022/12/04 拡張:置換処理拡張
 *                 設定「autoCeilingSupplyWithEmpty」追加
 *                 不具合修正:バリエーション置換関連
 * 1.09 2022/11/27 拡張:バリエーション置換
 * 1.08 2022/11/27 修正:オブジェロック後に手動編集可能に
 * 1.07 2022/11/14 拡張:オブジェクトパレット(要:TRP_CORE.js<ver1.07>)
 * 1.06 2022/11/14 拡張:オブジェクトの手動配置
 *                 修正:崖フチへの重ね装飾タイル配置許容
 * 1.05 2022/11/13 拡張:床装飾の手動調整モード追加
 * 1.01 2022/11/06 保存コマンドのガイド表示
 * 1.00 2022/11/05 初版
 *
 *
 * @command start
 * @text 開始
 * @desc 
 * 
 * @arg templateMapId
 * @text テンプレートマップID
 * @desc 使用するテンプレートマップID。(テンプレートマップ自身から実行時はタイル種別を確認可)
 * @type number
 * @default 0
 *
 * @arg disableAutoSupply
 * @text 壁・天井・崖の自動補完無効
 * @desc ONにすると開始時の壁・天井・崖の自動補完を無効
 * @type boolean
 * @default false
 *
 *
 *
 *
 * @param command
 * @text コマンド名(MV)
 * @desc MV形式プラグインコマンドのコマンド名
 * @default decorator
 * @type string
 *
 * @param roomSeparatorRegionId
 * @text 部屋区切りリージョンID
 * @desc 部屋区切りリージョンID
 * @default 1
 * @type number
 *
 * @param objForbiddenRegionId
 * @text オブジェ配置禁止リージョンID
 * @desc オブジェ配置禁止リージョンID
 * @default 2
 * @type number
 *
 *
 *
 *
 * 
 */
//============================================================================= 



var TRP_CORE = TRP_CORE || {};
function TRP_MapDecorator() {
	this.initialize.apply(this, arguments);
};

TRP_MapDecorator.INFO_CHARACTER_NAME = 'DecorationInfo';
TRP_MapDecorator.INFO_CHARACTER_Z_NAME = 'DecorationZ';
TRP_MapDecorator.INFO_CHARACTER_TYPES = {
	/* [characterIndex,direction,pattern]
	===================================*/
	//tile types
	tileTypeBase: [0, 4, 0],
	tileTypeAccessory: [0, 4, 1],
	tileTypeWater: [0, 4, 2],

	wall: [0, 6, 0],
	criff: [0, 6, 1],

	objPalette: [0, 8, 0],


	//obj setting
	baseObjEnabled: [1, 4, 0],
	baseObjDisabled: [1, 4, 1],
	bigObjEmptyTile: [1, 4, 2],

	objLocateOnEdgeEnabled: [1, 6, 0],
	objLocateOverEdgeEnabled: [1, 6, 1],
	objUnderLocateEnabled: [1, 6, 2],

	objRate: [1, 8, 0],
	bigObjRate: [1, 8, 1],


	//other settings
	variationRate: [2, 4, 0],
	return: [2, 8, 2],


	//process settings
	variation: [3, 4, 0],
	variationOneSize: [3, 4, 1],
	processGroup: [3, 4, 2],
	supplyBack: [3, 6, 0],
	condNot: [3, 6, 1],
	noShape: [3, 6, 2],
	noKinds: [3, 8, 1],


	//system
	mapObjectSave: [7, 4, 0],

};





//=============================================================================
// remove Info Character
//=============================================================================
(function () {
	'use strict';

	var MapDecorator = TRP_MapDecorator;

	var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
	Game_Map.prototype.setupEvents = function () {
		_Game_Map_setupEvents.call(this, ...arguments);

		var events = this._events;
		for (var i = events.length - 1; i >= 0; i = (i - 1) | 0) {
			var event = events[i];
			if (!event) continue;

			var charaName = event._characterName;
			if (!charaName) {
				var data = event.event();
				var page = data.pages ? data.pages[0] : null;
				var image = page ? page.image : null;
				charaName = image ? image.characterName : null;
			}
			if (charaName === MapDecorator.INFO_CHARACTER_NAME
				|| charaName === MapDecorator.INFO_CHARACTER_Z_NAME
			) {
				event.erase()
				events[i] = null;
			}
		}
	};

})();






//=============================================================================
// main scope
//=============================================================================
(function () {
	'use strict';

	if (!Utils.isNwjs() || !Utils.isOptionValid('test')) return;
	var pluginName = 'TRP_MapDecorator';
	var parameters = PluginManager.parameters(pluginName);


	var _Dev = TRP_CORE.DevFuncs;
	var MapDecorator = TRP_MapDecorator;
	var MapObject = TRP_CORE.MapObject || null;

	var isMZ = Utils.RPGMAKER_NAME === "MZ";
	var isMac = navigator.userAgent.contains('Macintosh');
	var ctrlKey = isMac ? 'Cmd' : 'Ctrl';

	var supplementDef = TRP_CORE.supplementDef;
	var supplementDefNum = TRP_CORE.supplementDefNum;


	//=============================================================================
	// SETTING
	//=============================================================================
	var SETTING = MapDecorator.SETTING = {

		// <<エディタ設定>>
		//===================================
		//編集時のマップ表示範囲[0以上の数値]
		//└2.0とすると2倍の範囲表示(拡大率50%)
		mapDispRange: 1,

		//編集時のウィンドウ幅。0=リサイズなし
		windowWidth: 1400,

		//編集時のウィンドウ高さ。0=リサイズなし
		windowHeight: 900,


		// <<プロセス設定>>
		//===================================
		//床の上マスに壁を自動配置[true/false]
		autoWallSupply: true,

		//壁の上マスに天井を自動配置[true/false]
		autoCeilingSupply: true,

		//空マスに天井タイル敷き詰め[true/false]
		autoCeilingSupplyWithEmpty: false,

		//天井設置に失敗しているかチェック[true/false]
		checkCeilingCorrect: true,

		//影を自動補完(解析したZ値マップから計算)
		autoShadowSupply: true,

		//1以上でビッグオブジェをできるだけ敷き詰めるように配置。処理が重いので徐々に大きくすること
		maximizeObjRateTryNum: 0,

		//割合算出の振れ幅[0.0~1.0]
		rateRange: 0.3,



		// <<マップ設定>>
		//===================================
		//壁なし（主に遠景を使うマップ）[true/false]
		noWall: false,

		//壁+崖の高さを揃える[true/false]
		arrangeTotalHeight: true,

		//空マスを天井とみなして接続[true/false]
		isEmptySpaceCeiling: false,

		//壁・がけに影を落とさない[true/false]
		noShadowOnWall: true,

		//崖フチのオブジェ配置禁止の辺の数[1~]
		criffTopObjForbiddenSideNum: 1,



		// <<ベース床設定>
		//===================================
		//床装飾を塗るベース割当[0~1.0]
		floorPaintRate: 0.4,

		//床装飾の１箇所の最小と最大タイル数[1~]
		floorPaintChankMin: 2,
		floorPaintChankMax: 10,

		//0以上で床装飾のパターン数を固定、-1で床の広さに応じて算出
		floorPaintPatternNum: -1,

		//１部屋内で使用する床装飾の種類数の設定
		// └設定例:[0,0,30,100,200]
		// └29マス以下:2種, 30マス以上:3種, 100マス以上:4種, 200マス以上:5種
		floorPaintPatternsWithTiles: [0, 0, 30, 100, 200],

		//オブジェクトの配置割合[0~1.0]
		floorObjRate: 0.175,
		floorBigObjRate: 0.0125,



		// <<水場設定>>
		//================================================
		//水場の配置モード[-1:自動,0:無効,1:強制配置]
		waterLocateMode: -1,

		//部屋に水場の配置する確率[0~1.0]
		waterLocateRate: 0.4,

		//床面積に対する水場のベース割合[0~1.0]
		waterPaintRate: 0.15,

		//水場１かたまりのタイル数の最小・最大[1~]
		waterChankMin: 8,
		waterChankMax: 18,

		//水場の装飾タイルを塗るベース割合[0~1.0]
		waterAccPaintRate: 0.2,

		//水場の装飾タイルの１かたまりのタイル数の最小・最大[1~]
		waterPaintChankMin: 2,
		waterPaintChankMax: 6,

		//水場のオブジェクトの配置割合[0~1.0]
		waterObjRate: 0.15,
		waterBigObjRate: 0.0125,

		//水場のフチにオブジェ配置許可[true/false]
		waterObjOnEdge: true,


		// <<その他タイル設定>>
		//===================================
		//崖フチ上部の裏にタイルを補填(MZデフォタイル用)[true/false]
		supplyUpperCriffTopBack: true,



	};
	//=============================================================================

	var DEFAULT_SETTING = MapDecorator.DEFAULT_SETTING = SETTING;
	var CURRENT_SETTING = MapDecorator.CURRENT_SETTING = SETTING;

	MapDecorator.overwriteSettings = function (setting, validKeys = null) {
		if (!setting) return;
		var keys = Object.keys(setting);
		for (const key of keys) {
			this.overwriteSetting(key, setting[key], validKeys);
		}
	};
	MapDecorator.overwriteSetting = function (key, value, validKeys = null, dstSetting = SETTING) {
		if (validKeys && !validKeys.contains(key)) {
			_Dev.showTempAlert('設定「%1」はこのコマンドでは無効です'.format(key));
			return;
		}
		if (dstSetting === SETTING && dstSetting[key] === undefined) {
			_Dev.showTempAlert('設定「%1」はスペルミスの可能性があります。'.format(key));
		}
		dstSetting[key] = value;
	};

	MapDecorator.tryOverwriteSettingsWithList = function (list, index = 0, command, validKeys, dstSetting) {
		if (!list) return;

		var length = list.length;
		var params = [];
		for (var i = index; i < length;) {
			var command = list[i];
			if (command.code === 105) {
				//scroll text
				while (list[++i].code === 405) {
					params.push(list[i].parameters[0]);
				}
			} else if (command.code === 355) {
				//script
				while (list[++i].code === 655) {
					params.push(list[i].parameters[0]);
				}
			} else {
				i++;
			}
		}

		for (var param of params) {
			if (param.indexOf('//') === 0) continue;
			var commentIdx = param.indexOf('//');
			if (commentIdx >= 0) {
				param = param.substring(0, commentIdx);
			}
			if (param.indexOf(':') < 0) continue;

			param = param.trim();
			if (!param) continue;

			if (param[param.length - 1] === ',') {
				param = param.substring(0, param.length - 1);
			}

			var elems = param.split(':');
			var key = elems[0];
			var value = elems[1];
			if (key === undefined || value === undefined) continue;

			key = key.trim();
			value = value.trim();
			if (!isNaN(value)) {
				value = Number(elems[1]);
			} else if (value === 'false') {
				value = false;
			} else if (value === 'true') {
				value = true;
			} else if (value[0] === '[' || value[0] === '{') {
				value = JSON.parse(value);
			}
			this.overwriteSetting(key, value, validKeys, dstSetting);
		}
	};





	//=============================================================================
	// Plugin Command
	//=============================================================================
	if (isMZ) {
		['start'].forEach(command => PluginManager.registerCommand(pluginName, command, function (args) {
			var argsArr = Object.values(args)
			argsArr.unshift(command);
			MapDecorator.pluginCommand(argsArr, this);
		}));
	}

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if (command === parameters.command) {
			MapDecorator.pluginCommand(args, this);
		} else {
			_Game_Interpreter_pluginCommand.call(this, ...arguments);
		}
	};

	MapDecorator.pluginCommand = function (args, interpreter) {
		var name = args[0];
		var command = "processCommand" + name[0].toUpperCase() + name.substring(1)
		this[command](args, interpreter);
	};

	MapDecorator.processCommandStart = function (args, interpreter) {
		var idx = 1;
		var templateMapId = Number(args[idx++]);
		var disableAutoSupply = TRP_CORE.supplementDefBool(false, args[idx++]);
		if (!templateMapId || !$dataMapInfos[templateMapId]) {
			SoundManager.playBuzzer();
			window.prompt('テンプレートマップIDが無効です。\ntemplateMapId:' + templateMapId);
			return;
		}


		if (interpreter) {
			this.tryOverwriteSettingsWithList(interpreter._list, interpreter._index, 'start');
		}
		DEFAULT_SETTING = MapDecorator.DEFAULT_SETTING = JsonEx.makeDeepCopy(SETTING);
		CURRENT_SETTING = MapDecorator.CURRENT_SETTING = JsonEx.makeDeepCopy(SETTING);


		MapDecorator.start(templateMapId, disableAutoSupply);
	};


	//=============================================================================
	// env variables
	//=============================================================================
	var allInfo = null;
	var info = null;

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

	var proc = null;
	var log = null;
	var originalData = null;

	var baseTileIds = null;
	var allFloorLevelTileIds = null;
	var criffTopIds = null;
	var ceilingBaseIds = null;
	var criffWallBaseIds = null;
	var allWallIds = null;
	var allCeilingIds = null;

	var tileW = 48;
	var tileH = 48;
	function setupEnvVariables(dataMap, allInfo) {
		data = dataMap.data;
		width = dataMap.width;
		height = dataMap.height;
		zLayerSize = width * height;
		zAcc = 1 * zLayerSize;
		zObj1 = 2 * zLayerSize;
		zObj2 = 3 * zLayerSize;
		zShadow = 4 * zLayerSize;
		zRegion = 5 * zLayerSize;
		ENV_VARS = {
			data, width, height, zLayerSize, zAcc, zObj1, zObj2, zShadow, zRegion
		};

		tileW = $gameMap.tileWidth();
		tileH = $gameMap.tileHeight();


		//allInfo cache
		ceilingBaseIds = [];
		allCeilingIds = [];
		criffWallBaseIds = [];
		baseTileIds = [];
		allFloorLevelTileIds = [];
		criffTopIds = [];
		allWallIds = [];
		for (const info of allInfo) {
			TRP_CORE.uniquePush(baseTileIds, info.floorBaseId);
			TRP_CORE.uniquePush(allFloorLevelTileIds, info.floorBaseId);

			if (info.floorVariationIds) {
				TRP_CORE.uniquePushArray(allFloorLevelTileIds, info.floorVariationIds);
			}
			if (info.waterBaseId) {
				TRP_CORE.uniquePush(allFloorLevelTileIds, info.waterBaseId);
			}
			if (info.waterAccIds) {
				TRP_CORE.uniquePushArray(allFloorLevelTileIds, info.waterAccIds);
			}

			if (info.criffTopBaseId) {
				criffTopIds.push(info.criffTopBaseId);
				TRP_CORE.uniquePush(allFloorLevelTileIds, info.criffTopBaseId);
			}
			if (info.criffTopSubId) {
				criffTopIds.push(info.criffTopSubId);
			}

			if (info.ceilingBaseId) {
				TRP_CORE.uniquePush(ceilingBaseIds, info.ceilingBaseId);
				TRP_CORE.uniquePush(allCeilingIds, info.ceilingBaseId);
			}
			if (info.criffWallBaseId) {
				TRP_CORE.uniquePush(criffWallBaseIds, info.criffWallBaseId);
			}
			if (info.wallTileIds) {
				TRP_CORE.uniquePushArray(allWallIds, info.wallTileIds);
			}
		}
	};

	var INFO_SETTINGS = {};
	MapDecorator.changeBaseInfo = function (target) {
		info = target;

		if (!INFO_SETTINGS[info.floorBaseId]) {
			var setting = JsonEx.makeDeepCopy(CURRENT_SETTING);
			INFO_SETTINGS[info.floorBaseId] = setting;

			SETTING = INFO_SETTINGS[info.floorBaseId];
			this.overwriteSettings(info.setting);
		} else {
			SETTING = INFO_SETTINGS[info.floorBaseId];
		}
	}



	//=============================================================================
	// Start
	//=============================================================================
	MapDecorator._mode = null;
	MapDecorator._lastModes = [];
	MapDecorator._playerMoveByInput = null;
	MapDecorator._sceneUpDate = null;
	MapDecorator._keyDownListener = null;
	MapDecorator._mouseDownListener = null;
	MapDecorator.allInfo = null;

	MapDecorator.start = function (templateMapId, disableAutoSupply = false) {
		this.setupScreen();

		if (MapObject && !MapObject.isOverlayEnabled()) {
			_Dev.showText('mapObjOverlayAlert', [
				'MapObjectのオーバーレイ表示が無効です。',
				'関連オブジェクトを正しく配置・保存できません。'
			], 'rgb(255,100,100)');
		}

		_Dev.showText('mapDec', [
			ctrlKey + '+S:マップ保存',
			'Esc:メニュー呼び出し',
		]);


		/* player setting
		===================================*/
		$gamePlayer._transparent = true;
		this._playerMoveByInput = $gamePlayer.moveByInput;
		$gamePlayer.moveByInput = (() => { });
		if ($gamePlayer._followers) {
			$gamePlayer._followers.update();
		}


		SceneManager._scene._spriteset.update();


		/* scene setting
		===================================*/
		this._sceneUpDate = SceneManager._scene.update;
		SceneManager._scene.update = () => {
			this.update();
		};


		/* register listners
		===================================*/
		this._keyDownListener = this.onKeyDown.bind(this);
		this._mouseDownListener = this.onMouseDown.bind(this);
		this._mouseUpListner = (() => {
			this.onDraggingLocateObj = null;
		});
		document.addEventListener('keydown', this._keyDownListener);
		document.addEventListener('mousedown', this._mouseDownListener);
		document.addEventListener('mouseup', this._mouseUpListner);


		/* disable interpreter command
		===================================*/
		Game_Interpreter.prototype.command105 = function () {
			return true;
		}



		/* prepare variables
		===================================*/
		allInfo = this.analyzeTemplate(templateMapId);
		this.allInfo = allInfo;
		this.setupProcessWindowCommands();

		setupEnvVariables($dataMap, allInfo);
		this._clearSceneFade();


		/* base analyze
		===================================*/
		this.initProc();
		this.analyzeAll();

		if (MapObject) {
			this.analyzeMapObjects();
		}


		/* supply tiles
		===================================*/
		this.executeBeforeProcess(disableAutoSupply);


		/* start room select
		===================================*/
		this.setMode('paintFloor');


		//check ceiling correct -> tonner error idxes
		if (SETTING.checkCeilingCorrect) {
			this.checkCeilingCorrect();
		}
	};


	MapDecorator.setupScreen = function () {
		var mapDispRange = Number(SETTING.mapDispRange) || 1.0
		var windowW = Number(SETTING.windowWidth);
		var windowH = Number(SETTING.windowHeight);
		if (!windowW || windowW <= 0) {
			windowW = Graphics.width;
		}
		if (!windowH || windowH <= 0) {
			windowH = Graphics.height;
		}


		SETTING.mapDispRange = mapDispRange;
		SETTING.windowWidth = windowW;
		SETTING.windowHeight = windowH;

		if (windowW !== Graphics.width || windowH !== Graphics.height) {
			_Dev.resizeWindow(windowW, windowH);
		}


		var rate = SETTING.mapDispRange;
		var zoom = 1 / rate;
		var sprset = SceneManager._scene._spriteset;
		var tilemap = sprset._tilemap;

		var width = rate * Graphics.width;
		var height = rate * Graphics.height;

		tilemap._width = width + tilemap._margin * 2;
		tilemap._height = height + tilemap._margin * 2;
		var tileCols = Math.ceil(tilemap._width / tilemap._tileWidth) + 1;
		var tileRows = Math.ceil(tilemap._height / tilemap._tileHeight) + 1;
		var layerWidth = tilemap._layerWidth = tileCols * tilemap._tileWidth;
		var layerHeight = tilemap._layerHeight = tileRows * tilemap._tileHeight;
		tilemap._needsRepaint = true;

		var container = new TRP_CORE.TRP_Container();
		container.addChild(SceneManager._scene._spriteset);
		container.scale.set(zoom, zoom);
		SceneManager._scene.addChild(container);


		if (MapObject) {
			$dataTrpMapObjects.forEach(obj => { obj.setupMargin() })
		}
	};



	MapDecorator.analyzeAll = function () {
		proc.idxBaseInfoIdxMap = TRP_CORE.packValues([], 0, zLayerSize);
		this.analyzeRooms();
		this.analyzeFloorZMap();
		this.analyzeWallIdxes();
		this.analyzeCeilingIdxes();
	};

	MapDecorator.proc = null;
	MapDecorator.initProc = function () {
		// _Dev.showText('roomInfo','《対象の部屋ID:--》');
		originalData = data.concat();

		proc = MapDecorator.proc = {};

		proc.allRoomIdxes = [];
		proc.roomIdxMapForUserProc = [];
		proc.allBaseIdxes = [];
		proc.idxBaseInfoIdxMap = [];
		proc.wallIdxMap = [];
		proc.wallIdxes = [];
		proc.ceilingIdxes = [];
		proc.zMap = [];
		proc.floorLevelZMap = [];
		proc.minZ = 0;
		proc.maxZ = 0;


		proc.waterIdxes = [];
		proc.waterAccIdxes = [];
		proc.passIdxes = [];
		proc.criffIdxes = [];
		proc.criffTopIdxes = [];
		proc.criffWallIdxes = [];

		proc.floorSuppliedIdxes = [];

		proc.oncePaintFloor = false;
		proc.lockedFloorPaintRoomIds = [];
		proc.lastFloorPaintInfoArr = [];
		proc.lockedFloorVariations = [];
		proc.lastFloorVariations = [];

		proc.lockedWaterRoomIds = [];
		proc.lastWaterInfoArr = [];


		proc.locateObj = false;
		proc.lockedObjRoomIds = [];
		proc.lastObjInfoArr = [];
		proc.objForbiddenIdxes = [];
	}


	MapDecorator.end = function () {
		this.setMode(null);
		_Dev.showText('roomInfo', null);
		_Dev.showText('mapDec', null);

		$gamePlayer._transparent = false;
		$gamePlayer.moveByInput = this._playerMoveByInput;
		this._playerMoveByInput = null;

		SceneManager._scene.update = this._sceneUpDate;
		this._sceneUpDate = null;

		document.removeEventListener('keydown', this._keyDownListener);
		document.removeEventListener('mousedown', this._mouseDownListener);
		this._keyDownListener = null;
		this._mouseDownListener = null;
	};

	MapDecorator._clearSceneFade = function () {
		var scene = SceneManager._scene;
		scene._fadeDuration = 0;
		scene._fadeOpacity = 0;
		if (scene.updateColorFilter) {
			scene.updateColorFilter();
		}
	};

	MapDecorator.setupProcessWindowCommands = function () {
		var groups = [];
		for (var i = 1; i < MapDecorator.procGroupId; i = (i + 1) | 0) {
			groups.push(['group:' + i, 'グループ:' + i]);
		}
		groups.push(['afterSupply', '自動']);


		var commands = [];
		for (const group of groups) {
			commands.push({
				name: '置換プロセス:' + group[1],
				type: 'script',
				param: "TRP_MapDecorator.startUserProcessMode('%1',true)".format(group[0])
				, key: '',
				closeWindow: true,
			});
			commands.push({
				name: '└抽選モード',
				type: 'script',
				param: "TRP_MapDecorator.startUserProcessMode('%1')".format(group[0])
				, key: '',
				closeWindow: true,
			});
		}

		_Dev.registerToolCommands({
			key: '',
			id: 'decorator:processList',
			name: 'プロセスリスト',
			commands,
		});
	};


	MapDecorator.executeBeforeProcess = function (disableAutoSupply) {
		if (!disableAutoSupply) {
			this.processMapCriff()

			if (SETTING.autoWallSupply) {
				this.supplyWalls();
			}
			if (SETTING.autoCeilingSupply) {
				this.supplyCeilings();
			}
			if (SETTING.autoShadowSupply) {
				this.supplyShadows();
			}
			this.processUserProcessList('afterSupply');
		}

		originalData = data.concat();
		this.requestRefreshTilemap();
	};







	//=============================================================================
	// Mode / Update
	//=============================================================================
	MapDecorator.MODE_GUIDE = {};
	MapDecorator.setMode = function (mode) {
		if (this._mode === mode) return;

		this.tryReleaseTonnerSprite();
		this.clearManualPaintInfo();
		this.clearManualLocateInfo();
		this.clearObjectPalette();
		this.clearUserProcessParams();
		this.cantShowMenu = false;

		if (mode === 'paintFloor' || mode === 'locateObject') {
			this._lastModes.length = 0;
		}
		if (![null, 'zMap', 'zMapError', 'wallIdx', 'mapObjectCollision', 'objectPalette', 'userProcess', 'roomSelect'].contains(this._mode)) {
			this._lastModes.push(this._mode);
		}
		this._mode = mode;

		var guide = MapDecorator.MODE_GUIDE[mode] || null;
		_Dev.showText('modeGuide', guide);
	};
	MapDecorator.restoreMode = function () {
		var mode = this._lastModes.pop();
		if (!mode) return;

		this._mode = null;
		this.setMode(mode);
	};

	MapDecorator.onKeyDown = function (event) {
		if (_Dev.showingToolsWindow) return false;
		if (this._pickingColor) {
			return this.onKeyDownPickingColor(event);
		}

		if (event.metaKey || event.ctrlKey) {
			if (event.key === 's') {
				if (this.isSaveEnabled()) {
					this.processSave();
				} else {
					SoundManager.playBuzzer();
				}
				return true;
			}
		}


		var command = this._mode ? "onKeyDown" + TRP_CORE.capitalize(this._mode) : null;
		if (command && this[command]) {
			this[command](event);
			return true;
		}
	};

	MapDecorator.isSaveEnabled = function () {
		switch (this._mode) {
			case 'roomSelect':
				return false;
			default:
				return true;
		}
	};


	MapDecorator.processSave = function () {
		//save mapObject
		if (MapObject) {
			this.saveMapObjectData();
		}
		_Dev.saveMapFile();
	};
	MapDecorator.restoreFromBackup = function () {
		_Dev.restoreFromBackup();
	}


	MapDecorator.onMouseDown = function (event) {
		if (_Dev.showingToolsWindow) return;
		if (this._pickingColor) return;

		var tx = Graphics.pageToCanvasX(event.pageX);
		var ty = Graphics.pageToCanvasY(event.pageY);

		var dx = Math.floor($gameMap._displayX * tileW + tx * SETTING.mapDispRange);
		var dy = Math.floor($gameMap._displayY * tileH + ty * SETTING.mapDispRange);
		var x = Math.floor(dx / tileW);
		var y = Math.floor(dy / tileH);
		dx -= x * tileW;
		dy -= y * tileH;


		var idx = x + y * width;
		var roomId = idxOfRoom(idx);

		var name = null;
		if (event.button === 0) name = 'Left';
		else if (event.button === 1) name = 'Middle';
		else if (event.button === 2) name = 'Right';

		var command = this._mode ? ('onMouseDown' + name + TRP_CORE.capitalize(this._mode)) : null;
		if (!command || !this[command]) return;

		this[command](event, roomId, x, y, tx, ty, dx, dy);
	};
	MapDecorator.tryCallOnMousePress = function () {
		var command = this._mode ? "onMousePress" + TRP_CORE.capitalize(this._mode) : null;
		if (!command || !this[command]) return;

		var tx = TouchInput.x;
		var ty = TouchInput.y;
		var dx = Math.floor($gameMap._displayX * tileW + tx * SETTING.mapDispRange);
		var dy = Math.floor($gameMap._displayY * tileH + ty * SETTING.mapDispRange);
		var x = Math.floor(dx / tileW);
		var y = Math.floor(dy / tileH);
		dx -= x * tileW;
		dy -= y * tileH;

		// var x = Math.floor($gameMap._displayX+tx/48*SETTING.mapDispRange);
		// var y = Math.floor($gameMap._displayY+ty/48*SETTING.mapDispRange);
		var idx = x + y * width;
		var roomId = idxOfRoom(idx);

		this[command](event, roomId, x, y, tx, ty, dx, dy);
	}


	MapDecorator.updateList = [];
	MapDecorator.update = function () {
		_Dev.updateTexts();

		if (this._pickingColor) {
			this.updateColorPicker();
			return;
		}

		/* update input
		===================================*/
		if (Input._latestButton) {
			var updateInput = this._mode ? "updateInput" + TRP_CORE.capitalize(this._mode) : null;
			if (updateInput && this[updateInput] && this[updateInput]()) {
				//mode input
			} else if (Input.isTriggered('cancel')) {
				if (!this.cantShowMenu) {
					this.showMenu();
				}
			} else if (this.updateScroll()) {
				//scrolled
			}
		}

		/* mouse press
		===================================*/
		if (TouchInput.isPressed()) {
			this.tryCallOnMousePress();
		}



		/* main mode update
		===================================*/
		var command = this._mode ? "update" + TRP_CORE.capitalize(this._mode) : null;
		if (command && this[command]) {
			this[command]();
		}

		/* extra registered update objects
		===================================*/
		for (var i = MapDecorator.updateList.length - 1; i >= 0; i = (i - 1) | 0) {
			MapDecorator.updateList[i].update();
		}


		/* update trpMapObjects
		===================================*/
		if (MapObject) {
			SceneManager._scene._spriteset.updateTrpMapObjects();
			$dataTrpMapObjects.forEach(obj => {
				if (obj.sprite) obj.sprite.update();
			});
		}
	};

	/* menu
	===================================*/
	MapDecorator.cantShowMenu = false;
	MapDecorator.showMenu = function () {
		_Dev.showToolsWindowWithId('decorator:main');
		SoundManager.playCancel();
	};

	(() => {
		//register main menu
		var commands = [];

		/* category:display analyze values
		===================================*/
		commands.push({
			name: '解析値の表示',
			type: 'window',
			param: 'decorator:show'
			, key: '',
			closeWindow: true,
		});
		var analyzeCommands = [{
			name: 'Z値マップの表示',
			type: 'script',
			param: 'TRP_MapDecorator.showZMap();'
			, key: '',
			closeWindow: true,

		}, {
			name: '壁IndexMapの表示',
			type: 'script',
			param: 'TRP_MapDecorator.showWallIdxMap();'
			, key: '',
			closeWindow: true,
		}];
		if (MapObject) {
			analyzeCommands.push({
				name: 'スプライトオブジェ衝突判定',
				type: 'script',
				param: 'TRP_MapDecorator.showMapObjectCollisions();'
				, key: '',
				closeWindow: true,
			});
		}
		_Dev.registerToolCommands({
			key: '',
			id: 'decorator:show',
			name: 'メインメニュー',
			commands: analyzeCommands
		});

		//selectRoomTarget
		commands.push({
			name: '編集対象の部屋を指定',
			type: 'script',
			param: 'TRP_MapDecorator.startRoomSelect()'
			, key: '',
			closeWindow: true,
		});



		/* category:manual process
		===================================*/
		commands.push({
			name: '手動プロセス実行',
			type: 'window',
			param: 'decorator:manual'
			, key: '',
			closeWindow: true,
		});
		_Dev.registerToolCommands({
			key: '',
			id: 'decorator:manual',
			name: '手動プロセス実行',
			commands: [{
				name: '全処理の取り消し',
				type: 'script',
				param: 'TRP_MapDecorator.reloadMapData();'
				, key: '',
				closeWindow: true,
			}, {

				name: '影のクリア/+Shift->再処理',
				type: 'script',
				param: 'TRP_MapDecorator.clearShadows();if(Input.isPressed("shift")){TRP_MapDecorator.supplyShadows();}'
				, key: '',
				closeWindow: true,
			}]
		});


		/* category:processList
		===================================*/
		commands.push({
			name: '置換プロセスの手動実行',
			type: 'window',
			param: 'decorator:processList'
			, key: '',
			closeWindow: true,
		});

		commands.push({
			name: 'バックアップから復元',
			type: 'script',
			param: 'TRP_MapDecorator.restoreFromBackup();'
			, key: '',
			closeWindow: true,
		});


		_Dev.registerToolCommands({
			key: '',
			id: 'decorator:main',
			name: 'メインメニュー',
			commands: commands,
		});
	})();


	MapDecorator.reloadMapData = function (noInitProc = false) {
		var filePath = TRP_CORE.mapFilePath();
		var mapData = JSON.parse(_Dev.readFile(filePath));
		data.length = 0;
		data.push(...(mapData.data));
		originalData = data.concat();

		SceneManager._scene._spriteset._tilemap._mapData = data;
		this.requestRefreshTilemap();

		if (!noInitProc) {
			this.initProc();
			this.analyzeAll();
		}

		SoundManager.playLoad();
	};




	/* scroll
	===================================*/
	MapDecorator.updateScroll = function () {
		var shift = Input.isPressed('shift');
		if (Input.isPressed('left')) {
			processScroll(-1, 0, shift);
		} else if (Input.isPressed('right')) {
			processScroll(1, 0, shift);
		} else if (Input.isPressed('down')) {
			processScroll(0, 1, shift);
		} else if (Input.isPressed('up')) {
			processScroll(0, -1, shift);
		}
	};

	function processScroll(dx, dy, shift) {
		var speed = 16;
		var shiftRate = 2;

		dx *= shift ? speed * shiftRate : speed;
		dy *= shift ? speed * shiftRate : speed;

		$gameMap._displayX += dx / tileW;
		$gameMap._displayY += dy / tileH;

		var dispW = Graphics.width * SETTING.mapDispRange / tileW;
		var dispH = Graphics.height * SETTING.mapDispRange / tileH;
		var mx = width - dispW;
		var my = height - dispH;
		if (mx < 0) mx = 0;
		if (my < 0) my = 0;
		$gameMap._displayX = $gameMap._displayX.clamp(0, mx);
		$gameMap._displayY = $gameMap._displayY.clamp(0, my);

		SceneManager._scene._spriteset.updateTilemap();
	};






	//=============================================================================
	// process ZMap
	//=============================================================================
	MapDecorator.analyzeFloorZMap = function () {

		/* analyze proc.zMap prior by eventSetting
		===================================*/
		var procSuccess = this.analyzeZMapByEventSettings();
		if (!procSuccess) return;


		/* analyze left tiles
		===================================*/
		var validIdxes = [];
		for (const idxes of proc.allRoomIdxes) {
			validIdxes = validIdxes.concat(idxes);
		}

		var floorBaseIdxes = [];
		validIdxes = validIdxes.filter(idx => {
			var tileId = data[idx];
			if (!tileId) return false;
			if (baseTileIds.contains(baseTileId(tileId))) {
				floorBaseIdxes.push(idx);
				return false;
			}

			if (Tilemap.isWallSideTile(tileId)) return false;
			if (this.isWallTile(tileId, idx)) return false;
			if (this.isCeilingTile(tileId)) return false;
			return true;
		});

		for (var pi = 0; pi < 2; pi = (pi + 1) | 0) {
			var idxes = pi === 0 ? floorBaseIdxes : validIdxes;
			for (const idx of idxes) {
				if (proc.zMap[idx] !== undefined) continue;
				proc.zMap[idx] = 0;

				var x = idx % width;
				var y = Math.floor(idx / width);
				this.processZMap(x, y)
			}
		}


		/* analyze proc.minZ
		===================================*/
		var length = proc.zMap.length;
		proc.minZ = Number.MAX_SAFE_INTEGER;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var z = proc.zMap[i];
			if (z !== undefined) {
				if (z < proc.minZ) {
					proc.minZ = z;
				}
			}
		}

		/* adjust proc.minZ to zero
		===================================*/
		proc.maxZ = 0;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var z = proc.zMap[i];
			if (z !== undefined) {
				proc.zMap[i] -= proc.minZ;
				proc.maxZ = Math.max(proc.maxZ, proc.zMap[i]);
				if (SETTING.writeZ_Region) {
					data[zRegion + i] = (proc.zMap[i] + 1) * 10;
				}
			}
		}
		proc.minZ = 0;
		proc.floorLevelZMap = proc.zMap.concat();
	};


	MapDecorator.analyzeZMapByEventSettings = function () {
		var events = $dataMap.events;
		var eventIdxes = [];
		for (const event of events) {
			if (!event) continue;

			var image = event.pages[0].image;
			if (image.characterName !== MapDecorator.INFO_CHARACTER_Z_NAME) continue;

			var col = 3 * (image.characterIndex % 4) + image.pattern;
			var row = 4 * Math.floor(image.characterIndex / 4) + (image.direction / 2 - 1);
			var eventZ = col + row * 12;
			if (eventZ >= 36) {
				eventZ -= 35;
				eventZ *= -1;
			}
			var eIdx = event.x + event.y * width;
			eventIdxes.push(eIdx);

			proc.zMap[eIdx] = eventZ;
		}

		for (const idx of eventIdxes) {
			var ex = idx % width;
			var ey = Math.floor(idx / width);
			this.processZMap(ex, ey);
		}
		return true;
	};

	MapDecorator.processZMap = function (sx, sy) {
		var sIdx = sx + sy * width;
		var sTileId = baseTileId(data[sIdx]);
		if (!sTileId) return;

		var sz = proc.zMap[sIdx];
		var next = [sIdx];
		var current = [];

		while (next.length) {
			var temp = current;
			temp.length = 0;
			current = next;
			next = temp;

			if (current.length > 1) {
				//sort by z
				current.sort((idxA, idxB) => {
					return (proc.zMap[idxA] || 0) - (proc.zMap[idxB] || 0);
				});
			}


			for (const idx of current) {
				var baseZ = proc.zMap[idx];
				var tileId = baseTileId(data[idx]);
				var x = idx % width;
				var y = Math.floor(idx / width);

				/* set same floor z
				===================================*/
				var criffBeginIdxes = [];
				this.analyzeNeighbors(x, y, (nx, ny, ox, oy, positions, checkedIdxes) => {
					var nIdx = nx + ny * width;
					if (idx === nIdx) return true;

					var nId = baseTileId(data[nIdx]);
					if (!this.isSameNeighborZTiles(nId, tileId)) {
						//save criffBeginIdxes
						if (criffWallBaseIds.contains(nId)) {
							if (proc.zMap[nIdx] !== undefined) return false;

							if (nx !== ox) {
								if (checkedIdxes) {
									TRP_CORE.remove(checkedIdxes, nIdx);
								}
							} else {
								var zSign = ny > oy ? -1 : 1;
								TRP_CORE.uniquePush(
									criffBeginIdxes,
									zSign * nIdx
								);
							}
						}
						return false;
					}

					//same floor tile > neighbor ok
					proc.zMap[nIdx] = baseZ;
					return true;
				});

				/* process criff
				===================================*/
				for (const criffIdx of criffBeginIdxes) {
					var zSign = criffIdx > 0 ? 1 : -1;
					var nIdx = Math.abs(criffIdx);


					//criff start
					var z = baseZ + zSign * 0.5;
					proc.zMap[nIdx] = z;
					for (; ;) {
						nIdx -= zSign * width;
						if (nIdx < 0 || nIdx >= zLayerSize) break;

						var nId = baseTileId(data[nIdx]);
						if (!nId) break;

						if (criffWallBaseIds.contains(nId)) {
							//criff continue
						} else {
							//found higher or lower floor
							if (proc.zMap[nIdx] === undefined) {
								next.push(nIdx);
								proc.zMap[nIdx] = z + 0.5 * zSign;
							}
							break;
						}

						z += zSign;
						proc.zMap[nIdx] = z;
					}
				}
			}
		}
	};




	/* helper
	===================================*/
	MapDecorator.isSameNeighborZTiles = function (tileId1, tileId2) {
		if (tileId1 === tileId2) return true;

		//both baseTile (different baseFloor)
		if (baseTileIds.contains(tileId1) && baseTileIds.contains(tileId2)) return true;

		return false;
	};



	/* proc.zMap mode
	===================================*/
	MapDecorator._tonnerSprite = null;
	MapDecorator.showZMap = function (errorMode) {
		this.setMode(errorMode ? 'zMapError' : 'zMap');
		var positions = [];
		var colorMin = 'rgb(0,255,0)';

		//color setting [min,max];
		var base = 50;
		var red = [base, 255];
		var green = [base, base];
		var blue = [255, base];
		var alpha = 0.8;

		var colorZMin = proc.minZ;
		var colorZMax = proc.maxZ;
		var texts = [];
		var colors = [];

		for (var i = proc.zMap.length - 1; i >= 0; i = (i - 1) | 0) {
			var z = proc.zMap[i];
			var text = z;
			var color;
			if (z === undefined) continue;
			if (z === Number.MAX_SAFE_INTEGER) {
				text = '∞';
				color = 'rgba(0,0,0,0)';
			} else {
				var r = red[0] + z / colorZMax * (red[1] - red[0]);
				var g = green[0] + z / colorZMax * (green[1] - green[0]);
				var b = blue[0] + z / colorZMax * (blue[1] - blue[0]);
				color = 'rgb(%1,%2,%3,%4)'.format(r, g, b, alpha);
			}

			positions.push(i);
			texts.push(text);
			colors.push(color);
		}

		this.tonnerTiles(positions, texts, colors);
	};
	MapDecorator.tonnerTiles = function (positions, texts, color, tonnerTiles, drawText) {
		var sprite = _Dev.tonnerTiles(positions, false, color, texts, tonnerTiles, drawText);
		if (!sprite) {
			this.tryReleaseTonnerSprite();
			return;
		}

		MapDecorator._tonnerSprite = sprite;
		TRP_CORE.uniquePush(this.updateList, sprite);
		sprite.update()
	}

	MapDecorator.MODE_GUIDE.zMap = [
		'【Zマップ確認モード】',
		'左クリック:確認モード終了'
	];
	MapDecorator.MODE_GUIDE.zMapError = [
		'【Zマップエラー】',
		'Z値が衝突しないようにイベント設定・崖の高さを調整してください。'
	];

	MapDecorator.restoreModeByMouse = function () {
		this.restoreMode();
		SoundManager.playCancel();
	}
	MapDecorator.updateInputToCheckRestoreMode = function () {
		if (Input.isTriggered('ok')) {
			this.restoreMode();
			SoundManager.playCancel();
			return true;
		}
		return false;
	}

	MapDecorator.tryReleaseTonnerSprite = function () {
		var sprite = this._tonnerSprite;
		if (sprite) {
			if (sprite.parent) {
				sprite.parent.removeChild(sprite);
			}
			TRP_CORE.remove(this.updateList, sprite);
		}
		this._tonnerSprite = null;
	};

	MapDecorator.onMouseDownLeftZMap = MapDecorator.restoreModeByMouse;
	MapDecorator.updateInputZMap = MapDecorator.updateInputToCheckRestoreMode;



	//=============================================================================
	// processCriff
	//=============================================================================
	MapDecorator.processMapCriff = function () {
		var length = allInfo.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			this.changeBaseInfo(allInfo[i]);
			if (!info.criffTopBaseId) continue;

			this.processMapCriffWithInfo(info);
		}

		this.requestRefreshTilemap();
	};

	MapDecorator.processMapCriffWithInfo = function (info) {
		var newData = data.concat();

		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			var tileId = baseTileId(data[idx]);
			if (!tileId) continue;

			var z = proc.zMap[idx];
			if (tileId === info.criffTopBaseId || tileId === info.criffTopSubId) {
				this.processCriffTop(newData, idx, tileId, z);
			} else if (tileId === info.criffWallBaseId && !proc.wallIdxes.contains(idx)) {
				this.processCriffWall(newData, idx, tileId, z);
			}
		}

		this.replaceCriffTopTiles(newData);

		/* apply data
		===================================*/
		data.length = 0;
		Array.prototype.push.apply(data, newData);
		newData = null;
	};

	MapDecorator.processCriffTop = function (newData, idx, tileId, z) {
		var nf = TRP_CORE.packValues([], 0, 10);
		nf[5] = 1;

		var noSupplyBack = this.analyzeCriffTopNeighborFlags(nf, idx, tileId, z);
		tileId = connectAutoTile(tileId, nf);

		if (!noSupplyBack && SETTING.supplyUpperCriffTopBack && !nf[8]) {
			/* supply upper criff top back
			===================================*/
			newData[zAcc + idx] = tileId;
			this.supplyBackTile(idx, newData, true);
		} else {
			newData[idx] = tileId;
		}


		if (Tilemap.getAutotileShape(tileId)) {
			proc.criffIdxes.push(idx);
			proc.criffTopIdxes.push(idx);

			if (
				(nf[2] ? 0 : 1) + (nf[4] ? 0 : 1) + (nf[6] ? 0 : 1) + (nf[8] ? 0 : 1) >= SETTING.criffTopObjForbiddenSideNum && SETTING.criffTopObjForbiddenSideNum > 0
			) {
				proc.objForbiddenIdxes.push(idx);
			}
		}
	};

	MapDecorator.analyzeCriffTopNeighborFlags = function (nf, idx, tileId, z) {
		//return needs supplyBack
		var noSupplyBack = false;
		for (var ni = 1; ni <= 9; ni = (ni + 1) | 0) {
			//check flag set
			if (nf[ni]) continue;
			if (ni === 5) {
				nf[ni] = 1;
				continue;
			}

			var neighbor = idxForNeighborDir(idx, ni);
			if (neighbor < 0) {
				//outside -> connect
				nf[ni] = 1;
				continue;
			}

			var neighborId = baseTileId(data[neighbor]);
			var neighborZ = !neighborId ? Number.MAX_SAFE_INTEGER : proc.zMap[neighbor];

			var y = Math.floor(idx / width)
			if (!neighborId) {
				if (SETTING.noWall) {
					nf[ni] = 0;
					noSupplyBack = true;
					continue;
				}

				if (ni !== 2 && ni !== 8) {
					//side
					var h = 0;
					for (var dy = 0; ; dy = (dy + 1) | 0) {
						if (y + dy >= height) break;

						var tidx = neighbor + dy * width;
						if (data[tidx]) {
							neighborZ = dy + proc.zMap[tidx] - 1;
							break;
						}
					}
				}
			}

			if (criffWallBaseIds.contains(neighborId) || proc.wallIdxes.contains(neighborId)) {
				nf[ni] = neighborZ > z ? 1 : 0;
				continue;
			}
			if (tileId == neighborId) {
				nf[ni] = 1;
			} else {
				nf[ni] = neighborZ >= z ? 1 : 0;
			}
		}
		return noSupplyBack;
	}

	MapDecorator.processCriffWall = function (newData, idx, tileId, z) {
		proc.criffIdxes.push(idx);
		proc.criffWallIdxes.push(idx);
		proc.objForbiddenIdxes.push(idx);

		//auto shape
		var s = 0;
		for (var di = 0; di < 4; di = (di + 1) | 0) {
			var dir = (di + 1) * 2;
			var nIdx = idxForNeighborDir(idx, dir);

			var nId = data[nIdx];
			var nz = proc.zMap[nIdx];

			var connect = false;
			if (!nId) {
				if (nIdx < 0) {
					connect = true;
				} else if (dir === 2 && z < 1) {
					//wall bottom
					connect = false;
				} else {
					connect = true;
				}
			} else if (dir === 4 || dir === 6) {
				//side
				connect = nz >= z;
			} else if (dir === 2 && nz > z + 1 && z === 0.5) {
				//z=0.5 & lower criff top
				connect = false;
			} else if (!Tilemap.isAutotile(nId)) {
				connect = false;
			} else {
				nId -= Tilemap.getAutotileShape(nId);
				if (nz > z) {
					connect = true;
				} else {
					connect = nId === info.criffWallBaseId
				}
			}
			if (!connect) {
				var powIdx = DIR_SHAPE_POW[dir];
				s += Math.pow(2, powIdx);
			}
		}
		newData[idx] = tileId + s;
	};

	var DIR_SHAPE_POW = [0, 0, 3, 0, 0, 0, 2, 0, 1];

	MapDecorator.replaceCriffTopTiles = function (newData) {
		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			for (var z = 0; z < 2; z = (z + 1) | 0) {
				var zIdx = z * zLayerSize + idx;
				var tileId = baseTileId(newData[zIdx]);
				if (tileId === info.criffTopBaseId || tileId === info.criffTopSubId) {
					var shape = newData[zIdx] - tileId;
					if (shape === 0) {
						newData[zIdx] = info.floorBaseId;
					} else {
						newData[zIdx] = info.criffTopBaseId + shape;
					}
				}
			}
		}
	};




	//=============================================================================
	// Supply Walls
	//=============================================================================
	MapDecorator.analyzeWallIdxes = function () {
		/* <proc.wallIdxMap>
		 * -1:empty
		 * 0~:wall
		 * max:floor
		===================================*/
		for (var i = 0; i < zLayerSize; i = (i + 1) | 0) {
			if (proc.wallIdxMap[i] !== undefined) continue;
			proc.wallIdxMap[i] = -1;

			var x = i % width;
			var y = Math.floor(i / width);

			if (y >= height - 1) {
				//map bottom
				continue;
			}

			var tileId = data[i];

			var lowerIdx = i + width;
			var lowerId = lowerIdx < zLayerSize ? data[lowerIdx] : 0;
			var lowerFloorZ = proc.zMap[i + width] || 0;
			var upperIdx = i - width;
			var upperId = upperIdx >= 0 ? data[upperIdx] : 0;

			if (tileId) {
				if (this.isWallTile(tileId, i)) {
					//already wall set
					// -> will process from top

					if (this.isWallTile(upperId, upperIdx)) continue;

					//supply proc.wallIdxes
					var dy = 0;
					for (; i + dy * width < zLayerSize; dy = (dy + 1) | 0) {
						var cIdx = i + dy * width;
						var cTile = data[cIdx];
						if (dy > 0 && !this.isWallTile(cTile, cIdx)) break;

						proc.wallIdxMap[cIdx] = dy;
						proc.wallIdxes.push(cIdx);
						proc.zMap[cIdx] = lowerFloorZ + dy + 0.5;
					}

					//set proc.zMap from bottom
					var wallH = dy;
					lowerFloorZ = proc.zMap[i + wallH * width] || 0;
					for (var dy = 0; dy < wallH; dy = (dy + 1) | 0) {
						proc.zMap[i + dy * width] = lowerFloorZ + (wallH - dy - 0.5);
					}
				} else if (this.isCeilingTile(tileId)) {
					//ceiling
					proc.wallIdxMap[i] = -1;
				} else {
					//floor
					proc.wallIdxMap[i] = Number.MAX_SAFE_INTEGER;
				}
				continue;
			}

			//check needs supplyWalls
			if (!SETTING.autoWallSupply) continue;

			//check lower ground
			if (!this.isGroundTile(lowerId, lowerIdx)) continue;

			var roomId = proc.roomIdxMapForUserProc[lowerIdx];
			var baseSetting = this.baseFloorInfoWithTile(tileId);
			if (!baseSetting.wallTileIds) {
				baseSetting = allInfo[0];
			}
			if (!baseSetting.wallTileIds || !baseSetting.wallTileIds.length) {
				continue;
			}
			var wallH = baseSetting.wallTileIds ? baseSetting.wallTileIds.length : 0;

			//arrange total height
			if (SETTING.arrangeTotalHeight) {
				wallH = proc.maxZ + wallH - lowerFloorZ;
			}



			//set idx to wall top ceiling
			var idx = i - wallH * width;


			//set idx to wall top
			idx += width;
			for (var dy = 0; dy < wallH; dy = (dy + 1) | 0, idx += width) {
				if (idx < 0) continue;
				if (proc.wallIdxMap[idx] > -1) continue;

				var tileId = data[idx];
				if (tileId) continue;

				proc.wallIdxMap[idx] = dy;
				proc.wallIdxes.push(idx);
				proc.zMap[idx] = lowerFloorZ + (wallH - dy - 0.5);
				if (roomId >= 0 && proc.roomIdxMapForUserProc[idx] < 0) {
					proc.roomIdxMapForUserProc[idx] = roomId;
				}
			}
		}
	};

	MapDecorator.isWallTile = function (tileId, idxForCheckNonRegisterWall = -1) {
		if (SETTING.noWall) return false;

		if (idxForCheckNonRegisterWall >= 0) {
			//check nonRegisterWall
			if (!Tilemap.isWallSideTile(tileId)) return false;
			return this.checkWallTopCeilingOrEmpty(idxForCheckNonRegisterWall - width);
		} else {
			if (allWallIds.contains(baseTileId(tileId))) return true;
			return false;
		}
	};

	MapDecorator.checkWallTopCeilingOrEmpty = function (idx) {
		if (idx < 0) return true;
		var tileId = data[idx];
		if (!tileId) return true;
		if (this.isCeilingTile(tileId)) return true;

		if (Tilemap.isWallSideTile(tileId)) {
			return this.checkWallTopCeilingOrEmpty(idx - width);
		} else {
			return false;
		}
	};

	MapDecorator.isCeilingTile = function (tileId) {
		if (!tileId && SETTING.autoCeilingSupplyWithEmpty) {
			return true;
		}
		return allCeilingIds.contains(baseTileId(tileId));
	};
	MapDecorator.isGroundTile = function (tileId, idx) {
		return tileId && !this.isWallTile(tileId, idx) && !this.isCeilingTile(tileId);
	};
	MapDecorator.baseFloorInfoWithTile = function (tileId, allowFailure = false) {
		tileId = baseTileId(tileId);

		for (const info of allInfo) {
			if (info.floorBaseId === tileId) return info;
			if (info.ceilingBaseId === tileId) return info;
			if (info.wallTileIds && info.wallTileIds.contains(tileId)) return info;
			if (info.waterBaseId === tileId) return info;
			if (info.waterAccIds && info.waterAccIds.contains(tileId)) return info;
			if (info.floorVariationIds && info.floorVariationIds.contains(tileId)) return info;
			if (info.accSettings[tileId]) return info;
		}
		return allowFailure ? null : allInfo[0];
	};




	/* wallIdx mode
	===================================*/
	MapDecorator.showWallIdxMap = function () {
		this.setMode('wallIdx');

		var positions = [];
		var autoRemove = false;
		var color = 'rgba(0,0,255,0.2)';
		var texts = [];
		for (var i = zLayerSize - 1; i >= 0; i = (i - 1) | 0) {
			var wallIdx = proc.wallIdxMap[i];
			if (wallIdx === Number.MAX_SAFE_INTEGER) continue;

			positions.push(i);
			texts.push(wallIdx);
		}

		this.tonnerTiles(positions, texts, color);
	};
	MapDecorator.MODE_GUIDE.wallIdx = [
		'【壁IndexMap確認モード】',
		'左クリック:確認モード終了'
	];


	MapDecorator.onMouseDownLeftWallIdx = MapDecorator.restoreModeByMouse;
	MapDecorator.updateInputWallIdx = MapDecorator.updateInputToCheckRestoreMode;




	/* supplyWalls
	===================================*/
	MapDecorator.supplyWalls = function () {
		var floorWallIdx = Number.MAX_SAFE_INTEGER;
		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			if (invalidIdxes && invalidIdxes.contains(idx)) continue;

			//proc from floor top 
			if (proc.wallIdxMap[idx] !== floorWallIdx) continue;

			//check upper wall
			var upperIdx = idx - width;
			var wallIdx = proc.wallIdxMap[upperIdx];
			if (upperIdx < 0) continue;
			if (wallIdx === -1) continue;
			if (wallIdx === floorWallIdx) continue;


			//prepare wallTileIds
			var tileId = data[idx];
			var baseInfo = this.baseFloorInfoWithTile(tileId);
			if (!baseInfo.wallTileIds) baseInfo = allInfo[0];
			if (!baseInfo.wallTileIds) continue;

			var wallTileIds = baseInfo.wallTileIds;
			var baseInfoIdx = allInfo.indexOf(baseInfo);
			var defWallH = wallTileIds.length;

			//supply wallTiles
			var cIdx = upperIdx;
			var wallH = wallIdx + 1;
			for (; cIdx >= 0; cIdx = (cIdx - width) | 0) {
				var cTileId = data[cIdx];
				if (cTileId) continue;

				var wallIdx = proc.wallIdxMap[cIdx];
				if (wallIdx === -1) break;
				if (wallIdx === floorWallIdx) break;

				//adjust wallIdx
				if (wallIdx === wallH - 1) {
					wallIdx = defWallH - 1;
				} else {
					wallIdx = wallIdx.clamp(0, defWallH - 2);
				}

				//supply wall tile
				cTileId = data[cIdx] = wallTileIds[wallIdx];

				//cache baseInfoIdx
				proc.idxBaseInfoIdxMap[cIdx] = baseInfoIdx;
			}
		}

		this.connectWallTiles();
	};

	MapDecorator.connectWallTiles = function () {
		for (var wi = 0; wi < proc.wallIdxes.length; wi = (wi + 1) | 0) {
			this.connectWallTile(proc.wallIdxes[wi]);
		}
	};


	var FLOOR_WALL_IDX = Number.MAX_SAFE_INTEGER
	MapDecorator.connectWallTile = function (idx) {
		//original loc
		if (originalData[idx]) return;

		var tileId = baseTileId(data[idx]);
		if (!Tilemap.isAutotile(tileId)) return;

		var wallIdx = proc.wallIdxMap[idx];
		var z = proc.zMap[idx];

		data[idx] = this._connectWallTile(idx, tileId, wallIdx, z);
	};

	MapDecorator._connectWallTile = function (idx, tileId, wallIdx, z) {
		var x = idx % width;
		var y = Math.floor(idx / width);


		/* analyze Left/Right close
		===================================*/
		var leftClose = 0;
		var rightClose = 0;

		if (x > 0 && !(invalidIdxes && !invalidIdxes.contains(idx - 1))) {
			var neighborWallIdx = proc.wallIdxMap[idx - 1];
			var neighborZ = proc.zMap[idx - 1];
			if (neighborWallIdx < Number.MAX_SAFE_INTEGER) {
				if (wallIdx < neighborWallIdx) {
					leftClose = 1;
				}
			} else {
				if (z > neighborZ) {
					leftClose = 1;
				}
			}
			// if(tileId !== baseTileId(data[idx-1])){
			// 	//diffrent kind wall
			// 	// leftClose = 1;
			// }
		}

		if (x < width - 1 && !(invalidIdxes && !invalidIdxes.contains(idx + 1))) {
			var neighborWallIdx = proc.wallIdxMap[idx + 1];
			var neighborZ = proc.zMap[idx + 1];
			if (neighborWallIdx < Number.MAX_SAFE_INTEGER) {
				if (wallIdx < neighborWallIdx) {
					rightClose = 1;
				}
			} else {
				if (z > neighborZ) {
					rightClose = 1;
				}
			}
			// if(tileId !== baseTileId(data[idx+1])){
			// 	//diffrent kind wall
			// 	// rightClose = 1;
			// }
		}

		/* analyze Top/Bottom close
		===================================*/
		var topClose = 0;
		var bottomClose = 0;

		if (wallIdx === 0) {
			topClose = 1;
		}

		var lowerIdx = idx + width;
		var lowerWallIdx = proc.wallIdxMap[lowerIdx];
		if (lowerWallIdx === FLOOR_WALL_IDX) {
			bottomClose = 1;
		}


		/* adjust shape
		===================================*/
		var s = 0;
		if (leftClose) s += 1 << 0;
		if (topClose) s += 1 << 1;
		if (rightClose) s += 1 << 2;
		if (bottomClose) s += 1 << 3;

		return tileId + s;
	}




	//=============================================================================
	// Supply Ceilings
	//=============================================================================
	MapDecorator.analyzeCeilingIdxes = function () {
		//make ceilingIdxes
		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			//check is floor or wall
			var wallIdx = proc.wallIdxMap[idx];
			var tileId = data[idx];
			if (wallIdx < 0) {
				//empty
				if (this.isCeilingTile(tileId)) {
					TRP_CORE.uniquePush(proc.ceilingIdxes, idx);
					proc.zMap[idx] = Number.MAX_SAFE_INTEGER;
				}
				continue;
			}

			if (!SETTING.autoCeilingSupply) continue;

			var roomId = proc.roomIdxMapForUserProc[idx];


			//auto supply
			for (var ni = 1; ni < 10; ni = (ni + 1) | 0) {
				if (ni === 5) continue;

				var nIdx = idxForNeighborDir(idx, ni);
				var nWallIdx = proc.wallIdxMap[nIdx];

				//check neighbor empty > ceiling
				if (nWallIdx === -1) {
					var firstPush = TRP_CORE.uniquePush(proc.ceilingIdxes, nIdx);
					proc.zMap[nIdx] = Number.MAX_SAFE_INTEGER;

					if (roomId >= 0 && proc.roomIdxMapForUserProc[nIdx] < 0) {
						proc.roomIdxMapForUserProc[nIdx] = roomId;
					}

					//cache baseInfoIdx
					var forceOverWrite = ni === 2 || ni === 4 || ni === 6 || ni === 8;
					if (forceOverWrite || !firstPush) {
						var baseInfo = this.baseFloorInfoWithTile(tileId);
						if (!baseInfo.ceilingBaseId) baseInfo = allInfo[0];

						var baseInfoIdx = allInfo.indexOf(baseInfo);
						proc.idxBaseInfoIdxMap[nIdx] = baseInfoIdx;
					}
				}
			};
		}
		proc.ceilingIdxes.sort((a, b) => a - b);
	};

	MapDecorator.supplyCeilings = function () {
		var nf = TRP_CORE.packValues([], 0, 10);
		nf[5] = 1;

		for (const idx of proc.ceilingIdxes) {
			if (invalidIdxes && invalidIdxes.contains(idx)) continue;

			//check already set
			if (originalData[idx]) continue;

			//supply tile id
			var tileId = baseTileId(data[idx]);
			if (!tileId) {
				var baseInfoIdx = proc.idxBaseInfoIdxMap[idx];
				var baseInfo = allInfo[baseInfoIdx || 0];
				tileId = baseInfo.ceilingBaseId;
				if (!tileId) continue;

				data[idx] = tileId;
			}

			//check neighbor connection
			for (var ni = 1; ni < 10; ni = (ni + 1) | 0) {
				if (ni === 5) continue;

				var nIdx = idxForNeighborDir(idx, ni);
				if (proc.ceilingIdxes.contains(nIdx)) {
					nf[ni] = 1;
				} else {
					if (SETTING.isEmptySpaceCeiling) {
						if (nIdx < 0 || proc.wallIdxMap[nIdx] < 0 || (invalidIdxes && invalidIdxes.contains(nIdx))) {
							nf[ni] = 1;
						} else {
							nf[ni] = 0;
						}
					} else {
						nf[ni] = 0;
					}
				}
			}

			//auto connect
			data[idx] = connectAutoTile(tileId, nf)
		}
	};

	MapDecorator.checkCeilingCorrect = function () {
		var failureIdxes = [];
		var texts = [];
		for (const idx of proc.wallIdxes) {
			var upperIdx = idx - width;
			if (upperIdx < 0) continue;

			if (proc.wallIdxes.contains(upperIdx)) continue;
			if (proc.ceilingIdxes.contains(upperIdx)) continue;

			var x = upperIdx % width;
			var y = Math.floor(upperIdx / width);
			var alert = '天井設置に失敗<x:%1,y:%2>'.format(x, y);
			_Dev.showText(null, alert, 'red');

			failureIdxes.push(upperIdx);
			texts.push('x');
		}

		if (failureIdxes.length) {
			var color = 'rgba(255,0,0,0.8)';
			this.tonnerTiles(failureIdxes, texts, color);

			$gamePlayer.locate(x, y);
			SceneManager._scene._spriteset.update();
		}
	};





	//=============================================================================
	// supply BackTiles
	//=============================================================================
	MapDecorator.supplyBackTile = function (idx, dstData = data) {
		var baseIdx = proc.idxBaseInfoIdxMap[idx];
		var info = allInfo[baseIdx] || allInfo[0];

		//search supply sample directions
		var maxZ = proc.minZ - 1;
		var bestDirs = [];
		var z = proc.zMap[idx];

		for (var dir = 2; dir <= 8; dir = (dir + 2) | 0) {
			var nz = this.zForSupplyBackTile(idx, z, dir, info);
			if (nz > maxZ) {
				maxZ = nz;
				bestDirs.length = 0;
				bestDirs.push(dir);
			} else if (nz === maxZ) {
				bestDirs.push(dir);
			}
		}
		maxZ = Math.max(maxZ, proc.minZ);

		//prior side dirs
		if (TRP_CORE.remove(bestDirs, 2)) bestDirs.push(2);
		if (TRP_CORE.remove(bestDirs, 8)) bestDirs.push(8);

		this.supplyBackTilesWithDirs(idx, bestDirs, maxZ, info, dstData);
	};

	MapDecorator.zForSupplyBackTile = function (idx, z, dir, info) {
		var nIdx = idxForNeighborDir(idx, dir);

		//check in map
		if (nIdx < 0) return Number.MIN_SAFE_INTEGER;

		//check not ceiling
		var nz = proc.zMap[nIdx];
		if (nz === Number.MAX_SAFE_INTEGER) {
			return Number.MIN_SAFE_INTEGER;
		}

		//check z lower
		if (nz >= z) {
			return Number.MIN_SAFE_INTEGER;
		}

		//check not sequencial wall
		if (dir === 2 && proc.ceilingIdxes.contains(idx) && proc.wallIdxes.contains(nIdx)) {
			//ceiling ~ wall -> sequencial
			return Number.MIN_SAFE_INTEGER;
		}
		if (proc.wallIdxes.contains(idx)) {
			if ((dir === 2 && proc.wallIdxMap[idx] + 1 === proc.wallIdxMap[nIdx])
				|| (dir === 8 && proc.wallIdxMap[nIdx] + 1 === proc.wallIdxMap[idx])
			) {
				return Number.MIN_SAFE_INTEGER;
			}
		}
		return nz;
	};


	MapDecorator.supplyBackTilesWithDirs = function (idx, bestDirs, z, info, dstData) {
		var bestTileId = -1;
		var isCriffTop = false;
		for (const dir of bestDirs) {
			var nIdx = idxForNeighborDir(idx, dir);
			var tileId = data[nIdx];
			if (proc.wallIdxes.contains(nIdx) ||
				(proc.criffWallIdxes && proc.criffWallIdxes.contains(nIdx))
			) {
				//supply wallTile
				if (proc.wallIdxes.contains(nIdx)) {
					tileId = info.wallTileIds ? info.wallTileIds[0] : tielId;
				}
				if (Tilemap.isAutotile(tileId)) {
					var wallIdx = proc.wallIdxMap[nIdx];
					if (dir === 2) wallIdx -= 1;
					else if (dir === 8) wallIdx += 1;

					tileId = this._connectWallTile(idx, tileId, wallIdx, z);
				}

				dstData[idx] = tileId;
				return;
			} else {
				/* try supply criffTop tile
				===================================*/
				if (proc.criffTopIdxes.contains(nIdx)) {
					var nf = TRP_CORE.packValues([], 0, 10);
					nf[5] = 1;
					for (var di = bestDirs.length - 1; di >= 0; di = (di - 1) | 0) {
						nf[bestDirs[di]] = 1;
					}

					var noSupplyBack = this.analyzeCriffTopNeighborFlags(nf, idx, baseTileId(tileId), z);
					tileId = connectAutoTile(baseTileId(tileId), nf);

					//apply backTile
					bestTileId = tileId
					isCriffTop = true;
					break;
				}
			}
		}

		//supply normal floor
		if (bestTileId < 0) {
			bestTileId = info.floorBaseId;
		}

		//apply backTile
		dstData[idx] = bestTileId;


		//register idxes
		TRP_CORE.uniquePush(proc.floorSuppliedIdxes, idx);
		proc.floorLevelZMap[idx] = z;
		if (!isCriffTop && !proc.wallIdxes.contains(idx) && !proc.criffWallIdxes.contains(idx)) {
			var roomId = idxOfRoom(nIdx);
			if (roomId >= 0) {
				TRP_CORE.uniquePush(proc.allRoomIdxes[roomId], idx);
				TRP_CORE.uniquePush(proc.allBaseIdxes[roomId], idx);
				proc.roomIdxMapForUserProc[idx] = roomId;
			}
		}

		//supply shadow
		this.supplyShadow(idx, dstData);
	};






	//=============================================================================
	// Supply Shadows
	//=============================================================================
	MapDecorator.supplyShadows = function () {
		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			if (invalidIdxes && invalidIdxes.contains(idx)) continue;
			this.supplyShadow(idx);
		}
		this.requestRefreshTilemap();
	};
	MapDecorator.supplyShadow = function (idx, dstData = data) {
		var wallIdx = proc.wallIdxMap[idx];
		if (wallIdx < 0 && !proc.floorSuppliedIdxes.contains(idx)) {
			//ceiling or empty -> noShadow
			dstData[idx + zShadow] = 0;
			return
		}

		//skip wall shadow setting
		if (SETTING.noShadowOnWall) {
			if (wallIdx >= 0 && wallIdx !== Number.MAX_SAFE_INTEGER) {
				return
			} else if (proc.criffWallIdxes.contains(idx)) {
				return
			}
		}

		/* compare zValue to left & leftUp tile
		===================================*/
		var z = proc.floorLevelZMap[idx];

		var leftZ = proc.zMap[idx - 1];
		var leftUpZ = proc.zMap[idx - 1 - width];
		if (idx % width === 0) {
			leftZ = Number.MAX_SAFE_INTEGER;
			leftUpZ = Number.MAX_SAFE_INTEGER;
		} else if (idx - width - 1 < 0) {
			leftUpZ = Number.MAX_SAFE_INTEGER;
		}

		if (z < leftZ && z < leftUpZ) {
			dstData[idx + zShadow] = 5;
		}
	}

	MapDecorator.clearShadows = function () {
		for (var i = 0; i < zLayerSize; i = (i + 1) | 0) {
			data[i + zShadow] = originalData[i + zShadow] = 0;
		}

		this.requestRefreshTilemap();
	};




	//=============================================================================
	// Room Select
	//=============================================================================
	MapDecorator.analyzeRooms = function () {
		var checked = [];
		var separatorRegionId = Number(parameters.roomSeparatorRegionId) || -1;
		var objForbiddenRegionId = Number(parameters.objForbiddenRegionId) || -1;

		TRP_CORE.packValues(proc.roomIdxMapForUserProc, -1, zLayerSize);

		for (var idx = 0; idx < zLayerSize; idx = (idx + 1) | 0) {
			if (checked.contains(idx)) continue;
			if (isEmptyTile(idx)) continue;
			if (invalidIdxes && invalidIdxes.contains(idx)) continue;

			var roomIdxes = [];
			var roomId = proc.allRoomIdxes.length;
			proc.allRoomIdxes.push(roomIdxes);


			var x = idx % width;
			var y = Math.floor(idx / width);
			analyzeNeighbors(x, y, (nx, ny) => {
				var nIdx = nx + ny * width;
				if (checked.contains(nIdx)) return false;
				if (invalidIdxes && invalidIdxes.contains(idx)) return false;

				checked.push(nIdx);
				if (isEmptyTile(nIdx)) return false;

				roomIdxes.push(nIdx);
				proc.roomIdxMapForUserProc[nIdx] = roomId;


				var regionId = data[nIdx + zRegion];
				if (regionId === separatorRegionId) {
					return false;
				} else if (regionId === objForbiddenRegionId) {
					TRP_CORE.uniquePush(proc.objForbiddenIdxes, nIdx);
				}

				return true;
			});
		}

		/* baseIdxes
		===================================*/
		proc.allBaseIdxes = [];
		for (const roomIdxes of proc.allRoomIdxes) {
			var roomBaseIdxes = [];
			proc.allBaseIdxes.push(roomBaseIdxes);
			for (var btIdx = baseTileIds.length - 1; btIdx >= 0; btIdx = (btIdx - 1) | 0) {
				roomBaseIdxes.push([]);
			}

			for (const idx of roomIdxes) {
				var tileId = baseTileId(data[idx]);
				if (!tileId) continue;

				var baseIdx = baseTileIds.indexOf(tileId);
				if (baseIdx >= 0) {
					roomBaseIdxes[baseIdx].push(idx);
					continue;
				}
				for (var baseIdx = allInfo.length - 1; baseIdx >= 0; baseIdx = (baseIdx - 1) | 0) {
					var tempInfo = allInfo[baseIdx];
					if (tileId === tempInfo.criffTopBaseId || tileId === tempInfo.criffTopSubId) {
						roomBaseIdxes[baseIdx].push(idx);
						break;
					}
				}
			}
		};


		if (proc.allRoomIdxes.length === 0) {
			_Dev.throwError('部屋が検出できませんでした。');
		}
	};




	//=============================================================================
	// MODE: roomSelect
	//=============================================================================
	MapDecorator.MODE_GUIDE.roomSelect = [
		'【編集対象の部屋を選択】',
		'左クリ:部屋を選択',
		'右クリ/Esc:キャンセル',
		'※完成マップに部屋を追加する際に使用',
		'※部屋を完全に境界リージョンIDで囲っておくこと',
	];


	MapDecorator.startRoomSelect = function () {
		if (proc.allRoomIdxes.length <= 1) {
			SoundManager.playBuzzer();
			confirm('部屋が１つしかないか、すでに編集対象の部屋を指定済みです。')
			return;
		}
		this.setMode('roomSelect');
	};


	var invalidIdxes = null;
	MapDecorator.onMouseDownLeftRoomSelect = function (event, roomId, x, y, tx, ty) {
		if (roomId < 0) {
			SoundManager.playBuzzer();
			return;
		}


		//search invalidIdxes by regionId
		var separatorRegionId = Number(parameters.roomSeparatorRegionId) || -1;
		var idxes = proc.allRoomIdxes[roomId];
		for (var i = idxes.length - 1; i >= 0; i = (i - 1) | 0) {
			var idx = idxes[i];
			var sx = idx % width;
			var sy = Math.floor(idx / width);
			analyzeNeighbors(sx, sy, (nx, ny, ox, oy) => {
				var nIdx = nx + ny * width;
				if (idx !== nIdx && idxes.contains(nIdx)) return false;

				var oRegionId = data[ox + oy * width + zRegion];
				if (oRegionId === separatorRegionId) {
					//origin:separator -> only allow neighbor:sepearator
					if (data[nIdx + zRegion] !== separatorRegionId) {
						return false;
					}
				}
				idxes.push(nIdx);
				return true;
			});
		}

		invalidIdxes = [];
		for (var i = 0; i < zLayerSize; i = (i + 1) | 0) {
			if (!idxes.contains(i)) {
				invalidIdxes.push(i);
			}
		}

		SoundManager.playOk();
		this.restoreMode();
		this.initProc();


		if (confirm('自動補完をやり直しますか？')) {
			this.reloadMapData(true);
			this.analyzeAll();
			this.executeBeforeProcess();
		}
	};

	MapDecorator.onMouseDownRightRoomSelect = function (event, roomId, x, y, tx, ty) {
		SoundManager.playCancel();
		this.restoreMode();
	};
	MapDecorator.updateInputRoomSelect = function () {
		if (Input.isTriggered('cancel')) {
			SoundManager.playCancel();
			this.restoreMode();
			return true;
		} else {
			return false;
		}
	};





	//=============================================================================
	// MODE: paintFloor
	//=============================================================================
	MapDecorator.MODE_GUIDE.paintFloor = [
		'【床装飾ペイントモード】',
		'左クリ:再抽選',
		'右クリ@部屋:確定！',
		'Shift+左クリ@部屋:装飾種類をロック',
		'Ctrl+右クリ@部屋:水場ロック',

	];
	MapDecorator.onMouseDownLeftPaintFloor = function (event, i, x, y, tx, ty, dx, dy) {
		if (Input.isPressed('control')) {
			if (this.tryStartManualLocateMode(event, i, x, y, tx, ty, dx, dy)) {
				//manual loc
			} else {
				this.tryStartManualPaintMode(event, i, x, y, tx, ty);
			}
		} else if (Input.isPressed('shift')) {
			//pattern lock
			if (i < 0) {
				SoundManager.playBuzzer();
				return;
			}
			if (proc.lockedFloorVariations[i]) {
				proc.lockedFloorVariations[i] = null;
				showInfoText('装飾種類をロック解除');
				SoundManager.playCancel();
			} else {
				proc.lockedFloorVariations[i] = proc.lastFloorVariations[i];
				showInfoText('装飾種類をロック！');
				SoundManager.playOk();
			}
		} else {
			//repaint
			this.paintFloors();
			SoundManager.playCursor();
		}
	};
	MapDecorator.onMouseDownMiddlePaintFloor = function (event, i, x, y, tx, ty) {
	};
	MapDecorator.onMouseDownRightPaintFloor = function (event, i, x, y, tx, ty) {
		if (i < 0) {
			SoundManager.playBuzzer();
			return;
		}
		if (Input.isPressed('control')) {
			//water lock
			if (i < 0) {
				SoundManager.playBuzzer();
				return;
			}
			if (proc.lockedFloorPaintRoomIds.contains(i)) {
				this.tryShowObjectPalette();
			} else if (proc.lockedWaterRoomIds.contains(i)) {
				TRP_CORE.remove(proc.lockedWaterRoomIds, i);
				showInfoText('水場ロック解除');
				SoundManager.playCancel();
			} else {
				proc.lockedWaterRoomIds.push(i);
				showInfoText('水場ロック！');
				SoundManager.playOk();
			}
		} else if (Input.isPressed('shift')) {
			this.tryUnlockRoomState(i);
		} else if (proc.lockedFloorPaintRoomIds.contains(i)) {
			SoundManager.playBuzzer();
			// this.tryUnlockRoomState(i);
		} else {
			//paint lock
			TRP_CORE.uniquePush(proc.lockedFloorPaintRoomIds, i);
			TRP_CORE.uniquePush(proc.lockedWaterRoomIds, i);

			SoundManager.playOk();
			showInfoText('装飾ロック！');
			this.setMode('locateObject');
		}
	};
	MapDecorator.tryUnlockRoomState = function (i) {
		if (proc.lockedObjRoomIds.contains(i)) {
			TRP_CORE.remove(proc.lockedObjRoomIds, i);
			this.clearLastObjects(i);
			showInfoText('オブジェロック解除');
			SoundManager.playCancel();

			this.setMode('locateObject')
			this.restoreMap();
		} else if (proc.lockedFloorPaintRoomIds.contains(i)) {
			TRP_CORE.remove(proc.lockedFloorPaintRoomIds, i);
			TRP_CORE.remove(proc.lockedWaterRoomIds, i);
			proc.lastFloorPaintInfoArr[i] = null;
			proc.lastWaterInfoArr[i] = null;
			this.clearLastObjects(i);
			SoundManager.playCancel();

			showInfoText('装飾ロック解除');
			this.setMode('paintFloor');

			this.restoreMap();
		} else {
			SoundManager.playBuzzer();
		}
	}


	MapDecorator.paintFloors = function () {
		//clear not locked paint info
		var length = proc.allRoomIdxes.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			if (!proc.lockedFloorPaintRoomIds.contains(i)) {
				proc.lastFloorPaintInfoArr[i] = [];
			}

			if (!proc.lockedWaterRoomIds.contains(i)) {
				proc.lastWaterInfoArr[i] = [];
				proc.waterAccIdxes[i] = [];
			}
		};

		//restore map
		if (proc.oncePaintFloor) {
			this.restoreMap();
		}

		//paint floors
		proc.waterIdxes = [];
		proc.oncePaintFloor = true;

		var length = proc.allRoomIdxes.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			if (proc.lockedFloorPaintRoomIds.contains(i)) continue;

			var validIdxes = proc.allRoomIdxes[i];
			if (proc.criffIdxes) {
				validIdxes = validIdxes.concat();
				TRP_CORE.removeArray(validIdxes, proc.criffIdxes);
			}
			for (const baseInfo of allInfo) {
				this.changeBaseInfo(baseInfo);
				this.paintFloorWithRoom(validIdxes, i);
			}
		}
	};


	MapDecorator.paintFloorWithRoom = function (validIdxes, roomId) {
		/* analyze manual water locate
		===================================*/
		var waterInfo = proc.lastWaterInfoArr[roomId];
		var manualWaterLocate = this.analyzeManualWaterLocate(validIdxes, roomId);


		/* analyze floorIdxes
		===================================*/
		var targetIds = [info.floorBaseId];
		var floorIdxes = validIdxes.filter(idx => {
			var tileId = data[idx];
			if (!tileId) return false;
			tileId = baseTileId(tileId)

			return targetIds.contains(tileId);
		});


		/* draw paint WaterTiles
		===================================*/
		if (!manualWaterLocate) {
			this._paintWaterFloors(validIdxes, roomId, floorIdxes);
		}


		/* draw floor paint variations
		===================================*/
		this._paintFloors(validIdxes, roomId, floorIdxes);


		/* adjust autotile shape
		===================================*/
		for (var i = floorIdxes.length - 1; i >= 0; i = (i - 1) | 0) {
			var idx = floorIdxes[i];
			var tileId = baseTileId(data[idx]);
			if (tileId && tileId !== info.criffTopBaseId && tileId !== info.criffTopSubId) {
				data[idx] = connectAutoTileWithIdx(idx);
			}

			idx += zAcc;
			data[idx] = connectAutoTileWithIdx(idx);
		}


		/* save paint cache
		===================================*/
		var paintInfo = proc.lastFloorPaintInfoArr[roomId];
		for (const idx of validIdxes) {
			paintInfo.push(idx);
			paintInfo.push(data[idx]);
			paintInfo.push(data[idx + zAcc]);
		}

		this.requestRefreshTilemap();
	};

	MapDecorator.requestRefreshTilemap = function () {
		SceneManager._scene._spriteset._tilemap._needsRepaint = true;
	};


	MapDecorator.analyzeManualWaterLocate = function (validIdxes, roomId) {
		var waterInfo = proc.lastWaterInfoArr[roomId];
		var hasManualLocate = false;
		if (waterInfo.length) {
			waterInfo = null;
		}
		for (const idx of validIdxes) {
			var tileId = baseTileId(data[idx]);
			if (tileId === info.waterBaseId) {
				hasManualLocate = true;

				if (!waterInfo) {
					break;
				}
				waterInfo.push(idx);
				waterInfo.push(data[idx]);
				waterInfo.push(data[idx + zAcc]);
			}
		}
		return hasManualLocate;
	};

	MapDecorator._paintWaterFloors = function (validIdxes, roomId, floorIdxes) {
		if (!info.waterBaseId) return;

		var waterInfo = proc.lastWaterInfoArr[roomId];


		/* try locate
		===================================*/
		var waterLocate = false;
		if (SETTING.waterLocateMode < 0) {
			waterLocate = Math.random() <= SETTING.waterLocateRate;
		} else {
			waterLocate = SETTING.waterLocateMode > 0;
		}

		if (proc.lockedWaterRoomIds.contains(roomId)) {
			//locate on restoreMap
		} else if (waterLocate) {
			//paint water base
			var variationIds = [info.waterBaseId];

			var waterPaintRate = SETTING.waterPaintRate;
			waterPaintRate *= TRP_CORE.randomRateWithRange(SETTING.rateRange);
			waterPaintRate = waterPaintRate.clamp(0, 1);

			var paintNum = Math.ceil(floorIdxes.length * waterPaintRate);
			var chankMin = SETTING.waterChankMin;
			var chankMax = SETTING.waterChankMax;

			var validWaterIdxes = validIdxes.concat();
			TRP_CORE.removeArray(validWaterIdxes, proc.passIdxes);
			var waterIdxes = this.paintChank(variationIds, paintNum, chankMin, chankMax, validWaterIdxes);
			proc.waterIdxes = proc.waterIdxes.concat(waterIdxes);

			//paint water accessory
			variationIds = info.waterAccIds;
			if (variationIds && variationIds.length) {
				var waterAccPaintRate = SETTING.waterAccPaintRate;
				waterAccPaintRate *= TRP_CORE.randomRateWithRange(SETTING.rateRange);
				waterAccPaintRate = waterAccPaintRate.clamp(0, 1);

				paintNum = Math.ceil(waterIdxes.length * waterAccPaintRate);
				chankMin = SETTING.waterPaintChankMin;
				chankMax = SETTING.waterPaintChankMax;
				var waterAccIdxes = this.paintChank(variationIds, paintNum, chankMin, chankMax, waterIdxes, info.waterBaseId);
				if (waterAccIdxes) {
					proc.waterAccIdxes[roomId] = proc.waterAccIdxes[roomId].concat(waterAccIdxes);
				}
			}

			//supply B-ceiling to water
			var bCeilingWaters = [];
			for (const idx of waterIdxes) {
				for (var d = 0; d < 3; d = (d + 1) | 0) {
					var dir = d === 0 ? width : (d === 1 ? -1 : 1);
					if (proc.ceilingIdxes.contains(idx + dir)) {
						if (allFloorLevelTileIds.contains(baseTileId(data[idx + dir])) && data[idx + dir + zObj1]) {
							data[idx + dir] = info.waterBaseId;
							bCeilingWaters.push(idx + dir);
						}
					}
				}
			}
			waterIdxes = waterIdxes.concat(bCeilingWaters);
			bCeilingWaters = null;


			/* adjust autotile shape
			===================================*/
			TRP_CORE.removeArray(floorIdxes, waterIdxes);
			for (var i = waterIdxes.length - 1; i >= 0; i = (i - 1) | 0) {
				var idx = waterIdxes[i];
				var connectEmpty = 2;
				data[idx] = connectAutoTileWithIdx(idx, connectEmpty);
				data[idx + zAcc] = connectAutoTileWithIdx(idx + zAcc);

				waterInfo.push(idx);
				waterInfo.push(data[idx]);
				waterInfo.push(data[idx + zAcc]);
			}
		}
	};

	MapDecorator._paintFloors = function (validIdxes, roomId, floorIdxes) {
		var baseId = info.floorBaseId;

		var paintRate = SETTING.floorPaintRate;
		paintRate *= TRP_CORE.randomRateWithRange(SETTING.rateRange);
		paintRate = paintRate.clamp(0, 1);


		var variationIds;
		floorIdxes = floorIdxes.concat();
		TRP_CORE.removeArray(floorIdxes, proc.waterIdxes);

		var paintNum = Math.ceil(floorIdxes.length * paintRate);
		var chankMin = SETTING.floorPaintChankMin;
		var chankMax = SETTING.floorPaintChankMax;

		if (proc.lockedFloorVariations[roomId]) {
			variationIds = proc.lockedFloorVariations[roomId];
		} else {
			var variationNum;
			if (SETTING.floorPaintPatternNum >= 0) {
				variationNum = SETTING.floorPaintPatternNum
			} else {
				variationNum = 1;
				for (var pi = 2; ; pi = (pi + 1) | 0) {
					var threshold = SETTING.floorPaintPatternsWithTiles[pi - 1];
					if (threshold === undefined) break;

					if (floorIdxes.length >= threshold) {
						variationNum = pi;
					} else {
						break;
					}
				}
			}
			variationIds = [];

			var candidates = info.floorVariationIds.concat()
			for (; variationNum > 0 && candidates.length;) {
				if (TRP_CORE.uniquePush(variationIds, TRP_CORE.randomShift(candidates))) {
					variationNum -= 1;
				}
			}

			//add floor fix variation tiles
			if (info.floorFixVariationIds && info.floorFixVariationIds.length) {
				//adjust draw rate
				var chankAve = Math.ceil((chankMin + chankMax) / 2);
				var srcVariationIds = variationIds.concat();
				for (var i = chankAve - 1 - 1; i >= 0; i = (i - 1) | 0) {
					variationIds = variationIds.concat(srcVariationIds);
				}
				variationIds = variationIds.concat(info.floorFixVariationIds);
			}

			proc.lastFloorVariations[roomId] = variationIds;
		}

		var paintedIdxes;
		if (variationIds.length > 0) {
			paintedIdxes = this.paintChank(variationIds, paintNum, chankMin, chankMax, floorIdxes);
		} else {
			paintedIdxes = [];
		}
		return paintedIdxes;
	}



	/* helper
	===================================*/
	MapDecorator.paintChank = function (variationIds, paintNum, chankMin, chankMax, idxPool, targetBaseId = info.floorBaseId) {
		if (!Array.isArray(variationIds)) {
			_Dev.throwError('invalid variationIds', variationIds);
		}

		var painted = [];//result
		var current = [];
		var next = [];
		var checked = [];
		var dirs = [width, width - 1, -1, -1 - width, -width, -width + 1, 1, 1 + width];
		var paintTileId;
		var noOverwrap = true;

		idxPool = idxPool.concat();
		for (var pi = 0/*<paintIdx>*/; paintNum >= chankMin; pi = (pi + 1) | 0) {
			if (idxPool.length === 0) break;

			var idx = TRP_CORE.randomShift(idxPool);
			if (noOverwrap) {
				if (baseTileId(data[idx]) !== targetBaseId || baseTileId(data[idx + zAcc])) continue;
			} else {
				if (baseTileId(data[idx]) !== targetBaseId && baseTileId(data[idx + zAcc])) continue;
			}


			//draw paintTileId
			TRP_CORE.shuffle(variationIds);

			var kind, isAccesory;
			for (var vi = variationIds.length - 1; vi >= 0; vi = (vi - 1) | 0) {
				paintTileId = variationIds[vi];

				if (Tilemap.isAutotile(paintTileId)) {
					kind = Tilemap.getAutotileKind(paintTileId);
					if (Tilemap.isTileA1(paintTileId)) {
						isAccesory = kind >= 1 && kind <= 3;
					} else {
						isAccesory = Math.floor(kind / 4) % 2 === 1;
					}

					if (noOverwrap) {
						break;
					} else if (isAccesory) {
						if (!data[idx + zAcc]) {
							break;
						}
					} else {
						if (baseTileId(data[idx]) === targetBaseId) break;
					}
				} else {
					//simple fix-variation tile
					if (baseTileId(data[idx]) !== targetBaseId) continue;
					if (noOverwrap && data[idx + zAcc]) continue;
					break;
				}
			}

			painted.push(idx);

			//paint if simple fix variation tile
			if (!Tilemap.isAutotile(paintTileId)) {
				data[idx] = paintTileId;
				paintNum -= 1;
				continue;
			}

			if (isAccesory) {
				data[idx + zAcc] = paintTileId;
			} else {
				data[idx] = paintTileId;
			}


			checked.length = 0;
			current.length = 0;
			next.length = 0;
			next.push(idx);


			//draw chank
			var num = chankMin + Math.randomInt(chankMax - chankMin + 1);
			num = num.clamp(0, paintNum);

			while (next.length && num > 0) {
				var temp = TRP_CORE.prepareArray(current);
				current = next;
				next = temp;

				for (const idx of current) {
					var di0 = 2 * Math.randomInt(4);
					var baseDi = -1;
					for (var di = 0; di < 8; di = (di + 1) | 0) {
						var dirIdx = (di0 + di) % 8;

						if (baseDi < 0) {
							if (dirIdx % 2 === 1) {
								//opposite
								continue
							}
						} else {
							if (dirIdx > baseDi + 2) {
								break;
							}
						}

						var dir = dirs[dirIdx];
						var neighbor = idx + dir;

						if (checked.contains(neighbor)) continue;
						checked.push(neighbor);
						if (!idxPool.contains(neighbor)) continue;

						//check already paint with same type tile
						if (noOverwrap) {
							if (baseTileId(data[neighbor]) !== targetBaseId || baseTileId(data[neighbor + zAcc])) continue;
							if (isAccesory) {
								data[neighbor + zAcc] = paintTileId;
							} else {
								data[neighbor] = paintTileId;
							}
						} else if (!isAccesory) {
							if (baseTileId(data[neighbor]) !== targetBaseId) continue;
							data[neighbor] = paintTileId;
						} else {//isAccc
							if (data[neighbor + zAcc]) continue;
							data[neighbor + zAcc] = paintTileId;
						}

						baseDi = di;
						next.push(neighbor);
						painted.push(neighbor);
						num -= 1;
						paintNum -= 1;

						if (num <= 0) break;
					}
					if (num <= 0) break;
				}
			}
		}

		return painted;
	};











	//=============================================================================
	// MODE: LocateObject
	//=============================================================================
	MapDecorator.MODE_GUIDE.locateObject = [
		'【オブジェクト配置モード】',
		'左クリ:再配置',
		'右クリ@部屋:確定！',
		'Shift+右クリ@部屋:ロック解除',
		'Ctrl+左クリ:オブジェ手動調整<スポイト>',
		'Ctrl+右クリ:オブジェクトパレット',
	];
	MapDecorator.onMouseDownLeftLocateObject = function (event, i, x, y, tx, ty, dx, dy) {
		if (Input.isPressed('control')) {
			if (this.tryStartManualLocateMode(event, i, x, y, tx, ty, dx, dy)) {
				return;
			}
			// if(proc.lastObjInfoArr && proc.lastObjInfoArr[i]){
			// 	SoundManager.playBuzzer();
			// }else{
			this.tryStartManualPaintMode(event, i, x, y, tx, ty);
			// }
		} else if (Input.isPressed('shift')) {

		} else {
			//relocate
			this.locateObjects();
			SoundManager.playCursor();
		}
	};
	MapDecorator.onMouseDownMiddleLocateObject = function (event, i, x, y, tx, ty) {
	};
	MapDecorator.onMouseDownRightLocateObject = function (event, i, x, y, tx, ty) {
		if (i < 0) {
			SoundManager.playBuzzer();
			return;
		}

		if (Input.isPressed('shift')) {
			//try back to paintFloor
			this.tryUnlockRoomState(i);
		} else if (Input.isPressed('control')) {
			this.tryShowObjectPalette();
		} else if (proc.lockedObjRoomIds.contains(i)) {
			SoundManager.playBuzzer();
		} else if (!proc.lockedFloorPaintRoomIds.contains(i)) {
			//not lock floor paint yet
			SoundManager.playBuzzer();
		} else {
			//object lock
			TRP_CORE.uniquePush(proc.lockedObjRoomIds, i);
			TRP_CORE.uniquePush(proc.lockedFloorPaintRoomIds, i);
			TRP_CORE.uniquePush(proc.lockedWaterRoomIds, i);
			showInfoText('オブジェロック！');
			SoundManager.playOk();

			this.setMode('paintFloor')
		}
	};

	MapDecorator.locateObjects = function () {
		//restore map

		var length = proc.allRoomIdxes.length;
		if (proc.locateObj) {
			this.restoreMap();
		} else {
			for (var i = 0; i < length; i = (i + 1) | 0) {
				if (!proc.lockedObjRoomIds.contains(i)) {
					proc.lastObjInfoArr[i] = [];
				}
			}
		}
		proc.locateObj = true;


		//locate objects
		for (var i = 0; i < length; i = (i + 1) | 0) {
			if (proc.lockedObjRoomIds.contains(i)) continue;
			if (!proc.lockedFloorPaintRoomIds.contains(i)) continue;

			var validIdxes = proc.allRoomIdxes[i];
			var roomId = i;

			validIdxes = validIdxes.concat();

			TRP_CORE.removeArray(validIdxes, proc.objForbiddenIdxes);
			TRP_CORE.removeArray(validIdxes, proc.passIdxes);

			var baseIdx = 0;
			var roomBaseIdxes = proc.allBaseIdxes[i];
			for (const baseInfo of allInfo) {
				this.changeBaseInfo(baseInfo);

				var baseIdxes = roomBaseIdxes[baseIdx++].concat();
				TRP_CORE.removeArray(baseIdxes, proc.objForbiddenIdxes);
				TRP_CORE.removeArray(baseIdxes, proc.passIdxes);

				this.locateObjectsWithRoom(validIdxes, roomId, baseIdxes);
			}
		}
	};

	MapDecorator.locateObjectsWithRoom = function (validIdxes, roomId, baseIdxes) {
		var types = ['base'];

		/* prepare accIdxes
		===================================*/
		var accIds = info.separateLocateObjAccIds;
		var accIdxes = {};
		for (const accId of accIds) {
			accIdxes[accId] = this.prepareAccIdxesForLocateObject(baseIdxes, accId);
			types.push(accId);
		}


		/* prepare waterIdxes
		===================================*/
		var waterInfoArr = proc.lastWaterInfoArr[roomId];
		var waterIdxes = null;
		if (waterInfoArr) {
			waterIdxes = prepareWaterIdxesForLocateObject(baseIdxes, waterInfoArr, proc.waterAccIdxes[roomId]);
			types.push('water');
		}


		/* locate objects
		===================================*/
		var targetIdxes, rate, objIds, floorBaseId, bigObjIds, bigRate;
		var objInfo = [];
		var maxObjInfo = objInfo;
		var typeLen = types.length;
		for (var typeIdx = 0; typeIdx < typeLen; typeIdx = (typeIdx + 1) | 0) {
			var type = types[typeIdx];
			if (type === 'base') {
				//floor
				targetIdxes = baseIdxes;
				rate = SETTING.floorObjRate;
				bigRate = SETTING.floorBigObjRate;
				objIds = info.objIds;
				bigObjIds = info.bigObjIds;
				floorBaseId = info.floorBaseId;
			} else if (type === 'water') {
				//water
				targetIdxes = waterIdxes;
				if (!targetIdxes || targetIdxes.length === 0) continue;

				rate = SETTING.waterObjRate;
				bigRate = SETTING.waterBigRate;
				objIds = info.waterObjIds;
				bigObjIds = info.waterBigObjIds;
				floorBaseId = info.waterBaseId;
			} else {
				//accessory
				floorBaseId = Number(type);
				targetIdxes = accIdxes[floorBaseId];

				var accInfo = info.accSettings[floorBaseId];
				rate = SETTING.floorObjRate * accInfo.objRate;
				bigRate = SETTING.floorBigObjRate * accInfo.bigObjRate;
				objIds = accInfo.objIds;
				bigObjIds = accInfo.bigObjIds;
			}



			var maximizeTryNum = SETTING.maximizeObjRateTryNum || 1;
			var doMazimize = SETTING.maximizeObjRateTryNum >= 1;
			var srcTargetIdxes = targetIdxes;
			var minLeftTargetIdxesNum = Number.MAX_SAFE_INTEGER;
			var srcObjInfo = objInfo;
			var srcBigObjIds = bigObjIds;

			var floorLen = targetIdxes.length;

			if (!doMazimize) {
				rate *= TRP_CORE.randomRateWithRange(0.3);
				bigRate *= TRP_CORE.randomRateWithRange(0.3);
			}
			var objNum = TRP_CORE.randomRound(rate * floorLen);

			var bigObjNum = TRP_CORE.randomRound(bigRate * floorLen);

			if (!objIds || objIds.length === 0) objNum = 0;
			if (!bigObjIds || bigObjIds.length === 0) bigObjNum = 0;


			for (var tryIdx = maximizeTryNum - 1; tryIdx >= 0; tryIdx = (tryIdx - 1) | 0) {
				objInfo = srcObjInfo.concat();
				targetIdxes = srcTargetIdxes.concat();
				TRP_CORE.shuffle(targetIdxes);


				/* locate obj
				===================================*/
				var idx;
				for (var i = objNum - 1; i >= 0; i = (i - 1) | 0) {
					var tileIds = TRP_CORE.random(objIds);
					var tileId = tileIds[0];
					idx = -1;
					if (Tilemap.isTileA5(tileId)) {
						for (const tempIdx of targetIdxes) {
							if (data[tempIdx] !== floorBaseId && data[tempIdx + zAcc] !== floorBaseId) {
								idx = tempIdx;
								break;
							}
						}
					} else {
						idx = TRP_CORE.random(targetIdxes);
					}
					if (idx >= 0 && idx !== null) {
						if (!Array.isArray(tileIds)) {
							tileIds = tileIds.copy(true);
						}
						TRP_CORE.remove(targetIdxes, idx);
						objInfo.push([idx, tileIds]);
					}
				}


				/* locate bigObj
				===================================*/
				var locateInfo = [];
				if (doMazimize) {
					bigObjIds = srcBigObjIds.concat();
					TRP_CORE.shuffle(bigObjIds);
				}

				var locateSuccess = false;
				for (var i = bigObjNum - 1; i >= 0; i -= 1) {
					var bigObjInfo;
					if (doMazimize) {
						if (locateSuccess || bigObjIds.length === 0) {
							bigObjIds = srcBigObjIds.concat();
							TRP_CORE.shuffle(bigObjIds);
						} else {
							if (i < bigObjNum - 1) {
								i += 1;
							}
						}
						bigObjInfo = bigObjIds.pop();
					} else {
						bigObjInfo = TRP_CORE.random(bigObjIds);
					}
					var bigObj = bigObjInfo[0];
					var onFloorFlags = bigObjInfo[1];
					var bigMapObject = !Array.isArray(bigObj) ? bigObj.copy(true) : null;

					var w = onFloorFlags.length;
					var h = onFloorFlags[0].length;

					locateSuccess = false;
					for (var ti = 0; ti < targetIdxes.length; ti = (ti + 1) | 0) {
						locateInfo.length = 0;

						/* check bigObj locatable
						===================================*/
						var baseIdx = targetIdxes[ti];
						var locateFailed = false;
						var floorZ = Number.MAX_SAFE_INTEGER;
						for (var dx = 0; dx < w; dx = (dx + 1) | 0) {
							for (var dy = 0; dy < h; dy = (dy + 1) | 0) {
								var idx = baseIdx + dx - dy * width;
								var tileIds = bigMapObject ? null : bigObj[dx][h - 1 - dy];
								var onFloor = onFloorFlags[dx][h - 1 - dy];

								if (!bigMapObject && !tileIds) continue;

								if (onFloor) {
									//check is floor
									if (!targetIdxes.contains(idx)) {
										locateFailed = true;
										break;
									}
									//check all floor z same
									if (floorZ === Number.MAX_SAFE_INTEGER) {
										floorZ = proc.zMap[idx];
									} else if (floorZ !== proc.zMap[idx]) {
										locateFailed = true;
										break;
									}
								}
								locateInfo.push(idx);
								locateInfo.push(tileIds);
								locateInfo.push(onFloor);
							}
							if (locateFailed) break;
						}
						if (locateFailed) continue;

						//add objInfo to locate
						objInfo.push([baseIdx - (h - 1) * width, bigMapObject || bigObj]);

						//remove target idxes
						var baseY = Math.floor(baseIdx / width);
						for (var li = 0; li < locateInfo.length; li = (li + 3) | 0) {
							var idx = locateInfo[li];
							var tileIds = locateInfo[li + 1];
							var onFloor = locateInfo[li + 2];

							if (onFloor) {
								TRP_CORE.remove(targetIdxes, idx);
							}
						}

						locateSuccess = true;
						i -= (locateInfo.length / 3);
						break;
					}
				}

				/* calc packRate
				===================================*/
				var leftNum = targetIdxes.length;
				if (leftNum < minLeftTargetIdxesNum) {
					minLeftTargetIdxesNum = leftNum;
					maxObjInfo = objInfo;
				}
			}
			objInfo = maxObjInfo;
		}

		//sort by "y"
		proc.lastObjInfoArr[roomId] = proc.lastObjInfoArr[roomId].concat(
			objInfo.sort((a, b) => {
				return a[0] - b[0];
			})
		);

		//apply add objects
		addObjTilesWithObjInfoArr(objInfo);
		this.requestRefreshTilemap();

		if (MapObject) {
			MapObject.refreshCollisions();
		}
	};

	MapDecorator.prepareAccIdxesForLocateObject = function (validIdxes, accId) {
		var idxes = [];
		for (var i = validIdxes.length - 1; i >= 0; i = (i - 1) | 0) {
			var idx = validIdxes[i];
			if (baseTileId(data[idx]) === accId
				|| baseTileId([data[idx + zAcc]]) === accId
			) {
				idxes.unshift(idx);
				validIdxes.splice(i, 1);
			}
		}
		return idxes;
	};

	function prepareWaterIdxesForLocateObject(validIdxes, waterInfoArr, waterAccIdxes) {
		var length = waterInfoArr.length;
		var tempIdxes = [];
		for (var i = 0; i < length; i = (i + 3) | 0) {
			tempIdxes.push(waterInfoArr[i])
		}
		TRP_CORE.removeArray(validIdxes, tempIdxes);


		//filter linkNum=4
		var dirs = [-width, -1, 1, width];
		var waterIdxes = [];
		for (var i = tempIdxes.length - 1; i >= 0; i = (i - 1) | 0) {
			var idx = tempIdxes[i];
			waterIdxes.push(idx);

			if (SETTING.waterObjOnEdge) {
				for (const dir of dirs) {
					if (!tempIdxes.contains(idx + dir)) {
						waterIdxes.pop();
						break;
					}
				}
			}
		}
		TRP_CORE.removeArray(waterIdxes, waterAccIdxes);

		return waterIdxes;
	};

	function addObjTilesWithObjInfoArr(objInfoArr) {
		var infoLen = objInfoArr.length;
		for (var i = 0; i < infoLen; i = (i + 1) | 0) {
			var objInfo = objInfoArr[i];
			var idx = objInfo[0];
			var obj = objInfo[1];
			var exData = objInfo.length > 2 ? objInfo.slice(2) : null;

			if (Array.isArray(obj[0])) {
				//bigObj
				var cols = obj.length;
				for (var dx = 0; dx < cols; dx = (dx + 1) | 0) {
					var col = obj[dx];
					var rows = col.length;
					for (var dy = 0; dy < rows; dy = (dy + 1) | 0) {
						var tileIds = col[dy];
						if (!tileIds) continue;

						addObjTiles(data, idx + dx + dy * width, tileIds, exData);
					}
				}
			} else {
				var tileIds = obj;
				addObjTiles(data, idx, tileIds, exData);
			}
		}
	}

	function addObjTiles(data, idx, tileIds, exData = null) {
		if (!Array.isArray(tileIds)) {
			//trpMapObject
			if (MapObject && tileIds instanceof MapObject) {
				addMapObject(tileIds, idx, exData);
			}
			return;
		}

		for (const tileId of tileIds) {
			addObjTile(data, idx, tileId);
		}
	};
	function addMapObject(mapObj, idx, exData = null) {
		MapObject.tryAdd(mapObj, true);
		if (TRP_CORE.uniquePush(mapObjects, mapObj)) {
			var x = idx % width + 0.5;
			var y = Math.floor(idx / width) + 1;

			if (mapObj.tileId) {
				x += (mapObj.tileW - 1) / 2;
				y += (mapObj.tileH - 1);
			}
			mapObj.x = x * tileW;
			mapObj.y = y * tileH;
			if (exData) {
				mapObj.x += exData[0];
				mapObj.y += exData[1];
			}
		}
	};

	function addObjTile(data, idx, tileId) {
		if (isTileAnyA(tileId)) {
			return addObjTileA(data, idx, tileId);
		}

		if (data[idx + zObj2]) {
			if (data[idx + zObj1]) {
				if (data[idx + zAcc]) {
					return false;
				}
				data[idx + zAcc] = data[idx + zObj1];
			}
			data[idx + zObj1] = data[idx + zObj2];
		}
		data[idx + zObj2] = tileId;

		return true;
	};
	function addObjTileA(data, idx, tileId) {
		data[idx + zObj2] = 0;
		data[idx + zObj1] = 0;
		data[idx + zAcc] = 0;
		data[idx] = tileId;

		return true;
	};
	function isTileAnyA(tileId) {
		return Tilemap.isTileA1(tileId) || Tilemap.isTileA2(tileId) || Tilemap.isTileA3(tileId) || Tilemap.isTileA4(tileId) || Tilemap.isTileA5(tileId);
	};

	function unshiftObjTileA(data, idx, tileId) {
		if (data[idx]) {
			if (data[idx + zAcc]) {
				if (data[idx + zObj1]) {
					if (data[idx + zObj2]) {
						return false;
					}
					data[idx + zObj2] = data[idx + zObj1];
				}
				data[idx + zObj1] = data[idx + zAcc];
			}
			data[idx + zAcc] = data[idx];
		}
		data[idx] = tileId;
	};



	//=============================================================================
	// MODE: ManualPaint
	//=============================================================================
	MapDecorator.clearManualPaintInfo = function () {
		this.paintTileId = 0;
		this.paintAccLayer = false;
		this.paintWater = false;
		this.lastPaintIdx = -1;
		this.paintErasing = false;
	}
	MapDecorator.tryStartManualPaintMode = function (event, roomId, x, y, tx, ty) {
		var paintTileId = 0;
		var paintAccLayer = false;
		var obj = null;
		var idx = x + y * width;
		for (var z = 1; z >= 0; z = (z - 1) | 0) {
			var tileId = baseTileId(data[z * zLayerSize + idx]);
			if (!tileId) continue;
			if (baseTileIds.contains(tileId)) continue;
			if (this.isWallTile(tileId)) continue;
			if (this.isCeilingTile(tileId)) continue;

			if (z <= 1) {
				paintTileId = tileId;
				paintAccLayer = z === 1;
			}
			break;
		}
		if (!paintTileId) {
			SoundManager.playBuzzer();
			return;
		}

		this.setMode('manualPaint');
		this.paintTileId = paintTileId;
		this.paintAccLayer = paintAccLayer;
		this.paintWater = Tilemap.isWaterTile(paintTileId) || (proc.waterIdxes && proc.waterIdxes.contains(idx));
		this.lastPaintIdx = idx;
		SoundManager.playCursor();
	};

	MapDecorator.MODE_GUIDE.manualPaint = [
		'【手動ペイントモード】',
		'左クリ:塗り/消去',
		'右クリ:終了',
		'Ctrl+左クリ:タイル選択(スポイト)',
		'Ctrl+右クリ:チャンク消去',
	];
	MapDecorator.onMousePressManualPaint = function (event, roomId, x, y, tx, ty) {
		if (!this.paintTileId) return;
		if (roomId < 0) return;

		if (Input.isPressed('control')) {
		} else if (Input.isPressed('shift')) {
		} else {
			this.processManualPaint(...arguments);
		}
	};
	MapDecorator.onMouseDownLeftManualPaint = function (event, roomId, x, y, tx, ty) {
		if (roomId < 0) return;

		if (Input.isPressed('control')) {
			this.tryStartManualPaintMode(event, roomId, x, y, tx, ty);
		} else {
			this.processManualPaint(event, roomId, x, y, tx, ty);
		}
	};
	MapDecorator.onMouseDownRightManualPaint = function (event, roomId, x, y, tx, ty) {
		if (Input.isPressed('shift')) {

		} else if (Input.isPressed('control')) {
			this.processManualPaintChankDelete(event, roomId, x, y, tx, ty);
		} else {
			SoundManager.playCancel();
			this.restoreMode();
		}
	};

	MapDecorator.processManualPaint = function (event, roomId, x, y, tx, ty) {
		var idx = x + y * width;
		if (this.lastPaintIdx === idx) return;
		var startPainting = this.lastPaintIdx < 0;
		this.lastPaintIdx = idx;

		var isAccLayer = this.paintAccLayer;
		var isWater = this.paintWater;
		var targetWater = Tilemap.isWaterTile(data[idx]) || (proc.waterIdxes && proc.waterIdxes.contains(idx))

		var tileId = this.paintTileId;
		var baseInfoIdx = proc.idxBaseInfoIdxMap[idx] || 0;
		var baseInfo = allInfo[baseInfoIdx];


		/* check target tile or idx valid
		===================================*/
		var failure = false;
		if (proc.wallIdxes.contains(idx)) {
			failure = true;
		} else if (isWater !== targetWater && tileId !== baseInfo.waterBaseId) {
			failure = true;
		} else if (isAccLayer && proc.criffTopIdxes.contains(idx)) {
			//acc && criffTop
			if (criffTopIds.contains(baseTileId(data[zAcc + idx]))) {
				//accLayer:criff -> fail
				failure = true;
			} else {
				//accLayer:free -> ok
			}
		} else if (proc.criffTopIdxes.contains(idx) || proc.criffIdxes.contains(idx)) {
			failure = true;
		}
		if (failure) {
			SoundManager.playBuzzer();
			return;
		}


		/* write tileId
		===================================*/
		var zIdx = isAccLayer ? zAcc : 0;
		var paintId = tileId;
		if (baseTileId(data[idx + zIdx]) === tileId) {
			//erase
			if (startPainting) {
				this.paintErasing = true;
			} else if (!this.paintErasing) {
				return;
			}
			paintId = 0;

			if (isWater && tileId === baseInfo.waterBaseId) {
				isWater = false;
			}
		} else {
			if (startPainting) {
				this.paintErasing = false;
			} else if (this.paintErasing) {
				return;
			}
		}

		var idxes = [idx];
		var waterWrite = isWater !== targetWater;
		this.paintTilesWithIdxes(idxes, isAccLayer, roomId, paintId, isWater, waterWrite)

		SoundManager.playCursor();
	};

	MapDecorator.processManualPaintChankDelete = function (event, roomId, x, y, tx, ty) {
		var idx = x + y * width;
		var isAccLayer = this.paintAccLayer;

		this.lastPaintIdx = idx;
		this.paintErasing = true;


		/* write tileId
		===================================*/
		var zIdx = isAccLayer ? zAcc : 0;
		var tileId = this.paintTileId;
		if (!tileId || baseTileId(data[idx + zIdx]) !== tileId) {
			SoundManager.playBuzzer();
			return;
		}


		//search chank idxes
		var idxes = this.analyzeNeighbors(x, y, (nx, ny, ox, oy) => {
			if (nx === x && ny === y) return true;

			if (proc.zMap[ox + oy * width] !== proc.zMap[nx + ny * width]) return false;
			if (idxOfRoom(nx + ny * width) !== roomId) return false;

			var nIdx = (isAccLayer ? zAcc : 0) + nx + ny * width;
			var nTileId = data[nIdx];
			if (baseTileId(nTileId) !== tileId) return false;

			return true;
		}, true);

		if (idxes.length === 1) {
			var idxes = this.analyzeNeighbors(x, y, (nx, ny, ox, oy) => {
				if (nx === x && ny === y) return true;

				if (proc.zMap[ox + oy * width] !== proc.zMap[nx + ny * width]) return false;
				if (idxOfRoom(nx + ny * width) !== roomId) return false;

				var nIdx = (isAccLayer ? zAcc : 0) + nx + ny * width;
				var nTileId = data[nIdx];
				if (baseTileId(nTileId) !== tileId) return false;

				return true;
			}, true);
		}


		var baseInfoIdx = proc.idxBaseInfoIdxMap[idx] || 0;
		var baseInfo = allInfo[baseInfoIdx];
		var isWater = this.paintWater;
		var waterWrite = this.paintTileId === baseInfo.waterBaseId;
		if (waterWrite) {
			isWater = false;
		}

		this.paintTilesWithIdxes(idxes, isAccLayer, roomId, 0, isWater, waterWrite);
		SoundManager.playCursor();
	};

	MapDecorator.updateManualPaint = function () {
		if (!TouchInput.isPressed() && !TouchInput.isTriggered()) {
			this.lastPaintIdx = -1;
		}
	};


	MapDecorator.paintTilesWithIdxes = function (idxes, isAccLayer, roomId, tileId, isWater = false, waterWrite = false) {
		var zIdx = isAccLayer ? zAcc : 0;

		/* water write
		===================================*/
		proc.lastFloorPaintInfoArr[roomId] = proc.lastFloorPaintInfoArr[roomId] || [];
		proc.lastWaterInfoArr[roomId] = proc.lastWaterInfoArr[roomId] || []
		var paintInfo = proc.lastFloorPaintInfoArr[roomId];
		var waterInfo = proc.lastWaterInfoArr[roomId];
		var srcInfo = isWater ? paintInfo : waterInfo;
		if (waterWrite) {
			//clear all tile
			for (const idx of idxes) {
				data[idx] = 0;
				data[idx + zAcc] = 0;
			}
			//clear paint info
			for (var i = 0; i < srcInfo.length; i = (i + 3) | 0) {
				if (idxes.contains(srcInfo[i])) {
					srcInfo.splice(i, 3);
					i -= 3;
				}
			}

			//remove waterIdxes
			if (!isWater) {
				if (proc.waterIdxes) {
					TRP_CORE.removeArray(proc.waterIdxes, idxes);
				}
				if (proc.waterAccIdxes) {
					TRP_CORE.removeArray(proc.waterAccIdxes, idxes);
				}
			}
		}


		/* write data
		===================================*/
		for (const idx of idxes) {
			var paintId = tileId;
			var baseInfoIdx = proc.idxBaseInfoIdxMap[idx] || 0;
			var baseInfo = allInfo[baseInfoIdx];

			if (zIdx === 0 && !tileId) {
				//clear tile
				paintId = isWater ? (baseInfo.waterBaseId || allInfo[0].waterBaseId) : baseInfo.floorBaseId;
			}
			data[idx + zIdx] = paintId;

			if (isWater) {
				TRP_CORE.uniquePush(proc.waterIdxes, idx);
				if (baseInfo.waterBaseId !== paintId) {
					TRP_CORE.uniquePush(proc.waterAccIdxes, idx);
				}
			}
		}


		/* around tiles
		===================================*/
		//search neighbors
		var changedIdxes = idxes.concat();
		var dirs8 = [-1 + width, width, 1 + width, -1, 1, -1 - width, -width, 1 - width];
		for (const idx of idxes) {
			for (var dir = 1; dir <= 9; dir = (dir + 1) | 0) {
				if (dir === 5) continue;

				var dIdx = idxForNeighborDir(idx, dir);
				if (dIdx < 0) continue;
				if (changedIdxes.contains(dIdx)) continue;

				var nId = baseTileId(data[dIdx]);
				var nIdAcc = baseTileId(data[dIdx + zAcc]);
				if (!nId && !nIdAcc) continue;

				if (!criffTopIds.contains(nId) && (Tilemap.isTileA3(nId) || Tilemap.isTileA4(nId))) continue;
				if (!criffTopIds.contains(nIdAcc) && (Tilemap.isTileA3(nIdAcc) || Tilemap.isTileA4(nIdAcc))) continue;

				changedIdxes.push(dIdx);
			}
		}

		//auto connect
		for (const idx of changedIdxes) {
			for (var z = 0; z < 2; z = (z + 1) | 0) {
				var tIdx = idx + z * zLayerSize;
				var tileId = baseTileId(data[tIdx]);
				if (tileId && Tilemap.isAutotile(tileId) && !criffTopIds.contains(tileId)) {
					data[tIdx] = connectAutoTileWithIdx(tIdx);
				}
			}


			//once delete paint Info
			for (var type = 0; type < 2; type = (type + 1) | 0) {
				var info = type === 0 ? waterInfo : paintInfo;
				for (var i = 0; i < info.length; i = (i + 3) | 0) {
					if (info[i] === idx) {
						info.splice(i, 3);
						break;
					}
				}
			}

			//add to info
			var water = Tilemap.isWaterTile(data[idx]) || (proc.waterIdxes && proc.waterIdxes.contains(idx))
			var info = water ? waterInfo : paintInfo
			info.push(idx);
			info.push(data[idx]);
			info.push(data[idx + zAcc]);
		}


		this.requestRefreshTilemap();
	};



	//=============================================================================
	// MODE: ManualLocate
	//=============================================================================
	MapDecorator.clearManualLocateInfo = function () {
		this.manualLocateObj = null;
		this.lastLocateMapObj = null;
		this.onDraggingLocateObj = null;
		_Dev.showText('dotLocate', null);
		_Dev.showText('adjustMapObj', null);
	};
	MapDecorator.tryStartManualLocateMode = function (event, roomId, x, y, tx, ty, dx, dy) {
		var idx = x + y * width;
		var objInfo = this.searchObjInfo(idx, roomId, dx, dy);

		_Dev.showText('dotLocate', null);
		this.lastLocateMapObj = null;
		if (!objInfo) {
			this.manualLocateObj = null;
			return false;
		}

		this.startManualLocateMode(objInfo);
		return true;
	};
	MapDecorator.startManualLocateMode = function (objInfo = null) {
		this.setMode('manualLocate');

		if (!Array.isArray(objInfo)) {
			this.lastLocateMapObj = objInfo;

			objInfo = objInfo.copy(true);
			_Dev.showText('dotLocate', 'Shift+左クリ:ドット単位で配置(ドラッグで移動)');
		}
		this.manualLocateObj = objInfo;

		SoundManager.playCursor();

		return true;
	};
	MapDecorator.searchObjInfo = function (idx, roomId, dx, dy) {
		return this._searchObjInfo(idx, roomId, dx, dy);
	};
	MapDecorator._searchObjInfo = function (idx, roomId, dx = 0, dy = 0, eraseTarget = null) {
		var objInfoArr = proc.lastObjInfoArr[roomId];
		if (!objInfoArr) return null;

		var x = (idx % width) * tileW + dx;
		var y = Math.floor(idx / width) * tileH + dy;
		var isTargetArray = eraseTarget && Array.isArray(eraseTarget);

		var bestTargetInfo = null;
		var bestDist = Number.MAX_SAFE_INTEGER;
		for (const objInfo of objInfoArr) {
			var objIdx = objInfo[0];
			var obj = objInfo[1];

			if (eraseTarget) {
				if (eraseTarget === obj) {
					//sameObj
				} else if (!isTargetArray && eraseTarget.equalsMapObjectImage(obj)) {
					//sameMapObjImage
				} else if (isTargetArray && Array.isArray(obj) && eraseTarget.equals(obj)) {
					//equals
				} else {
					//not match to targetObj
					continue;
				}
			}

			//check obj touch the idx
			var ox, oy, w, h, ax, ay;
			if (Array.isArray(obj)) {
				ox = (objIdx % width) * tileW;
				oy = Math.floor(objIdx / width) * tileH;
				if (objInfo[2]) ox += objInfo[2];
				if (objInfo[3]) oy += objInfo[3];

				if (Array.isArray(obj[0])) {
					//bigObj
					w = obj.length;
					h = obj[0].length;
				} else {
					w = 1;
					h = 1;
				}
				w *= tileW;
				h *= tileH;
				ax = ox + w / 2;
				ay = oy + h;
			} else {
				//mapObject
				if (!obj.sprite) continue;

				var sprite = obj.sprite;
				w = sprite.width * sprite.scale.x;
				h = sprite.height * sprite.scale.y;
				if (w < 0) w *= -1;
				if (h < 0) h *= -1;
				ox = sprite.x - sprite.anchor.x * w + $gameMap._displayX * tileW;
				oy = sprite.y - sprite.anchor.y * h + $gameMap._displayY * tileH;
				ax = ox + w * sprite.anchor.x;
				ay = oy + h * sprite.anchor.y;


				// if(sprite.rotation){
				// 	var dx = x -(sprite.x+$gameMap._displayX*tileW);
				// 	var dy = y -(sprite.y+$gameMap._displayY*tileH);
				// 	var theta = -sprite.rotation;
				// 	x = (sprite.x+$gameMap._displayX*tileW) + dx*Math.cos(theta)-dy*Math.sin(theta);
				// 	y = (sprite.y+$gameMap._displayX*tileH) + dx*Math.sin(theta)+dy*Math.cos(theta);
				// }

				// var bitmap = new Bitmap(w,h);
				// var sprite = new Sprite(bitmap);
				// bitmap.fillAll('rgba(255,0,0,0.5)');
				// sprite.x = ox - $gameMap._displayX*tileW;
				// sprite.y = oy - $gameMap._displayY*tileH;
				// SceneManager._scene.addChild(sprite);
			}


			if (x < ox || x > ox + w) continue;
			if (y < oy || y > oy + h) continue;

			var dist = Math.abs(ax - x) + Math.abs(ay - y);
			if (dist < bestDist) {
				bestDist = dist;
				bestTargetInfo = objInfo;
			}
		}

		if (!bestTargetInfo) return null;

		var obj = bestTargetInfo[1];
		if (eraseTarget) {
			TRP_CORE.remove(objInfoArr, bestTargetInfo);
			if (!isTargetArray) {
				TRP_CORE.remove(mapObjects, obj);
				MapObject.remove(obj);
			}
		} else {
			/* register to draggingObj
			===================================*/
			if (MapObject && obj instanceof MapObject && obj.sprite) {
				var objInfoArr = null;
				var tx = x - tileW / 2;
				var ty = y - tileH;
				var idx;
				var data = null;
				for (const infoArr of proc.lastObjInfoArr) {
					for (const objInfo of infoArr) {
						if (objInfo.contains(obj)) {
							data = objInfo;
							idx = objInfo[0];
							objInfoArr = infoArr;
							dx = objInfo[2] || 0;
							dy = objInfo[3] || 0;
							break;
						}
					}
					if (objInfoArr) break;
				}
				if (objInfoArr) {
					var sprite = obj.sprite;
					var x = idx % width;
					var y = Math.floor(idx / width);
					var w = obj.tileW || 1;
					var h = obj.tileH || 1;
					x += Math.floor((w - 1) / 2);
					y += h - 1;
					this.onDraggingLocateObj = {
						obj,
						objInfoArr,
						data,
						tx,
						ty,
						dx,
						dy,
						x,
						y,
						count: 10,
					};
				}
			}
		}

		return obj;
	};



	/* manualLocate main proc
	===================================*/
	MapDecorator.MODE_GUIDE.manualLocate = [
		'【手動オブジェ配置モード】',
		'左クリ:配置/削除',
		'右クリ:終了',
		'Ctrl+左クリ:オブジェ選択(スポイト)',
	];

	MapDecorator.onMouseDownLeftManualLocate = function (event, roomId, x, y, tx, ty, dx, dy) {
		this.onDraggingLocateObj = null;
		if (roomId < 0) return;

		if (Input.isPressed('control')) {
			if (!this.tryStartManualLocateMode(event, roomId, x, y, tx, ty, dx, dy)) {
				SoundManager.playBuzzer();
			}
		} else {
			var dotLoc = (MapObject && Input.isPressed('shift'));
			this.processManualLocate(event, roomId, x, y, dx, dy, dotLoc);
		}
	};
	MapDecorator.onMouseDownRightManualLocate = function (event, roomId, x, y, tx, ty, dx, dy) {
		if (Input.isPressed('shift')) {
		} else if (Input.isPressed('control')) {
			MapDecorator.tryShowObjectPalette();
		} else {
			SoundManager.playCancel();
			this.restoreMode();
		}
	};
	MapDecorator.processManualLocate = function (event, roomId, x, y, dx, dy, dotLoc = false) {
		var obj = this.manualLocateObj;
		this.lastLocateMapObj = null;
		_Dev.showText('adjustMapObj', null);

		if (!obj) {
			SoundManager.playBuzzer();
			return;
		}
		if (!MapObject /*|| !(obj instanceof MapObject)*/) {
			dotLoc = false;
		}
		if (dotLoc && !(obj instanceof MapObject)) {
			var mapObj = this.mapObjectWithTileObject(obj);
			if (mapObj) {
				obj = mapObj;
			} else {
				dotLoc = false;
			}
		}


		var idx = x + y * width;
		var roomId = idxOfRoom(idx);
		if (!proc.lastObjInfoArr[roomId]) {
			proc.lastObjInfoArr[roomId] = [];
		}
		var objInfoArr = proc.lastObjInfoArr[roomId];


		//try erase
		var eraseTarget = obj;
		var eraseTarget2 = null;
		if (MapObject && !(obj instanceof MapObject)) {
			//auto converted mapObjct
			eraseTarget2 = MapDecorator._convertedMapObjMap[JSON.stringify(obj)] || null;
		}
		if (!dotLoc && this._searchObjInfo(idx, roomId, dx, dy, eraseTarget)) {
			//erase success
		} else if (!dotLoc && eraseTarget2 && this._searchObjInfo(idx, roomId, dx, dy, eraseTarget2)) {
			//erase success
		} else {
			//add obj
			if (!dotLoc) {
				dx = 0;
				dy = 0;
			} else {
				dx -= tileW / 2;
				dy -= tileH;
			}
			if (!this.tryManualLocateObject(idx, obj, roomId, objInfoArr, dx, dy)) {
				SoundManager.playBuzzer();
				return;
			}
		}
		SoundManager.playCursor();


		//restoreMap to apply edit
		var lockedObjRoomIds = proc.lockedObjRoomIds;
		proc.lockedObjRoomIds = TRP_CORE.packSequence([], proc.allRoomIdxes.length);
		this.restoreMap();
		proc.lockedObjRoomIds = lockedObjRoomIds;
	};

	MapDecorator._mapObjTransformCopy = null;
	MapDecorator.onKeyDownManualLocate = function (event) {
		var obj = this.lastLocateMapObj;

		if (obj) {
			if (event.key === 'Backspace') {
				//delete obj
				for (const objInfoArr of proc.lastObjInfoArr) {
					for (const data of objInfoArr) {
						if (data.contains(obj)) {
							TRP_CORE.remove(objInfoArr, data);
							TRP_CORE.remove(mapObjects, obj);
							MapObject.remove(obj);
							this.lastLocateMapObj = null;
							SoundManager.playCursor();
							return true;
						}
					}
				}
				return false;
			} else if (!isNaN(event.key)) {
				var rate = Number(event.key) * 0.1 || 1.0;
				obj.opacity = Math.ceil(255 * rate);
			} else if (event.key === 'm') {
				obj.mirror = !obj.mirror;
			} else if (event.key === 'r') {
				obj.scaleX = obj.scaleY = 1;
				obj.rotation = 0;
				obj.mirror = false;
				obj.tint = 0xffffff;
			} else if (event.key === 't') {
				this.startPickColor(color => {
					obj.tint = Number(color.replace('#', '0x'));
					if (obj.sprite) {
						obj.sprite.tint = obj.tint;
					}
				});
				// }else if(event.key==='b'){
				// 	var blend = obj.blendMode+1;
				// 	if(blend>=5){
				// 		blend = 0;
				// 	}
				// 	obj.setBlendMode(blend);
				// 	_Dev.showTempText('mapObjBlend','ブレンド > %1'.format(
				// 		blend===0 ? '通常' : (blend===1 ? '加算' : (blend===2 ? '乗算' : 'オーバーレイ'))
				// 	));
			} else if (event.key === 'c') {
				// MapDecorator._mapObjTransformCopy = [
				// 	obj.scaleX,obj.scaleY,obj.rotation,obj.opacity,obj.mirror,obj.tint
				// ];
				MapDecorator.manualLocateObj = obj.copy(true);
				SoundManager.playOk();
				// }else if(event.key==='v'){
				// 	if(MapDecorator._mapObjTransformCopy){
				// 		var info = MapDecorator._mapObjTransformCopy
				// 		var idx = 0;
				// 		obj.scaleX = info[idx++];
				// 		obj.scaleY = info[idx++];
				// 		obj.rotation = info[idx++];
				// 		obj.opacity = info[idx++];
				// 		obj.mirror = info[idx++];
				// 		obj.tint = info[idx++];
				// 		SoundManager.playOk();
				// 	}else{
				// 		SoundManager.playBuzzer();
				// 	}
			} else {
				return;
			}
			if (obj.sprite) {
				obj.sprite.tint = obj.tint;
				obj.sprite.rotation = obj.rotation;
				obj.sprite.scale.set(obj.scaleX * (obj.mirror ? -1 : 1), obj.scaleY);
				obj.sprite.opacity = obj.opacity;
			}
			SoundManager.playCursor();
		}
	};


	MapDecorator.onMousePressManualLocate = function (event, roomId, x, y, tx, ty, dx, dy) {
		if (!this.onDraggingLocateObj) return;

		var dragging = this.onDraggingLocateObj;
		if (this.lastLocateMapObj !== dragging.obj) return;

		dragging.count -= 1;
		if (dragging.count > 0) {
			return;
		}

		//adjust pos to anchor
		dx -= tileW / 2;
		dy -= tileH;

		var offsetX = (x * tileW + dx) - dragging.tx;
		var offsetY = (y * tileH + dy) - dragging.ty;
		if (!offsetX && !offsetY) {
			return;
		}


		//calc real x,y,dx,dy
		dx = dragging.x * tileW + dragging.dx + offsetX;
		dy = dragging.y * tileH + dragging.dy + offsetY;
		x = Math.floor(dx / tileW);
		y = Math.floor(dy / tileH);
		dx -= x * tileW;
		dy -= y * tileH;

		var rIdx = x + width * y;
		roomId = idxOfRoom(rIdx);
		if (roomId < 0) {
			return;
		}
		// this.tonnerTiles([rIdx]);


		dragging.tx += offsetX;
		dragging.ty += offsetY;

		var idx = x + y * width;
		var objInfoArr = proc.lastObjInfoArr[roomId];
		this.tryManualLocateObject(idx, dragging.obj, roomId, objInfoArr, dx, dy, dragging);

	};

	MapDecorator.updateInputManualLocate = function () {
		var obj = this.lastLocateMapObj;
		if (obj) {
			if (Input.isPressed('shift')) {
				if (Input.isTriggered('left') || Input.isLongPressed('left')) {
					obj.rotation -= 5 * Math.PI / 180;
				} else if (Input.isTriggered('right') || Input.isLongPressed('right')) {
					obj.rotation += 5 * Math.PI / 180;
				} else if (Input.isTriggered('up') || Input.isLongPressed('up')) {
					obj.scaleX += 0.05;
					obj.scaleY += 0.05;
				} else if (Input.isTriggered('down') || Input.isLongPressed('down')) {
					obj.scaleX -= 0.05;
					obj.scaleY -= 0.05;
				} else if (
					Input.isPressed('left') || Input.isPressed('right')
					|| Input.isPressed('up') || Input.isPressed('down')
				) {
					return true;
				} else {
					return false;
				}
			} else if (Input.isPressed('control')) {
				if (Input.isTriggered('left') || Input.isLongPressed('left')) {
					obj.scaleX -= 0.05;
				} else if (Input.isTriggered('right') || Input.isLongPressed('right')) {
					obj.scaleX += 0.05;
				} else if (Input.isTriggered('up') || Input.isLongPressed('up')) {
					obj.scaleY += 0.05;
				} else if (Input.isTriggered('down') || Input.isLongPressed('down')) {
					obj.scaleY -= 0.05;
				} else if (
					Input.isPressed('left') || Input.isPressed('right')
					|| Input.isPressed('up') || Input.isPressed('down')
				) {
					return true;
				} else {
					return false;
				}
			} else {
				if (Input.isTriggered('pagedown') || Input.isLongPressed('pagedown')) {
					obj.opacity += 5;
				} else if (Input.isTriggered('pageup') || Input.isLongPressed('pageup')) {
					obj.opacity -= 5;
				} else {
					return false;
				}
			}

			if (obj.sprite) {
				obj.opacity = obj.opacity.clamp(0, 255);
				obj.sprite.opacity = obj.opacity;
				obj.sprite.rotation = obj.rotation;
				obj.sprite.scale.set(obj.scaleX * (obj.mirror ? -1 : 1), obj.scaleY);
			}
			if (Input._pressedTime === 0 || Input._pressedTime % 4 === 0) {
				SoundManager.playCursor();
			}
			return true;
		}
		return false;
	}


	/* processManualLocateObj
	===================================*/
	MapDecorator.tryManualLocateObject = function (idx, obj, roomId, objInfoArr, dx = 0, dy = 0, dragging = null) {
		var roomBaseIdxes = proc.allBaseIdxes[roomId];
		var baseIdx = proc.idxBaseInfoIdxMap[idx];
		if (baseIdx < 0) return false;

		var validIdxes = roomBaseIdxes[baseIdx++].concat();
		TRP_CORE.removeArray(validIdxes, proc.objForbiddenIdxes);
		TRP_CORE.removeArray(validIdxes, proc.passIdxes);

		var w = 1;
		var h = 1;
		var tx, ty;
		var isMapObj = false;
		var needsSort = true;
		if (Array.isArray(obj)) {
			if (Array.isArray(obj[0])) {
				//bigObj
				w = obj.length;
				h = obj[0].length;
			}
			tx = idx % width - Math.floor((w - 1) / 2);
			ty = Math.floor(idx / width) - (h - 1);
		} else {
			//MapObject
			isMapObj;
			obj = dragging ? obj : obj.copy(true);
			if (obj.tileId) {
				w = obj.tileW;
				h = obj.tileH;
			}
			tx = idx % width - (w - 1) / 2;
			ty = Math.floor(idx / width) - (h - 1);
		}

		//check target pos valid
		if (tx < 0 || tx >= width) return false;
		if (ty < 0 || ty >= height) return false;
		var targetIdx = tx + ty * width;


		var data = [targetIdx, obj];
		if (dx || dy) {
			data.push(dx, dy);
		}
		if (!Array.isArray(obj)) {
			if (!dragging) {
				this.onDraggingLocateObj = {
					obj,
					objInfoArr,
					data,
					tx: idx % width * tileW + dx,
					ty: Math.floor(idx / width) * tileH + dy,
					x: idx % width,
					y: Math.floor(idx / width),
					dx, dy,
					count: 10,
				};
				this.lastLocateMapObj = obj;
				_Dev.showText('adjustMapObj', [
					'Shift+左右キー:回転',
					'Shift+上下キー:拡大率変更',
					'Alt/Opt+上下左右キー:XY方向拡大率変更',
					'M：反転',
					'Q/W/0~9：不透明度変更',
					'T：色味変更',
					// 'B：ブレンドモード',
					'R：変形リセット',
					'C：コピー',
					'Backspace：削除',

					'(※衝突判定は変形が反映されないので注意)'
				]);
			} else {
				//dragging obj
				TRP_CORE.remove(dragging.objInfoArr, dragging.data);
				needsSort = dragging.dy !== dy || dragging.y !== Math.floor(idx / width);
				if (obj.sprite) {
					var deltaX = (dx - dragging.dx) + tileW * (idx % width - dragging.x);
					var deltaY = (dy - dragging.dy) + tileH * (Math.floor(idx / width) - dragging.y);
					obj.x += deltaX;
					obj.y += deltaY;
					obj._lastDispX = Number.MAX_SAFE_INTEGER;
					obj._lastDispY = Number.MAX_SAFE_INTEGER;
					obj.setupMargin();
				}
				dragging.objInfoArr = objInfoArr;
				dragging.data = data;
				dragging.dx = dx;
				dragging.dy = dy;
				dragging.x = idx % width;
				dragging.y = Math.floor(idx / width);
			}
		}

		objInfoArr.push(data);

		if (!needsSort) {
		} else {
			objInfoArr.sort((a, b) => {
				if (a[0] - b[0] > 0) return true;
				if (a[0] === b[0]) {
					if (a[3]) {
						if (b[3]) {
							return a[3] - b[3] >= 0;
						} else {
							return true;
						}
					} else if (b[3]) {
						return false;
					} else {
						return true;
					}
				} else {
					return false;
				}
				// return a[0]-b[0]>=0;
			});
		}
		return true;
	};




	//=============================================================================
	// MODE: ObjectPalette
	//=============================================================================
	MapDecorator.clearObjectPalette = function () {
		this.objectPaletteMaxY = 0;

		if (MapDecorator.paletteObjects) {
			for (const obj of MapDecorator.paletteObjects) {
				if (MapObject && obj instanceof MapObject) {
					obj.releaseSprite();
				}
			}
		}
		if (this.backSprite && this.backSprite.parent) {
			this.backSprite.parent.removeChild(this.backSprite);
			this.backSprite.removeChildren();
		}
	};

	MapDecorator.MODE_GUIDE.objectPalette = [
		'【オブジェパレットモード】',
		'左クリック:オブジェクト選択',
		'右クリック:キャンセル',
	];
	MapDecorator.OBJECT_PALLETE_EMPTY_NUM = 2;
	MapDecorator.OBJECT_PALLETE_SIZE = 96;
	MapDecorator.OBJECT_PALLETE_MARGIN = 12;
	MapDecorator.tryShowObjectPalette = function () {
		var objects = MapDecorator.paletteObjects;
		if (!objects || !objects.length) {
			SoundManager.playBuzzer();
			return false;
		}

		this.setMode('objectPalette');
		this.cantShowMenu = true;
		SoundManager.playOk();

		/* black sprite
		===================================*/
		if (!this.backSprite) {
			this.backSprite = new PIXI.Graphics()
				.beginFill(0x888888, 0.5)
				.drawRect(0, 0, Graphics.width, Graphics.height);
		}
		var backSprite = this.backSprite;
		SceneManager._scene.addChild(backSprite);
		_Dev.readdDebugTextContainer();


		/* objects
		===================================*/
		var container = new PIXI.Container();
		backSprite.addChild(container);

		var size = MapDecorator.OBJECT_PALLETE_SIZE;
		var m = MapDecorator.OBJECT_PALLETE_MARGIN;
		var x = m + (size + m) * MapDecorator.OBJECT_PALLETE_EMPTY_NUM;//avoid guide
		var y = m;
		for (const obj of objects) {
			var sprite = null;
			if (Array.isArray(obj)) {
				sprite = this.layeredTilesSprite(obj, size);
			} else if (MapObject && obj instanceof MapObject) {
				//mapObj
				sprite = obj.setupSprite(null);
				sprite.bitmap.addLoadListener(function (sprite) {
					var sprSize = Math.max(sprite.width, sprite.height, 1);
					if (sprSize > size) {
						sprite.scale.set(size / sprSize, size / sprSize);
					} else {
						sprite.scale.set(1, 1);
					}
				}.bind(this, sprite));
			}
			if (sprite) {
				container.addChild(sprite);
				sprite.x = x;
				sprite.y = y;
				if (sprite instanceof PIXI.Sprite) {
					sprite.anchor.set(0.5, 0.5);
					sprite.x += size / 2;
					sprite.y += size / 2;
				}
			}

			x += size + m;
			if (x >= Graphics.width - m) {
				x = m;
				y += size + m;
			}
		}
		this.objectPaletteMaxY = y + size + m;
		return true;
	};
	MapDecorator.layeredTilesSprite = function (obj, size = 0) {
		if (!Array.isArray(obj)) return null;
		if (!Array.isArray(obj[0])) {
			obj = [[obj]];
		}

		var w = obj.length;
		var h = obj[0].length;
		var bitmap = new Bitmap(w * tileW, h * tileH);
		var sprite = new Sprite(bitmap);

		var sprSize = Math.max(w * tileW, h * tileH);
		if (sprSize > size) {
			sprite.scale.set(size / sprSize, size / sprSize);
		} else {
			sprite.scale.set(1, 1);
		}

		var tilemap = SceneManager._scene._spriteset._tilemap;
		var bitmaps = tilemap._bitmaps || tilemap.bitmaps;
		for (var c = 0; c < w; c = (c + 1) | 0) {
			var x = c * tileW;
			var col = obj[c];
			for (var r = 0; r < h; r = (r + 1) | 0) {
				var y = r * tileH;
				var tileIds = col[r];
				if (!tileIds) continue;
				for (const tileId of tileIds) {
					if (!tileId) continue;
					TRP_CORE._drawTile(bitmap, tileId, x, y, bitmaps);
				}
			}
		}
		return sprite;
	};

	MapDecorator.updateInputObjectPalette = function () {
		return true;
	}
	MapDecorator.onMouseDownLeftObjectPalette = function (event, i, x, y, tx, ty) {
		var objects = this.paletteObjects;
		var size = MapDecorator.OBJECT_PALLETE_SIZE;
		var m = MapDecorator.OBJECT_PALLETE_MARGIN;

		//check touch margin
		var col = Math.floor((tx - m) / (size + m));
		var row = Math.floor((ty - m) / (size + m));
		var maxCol = Math.floor((Graphics.width - m) / (size + m));
		var idx = col + row * maxCol;

		var emptyNum = MapDecorator.OBJECT_PALLETE_EMPTY_NUM;
		var obj = objects[idx - emptyNum];
		if (!obj) {
			SoundManager.playBuzzer();
			return;
		}

		this.startManualLocateMode(obj);
	};

	MapDecorator.onMouseDownRightObjectPalette = function (event, i, x, y, tx, ty) {
		SoundManager.playCancel();
		this.restoreMode();
	};








	//=============================================================================
	// MODE: UserProcess
	//=============================================================================
	MapDecorator.MODE_GUIDE.userProcess = [
		'【置換プロセスモード】',
		'左クリック:置換やり直し',
		'右クリック:ロック',
		'Esc:モード終了',
		'※置換処理は"抽選作業の途中"に行わないこと',
	];
	MapDecorator.clearUserProcessParams = function () {
		this.userProcessMode = {
			timing: null,
			lastProc: null,
			lockedRoomIds: [],
			lockedResults: [],
			lockedAllResults: [],
			lastResults: null,
		};
	}

	MapDecorator.startUserProcessMode = function (timing, once = false) {
		if (!MapDecorator.processList[timing]) {
			SoundManager.playBuzzer();
			return;
		}
		if (once) {
			this.processUserProcessList(timing);
			originalData = data.concat();
			SoundManager.playOk();
		} else {
			this.setMode('userProcess');
			this.clearUserProcessParams();
			this.userProcessMode.timing = timing;
		}
	};

	MapDecorator.updateInputUserProcess = function () {
		if (Input.isTriggered('cancel')) {
			originalData = data.concat();
			this.restoreMode();
			SoundManager.playCancel();
			Input.clear();
			return true;
		} else {
			return false;
		}
	};

	MapDecorator.onMouseDownLeftUserProcess = function (event, i, x, y, tx, ty) {
		if (Input.isPressed('shift')) {

		} else {
			//exec process
			var modeData = this.userProcessMode;
			if (modeData.lastProc) {
				data.length = 0;
				data.push(...originalData);
				proc = modeData.lastProc;
			} else {
				modeData.lastProc = JsonEx.makeDeepCopy(proc);
			}

			var allResults = modeData.lockedAllResults;
			if (allResults.length) {
				this.processUserProcessListWithResults(allResults);
			}
			modeData.lastResults = this.processUserProcessList(modeData.timing, modeData.lockedRoomIds, true);

			SoundManager.playCursor();
		}
	};
	MapDecorator.onMouseDownRightUserProcess = function (event, i, x, y, tx, ty) {
		var modeData = this.userProcessMode;
		if (!this.userProcessMode.lastProc) {
			SoundManager.playBuzzer();
			return;
		}

		if (i < 0) {
			SoundManager.playBuzzer();
			return;
		}

		if (Input.isPressed('shift')) {
			//try back to paintFloor
			if (modeData.lockedRoomIds.contains(i)) {
				TRP_CORE.remove(modeData.lockedRoomIds, i);
				var results = modeData.lockedResults[i];
				TRP_CORE.removeArray(modeData.lockedAllResults, modeData.lockedResults[i]);
				modeData.lockedRoomIds[i] = null;

				showInfoText('プロセスアンロック！');
				SoundManager.playCancel();
			} else {
				SoundManager.playBuzzer();
			}
		} else if (!modeData.lastProc) {
			//not processed yet
			SoundManager.playBuzzer();
		} else if (modeData.lockedRoomIds.contains(i)) {
			//already locked
			SoundManager.playBuzzer();
		} else {
			//userProc lock
			showInfoText('プロセスロック！');
			SoundManager.playOk();

			TRP_CORE.uniquePush(modeData.lockedRoomIds, i);
			var results = modeData.lockedResults[i] = [];
			var allResults = modeData.lockedAllResults;

			for (const result of modeData.lastResults) {
				var idx = result[0];
				if (proc.roomIdxMapForUserProc[idx] !== i) continue;

				allResults.push(result);
				results.push(result);
			}
		}
	};




	//=============================================================================
	// User Process
	//=============================================================================
	var PROCESS_TYPES = MapDecorator.PROCESS_TYPES = {
		replace: 0,
	};
	var PROCESS_FLAGS = MapDecorator.PROCESS_FLAGS = {
		none: 0,
		condNot: 1,
		noShape: 2,
		noErase: 3,
	};

	MapDecorator.processUserProcessList = function (timing, lockedRoomIds = null, needsResult = false) {
		var list = MapDecorator.processList[timing];
		if (!list) return;

		var autoTileIdxes = [];
		var resultList = needsResult ? [] : null;
		for (const proc of list) {
			switch (proc.type) {
				case PROCESS_TYPES.replace:
					this.processReplaceTiles(proc, autoTileIdxes, lockedRoomIds, resultList);
					break;
			}
		}

		for (const idx of autoTileIdxes) {
			data[idx] = connectAutoTileWithIdx(idx, 1);
		}
		this.requestRefreshTilemap();

		return resultList;
	};
	MapDecorator.processUserProcessListWithResults = function (results) {
		var autoTileIdxes = [];
		for (const result of results) {
			var type = result[1];
			var params = result[2];
			switch (type) {
				case PROCESS_TYPES.replace:
					this.executeReplaceTileIds(...params, autoTileIdxes);
					break;
			}
		}

		for (const idx of autoTileIdxes) {
			data[idx] = connectAutoTileWithIdx(idx, 1);
		}
	};

	MapDecorator.quickCheckTileId = function (ids) {
		if (!ids) return null;

		var noShape = false;
		var tileId = ids[0];
		if (Array.isArray(ids[ids.length - 1])) {
			var flags = ids[ids.length - 1];
			if (flags.contains(PROCESS_FLAGS.condNot)) {
				return null;
			}
			if (flags.contains(PROCESS_FLAGS.noShape)) {
				noShape = true;
				tileId = baseTileId(tileId);
			}
		}
		if (tileId <= 0 || !tileId) {
			return null;
		}

		return {
			tileId,
			noShape,
		};
	}
	MapDecorator.processReplaceTiles = function (userProc, autoTileIdxes, lockedRoomIds = null, resultList = null) {
		var tileIds = userProc.tileIds;

		var candidates = userProc.candidates;
		var candidatesLen = candidates.length;

		var rate = userProc.rate;
		if (!candidatesLen || rate <= 0) return;
		var needsDraw = rate < 1;

		var w, h;
		var isBigObj = Array.isArray(tileIds[0]);

		var qIdx = 0;
		var quickCheck = null;
		var qcFound = false;
		if (isBigObj) {
			w = tileIds.length;
			h = tileIds[0].length;
			for (var dx = 0; dx < w && !qcFound; dx = (dx + 1) | 0) {
				for (var dy = 0; dy < h && !qcFound; dy = (dy + 1) | 0) {
					var checkInfo = this.quickCheckTileId(tileIds[dx][dy]);
					if (!checkInfo) continue;

					if (checkInfo.noShape && quickCheck) continue;
					qcFound = !checkInfo.noShape;

					quickCheck = checkInfo;
					qIdx = dx + dy * width;
				}
			}
		} else {
			w = h = 1;
			quickCheck = this.quickCheckTileId(tileIds);
		}
		var qcFlag = !!quickCheck;
		var qId = quickCheck ? quickCheck.tileId : 0;


		var targetTileIds = candidates[0];
		for (var x = 0; x < width - w; x = (x + 1) | 0) {
			for (var y = 0; y < height - h; y = (y + 1) | 0) {
				var idx = x + y * width;
				if (invalidIdxes && invalidIdxes.contains(idx)) continue;
				if (lockedRoomIds) {
					var roomId = proc.roomIdxMapForUserProc[idx];
					if (roomId >= 0 && lockedRoomIds.contains(roomId)) {
						continue;
					}
				}

				//quick check
				if (qcFlag) {
					if (quickCheck.noShape) {
						if (!(//noShape

							(data[idx + qIdx] && baseTileId(data[idx + qIdx]) === qId)
							|| (data[idx + qIdx + zAcc] && baseTileId(data[idx + qIdx + zAcc]) === qId)
							|| (data[idx + qIdx + zObj1] && baseTileId(data[idx + qIdx + zObj1]) === qId)
							|| (data[idx + qIdx + zObj2] && baseTileId(data[idx + qIdx + zObj2]) === qId))
						) continue;
					} else {
						if (!(data[idx + qIdx] === qId
							|| data[idx + qIdx + zAcc] === qId
							|| data[idx + qIdx + zObj1] === qId
							|| data[idx + qIdx + zObj2] === qId)
						) continue;
					}
				}

				//draw rate
				if (needsDraw && Math.random() > rate) continue;

				//check all tileIds
				var checkOk = true;
				for (var dx = 0; dx < w && checkOk; dx = (dx + 1) | 0) {
					for (var dy = 0; dy < h; dy = (dy + 1) | 0) {
						if (invalidIdxes && invalidIdxes.contains(idx + dx + dy * width)) continue;

						if (!this._checkLayeredTileIdsMatchWithFlags(
							idx + dx + dy * width,
							isBigObj ? tileIds[dx][dy] : tileIds,
						)) {
							checkOk = false;
							break;
						}
					}
				}
				if (!checkOk) continue;


				//draw candidates
				if (candidatesLen > 1) {
					targetTileIds = candidates[Math.randomInt(candidatesLen)];
				}
				if (resultList) {
					resultList.push([idx, PROCESS_TYPES.replace, [isBigObj, tileIds, w, h, targetTileIds, idx, x, y]]);
				}

				//apply tileIds
				this.executeReplaceTileIds(isBigObj, tileIds, w, h, targetTileIds, idx, x, y, autoTileIdxes);
			}
		}
	};


	MapDecorator._checkLayeredTileIdsMatchWithFlags = function (idx, tileIds, removeFlag = false) {
		if (!tileIds) return true;

		var flags = Array.isArray(tileIds[tileIds.length - 1]) ? tileIds[tileIds.length - 1] : null;

		var success = true;
		var failure = false;
		var noShape = false;
		if (flags) {
			if (flags.contains(PROCESS_FLAGS.condNot)) {
				if (removeFlag) return true;
				success = false;
				failure = true;
			}
			if (flags.contains(PROCESS_FLAGS.noShape)) {
				noShape = true;
			}
			if (flags.contains(PROCESS_FLAGS.noErase)) {
				if (removeFlag) return true;
			}
		}

		var usedZ = 0;
		var i = tileIds.length - 1 - (flags ? 1 : 0);
		for (; i >= 0; i = (i - 1) | 0) {
			var tileId = tileIds[i];
			if (tileId < 0) {
				if (tileId <= MapDecorator.REGION_ID_BEGIN && tileId >= MapDecorator.REGION_ID_END) {
					//regionId
					if (data[idx + zRegion] !== (-(tileId - MapDecorator.REGION_ID_BEGIN))) return failure;

					//match
					if (removeFlag) data[idx + zRegion] = 0;
				} else if (tileId <= MapDecorator.SHADOW_ID_BEGIN && tileId >= MapDecorator.SHADOW_ID_END) {
					//shadow
					if (data[idx + zShadow] !== (-(tileId - MapDecorator.SHADOW_ID_BEGIN))) return failure;

					//match
					if (removeFlag) data[idx + zShadow] = 0;
				} else {
					//invalid tileId
					continue;
				}
			} else {
				//normal tile
				if (noShape) tileId = baseTileId(tileId);

				var found = false;
				for (var z = 0; z < 4; z = (z + 1) | 0) {
					if (usedZ & 1 << z) continue;

					var tId = data[idx + z * zLayerSize];
					if (noShape && tId) tId = baseTileId(tId);

					if (tId === tileId) {
						//match
						found = true;
						usedZ |= (1 << z);
						if (removeFlag) {
							data[idx + z * zLayerSize] = 0;
						}
						break;
					}
				}
				if (!found) return failure;
			}
		}
		return success;
	};


	MapDecorator.executeReplaceTileIds = function (isBigObj, tileIds, w, h, targetTileIds, idx, x, y, autoTileIdxes) {
		for (var dx = 0; dx < w; dx = (dx + 1) | 0) {
			for (var dy = 0; dy < h; dy = (dy + 1) | 0) {
				this._checkLayeredTileIdsMatchWithFlags(
					idx + dx + dy * width,
					isBigObj ? tileIds[dx][dy] : tileIds,
					true//removeFlag
				);
			}
		}

		var w1 = isBigObj ? targetTileIds.length : 1;
		var h1 = isBigObj ? targetTileIds[0].length : 1;
		for (var dx = 0; dx < w1; dx = (dx + 1) | 0) {
			if (x + dx >= width) continue;
			for (var dy = 0; dy < h1; dy = (dy + 1) | 0) {
				if (y + dy >= height) continue;
				if (invalidIdxes && invalidIdxes.contains(idx + dx + dy * width)) continue;

				this.applyLayeredTileIdsWithFlags(
					idx + dx + dy * width,
					isBigObj ? targetTileIds[dx][dy] : targetTileIds,
					autoTileIdxes,
				);
			}
		}
	};
	MapDecorator.applyLayeredTileIdsWithFlags = function (idx, targetTileIds, autoTileIdxes = null) {
		if (!targetTileIds) return;

		var flags = Array.isArray(targetTileIds[targetTileIds.length - 1]) ? targetTileIds[targetTileIds.length - 1] : null;

		var i = 0;
		var maxI = targetTileIds.length - 1 - (flags ? 1 : 0);
		for (var z = 0; z < 4; z = (z + 1) | 0) {
			if (data[z * zLayerSize + idx]) continue;

			var tileId = targetTileIds[i++];
			var skip = false;
			if (tileId < 0) {
				if (tileId === MapDecorator.SUPPLY_BACK_TILE_ID) {
					//supply back -> needs z=0 empty
					skip = true;
					if (z == 0) {
						this.supplyBackTile(idx);
					}
				} else if (tileId <= MapDecorator.REGION_ID_BEGIN && tileId >= MapDecorator.REGION_ID_END) {
					//regionId
					data[zRegion + idx] = -(tileId - MapDecorator.REGION_ID_BEGIN);
					continue;
				} else if (tileId <= MapDecorator.SHADOW_ID_BEGIN && tileId >= MapDecorator.SHADOW_ID_END) {
					//shadow
					data[zShadow + idx] = -(tileId - MapDecorator.SHADOW_ID_BEGIN);
					continue;
				}
			}
			if (!skip) {
				data[z * zLayerSize + idx] = tileId;
				if (autoTileIdxes && Tilemap.isAutotile(tileId)) {
					if (Tilemap.isTileA2(tileId) || Tilemap.isWaterTile(tileId) || Tilemap.isWallTopTile(tileId)) {
						TRP_CORE.uniquePush(autoTileIdxes, z * zLayerSize + idx);
					}
				}
			}
			if (i > maxI) break;
		}


		//try make empty with zAcc layer
		var tileId = baseTileId(data[idx + zAcc]);
		if (tileId && !allFloorLevelTileIds.contains(tileId)) {
			var isLayerFull = false;
			if (data[idx + zAcc]) {
				if (data[idx + zObj1]) {
					if (data[idx + zObj2]) {
						isLayerFull = true;
					}
					if (!isLayerFull) data[idx + zObj2] = data[idx + zObj1];
				}
				if (!isLayerFull) data[idx + zObj1] = data[idx + zAcc];
			}
			if (!isLayerFull) data[idx + zAcc] = 0;
		}
	};






	//=============================================================================
	// MapObject
	//=============================================================================
	var mapObjects = MapDecorator.mapObjects = [];
	MapDecorator.analyzeMapObjects = function () {
		var objects = $dataTrpMapObjects;
		if (!objects) return;

		var setupTemplates = MapObject._setupEventTemplates;
		var templates = this.mapObjectTemplate;
		var templateConvertMap = setupTemplates ? {} : null;

		/* convert setupEventTemplates
		===================================*/
		var setupTags = setupTemplates ? Object.keys(setupTemplates) : null;
		var length = setupTags ? setupTags.length : 0;
		var newRegisterTemplates = [];
		var needsRefreshTags = [];
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var tag = setupTags[i];
			if (!isNaN(tag)) tag = Number(tag);

			var target = setupTemplates[tag];
			if (!target) continue;

			var bestFitValue = Number.MAX_SAFE_INTEGER;
			var bestFitTemplate = null;
			for (const template of templates) {
				if (!template) continue;

				var fitValue = MapObject.templateFitValue(target, template);
				if (fitValue < bestFitValue) {
					bestFitValue = fitValue;
					bestFitTemplate = template;
				}
			}

			if (!bestFitTemplate) {
				bestFitTemplate = JsonEx.makeDeepCopy(target);
				bestFitTemplate.tag = templates.length + newRegisterTemplates.length;
				newRegisterTemplates.push(bestFitTemplate);
			} else if (bestFitValue > 0) {
				needsRefreshTags.push(tag);
			}
			templateConvertMap[tag] = bestFitTemplate.tag;
		}

		if (setupTemplates && newRegisterTemplates && newRegisterTemplates.length) {
			templates.push(...newRegisterTemplates);
		}

		/* register located objects
		===================================*/
		mapObjects = mapObjects.concat(objects);
		var spriteset = SceneManager._scene._spriteset;
		for (const obj of objects) {
			var x = obj.x / tileW - 0.5;
			var y = obj.y / tileH - 1;
			if (obj.tileId) {
				x -= (obj.tileW - 1) / 2;
				y -= (obj.tileH - 1);
			}
			x = Math.floor(x);
			y = Math.floor(y);

			if (templateConvertMap && templateConvertMap[obj.tag]) {
				var needsRefresh = needsRefreshTags.contains(obj.tag);
				obj.tag = templateConvertMap[obj.tag];
				if (needsRefresh) {
					obj.setupWithTemplate(templates[obj.tag]);
					if (obj.sprite) {
						obj.releaseSprite();
						obj.setupSprite(spriteset);
					}
				}
			}

			var idx = x + y * width;
			var roomId = idxOfRoom(idx);
			if (roomId < 0) {
				continue;
			}

			var lastRoomObjects = proc.lastObjInfoArr[roomId] = proc.lastObjInfoArr[roomId] || [];
			lastRoomObjects.push([idx, obj]);
		}
	};


	//for manual locate
	MapDecorator._convertedMapObjMap = {};
	MapDecorator.mapObjectWithTileObject = function (objArr) {
		if (!objArr) return null;

		var key = JSON.stringify(objArr);
		if (!MapDecorator._convertedMapObjMap[key]) {
			MapDecorator._convertedMapObjMap[key] = this._mapObjectWithTileObject(objArr);
		}
		return MapDecorator._convertedMapObjMap[key];
	};
	MapDecorator._mapObjectWithTileObject = function (objArr) {
		var w = 1;
		var h = 1;
		var tileId;
		if (Array.isArray(objArr[0])) {
			//bigObj
			w = objArr.length;
			h = objArr[0].length;
			tileId = objArr[0][0][0];
		} else {
			tileId = objArr[0];
		}
		if (!tileId) {
			_Dev.showTempAlert('ドット配置できないオブジェクトです');
			SoundManager.playBuzzer();
			return null;
		}

		var obj = MapObject.object();
		obj.setupCommonBefore();
		obj.tileId = tileId;
		obj.tileW = w;
		obj.tileH = h;
		var flags = $gameMap.tileset().flags;
		var bottomId = MapObject.tileIdInImage(this.tileId, 0, h - 1);
		var bottomFlag = flags[bottomId];
		var topId = this.tileId;
		var topFlag = flags[topId];
		//check bottom heigher
		if (bottomFlag & 0x10) {
			obj.priority = 2;
		} else if (topFlag & 0x10) {
			//top heigher
			obj.priority = 1;
		} else {
			obj.priority = 0;
		}

		obj.setupCommonAfter();

		this.registerMapObjectTemplateWithMapObject(obj);

		return obj;
	};



	//save objData to mapEvent
	MapDecorator.saveMapObjectData = function () {
		/* search mapObjectSave event
		===================================*/
		var event = null;
		$dataMap.events.some(e => {
			if (e && this.infoCharacterTypeWithEvent(e) === 'mapObjectSave') {
				event = e;
				return true;
			}
			return false;
		});

		/* make mapObjectSave event
		===================================*/
		if (!event) {
			event = { "id": 0, "name": "EV011", "note": "<trpMapObjSetup>", "pages": [{ "conditions": { "actorId": 1, "actorValid": false, "itemId": 1, "itemValid": false, "selfSwitchCh": "A", "selfSwitchValid": false, "switch1Id": 1, "switch1Valid": false, "switch2Id": 1, "switch2Valid": false, "variableId": 1, "variableValid": false, "variableValue": 0 }, "directionFix": false, "image": { "tileId": 0, "characterName": "DecorationInfo", "direction": 4, "pattern": 0, "characterIndex": 7 }, "list": [{ "code": 0, "indent": 0, "parameters": [] }], "moveFrequency": 3, "moveRoute": { "list": [{ "code": 0, "parameters": [] }], "repeat": true, "skippable": false, "wait": false }, "moveSpeed": 3, "moveType": 0, "priorityType": 1, "stepAnime": false, "through": false, "trigger": 0, "walkAnime": false }], "x": 0, "y": 0 };
			event.id = $dataMap.events.length;
			$dataMap.events.push(event);

			//prepare pos event map
			var posEventMap = [];
			TRP_CORE.packValues(posEventMap, zLayerSize, 0);
			$dataMap.events.forEach(event => {
				if (!event) return;
				posEventMap[event.x + event.y * width] = event;
			});

			//search empty pos
			for (var i = 0; i < zLayerSize; i = (i + 1) | 0) {
				if (posEventMap[i]) continue;

				event.x = i % width;
				event.y = Math.floor(i / width);
				break;
			}
		}

		/* prepare comment command
		===================================*/
		var list = event.pages[0].list;
		var command = list[0];
		if (!command || command.code !== 108) {
			//insert comment 
			command = {
				code: 108,
				indent: 0,
				parameters: [''],
			};
			list.unshift(command);
		}

		/* make location data
		===================================*/
		var locations = [];
		for (const obj of mapObjects) {
			locations.push(obj.locationData());
		}

		/* make save data
		===================================*/
		var saveData = {
			template: this.mapObjectTemplate,
			locations: locations,
		};

		command.parameters[0] = JSON.stringify(saveData);
	};


	/* mapObjectCollision mode
	===================================*/
	MapDecorator.mapObjCollisionMode = 0;
	MapDecorator.showMapObjectCollisions = function () {
		if (!MapObject || !$dataTrpMapObjectCollisions) {
			SoundManager.playBuzzer();
			_Dev.showTempAlert('衝突判定のあるスプライトオブジェトはありません');
			return;
		}
		this.setMode('mapObjectCollision');
		this._showMapObjectCollisionBlocks();
	};


	MapDecorator._showMapObjectCollisionBlocks = function () {
		this.mapObjCollisionMode = 0;

		var positions = [];
		var color = 'rgba(255,0,0,0.5)';
		var texts = null;

		var width = $dataMap.width;
		var zLayerSize = $dataMap.width * $dataMap.height;
		var tileW = $gameMap.tileWidth();
		var tileH = $gameMap.tileHeight();


		var collisions = MapObject.collisionsMap();
		var res = MapObject.CollisionResolution;
		var rowIdx = width * res;
		for (var i = zLayerSize - 1; i >= 0; i = (i - 1) | 0) {
			var baseIdx = (i % width) * res + (Math.floor(i / width)) * res * rowIdx;
			for (var xi = res - 1; xi >= 0; xi = (xi - 1) | 0) {
				for (var yi = res - 1; yi >= 0; yi = (yi - 1) | 0) {
					if (collisions[baseIdx + xi + yi * rowIdx]) {
						positions.push(i);
						break;
					}
				}
				if (positions.contains(i)) break;
			}
		}


		var sw = tileW / res;
		var sh = tileH / res;
		var tonnerTiles = (ctx, x0, y0) => {
			/* draw blocks
			===================================*/
			ctx.fillStyle = color;
			ctx.beginPath();

			for (var i = zLayerSize - 1; i >= 0; i = (i - 1) | 0) {
				var x = i % width;
				var y = Math.floor(i / width);
				var baseIdx = x * res + y * res * rowIdx;
				for (var xi = res - 1; xi >= 0; xi = (xi - 1) | 0) {
					for (var yi = res - 1; yi >= 0; yi = (yi - 1) | 0) {
						if (collisions[baseIdx + xi + yi * rowIdx]) {
							var tx = ((x - x0) * res + xi) * sw;
							var ty = ((y - y0) * res + yi) * sh;
							ctx.moveTo(tx, ty);
							ctx.lineTo(tx + sw, ty);
							ctx.lineTo(tx + sw, ty + sh);
							ctx.lineTo(tx, ty + sh);
							ctx.lineTo(tx, ty);
						}
					}
				}
			}
			ctx.closePath();
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgb(100,0,0)'
			ctx.stroke();
			ctx.restore();

			/* draw outlines
			===================================*/
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(0,0,0)'
			for (const i of positions) {
				var x = i % width;
				var y = Math.floor(i / width);
				var tx = (x - x0) * tileW;
				var ty = (y - y0) * tileH;
				ctx.moveTo(tx, ty);
				ctx.lineTo(tx + tileW, ty);
				ctx.lineTo(tx + tileW, ty + tileH);
				ctx.lineTo(tx, ty + tileH);
				ctx.lineTo(tx, ty);
			}
			ctx.lineWidth = 2;
			ctx.closePath();
			ctx.stroke();
		};
		var drawText = (bitmap, x, y, text, i) => { };

		this.tonnerTiles(positions, texts, color, tonnerTiles, drawText);
	};

	MapDecorator._showMapObjectCollisionDirs = function () {
		this.mapObjCollisionMode = 1;

		var positions = [];
		var color = 'rgba(0,0,255,0.2)';
		var texts = [];
		for (var i = zLayerSize - 1; i >= 0; i = (i - 1) | 0) {
			var collision = $dataTrpMapObjectCollisions[i];
			if (!collision) continue;

			positions.push(i);
			texts.push(collision);
		}

		var tonnerTiles = null;
		var drawText = (bitmap, x, y, text, i) => {
			if (text === 15) {
				bitmap.fontSize = 32;
				bitmap.drawText('x', x, y, 48, 48, 'center');
				return;
			}
			bitmap.fontSize = 20;
			if (text & 1 << 0) {
				bitmap.drawText('↓', x, y + 24, 48, 24, 'center');
				bitmap.drawText('x', x, y + 24, 48, 24, 'center');
			}
			if (text & 1 << 1) {
				bitmap.drawText('←', x, y, 24, 48, 'center');
				bitmap.drawText('x', x, y, 24, 48, 'center');
			}
			if (text & 1 << 2) {
				bitmap.drawText('→', x + 24, y, 24, 48, 'center');
				bitmap.drawText('x', x + 24, y, 24, 48, 'center');
			}
			if (text & 1 << 3) {
				bitmap.drawText('↑', x, y, 48, 24, 'center');
				bitmap.drawText('x', x, y, 48, 24, 'center');
			}
		};
		this.tonnerTiles(positions, texts, color, tonnerTiles, drawText);
	};

	MapDecorator.MODE_GUIDE.mapObjectCollision = [
		'【スプライトオブジェの衝突判定確認モード】',
		'左クリック:確認モード終了',
		'右クリック:表示切り替え',
	];
	MapDecorator.onMouseDownLeftMapObjectCollision = MapDecorator.restoreModeByMouse;
	MapDecorator.updateInputMapObjectCollision = MapDecorator.updateInputToCheckRestoreMode;

	MapDecorator.onMouseDownRightMapObjectCollision = function () {
		SoundManager.playCursor();

		if (this.mapObjCollisionMode === 0) {
			this._showMapObjectCollisionDirs();
		} else {
			this._showMapObjectCollisionBlocks();
		}
	}










	//=============================================================================
	// Util Funcs
	//=============================================================================
	var anyTileId = MapDecorator.anyTileId = function (idx, env = ENV_VARS) {
		return env.data[idx] || env.data[idx + env.zAcc] || env.data[idx + env.zObj1] || env.data[idx + env.zObj2];
	};

	var layeredTileIds = MapDecorator.layeredTileIds = function (idx, env = ENV_VARS) {
		var tileIds = null;
		for (var z = 0; z < 4; z = (z + 1) | 0) {
			if (!env.data[idx + z * env.zLayerSize]) continue;

			tileIds = tileIds || [];
			tileIds.push(env.data[idx + z * env.zLayerSize]);
		}
		return tileIds
	}

	var baseTileId = MapDecorator.baseTileId = function baseTileId(tileId) {
		if (Tilemap.isAutotile(tileId)) {
			return tileId - Tilemap.getAutotileShape(tileId);
		} else {
			return tileId;
		}
	}

	function isEmptyTile(idx) {
		return isEmptyTileId(anyTileId(idx));
	}
	function isEmptyTileId(tileId) {
		if (!tileId) return true;
		if (ceilingBaseIds.contains(baseTileId(tileId))) return true;
		return false;
	}

	function idxOfRoom(idx) {
		for (var i = proc.allRoomIdxes.length - 1; i >= 0; i = (i - 1) | 0) {
			if (proc.allRoomIdxes[i].contains(idx)) {
				return i;
			}
		}
		return -1;
	};

	function idxForNeighborDir(idx, ni, zIdx = 0) {
		if (ni <= 3) {
			idx += width;
			if (idx > zLayerSize + zIdx) return -1;
		} else if (ni >= 7) {
			idx -= width;
			if (idx < zIdx) return -1;
		}
		if (ni % 3 === 1) {
			if (idx % width === 0) return -1;
			idx -= 1;
		} else if (ni % 3 === 0) {
			if (idx % width === width - 1) return -1;
			idx += 1;
		}
		return idx;
	}


	/* analyzeNeibors
	===================================*/
	// analyzer=((nx,ny,ox,oy)=>{})
	var analyzeNeighbors = MapDecorator.analyzeNeighbors = function (cx, cy, analyzer, checkTileExists = false, env = ENV_VARS) {
		var data = env.data;
		var width = env.width;
		var height = env.height;
		var zLayerSize = env.zLayerSize;

		cx = Math.floor(cx);
		cy = Math.floor(cy);

		if (!analyzer(cx, cy)) {
			return null;
		}

		var positions = [cx + cy * width];

		var foundIdxes = [];
		var currentIdxes = [];
		var checkedIdxes = [];

		var dirs = [width, -1, 1, -width];
		var dirLen = dirs.length;

		var idx = cy * width + cx;
		foundIdxes.push(idx);
		checkedIdxes.push(idx);

		while (foundIdxes.length > 0) {
			var tempIdxes = currentIdxes;
			currentIdxes = foundIdxes;
			foundIdxes = tempIdxes;
			foundIdxes.length = 0;

			var length = currentIdxes.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				idx = currentIdxes[i];
				var tx = idx % width;
				var ty = Math.floor(idx / width);
				for (var d = 0; d < dirLen; d = (d + 1) | 0) {
					var neighbor = idx + dirs[d];
					if (checkedIdxes.contains(neighbor)) {
						continue;
					}
					checkedIdxes.push(neighbor);

					if (checkTileExists) {
						if (!data[neighbor]
							&& !data[neighbor + 1 * zLayerSize]
							&& !data[neighbor + 2 * zLayerSize]
							&& !data[neighbor + 3 * zLayerSize]
						) {
							continue;
						}
					}

					//check neighbor inside map size
					if (d === 1 && tx === 0) continue;
					if (d === 2 && tx === width - 1) continue;
					if (neighbor < 0 || neighbor >= zLayerSize) continue;

					//check regionId same
					if (!analyzer(neighbor % width, Math.floor(neighbor / width), tx, ty, positions, checkedIdxes)) {
						continue;
					}

					foundIdxes.push(neighbor);
					positions.push(neighbor);
				}
			}
		}

		return positions;
	};


	/* show info on touch
	===================================*/
	var infoTextSpriteCache = [];
	function showInfoText(text, x = TouchInput.x, y = TouchInput.y) {
		var sprite = infoTextSpriteCache.pop();
		var bitmap;
		if (!sprite) {
			bitmap = new Bitmap(200, 26);
			sprite = new TRP_CORE.FadableSprite(bitmap);
			sprite.anchor.set(0.5, 0.5);

			bitmap.fontSize = bitmap.height - 4;
			bitmap.outlineWidth = 4;
			bitmap.outlineColor = 'black';
		} else {
			bitmap = sprite.bitmap;
			bitmap.clear();
		}

		SceneManager._scene.addChild(sprite);
		sprite.x = x;
		sprite.y = y;
		bitmap.drawText(text, 0, 0, bitmap.width, bitmap.height, 'center');

		MapDecorator.updateList.push(sprite);
		sprite.startFadeOut(30, 10, () => {
			if (sprite.parent) {
				sprite.parent.removeChild(sprite);
			}
			infoTextSpriteCache.push(sprite);
			TRP_CORE.remove(MapDecorator.updateList, sprite)
		});
	};




	//=============================================================================
	// Restore Map
	//=============================================================================
	MapDecorator.restoreMap = function () {
		data = originalData.concat();
		$dataMap.data = data;


		/* restore floor acc
		===================================*/
		for (const waterInfo of proc.lastWaterInfoArr) {
			if (!waterInfo) continue;
			var infoLen = waterInfo.length;
			for (var i = 0; i < infoLen; i = (i + 3) | 0) {
				var idx = waterInfo[i];
				data[idx] = waterInfo[i + 1];
				data[idx + zAcc] = waterInfo[i + 2];
				proc.waterIdxes.push(idx);
			}
		}
		for (const paintInfo of proc.lastFloorPaintInfoArr) {
			if (!paintInfo) continue;
			var infoLen = paintInfo.length;
			for (var i = 0; i < infoLen; i = (i + 3) | 0) {
				var idx = paintInfo[i];
				data[idx] = paintInfo[i + 1];
				data[idx + zAcc] = paintInfo[i + 2];
			}
		}


		/* locate obj
		===================================*/
		if (proc.locateObj) {
			this.clearNonLockedObjects();
		}

		// data = info.lockedData.concat();
		for (const objInfo of proc.lastObjInfoArr) {
			if (!objInfo) continue;
			addObjTilesWithObjInfoArr(objInfo);
		}
		if (MapObject) {
			MapObject.refreshCollisions();
		}


		SceneManager._scene._spriteset._tilemap._mapData = $dataMap.data;
		this.requestRefreshTilemap();
	}

	MapDecorator.clearNonLockedObjects = function () {
		//clear non locked info
		var length = proc.allRoomIdxes.length;
		var mapObjRemoved = false;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			if (!proc.lockedObjRoomIds.contains(i)) {
				mapObjRemoved = this.clearLastObjects(i) || mapObjRemoved;
			}
		}
		if (mapObjRemoved && MapObject) {
			MapObject.refreshCollisions();
		}
	};

	MapDecorator.clearLastObjects = function (roomId) {
		var mapObjRemoved = false;
		if (!proc.lastObjInfoArr[roomId]) {
			return mapObjRemoved;
		}

		var roomObjInfo = proc.lastObjInfoArr[roomId];
		if (roomObjInfo && MapObject) {
			for (const objInfo of roomObjInfo) {
				if (objInfo[1] instanceof MapObject) {
					var mapObj = objInfo[1];
					TRP_CORE.remove(mapObjects, mapObj);
					MapObject.remove(mapObj, true);
					mapObjRemoved = true;
				}
			}
		}
		proc.lastObjInfoArr[roomId] = [];

		return mapObjRemoved
	}


	//=============================================================================
	// Auto Tile Connection
	//=============================================================================
	// var CONNECT_TYPE = MapDecorator.CONNECT_TYPE = {
	// 	default:0,
	// };

	function connectAutoTileWithIdx(idx, connectEmpty = 0) {
		var baseId = baseTileId(data[idx]);
		if (!baseId || !Tilemap.isAutotile(baseId) || Tilemap.isWallSideTile(baseId)) {
			return baseId;
		}
		if (baseId === info.waterBaseId) {
			connectEmpty = 2;
		}

		var layerIdx = idx - idx % zLayerSize;
		var roomId = idxOfRoom(idx % zLayerSize);
		var z = proc.floorLevelZMap[idx % zLayerSize];

		var nf = TRP_CORE.packValues([], 0, 10);
		var noTileIds = connectEmpty ? TRP_CORE.packValues([], 0, 10) : null;

		for (var ni = 1; ni <= 9; ni = (ni + 1) | 0) {
			if (ni === 5) {
				nf[ni] = 1;
				continue;
			}

			var neighbor = idxForNeighborDir(idx, ni, layerIdx);
			if (neighbor < 0) {
				//outsideMap -> connect
				nf[ni] = 1;
				continue;
			}

			var tileId = data[neighbor];
			if (connectEmpty) {
				//connect to ceiling or walls
				if (!tileId || proc.ceilingIdxes.contains(neighbor) || proc.wallIdxes.contains(neighbor)
					|| (invalidIdxes && invalidIdxes.contains(neighbor))
				) {
					if (!proc.floorSuppliedIdxes.contains(neighbor)) {
						noTileIds[ni] = 1;
						nf[ni] = 1;
						continue;
					}
				}
			}

			//check same tile
			if (!tileId) continue;
			if (baseId !== baseTileId(tileId)) continue;

			//check same z
			if (proc.floorLevelZMap[neighbor % zLayerSize] !== z) {
				continue;
			}

			//check same room
			if (idxOfRoom(neighbor % zLayerSize) !== roomId) {
				continue;
			}

			//connect ok
			nf[ni] = 1;
		}

		if (connectEmpty === 2) {
			//water tile
			if (nf[2] && !noTileIds[2]) {
				if (noTileIds[6] && !noTileIds[3]) {
					nf[3] = 0;
					if (noTileIds[8]) {
						nf[6] = 0;
					}
				}
				if (noTileIds[4] && !noTileIds[1]) {
					nf[1] = 0;
					if (noTileIds[8]) {
						nf[4] = 0;
					}
				}
			}

			if (noTileIds[8]) {
				nf[7] = 0;
				nf[8] = 0;
				nf[9] = 0;
			} else if (nf[8]) {
				if (noTileIds[9] && nf[6] && !noTileIds[6]) {
					nf[9] = 0;
				}
				if (noTileIds[7] && nf[4] && !noTileIds[4]) {
					nf[7] = 0;
				}
			} else if (noTileIds[9]) {
				nf[9] = 0;
			} else if (noTileIds[7]) {
				nf[7] = 0;
			}
		}

		return connectAutoTile(baseId, nf);
	};

	function getShape(nf) {
		var neighborConnectNum = nf[2] + nf[4] + nf[6] + nf[8];

		var s;
		if (neighborConnectNum === 4) {
			s = 0;
			if (!nf[7]) s += 1;
			if (!nf[9]) s += 2;
			if (!nf[3]) s += 4;
			if (!nf[1]) s += 8;
		} else if (neighborConnectNum === 3) {
			s = 16;
			//var link3dirs = [[4,9,3],[8,3,1],[6,1,7],[2,7,9]];
			if (!nf[4]) {
				if (nf[9] && nf[3]) s += 0;
				else if (!nf[9] && nf[3]) s += 1;
				else if (!nf[3] && nf[9]) s += 2;
				else s += 3;
			} else if (!nf[8]) {
				if (nf[3] && nf[1]) s += 4;
				else if (!nf[3] && nf[1]) s += 5;
				else if (!nf[1] && nf[3]) s += 6;
				else s += 7;
			} else if (!nf[6]) {
				if (nf[1] && nf[7]) s += 8;
				else if (!nf[1] && nf[7]) s += 9;
				else if (!nf[7] && nf[1]) s += 10;
				else s += 11;
			} else if (!nf[2]) {
				if (nf[7] && nf[9]) s += 12;
				else if (!nf[7] && nf[9]) s += 13;
				else if (!nf[9] && nf[7]) s += 14;
				else s += 15;
			}
		} else if (neighborConnectNum === 2) {
			s = 32;
			if (nf[2] && nf[8]) s += 0;
			else if (nf[4] && nf[6]) s += 1;
			else if (nf[2] && nf[6]) {
				if (nf[3]) s += 2;
				else s += 3;
			} else if (nf[2] && nf[4]) {
				if (nf[1]) s += 4;
				else s += 5;
			} else if (nf[4] && nf[8]) {
				if (nf[7]) s += 6;


				else s += 7;
			} else if (nf[8] && nf[6]) {
				if (nf[9]) s += 8;
				else s += 9;
			}
		} else if (neighborConnectNum === 1) {
			s = 42;
			if (nf[2]) s += 0;
			else if (nf[6]) s += 1;
			else if (nf[8]) s += 2;
			else if (nf[4]) s += 3;
		} else {
			s = 46
		}
		return s;
	}
	function connectAutoTile(baseId, nf, s = getShape(nf)) {
		var tileId = baseId + s;
		if (!tileId) {
			connectAutoTile(baseId, nf)
		}

		return tileId;
	}










	//=============================================================================
	// ColorPicker
	//=============================================================================
	MapDecorator._colorPicker = null;
	MapDecorator._pickingColor = null;
	MapDecorator.startPickColor = function (handler) {
		if (!this._colorPicker) {
			var size = 144;
			this._colorPicker = new ColorPicker(size);
		}
		var picker = this._colorPicker;
		picker.x = 10;
		picker.y = 30;
		picker.visible = true;

		this._pickingColor = {
			handler,
			color: null,
			rgb: [null, null, null],
		};

		this.refreshColorPickGuideText();
	};
	MapDecorator.refreshColorPickGuideText = function () {
		var rgb = this._pickingColor.rgb;
		var color = this._pickingColor.color || '#ffffff';
		color = color.substring(1);
		var colors = [color.substring(0, 2), color.substring(2, 4), color.substring(4)];
		_Dev.showText('objColorPick', [
			'【色味の変更】',
			'0~9：ランダムな色味',
			'Shift+0~9:同種オブジェすべて変更',
			'R/G/B：各色固定',
			'R:%1%4,G:%2%5,B:%3%6'.format(
				parseInt(colors[0], 16), parseInt(colors[1], 16), parseInt(colors[2], 16),
				rgb[0] ? '固' : '',
				rgb[1] ? '固' : '',
				rgb[2] ? '固' : '',
			)
		], 'rgb(255,150,150)');
		SceneManager._scene.addChild(this._colorPicker);
	}
	MapDecorator.updateColorPicker = function () {
		var picking = this._pickingColor;
		this._colorPicker.update();
		var color = this._colorPicker.color();
		if (color !== picking.color) {
			picking.color = color;
			if (picking.handler) {
				picking.handler(color);
			}
			this.refreshColorPickGuideText();
		}

		if (Input.isTriggered('ok')
			|| Input.isTriggered('cancel')
			|| TouchInput.isCancelled()
			|| (TouchInput.isTriggered() && !this._colorPicker._touching)
		) {
			_Dev.showText('objColorPick', null);
			this._pickingColor = null;
			this._colorPicker.visible = false;
			SoundManager.playOk();
		}
	};
	MapDecorator.onKeyDownPickingColor = function (event) {
		if (event.code.indexOf('Digit') === 0) {
			var keyNum = Number(event.code.replace('Digit', ''));
			var rate = keyNum * 0.1;
			if (!rate) {
				rate = 0.05;
			}

			if (event.shiftKey) {
				this.setRandomColorsToAllEditingKindMapObjects(rate);
			} else {
				this.setRandomColor(rate);
			}
			SoundManager.playCursor();
		} else if (event.key === 'r') {
			this.switchRGBLock(0);
		} else if (event.key === 'g') {
			this.switchRGBLock(1);
		} else if (event.key === 'b') {
			this.switchRGBLock(2);
		}
	};

	MapDecorator.switchRGBLock = function (idx) {
		if (!this._pickingColor) return;
		var rgb = this._pickingColor.rgb;
		if (!rgb) return;

		if (rgb[idx]) {
			rgb[idx] = null;
		} else {
			var color = this._pickingColor.color;
			if (!color) {
				SoundManager.playBuzzer();
				return;
			}

			var value = color.substring(1 + idx * 2, 1 + idx * 2 + 2);
			rgb[idx] = value;
		}
		SoundManager.playCursor();
		MapDecorator.refreshColorPickGuideText();
	};
	MapDecorator.setRandomColor = function (rate) {
		var color = this.randomColorWithRate(rate);
		this._colorPicker.setColor(color);

		if (this._pickingColor.handler) {
			this._pickingColor.handler(color);
		}
	};
	MapDecorator.setRandomColorsToAllEditingKindMapObjects = function (rate) {
		var locObj = this.lastLocateMapObj;
		if (Array.isArray(locObj)) {
			locObj = this._convertedMapObjMap[JSON.stringify(locObj)];
		}
		if (!locObj) {
			SoundManager.playBuzzer();
			return;
		}

		var tag = locObj.tag;
		for (const obj of $dataTrpMapObjects) {
			if (!obj || obj.tag !== tag) continue;

			var color = this.randomColorWithRate(rate);
			color = Number(color.replace('#', '0x'));
			obj.tint = color;
			if (obj.sprite) {
				obj.sprite.tint = color;
			}
		}
	};
	MapDecorator.randomColorWithRate = function (rate) {
		var color = '#';
		for (var i = 0; i < 3; i = (i + 1) | 0) {
			if (this._pickingColor.rgb[i]) {
				//locked color
				color += this._pickingColor.rgb[i];
			} else {
				var r10 = 255 - Math.floor(Math.randomInt(256) * rate);
				var r16 = r10.toString(16);
				if (r16.length === 0) r16 = '0' + r16;
				color += r16;
			}
		}
		return color;
	};


	/* ColorPicker
	===================================*/
	function ColorPicker() {
		this.initialize.apply(this, arguments);
	};
	ColorPicker.colorWithHsv = function (h, s, v) {
		var max = v;
		var min = max - ((s / 255) * max);
		var r, g, b;
		if (h <= 60) {
			r = max;
			g = (h / 60) * (max - min) + min;
			b = min;
		} else if (h <= 120) {
			r = ((120 - h) / 60) * (max - min) + min;
			g = max;
			b = min;
		} else if (h <= 180) {
			r = min;
			g = max;
			b = ((h - 120) / 60) * (max - min) + min;
		} else if (h <= 240) {
			r = min;
			g = ((240 - h) / 60) * (max - min) + min;
			b = max;
		} else if (h <= 300) {
			r = ((h - 240) / 60) * (max - min) + min;
			g = min;
			b = max;
		} else {
			r = max;
			g = min;
			b = ((360 - h) / 60) * (max - min) + min;
		}
		r = Math.round(r).toString(16);
		g = Math.round(g).toString(16);
		b = Math.round(b).toString(16);
		if (r.length === 1) r = '0' + r;
		if (g.length === 1) g = '0' + g;
		if (b.length === 1) b = '0' + b;
		var color = '#' + r + g + b;
		return color;
	};

	ColorPicker.HUE_WIDTH = 20;
	ColorPicker.MARGIN = 3;

	ColorPicker.prototype = Object.create(PIXI.Container.prototype);
	ColorPicker.prototype.constructor = ColorPicker;
	ColorPicker.prototype.initialize = function (size) {
		PIXI.Container.call(this);

		this._size = size;

		this._hue = -1;
		this._saturation = -1;
		this._value = -1;
		this._color = null;

		this._touchingHue = false;
		this._touchingSv = false;
		this._touching = false;

		var margin = ColorPicker.MARGIN;
		var hueWidth = ColorPicker.HUE_WIDTH;
		var totalWidth = margin * 3 + size + hueWidth;
		var totalHeight = margin * 2 + size;

		var bitmap, sprite;

		//this > backBitmap
		bitmap = new Bitmap(16, 16);
		bitmap.fillAll('rgba(0,0,0,0.5)');
		sprite = new Sprite(bitmap);
		this.addChild(sprite);
		sprite.scale.set(totalWidth / 16, totalHeight / 16);
		this._backSprite = sprite;


		//pickerSprite
		bitmap = new Bitmap(size, size);
		sprite = new Sprite(bitmap);
		this.addChild(sprite);
		sprite.x = margin;
		sprite.y = margin;
		this._pickerSprite = sprite;
		this.bitmap = bitmap;

		//huePicker
		bitmap = new Bitmap(hueWidth, size);
		sprite = new Sprite(bitmap);
		this.addChild(sprite);
		sprite.x = margin * 2 + size;
		sprite.y = margin;
		this._huePicker = sprite;

		//pointer
		bitmap = new Bitmap(16, 16);
		sprite = new Sprite(bitmap);
		this.addChild(sprite);
		sprite.anchor.set(0.5, 0.5);
		this._pointer = sprite;
		var ctx = bitmap._context;
		ctx.beginPath();
		ctx.arc(8, 8, 6, 0, 360 * Math.PI / 180, false);
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fill();
		ctx.beginPath();
		ctx.arc(8, 8, 3, 0, 360 * Math.PI / 180, false);
		ctx.globalCompositeOperation = "destination-out";
		ctx.fill();

		//huePointer
		var lineWidth = 2;
		var spaceHeight = 2;
		bitmap = new Bitmap(hueWidth + lineWidth * 2, spaceHeight + lineWidth * 2);
		sprite = new Sprite(bitmap);
		this.addChild(sprite);
		sprite.anchor.set(0.5, 0.5);
		this._huePointer = sprite;
		bitmap.fillAll('black');
		bitmap.clearRect(lineWidth, lineWidth, bitmap.width - lineWidth * 2, bitmap.height - lineWidth * 2);


		this.setupHuePicker();
		this.setColor('rgb(255,255,255)');
	};

	ColorPicker.prototype.setupHuePicker = function () {
		var bitmap = this._huePicker.bitmap;
		var width = bitmap.width;
		var height = bitmap.height;

		var s = 255;
		var v = 255;
		for (var y = 0; y < height; y = (y + 1) | 0) {
			var h = 360 * (y / height);
			var color = ColorPicker.colorWithHsv(h, s, v);
			bitmap.fillRect(0, y, width, 1, color);
		}
	};

	ColorPicker.prototype.setupPalette = function (h) {
		var bitmap = this._pickerSprite.bitmap;
		bitmap.clear();

		var width = this.width;
		var height = this.height;

		var r, g, b;
		for (var x = 0; x < width; x = (x + 1) | 0) {
			var s = 255 * x / width;
			for (var y = 0; y < height; y = (y + 1) | 0) {
				var v = 255 * y / height;
				var color = ColorPicker.colorWithHsv(h, s, v);
				bitmap.fillRect(x, height - y - 1, 1, 1, color);
			}
		}
	};

	ColorPicker.prototype.setColor = function (color) {
		var r, g, b;
		if (color.indexOf('rgb') !== 0) {
			if (color[0] == "#") {
				color = color.substr(1);
			} else if (color.indexOf("0x") === 0) {
				color = color.substr(2);
			}
			if (color.length == 8) {
				color = color.substr(2);
			}
			r = parseInt(color.substr(0, 2), 16);
			g = parseInt(color.substr(2, 2), 16);
			b = parseInt(color.substr(4, 2), 16);
		} else {
			var args = color.match(/\((.+)\)/)[1].split(',');
			r = Number(args[0]);
			g = Number(args[1]);
			b = Number(args[2]);
		}

		var h, s, v;
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		if (r === g && g === b) {
			h = Math.max(0, this._hue);
		} else if (r >= g && r >= b) {
			h = 60 * (g - b) / (max - min);
		} else if (g >= r && g >= b) {
			h = 60 * (b - r) / (max - min) + 120;
		} else {
			h = 60 * (r - g) / (max - min) + 240;
		}

		s = (max - min) / max * 255;
		v = max;

		if (h < 0) {
			h += 360;
		} else if (h > 360) {
			h -= 360;
		}

		this.setHue(h);
		this.setSV(s, v);
	};

	ColorPicker.prototype.updateResultColor = function () {
		this._color = ColorPicker.colorWithHsv(this._hue, this._saturation, this._value);
	};

	ColorPicker.prototype.color = function () {
		return this._color;
	};

	ColorPicker.prototype.setHue = function (h) {
		h = h.clamp(0, 360);
		if (this._hue === h) return;

		var dh = h - this._hue;
		this._hue = h;
		this.setupPalette(this._hue);

		var sprite = this._huePicker;
		var pointer = this._huePointer;
		pointer.x = sprite.x + sprite.width / 2;
		pointer.y = sprite.y + sprite.height * h / 360;

		this.updateResultColor();
	};

	ColorPicker.prototype.setSV = function (s, v) {
		if (this._saturation === s && this._value === v) return;

		this._saturation = s;
		this._value = v;

		var margin = ColorPicker.MARGIN
		var size = this._size;

		var pointer = this._pointer;
		pointer.x = margin + Math.round((s / 255) * size);
		pointer.y = margin + Math.round(size - (v / 255) * size - 1);

		this.updateResultColor();
	};

	ColorPicker.prototype.update = function () {
		if (!this.visible) {
			this._touchingHue = false;
			this._touchingSv = false;
			return;
		}
		if (!TouchInput.isTriggered() && !TouchInput.isPressed()) {
			this._touchingHue = false;
			this._touchingSv = false;
			return;
		}
		this._touching = false;

		var x = TouchInput.x - this.x;
		var y = TouchInput.y - this.y;
		var dx, dy, touchInside;

		var hPicker = this._huePicker;
		dx = x - hPicker.x;
		dy = y - hPicker.y;

		touchInside = (dx >= 0 && dx <= hPicker.width && dy >= 0 && dy <= hPicker.height);
		if (this._touchingHue || (!this._touchingSv && touchInside)) {
			dy = dy.clamp(0, hPicker.height - 1);
			var hue = Math.round(dy / (hPicker.height - 1) * 360);
			this.setHue(hue);
			this._touchingHue = true;
			this._touching = true;
			return;
		}

		var svPicker = this._pickerSprite;
		dx = x - svPicker.x;
		dy = y - svPicker.y;
		touchInside = (dx >= 0 && dx <= svPicker.width && dy >= 0 && dy <= svPicker.height);
		if (this._touchingSv || (!this._touchingHue && touchInside)) {
			dx = dx.clamp(0, svPicker.width - 1);
			dy = dy.clamp(0, svPicker.height - 1);
			var s = Math.round(dx / (svPicker.width - 1) * 255);
			var v = Math.round((svPicker.height - 1 - dy) / (svPicker.height - 1) * 255);
			this.setSV(s, v);
			this._touchingSv = true;
			this._touching = true;
			return;
		}
	};



})();