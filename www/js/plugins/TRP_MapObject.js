//=============================================================================
// TRP_MapObject.js
//=============================================================================

// Utils
// Spriteset_Map

// MapObject
// Static Funcs
// refreshCollisions

// prototype Funcs
// Animation
// Template

// MapObjectSprite


// ConfigManager
// 競合:テンプレートプラグイン対応



/*:
 * @target MZ
 * @author Thirop
 * @plugindesc スプライトでのマップオブジェクト表示
 * @base TRP_CORE
 * @orderAfter TRP_CORE
 * @orderBefore TRP_MapDecorator
 *
 * @help
 * 【導入】
 * 以下のプラグインより下に配置
 * ・TRP_CORE.js<必須:ver1.24~>
 *
 * また。以下のプラグインより"上"に配置
 * ・TRP_MapDecorator.js<オプション>
 *
 * 
 * 【更新履歴】
 * 1.25 2023/01/20 拡張:オーバーレイ画像のレイヤーまとめ＆代替機能
 * 1.24 2023/01/19 修正:TRP_COREのアップデートに対応
 * 1.19 2023/01/10 修正:オブジェ配置済みマップを再編集後にオブジェが消える不具合修正
 * 1.16 2023/01/10 修正:MVでブレンドモード使用時のエラー修正
 * 1.15 2023/01/08 修正:マップ保存済みオブジェクトの内部管理タグの変更
 * 1.14 2022/12/25 拡張:パラメータ追加(不透明度,反転,色合い,ブレンドモード)
 * 1.04 2022/11/12 競合:テンプレートイベントプラグイン
 * 1.02 2022/11/09 修正:リプレーサー不具合（縦横サイズが違うタイルの置換ミス）
 * 1.00 2022/10/27 初版
 *
 * 
 *
 * 【概要】
 * タイルの代わりにスプライトでマップにオブジェクトを表示するプラグインです。
 *
 * イベントのメタタグ（メモ欄）を使って「位置/拡大率/角度」などを微調整できるほか、
 * ちょっとしたモーションをつけることも可能です。
 *
 * イベントで配置するよりも処理が軽いため、大量に配置したい場合にも有効です。
 *
 *
 * □使用例
 * ・モーションをつけて「揺れる草木」
 * ・テーブルや崖からはみ出てみえるオブジェクトをスプライト化して位置調整
 *
 *
 * □その他の特徴
 * ・イベント表示よりも低負荷なスプライト表示
 * 　└画面内のオブジェクトにのみスプライトを付与
 * ・独自の衝突判定機構（大きな画像の衝突判定も○）
 * 　└衝突判定マップを事前に作成するため、数が増えても負荷は変わらず
 * 　└半歩移動やドット移動などのプラグインとは競合可能性あり
 * 　　└競合する場合はプラグイン設定「衝突判定の無効」をONに
 * ・複雑な衝突判定の設定
 *   └1/4マス単位の剛体判定を設定可能
 *   └ドット単位で配置しても「それらしい衝突判定」を自動で算出
 *
 *
 * ……マップ装飾プラグインの目標支援額達成後に、
 * 「オブジェクトの手動配置」機能が追加されますが、
 * その際にスプライトで配置させる機能も用意して
 * ドット単位で楽に配置ができるようになる予定です。
 *
 * それまでは、用途は少なめかもです。
 *
 *
 *
 * 【スプライトオブジェの配置】
 * イベントのメモ欄に<obj>と記述するだけです。
 * 他に、メモ欄のメタタグを使ってスプライトの表示を微調整可能です。
 *
 * □タイル画像の幅・高さ
 * 「<w:横幅><h:縦幅>」
 * ２マス以上のタイル画像を設定できます。
 * イベントのタイル画像は「始点となる左上のタイル」を選択してください。
 * ただし、座標は「イベント位置を起点に上に木が生える」イメージで設置してください。
 *
 * 例)<w:2><h:3>
 * タイル画像を横幅２マス、縦幅３マスに変更
 *
 *
 * □位置の調整
 * 「<dX:x方向の値><dY:y方向の値>」
 * 小数単位で調整したいときはこのタグを使用してください
 *
 * 例）<dX:0.5><dY:0.2>
 * 右に0.5、下に0.2マスずらす
 *
 *
 * □拡大率の変更
 * 「<scale:拡大率(%)>」
 * または「<scaleX:X方向拡大率(%)><scaleY:Y方向拡大率(%)>」
 *
 * 例）<scaleX:100><scaleY:150>
 * 横方向に等倍(100%)、縦方向に1.5倍(150%)
 *
 * □左右の反転
 * 「<mirror>」
 *
 * □角度の変更
 * 「<angle:角度>」
 *
 * □不透明度の変更
 * 「<opacity:不透明度(0~255)>」
 *
 * □ブレンドモードの変更
 * 「<blend:0~3>」
 * 0:通常、1:加算、2:乗算、3:スクリーン
 * 4:オーバーレイ（要:MVまたはMZかつpixi-picture_for_MZ_160導入）
 * オーバーレイに関しては後述
 *
 *
 * □アンカーの変更(高度)
 * 「<anchorX:X方向の値><anchorY:Y方向の値>」
 * アンカーとは画像の中心を表すパラメータです。
 * デフォルトでは画像は「横方向は真ん中(0.5)、縦方向は下端(1.0)」
 * このアンカー位置を中心に、スプライトは拡大・回転などします。
 * 
 *
 * □画像のトリム(高度)
 * 「<trim>」
 * スプライトを拡大・回転させるととなりのドットが見えてしまう場合があります。
 * トリム設定を行うことで「画像を上下左右に１ドット切り詰めて」
 * 拡大時などの表示を整えます。
 * ただし、上下左右の一番端にもドットがある画像は表示が崩れるので注意。
 * 
 *  
 * □画面外の判定余白(高度)
 * 「<marginX:X方向の値><marginY:Y方向の値>」
 * 基本的に使うことはない設定です。
 *
 * マップオブジェクトは画面内に入るタイミングでスプライトが与えられて表示
 * されますが、なんらかのバグなどで画面内外の判定が狂うと
 * オブジェクトが急に現れるように表示される場合があります。
 *
 * その際は、このタグを使って判定余白を広げてください。
 * ※デフォルトは1(タイル)
 *
 *
 *
 * 【自動リプレーサー】
 * イベントとして１個１個配置していくほかに、
 * すでにタイルで配置してるオブジェクトを一括で置換することも可能です。
 *
 * 画像(タイル)ごとに１つイベントでオブジェクトの設定をし、
 * その際に<obj>のかわりに<obj:replace>とするだけです。
 *
 * マップ中のタイル配置パターンを検索し、自動でスプライトに置き換えてくれます。
 * 
 *
 *
 * 
 * 【衝突判定の設定】
 * ※プライオリティが「通常キャラと同じ」以外では衝突判定無いので注意
 *
 * タイル画像を使用する場合は、衝突判定はタイルセットの設定が使用されます。
 * また、タイル以外の画像の場合はサイズにかかわらず１マス分の衝突判定です。
 *
 * この衝突判定はイベントの「文章のスクロール表示」コマンドを使って
 * 独自の設定に変更することが可能です。
 *
 * 設定する衝突判定は「1/4マス単位」で設定し、<dX>などで位置を微調整した際に、
 * マス単位でそれっぽい衝突判定の自動計算を行います。
 *
 *
 * □設定例(文章のスクロール表示コマンド)
 * [collision]
 * oooo|oooo
 * oooo|oooo
 * oooo|oooo
 * oooo|oooo
 * ooxx|xxoo
 * ooxx|xxoo
 * ooxx|xxoo
 * ooxx|xxoo
 *
 * １行目は[collision]として衝突判定の設定を開始
 * 以降は1/4タイルごとの判定を
 * 「o(小文字のオー)」は通行可能
 * 「x(小文字のエックス)」は通行不可
 * として設定します。
 *
 * 間の「|」はタイルの区切り目をみやすくするたｍのもので
 * 入れなくても問題ありません。
 *
 * 例は2x2の木のタイルを想定した設定例で、
 * 幹の根本部分、ちょうど１タイル(4x4)の大きさの通行不可判定を持ちます。
 * (実際にはマス目に沿って配置すると幹の両サイドのマスが通行不可と算出されます)
 *
 * なお、上部分は省略することができ、
 * 
 * [collision]
 * ooxx|xxoo
 * ooxx|xxoo
 * ooxx|xxoo
 * ooxx|xxoo
 *
 * としても同じです。
 * 
 * 
 *
 * 【アニメーション設定】
 * 「揺れる草木」「ガタガタ震える食器」「浮遊するクリスタル」
 *　など、ちょっとしたアニメーションを設定可能です。
 * （衝突判定・画面外判定には影響しないため移動させすぎないこと）
 * 
 * 具体的な設定方法はサンプルプロジェクトのイベントの注釈を参考に！
 * (readme.txtにサンプルプロジェクトで使用してる設定方法を一応まとめておきました。)
 * 
 *
 * ◆ブレンド(合成)モード「オーバーレイ」の負荷について
 * ブレンドモード「オーバーレイ」はマップに濃淡をつけるのに
 * 便利ですが、他のブレンドモードより高負荷です。
 *
 * 特に、ツクールMZではMVよりも負荷が高く、
 * スマートフォンや低スペックPCでは非推奨となります。
 *
 * オプションやプラグインコマンドでブレンドモード：オーバーレイの
 * フォグを無効・有効の設定することができるので適宜設定してください。
 * ・MV形式コマンド「mapObject enableOverlay on/off」
 * ・スクリプト「ConfigManager.trpMapObjEnableOverlay = true」(またはfalse)
 * （キー名を変えてるときは設定したConfigManager.キー名）
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
 * 【競合対応】
 * リクエストにより以下のプラグインへの競合対応を行いました。
 *
 * □イベントテンプレートプラグイン
 * プラグイン設定「競合:テンプレートプラグイン」をONにしてください。
 * 
 * テンプレート使用時にはイベントのメモ欄に「<TE:1><obj>」のように
 * 「<obj>」のメタパラメータも必要なので注意。
 * ※自動装飾テンプレートマップには使用不可
 *
 *
 *
 *
 *
 * @command enableOverlay
 * @text オーバーレイ設定変更
 * @desc ブレンドモード：オーバーレイ表示のON/OFF設定
 * 
 * @arg flag
 * @text フラグ設定
 * @desc ブレンドモード：オーバーレイ表示のON/OFF設定
 * @type boolean
 * @default true
 *
 *
 *
 *
 * @param metaKey
 * @text メタ設定のキー名
 * @desc メタ設定のキー名（デフォはobj。<obj>または<obj:タイプ名>で使用）
 * @default obj
 * @type string
 *
 * @param disableCollision
 * @text 衝突判定の無効
 * @desc 独自衝突判定を無効化(プラグイン競合用)
 * @default false
 * @type boolean
 *
 *
 * @param overlaySubstitute
 * @text オーバーレイ画像代替
 * @desc オプションなどでオーバーレイ無効時にオーバーレイ使用画像の代替画像を設定（未設定時は完全非表示）
 * @type struct<OverlaySubstitute>[]
 * @default 
 *
 *
 * @param pgTemplateEvent
 * @text [競合]テンプレートイベント対応
 * @desc ONでテンプレートイベントプラグインに対応。※自動装飾テンプレートマップには使用不可
 * @default false
 * @type boolean
 *
 *
 * @param categoryOverlay
 * @text 【オーバーレイ設定】
 * @default ブレンドモード：オーバーレイに関する設定
 *
 * @param disableOverlayContainer
 * @text レイヤーコンテナ無効化[MZ]
 * @desc Zレイヤーごとにコンテナにまとめて一括でブレンドモードを適用して負荷を軽減する機能を無効化。<MZ用>
 * @default false
 * @type boolean
 * @parent categoryOverlay
 *
 *
 * @param enableOverlayOnInit
 * @text 開始時オーバーレイ設定
 * @desc ゲーム開始時のブレンドモード：オーバーレイのマップオブジェ有効設定初期値
 * @default true
 * @type boolean
 * @parent categoryOverlay
 *
 * @param enableOverlayOnMobileDevice
 * @text スマホのオーバーレイ設定
 * @desc スマホプレイ時のブレンドモード：オーバーレイのマップオブジェ有効設定初期値
 * @default false
 * @type boolean
 * @parent categoryOverlay
 *
 * @param optionIndex
 * @text オバレオプション表示順
 * @desc オーバーレイ無効・代替使用のオプションメニューへの表示順。-1でオプション追加なし
 * @type number
 * @default -1
 * @min -1
 * @parent categoryOverlay
 *
 * @param optionName
 * @text オプション名
 * @desc オプションに表示する名称
 * @type string
 * @default ブレンド：オーバーレイ
 * @parent categoryOverlay
 *
 * @param optionKey
 * @text オバレオプションキー
 * @desc オーバーレイオプションの内部保存キー。FogTexture.jsのキーと揃えると連動可能。
 * @default trpMapObjEnableOverlay
 * @parent categoryOverlay
 *
 *
 *
 *
 */
//============================================================================= 
/*~struct~OverlaySubstitute:
 * @param srcImage
 * @text 代替対象のキャラ画像
 * @desc 代替対象のキャラ画像
 * @type file
 * @default img/characters/
 *
 * @param dstImage
 * @text →代替後のキャラ画像
 * @desc 代替後のキャラ画像。未設定で画像の変更なし
 * @type file
 * @default img/characters/
 *
 * @param dstBlend
 * @text →代替後のブレンド
 * @desc 代替後のブレンドモード。デフォルトは1<加算>（0:通常,2:乗算,3:スクリーン)
 * @type number
 * @min 0
 * @default 1
 *
 * @param dstOpacityRate
 * @text →代替後の不透明度割合
 * @desc 代替後のオパシティ<不透明度>の変更割合。デフォルトは1.0変更なし。
 * @default 1.0
 * @type number
 * @min 0
 * @decimals 2
 *
 */
//============================================================================= 


var $dataTrpMapObjectCollisions = null;
var $dataTrpMapObjects = null;

(function () {
	'use strict';

	var _Dev = TRP_CORE.DevFuncs;
	var useBlendFilter = PIXI.picture && PIXI.picture.getBlendFilter;
	var isMZ = Utils.RPGMAKER_NAME === "MZ";


	var pluginName = 'TRP_MapObject';
	var parameters = PluginManager.parameters(pluginName);
	var metaKey = parameters.metaKey || 'obj';
	var disableCollision = parameters.disableCollision === 'true';
	var pgTemplateEvent = (parameters.pgTemplateEvent === 'true' || parameters.pgTemplateEvent === true);

	var substituteMap = {};
	parameters.overlaySubstitute = TRP_CORE.parsePluginParameters(parameters.overlaySubstitute || "[]") || [];
	(() => {
		parameters.overlaySubstitute.forEach(data => {
			var srcImage = data.srcImage.replace('img/characters/', '');
			var dstImage = data.dstImage.replace('img/characters/', '');
			substituteMap[srcImage] = {
				image: dstImage,
				blendMode: data.dstBlend,
				opacityRate: data.dstOpacityRate
			};
		});
	})();

	var disableOverlayContainer = !isMZ || parameters.disableOverlayContainer === 'true' || parameters.disableOverlayContainer === true;
	var enableOverlayOnInit = parameters.enableOverlayOnInit === 'true' || parameters.enableOverlayOnInit === true;
	var enableOverlayOnMobileDevice = parameters.enableOverlayOnMobileDevice === 'true' || parameters.enableOverlayOnMobileDevice === true;
	var optionIndex = parameters.optionIndex === undefined ? -1 : Number(parameters.optionIndex);
	var optionName = parameters.optionName || 'ブレンド：オーバーレイ';
	var optionKey = parameters.optionKey = parameters.optionKey || 'trpMapObjEnableOverlay';




	//=============================================================================
	// Plugin Command
	//=============================================================================
	if (isMZ) {
		PluginManager.registerCommand(pluginName, 'enableOverlay', function (args) {
			ConfigManager[optionKey] = args.flag === 'true' || args.flag === true;
			ConfigManager.save();
		});
	};

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if (command === 'mapObject' || command === 'mapObj') {
			if (args[0] && args[0] === 'enableOverlay') {
				ConfigManager[optionKey] = args[1] !== 'off' && args[1] !== 'false';
				ConfigManager.save();
			}
		} else {
			_Game_Interpreter_pluginCommand.call(this, ...arguments);
		}
	};




	//=============================================================================
	// Utils
	//=============================================================================
	function supplement(defaultValue, optionArg) {
		if (optionArg === undefined) {
			return defaultValue;
		}
		return optionArg;
	};
	function supplementNum(defaultValue, optionArg) {
		return Number(supplement(defaultValue, optionArg));
	};


	//=============================================================================
	// DataManager
	//=============================================================================
	var _DataManager_onLoad = DataManager.onLoad;
	DataManager.onLoad = function (object) {
		_DataManager_onLoad.call(this, ...arguments);

		if (object === $dataMap && !!$gameMap) {
			MapObject.onLoadMapData();
		}
	};





	//=============================================================================
	// Spriteset_Map
	//=============================================================================
	var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
	Spriteset_Map.prototype.createLowerLayer = function () {
		_Spriteset_Map_createLowerLayer.call(this, ...arguments);
		this._trpMapObjectOverlayLayers = [];
	};


	var _Spriteset_Map_update = Spriteset_Map.prototype.update;
	Spriteset_Map.prototype.update = function () {
		_Spriteset_Map_update.call(this);
		if ($dataTrpMapObjects.length) {
			this.updateTrpMapObjects();
		}
	};

	Spriteset_Map.prototype.updateTrpMapObjects = function () {
		var dispX = $gameMap.tileWidth() * $gameMap._displayX;
		var dispY = $gameMap.tileHeight() * $gameMap._displayY;

		var objects = $dataTrpMapObjects;
		for (var i = objects.length - 1; i >= 0; i = (i - 1) | 0) {
			objects[i].update(this, dispX, dispY);
		}
	};



	//=============================================================================
	// Game_Map
	//=============================================================================
	if (!disableCollision) (() => {
		var _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
		Game_Map.prototype.checkPassage = function (x, y, bit) {
			if ($dataTrpMapObjectCollisions) {
				if ($dataTrpMapObjectCollisions[x + y * $dataMap.width] & bit) {
					return false;
				}
			}
			return _Game_Map_checkPassage.call(this, ...arguments);
		};
	})();



	//=============================================================================
	// MapObject
	//=============================================================================
	var MapObject = TRP_CORE.MapObject = function MapObject() {
		this.initialize.apply(this, arguments);
	};



	//=============================================================================
	// Static Funcs
	//=============================================================================
	MapObject._cache = [];
	MapObject._bitmapObjMap = {};
	MapObject._cacheSprites = [];

	MapObject.object = function () {
		var obj = MapObject._cache.pop();
		if (!obj) {
			obj = new MapObject();
			this.maxObjectNum += 1;
		}
		return obj;
	};

	MapObject.metaParam = function (event) {
		return event.meta[metaKey] || null;
	};

	MapObject.objectFromEventData = function (event) {
		var obj = this.object();
		obj.setupWithEvent(event);
		if (obj.invalid) return null;
		return obj;
	};
	MapObject.objectFromTemplateData = function (template, location = null) {
		var obj = this.object();
		obj.setupWithTemplate(template, location);
		if (obj.invalid) return null;
		return obj;
	};
	MapObject.cache = function (obj) {
		obj.releaseSprite();
		obj.initialize();
		this._cache.push(obj);
	};

	MapObject.clearCache = function () {
		this._cache.length = 0;
		this._bitmapObjMap = {};
		this._cacheSprites.length = 0;
	};

	MapObject.registerBitmapLoadListener = function (obj, bitmap) {
		var url = bitmap._url;
		if (!this._bitmapObjMap[url]) {
			this._bitmapObjMap[url] = [obj];
			bitmap.addLoadListener(() => {
				for (const obj of this._bitmapObjMap[url]) {
					obj.onLoadBitmap(bitmap);
				}
				delete this._bitmapObjMap[url];
			});
		} else {
			TRP_CORE.uniquePush(
				this._bitmapObjMap[url], obj
			);
		}
	};

	MapObject.cacheSprite = function (sprite) {
		if (sprite.parent) {
			sprite.parent.removeChild(sprite);
		}
		if (sprite._destroyed) {
			return;
		}
		sprite.filters = null;

		sprite.clear();
		this._cacheSprites.push(sprite);

		this.showObjectNumSummary();
	};

	MapObject.maxObjectNum = 0;
	MapObject.maxSpriteNum = 0;
	MapObject.sprite = function () {
		if (this._cacheSprites.length) {
			return this._cacheSprites.pop();
		} else {
			MapObject.maxSpriteNum += 1;
			this.showObjectNumSummary();
			return new MapObjectSprite();
		}
	};

	MapObject.showObjectNumSummary = function () {
		return;
		// _Dev.showText('num',[
		// 	'','','',
		// 	'マップ上:'+this.maxObjectNum,
		// 	'表示中:'+(MapObject.maxSpriteNum-this._cacheSprites.length),
		// 	'キャッシュ:'+this._cacheSprites.length,
		// ]);
	};


	/* onLoadMapData
	===================================*/
	MapObject.onLoadMapData = function () {
		$dataTrpMapObjectCollisions = null;
		$dataTrpMapObjects = [];


		var events = $dataMap.events;
		var tempDeleted = [];
		var replaceList = [];

		this._setupEventTemplates = null;
		for (var i = events.length - 1; i >= 0; i = (i - 1) | 0) {
			var event = events[i];
			if (!event) continue;

			if (event.meta.trpMapObjSetup) {
				this.setupTrpMapObjectsWithSetupEvent(event);
				events[i] = null;
			} else if (event.meta[metaKey] === 'replace') {
				replaceList.unshift(event);
				events[i] = null;
			} else if (event.meta.trpMapObjSetup || event.meta[metaKey]) {
				var mapObj = MapObject.objectFromEventData(event);
				events[i] = null;

				if (!mapObj) continue;
				this.tryAdd(mapObj, true);
			}
		}

		//replace tiles with mapObj
		for (const event of replaceList) {
			MapObject.tryReplaceTiles(event);
		}

		if (!disableCollision) {
			this.refreshCollisions();
		}
	};


	MapObject._setupEventTemplates = null;
	MapObject.setupTrpMapObjectsWithSetupEvent = function (event) {
		var command = event.pages[0].list[0];
		if (!command || command.code !== 108) return;

		var saveData = JSON.parse(command.parameters[0]);
		var templateMap = saveData.template;
		MapObject._setupEventTemplates = templateMap;
		var locations = saveData.locations;

		for (const location of locations) {
			var tag = location[0];
			var template = templateMap[tag];
			if (!template) continue;

			var mapObj = MapObject.objectFromTemplateData(template, location);
			if (!mapObj) continue;

			// mapObj.tag *= -1;
			this.tryAdd(mapObj, true);
		}
	};

	MapObject.tryReplaceTiles = function (event) {
		var template = this.makeTemplateWithEvent(0, event);
		var tag = template.tag;
		var mapObj = this.objectFromTemplateData(template);
		if (!mapObj) return;

		var tileId = mapObj.tileId;
		if (!tileId) return;


		//tileIds
		var w = mapObj.tileW;
		var h = mapObj.tileH;
		var tileIds = [];
		for (var yi = 0; yi < h; yi = (yi + 1) | 0) {
			var row = [];
			tileIds.push(row);
			for (var xi = 0; xi < w; xi = (xi + 1) | 0) {
				row.push(this.tileIdInImage(tileId, xi, yi));
			}
		}

		//prepare params
		var data = $dataMap.data;
		var width = $dataMap.width;
		var height = $dataMap.height;
		var zLayerSize = width * height;
		var maxIdx = zLayerSize - (h - 1) * width;
		for (var i = 0; i < maxIdx; i = (i + 1) | 0) {
			//check width ok
			if (i % width + (w - 1) >= width) continue;

			//check tileIds match
			for (var proc = 0; proc < 2; proc = (proc + 1) | 0) {
				var tileMatch = false;
				for (var yi = 0; yi < h; yi = (yi + 1) | 0) {
					for (var xi = 0; xi < w; xi = (xi + 1) | 0) {
						tileMatch = false;
						var tileId = tileIds[yi][xi]
						for (var z = 0; z < 4; z = (z + 1) | 0) {
							if (data[z * zLayerSize + i + xi + yi * width] === tileId) {
								if (proc) {
									//replace id
									data[z * zLayerSize + i + xi + yi * width] = 0;
								}
								tileMatch = true;
								break;
							}
						}
						if (!tileMatch) break;
					}
					if (!tileMatch) break;
				}
				if (!tileMatch) break;
			}

			if (!tileMatch) continue;



			//add mapObject
			mapObj = mapObj || this.objectFromTemplateData(template);

			var x = (i % width) + w / 2;
			var y = Math.floor(i / width) + h;
			mapObj.x = x * mapObj._tileW;
			mapObj.y = y * mapObj._tileH;
			//anchor adjust
			mapObj.x -= (0.5 - mapObj.anchorX) * mapObj._tileW * w;
			mapObj.y -= (1 - mapObj.anchorY) * mapObj._tileH * h;
			if (mapObj.trim) {
				mapObj.x += mapObj.trim;
				mapObj.y += mapObj.trim;
			}
			mapObj.setupMarginIfNeeded();
			this.tryAdd(mapObj);
			mapObj = null;
		}
	};




	MapObject.remove = function (object, noRefreshCollisions = false) {
		var idx = $dataTrpMapObjects.indexOf(object);
		if (idx < 0) return;

		$dataTrpMapObjects.splice(idx, 1);
		MapObject.cache(object);

		if (!noRefreshCollisions) {
			this.refreshCollisions();
		}
	};

	MapObject.tryAdd = function (object, noRefreshCollisions = false) {
		if (!object || object.invalid) return;
		if ($dataTrpMapObjects.contains(object)) return false;
		$dataTrpMapObjects.push(object);

		if (!noRefreshCollisions) {
			this.refreshCollisions();
		}
		return true;
	};


	/* utils
	===================================*/
	MapObject.tileIdInImage = function (tileId, dx = 0, dy = 0) {
		if (dx === 0 && dy === 0) return tileId;
		if (tileId % 8 + dx >= 0 && tileId % 8 + dx < 8) {
			return tileId + dx + dy * 8;
		}

		var col = tileId % 8 + Math.floor(tileId / 128) * 8;
		var row = Math.floor(tileId % 128 / 8);

		col += dx;
		row += dy;

		tileId = Math.floor(col / 8) * 128 + col % 8;
		tileId += row * 8;

		return tileId;
	};






	//=============================================================================
	// refreshCollisions
	//=============================================================================
	MapObject.refreshCollisions = function () {
		$dataTrpMapObjectCollisions = null;

		if (disableCollision) return;
		if (!$dataTrpMapObjects.length) return;


		var res = MapObject.CollisionResolution;
		var width = $dataMap.width;
		var height = $dataMap.height;
		var rowIdx = width * res;

		/* pack mapObj collisions
		===================================*/
		var collisions = this.collisionsMap();


		/* calc tile collision flags
		===================================*/
		$dataTrpMapObjectCollisions = [];
		for (var x = width - 1; x >= 0; x = (x - 1) | 0) {
			for (var y = height - 1; y >= 0; y = (y - 1) | 0) {
				var idx = x * res + y * res * rowIdx;
				var flag = 0;
				var passableDirNum = 4;

				//check down
				//□□□□
				//□□□□
				//□■■□
				//□■■□
				if (collisions[idx + 2 * rowIdx + 1]
					|| collisions[idx + 2 * rowIdx + 2]
					|| collisions[idx + 3 * rowIdx + 1]
					|| collisions[idx + 3 * rowIdx + 2]
				) {
					flag += 1 << 0;
					passableDirNum -= 1;
				}
				//check left
				//□□□□
				//■■□□
				//■■□□
				//□□□□
				if (collisions[idx + 1 * rowIdx + 0]
					|| collisions[idx + 1 * rowIdx + 1]
					|| collisions[idx + 2 * rowIdx + 0]
					|| collisions[idx + 2 * rowIdx + 1]
				) {
					flag += 1 << 1;
					passableDirNum -= 1;
				}
				//check right
				//□□□□
				//□□■■
				//□□■■
				//□□□□
				if (collisions[idx + 1 * rowIdx + 2]
					|| collisions[idx + 1 * rowIdx + 3]
					|| collisions[idx + 2 * rowIdx + 2]
					|| collisions[idx + 2 * rowIdx + 3]
				) {
					flag += 1 << 2;
					passableDirNum -= 1;
				}
				//check up
				//□■■□
				//□■■□
				//□□□□
				//□□□□
				if (collisions[idx + 0 * rowIdx + 1]
					|| collisions[idx + 0 * rowIdx + 2]
					|| collisions[idx + 1 * rowIdx + 1]
					|| collisions[idx + 1 * rowIdx + 2]
				) {
					flag += 1 << 3;
					passableDirNum -= 1;
				}

				if (passableDirNum <= 1) {
					//passableDir:1 -> allDisable
					flag = (1 << 0) + (1 << 1) + (1 << 2) + (1 << 3);
				}

				$dataTrpMapObjectCollisions[x + y * width] = flag;
			}
		}
	};
	MapObject.collisionsMap = function () {
		var collisions = [];
		var res = MapObject.CollisionResolution;
		var width = $dataMap.width;
		var height = $dataMap.height;

		TRP_CORE.packValues(collisions, 0, res * res * width * height);

		var flags = $dataTilesets[$dataMap.tilesetId].flags;
		for (const obj of $dataTrpMapObjects) {
			var objCollisions = obj.collisions(flags);
			if (objCollisions) {
				for (const idx of objCollisions) {
					collisions[idx] = 1;
				}
			}
		};
		return collisions;
	}


	MapObject.activeTilemap = function () {
		return SceneManager._scene._spriteset._tilemap;
	};

	MapObject.CollisionResolution = 4;
	MapObject.prototype.collisions = function (tilesetFlags) {
		if (this.priority !== 1) return null;

		if (this.tileId) {
			if (this._collisions) {
				return this.originalTileCollisions();
			} else {
				return this.tileCollisions(tilesetFlags);
			}
		} else {
			if (this._collisions) {
				return this.originalImageCollisions();
			} else {
				return this.imageCollisions();
			}
		}
	};


	MapObject.prototype.originalTileCollisions = function () {
		var res = MapObject.CollisionResolution;
		var collisions = [];

		var width = $dataMap.width;
		var rowIdx = width * res;

		var srcData = this._collisions;
		for (var yi = 0; yi < srcData.length; yi = (yi + 1) | 0) {
			var row = srcData[yi];
			for (var xi = 0; xi < row.length; xi = (xi + 1) | 0) {
				if (row[xi]) {
					collisions.push(xi + yi * rowIdx);
				}
			}
		}
		return this.adjustedCollisions(collisions);
	};

	MapObject.prototype.tileCollisions = function (flags = $gameMap.tileset().flags) {
		var res = MapObject.CollisionResolution;
		var collisions = [];

		var width = $dataMap.width;
		var rowIdx = width * res;

		for (var x = 0; x < this.tileW; x = (x + 1) | 0) {
			for (var y = 0; y < this.tileH; y = (y + 1) | 0) {
				var baseIdx = x * res + y * res * rowIdx;
				var tileId = MapObject.tileIdInImage(this.tileId, x, y);
				var flag = flags[tileId];

				//check isHeigher
				if (flag & 0x10) {
					continue;
				}

				//pack all indexes at once
				for (var xi = res - 1; xi >= 0; xi = (xi - 1) | 0) {
					for (var yi = res - 1; yi >= 0; yi = (yi - 1) | 0) {
						collisions.push(baseIdx + xi + yi * rowIdx)
					}
				}

				//analyze passable dirs
				var passableDirs = [0, 0, 0, 0];
				for (var dir = 0; dir < 4; dir = (dir + 1) | 0) {
					var bit = (1 << dir) & 0x0f;
					if ((flag & bit) === 0) {
						passableDirs[dir] = 1;
					}
				}

				//bottom
				if (passableDirs[0]) {
					// □□□□
					// □□□□
					// □■■□
					// □■■□
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 1);
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 2);
					TRP_CORE.remove(collisions, baseIdx + 3 * rowIdx + 1);
					TRP_CORE.remove(collisions, baseIdx + 3 * rowIdx + 2);

					if (passableDirs[1]) {
						// □□□□
						// □□□□
						// □□□□
						// ■□□□
						TRP_CORE.remove(collisions, baseIdx + 3 * rowIdx + 0);
					}
					if (passableDirs[2]) {
						// □□□□
						// □□□□
						// □□□□
						// □□□■
						TRP_CORE.remove(collisions, baseIdx + 3 * rowIdx + 3);
					}
				}

				//left
				if (passableDirs[1]) {
					// □□□□
					// ■■□□
					// ■■□□
					// □□□□
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 0);
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 1);
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 0);
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 1);

					if (passableDirs[3]) {
						// ■□□□
						// □□□□
						// □□□□
						// □□□□
						TRP_CORE.remove(collisions, baseIdx + 0 * rowIdx + 0);
					}
				}

				//right
				if (passableDirs[2]) {
					// □□□□
					// □□■■
					// □□■■
					// □□□□
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 2);
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 3);
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 2);
					TRP_CORE.remove(collisions, baseIdx + 2 * rowIdx + 3);

					if (passableDirs[3]) {
						// □□□■
						// □□□□
						// □□□□
						// □□□□
						TRP_CORE.remove(collisions, baseIdx + 0 * rowIdx + 3);
					}
				}

				//up
				if (passableDirs[3]) {
					// □■■□
					// □■■□
					// □□□□
					// □□□□
					TRP_CORE.remove(collisions, baseIdx + 0 * rowIdx + 1);
					TRP_CORE.remove(collisions, baseIdx + 0 * rowIdx + 2);
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 1);
					TRP_CORE.remove(collisions, baseIdx + 1 * rowIdx + 2);
				}
			}
		}

		if (!collisions.length) return null;

		collisions.sort((a, b) => a - b);
		return this.adjustedCollisions(collisions);
	};


	MapObject.prototype.originalImageCollisions = function () {
		var res = MapObject.CollisionResolution;
		var collisions = [];

		var width = $dataMap.width;
		var rowIdx = width * res;

		var srcData = this._collisions;
		var h = srcData.length
		var y0Idx = h > res ? -(h - res) * rowIdx : 0;
		for (var yi = 0; yi < h; yi = (yi + 1) | 0) {
			var row = srcData[yi];
			for (var xi = 0; xi < row.length; xi = (xi + 1) | 0) {
				if (row[xi]) {
					collisions.push(xi - ((row.length - res) / 2) + y0Idx + yi * rowIdx);
				}
			}
		}
		return this.adjustedCollisions(collisions);
	};
	MapObject.prototype.imageCollisions = function () {
		var res = MapObject.CollisionResolution;
		var width = $dataMap.width;
		var rowIdx = width * res;
		var collisions = [];

		for (var xi = 0; xi < res; xi = (xi + 1) | 0) {
			for (var yi = 0; yi < res; yi = (yi + 1) | 0) {
				collisions.push(xi + yi * rowIdx);
			}
		}

		return this.adjustedCollisions(collisions);
	};

	MapObject.prototype.adjustedCollisions = function (collisions) {
		var baseIdx = this.baseCollisionIndex();
		for (var i = collisions.length - 1; i >= 0; i = (i - 1) | 0) {
			collisions[i] += baseIdx;
		}
		return collisions;
	};
	MapObject.prototype.baseCollisionIndex = function () {
		var x = (this.x / this._tileW) - 0.5;
		var y = (this.y / this._tileH) - 1;
		if (this.tileId) {
			x -= (this.tileW - 1) / 2;
			y -= (this.tileH - 1);
		}

		var res = MapObject.CollisionResolution;
		x = Math.round(res * x);
		y = Math.round(res * y);

		return x + y * $dataMap.width * res;
	};








	//=============================================================================
	// prototype Funcs
	//=============================================================================
	MapObject.prototype.initialize = function () {
		this.invalid = false;

		this.tag = 0;
		this.commonIds = null;

		this.x = 0;
		this.y = 0;
		this.aX = 0;
		this.aY = 0;

		this.blendMode = 0;
		this.opacity = 255;
		this.tint = 0xffffff;
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotation = 0;
		this.mirror = false;
		this.anchorX = 0.5;
		this.anchorY = 1;
		this.priority = 1;
		this.above = false;

		//outside margin
		this.marginX = 48;
		this.marginY = 48;
		this.mx0 = 0;
		this.mx1 = 0;
		this.my0 = 0;
		this.my1 = 0;


		//image 
		this.characterName = null;
		this.characterIndex = 0;
		this.pattern = 0;
		this.direction = 2;
		this.tileId = 0;
		this.tileW = 1;
		this.tileH = 1;
		this.isBigCharacter = false;
		this.isPictureCharacter = false;

		//animations
		this._animations = null;
		this._collisions = null;

		//cache
		this._tileW = 48;
		this._tileH = 48;
		this._useLoopX = false;
		this._useLoopY = false
		this._loopAdjX = 0;
		this._loopAdjY = 0;
		this._lastDispX = Number.MAX_SAFE_INTEGER;
		this._lastDispY = Number.MAX_SAFE_INTEGER;
		this._location = null;

		//frame
		this.fx = 0;
		this.fy = 0;
		this.fw = 0;
		this.fh = 0;
		this.trim = 0;

		//display obj
		this.isBitmapReady = false;
		this.bitmap = null;
		this.sprite = null;
	};


	MapObject.prototype.copy = function () {
		var obj = MapObject.object();
		obj.tag = this.tag;
		obj.commonIds = this.commonIds;

		obj.x = this.x;
		obj.y = this.y;
		obj.aX = this.aX;
		obj.aY = this.aY;

		obj.blendMode = this.blendMode;
		obj.opacity = this.opacity;
		obj.tint = this.tint;
		obj.scaleX = this.scaleX;
		obj.scaleY = this.scaleY;
		obj.rotation = this.rotation;
		obj.mirror = this.mirror;
		obj.anchorX = this.anchorX;
		obj.anchorY = this.anchorY;
		obj.priority = this.priority;
		obj.above = this.above;


		//frame
		obj.fx = this.fx;
		obj.fy = this.fy;
		obj.fw = this.fw;
		obj.fh = this.fh;
		obj.trim = this.trim;


		//outside margin
		obj.marginX = this.marginX;
		obj.marginY = this.marginY;
		obj.mx0 = this.mx0;
		obj.mx1 = this.mx1;
		obj.my0 = this.my0;
		obj.my1 = this.my1;


		//image 
		obj.characterName = this.characterName;
		obj.characterIndex = this.characterIndex;
		obj.pattern = this.pattern;
		obj.direction = this.direction;
		obj.tileId = this.tileId;
		obj.tileW = this.tileW;
		obj.tileH = this.tileH;
		obj.isBigCharacter = this.isBigCharacter;
		obj.isPictureCharacter = this.isPictureCharacter;

		//animations
		obj._animations = this._animations;
		obj._collisions = this._collisions;

		//cache
		obj._tileW = this._tileW;
		obj._tileH = this._tileH;
		obj._useLoopX = this._useLoopX;
		obj._useLoopY = this._useLoopY;
		obj._loopAdjX = this._loopAdjX;
		obj._loopAdjY = this._loopAdjY;
		// obj._lastDispX = this._lastDispX;
		// obj._lastDispY = this._lastDispY;


		//display obj
		obj.isBitmapReady = this.isBitmapReady;
		obj.bitmap = this.bitmap;
		// obj.sprite = this.sprite;

		return obj;
	};

	MapObject.prototype.setupWithEvent = function (event) {
		this.setupCommonBefore();

		var meta = event.meta;

		this.x = this._tileW * (event.x + Number(meta.dX || 0));
		this.y = this._tileH * (event.y + Number(meta.dY || 0));
		this.aX = Number(meta.aX || 0);
		this.aY = Number(meta.aY || 0);
		this.blendMode = Number(meta.blendMode) || Number(meta.blend) || 0;
		this.opacity = Number(meta.opacity) || 255;
		this.tint = supplementNum(0xffffff, meta.tint);
		this.scaleX = Number(meta.scaleX || meta.scale || 100) / 100;
		this.scaleY = Number(meta.scaleY || meta.scale || 100) / 100;
		this.rotation = Number(meta.angle || 0) * Math.PI / 180;
		this.mirror = meta.mirror || false;
		this.above = meta['above'] || false;

		this.anchorX = supplementNum(0.5, meta.anchorX);
		this.anchorY = supplementNum(1, meta.anchorY);

		this.marginX = this._tileW * supplementNum(1, meta.marginX || meta.margin);
		this.marginY = this._tileH * supplementNum(1, meta.marginY || meta.margin);
		this.trim = Number(meta.trim === true ? 1 : meta.trim) || 0;;

		var page = event.pages[0];
		var image = page.image;
		this.priority = page.priorityType;
		this.characterName = image.characterName;
		this.characterIndex = image.characterIndex;
		this.pattern = image.pattern;
		this.direction = image.direction;
		this.tileId = image.tileId;
		this.tileW = Number(meta.w) || 1;
		this.tileH = Number(meta.h) || 1;

		var list = page.list;
		if (list[0] && list[0].code !== 0) {
			this.setupWithEventPage(list);
		}

		this.setupCommonAfter();
	};

	MapObject.prototype.setupWithEventPage = function (list) {
		var length = list.length;

		var params = [];
		for (var i = 0; i < length;) {
			var command = list[i];
			if (command.code === 105) {
				//scroll text
				while (list[++i].code === 405) {
					params.push(list[i].parameters[0]);
				}
			} else if (command.code === 108) {
				//comment
				// params.push(command.parameters[0]);
				while (list[++i].code === 408) {
					// params.push(list[i].parameters[0]);
				}
			} else if (command.code === 355) {
				//script
				while (list[++i].code === 655) {
					params.push(list[i].parameters[0]);
				}
			} else if (command.code === 117) {
				//common event
				this.trySetupWithCommonEvent(command.parameters[0]);
				i += 1;
			} else {
				break;
			}
		}

		if (!params.length) return;

		while (params.length) {
			var param = params.shift();
			if (!param) continue;

			if (param.indexOf('//') === 0) continue;

			switch (param.toLowerCase()) {
				case '[objectanimation]':
				case '[objanimation]':
				case '[animation]':
					this.analyzeAnimation(params);
					break;
				case '[collision]':
				case '[collisions]':
					this.analyzeCollision(params);
					break;
			}
		}
	};

	MapObject._commonEvents = [];
	MapObject.commonEventData = function (commonEventId) {
		if (!MapObject._commonEvents[commonEventId]) {
			this.initCommonEventData(commonEventId);
		}
		return MapObject._commonEvents[commonEventId];
	}
	MapObject.prototype.trySetupWithCommonEvent = function (commonEventId) {
		var data = MapObject.commonEventData(commonEventId);

		if (!data) return;
		if (!data.animations && !data.collisions) return;

		this.commonIds = this.commonIds || [0, 0];
		if (data.animations) {
			this.commonIds[0] = commonEventId;
			this._animations = data.animations;
		}
		if (data.collisions) {
			this.commonIds[1] = commonEventId;
		}
		this._collisions = data.collisions;
	};


	MapObject._tempObjForInitCommonEvent = null;
	MapObject.initCommonEventData = function (commonEventId) {
		var commonEvent = $dataCommonEvents[commonEventId];
		if (!commonEvent) return;

		var list = commonEvent.list;
		if (!list) return;

		if (!MapObject._tempObjForInitCommonEvent) {
			MapObject._tempObjForInitCommonEvent = new MapObject()
		}
		var obj = MapObject._tempObjForInitCommonEvent;
		obj.setupWithEventPage(list);

		MapObject._commonEvents[commonEventId] = {
			animations: obj._animations,
			collisions: obj._collisions,
		};

		obj.initialize();
	}



	MapObject.prototype.setupCommonBefore = function () {
		var tileW = $gameMap.tileWidth()
		var tileH = $gameMap.tileHeight();

		this._location = null;
		this._tileW = tileW;
		this._tileH = tileH;
		this._useLoopX = $gameMap.isLoopHorizontal();
		this._useLoopY = $gameMap.isLoopVertical();
		this._loopAdjX = tileW * ($gameMap.width() - $gameMap.screenTileX()) / 2;
		this._loopAdjY = tileH * ($gameMap.height() - $gameMap.screenTileY()) / 2;
	};

	MapObject.prototype.setupCommonAfter = function (location = null) {
		this.x += this._tileW / 2;
		this.y += this._tileH;

		//try apply location
		if (location) {
			this.applyLocationData(location);
		}

		/* substitute
		===================================*/
		if (!ConfigManager[optionKey]) {
			this.trySubstitute();
		}
		if (this.invalid) return;

		//load bitmap
		this.loadBitmap();
	};

	/* substitute
	===================================*/
	MapObject.prototype.trySubstitute = function (objec) {
		if (ConfigManager[optionKey]) return;
		if (!TRP_CORE.useBlendFilter(this.blendMode)) return;

		var substitute = substituteMap[this.characterName];
		if (substitute) {
			this.characterName = substitute.image || this.characterName;
			this.blendMode = substitute.blendMode || 0;
			this.opacity = Math.round(this.opacity * substitute.opacityRate);
		} else {
			this.invalid = true;
		}
	};



	MapObject.prototype.loadBitmap = function () {
		this.isBitmapReady = false;

		var bitmap = null;
		if (this.tileId) {
			var tileset = $dataTilesets[$dataMap.tilesetId];
			var setNumber = 5 + Math.floor(this.tileId / 256);
			bitmap = ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
		} else if (this.characterName) {
			bitmap = ImageManager.loadCharacter(this.characterName);
			this.isPictureCharacter = false;
			this.isBigCharacter = false;
			if (this.characterName.indexOf('_PIC')) {
				this.isPictureCharacter = true;
			} else {
				this.isBigCharacter = ImageManager.isBigCharacter(this.characterName);
			}
		}

		this.bitmap = bitmap;
		MapObject.registerBitmapLoadListener(this, bitmap);
	};
	MapObject.prototype.tilesetBitmap = Sprite_Character.prototype.tilesetBitmap;

	MapObject.prototype.onLoadBitmap = function (bitmap) {
		if (this.bitmap !== bitmap) return;

		this.isBitmapReady = true;
		this.setupFrame();
	};


	/* frame setting
	===================================*/
	MapObject.prototype.setupFrame = function () {
		if (this.tileId > 0) {
			this.setupTileFrame();
		} else {
			this.setupCharacterFrame();
		}
		this.setupMargin();
	};

	MapObject.prototype.setFrame = function (x, y, w, h) {
		this.fx = x + this.trim;
		this.fy = y + this.trim;
		this.fw = w - 2 * this.trim;
		this.fh = h - 2 * this.trim;
	};

	MapObject.prototype.setupTileFrame = function () {
		var tileId = this.tileId;
		var pw = this.patternWidth();
		var ph = this.patternHeight();
		var sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * pw;
		var sy = (Math.floor((tileId % 256) / 8) % 16) * ph;
		this.setFrame(sx, sy, pw * this.tileW, ph * this.tileH);
	};

	MapObject.prototype.setupCharacterFrame = function () {
		var pw = this.patternWidth();
		var ph = this.patternHeight();
		var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
		var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
		this.setFrame(sx, sy, pw, ph);
	};

	MapObject.prototype.characterBlockX = function () {
		if (this.isBigCharacter || this.isPictureCharacter) {
			return 0;
		} else {
			var index = this.characterIndex
			return (index % 4) * 3;
		}
	};

	MapObject.prototype.characterBlockY = function () {
		if (this.isBigCharacter || this.isPictureCharacter) {
			return 0;
		} else {
			var index = this.characterIndex
			return Math.floor(index / 4) * 4;
		}
	};
	MapObject.prototype.characterPatternX = function () {
		if (this.isPictureCharacter) return 0;
		return this.pattern;
	};
	MapObject.prototype.characterPatternY = function () {
		if (this.isPictureCharacter) return 0;
		return (this.direction - 2) / 2;
	};
	MapObject.prototype.patternWidth = function () {
		if (this.tileId > 0) {
			return $gameMap.tileWidth();
		} else if (this.isPictureCharacter) {
			return this.bitmap.width;
		} else if (this.isBigCharacter) {
			return this.bitmap.width / 3;
		} else {
			return this.bitmap.width / 12;
		}
	};
	MapObject.prototype.patternHeight = function () {
		if (this.tileId > 0) {
			return $gameMap.tileHeight();
		} else if (this.isPictureCharacter) {
			return this.bitmap.height;
		} else if (this.isBigCharacter) {
			return this.bitmap.height / 4;
		} else {
			return this.bitmap.height / 8;
		}
	};


	/* margin
	===================================*/
	MapObject.prototype.setupMarginIfNeeded = function () {
		if (this.bitmap && this.bitmap.isReady()) {
			this.setupMargin();
		}
	}
	MapObject.prototype.setupMargin = function () {
		var w = this.fw * this.scaleX;
		var h = this.fh * this.scaleY;

		this.mx0 = -w * (1 - this.anchorX) - this.marginX;
		this.mx1 = Graphics.width + w * this.anchorX + this.marginX;
		this.my0 = -h * (1 - this.anchorY) - this.marginY;
		this.my1 = Graphics.height + h * this.anchorY + this.marginY;

		this._lastDispX = Number.MAX_SAFE_INTEGER;
		this._lastDispY = Number.MAX_SAFE_INTEGER;
	};

	MapObject.prototype.update = function (spriteset, dispX, dispY) {
		//only update position

		if (!this.isBitmapReady) return;
		if (this._lastDispX === dispX && this._lastDispY === dispY) return;
		this._lastDispX = dispX;
		this._lastDispY = dispY;


		/* calc x
		===================================*/
		var x = this.x + this.aX - dispX;
		if (this._useLoopX && x < dispX - this._loopAdjX) {
			x += $dataMap.width;
		}
		if (x < this.mx0 || x > this.mx1) {
			if (this.sprite) this.releaseSprite();
			return;
		}

		/* calc y
		===================================*/
		var y = this.y + this.aY - dispY;
		if (this._useLoopY && y < dispY - this._loopAdjY) {
			y += $dataMap.height;
		}

		if (y < this.my0 || y > this.my1) {
			if (this.sprite) this.releaseSprite();
			return;
		}

		if (!this.sprite) {
			this.setupSprite(spriteset);
		}

		var sprite = this.sprite;
		if (sprite.baseX !== x || sprite.baseY !== y) {
			sprite.setPosition(x, y);
		}
	};


	MapObject.prototype.releaseSprite = function () {
		if (this.sprite) {
			MapObject.cacheSprite(this.sprite);
		}
		this.sprite = null;
	};

	MapObject.prototype.setupSprite = function (spriteset = null) {
		var sprite = this.sprite = MapObject.sprite();
		var addToOverlayContainer = false;
		var z = this.priority * 2 + 1;
		if (spriteset) {
			if (!disableOverlayContainer && ConfigManager[optionKey] && TRP_CORE.useBlendFilter(this.blendMode)) {
				//overlay -> layerContainer
				addToOverlayContainer = true;
				this.addToOverlayContainer(spriteset, sprite, z)
			} else if (this.above) {
				spriteset.addChildAt(sprite, 1 + spriteset.children.indexOf(spriteset._baseSprite));
			} else {
				spriteset._tilemap.addChild(sprite);
			}
		}

		sprite.bitmap = this.bitmap;
		sprite.setFrame(this.fx, this.fy, this.fw, this.fh);

		sprite.opacity = this.opacity;
		sprite.tint = this.tint;
		sprite.rotation = this.rotation;
		sprite.scale.set(this.scaleX * (this.mirror ? -1 : 1), this.scaleY);
		sprite.anchor.set(this.anchorX, this.anchorY);
		sprite.z = z;

		if (addToOverlayContainer) {
			TRP_CORE.setBlendMode(sprite, 0);
		} else {
			TRP_CORE.setBlendMode(sprite, this.blendMode);
		}

		if (this._animations) {
			sprite.animator.loop(
				TRP_Animator.animationsWithArray(this._animations)
			);
		}
		return sprite;
	};

	MapObject.prototype.addToOverlayContainer = function (spriteset, sprite, z) {
		if (this.above) {
			z = 1000;
		}

		var key = this.blendMode + '-' + z;
		if (!spriteset._trpMapObjectOverlayLayers[key]) {
			var container = new TRP_CORE.TRP_Container();
			spriteset._trpMapObjectOverlayLayers[key] = container;

			if (this.above) {
				spriteset.addChildAt(container, 1 + spriteset.children.indexOf(spriteset._baseSprite));
			} else {
				spriteset._tilemap.addChild(container);
			}

			container.z = z;
			TRP_CORE.setBlendMode(container, this.blendMode);
		}
		spriteset._trpMapObjectOverlayLayers[key].addChild(sprite);
	};

	MapObject.prototype.setBlendMode = function (blendMode = 0) {
		if (this.blendMode === blendMode) return;
		this.blendMode = blendMode;
		if (this.sprite) {
			this.sprite.setBlendMode(blendMode);
		}
	};




	/* accessor
	===================================*/
	MapObject.prototype.locate = function (x, y) {
		this.x = x * this._tileW;
		this.y = y * this._tileH;
		if (this.bitmap && this.bitmap.isReady()) {
			this.setupMargin();
		}
	};
	MapObject.prototype.shift = function (dx = 0, dy = 0) {
		this.locate(this.x / this._tileW + dx, this.y / this._tileH + dy);
	};

	MapObject.prototype.tileX = function () {
		return this.x / this._tileW;
	};
	MapObject.prototype.tileX = function () {
		return this.x / this._tileW;
	};





	//=============================================================================
	// Animation
	//=============================================================================
	/* analyze animation
	===================================*/
	MapObject.throwAnimationAnalyzeError = function (text, row, srcParams) {
		for (var i = 0; i < row; i = (i + 1) | 0) {
			text += srcParams[i];
		}
		text += '(←)';

		throw new Error(text);
	};
	MapObject.prototype.analyzeAnimation = function (params) {
		this._animations = [];
		var nest = [this._animations];
		var row = 0;
		var srcParams = params.concat();

		while (params.length) {
			row += 1;

			var param = params.shift();
			if (!param) continue;
			if (param.indexOf('//') === 0) continue;
			if (param[0] === '[') {
				params.unshift(param);
				break;
			}

			this.analyzeAnimationParam(nest, param, params, row, srcParams);
		}
	};
	MapObject.prototype.analyzeAnimationParam = function (nest, param, params, row, srcParams) {
		param = param.trim();
		if (param[0] === ']') {
			if (nest.length === 1) {
				MapObject.throwAnimationAnalyzeError('不正なセット/シーケンス終了記号"]"', row, srcParams)
			}
			nest.pop();
			return;
		}

		var idx = param.indexOf(':');
		if (idx < 0) {
			MapObject.throwAnimationAnalyzeError('アニメーション設定が不正です。コマンドが見つかりません。', row, srcParams)
		}

		var command = param.substring(0, idx).trim();
		param = param.substring(idx + 1).trim();

		if (command === 'seq') command = 'sequence';

		var animation = [command];
		nest[nest.length - 1].push(animation);
		if (command === 'set' || command === 'sequence' || command === 'loop') {
			nest.push(animation);

			if (param[0] !== '[') {
				MapObject.throwAnimationAnalyzeError('セット/シーケンスコマンドは直後に"["が必要です', row, srcParams)
			}
			param = param.substring(1).trim();
			if (param) {
				this.analyzeAnimationParam(nest, param, params, row, srcParams);
			}
			return;
		}


		idx = param.indexOf(']');
		var current = idx >= 0 ? param.substring(0, idx) : param;
		var next = idx >= 0 ? param.substring(idx) : null;

		var args = current.split(',');
		for (var arg of args) {
			arg = arg.trim();
			if (!isNaN(arg)) {
				animation.push(Number(arg));
			} else if (arg === 'false') {
				animation.push(false);
			} else if (arg === 'true') {
				animation.push(true);
			} else if (arg.indexOf('rand(') === 0) {
				arg = arg.substring(5);
				arg = arg.substring(0, arg.length - 1);
				idx = arg.indexOf('~');
				if (idx >= 0) {
					animation.push(TRP_CORE.randomFloat(
						Number(arg.substring(0, idx)),
						Number(arg.substring(idx + 1))
					));
				} else {
					animation.push(TRP_CORE.randomFloat(Number(arg)));
				}
			} else if (arg.indexOf('randInt(') === 0) {
				arg = arg.substring(8);
				arg = arg.substring(0, arg.length - 1);
				idx = arg.indexOf('~');
				if (idx >= 0) {
					animation.push(TRP_CORE.randomInt(
						Number(arg.substring(0, idx)),
						Number(arg.substring(idx + 1))
					));
				} else {
					animation.push(TRP_CORE.randomInt(Number(arg)));
				}
			} else {
				animation.push(arg);
			}
		}

		if (next) {
			this.analyzeAnimationParam(next, param, params, row, srcParams);
		}
	};




	//=============================================================================
	// Collision
	//=============================================================================
	MapObject.prototype.analyzeCollision = function (params) {
		var collisions = [];
		this._collisions = collisions;

		var row = 0;
		var srcParams = params.concat();

		var res = MapObject.CollisionResolution;
		var w = this.tileId ? this.tileW : 0;
		var h = this.tileId ? this.tileH : 0;

		while (params.length) {
			row += 1;

			var param = params.shift();
			if (param[0] === '[') {
				params.unshift(param);
				break;
			}
			if (param.indexOf('//') === 0) continue;

			param = param.replace(/\|/gi, '');
			param = param.trim();

			var row = [];
			collisions.push(row);

			for (var i = 0; i < param.length; i = (i + 1) | 0) {
				if (param[i] === 'o') {
					row.push(0);
				} else if (param[i] === 'x') {
					row.push(1);
				} else {
					MapObject.throwAnimationAnalyzeError('collision設定は「ox|」以外記述できません', row, srcParams);
				}
			}

			if (w && row.length !== w * res) {
				MapObject.throwAnimationAnalyzeError(
					'collision設定が横幅(%1マスx%2=%3)を超えてます.'.format(w, res, w * res),
					row, srcParams,
				);
			}
		}

		if (h && collisions.length > h * res) {
			MapObject.throwAnimationAnalyzeError(
				'collision設定が縦幅(%1マスx%2=%3)を超えてます.'.format(h, res, h * res),
				row, srcParams,
			);
		}

		//supply rows
		if (h) {
			for (var i = collisions.length; i < h * res; i = (i + 1) | 0) {
				var row = [];
				collisions.unshift(row);
				TRP_CORE.packValues(row, 0, w * res);
			}
		}
	};




	//=============================================================================
	// Template
	//=============================================================================
	MapObject.makeTemplateWithEvent = function (tag, event) {
		var enableOverlayCache = ConfigManager[optionKey];
		ConfigManager[optionKey] = true;

		var mapObj = MapObject.objectFromEventData(event);

		ConfigManager[optionKey] = enableOverlayCache;

		var template = mapObj.makeTemplate(tag);
		MapObject.cache(mapObj);

		event.meta.objTag = tag;

		return template;
	};

	MapObject.prototype.makeTemplate = function (tag) {
		if (this.commonIds) {
			//clear if common event data
			if (this.commonIds[0]) {
				var commonData = MapObject._commonEvents[this.commonIds[0]];
				if (commonData && this._animations === commonData.animations) {
					this._animations = null;
				}
			}
			if (this.commonIds[1]) {
				var commonData = MapObject._commonEvents[this.commonIds[1]];
				if (commonData && this._collisions === commonData.collisions) {
					this._collisions = null;
				}
			}
		}

		var animations = null;
		if (this._animations) {
			animations = [];
			for (const srcAnim of this._animations) {
				var animArr = [];
				animations.push(animArr);
				for (const srcElem of srcAnim) {
					if (srcElem instanceof TRP_CORE.RandomFloat) {
						animArr.push({ type: 'randomFloat', max: srcElem._max, min: srcElem._min });
					} else if (srcElem instanceof TRP_CORE.RandomInt) {
						animArr.push({ type: 'randomInt', max: srcElem._max, min: srcElem._min });
					} else {
						animArr.push(srcElem);
					}
				}
			}
		}

		var template = {
			tag: tag,
			commonIds: this.commonIds,

			aX: this.aX,
			aY: this.aY,
			blendMode: this.blendMode,
			opacity: this.opacity,
			tint: this.tint,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			rotation: this.rotation,
			mirror: this.mirror,
			above: this.above,

			anchorX: this.anchorX,
			anchorY: this.anchorY,
			marginX: this.marginX,
			marginY: this.marginY,
			trim: this.trim,

			priority: this.priority,
			characterName: this.characterName,
			characterIndex: this.characterIndex,
			tileId: this.tileId,
			tileW: this.tileW,
			tileH: this.tileH,

			animations: animations,
			collisions: this._collisions,
		};
		return template;
	};


	MapObject.templateFitParams = [
		'aX', 'aY', 'blendMode', 'opacity', 'tint', 'scaleX', 'scaleY', 'rotation', 'mirror', 'above', 'anchorX', 'anchorY', 'priority',
		//ignoreParams -> 'marginX','marignY','trim',
	];
	MapObject.templateFitSingleArrParams = [
		'commonIds',
	];
	MapObject.templateFitObjParams = [
		'animations', 'collisions',
	];
	MapObject.templateFitValue = function (t1, t2) {
		if (t1.characterName || t2.characterName) {
			if (t1.characterName !== t2.characterName
				|| t1.characterIndex !== t2.characterIndex) {
				return Number.MAX_SAFE_INTEGER;
			}
		} else {
			if (t1.tileId !== t2.tileId
				|| t1.tileW !== t2.tileW
				|| t1.tileH !== t2.tileH
			) {
				return Number.MAX_SAFE_INTEGER;
			}
		}

		var value = 0;
		for (const key of MapObject.templateFitParams) {
			if (t1[key] !== t2[key]) {
				value += 1;
			}
		}
		for (const key of MapObject.templateFitSingleArrParams) {
			if (!!t1[key] !== !!t2[key]) {
				value += 1;
			} else if (t1[key] && !t1[key].equals(t2[key])) {
				value += 1;
			}
		}
		for (const key of MapObject.templateFitObjParams) {
			if (!!t1[key] !== !!t2[key]) {
				value += 1;
			} else if (t1[key] && JSON.stringify(t1[key] !== JSON.stringify(t2[key]))) {
				value += 1;
			}
		}

		return value;
	};



	MapObject.prototype.setupWithTemplate = function (template, location = this._location) {
		this.setupCommonBefore();

		this.commonIds = template.commonIds;

		this.aX = template.aX;
		this.aY = template.aY;
		this.scaleX = template.scaleX;
		this.scaleY = template.scaleY;
		this.rotation = template.rotation;
		this.mirror = template.mirror || false;
		this.above = template.above || false;
		this.blendMode = Number(template.blendMode) || 0;
		this.opacity = template.opacity || 255;
		this.tint = supplementNum(0xffffff, template.tint);
		this.anchorX = template.anchorX;
		this.anchorY = template.anchorY;
		this.marginX = template.marginX;
		this.marginY = template.marginY;
		this.trim = template.trim;
		this.priority = template.priority;
		this.characterName = template.characterName;
		this.characterIndex = template.characterIndex;
		this.tileId = template.tileId;
		this.tileW = template.tileW;
		this.tileH = template.tileH;
		this._collisions = template.collisions;

		if (this.commonIds) {
			if (this.commonIds[0]) {
				var commonData = MapObject.commonEventData(this.commonIds[0]);
				if (commonData && commonData.animations) {
					this._animations = commonData.animations;
				}
			}
			if (this.commonIds[1]) {
				var commonData = MapObject.commonEventData(this.commonIds[1]);
				if (commonData && commonData.collisions) {
					this._collisions = commonData.collisions;
				}
			}
		}

		if (template.animations) {
			var animations = [];
			for (const animation of template.animations) {
				var animArr = [];
				animations.push(animArr);

				for (const elem of animation) {
					if (typeof elem === 'object' && !Array.isArray(elem)) {
						if (elem.type === 'randomFloat') {
							animArr.push(TRP_CORE.randomFloat(elem.max, elem.min));
						} else if (elem.type === 'randomInt') {
							animArr.push(TRP_CORE.randomInt(elem.max, elem.min));
						} else {
							animArr.push(elem);
						}
					} else {
						animArr.push(elem);
					}
				}
			}
			this._animations = animations;
		}


		this.setupCommonAfter(location);
		this.tag = template.tag;
	};


	/* location data
	===================================*/
	MapObject.prototype.locationData = function () {
		return [
			this.tag,
			this.x,
			this.y,
			this.scaleX,
			this.scaleY,
			this.rotation,

			this.mirror,
			this.opacity,
			this.tint,
		];
	};
	MapObject.prototype.applyLocationData = function (location) {
		var idx = 0;
		this.tag = location[idx++];
		this.x = location[idx++];
		this.y = location[idx++];
		this.scaleX = location[idx++];
		this.scaleY = location[idx++];
		this.rotation = location[idx++];

		this.mirror = location[idx++] || false;
		this.opacity = location[idx++] || 255;
		this.tint = supplementNum(0xffffff, location[idx++]);

		this._location = location;
	};









	//=============================================================================
	// Utils
	//=============================================================================
	MapObject.prototype.equalsMapObjectImage = function (obj) {
		if (!(obj instanceof MapObject)) return false;

		if (this.characterName !== obj.characterName
			|| this.characterIndex !== obj.characterIndex
			|| this.tileId !== obj.tileId
			|| this.tileW !== obj.tileW
			|| this.tileH !== obj.tileH
		) {
			return false;
		}
		return true;
	}







	//=============================================================================
	// MapObjectSprite
	//=============================================================================
	var MapObjectSprite = TRP_CORE.MapObjectSprite = function MapObjectSprite() {
		this.initialize.apply(this, arguments);
	}
	var TRP_Sprite = TRP_CORE.TRP_Sprite;

	MapObjectSprite.prototype = Object.create(TRP_Sprite.prototype);
	MapObjectSprite.prototype.constructor = MapObjectSprite;
	MapObjectSprite.prototype.initialize = function (bitmap) {
		TRP_Sprite.prototype.initialize.call(this, bitmap);
		this.baseX = 0;
		this.baseY = 0;
	};

	MapObjectSprite.prototype.clear = function () {
		TRP_Sprite.prototype.clear.call(this);
		this.baseX = 0;
		this.baseY = 0;
	};

	MapObjectSprite.prototype.setPosition = function (x, y) {
		if (this.baseX === x && this.baseY === y) return;

		var dx = x - this.baseX;
		var dy = y - this.baseY;

		this.baseX = x;
		this.baseY = y;
		this.x += dx;
		this.y += dy;

		if (this._animator) {
			this._animator.setSrcPosition(dx, dy, true);
		}
	};

	MapObjectSprite.prototype.setBlendMode = function (blendMode = 0) {
		if (this.blendMode === blendMode) return;

		if (this.filters) {
			MapObject.tryCacheBlendFilter(this);
			this.filters = [];
		}

		TRP_CORE.setBlendMode(this, blendMode);
	};






	//=============================================================================
	// ConfigManager
	//=============================================================================
	var _ConfigManager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function () {
		var config = _ConfigManager_makeData.call(this);
		config[optionKey] = this[optionKey];
		return config;
	};

	var _ConfigManager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function (config) {
		_ConfigManager_applyData.call(this, config);
		this[optionKey] = config[optionKey];
		if (this[optionKey] === undefined) {
			this.initTrpMapObjectEnableOverlay();
		};
	};

	ConfigManager.initTrpMapObjectEnableOverlay = function () {
		if (this[optionKey] !== undefined) return;
		if (Utils.isMobileDevice()) {
			this[optionKey] = enableOverlayOnMobileDevice;
		} else {
			this[optionKey] = enableOverlayOnInit;
		}
	};

	ConfigManager.initTrpMapObjectEnableOverlay();

	MapObject.isOverlayEnabled = function () {
		return ConfigManager[optionKey];
	};




	//=============================================================================
	// Window_Options
	//=============================================================================
	if (optionIndex >= 0) (function () {
		var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
		Window_Options.prototype.makeCommandList = function () {
			_Window_Options_makeCommandList.call(this);

			this.addCommand(optionName, optionKey);

			var command = this._list.pop();
			var index = optionIndex.clamp(0, this._list.length);
			this._list.splice(index, 0, command);
		};
	})();




	//=============================================================================
	// 競合:テンプレートプラグイン対応
	//=============================================================================
	if (pgTemplateEvent) (() => {
		var _MapObject_objectFromEventData = MapObject.objectFromEventData;
		MapObject.objectFromEventData = function (event) {
			var tcTemplateId = Game_Event.prototype.generateTemplateId.call(this, event);
			if (tcTemplateId
				&& $dataTemplateEvents[tcTemplateId]
				&& event !== $dataTemplateEvents[tcTemplateId]
			) {
				return this.TC_objectFromTemplateEvent(event, tcTemplateId);
			}
			return _MapObject_objectFromEventData.call(this, event);
		};

		MapObject.TC_TemplateMap = {};
		MapObject.TC_objectFromTemplateEvent = function (event, tcTemplateId) {
			var tag = 'tc:' + tcTemplateId;

			if (!MapObject.TC_TemplateMap[tcTemplateId]) {
				var tcTemplate = $dataTemplateEvents[tcTemplateId];
				tcTemplate.x = 0;
				tcTemplate.y = 0;
				MapObject.TC_TemplateMap[tcTemplateId] = this.makeTemplateWithEvent(tag, tcTemplate);
			}

			var template = MapObject.TC_TemplateMap[tcTemplateId];
			var mapObj = this.objectFromTemplateData(template);

			mapObj.x += event.x * mapObj._tileW;
			mapObj.y += event.y * mapObj._tileH;
			if (mapObj.trim) {
				mapObj.x += mapObj.trim;
				mapObj.y += mapObj.trim;
			}

			//apply meta
			var meta = event.meta || {};
			if (meta.aX !== undefined) mapObj.aX = Number(meta.aX || 0);
			if (meta.aY !== undefined) mapObj.aY = Number(meta.aY || 0);
			if (meta.scale !== undefined) mapObj.scaleX = mapObj.scaleY = Number(meta.scale || 100) / 100;
			if (meta.scaleX !== undefined) mapObj.scaleX = Number(meta.scaleX || 100) / 100;
			if (meta.scaleY !== undefined) mapObj.scaleY = Number(meta.scaleY || 100) / 100;
			if (meta.angle !== undefined) mapObj.rotation = Number(meta.angle || 0) * Math.PI / 180;
			if (meta.mirror !== undefined) mapObj.mirror = meta.mirror || false;
			if (meta.above !== undefined) mapObj.above = meta.above || false;
			if (meta.opacity !== undefined) mapObj.opacity = Number(meta.opacity) || 255;
			if (meta.blendMode !== undefined) mapObj.blendMode = Number(meta.blendMode) || 0;
			else if (meta.blend !== undefined) mapObj.blendMode = Number(meta.blend) || 0;

			if (meta.tint !== undefined) mapObj.tint = Number(meta.tint) || 0;

			if (meta.anchorX !== undefined) mapObj.anchorX = supplementNum(0.5, meta.anchorX);
			if (meta.anchorY !== undefined) mapObj.anchorY = supplementNum(1, meta.anchorY);

			if (meta.marginX !== undefined) mapObj.marginX = mapObj._tileW * supplementNum(1, meta.marginX || meta.margin);
			if (meta.marginY !== undefined) mapObj.marginY = mapObj._tileH * supplementNum(1, meta.marginY || meta.margin);
			if (meta.trim !== undefined) mapObj.trim = Number(meta.trim === true ? 1 : meta.trim) || 0;;

			mapObj.setupMarginIfNeeded();


			return mapObj;
		};

	})();












})();