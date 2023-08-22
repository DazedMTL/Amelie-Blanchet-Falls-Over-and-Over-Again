//=============================================================================
// TRP_MapFilter.js
//=============================================================================
// このソフトウェアの一部にMITライセンスで配布されている製作物が含まれています。
// http://www.opensource.org/licenses/mit-license

// VignetteFilter
// Plugin Command
// Scene_Base
// TRP_FilterManager
// Map Filters
// Update MapFilter Params

// ConfigManager
// Window_Options

// Filter Editor


/*:
 * @target MZ
 * @plugindesc マップ用簡単フィルター
 * @author Thirop
 * @base TRP_CORE
 * @orderAfter TRP_CORE
 * @help
 * 【導入】
 * 以下のプラグインより後ろに配置
 * ・TRP_CORE.js
 *
 * 【更新履歴】
 * 1.27 2022/01/24 修正:パラメータ変更時に負荷設定が反映されない不具合
 * 1.26 2022/01/24 追加:負荷設定用のオプション追加
 * 1.23 2022/01/18 修正:MVでのチルトシフトエラー修正
 * 1.22 2022/01/17 修正:環境によりチルトシフト中央がずれる不具合修正
 * 1.21 2022/01/15 競合対応:カスタムメニュープラグイン
 * 1.04 2022/11/13 競合対応:テンプレートプラグイン(戦闘テスト)
 * 1.03 2022/11/11 修正:戦闘テストエラー
 * 1.00 2022/10/27 初版
 *  
 * 
 * 【基本の使い方】
 * ・プラグインコマンド「フィルター編集」から編集開始
 * └MV形式では「mapFilter edit」
 * └TRP_DevToolsを導入してる場合は↑コマンドでショトカ登録推奨！
 *
 * ・３つのフィルターのパラメータを設定
 * └色補正：マップの色みやコントラストなどの補正エフェクト
 * └ブルーム：光で白くぼやけるようなエフェクト
 * └チルトシフト：画面上下をぼかすカメラのボケのようなエフェクト
 *
 * ・不要なフィルターは「Ctrl(MacはCmd)+D」で無効化
 * ・「Ctrl(MacはCmd)+W」で終了
 * ・設定パラメータがクリップボードにコピーされるので
 * 　マップの「メモ欄」にペースト
 * 
 * ・プラグイン設定の「デフォルトフィルター」にペーストすると
 * 　全てのマップのデフォルトフィルターとして反映される
 *
 *
 *
 * 【フィルター設定の変更】
 * ゲーム中にプラグインコマンド「パラメータ変更」よりフィルター設定を変更できます。
 *
 * □MV形式コマンド
 * 「mapFilter update　所要フレーム数 <<ここにフィルター設定をペースト>>」
 * 例)「mapFilter update 20　<filter: ~~~~>」
 *
 *
 *
 *
 * 【マップ設定の優先度】
 * 基本はマップのメモ欄の設定がある場合はメモ欄設定が使用され、
 * デフォルト設定は完全に無視されます。
 *
 * ただし、マップ設定編集時に「無効化したフィルター」については
 * 以下のプラグイン設定にて「デフォ設定で補填するかどうか」を設定できます。
 * ・「デフォ補填:色補正」
 * ・「デフォ補填:ブルーム」
 * ・「デフォ補填:チルトシフト」
 *
 * たとえば、「チルトシフト」のパラメータは全てデフォルト設定で統一したい場合は
 * ・「デフォ補填:チルトシフト」をONにする
 * ・マップ設定では「チルトシフトをCtrl+Dで無効化」」しておく
 * ことでデフォルト設定が優先されます。
 *
 *
 *
 * 【戦闘シーンの設定】
 * プラグイン設定「戦闘:フィルター有効」をONにすると戦闘シーンにも
 * 各種フィルターが有効化されます。
 *
 * 基本はマップで適用されているフィルターがそのまま適用されますが、
 * プラグイン設定「戦闘:デフォフィルター」などを設定することで、
 * 一部のフィルター設定を変更することができます。
 *
 * 例)戦闘中はチルトシフトをオフ
 * ・設定「デフォフィルター」は空のまま
 * ・設定「戦闘:チルトシフト・デフォ有効」をON
 * とすると、チルトシフトのみ戦闘のデフォルト値(=未設定)が優先され
 * チルトシフトのみ無効化されます。
 *
 * 
 * 【ユーザープリセットの活用】
 * プラグイン設定「ユーザープリセット」でプリセット設定を登録できます。
 * 登録したプリセットはマップデータのメモ欄に
 * 「<filter:プリセットID>」の形式で使用することが可能です。
 * 
 * また、編集画面では、上から10個までのプリセットは
 * Ctrl(MacはCmd)+1(~0)のショートカットキーで読み込みが可能です。
 *
 * 頻繁に使う設定はプリセット登録をしておくことで、
 * 後からでも一括で再調整ができるのでおすすめです。
 * 
 * 
 *
 * 【タイルセット画像の書き出し】
 * 「Ctrl(MacはCmd)+I」キーで「色補正」のみ反映させた状態の
 * タイルセット画像をプロジェクトフォルタに書き出しが可能です。
 *
 * 各種フィルターはマップ上のキャラクターにも反映されてしまいます。
 * タイルセットの色だけを調整したい場合は、
 * 色補正をほどこしたタイルセット画像を書き出して使用すると良いでしょう。
 * (フィルター設定の「色補正」を無効化するのを忘れなく！)
 *
 *
 * 【オプション設定】
 * オプションやプラグインコマンドで適用するフィルター一部制限できます。
 * ・MV形式コマンド「mapFilter option on/off」
 * （プラグインコマンドで変更時には、シーン遷移を挟んで有効化されます。）
 * ・スクリプト「ConfigManager.trpMapFilter = true」(またはfalse)
 * （キー名を変えてるときは設定したConfigManager.キー名）
 *
 * オプションOFF時に無効化するフィルター種類もプラグイン設定で設定可能です。
 * フィルター負荷はおおむね↓
 * tiltshift > bloom >> adjustment(色補正) >> vignette
 * 
 * 初期値では表示オプションOFFでtiltshiftとbloomを無効化してます。
 *
 * （※上級者向け:フィルタごとに細かく設定したい場合はスクリプトで
 * 　 ConfigManager.trpMapFilterLimitTypesの配列を操作し、
 * 　 ConfigManager.save()で保存してください。）
 *
 *
 * 
 * @command edit
 * @text フィルター編集
 * @desc フィルター編集画面の呼び出し
 *
 *
 * @command update
 * @text パラメータ変更
 * @desc フィルター設定のパラメータを変更。(マップ内で有効)
 *
 * @arg duration
 * @text 所要フレーム数
 * @desc 変化にかけるフレーム数
 * @type number
 * @default 0
 * @min 0
 *
 * @arg params
 * @text 変更後のフィルター設定
 * @desc 変更後のフィルター設定をペースト
 *
 *
 * @command option
 * @text 表示オプション設定
 * @desc フィルター表示オプションのON/OFF。(OFFで無効化する種類はプラグイン設定で設定)
 *
 * @arg flag
 * @text フラグ設定
 * @desc ONで全フィルタ表示、OFFで一部フィルタを無効化。
 * @type boolean
 * @default true
 *
 * 
 *
 *
 *
 * @param userPresets
 * @text 《ユーザープリセット》
 * @desc ユーザープリセットデータの登録。マップメモ欄に<filter:プリセットID>で設定可
 * @default ["{\"id\":\"default\",\"params\":\"<filter:adjustment 1 1 1 1 1 1 1 1,bloom 1 0.1 0.5 0.95,tiltshift 5 312 312,vignette 0.25 1 0.5>\"}","{\"id\":\"snow\",\"params\":\"<filter:adjustment 1 1 1 0.8 1 1 1 1,bloom 5 0.4 0.05 1,tiltshift 5 312 312,vignette 0.25 1 0.5>\"}","{\"id\":\"night\",\"params\":\"<filter:adjustment 0.5 0.5 1 1.2 0.5 0.6 1.2 1,bloom 1 0.25 0.4 1,tiltshift 5 312 312,vignette 0.45 1 0.5>\"}"]
 * @type struct<UserPreset>[]
 * 
 * @param metaKey
 * @text メタ設定キー
 * @desc メタ設定キー。デフォルトは「filter」で「filter:パラメータ」形式で設定
 * @default filter
 * @type string
 *
 * @param command
 * @text コマンド名(MV)
 * @desc MV形式コマンド名。デフォルトは「mapFilter」
 * @default mapFilter
 * @type string
 *
 * @param shortcutKey
 * @text 編集ショトカキー(+Ctrlキー)
 * @desc 編集画面呼び出し用のショートカットキー。Ctrl(MacはCmd)を同時に押下
 * @default f
 * @type string
 *
 * @param importFilter
 * @text PIXI-filtersインポート
 * @desc ONにするとPIXI-filtersインポート(ver4.1.5)。他のプラグインなどでインポート済みの場合はOFFに
 * @default true
 * @type boolean
 *
 *
 * @param defaultFilters
 * @text デフォルトフィルター
 * @desc デフォルトのフィルター設定。
 * @default 
 * @type string
 *
 * @param supplyAdjustment
 * @text デフォ補填:色補正
 * @desc マップ設定で「色補正」無効時にデフォフィルター設定を使用。(ON時にフィルター無効にするには有効かつパラメータクリア)
 * @default true
 * @type boolean
 *
 * @param supplyBloom
 * @text デフォ補填:ブルーム
 * @desc マップ設定で「ブルーム」無効時にデフォフィルター設定を使用。(ON時にフィルター無効にするには有効かつパラメータクリア)
 * @default true
 * @type boolean
 *
 * @param supplyTiltshift
 * @text デフォ補填:チルトシフト
 * @desc マップ設定で「チルトシフト」無効時にデフォフィルター設定を使用。(ON時にフィルター無効にするには有効かつパラメータクリア)
 * @default true
 * @type boolean
 *
 * @param supplyVignette
 * @text デフォ補填:ヴィネット
 * @desc マップ設定で「ヴィネット」無効時にデフォフィルター設定を使用。(ON時にフィルター無効にするには有効かつパラメータクリア)
 * @default true
 * @type boolean
 *
 *
 * @param enableOnBattle
 * @text 戦闘:フィルター有効
 * @desc ONにすると戦闘でフィルター有効。(OFFにすると以下の戦闘関連設定も無効)
 * @default true
 * @type boolean
 *
 * @param battleDefaults
 * @text 戦闘:デフォフィルター
 * @desc 戦闘シーンでのデフォルトフィルター設定。未設定時は全てマップ設定を使用
 * 
 * @param overwriteAdjustmentForBattle
 * @text 戦闘:色補正・デフォ有効
 * @desc 戦闘デフォフィルター設定の色補正を有効。(OFFにするとマップ設定を使用)
 * @default true
 * @type boolean
 *
 * @param overwriteBloomForBattle
 * @text 戦闘:ブルーム・デフォ有効
 * @desc 戦闘デフォフィルター設定のブルームを有効。(OFFにするとマップ設定を使用)
 * @default false
 * @type boolean
 *
 * @param overwriteTiltshiftForBattle
 * @text 戦闘:チルトシフト・デフォ有効
 * @desc 戦闘デフォフィルター設定のチルトシフトを有効。(OFFにするとマップ設定を使用)
 * @default false
 * @type boolean
 *
 * @param overwriteVignetteForBattle
 * @text 戦闘:ヴィネット・デフォ有効
 * @desc 戦闘デフォフィルター設定のヴィネットを有効。(OFFにするとマップ設定を使用)
 * @default false
 * @type boolean
 *
 *
 *
 * @param categoryOption
 * @text 【オプション設定】
 * @default フィルタ表示オプションに関する設定
 *
 * 
 * @param limitTypes
 * @text 非表示時の無効フィルタ
 * @desc フィルタ表示設定OFFで無効化するフィルタ種類。"adjustment"(色補正),"bloom","tiltshift","vignette"
 * @default ["bloom","tiltshift"]
 * @type string[]
 * @parent categoryOption
 *
 *
 * @param optionValueOnMobileDevice
 * @text スマホの表示初期設定
 * @desc スマホプレイ時のフィルタ表示設定の初期値設定
 * @default false
 * @type boolean
 * @parent categoryOption
 *
 * @param optionIndex
 * @text 設定オプション表示順
 * @desc フィルタ表示オプションをオプションウィンドウの上から何番目に表示するか。-1でオプション追加なし
 * @type number
 * @default -1
 * @min -1
 * @parent categoryOption
 *
 * @param optionName
 * @text オプション名
 * @desc フィルタ表示設定のオプションウィンドウでの表示名
 * @type string
 * @default マップフィルター演出
 * @parent categoryOption
 *
 * @param optionKey
 * @text オプションキー
 * @desc フィルタ表示設定の内部保存キー。MapObject.jsのキーなどと揃えると連動可能。
 * @default trpMapFilter
 * @parent categoryOption
 *
 *
 *
 * 
 * 
 */
//============================================================================= 
/*~struct~UserPreset:
 * @param id
 * @text プリセットID
 * @desc 他とかぶらないID。マップメモ欄に<filter:プリセットID>で設定可
 *
 * @param params
 * @text フィルター設定
 * @desc フィルター設定をここにペースト
 * 
 */
//============================================================================= 


function TRP_FilterManager() {
	this.initialize.apply(this, arguments);
}




(function () {
	'use strict';

	function evalBoolean(value) {
		return value === 'true' || value === true;
	};

	var isMZ = Utils.RPGMAKER_NAME === "MZ";
	var isMac = navigator.userAgent.contains('Macintosh');
	var ctrlKey = isMac ? 'Cmd' : 'Ctrl';

	var FilterManager = TRP_FilterManager;

	var pluginName = 'TRP_MapFilter';
	var parameters = PluginManager.parameters(pluginName);
	var importFilter = evalBoolean(parameters.importFilter);
	var defaultFilters = parameters.defaultFilters;
	var supplyAdjustment = evalBoolean(parameters.supplyAdjustment);
	var supplyBloom = evalBoolean(parameters.supplyBloom);
	var supplyTiltshift = evalBoolean(parameters.supplyTiltshift);
	var supplyVignette = evalBoolean(parameters.supplyVignette);
	var enableOnBattle = evalBoolean(parameters.enableOnBattle);
	var overwriteAdjustmentForBattle = evalBoolean(parameters.overwriteAdjustmentForBattle);
	var overwriteBloomForBattle = evalBoolean(parameters.overwriteBloomForBattle);
	var overwriteTiltshiftForBattle = evalBoolean(parameters.overwriteTiltshiftForBattle);
	var overwriteVignetteForBattle = evalBoolean(parameters.overwriteVignetteForBattle);
	var userPresets = null;

	var limitTypes = parameters.limitTypes = JSON.parse(parameters.limitTypes || '["bloom","tiltshift"]');
	var optionValueOnMobileDevice = parameters.optionValueOnMobileDevice === 'true' || parameters.optionValueOnMobileDevice === true;
	var optionIndex = parameters.optionIndex === undefined ? -1 : Number(parameters.optionIndex);
	var optionName = parameters.optionName = parameters.optionName || 'マップフィルター演出';
	var optionKey = parameters.optionKey = parameters.optionKey || 'trpMapFilter';


	(() => {
		try {
			userPresets = JSON.parse(parameters.userPresets);
			for (var i = userPresets.length - 1; i >= 0; i = (i - 1) | 0) {
				userPresets[i] = JSON.parse(userPresets[i]);
			}
		} catch (e) {
			userPresets = [];
		};
	})();


	if (importFilter && isMZ) (() => {
		var __filters = function (e, n, t, r, o, i, l, a) { "use strict"; var s = function (e, n) { return (s = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (e, n) { e.__proto__ = n } || function (e, n) { for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]) })(e, n) }; function u(e, n) { function t() { this.constructor = e } s(e, n), e.prototype = null === n ? Object.create(n) : (t.prototype = n.prototype, new t) } var f = function () { return (f = Object.assign || function (e) { for (var n, t = arguments, r = 1, o = arguments.length; r < o; r++)for (var i in n = t[r]) Object.prototype.hasOwnProperty.call(n, i) && (e[i] = n[i]); return e }).apply(this, arguments) }; Object.create; Object.create; var c = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n	gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n	vTextureCoord = aTextureCoord;\n}", m = function (e) { function n(n) { var t = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float gamma;\nuniform float contrast;\nuniform float saturation;\nuniform float brightness;\nuniform float red;\nuniform float green;\nuniform float blue;\nuniform float alpha;\n\nvoid main(void)\n{\n	vec4 c = texture2D(uSampler, vTextureCoord);\n\n	if (c.a > 0.0) {\n		c.rgb /= c.a;\n\n		vec3 rgb = pow(c.rgb, vec3(1. / gamma));\n		rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);\n		rgb.r *= red;\n		rgb.g *= green;\n		rgb.b *= blue;\n		c.rgb = rgb * brightness;\n\n		c.rgb *= c.a;\n	}\n\n	gl_FragColor = c * alpha;\n}\n") || this; return t.gamma = 1, t.saturation = 1, t.contrast = 1, t.brightness = 1, t.red = 1, t.green = 1, t.blue = 1, t.alpha = 1, Object.assign(t, n), t } return u(n, e), n.prototype.apply = function (e, n, t, r) { this.uniforms.gamma = Math.max(this.gamma, 1e-4), this.uniforms.saturation = this.saturation, this.uniforms.contrast = this.contrast, this.uniforms.brightness = this.brightness, this.uniforms.red = this.red, this.uniforms.green = this.green, this.uniforms.blue = this.blue, this.uniforms.alpha = this.alpha, e.applyFilter(this, n, t, r) }, n }(n.Filter), p = function (e) { function n(n) { void 0 === n && (n = .5); var t = e.call(this, c, "\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform float threshold;\n\nvoid main() {\n	vec4 color = texture2D(uSampler, vTextureCoord);\n\n	// A simple & fast algorithm for getting brightness.\n	// It's inaccuracy , but good enought for this feature.\n	float _max = max(max(color.r, color.g), color.b);\n	float _min = min(min(color.r, color.g), color.b);\n	float brightness = (_max + _min) * 0.5;\n\n	if(brightness > threshold) {\n		gl_FragColor = color;\n	} else {\n		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n	}\n}\n") || this; return t.threshold = n, t } return u(n, e), Object.defineProperty(n.prototype, "threshold", { get: function () { return this.uniforms.threshold }, set: function (e) { this.uniforms.threshold = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), d = function (e) { function n(n, r, o) { void 0 === n && (n = 4), void 0 === r && (r = 3), void 0 === o && (o = !1); var i = e.call(this, c, o ? "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n	vec4 color = vec4(0.0);\n\n	// Sample top left pixel\n	color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n	// Sample top right pixel\n	color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n	// Sample bottom right pixel\n	color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n	// Sample bottom left pixel\n	color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n	// Average\n	color *= 0.25;\n\n	gl_FragColor = color;\n}\n" : "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\n\nvoid main(void)\n{\n	vec4 color = vec4(0.0);\n\n	// Sample top left pixel\n	color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));\n\n	// Sample top right pixel\n	color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));\n\n	// Sample bottom right pixel\n	color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));\n\n	// Sample bottom left pixel\n	color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));\n\n	// Average\n	color *= 0.25;\n\n	gl_FragColor = color;\n}") || this; return i._kernels = [], i._blur = 4, i._quality = 3, i.uniforms.uOffset = new Float32Array(2), i._pixelSize = new t.Point, i.pixelSize = 1, i._clamp = o, Array.isArray(n) ? i.kernels = n : (i._blur = n, i.quality = r), i } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o, i = this._pixelSize.x / n._frame.width, l = this._pixelSize.y / n._frame.height; if (1 === this._quality || 0 === this._blur) o = this._kernels[0] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, n, t, r); else { for (var a = e.getFilterTexture(), s = n, u = a, f = void 0, c = this._quality - 1, m = 0; m < c; m++)o = this._kernels[m] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, s, u, 1), f = s, s = u, u = f; o = this._kernels[c] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, s, t, r), e.returnFilterTexture(a) } }, n.prototype._updatePadding = function () { this.padding = Math.ceil(this._kernels.reduce((function (e, n) { return e + n + .5 }), 0)) }, n.prototype._generateKernels = function () { var e = this._blur, n = this._quality, t = [e]; if (e > 0) for (var r = e, o = e / n, i = 1; i < n; i++)r -= o, t.push(r); this._kernels = t, this._updatePadding() }, Object.defineProperty(n.prototype, "kernels", { get: function () { return this._kernels }, set: function (e) { Array.isArray(e) && e.length > 0 ? (this._kernels = e, this._quality = e.length, this._blur = Math.max.apply(Math, e)) : (this._kernels = [0], this._quality = 1) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "clamp", { get: function () { return this._clamp }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "pixelSize", { get: function () { return this._pixelSize }, set: function (e) { "number" == typeof e ? (this._pixelSize.x = e, this._pixelSize.y = e) : Array.isArray(e) ? (this._pixelSize.x = e[0], this._pixelSize.y = e[1]) : e instanceof t.Point ? (this._pixelSize.x = e.x, this._pixelSize.y = e.y) : (this._pixelSize.x = 1, this._pixelSize.y = 1) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "quality", { get: function () { return this._quality }, set: function (e) { this._quality = Math.max(1, Math.round(e)), this._generateKernels() }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "blur", { get: function () { return this._blur }, set: function (e) { this._blur = e, this._generateKernels() }, enumerable: !1, configurable: !0 }), n }(n.Filter), h = function (e) { function n(t) { var o = e.call(this, c, "uniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D bloomTexture;\nuniform float bloomScale;\nuniform float brightness;\n\nvoid main() {\n	vec4 color = texture2D(uSampler, vTextureCoord);\n	color.rgb *= brightness;\n	vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);\n	bloomColor.rgb *= bloomScale;\n	gl_FragColor = color + bloomColor;\n}\n") || this; o.bloomScale = 1, o.brightness = 1, o._resolution = r.settings.FILTER_RESOLUTION, "number" == typeof t && (t = { threshold: t }); var i = Object.assign(n.defaults, t); o.bloomScale = i.bloomScale, o.brightness = i.brightness; var l = i.kernels, a = i.blur, s = i.quality, u = i.pixelSize, f = i.resolution; return o._extractFilter = new p(i.threshold), o._extractFilter.resolution = f, o._blurFilter = l ? new d(l) : new d(a, s), o.pixelSize = u, o.resolution = f, o } return u(n, e), n.prototype.apply = function (e, n, t, r, o) { var i = e.getFilterTexture(); this._extractFilter.apply(e, n, i, 1, o); var l = e.getFilterTexture(); this._blurFilter.apply(e, i, l, 1), this.uniforms.bloomScale = this.bloomScale, this.uniforms.brightness = this.brightness, this.uniforms.bloomTexture = l, e.applyFilter(this, n, t, r), e.returnFilterTexture(l), e.returnFilterTexture(i) }, Object.defineProperty(n.prototype, "resolution", { get: function () { return this._resolution }, set: function (e) { this._resolution = e, this._extractFilter && (this._extractFilter.resolution = e), this._blurFilter && (this._blurFilter.resolution = e) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "threshold", { get: function () { return this._extractFilter.threshold }, set: function (e) { this._extractFilter.threshold = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "kernels", { get: function () { return this._blurFilter.kernels }, set: function (e) { this._blurFilter.kernels = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "blur", { get: function () { return this._blurFilter.blur }, set: function (e) { this._blurFilter.blur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "quality", { get: function () { return this._blurFilter.quality }, set: function (e) { this._blurFilter.quality = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "pixelSize", { get: function () { return this._blurFilter.pixelSize }, set: function (e) { this._blurFilter.pixelSize = e }, enumerable: !1, configurable: !0 }), n.defaults = { threshold: .5, bloomScale: 1, brightness: 1, kernels: null, blur: 8, quality: 4, pixelSize: 1, resolution: r.settings.FILTER_RESOLUTION }, n }(n.Filter), g = function (e) { function n(n) { void 0 === n && (n = 8); var t = e.call(this, c, "varying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nvec2 mapCoord( vec2 coord )\n{\n	coord *= filterArea.xy;\n	coord += filterArea.zw;\n\n	return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n	coord -= filterArea.zw;\n	coord /= filterArea.xy;\n\n	return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n	return floor( coord / size ) * size;\n}\n\nvec2 getMod(vec2 coord, vec2 size)\n{\n	return mod( coord , size) / size;\n}\n\nfloat character(float n, vec2 p)\n{\n	p = floor(p*vec2(4.0, -4.0) + 2.5);\n\n	if (clamp(p.x, 0.0, 4.0) == p.x)\n	{\n		if (clamp(p.y, 0.0, 4.0) == p.y)\n		{\n			if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n		}\n	}\n	return 0.0;\n}\n\nvoid main()\n{\n	vec2 coord = mapCoord(vTextureCoord);\n\n	// get the rounded color..\n	vec2 pixCoord = pixelate(coord, vec2(pixelSize));\n	pixCoord = unmapCoord(pixCoord);\n\n	vec4 color = texture2D(uSampler, pixCoord);\n\n	// determine the character to use\n	float gray = (color.r + color.g + color.b) / 3.0;\n\n	float n =  65536.0;			 // .\n	if (gray > 0.2) n = 65600.0;	// :\n	if (gray > 0.3) n = 332772.0;   // *\n	if (gray > 0.4) n = 15255086.0; // o\n	if (gray > 0.5) n = 23385164.0; // &\n	if (gray > 0.6) n = 15252014.0; // 8\n	if (gray > 0.7) n = 13199452.0; // @\n	if (gray > 0.8) n = 11512810.0; // #\n\n	// get the mod..\n	vec2 modd = getMod(coord, vec2(pixelSize));\n\n	gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);\n\n}\n") || this; return t.size = n, t } return u(n, e), Object.defineProperty(n.prototype, "size", { get: function () { return this.uniforms.pixelSize }, set: function (e) { this.uniforms.pixelSize = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), v = function (e) { function n(n) { var t = e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float transformX;\nuniform float transformY;\nuniform vec3 lightColor;\nuniform float lightAlpha;\nuniform vec3 shadowColor;\nuniform float shadowAlpha;\n\nvoid main(void) {\n	vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);\n	vec4 color = texture2D(uSampler, vTextureCoord);\n	float light = texture2D(uSampler, vTextureCoord - transform).a;\n	float shadow = texture2D(uSampler, vTextureCoord + transform).a;\n\n	color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));\n	color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));\n	gl_FragColor = vec4(color.rgb * color.a, color.a);\n}\n") || this; return t._thickness = 2, t._angle = 0, t.uniforms.lightColor = new Float32Array(3), t.uniforms.shadowColor = new Float32Array(3), Object.assign(t, { rotation: 45, thickness: 2, lightColor: 16777215, lightAlpha: .7, shadowColor: 0, shadowAlpha: .7 }, n), t.padding = 1, t } return u(n, e), n.prototype._updateTransform = function () { this.uniforms.transformX = this._thickness * Math.cos(this._angle), this.uniforms.transformY = this._thickness * Math.sin(this._angle) }, Object.defineProperty(n.prototype, "rotation", { get: function () { return this._angle / t.DEG_TO_RAD }, set: function (e) { this._angle = e * t.DEG_TO_RAD, this._updateTransform() }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "thickness", { get: function () { return this._thickness }, set: function (e) { this._thickness = e, this._updateTransform() }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "lightColor", { get: function () { return o.rgb2hex(this.uniforms.lightColor) }, set: function (e) { o.hex2rgb(e, this.uniforms.lightColor) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "lightAlpha", { get: function () { return this.uniforms.lightAlpha }, set: function (e) { this.uniforms.lightAlpha = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "shadowColor", { get: function () { return o.rgb2hex(this.uniforms.shadowColor) }, set: function (e) { o.hex2rgb(e, this.uniforms.shadowColor) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "shadowAlpha", { get: function () { return this.uniforms.shadowAlpha }, set: function (e) { this.uniforms.shadowAlpha = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), y = function (e) { function n(n, o, s, u) { void 0 === n && (n = 2), void 0 === o && (o = 4), void 0 === s && (s = r.settings.FILTER_RESOLUTION), void 0 === u && (u = 5); var f, c, m = e.call(this) || this; return "number" == typeof n ? (f = n, c = n) : n instanceof t.Point ? (f = n.x, c = n.y) : Array.isArray(n) && (f = n[0], c = n[1]), m.blurXFilter = new a.BlurFilterPass(!0, f, o, s, u), m.blurYFilter = new a.BlurFilterPass(!1, c, o, s, u), m.blurYFilter.blendMode = i.BLEND_MODES.SCREEN, m.defaultFilter = new l.AlphaFilter, m } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = e.getFilterTexture(); this.defaultFilter.apply(e, n, t, r), this.blurXFilter.apply(e, n, o, 1), this.blurYFilter.apply(e, o, t, 0), e.returnFilterTexture(o) }, Object.defineProperty(n.prototype, "blur", { get: function () { return this.blurXFilter.blur }, set: function (e) { this.blurXFilter.blur = this.blurYFilter.blur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "blurX", { get: function () { return this.blurXFilter.blur }, set: function (e) { this.blurXFilter.blur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "blurY", { get: function () { return this.blurYFilter.blur }, set: function (e) { this.blurYFilter.blur = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), b = function (e) { function n(t) { var r = e.call(this, c, "uniform float radius;\nuniform float strength;\nuniform vec2 center;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nvoid main()\n{\n	vec2 coord = vTextureCoord * filterArea.xy;\n	coord -= center * dimensions.xy;\n	float distance = length(coord);\n	if (distance < radius) {\n		float percent = distance / radius;\n		if (strength > 0.0) {\n			coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\n		} else {\n			coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\n		}\n	}\n	coord += center * dimensions.xy;\n	coord /= filterArea.xy;\n	vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n	vec4 color = texture2D(uSampler, clampedCoord);\n	if (coord != clampedCoord) {\n		color *= max(0.0, 1.0 - length(coord - clampedCoord));\n	}\n\n	gl_FragColor = color;\n}\n") || this; return r.uniforms.dimensions = new Float32Array(2), Object.assign(r, n.defaults, t), r } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = n.filterFrame, i = o.width, l = o.height; this.uniforms.dimensions[0] = i, this.uniforms.dimensions[1] = l, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "radius", { get: function () { return this.uniforms.radius }, set: function (e) { this.uniforms.radius = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "strength", { get: function () { return this.uniforms.strength }, set: function (e) { this.uniforms.strength = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "center", { get: function () { return this.uniforms.center }, set: function (e) { this.uniforms.center = e }, enumerable: !1, configurable: !0 }), n.defaults = { center: [.5, .5], radius: 100, strength: 1 }, n }(n.Filter), x = function (e) { function t(n, t, r) { void 0 === t && (t = !1), void 0 === r && (r = 1); var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D colorMap;\nuniform float _mix;\nuniform float _size;\nuniform float _sliceSize;\nuniform float _slicePixelSize;\nuniform float _sliceInnerSize;\nvoid main() {\n	vec4 color = texture2D(uSampler, vTextureCoord.xy);\n\n	vec4 adjusted;\n	if (color.a > 0.0) {\n		color.rgb /= color.a;\n		float innerWidth = _size - 1.0;\n		float zSlice0 = min(floor(color.b * innerWidth), innerWidth);\n		float zSlice1 = min(zSlice0 + 1.0, innerWidth);\n		float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;\n		float s0 = xOffset + (zSlice0 * _sliceSize);\n		float s1 = xOffset + (zSlice1 * _sliceSize);\n		float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);\n		vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));\n		vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));\n		float zOffset = fract(color.b * innerWidth);\n		adjusted = mix(slice0Color, slice1Color, zOffset);\n\n		color.rgb *= color.a;\n	}\n	gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);\n\n}") || this; return o.mix = 1, o._size = 0, o._sliceSize = 0, o._slicePixelSize = 0, o._sliceInnerSize = 0, o._nearest = !1, o._scaleMode = null, o._colorMap = null, o._scaleMode = null, o.nearest = t, o.mix = r, o.colorMap = n, o } return u(t, e), t.prototype.apply = function (e, n, t, r) { this.uniforms._mix = this.mix, e.applyFilter(this, n, t, r) }, Object.defineProperty(t.prototype, "colorSize", { get: function () { return this._size }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "colorMap", { get: function () { return this._colorMap }, set: function (e) { var t; e && (e instanceof n.Texture || (e = n.Texture.from(e)), (null === (t = e) || void 0 === t ? void 0 : t.baseTexture) && (e.baseTexture.scaleMode = this._scaleMode, e.baseTexture.mipmap = i.MIPMAP_MODES.OFF, this._size = e.height, this._sliceSize = 1 / this._size, this._slicePixelSize = this._sliceSize / this._size, this._sliceInnerSize = this._slicePixelSize * (this._size - 1), this.uniforms._size = this._size, this.uniforms._sliceSize = this._sliceSize, this.uniforms._slicePixelSize = this._slicePixelSize, this.uniforms._sliceInnerSize = this._sliceInnerSize, this.uniforms.colorMap = e), this._colorMap = e) }, enumerable: !1, configurable: !0 }), Object.defineProperty(t.prototype, "nearest", { get: function () { return this._nearest }, set: function (e) { this._nearest = e, this._scaleMode = e ? i.SCALE_MODES.NEAREST : i.SCALE_MODES.LINEAR; var n = this._colorMap; n && n.baseTexture && (n.baseTexture._glTextures = {}, n.baseTexture.scaleMode = this._scaleMode, n.baseTexture.mipmap = i.MIPMAP_MODES.OFF, n._updateID++, n.baseTexture.emit("update", n.baseTexture)) }, enumerable: !1, configurable: !0 }), t.prototype.updateColorMap = function () { var e = this._colorMap; e && e.baseTexture && (e._updateID++, e.baseTexture.emit("update", e.baseTexture), this.colorMap = e) }, t.prototype.destroy = function (n) { void 0 === n && (n = !1), this._colorMap && this._colorMap.destroy(n), e.prototype.destroy.call(this) }, t }(n.Filter), _ = function (e) { function n(n, t) { void 0 === n && (n = 0), void 0 === t && (t = 1); var r = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec3 color;\nuniform float alpha;\n\nvoid main(void) {\n	vec4 currentColor = texture2D(uSampler, vTextureCoord);\n	gl_FragColor = vec4(mix(currentColor.rgb, color.rgb, currentColor.a * alpha), currentColor.a);\n}\n") || this; return r._color = 0, r._alpha = 1, r.uniforms.color = new Float32Array(3), r.color = n, r.alpha = t, r } return u(n, e), Object.defineProperty(n.prototype, "color", { get: function () { return this._color }, set: function (e) { var n = this.uniforms.color; "number" == typeof e ? (o.hex2rgb(e, n), this._color = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], this._color = o.rgb2hex(n)) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "alpha", { get: function () { return this._alpha }, set: function (e) { this.uniforms.alpha = e, this._alpha = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), C = function (e) { function n(n, t, r) { void 0 === n && (n = 16711680), void 0 === t && (t = 0), void 0 === r && (r = .4); var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec3 originalColor;\nuniform vec3 newColor;\nuniform float epsilon;\nvoid main(void) {\n	vec4 currentColor = texture2D(uSampler, vTextureCoord);\n	vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));\n	float colorDistance = length(colorDiff);\n	float doReplace = step(colorDistance, epsilon);\n	gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);\n}\n") || this; return o._originalColor = 16711680, o._newColor = 0, o.uniforms.originalColor = new Float32Array(3), o.uniforms.newColor = new Float32Array(3), o.originalColor = n, o.newColor = t, o.epsilon = r, o } return u(n, e), Object.defineProperty(n.prototype, "originalColor", { get: function () { return this._originalColor }, set: function (e) { var n = this.uniforms.originalColor; "number" == typeof e ? (o.hex2rgb(e, n), this._originalColor = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], this._originalColor = o.rgb2hex(n)) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "newColor", { get: function () { return this._newColor }, set: function (e) { var n = this.uniforms.newColor; "number" == typeof e ? (o.hex2rgb(e, n), this._newColor = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], this._newColor = o.rgb2hex(n)) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "epsilon", { get: function () { return this.uniforms.epsilon }, set: function (e) { this.uniforms.epsilon = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), S = function (e) { function n(n, t, r) { void 0 === t && (t = 200), void 0 === r && (r = 200); var o = e.call(this, c, "precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n	   c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n	   c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n	   c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n") || this; return o.uniforms.texelSize = new Float32Array(2), o.uniforms.matrix = new Float32Array(9), void 0 !== n && (o.matrix = n), o.width = t, o.height = r, o } return u(n, e), Object.defineProperty(n.prototype, "matrix", { get: function () { return this.uniforms.matrix }, set: function (e) { var n = this; e.forEach((function (e, t) { n.uniforms.matrix[t] = e })) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "width", { get: function () { return 1 / this.uniforms.texelSize[0] }, set: function (e) { this.uniforms.texelSize[0] = 1 / e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "height", { get: function () { return 1 / this.uniforms.texelSize[1] }, set: function (e) { this.uniforms.texelSize[1] = 1 / e }, enumerable: !1, configurable: !0 }), n }(n.Filter), F = function (e) { function n() { return e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n	float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n	if (lum < 1.00)\n	{\n		if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n		{\n			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		}\n	}\n\n	if (lum < 0.75)\n	{\n		if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n		{\n			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		}\n	}\n\n	if (lum < 0.50)\n	{\n		if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n		{\n			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		}\n	}\n\n	if (lum < 0.3)\n	{\n		if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n		{\n			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n		}\n	}\n}\n") || this } return u(n, e), n }(n.Filter), z = function (e) { function n(t) { var r = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nconst float SQRT_2 = 1.414213;\n\nconst float light = 1.0;\n\nuniform float curvature;\nuniform float lineWidth;\nuniform float lineContrast;\nuniform bool verticalLine;\nuniform float noise;\nuniform float noiseSize;\n\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\n\nuniform float seed;\nuniform float time;\n\nfloat rand(vec2 co) {\n	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n	vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n	vec2 dir = vec2(vTextureCoord.xy - vec2(0.5, 0.5)) * filterArea.xy / dimensions;\n\n	gl_FragColor = texture2D(uSampler, vTextureCoord);\n	vec3 rgb = gl_FragColor.rgb;\n\n	if (noise > 0.0 && noiseSize > 0.0)\n	{\n		pixelCoord.x = floor(pixelCoord.x / noiseSize);\n		pixelCoord.y = floor(pixelCoord.y / noiseSize);\n		float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n		rgb += _noise * noise;\n	}\n\n	if (lineWidth > 0.0)\n	{\n		float _c = curvature > 0. ? curvature : 1.;\n		float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;\n		vec2 uv = dir * k;\n\n		float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;\n		float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;\n		rgb *= j;\n		float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);\n		rgb *= 0.99 + ceil(segment) * 0.015;\n	}\n\n	if (vignetting > 0.0)\n	{\n		float outter = SQRT_2 - vignetting * SQRT_2;\n		float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n		rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n	}\n\n	gl_FragColor.rgb = rgb;\n}\n") || this; return r.time = 0, r.seed = 0, r.uniforms.dimensions = new Float32Array(2), Object.assign(r, n.defaults, t), r } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = n.filterFrame, i = o.width, l = o.height; this.uniforms.dimensions[0] = i, this.uniforms.dimensions[1] = l, this.uniforms.seed = this.seed, this.uniforms.time = this.time, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "curvature", { get: function () { return this.uniforms.curvature }, set: function (e) { this.uniforms.curvature = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "lineWidth", { get: function () { return this.uniforms.lineWidth }, set: function (e) { this.uniforms.lineWidth = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "lineContrast", { get: function () { return this.uniforms.lineContrast }, set: function (e) { this.uniforms.lineContrast = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "verticalLine", { get: function () { return this.uniforms.verticalLine }, set: function (e) { this.uniforms.verticalLine = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "noise", { get: function () { return this.uniforms.noise }, set: function (e) { this.uniforms.noise = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "noiseSize", { get: function () { return this.uniforms.noiseSize }, set: function (e) { this.uniforms.noiseSize = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignetting", { get: function () { return this.uniforms.vignetting }, set: function (e) { this.uniforms.vignetting = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignettingAlpha", { get: function () { return this.uniforms.vignettingAlpha }, set: function (e) { this.uniforms.vignettingAlpha = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignettingBlur", { get: function () { return this.uniforms.vignettingBlur }, set: function (e) { this.uniforms.vignettingBlur = e }, enumerable: !1, configurable: !0 }), n.defaults = { curvature: 1, lineWidth: 1, lineContrast: .25, verticalLine: !1, noise: 0, noiseSize: 1, seed: 0, vignetting: .3, vignettingAlpha: 1, vignettingBlur: .3, time: 0 }, n }(n.Filter), O = function (e) { function n(n, t) { void 0 === n && (n = 1), void 0 === t && (t = 5); var r = e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 filterArea;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * filterArea.xy;\n   vec2 point = vec2(\n	   c * tex.x - s * tex.y,\n	   s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n") || this; return r.scale = n, r.angle = t, r } return u(n, e), Object.defineProperty(n.prototype, "scale", { get: function () { return this.uniforms.scale }, set: function (e) { this.uniforms.scale = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "angle", { get: function () { return this.uniforms.angle }, set: function (e) { this.uniforms.angle = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), P = function (e) { function i(o) { var l = e.call(this) || this; l.angle = 45, l._distance = 5, l._resolution = r.settings.FILTER_RESOLUTION; var a = o ? f(f({}, i.defaults), o) : i.defaults, s = a.kernels, u = a.blur, m = a.quality, p = a.pixelSize, h = a.resolution; l._tintFilter = new n.Filter(c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform vec3 color;\n\nuniform vec2 shift;\nuniform vec4 inputSize;\n\nvoid main(void){\n	vec4 sample = texture2D(uSampler, vTextureCoord - shift * inputSize.zw);\n\n	// Premultiply alpha\n	sample.rgb = color.rgb * sample.a;\n\n	// alpha user alpha\n	sample *= alpha;\n\n	gl_FragColor = sample;\n}"), l._tintFilter.uniforms.color = new Float32Array(4), l._tintFilter.uniforms.shift = new t.Point, l._tintFilter.resolution = h, l._blurFilter = s ? new d(s) : new d(u, m), l.pixelSize = p, l.resolution = h; var g = a.shadowOnly, v = a.rotation, y = a.distance, b = a.alpha, x = a.color; return l.shadowOnly = g, l.rotation = v, l.distance = y, l.alpha = b, l.color = x, l._updatePadding(), l } return u(i, e), i.prototype.apply = function (e, n, t, r) { var o = e.getFilterTexture(); this._tintFilter.apply(e, n, o, 1), this._blurFilter.apply(e, o, t, r), !0 !== this.shadowOnly && e.applyFilter(this, n, t, 0), e.returnFilterTexture(o) }, i.prototype._updatePadding = function () { this.padding = this.distance + 2 * this.blur }, i.prototype._updateShift = function () { this._tintFilter.uniforms.shift.set(this.distance * Math.cos(this.angle), this.distance * Math.sin(this.angle)) }, Object.defineProperty(i.prototype, "resolution", { get: function () { return this._resolution }, set: function (e) { this._resolution = e, this._tintFilter && (this._tintFilter.resolution = e), this._blurFilter && (this._blurFilter.resolution = e) }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "distance", { get: function () { return this._distance }, set: function (e) { this._distance = e, this._updatePadding(), this._updateShift() }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "rotation", { get: function () { return this.angle / t.DEG_TO_RAD }, set: function (e) { this.angle = e * t.DEG_TO_RAD, this._updateShift() }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "alpha", { get: function () { return this._tintFilter.uniforms.alpha }, set: function (e) { this._tintFilter.uniforms.alpha = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "color", { get: function () { return o.rgb2hex(this._tintFilter.uniforms.color) }, set: function (e) { o.hex2rgb(e, this._tintFilter.uniforms.color) }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "kernels", { get: function () { return this._blurFilter.kernels }, set: function (e) { this._blurFilter.kernels = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "blur", { get: function () { return this._blurFilter.blur }, set: function (e) { this._blurFilter.blur = e, this._updatePadding() }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "quality", { get: function () { return this._blurFilter.quality }, set: function (e) { this._blurFilter.quality = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "pixelSize", { get: function () { return this._blurFilter.pixelSize }, set: function (e) { this._blurFilter.pixelSize = e }, enumerable: !1, configurable: !0 }), i.defaults = { rotation: 45, distance: 5, color: 0, alpha: .5, shadowOnly: !1, kernels: null, blur: 2, quality: 3, pixelSize: 1, resolution: r.settings.FILTER_RESOLUTION }, i }(n.Filter), A = function (e) { function n(n) { void 0 === n && (n = 5); var t = e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float strength;\nuniform vec4 filterArea;\n\n\nvoid main(void)\n{\n\tvec2 onePixel = vec2(1.0 / filterArea);\n\n\tvec4 color;\n\n\tcolor.rgb = vec3(0.5);\n\n\tcolor -= texture2D(uSampler, vTextureCoord - onePixel) * strength;\n\tcolor += texture2D(uSampler, vTextureCoord + onePixel) * strength;\n\n\tcolor.rgb = vec3((color.r + color.g + color.b) / 3.0);\n\n\tfloat alpha = texture2D(uSampler, vTextureCoord).a;\n\n\tgl_FragColor = vec4(color.rgb * alpha, alpha);\n}\n") || this; return t.strength = n, t } return u(n, e), Object.defineProperty(n.prototype, "strength", { get: function () { return this.uniforms.strength }, set: function (e) { this.uniforms.strength = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), T = function (e) { function r(t) { var o = e.call(this, c, "// precision highp float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\nuniform float aspect;\n\nuniform sampler2D displacementMap;\nuniform float offset;\nuniform float sinDir;\nuniform float cosDir;\nuniform int fillMode;\n\nuniform float seed;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nconst int TRANSPARENT = 0;\nconst int ORIGINAL = 1;\nconst int LOOP = 2;\nconst int CLAMP = 3;\nconst int MIRROR = 4;\n\nvoid main(void)\n{\n	vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;\n\n	if (coord.x > 1.0 || coord.y > 1.0) {\n		return;\n	}\n\n	float cx = coord.x - 0.5;\n	float cy = (coord.y - 0.5) * aspect;\n	float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;\n\n	// displacementMap: repeat\n	// ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);\n\n	// displacementMap: mirror\n	ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);\n\n	vec4 dc = texture2D(displacementMap, vec2(0.5, ny));\n\n	float displacement = (dc.r - dc.g) * (offset / filterArea.x);\n\n	coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);\n\n	if (fillMode == CLAMP) {\n		coord = clamp(coord, filterClamp.xy, filterClamp.zw);\n	} else {\n		if( coord.x > filterClamp.z ) {\n			if (fillMode == TRANSPARENT) {\n				discard;\n			} else if (fillMode == LOOP) {\n				coord.x -= filterClamp.z;\n			} else if (fillMode == MIRROR) {\n				coord.x = filterClamp.z * 2.0 - coord.x;\n			}\n		} else if( coord.x < filterClamp.x ) {\n			if (fillMode == TRANSPARENT) {\n				discard;\n			} else if (fillMode == LOOP) {\n				coord.x += filterClamp.z;\n			} else if (fillMode == MIRROR) {\n				coord.x *= -filterClamp.z;\n			}\n		}\n\n		if( coord.y > filterClamp.w ) {\n			if (fillMode == TRANSPARENT) {\n				discard;\n			} else if (fillMode == LOOP) {\n				coord.y -= filterClamp.w;\n			} else if (fillMode == MIRROR) {\n				coord.y = filterClamp.w * 2.0 - coord.y;\n			}\n		} else if( coord.y < filterClamp.y ) {\n			if (fillMode == TRANSPARENT) {\n				discard;\n			} else if (fillMode == LOOP) {\n				coord.y += filterClamp.w;\n			} else if (fillMode == MIRROR) {\n				coord.y *= -filterClamp.w;\n			}\n		}\n	}\n\n	gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;\n	gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;\n	gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;\n	gl_FragColor.a = texture2D(uSampler, coord).a;\n}\n") || this; return o.offset = 100, o.fillMode = r.TRANSPARENT, o.average = !1, o.seed = 0, o.minSize = 8, o.sampleSize = 512, o._slices = 0, o._offsets = new Float32Array(1), o._sizes = new Float32Array(1), o._direction = -1, o.uniforms.dimensions = new Float32Array(2), o._canvas = document.createElement("canvas"), o._canvas.width = 4, o._canvas.height = o.sampleSize, o.texture = n.Texture.from(o._canvas, { scaleMode: i.SCALE_MODES.NEAREST }), Object.assign(o, r.defaults, t), o } return u(r, e), r.prototype.apply = function (e, n, t, r) { var o = n.filterFrame, i = o.width, l = o.height; this.uniforms.dimensions[0] = i, this.uniforms.dimensions[1] = l, this.uniforms.aspect = l / i, this.uniforms.seed = this.seed, this.uniforms.offset = this.offset, this.uniforms.fillMode = this.fillMode, e.applyFilter(this, n, t, r) }, r.prototype._randomizeSizes = function () { var e = this._sizes, n = this._slices - 1, t = this.sampleSize, r = Math.min(this.minSize / t, .9 / this._slices); if (this.average) { for (var o = this._slices, i = 1, l = 0; l < n; l++) { var a = i / (o - l), s = Math.max(a * (1 - .6 * Math.random()), r); e[l] = s, i -= s } e[n] = i } else { i = 1; var u = Math.sqrt(1 / this._slices); for (l = 0; l < n; l++) { s = Math.max(u * i * Math.random(), r); e[l] = s, i -= s } e[n] = i } this.shuffle() }, r.prototype.shuffle = function () { for (var e = this._sizes, n = this._slices - 1; n > 0; n--) { var t = Math.random() * n >> 0, r = e[n]; e[n] = e[t], e[t] = r } }, r.prototype._randomizeOffsets = function () { for (var e = 0; e < this._slices; e++)this._offsets[e] = Math.random() * (Math.random() < .5 ? -1 : 1) }, r.prototype.refresh = function () { this._randomizeSizes(), this._randomizeOffsets(), this.redraw() }, r.prototype.redraw = function () { var e, n = this.sampleSize, t = this.texture, r = this._canvas.getContext("2d"); r.clearRect(0, 0, 8, n); for (var o = 0, i = 0; i < this._slices; i++) { e = Math.floor(256 * this._offsets[i]); var l = this._sizes[i] * n, a = e > 0 ? e : 0, s = e < 0 ? -e : 0; r.fillStyle = "rgba(" + a + ", " + s + ", 0, 1)", r.fillRect(0, o >> 0, n, l + 1 >> 0), o += l } t.baseTexture.update(), this.uniforms.displacementMap = t }, Object.defineProperty(r.prototype, "sizes", { get: function () { return this._sizes }, set: function (e) { for (var n = Math.min(this._slices, e.length), t = 0; t < n; t++)this._sizes[t] = e[t] }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "offsets", { get: function () { return this._offsets }, set: function (e) { for (var n = Math.min(this._slices, e.length), t = 0; t < n; t++)this._offsets[t] = e[t] }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "slices", { get: function () { return this._slices }, set: function (e) { this._slices !== e && (this._slices = e, this.uniforms.slices = e, this._sizes = this.uniforms.slicesWidth = new Float32Array(e), this._offsets = this.uniforms.slicesOffset = new Float32Array(e), this.refresh()) }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "direction", { get: function () { return this._direction }, set: function (e) { if (this._direction !== e) { this._direction = e; var n = e * t.DEG_TO_RAD; this.uniforms.sinDir = Math.sin(n), this.uniforms.cosDir = Math.cos(n) } }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "red", { get: function () { return this.uniforms.red }, set: function (e) { this.uniforms.red = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "green", { get: function () { return this.uniforms.green }, set: function (e) { this.uniforms.green = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(r.prototype, "blue", { get: function () { return this.uniforms.blue }, set: function (e) { this.uniforms.blue = e }, enumerable: !1, configurable: !0 }), r.prototype.destroy = function () { var e; null === (e = this.texture) || void 0 === e || e.destroy(!0), this.texture = this._canvas = this.red = this.green = this.blue = this._sizes = this._offsets = null }, r.defaults = { slices: 5, offset: 100, direction: 0, fillMode: 0, average: !1, seed: 0, red: [0, 0], green: [0, 0], blue: [0, 0], minSize: 8, sampleSize: 512 }, r.TRANSPARENT = 0, r.ORIGINAL = 1, r.LOOP = 2, r.CLAMP = 3, r.MIRROR = 4, r }(n.Filter), w = function (e) { function n(t) { var r = this, o = Object.assign({}, n.defaults, t), i = o.outerStrength, l = o.innerStrength, a = o.color, s = o.knockout, u = o.quality, f = Math.round(o.distance); return (r = e.call(this, c, "varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nuniform float outerStrength;\nuniform float innerStrength;\n\nuniform vec4 glowColor;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform bool knockout;\n\nconst float PI = 3.14159265358979323846264;\n\nconst float DIST = __DIST__;\nconst float ANGLE_STEP_SIZE = min(__ANGLE_STEP_SIZE__, PI * 2.0);\nconst float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);\n\nconst float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;\n\nvoid main(void) {\n	vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);\n\n	float totalAlpha = 0.0;\n\n	vec2 direction;\n	vec2 displaced;\n	vec4 curColor;\n\n	for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {\n	   direction = vec2(cos(angle), sin(angle)) * px;\n\n	   for (float curDistance = 0.0; curDistance < DIST; curDistance++) {\n		   displaced = clamp(vTextureCoord + direction * \n				   (curDistance + 1.0), filterClamp.xy, filterClamp.zw);\n\n		   curColor = texture2D(uSampler, displaced);\n\n		   totalAlpha += (DIST - curDistance) * curColor.a;\n	   }\n	}\n	\n	curColor = texture2D(uSampler, vTextureCoord);\n\n	float alphaRatio = (totalAlpha / MAX_TOTAL_ALPHA);\n\n	float innerGlowAlpha = (1.0 - alphaRatio) * innerStrength * curColor.a;\n	float innerGlowStrength = min(1.0, innerGlowAlpha);\n	\n	vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);\n\n	float outerGlowAlpha = alphaRatio * outerStrength * (1. - curColor.a);\n	float outerGlowStrength = min(1.0 - innerColor.a, outerGlowAlpha);\n\n	vec4 outerGlowColor = outerGlowStrength * glowColor.rgba;\n	\n	if (knockout) {\n	  float resultAlpha = outerGlowAlpha + innerGlowAlpha;\n	  gl_FragColor = vec4(glowColor.rgb * resultAlpha, resultAlpha);\n	}\n	else {\n	  gl_FragColor = innerColor + outerGlowColor;\n	}\n}\n".replace(/__ANGLE_STEP_SIZE__/gi, "" + (1 / u / f).toFixed(7)).replace(/__DIST__/gi, f.toFixed(0) + ".0")) || this).uniforms.glowColor = new Float32Array([0, 0, 0, 1]), Object.assign(r, { color: a, outerStrength: i, innerStrength: l, padding: f, knockout: s }), r } return u(n, e), Object.defineProperty(n.prototype, "color", { get: function () { return o.rgb2hex(this.uniforms.glowColor) }, set: function (e) { o.hex2rgb(e, this.uniforms.glowColor) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "outerStrength", { get: function () { return this.uniforms.outerStrength }, set: function (e) { this.uniforms.outerStrength = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "innerStrength", { get: function () { return this.uniforms.innerStrength }, set: function (e) { this.uniforms.innerStrength = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "knockout", { get: function () { return this.uniforms.knockout }, set: function (e) { this.uniforms.knockout = e }, enumerable: !1, configurable: !0 }), n.defaults = { distance: 10, outerStrength: 4, innerStrength: 0, color: 16777215, quality: .1, knockout: !1 }, n }(n.Filter), D = function (e) { function n(r) { var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform vec2 light;\nuniform bool parallel;\nuniform float aspect;\n\nuniform float gain;\nuniform float lacunarity;\nuniform float time;\nuniform float alpha;\n\n${perlin}\n\nvoid main(void) {\n	vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n	float d;\n\n	if (parallel) {\n		float _cos = light.x;\n		float _sin = light.y;\n		d = (_cos * coord.x) + (_sin * coord.y * aspect);\n	} else {\n		float dx = coord.x - light.x / dimensions.x;\n		float dy = (coord.y - light.y / dimensions.y) * aspect;\n		float dis = sqrt(dx * dx + dy * dy) + 0.00001;\n		d = dy / dis;\n	}\n\n	vec3 dir = vec3(d, d, 0.0);\n\n	float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);\n	noise = mix(noise, 0.0, 0.3);\n	//fade vertically.\n	vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);\n	mist.a = 1.0;\n	// apply user alpha\n	mist *= alpha;\n\n	gl_FragColor = texture2D(uSampler, vTextureCoord) + mist;\n\n}\n".replace("${perlin}", "vec3 mod289(vec3 x)\n{\n	return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 mod289(vec4 x)\n{\n	return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 permute(vec4 x)\n{\n	return mod289(((x * 34.0) + 1.0) * x);\n}\nvec4 taylorInvSqrt(vec4 r)\n{\n	return 1.79284291400159 - 0.85373472095314 * r;\n}\nvec3 fade(vec3 t)\n{\n	return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n	vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n	vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n	Pi0 = mod289(Pi0);\n	Pi1 = mod289(Pi1);\n	vec3 Pf0 = fract(P); // Fractional part for interpolation\n	vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n	vec4 iy = vec4(Pi0.yy, Pi1.yy);\n	vec4 iz0 = Pi0.zzzz;\n	vec4 iz1 = Pi1.zzzz;\n	vec4 ixy = permute(permute(ix) + iy);\n	vec4 ixy0 = permute(ixy + iz0);\n	vec4 ixy1 = permute(ixy + iz1);\n	vec4 gx0 = ixy0 * (1.0 / 7.0);\n	vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n	gx0 = fract(gx0);\n	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n	vec4 sz0 = step(gz0, vec4(0.0));\n	gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n	gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n	vec4 gx1 = ixy1 * (1.0 / 7.0);\n	vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n	gx1 = fract(gx1);\n	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n	vec4 sz1 = step(gz1, vec4(0.0));\n	gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n	gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n	vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n	vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n	vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n	vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n	vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n	vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n	vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n	vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n	g000 *= norm0.x;\n	g010 *= norm0.y;\n	g100 *= norm0.z;\n	g110 *= norm0.w;\n	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n	g001 *= norm1.x;\n	g011 *= norm1.y;\n	g101 *= norm1.z;\n	g111 *= norm1.w;\n	float n000 = dot(g000, Pf0);\n	float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n	float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n	float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n	float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n	float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n	float n111 = dot(g111, Pf1);\n	vec3 fade_xyz = fade(Pf0);\n	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n	float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n	return 2.2 * n_xyz;\n}\nfloat turb(vec3 P, vec3 rep, float lacunarity, float gain)\n{\n	float sum = 0.0;\n	float sc = 1.0;\n	float totalgain = 1.0;\n	for (float i = 0.0; i < 6.0; i++)\n	{\n		sum += totalgain * pnoise(P * sc, rep);\n		sc *= lacunarity;\n		totalgain *= gain;\n	}\n	return abs(sum);\n}\n")) || this; o.parallel = !0, o.time = 0, o._angle = 0, o.uniforms.dimensions = new Float32Array(2); var i = Object.assign(n.defaults, r); return o._angleLight = new t.Point, o.angle = i.angle, o.gain = i.gain, o.lacunarity = i.lacunarity, o.alpha = i.alpha, o.parallel = i.parallel, o.center = i.center, o.time = i.time, o } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = n.filterFrame, i = o.width, l = o.height; this.uniforms.light = this.parallel ? this._angleLight : this.center, this.uniforms.parallel = this.parallel, this.uniforms.dimensions[0] = i, this.uniforms.dimensions[1] = l, this.uniforms.aspect = l / i, this.uniforms.time = this.time, this.uniforms.alpha = this.alpha, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "angle", { get: function () { return this._angle }, set: function (e) { this._angle = e; var n = e * t.DEG_TO_RAD; this._angleLight.x = Math.cos(n), this._angleLight.y = Math.sin(n) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "gain", { get: function () { return this.uniforms.gain }, set: function (e) { this.uniforms.gain = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "lacunarity", { get: function () { return this.uniforms.lacunarity }, set: function (e) { this.uniforms.lacunarity = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "alpha", { get: function () { return this.uniforms.alpha }, set: function (e) { this.uniforms.alpha = e }, enumerable: !1, configurable: !0 }), n.defaults = { angle: 30, gain: .5, lacunarity: 2.5, time: 0, parallel: !0, center: [0, 0], alpha: 1 }, n }(n.Filter), j = function (e) { function n(n, r, o) { void 0 === n && (n = [0, 0]), void 0 === r && (r = 5), void 0 === o && (o = 0); var i = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uVelocity;\nuniform int uKernelSize;\nuniform float uOffset;\n\nconst int MAX_KERNEL_SIZE = 2048;\n\n// Notice:\n// the perfect way:\n//	int kernelSize = min(uKernelSize, MAX_KERNELSIZE);\n// BUT in real use-case , uKernelSize < MAX_KERNELSIZE almost always.\n// So use uKernelSize directly.\n\nvoid main(void)\n{\n	vec4 color = texture2D(uSampler, vTextureCoord);\n\n	if (uKernelSize == 0)\n	{\n		gl_FragColor = color;\n		return;\n	}\n\n	vec2 velocity = uVelocity / filterArea.xy;\n	float offset = -uOffset / length(uVelocity) - 0.5;\n	int k = uKernelSize - 1;\n\n	for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {\n		if (i == k) {\n			break;\n		}\n		vec2 bias = velocity * (float(i) / float(k) + offset);\n		color += texture2D(uSampler, vTextureCoord + bias);\n	}\n	gl_FragColor = color / float(uKernelSize);\n}\n") || this; return i.kernelSize = 5, i.uniforms.uVelocity = new Float32Array(2), i._velocity = new t.ObservablePoint(i.velocityChanged, i), i.setVelocity(n), i.kernelSize = r, i.offset = o, i } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = this.velocity, i = o.x, l = o.y; this.uniforms.uKernelSize = 0 !== i || 0 !== l ? this.kernelSize : 0, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "velocity", { get: function () { return this._velocity }, set: function (e) { this.setVelocity(e) }, enumerable: !1, configurable: !0 }), n.prototype.setVelocity = function (e) { if (Array.isArray(e)) { var n = e[0], t = e[1]; this._velocity.set(n, t) } else this._velocity.copyFrom(e) }, n.prototype.velocityChanged = function () { this.uniforms.uVelocity[0] = this._velocity.x, this.uniforms.uVelocity[1] = this._velocity.y, this.padding = 1 + (Math.max(Math.abs(this._velocity.x), Math.abs(this._velocity.y)) >> 0) }, Object.defineProperty(n.prototype, "offset", { get: function () { return this.uniforms.uOffset }, set: function (e) { this.uniforms.uOffset = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), M = function (e) { function n(n, t, r) { void 0 === t && (t = .05), void 0 === r && (r = n.length); var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float epsilon;\n\nconst int MAX_COLORS = %maxColors%;\n\nuniform vec3 originalColors[MAX_COLORS];\nuniform vec3 targetColors[MAX_COLORS];\n\nvoid main(void)\n{\n	gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n	float alpha = gl_FragColor.a;\n	if (alpha < 0.0001)\n	{\n	  return;\n	}\n\n	vec3 color = gl_FragColor.rgb / alpha;\n\n	for(int i = 0; i < MAX_COLORS; i++)\n	{\n	  vec3 origColor = originalColors[i];\n	  if (origColor.r < 0.0)\n	  {\n		break;\n	  }\n	  vec3 colorDiff = origColor - color;\n	  if (length(colorDiff) < epsilon)\n	  {\n		vec3 targetColor = targetColors[i];\n		gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);\n		return;\n	  }\n	}\n}\n".replace(/%maxColors%/g, r.toFixed(0))) || this; return o._replacements = [], o._maxColors = 0, o.epsilon = t, o._maxColors = r, o.uniforms.originalColors = new Float32Array(3 * r), o.uniforms.targetColors = new Float32Array(3 * r), o.replacements = n, o } return u(n, e), Object.defineProperty(n.prototype, "replacements", { get: function () { return this._replacements }, set: function (e) { var n = this.uniforms.originalColors, t = this.uniforms.targetColors, r = e.length; if (r > this._maxColors) throw new Error("Length of replacements (" + r + ") exceeds the maximum colors length (" + this._maxColors + ")"); n[3 * r] = -1; for (var i = 0; i < r; i++) { var l = e[i], a = l[0]; "number" == typeof a ? a = o.hex2rgb(a) : l[0] = o.rgb2hex(a), n[3 * i] = a[0], n[3 * i + 1] = a[1], n[3 * i + 2] = a[2]; var s = l[1]; "number" == typeof s ? s = o.hex2rgb(s) : l[1] = o.rgb2hex(s), t[3 * i] = s[0], t[3 * i + 1] = s[1], t[3 * i + 2] = s[2] } this._replacements = e }, enumerable: !1, configurable: !0 }), n.prototype.refresh = function () { this.replacements = this._replacements }, Object.defineProperty(n.prototype, "maxColors", { get: function () { return this._maxColors }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "epsilon", { get: function () { return this.uniforms.epsilon }, set: function (e) { this.uniforms.epsilon = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), R = function (e) { function n(t, r) { void 0 === r && (r = 0); var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform float sepia;\nuniform float noise;\nuniform float noiseSize;\nuniform float scratch;\nuniform float scratchDensity;\nuniform float scratchWidth;\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\nuniform float seed;\n\nconst float SQRT_2 = 1.414213;\nconst vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);\n\nfloat rand(vec2 co) {\n	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvec3 Overlay(vec3 src, vec3 dst)\n{\n	// if (dst <= 0.5) then: 2 * src * dst\n	// if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)\n	return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),\n				(dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),\n				(dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));\n}\n\n\nvoid main()\n{\n	gl_FragColor = texture2D(uSampler, vTextureCoord);\n	vec3 color = gl_FragColor.rgb;\n\n	if (sepia > 0.0)\n	{\n		float gray = (color.x + color.y + color.z) / 3.0;\n		vec3 grayscale = vec3(gray);\n\n		color = Overlay(SEPIA_RGB, grayscale);\n\n		color = grayscale + sepia * (color - grayscale);\n	}\n\n	vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n	if (vignetting > 0.0)\n	{\n		float outter = SQRT_2 - vignetting * SQRT_2;\n		vec2 dir = vec2(vec2(0.5, 0.5) - coord);\n		dir.y *= dimensions.y / dimensions.x;\n		float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n		color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n	}\n\n	if (scratchDensity > seed && scratch != 0.0)\n	{\n		float phase = seed * 256.0;\n		float s = mod(floor(phase), 2.0);\n		float dist = 1.0 / scratchDensity;\n		float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));\n		if (d < seed * 0.6 + 0.4)\n		{\n			highp float period = scratchDensity * 10.0;\n\n			float xx = coord.x * period + phase;\n			float aa = abs(mod(xx, 0.5) * 4.0);\n			float bb = mod(floor(xx / 0.5), 2.0);\n			float yy = (1.0 - bb) * aa + bb * (2.0 - aa);\n\n			float kk = 2.0 * period;\n			float dw = scratchWidth / dimensions.x * (0.75 + seed);\n			float dh = dw * kk;\n\n			float tine = (yy - (2.0 - dh));\n\n			if (tine > 0.0) {\n				float _sign = sign(scratch);\n\n				tine = s * tine / period + scratch + 0.1;\n				tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);\n\n				color.rgb *= tine;\n			}\n		}\n	}\n\n	if (noise > 0.0 && noiseSize > 0.0)\n	{\n		vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n		pixelCoord.x = floor(pixelCoord.x / noiseSize);\n		pixelCoord.y = floor(pixelCoord.y / noiseSize);\n		// vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);\n		// float _noise = snoise(d) * 0.5;\n		float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n		color += _noise * noise;\n	}\n\n	gl_FragColor.rgb = color;\n}\n") || this; return o.seed = 0, o.uniforms.dimensions = new Float32Array(2), "number" == typeof t ? (o.seed = t, t = void 0) : o.seed = r, Object.assign(o, n.defaults, t), o } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o, i; this.uniforms.dimensions[0] = null === (o = n.filterFrame) || void 0 === o ? void 0 : o.width, this.uniforms.dimensions[1] = null === (i = n.filterFrame) || void 0 === i ? void 0 : i.height, this.uniforms.seed = this.seed, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "sepia", { get: function () { return this.uniforms.sepia }, set: function (e) { this.uniforms.sepia = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "noise", { get: function () { return this.uniforms.noise }, set: function (e) { this.uniforms.noise = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "noiseSize", { get: function () { return this.uniforms.noiseSize }, set: function (e) { this.uniforms.noiseSize = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "scratch", { get: function () { return this.uniforms.scratch }, set: function (e) { this.uniforms.scratch = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "scratchDensity", { get: function () { return this.uniforms.scratchDensity }, set: function (e) { this.uniforms.scratchDensity = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "scratchWidth", { get: function () { return this.uniforms.scratchWidth }, set: function (e) { this.uniforms.scratchWidth = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignetting", { get: function () { return this.uniforms.vignetting }, set: function (e) { this.uniforms.vignetting = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignettingAlpha", { get: function () { return this.uniforms.vignettingAlpha }, set: function (e) { this.uniforms.vignettingAlpha = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "vignettingBlur", { get: function () { return this.uniforms.vignettingBlur }, set: function (e) { this.uniforms.vignettingBlur = e }, enumerable: !1, configurable: !0 }), n.defaults = { sepia: .3, noise: .3, noiseSize: 1, scratch: .5, scratchDensity: .3, scratchWidth: 1, vignetting: .3, vignettingAlpha: 1, vignettingBlur: .3 }, n }(n.Filter), E = function (e) { function n(t, r, o) { void 0 === t && (t = 1), void 0 === r && (r = 0), void 0 === o && (o = .1); var i = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 thickness;\nuniform vec4 outlineColor;\nuniform vec4 filterClamp;\n\nconst float DOUBLE_PI = 3.14159265358979323846264 * 2.;\n\nvoid main(void) {\n	vec4 ownColor = texture2D(uSampler, vTextureCoord);\n	vec4 curColor;\n	float maxAlpha = 0.;\n	vec2 displaced;\n	for (float angle = 0.; angle <= DOUBLE_PI; angle += ${angleStep}) {\n		displaced.x = vTextureCoord.x + thickness.x * cos(angle);\n		displaced.y = vTextureCoord.y + thickness.y * sin(angle);\n		curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n		maxAlpha = max(maxAlpha, curColor.a);\n	}\n	float resultAlpha = max(maxAlpha, ownColor.a);\n	gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\n}\n".replace(/\$\{angleStep\}/, n.getAngleStep(o))) || this; return i._thickness = 1, i.uniforms.thickness = new Float32Array([0, 0]), i.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]), Object.assign(i, { thickness: t, color: r, quality: o }), i } return u(n, e), n.getAngleStep = function (e) { var t = Math.max(e * n.MAX_SAMPLES, n.MIN_SAMPLES); return (2 * Math.PI / t).toFixed(7) }, n.prototype.apply = function (e, n, t, r) { this.uniforms.thickness[0] = this._thickness / n._frame.width, this.uniforms.thickness[1] = this._thickness / n._frame.height, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "color", { get: function () { return o.rgb2hex(this.uniforms.outlineColor) }, set: function (e) { o.hex2rgb(e, this.uniforms.outlineColor) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "thickness", { get: function () { return this._thickness }, set: function (e) { this._thickness = e, this.padding = e }, enumerable: !1, configurable: !0 }), n.MIN_SAMPLES = 1, n.MAX_SAMPLES = 100, n }(n.Filter), I = function (e) { function n(n) { void 0 === n && (n = 10); var t = e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec2 size;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n	coord *= filterArea.xy;\n	coord += filterArea.zw;\n\n	return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n	coord -= filterArea.zw;\n	coord /= filterArea.xy;\n\n	return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n\treturn floor( coord / size ) * size;\n}\n\nvoid main(void)\n{\n	vec2 coord = mapCoord(vTextureCoord);\n\n	coord = pixelate(coord, size);\n\n	coord = unmapCoord(coord);\n\n	gl_FragColor = texture2D(uSampler, coord);\n}\n") || this; return t.size = n, t } return u(n, e), Object.defineProperty(n.prototype, "size", { get: function () { return this.uniforms.size }, set: function (e) { "number" == typeof e && (e = [e, e]), this.uniforms.size = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), k = function (e) { function n(n, t, r, o) { void 0 === n && (n = 0), void 0 === t && (t = [0, 0]), void 0 === r && (r = 5), void 0 === o && (o = -1); var i = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float uRadian;\nuniform vec2 uCenter;\nuniform float uRadius;\nuniform int uKernelSize;\n\nconst int MAX_KERNEL_SIZE = 2048;\n\nvoid main(void)\n{\n	vec4 color = texture2D(uSampler, vTextureCoord);\n\n	if (uKernelSize == 0)\n	{\n		gl_FragColor = color;\n		return;\n	}\n\n	float aspect = filterArea.y / filterArea.x;\n	vec2 center = uCenter.xy / filterArea.xy;\n	float gradient = uRadius / filterArea.x * 0.3;\n	float radius = uRadius / filterArea.x - gradient * 0.5;\n	int k = uKernelSize - 1;\n\n	vec2 coord = vTextureCoord;\n	vec2 dir = vec2(center - coord);\n	float dist = length(vec2(dir.x, dir.y * aspect));\n\n	float radianStep = uRadian;\n	if (radius >= 0.0 && dist > radius) {\n		float delta = dist - radius;\n		float gap = gradient;\n		float scale = 1.0 - abs(delta / gap);\n		if (scale <= 0.0) {\n			gl_FragColor = color;\n			return;\n		}\n		radianStep *= scale;\n	}\n	radianStep /= float(k);\n\n	float s = sin(radianStep);\n	float c = cos(radianStep);\n	mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));\n\n	for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {\n		if (i == k) {\n			break;\n		}\n\n		coord -= center;\n		coord.y *= aspect;\n		coord = rotationMatrix * coord;\n		coord.y /= aspect;\n		coord += center;\n\n		vec4 sample = texture2D(uSampler, coord);\n\n		// switch to pre-multiplied alpha to correctly blur transparent images\n		// sample.rgb *= sample.a;\n\n		color += sample;\n	}\n\n	gl_FragColor = color / float(uKernelSize);\n}\n") || this; return i._angle = 0, i.angle = n, i.center = t, i.kernelSize = r, i.radius = o, i } return u(n, e), n.prototype.apply = function (e, n, t, r) { this.uniforms.uKernelSize = 0 !== this._angle ? this.kernelSize : 0, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "angle", { get: function () { return this._angle }, set: function (e) { this._angle = e, this.uniforms.uRadian = e * Math.PI / 180 }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "center", { get: function () { return this.uniforms.uCenter }, set: function (e) { this.uniforms.uCenter = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "radius", { get: function () { return this.uniforms.uRadius }, set: function (e) { (e < 0 || e === 1 / 0) && (e = -1), this.uniforms.uRadius = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), L = function (e) { function n(t) { var r = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nuniform bool mirror;\nuniform float boundary;\nuniform vec2 amplitude;\nuniform vec2 waveLength;\nuniform vec2 alpha;\nuniform float time;\n\nfloat rand(vec2 co) {\n	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n	vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n	vec2 coord = pixelCoord / dimensions;\n\n	if (coord.y < boundary) {\n		gl_FragColor = texture2D(uSampler, vTextureCoord);\n		return;\n	}\n\n	float k = (coord.y - boundary) / (1. - boundary + 0.0001);\n	float areaY = boundary * dimensions.y / filterArea.y;\n	float v = areaY + areaY - vTextureCoord.y;\n	float y = mirror ? v : vTextureCoord.y;\n\n	float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;\n	float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;\n	float _alpha = (alpha.y - alpha.x) * k + alpha.x;\n\n	float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;\n	x = clamp(x, filterClamp.x, filterClamp.z);\n\n	vec4 color = texture2D(uSampler, vec2(x, y));\n\n	gl_FragColor = color * _alpha;\n}\n") || this; return r.time = 0, r.uniforms.amplitude = new Float32Array(2), r.uniforms.waveLength = new Float32Array(2), r.uniforms.alpha = new Float32Array(2), r.uniforms.dimensions = new Float32Array(2), Object.assign(r, n.defaults, t), r } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o, i; this.uniforms.dimensions[0] = null === (o = n.filterFrame) || void 0 === o ? void 0 : o.width, this.uniforms.dimensions[1] = null === (i = n.filterFrame) || void 0 === i ? void 0 : i.height, this.uniforms.time = this.time, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "mirror", { get: function () { return this.uniforms.mirror }, set: function (e) { this.uniforms.mirror = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "boundary", { get: function () { return this.uniforms.boundary }, set: function (e) { this.uniforms.boundary = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "amplitude", { get: function () { return this.uniforms.amplitude }, set: function (e) { this.uniforms.amplitude[0] = e[0], this.uniforms.amplitude[1] = e[1] }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "waveLength", { get: function () { return this.uniforms.waveLength }, set: function (e) { this.uniforms.waveLength[0] = e[0], this.uniforms.waveLength[1] = e[1] }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "alpha", { get: function () { return this.uniforms.alpha }, set: function (e) { this.uniforms.alpha[0] = e[0], this.uniforms.alpha[1] = e[1] }, enumerable: !1, configurable: !0 }), n.defaults = { mirror: !0, boundary: .5, amplitude: [0, 20], waveLength: [30, 100], alpha: [1, 1], time: 0 }, n }(n.Filter), N = function (e) { function n(n, t, r) { void 0 === n && (n = [-10, 0]), void 0 === t && (t = [0, 10]), void 0 === r && (r = [0, 0]); var o = e.call(this, c, "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n") || this; return o.red = n, o.green = t, o.blue = r, o } return u(n, e), Object.defineProperty(n.prototype, "red", { get: function () { return this.uniforms.red }, set: function (e) { this.uniforms.red = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "green", { get: function () { return this.uniforms.green }, set: function (e) { this.uniforms.green = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "blue", { get: function () { return this.uniforms.blue }, set: function (e) { this.uniforms.blue = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), X = function (e) { function n(t, r, o) { void 0 === t && (t = [0, 0]), void 0 === o && (o = 0); var i = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\n\nuniform vec2 center;\n\nuniform float amplitude;\nuniform float wavelength;\n// uniform float power;\nuniform float brightness;\nuniform float speed;\nuniform float radius;\n\nuniform float time;\n\nconst float PI = 3.14159;\n\nvoid main()\n{\n	float halfWavelength = wavelength * 0.5 / filterArea.x;\n	float maxRadius = radius / filterArea.x;\n	float currentRadius = time * speed / filterArea.x;\n\n	float fade = 1.0;\n\n	if (maxRadius > 0.0) {\n		if (currentRadius > maxRadius) {\n			gl_FragColor = texture2D(uSampler, vTextureCoord);\n			return;\n		}\n		fade = 1.0 - pow(currentRadius / maxRadius, 2.0);\n	}\n\n	vec2 dir = vec2(vTextureCoord - center / filterArea.xy);\n	dir.y *= filterArea.y / filterArea.x;\n	float dist = length(dir);\n\n	if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {\n		gl_FragColor = texture2D(uSampler, vTextureCoord);\n		return;\n	}\n\n	vec2 diffUV = normalize(dir);\n\n	float diff = (dist - currentRadius) / halfWavelength;\n\n	float p = 1.0 - pow(abs(diff), 2.0);\n\n	// float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );\n	float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );\n\n	vec2 offset = diffUV * powDiff / filterArea.xy;\n\n	// Do clamp :\n	vec2 coord = vTextureCoord + offset;\n	vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n	vec4 color = texture2D(uSampler, clampedCoord);\n	if (coord != clampedCoord) {\n		color *= max(0.0, 1.0 - length(coord - clampedCoord));\n	}\n\n	// No clamp :\n	// gl_FragColor = texture2D(uSampler, vTextureCoord + offset);\n\n	color.rgb *= 1.0 + (brightness - 1.0) * p * fade;\n\n	gl_FragColor = color;\n}\n") || this; return i.center = t, Object.assign(i, n.defaults, r), i.time = o, i } return u(n, e), n.prototype.apply = function (e, n, t, r) { this.uniforms.time = this.time, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "center", { get: function () { return this.uniforms.center }, set: function (e) { this.uniforms.center = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "amplitude", { get: function () { return this.uniforms.amplitude }, set: function (e) { this.uniforms.amplitude = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "wavelength", { get: function () { return this.uniforms.wavelength }, set: function (e) { this.uniforms.wavelength = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "brightness", { get: function () { return this.uniforms.brightness }, set: function (e) { this.uniforms.brightness = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "speed", { get: function () { return this.uniforms.speed }, set: function (e) { this.uniforms.speed = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "radius", { get: function () { return this.uniforms.radius }, set: function (e) { this.uniforms.radius = e }, enumerable: !1, configurable: !0 }), n.defaults = { amplitude: 30, wavelength: 160, brightness: 1, speed: 500, radius: -1 }, n }(n.Filter), B = function (e) { function n(n, t, r) { void 0 === t && (t = 0), void 0 === r && (r = 1); var o = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D uLightmap;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\nuniform vec4 ambientColor;\nvoid main() {\n	vec4 diffuseColor = texture2D(uSampler, vTextureCoord);\n	vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;\n	vec4 light = texture2D(uLightmap, lightCoord);\n	vec3 ambient = ambientColor.rgb * ambientColor.a;\n	vec3 intensity = ambient + light.rgb;\n	vec3 finalColor = diffuseColor.rgb * intensity;\n	gl_FragColor = vec4(finalColor, diffuseColor.a);\n}\n") || this; return o._color = 0, o.uniforms.dimensions = new Float32Array(2), o.uniforms.ambientColor = new Float32Array([0, 0, 0, r]), o.texture = n, o.color = t, o } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o, i; this.uniforms.dimensions[0] = null === (o = n.filterFrame) || void 0 === o ? void 0 : o.width, this.uniforms.dimensions[1] = null === (i = n.filterFrame) || void 0 === i ? void 0 : i.height, e.applyFilter(this, n, t, r) }, Object.defineProperty(n.prototype, "texture", { get: function () { return this.uniforms.uLightmap }, set: function (e) { this.uniforms.uLightmap = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "color", { get: function () { return this._color }, set: function (e) { var n = this.uniforms.ambientColor; "number" == typeof e ? (o.hex2rgb(e, n), this._color = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = e[3], this._color = o.rgb2hex(n)) }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "alpha", { get: function () { return this.uniforms.ambientColor[3] }, set: function (e) { this.uniforms.ambientColor[3] = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), G = function (e) { function n(n, r, o, i) { void 0 === n && (n = 100), void 0 === r && (r = 600); var l = e.call(this, c, "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n	vec4 color = vec4(0.0);\n	float total = 0.0;\n\n	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n	vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n	float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n	for (float t = -30.0; t <= 30.0; t++)\n	{\n		float percent = (t + offset - 0.5) / 30.0;\n		float weight = 1.0 - abs(percent);\n		vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n		sample.rgb *= sample.a;\n		color += sample * weight;\n		total += weight;\n	}\n\n	color /= total;\n	color.rgb /= color.a + 0.00001;\n\n	gl_FragColor = color;\n}\n") || this; return l.uniforms.blur = n, l.uniforms.gradientBlur = r, l.uniforms.start = o || new t.Point(0, window.innerHeight / 2), l.uniforms.end = i || new t.Point(600, window.innerHeight / 2), l.uniforms.delta = new t.Point(30, 30), l.uniforms.texSize = new t.Point(window.innerWidth, window.innerHeight), l.updateDelta(), l } return u(n, e), n.prototype.updateDelta = function () { this.uniforms.delta.x = 0, this.uniforms.delta.y = 0 }, Object.defineProperty(n.prototype, "blur", { get: function () { return this.uniforms.blur }, set: function (e) { this.uniforms.blur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "gradientBlur", { get: function () { return this.uniforms.gradientBlur }, set: function (e) { this.uniforms.gradientBlur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "start", { get: function () { return this.uniforms.start }, set: function (e) { this.uniforms.start = e, this.updateDelta() }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "end", { get: function () { return this.uniforms.end }, set: function (e) { this.uniforms.end = e, this.updateDelta() }, enumerable: !1, configurable: !0 }), n }(n.Filter), K = function (e) { function n() { return null !== e && e.apply(this, arguments) || this } return u(n, e), n.prototype.updateDelta = function () { var e = this.uniforms.end.x - this.uniforms.start.x, n = this.uniforms.end.y - this.uniforms.start.y, t = Math.sqrt(e * e + n * n); this.uniforms.delta.x = e / t, this.uniforms.delta.y = n / t }, n }(G), q = function (e) { function n() { return null !== e && e.apply(this, arguments) || this } return u(n, e), n.prototype.updateDelta = function () { var e = this.uniforms.end.x - this.uniforms.start.x, n = this.uniforms.end.y - this.uniforms.start.y, t = Math.sqrt(e * e + n * n); this.uniforms.delta.x = -n / t, this.uniforms.delta.y = e / t }, n }(G), W = function (e) { function n(n, t, r, o) { void 0 === n && (n = 100), void 0 === t && (t = 600); var i = e.call(this) || this; return i.tiltShiftXFilter = new K(n, t, r, o), i.tiltShiftYFilter = new q(n, t, r, o), i } return u(n, e), n.prototype.apply = function (e, n, t, r) { var o = e.getFilterTexture(); this.tiltShiftXFilter.apply(e, n, o, 1), this.tiltShiftYFilter.apply(e, o, t, r), e.returnFilterTexture(o) }, Object.defineProperty(n.prototype, "blur", { get: function () { return this.tiltShiftXFilter.blur }, set: function (e) { this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "gradientBlur", { get: function () { return this.tiltShiftXFilter.gradientBlur }, set: function (e) { this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "start", { get: function () { return this.tiltShiftXFilter.start }, set: function (e) { this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "end", { get: function () { return this.tiltShiftXFilter.end }, set: function (e) { this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = e }, enumerable: !1, configurable: !0 }), n }(n.Filter), Y = function (e) { function n(t) { var r = e.call(this, c, "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n	coord *= filterArea.xy;\n	coord += filterArea.zw;\n\n	return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n	coord -= filterArea.zw;\n	coord /= filterArea.xy;\n\n	return coord;\n}\n\nvec2 twist(vec2 coord)\n{\n	coord -= offset;\n\n	float dist = length(coord);\n\n	if (dist < radius)\n	{\n		float ratioDist = (radius - dist) / radius;\n		float angleMod = ratioDist * ratioDist * angle;\n		float s = sin(angleMod);\n		float c = cos(angleMod);\n		coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n	}\n\n	coord += offset;\n\n	return coord;\n}\n\nvoid main(void)\n{\n\n	vec2 coord = mapCoord(vTextureCoord);\n\n	coord = twist(coord);\n\n	coord = unmapCoord(coord);\n\n	gl_FragColor = texture2D(uSampler, coord );\n\n}\n") || this; return Object.assign(r, n.defaults, t), r } return u(n, e), Object.defineProperty(n.prototype, "offset", { get: function () { return this.uniforms.offset }, set: function (e) { this.uniforms.offset = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "radius", { get: function () { return this.uniforms.radius }, set: function (e) { this.uniforms.radius = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "angle", { get: function () { return this.uniforms.angle }, set: function (e) { this.uniforms.angle = e }, enumerable: !1, configurable: !0 }), n.defaults = { radius: 200, angle: 4, padding: 20, offset: new t.Point }, n }(n.Filter), Z = function (e) { function n(t) { var r, o = Object.assign(n.defaults, t), i = o.maxKernelSize, l = function (e, n) { var t = {}; for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && n.indexOf(r) < 0 && (t[r] = e[r]); if (null != e && "function" == typeof Object.getOwnPropertySymbols) { var o = 0; for (r = Object.getOwnPropertySymbols(e); o < r.length; o++)n.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (t[r[o]] = e[r[o]]) } return t }(o, ["maxKernelSize"]); return r = e.call(this, c, "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uCenter;\nuniform float uStrength;\nuniform float uInnerRadius;\nuniform float uRadius;\n\nconst float MAX_KERNEL_SIZE = ${maxKernelSize};\n\n// author: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/\nhighp float rand(vec2 co, float seed) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);\n	return fract(sin(sn) * c + seed);\n}\n\nvoid main() {\n\n	float minGradient = uInnerRadius * 0.3;\n	float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;\n\n	float gradient = uRadius * 0.3;\n	float radius = (uRadius - gradient * 0.5) / filterArea.x;\n\n	float countLimit = MAX_KERNEL_SIZE;\n\n	vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);\n	float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));\n\n	float strength = uStrength;\n\n	float delta = 0.0;\n	float gap;\n	if (dist < innerRadius) {\n		delta = innerRadius - dist;\n		gap = minGradient;\n	} else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity\n		delta = dist - radius;\n		gap = gradient;\n	}\n\n	if (delta > 0.0) {\n		float normalCount = gap / filterArea.x;\n		delta = (normalCount - delta) / normalCount;\n		countLimit *= delta;\n		strength *= delta;\n		if (countLimit < 1.0)\n		{\n			gl_FragColor = texture2D(uSampler, vTextureCoord);\n			return;\n		}\n	}\n\n	// randomize the lookup values to hide the fixed number of samples\n	float offset = rand(vTextureCoord, 0.0);\n\n	float total = 0.0;\n	vec4 color = vec4(0.0);\n\n	dir *= strength;\n\n	for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {\n		float percent = (t + offset) / MAX_KERNEL_SIZE;\n		float weight = 4.0 * (percent - percent * percent);\n		vec2 p = vTextureCoord + dir * percent;\n		vec4 sample = texture2D(uSampler, p);\n\n		// switch to pre-multiplied alpha to correctly blur transparent images\n		// sample.rgb *= sample.a;\n\n		color += sample * weight;\n		total += weight;\n\n		if (t > countLimit){\n			break;\n		}\n	}\n\n	color /= total;\n	// switch back from pre-multiplied alpha\n	// color.rgb /= color.a + 0.00001;\n\n	gl_FragColor = color;\n}\n".replace("${maxKernelSize}", i.toFixed(1))) || this, Object.assign(r, l), r } return u(n, e), Object.defineProperty(n.prototype, "center", { get: function () { return this.uniforms.uCenter }, set: function (e) { this.uniforms.uCenter = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "strength", { get: function () { return this.uniforms.uStrength }, set: function (e) { this.uniforms.uStrength = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "innerRadius", { get: function () { return this.uniforms.uInnerRadius }, set: function (e) { this.uniforms.uInnerRadius = e }, enumerable: !1, configurable: !0 }), Object.defineProperty(n.prototype, "radius", { get: function () { return this.uniforms.uRadius }, set: function (e) { (e < 0 || e === 1 / 0) && (e = -1), this.uniforms.uRadius = e }, enumerable: !1, configurable: !0 }), n.defaults = { strength: .1, center: [0, 0], innerRadius: 0, radius: -1, maxKernelSize: 32 }, n }(n.Filter); return e.AdjustmentFilter = m, e.AdvancedBloomFilter = h, e.AsciiFilter = g, e.BevelFilter = v, e.BloomFilter = y, e.BulgePinchFilter = b, e.CRTFilter = z, e.ColorMapFilter = x, e.ColorOverlayFilter = _, e.ColorReplaceFilter = C, e.ConvolutionFilter = S, e.CrossHatchFilter = F, e.DotFilter = O, e.DropShadowFilter = P, e.EmbossFilter = A, e.GlitchFilter = T, e.GlowFilter = w, e.GodrayFilter = D, e.KawaseBlurFilter = d, e.MotionBlurFilter = j, e.MultiColorReplaceFilter = M, e.OldFilmFilter = R, e.OutlineFilter = E, e.PixelateFilter = I, e.RGBSplitFilter = N, e.RadialBlurFilter = k, e.ReflectionFilter = L, e.ShockwaveFilter = X, e.SimpleLightmapFilter = B, e.TiltShiftAxisFilter = G, e.TiltShiftFilter = W, e.TiltShiftXFilter = K, e.TiltShiftYFilter = q, e.TwistFilter = Y, e.ZoomBlurFilter = Z, Object.defineProperty(e, "__esModule", { value: !0 }), e }({}, PIXI, PIXI, PIXI, PIXI.utils, PIXI, PIXI.filters, PIXI.filters); Object.assign(PIXI.filters, __filters);
	})();
	if (importFilter && !isMZ) (() => {

		/*!
		 * pixi-filters - v2.7.1
		 * Compiled Tue, 12 Mar 2019 19:28:25 UTC
		 *
		 * pixi-filters is licensed under the MIT License.
		 * http://www.opensource.org/licenses/mit-license
		 */
		var __filters = function (e, t) { "use strict"; var n = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}", r = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float gamma;\nuniform float contrast;\nuniform float saturation;\nuniform float brightness;\nuniform float red;\nuniform float green;\nuniform float blue;\nuniform float alpha;\n\nvoid main(void)\n{\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    if (c.a > 0.0) {\n        c.rgb /= c.a;\n\n        vec3 rgb = pow(c.rgb, vec3(1. / gamma));\n        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);\n        rgb.r *= red;\n        rgb.g *= green;\n        rgb.b *= blue;\n        c.rgb = rgb * brightness;\n\n        c.rgb *= c.a;\n    }\n\n    gl_FragColor = c * alpha;\n}\n", o = function (e) { function t(t) { e.call(this, n, r), Object.assign(this, { gamma: 1, saturation: 1, contrast: 1, brightness: 1, red: 1, green: 1, blue: 1, alpha: 1 }, t) } return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t.prototype.apply = function (e, t, n, r) { this.uniforms.gamma = Math.max(this.gamma, 1e-4), this.uniforms.saturation = this.saturation, this.uniforms.contrast = this.contrast, this.uniforms.brightness = this.brightness, this.uniforms.red = this.red, this.uniforms.green = this.green, this.uniforms.blue = this.blue, this.uniforms.alpha = this.alpha, e.applyFilter(this, t, n, r) }, t }(t.Filter), i = n, l = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n\n    // Sample top left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample top right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample bottom right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Sample bottom left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Average\n    color *= 0.25;\n\n    gl_FragColor = color;\n}", s = "\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n\n    // Sample top left pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample top right pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample bottom right pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample bottom left pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Average\n    color *= 0.25;\n\n    gl_FragColor = color;\n}\n", a = function (e) { function n(n, r, o) { void 0 === n && (n = 4), void 0 === r && (r = 3), void 0 === o && (o = !1), e.call(this, i, o ? s : l), this.uniforms.uOffset = new Float32Array(2), this._pixelSize = new t.Point, this.pixelSize = 1, this._clamp = o, this._kernels = null, Array.isArray(n) ? this.kernels = n : (this._blur = n, this.quality = r) } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { kernels: { configurable: !0 }, clamp: { configurable: !0 }, pixelSize: { configurable: !0 }, quality: { configurable: !0 }, blur: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { var o, i = this.pixelSize.x / t.size.width, l = this.pixelSize.y / t.size.height; if (1 === this._quality || 0 === this._blur) o = this._kernels[0] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, t, n, r); else { for (var s, a = e.getRenderTarget(!0), u = t, c = a, f = this._quality - 1, h = 0; h < f; h++)o = this._kernels[h] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, u, c, !0), s = u, u = c, c = s; o = this._kernels[f] + .5, this.uniforms.uOffset[0] = o * i, this.uniforms.uOffset[1] = o * l, e.applyFilter(this, u, n, r), e.returnRenderTarget(a) } }, n.prototype._generateKernels = function () { var e = this._blur, t = this._quality, n = [e]; if (e > 0) for (var r = e, o = e / t, i = 1; i < t; i++)r -= o, n.push(r); this._kernels = n }, r.kernels.get = function () { return this._kernels }, r.kernels.set = function (e) { Array.isArray(e) && e.length > 0 ? (this._kernels = e, this._quality = e.length, this._blur = Math.max.apply(Math, e)) : (this._kernels = [0], this._quality = 1) }, r.clamp.get = function () { return this._clamp }, r.pixelSize.set = function (e) { "number" == typeof e ? (this._pixelSize.x = e, this._pixelSize.y = e) : Array.isArray(e) ? (this._pixelSize.x = e[0], this._pixelSize.y = e[1]) : e instanceof t.Point ? (this._pixelSize.x = e.x, this._pixelSize.y = e.y) : (this._pixelSize.x = 1, this._pixelSize.y = 1) }, r.pixelSize.get = function () { return this._pixelSize }, r.quality.get = function () { return this._quality }, r.quality.set = function (e) { this._quality = Math.max(1, Math.round(e)), this._generateKernels() }, r.blur.get = function () { return this._blur }, r.blur.set = function (e) { this._blur = e, this._generateKernels() }, Object.defineProperties(n.prototype, r), n }(t.Filter), u = n, c = "\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform float threshold;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    // A simple & fast algorithm for getting brightness.\n    // It's inaccuracy , but good enought for this feature.\n    float _max = max(max(color.r, color.g), color.b);\n    float _min = min(min(color.r, color.g), color.b);\n    float brightness = (_max + _min) * 0.5;\n\n    if(brightness > threshold) {\n        gl_FragColor = color;\n    } else {\n        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n    }\n}\n", f = function (e) { function t(t) { void 0 === t && (t = .5), e.call(this, u, c), this.threshold = t } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { threshold: { configurable: !0 } }; return n.threshold.get = function () { return this.uniforms.threshold }, n.threshold.set = function (e) { this.uniforms.threshold = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), h = "uniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D bloomTexture;\nuniform float bloomScale;\nuniform float brightness;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    color.rgb *= brightness;\n    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);\n    bloomColor.rgb *= bloomScale;\n    gl_FragColor = color + bloomColor;\n}\n", p = function (e) { function n(n) { e.call(this, u, h), "number" == typeof n && (n = { threshold: n }), n = Object.assign({ threshold: .5, bloomScale: 1, brightness: 1, kernels: null, blur: 8, quality: 4, pixelSize: 1, resolution: t.settings.RESOLUTION }, n), this.bloomScale = n.bloomScale, this.brightness = n.brightness; var r = n.kernels, o = n.blur, i = n.quality, l = n.pixelSize, s = n.resolution; this._extractFilter = new f(n.threshold), this._extractFilter.resolution = s, this._blurFilter = r ? new a(r) : new a(o, i), this.pixelSize = l, this.resolution = s } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { resolution: { configurable: !0 }, threshold: { configurable: !0 }, kernels: { configurable: !0 }, blur: { configurable: !0 }, quality: { configurable: !0 }, pixelSize: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r, o) { var i = e.getRenderTarget(!0); this._extractFilter.apply(e, t, i, !0, o); var l = e.getRenderTarget(!0); this._blurFilter.apply(e, i, l, !0, o), this.uniforms.bloomScale = this.bloomScale, this.uniforms.brightness = this.brightness, this.uniforms.bloomTexture = l, e.applyFilter(this, t, n, r), e.returnRenderTarget(l), e.returnRenderTarget(i) }, r.resolution.get = function () { return this._resolution }, r.resolution.set = function (e) { this._resolution = e, this._extractFilter && (this._extractFilter.resolution = e), this._blurFilter && (this._blurFilter.resolution = e) }, r.threshold.get = function () { return this._extractFilter.threshold }, r.threshold.set = function (e) { this._extractFilter.threshold = e }, r.kernels.get = function () { return this._blurFilter.kernels }, r.kernels.set = function (e) { this._blurFilter.kernels = e }, r.blur.get = function () { return this._blurFilter.blur }, r.blur.set = function (e) { this._blurFilter.blur = e }, r.quality.get = function () { return this._blurFilter.quality }, r.quality.set = function (e) { this._blurFilter.quality = e }, r.pixelSize.get = function () { return this._blurFilter.pixelSize }, r.pixelSize.set = function (e) { this._blurFilter.pixelSize = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), d = n, m = "varying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n    return floor( coord / size ) * size;\n}\n\nvec2 getMod(vec2 coord, vec2 size)\n{\n    return mod( coord , size) / size;\n}\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n\n    if (clamp(p.x, 0.0, 4.0) == p.x)\n    {\n        if (clamp(p.y, 0.0, 4.0) == p.y)\n        {\n            if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n        }\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    // get the rounded color..\n    vec2 pixCoord = pixelate(coord, vec2(pixelSize));\n    pixCoord = unmapCoord(pixCoord);\n\n    vec4 color = texture2D(uSampler, pixCoord);\n\n    // determine the character to use\n    float gray = (color.r + color.g + color.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    // get the mod..\n    vec2 modd = getMod(coord, vec2(pixelSize));\n\n    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);\n\n}\n", g = function (e) { function t(t) { void 0 === t && (t = 8), e.call(this, d, m), this.size = t } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { size: { configurable: !0 } }; return n.size.get = function () { return this.uniforms.pixelSize }, n.size.set = function (e) { this.uniforms.pixelSize = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), v = n, x = "precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float transformX;\nuniform float transformY;\nuniform vec3 lightColor;\nuniform float lightAlpha;\nuniform vec3 shadowColor;\nuniform float shadowAlpha;\n\nvoid main(void) {\n    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float light = texture2D(uSampler, vTextureCoord - transform).a;\n    float shadow = texture2D(uSampler, vTextureCoord + transform).a;\n\n    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));\n    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));\n    gl_FragColor = vec4(color.rgb * color.a, color.a);\n}\n", y = function (e) { function n(t) { void 0 === t && (t = {}), e.call(this, v, x), this.uniforms.lightColor = new Float32Array(3), this.uniforms.shadowColor = new Float32Array(3), t = Object.assign({ rotation: 45, thickness: 2, lightColor: 16777215, lightAlpha: .7, shadowColor: 0, shadowAlpha: .7 }, t), this.rotation = t.rotation, this.thickness = t.thickness, this.lightColor = t.lightColor, this.lightAlpha = t.lightAlpha, this.shadowColor = t.shadowColor, this.shadowAlpha = t.shadowAlpha } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { rotation: { configurable: !0 }, thickness: { configurable: !0 }, lightColor: { configurable: !0 }, lightAlpha: { configurable: !0 }, shadowColor: { configurable: !0 }, shadowAlpha: { configurable: !0 } }; return n.prototype._updateTransform = function () { this.uniforms.transformX = this._thickness * Math.cos(this._angle), this.uniforms.transformY = this._thickness * Math.sin(this._angle) }, r.rotation.get = function () { return this._angle / t.DEG_TO_RAD }, r.rotation.set = function (e) { this._angle = e * t.DEG_TO_RAD, this._updateTransform() }, r.thickness.get = function () { return this._thickness }, r.thickness.set = function (e) { this._thickness = e, this._updateTransform() }, r.lightColor.get = function () { return t.utils.rgb2hex(this.uniforms.lightColor) }, r.lightColor.set = function (e) { t.utils.hex2rgb(e, this.uniforms.lightColor) }, r.lightAlpha.get = function () { return this.uniforms.lightAlpha }, r.lightAlpha.set = function (e) { this.uniforms.lightAlpha = e }, r.shadowColor.get = function () { return t.utils.rgb2hex(this.uniforms.shadowColor) }, r.shadowColor.set = function (e) { t.utils.hex2rgb(e, this.uniforms.shadowColor) }, r.shadowAlpha.get = function () { return this.uniforms.shadowAlpha }, r.shadowAlpha.set = function (e) { this.uniforms.shadowAlpha = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), b = t.filters, _ = b.BlurXFilter, C = b.BlurYFilter, S = b.AlphaFilter, F = function (e) { function n(n, r, o, i) { var l, s; void 0 === n && (n = 2), void 0 === r && (r = 4), void 0 === o && (o = t.settings.RESOLUTION), void 0 === i && (i = 5), e.call(this), "number" == typeof n ? (l = n, s = n) : n instanceof t.Point ? (l = n.x, s = n.y) : Array.isArray(n) && (l = n[0], s = n[1]), this.blurXFilter = new _(l, r, o, i), this.blurYFilter = new C(s, r, o, i), this.blurYFilter.blendMode = t.BLEND_MODES.SCREEN, this.defaultFilter = new S } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { blur: { configurable: !0 }, blurX: { configurable: !0 }, blurY: { configurable: !0 } }; return n.prototype.apply = function (e, t, n) { var r = e.getRenderTarget(!0); this.defaultFilter.apply(e, t, n), this.blurXFilter.apply(e, t, r), this.blurYFilter.apply(e, r, n), e.returnRenderTarget(r) }, r.blur.get = function () { return this.blurXFilter.blur }, r.blur.set = function (e) { this.blurXFilter.blur = this.blurYFilter.blur = e }, r.blurX.get = function () { return this.blurXFilter.blur }, r.blurX.set = function (e) { this.blurXFilter.blur = e }, r.blurY.get = function () { return this.blurYFilter.blur }, r.blurY.set = function (e) { this.blurYFilter.blur = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), z = n, A = "uniform float radius;\nuniform float strength;\nuniform vec2 center;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nvoid main()\n{\n    vec2 coord = vTextureCoord * filterArea.xy;\n    coord -= center * dimensions.xy;\n    float distance = length(coord);\n    if (distance < radius) {\n        float percent = distance / radius;\n        if (strength > 0.0) {\n            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\n        } else {\n            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\n        }\n    }\n    coord += center * dimensions.xy;\n    coord /= filterArea.xy;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    vec4 color = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        color *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    gl_FragColor = color;\n}\n", w = function (e) { function t(t, n, r) { e.call(this, z, A), this.uniforms.dimensions = new Float32Array(2), this.center = t || [.5, .5], this.radius = "number" == typeof n ? n : 100, this.strength = "number" == typeof r ? r : 1 } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { radius: { configurable: !0 }, strength: { configurable: !0 }, center: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.dimensions[0] = t.sourceFrame.width, this.uniforms.dimensions[1] = t.sourceFrame.height, e.applyFilter(this, t, n, r) }, n.radius.get = function () { return this.uniforms.radius }, n.radius.set = function (e) { this.uniforms.radius = e }, n.strength.get = function () { return this.uniforms.strength }, n.strength.set = function (e) { this.uniforms.strength = e }, n.center.get = function () { return this.uniforms.center }, n.center.set = function (e) { this.uniforms.center = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), T = n, D = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D colorMap;\nuniform float _mix;\nuniform float _size;\nuniform float _sliceSize;\nuniform float _slicePixelSize;\nuniform float _sliceInnerSize;\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord.xy);\n\n    vec4 adjusted;\n    if (color.a > 0.0) {\n        color.rgb /= color.a;\n        float innerWidth = _size - 1.0;\n        float zSlice0 = min(floor(color.b * innerWidth), innerWidth);\n        float zSlice1 = min(zSlice0 + 1.0, innerWidth);\n        float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;\n        float s0 = xOffset + (zSlice0 * _sliceSize);\n        float s1 = xOffset + (zSlice1 * _sliceSize);\n        float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);\n        vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));\n        vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));\n        float zOffset = fract(color.b * innerWidth);\n        adjusted = mix(slice0Color, slice1Color, zOffset);\n\n        color.rgb *= color.a;\n    }\n    gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);\n\n}", O = function (e) { function n(t, n, r) { void 0 === n && (n = !1), void 0 === r && (r = 1), e.call(this, T, D), this._size = 0, this._sliceSize = 0, this._slicePixelSize = 0, this._sliceInnerSize = 0, this._scaleMode = null, this._nearest = !1, this.nearest = n, this.mix = r, this.colorMap = t } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { colorSize: { configurable: !0 }, colorMap: { configurable: !0 }, nearest: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { this.uniforms._mix = this.mix, e.applyFilter(this, t, n, r) }, r.colorSize.get = function () { return this._size }, r.colorMap.get = function () { return this._colorMap }, r.colorMap.set = function (e) { e instanceof t.Texture || (e = t.Texture.from(e)), e && e.baseTexture && (e.baseTexture.scaleMode = this._scaleMode, e.baseTexture.mipmap = !1, this._size = e.height, this._sliceSize = 1 / this._size, this._slicePixelSize = this._sliceSize / this._size, this._sliceInnerSize = this._slicePixelSize * (this._size - 1), this.uniforms._size = this._size, this.uniforms._sliceSize = this._sliceSize, this.uniforms._slicePixelSize = this._slicePixelSize, this.uniforms._sliceInnerSize = this._sliceInnerSize, this.uniforms.colorMap = e), this._colorMap = e }, r.nearest.get = function () { return this._nearest }, r.nearest.set = function (e) { this._nearest = e, this._scaleMode = e ? t.SCALE_MODES.NEAREST : t.SCALE_MODES.LINEAR; var n = this._colorMap; n && n.baseTexture && (n.baseTexture._glTextures = {}, n.baseTexture.scaleMode = this._scaleMode, n.baseTexture.mipmap = !1, n._updateID++, n.baseTexture.emit("update", n.baseTexture)) }, n.prototype.updateColorMap = function () { var e = this._colorMap; e && e.baseTexture && (e._updateID++, e.baseTexture.emit("update", e.baseTexture), this.colorMap = e) }, n.prototype.destroy = function (t) { this._colorMap && this._colorMap.destroy(t), e.prototype.destroy.call(this) }, Object.defineProperties(n.prototype, r), n }(t.Filter), P = n, M = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec3 originalColor;\nuniform vec3 newColor;\nuniform float epsilon;\nvoid main(void) {\n    vec4 currentColor = texture2D(uSampler, vTextureCoord);\n    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));\n    float colorDistance = length(colorDiff);\n    float doReplace = step(colorDistance, epsilon);\n    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);\n}\n", R = function (e) { function n(t, n, r) { void 0 === t && (t = 16711680), void 0 === n && (n = 0), void 0 === r && (r = .4), e.call(this, P, M), this.uniforms.originalColor = new Float32Array(3), this.uniforms.newColor = new Float32Array(3), this.originalColor = t, this.newColor = n, this.epsilon = r } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { originalColor: { configurable: !0 }, newColor: { configurable: !0 }, epsilon: { configurable: !0 } }; return r.originalColor.set = function (e) { var n = this.uniforms.originalColor; "number" == typeof e ? (t.utils.hex2rgb(e, n), this._originalColor = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], this._originalColor = t.utils.rgb2hex(n)) }, r.originalColor.get = function () { return this._originalColor }, r.newColor.set = function (e) { var n = this.uniforms.newColor; "number" == typeof e ? (t.utils.hex2rgb(e, n), this._newColor = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], this._newColor = t.utils.rgb2hex(n)) }, r.newColor.get = function () { return this._newColor }, r.epsilon.set = function (e) { this.uniforms.epsilon = e }, r.epsilon.get = function () { return this.uniforms.epsilon }, Object.defineProperties(n.prototype, r), n }(t.Filter), j = n, L = "precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n", k = function (e) { function t(t, n, r) { void 0 === n && (n = 200), void 0 === r && (r = 200), e.call(this, j, L), this.uniforms.texelSize = new Float32Array(2), this.uniforms.matrix = new Float32Array(9), void 0 !== t && (this.matrix = t), this.width = n, this.height = r } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { matrix: { configurable: !0 }, width: { configurable: !0 }, height: { configurable: !0 } }; return n.matrix.get = function () { return this.uniforms.matrix }, n.matrix.set = function (e) { var t = this; e.forEach(function (e, n) { return t.uniforms.matrix[n] = e }) }, n.width.get = function () { return 1 / this.uniforms.texelSize[0] }, n.width.set = function (e) { this.uniforms.texelSize[0] = 1 / e }, n.height.get = function () { return 1 / this.uniforms.texelSize[1] }, n.height.set = function (e) { this.uniforms.texelSize[1] = 1 / e }, Object.defineProperties(t.prototype, n), t }(t.Filter), I = n, E = "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n", B = function (e) { function t() { e.call(this, I, E) } return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t }(t.Filter), X = n, q = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nconst float SQRT_2 = 1.414213;\n\nconst float light = 1.0;\n\nuniform float curvature;\nuniform float lineWidth;\nuniform float lineContrast;\nuniform bool verticalLine;\nuniform float noise;\nuniform float noiseSize;\n\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\n\nuniform float seed;\nuniform float time;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n    vec2 coord = pixelCoord / dimensions;\n\n    vec2 dir = vec2(coord - vec2(0.5, 0.5));\n\n    float _c = curvature > 0. ? curvature : 1.;\n    float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;\n    vec2 uv = dir * k;\n\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec3 rgb = gl_FragColor.rgb;\n\n\n    if (noise > 0.0 && noiseSize > 0.0)\n    {\n        pixelCoord.x = floor(pixelCoord.x / noiseSize);\n        pixelCoord.y = floor(pixelCoord.y / noiseSize);\n        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n        rgb += _noise * noise;\n    }\n\n    if (lineWidth > 0.0) {\n        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;\n        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;\n        rgb *= j;\n        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);\n        rgb *= 0.99 + ceil(segment) * 0.015;\n    }\n\n    if (vignetting > 0.0)\n    {\n        float outter = SQRT_2 - vignetting * SQRT_2;\n        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n    }\n\n    gl_FragColor.rgb = rgb;\n}\n", N = function (e) { function t(t) { e.call(this, X, q), this.uniforms.dimensions = new Float32Array(2), this.time = 0, this.seed = 0, Object.assign(this, { curvature: 1, lineWidth: 1, lineContrast: .25, verticalLine: !1, noise: 0, noiseSize: 1, seed: 0, vignetting: .3, vignettingAlpha: 1, vignettingBlur: .3, time: 0 }, t) } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { curvature: { configurable: !0 }, lineWidth: { configurable: !0 }, lineContrast: { configurable: !0 }, verticalLine: { configurable: !0 }, noise: { configurable: !0 }, noiseSize: { configurable: !0 }, vignetting: { configurable: !0 }, vignettingAlpha: { configurable: !0 }, vignettingBlur: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.dimensions[0] = t.sourceFrame.width, this.uniforms.dimensions[1] = t.sourceFrame.height, this.uniforms.seed = this.seed, this.uniforms.time = this.time, e.applyFilter(this, t, n, r) }, n.curvature.set = function (e) { this.uniforms.curvature = e }, n.curvature.get = function () { return this.uniforms.curvature }, n.lineWidth.set = function (e) { this.uniforms.lineWidth = e }, n.lineWidth.get = function () { return this.uniforms.lineWidth }, n.lineContrast.set = function (e) { this.uniforms.lineContrast = e }, n.lineContrast.get = function () { return this.uniforms.lineContrast }, n.verticalLine.set = function (e) { this.uniforms.verticalLine = e }, n.verticalLine.get = function () { return this.uniforms.verticalLine }, n.noise.set = function (e) { this.uniforms.noise = e }, n.noise.get = function () { return this.uniforms.noise }, n.noiseSize.set = function (e) { this.uniforms.noiseSize = e }, n.noiseSize.get = function () { return this.uniforms.noiseSize }, n.vignetting.set = function (e) { this.uniforms.vignetting = e }, n.vignetting.get = function () { return this.uniforms.vignetting }, n.vignettingAlpha.set = function (e) { this.uniforms.vignettingAlpha = e }, n.vignettingAlpha.get = function () { return this.uniforms.vignettingAlpha }, n.vignettingBlur.set = function (e) { this.uniforms.vignettingBlur = e }, n.vignettingBlur.get = function () { return this.uniforms.vignettingBlur }, Object.defineProperties(t.prototype, n), t }(t.Filter), W = n, G = "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 filterArea;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * filterArea.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n", K = function (e) { function t(t, n) { void 0 === t && (t = 1), void 0 === n && (n = 5), e.call(this, W, G), this.scale = t, this.angle = n } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { scale: { configurable: !0 }, angle: { configurable: !0 } }; return n.scale.get = function () { return this.uniforms.scale }, n.scale.set = function (e) { this.uniforms.scale = e }, n.angle.get = function () { return this.uniforms.angle }, n.angle.set = function (e) { this.uniforms.angle = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Y = n, Q = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform vec3 color;\nvoid main(void){\n    vec4 sample = texture2D(uSampler, vTextureCoord);\n\n    // Un-premultiply alpha before applying the color\n    if (sample.a > 0.0) {\n        sample.rgb /= sample.a;\n    }\n\n    // Premultiply alpha again\n    sample.rgb = color.rgb * sample.a;\n\n    // alpha user alpha\n    sample *= alpha;\n\n    gl_FragColor = sample;\n}", U = function (e) { function n(n) { n && n.constructor !== Object && (console.warn("DropShadowFilter now uses options instead of (rotation, distance, blur, color, alpha)"), n = { rotation: n }, void 0 !== arguments[1] && (n.distance = arguments[1]), void 0 !== arguments[2] && (n.blur = arguments[2]), void 0 !== arguments[3] && (n.color = arguments[3]), void 0 !== arguments[4] && (n.alpha = arguments[4])), n = Object.assign({ rotation: 45, distance: 5, color: 0, alpha: .5, shadowOnly: !1, kernels: null, blur: 2, quality: 3, pixelSize: 1, resolution: t.settings.RESOLUTION }, n), e.call(this); var r = n.kernels, o = n.blur, i = n.quality, l = n.pixelSize, s = n.resolution; this._tintFilter = new t.Filter(Y, Q), this._tintFilter.uniforms.color = new Float32Array(4), this._tintFilter.resolution = s, this._blurFilter = r ? new a(r) : new a(o, i), this.pixelSize = l, this.resolution = s, this.targetTransform = new t.Matrix; var u = n.shadowOnly, c = n.rotation, f = n.distance, h = n.alpha, p = n.color; this.shadowOnly = u, this.rotation = c, this.distance = f, this.alpha = h, this.color = p, this._updatePadding() } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { resolution: { configurable: !0 }, distance: { configurable: !0 }, rotation: { configurable: !0 }, alpha: { configurable: !0 }, color: { configurable: !0 }, kernels: { configurable: !0 }, blur: { configurable: !0 }, quality: { configurable: !0 }, pixelSize: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { var o = e.getRenderTarget(); o.transform = this.targetTransform, this._tintFilter.apply(e, t, o, !0), o.transform = null, this._blurFilter.apply(e, o, n, r), !0 !== this.shadowOnly && e.applyFilter(this, t, n, !1), e.returnRenderTarget(o) }, n.prototype._updatePadding = function () { this.padding = this.distance + 2 * this.blur }, n.prototype._updateTargetTransform = function () { this.targetTransform.tx = this.distance * Math.cos(this.angle), this.targetTransform.ty = this.distance * Math.sin(this.angle) }, r.resolution.get = function () { return this._resolution }, r.resolution.set = function (e) { this._resolution = e, this._tintFilter && (this._tintFilter.resolution = e), this._blurFilter && (this._blurFilter.resolution = e) }, r.distance.get = function () { return this._distance }, r.distance.set = function (e) { this._distance = e, this._updatePadding(), this._updateTargetTransform() }, r.rotation.get = function () { return this.angle / t.DEG_TO_RAD }, r.rotation.set = function (e) { this.angle = e * t.DEG_TO_RAD, this._updateTargetTransform() }, r.alpha.get = function () { return this._tintFilter.uniforms.alpha }, r.alpha.set = function (e) { this._tintFilter.uniforms.alpha = e }, r.color.get = function () { return t.utils.rgb2hex(this._tintFilter.uniforms.color) }, r.color.set = function (e) { t.utils.hex2rgb(e, this._tintFilter.uniforms.color) }, r.kernels.get = function () { return this._blurFilter.kernels }, r.kernels.set = function (e) { this._blurFilter.kernels = e }, r.blur.get = function () { return this._blurFilter.blur }, r.blur.set = function (e) { this._blurFilter.blur = e, this._updatePadding() }, r.quality.get = function () { return this._blurFilter.quality }, r.quality.set = function (e) { this._blurFilter.quality = e }, r.pixelSize.get = function () { return this._blurFilter.pixelSize }, r.pixelSize.set = function (e) { this._blurFilter.pixelSize = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), Z = n, V = "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float strength;\nuniform vec4 filterArea;\n\n\nvoid main(void)\n{\n\tvec2 onePixel = vec2(1.0 / filterArea);\n\n\tvec4 color;\n\n\tcolor.rgb = vec3(0.5);\n\n\tcolor -= texture2D(uSampler, vTextureCoord - onePixel) * strength;\n\tcolor += texture2D(uSampler, vTextureCoord + onePixel) * strength;\n\n\tcolor.rgb = vec3((color.r + color.g + color.b) / 3.0);\n\n\tfloat alpha = texture2D(uSampler, vTextureCoord).a;\n\n\tgl_FragColor = vec4(color.rgb * alpha, alpha);\n}\n", H = function (e) { function t(t) { void 0 === t && (t = 5), e.call(this, Z, V), this.strength = t } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { strength: { configurable: !0 } }; return n.strength.get = function () { return this.uniforms.strength }, n.strength.set = function (e) { this.uniforms.strength = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), $ = n, J = "// precision highp float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\nuniform float aspect;\n\nuniform sampler2D displacementMap;\nuniform float offset;\nuniform float sinDir;\nuniform float cosDir;\nuniform int fillMode;\n\nuniform float seed;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nconst int TRANSPARENT = 0;\nconst int ORIGINAL = 1;\nconst int LOOP = 2;\nconst int CLAMP = 3;\nconst int MIRROR = 4;\n\nvoid main(void)\n{\n    vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;\n\n    if (coord.x > 1.0 || coord.y > 1.0) {\n        return;\n    }\n\n    float cx = coord.x - 0.5;\n    float cy = (coord.y - 0.5) * aspect;\n    float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;\n\n    // displacementMap: repeat\n    // ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);\n\n    // displacementMap: mirror\n    ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);\n\n    vec4 dc = texture2D(displacementMap, vec2(0.5, ny));\n\n    float displacement = (dc.r - dc.g) * (offset / filterArea.x);\n\n    coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);\n\n    if (fillMode == CLAMP) {\n        coord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    } else {\n        if( coord.x > filterClamp.z ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.x -= filterClamp.z;\n            } else if (fillMode == MIRROR) {\n                coord.x = filterClamp.z * 2.0 - coord.x;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        } else if( coord.x < filterClamp.x ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.x += filterClamp.z;\n            } else if (fillMode == MIRROR) {\n                coord.x *= -filterClamp.z;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        }\n\n        if( coord.y > filterClamp.w ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.y -= filterClamp.w;\n            } else if (fillMode == MIRROR) {\n                coord.y = filterClamp.w * 2.0 - coord.y;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        } else if( coord.y < filterClamp.y ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.y += filterClamp.w;\n            } else if (fillMode == MIRROR) {\n                coord.y *= -filterClamp.w;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        }\n    }\n\n    gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;\n    gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;\n    gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;\n    gl_FragColor.a = texture2D(uSampler, coord).a;\n}\n", ee = function (e) { function n(n) { void 0 === n && (n = {}), e.call(this, $, J), this.uniforms.dimensions = new Float32Array(2), n = Object.assign({ slices: 5, offset: 100, direction: 0, fillMode: 0, average: !1, seed: 0, red: [0, 0], green: [0, 0], blue: [0, 0], minSize: 8, sampleSize: 512 }, n), this.direction = n.direction, this.red = n.red, this.green = n.green, this.blue = n.blue, this.offset = n.offset, this.fillMode = n.fillMode, this.average = n.average, this.seed = n.seed, this.minSize = n.minSize, this.sampleSize = n.sampleSize, this._canvas = document.createElement("canvas"), this._canvas.width = 4, this._canvas.height = this.sampleSize, this.texture = t.Texture.fromCanvas(this._canvas, t.SCALE_MODES.NEAREST), this._slices = 0, this.slices = n.slices } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { sizes: { configurable: !0 }, offsets: { configurable: !0 }, slices: { configurable: !0 }, direction: { configurable: !0 }, red: { configurable: !0 }, green: { configurable: !0 }, blue: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { var o = t.sourceFrame.width, i = t.sourceFrame.height; this.uniforms.dimensions[0] = o, this.uniforms.dimensions[1] = i, this.uniforms.aspect = i / o, this.uniforms.seed = this.seed, this.uniforms.offset = this.offset, this.uniforms.fillMode = this.fillMode, e.applyFilter(this, t, n, r) }, n.prototype._randomizeSizes = function () { var e = this._sizes, t = this._slices - 1, n = this.sampleSize, r = Math.min(this.minSize / n, .9 / this._slices); if (this.average) { for (var o = this._slices, i = 1, l = 0; l < t; l++) { var s = i / (o - l), a = Math.max(s * (1 - .6 * Math.random()), r); e[l] = a, i -= a } e[t] = i } else { for (var u = 1, c = Math.sqrt(1 / this._slices), f = 0; f < t; f++) { var h = Math.max(c * u * Math.random(), r); e[f] = h, u -= h } e[t] = u } this.shuffle() }, n.prototype.shuffle = function () { for (var e = this._sizes, t = this._slices - 1; t > 0; t--) { var n = Math.random() * t >> 0, r = e[t]; e[t] = e[n], e[n] = r } }, n.prototype._randomizeOffsets = function () { for (var e = 0; e < this._slices; e++)this._offsets[e] = Math.random() * (Math.random() < .5 ? -1 : 1) }, n.prototype.refresh = function () { this._randomizeSizes(), this._randomizeOffsets(), this.redraw() }, n.prototype.redraw = function () { var e, t = this.sampleSize, n = this.texture, r = this._canvas.getContext("2d"); r.clearRect(0, 0, 8, t); for (var o = 0, i = 0; i < this._slices; i++) { e = Math.floor(256 * this._offsets[i]); var l = this._sizes[i] * t, s = e > 0 ? e : 0, a = e < 0 ? -e : 0; r.fillStyle = "rgba(" + s + ", " + a + ", 0, 1)", r.fillRect(0, o >> 0, t, l + 1 >> 0), o += l } n.baseTexture.update(), this.uniforms.displacementMap = n }, r.sizes.set = function (e) { for (var t = Math.min(this._slices, e.length), n = 0; n < t; n++)this._sizes[n] = e[n] }, r.sizes.get = function () { return this._sizes }, r.offsets.set = function (e) { for (var t = Math.min(this._slices, e.length), n = 0; n < t; n++)this._offsets[n] = e[n] }, r.offsets.get = function () { return this._offsets }, r.slices.get = function () { return this._slices }, r.slices.set = function (e) { this._slices !== e && (this._slices = e, this.uniforms.slices = e, this._sizes = this.uniforms.slicesWidth = new Float32Array(e), this._offsets = this.uniforms.slicesOffset = new Float32Array(e), this.refresh()) }, r.direction.get = function () { return this._direction }, r.direction.set = function (e) { if (this._direction !== e) { this._direction = e; var n = e * t.DEG_TO_RAD; this.uniforms.sinDir = Math.sin(n), this.uniforms.cosDir = Math.cos(n) } }, r.red.get = function () { return this.uniforms.red }, r.red.set = function (e) { this.uniforms.red = e }, r.green.get = function () { return this.uniforms.green }, r.green.set = function (e) { this.uniforms.green = e }, r.blue.get = function () { return this.uniforms.blue }, r.blue.set = function (e) { this.uniforms.blue = e }, n.prototype.destroy = function () { this.texture.destroy(!0), this.texture = null, this._canvas = null, this.red = null, this.green = null, this.blue = null, this._sizes = null, this._offsets = null }, Object.defineProperties(n.prototype, r), n }(t.Filter); ee.TRANSPARENT = 0, ee.ORIGINAL = 1, ee.LOOP = 2, ee.CLAMP = 3, ee.MIRROR = 4; var te = n, ne = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nuniform float distance;\nuniform float outerStrength;\nuniform float innerStrength;\nuniform vec4 glowColor;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nconst float PI = 3.14159265358979323846264;\n\nvoid main(void) {\n    vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\n    vec4 curColor;\n    float totalAlpha = 0.0;\n    float maxTotalAlpha = 0.0;\n    float cosAngle;\n    float sinAngle;\n    vec2 displaced;\n    for (float angle = 0.0; angle <= PI * 2.0; angle += %QUALITY_DIST%) {\n       cosAngle = cos(angle);\n       sinAngle = sin(angle);\n       for (float curDistance = 1.0; curDistance <= %DIST%; curDistance++) {\n           displaced.x = vTextureCoord.x + cosAngle * curDistance * px.x;\n           displaced.y = vTextureCoord.y + sinAngle * curDistance * px.y;\n           curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n           totalAlpha += (distance - curDistance) * curColor.a;\n           maxTotalAlpha += (distance - curDistance);\n       }\n    }\n    maxTotalAlpha = max(maxTotalAlpha, 0.0001);\n\n    ownColor.a = max(ownColor.a, 0.0001);\n    ownColor.rgb = ownColor.rgb / ownColor.a;\n    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);\n    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;\n    float resultAlpha = (ownColor.a + outerGlowAlpha);\n    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);\n}\n", re = function (e) { function n(t, n, r, o, i) { void 0 === t && (t = 10), void 0 === n && (n = 4), void 0 === r && (r = 0), void 0 === o && (o = 16777215), void 0 === i && (i = .1), e.call(this, te, ne.replace(/%QUALITY_DIST%/gi, "" + (1 / i / t).toFixed(7)).replace(/%DIST%/gi, "" + t.toFixed(7))), this.uniforms.glowColor = new Float32Array([0, 0, 0, 1]), this.distance = t, this.color = o, this.outerStrength = n, this.innerStrength = r } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { color: { configurable: !0 }, distance: { configurable: !0 }, outerStrength: { configurable: !0 }, innerStrength: { configurable: !0 } }; return r.color.get = function () { return t.utils.rgb2hex(this.uniforms.glowColor) }, r.color.set = function (e) { t.utils.hex2rgb(e, this.uniforms.glowColor) }, r.distance.get = function () { return this.uniforms.distance }, r.distance.set = function (e) { this.uniforms.distance = e }, r.outerStrength.get = function () { return this.uniforms.outerStrength }, r.outerStrength.set = function (e) { this.uniforms.outerStrength = e }, r.innerStrength.get = function () { return this.uniforms.innerStrength }, r.innerStrength.set = function (e) { this.uniforms.innerStrength = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), oe = n, ie = "vec3 mod289(vec3 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 mod289(vec4 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 permute(vec4 x)\n{\n    return mod289(((x * 34.0) + 1.0) * x);\n}\nvec4 taylorInvSqrt(vec4 r)\n{\n    return 1.79284291400159 - 0.85373472095314 * r;\n}\nvec3 fade(vec3 t)\n{\n    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n    Pi0 = mod289(Pi0);\n    Pi1 = mod289(Pi1);\n    vec3 Pf0 = fract(P); // Fractional part for interpolation\n    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n    vec4 iy = vec4(Pi0.yy, Pi1.yy);\n    vec4 iz0 = Pi0.zzzz;\n    vec4 iz1 = Pi1.zzzz;\n    vec4 ixy = permute(permute(ix) + iy);\n    vec4 ixy0 = permute(ixy + iz0);\n    vec4 ixy1 = permute(ixy + iz1);\n    vec4 gx0 = ixy0 * (1.0 / 7.0);\n    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n    gx0 = fract(gx0);\n    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n    vec4 sz0 = step(gz0, vec4(0.0));\n    gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n    gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n    vec4 gx1 = ixy1 * (1.0 / 7.0);\n    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n    gx1 = fract(gx1);\n    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n    vec4 sz1 = step(gz1, vec4(0.0));\n    gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n    gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n    g000 *= norm0.x;\n    g010 *= norm0.y;\n    g100 *= norm0.z;\n    g110 *= norm0.w;\n    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n    g001 *= norm1.x;\n    g011 *= norm1.y;\n    g101 *= norm1.z;\n    g111 *= norm1.w;\n    float n000 = dot(g000, Pf0);\n    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n    float n111 = dot(g111, Pf1);\n    vec3 fade_xyz = fade(Pf0);\n    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n    return 2.2 * n_xyz;\n}\nfloat turb(vec3 P, vec3 rep, float lacunarity, float gain)\n{\n    float sum = 0.0;\n    float sc = 1.0;\n    float totalgain = 1.0;\n    for (float i = 0.0; i < 6.0; i++)\n    {\n        sum += totalgain * pnoise(P * sc, rep);\n        sc *= lacunarity;\n        totalgain *= gain;\n    }\n    return abs(sum);\n}\n", le = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform vec2 light;\nuniform bool parallel;\nuniform float aspect;\n\nuniform float gain;\nuniform float lacunarity;\nuniform float time;\n\n${perlin}\n\nvoid main(void) {\n    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n    float d;\n\n    if (parallel) {\n        float _cos = light.x;\n        float _sin = light.y;\n        d = (_cos * coord.x) + (_sin * coord.y * aspect);\n    } else {\n        float dx = coord.x - light.x / dimensions.x;\n        float dy = (coord.y - light.y / dimensions.y) * aspect;\n        float dis = sqrt(dx * dx + dy * dy) + 0.00001;\n        d = dy / dis;\n    }\n\n    vec3 dir = vec3(d, d, 0.0);\n\n    float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);\n    noise = mix(noise, 0.0, 0.3);\n    //fade vertically.\n    vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);\n    mist.a = 1.0;\n\n    gl_FragColor = texture2D(uSampler, vTextureCoord) + mist;\n}\n", se = function (e) { function n(n) { e.call(this, oe, le.replace("${perlin}", ie)), this.uniforms.dimensions = new Float32Array(2), "number" == typeof n && (console.warn("GodrayFilter now uses options instead of (angle, gain, lacunarity, time)"), n = { angle: n }, void 0 !== arguments[1] && (n.gain = arguments[1]), void 0 !== arguments[2] && (n.lacunarity = arguments[2]), void 0 !== arguments[3] && (n.time = arguments[3])), n = Object.assign({ angle: 30, gain: .5, lacunarity: 2.5, time: 0, parallel: !0, center: [0, 0] }, n), this._angleLight = new t.Point, this.angle = n.angle, this.gain = n.gain, this.lacunarity = n.lacunarity, this.parallel = n.parallel, this.center = n.center, this.time = n.time } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { angle: { configurable: !0 }, gain: { configurable: !0 }, lacunarity: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { var o = t.sourceFrame, i = o.width, l = o.height; this.uniforms.light = this.parallel ? this._angleLight : this.center, this.uniforms.parallel = this.parallel, this.uniforms.dimensions[0] = i, this.uniforms.dimensions[1] = l, this.uniforms.aspect = l / i, this.uniforms.time = this.time, e.applyFilter(this, t, n, r) }, r.angle.get = function () { return this._angle }, r.angle.set = function (e) { this._angle = e; var n = e * t.DEG_TO_RAD; this._angleLight.x = Math.cos(n), this._angleLight.y = Math.sin(n) }, r.gain.get = function () { return this.uniforms.gain }, r.gain.set = function (e) { this.uniforms.gain = e }, r.lacunarity.get = function () { return this.uniforms.lacunarity }, r.lacunarity.set = function (e) { this.uniforms.lacunarity = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), ae = n, ue = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uVelocity;\nuniform int uKernelSize;\nuniform float uOffset;\n\nconst int MAX_KERNEL_SIZE = 2048;\n\n// Notice:\n// the perfect way:\n//    int kernelSize = min(uKernelSize, MAX_KERNELSIZE);\n// BUT in real use-case , uKernelSize < MAX_KERNELSIZE almost always.\n// So use uKernelSize directly.\n\nvoid main(void)\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    if (uKernelSize == 0)\n    {\n        gl_FragColor = color;\n        return;\n    }\n\n    vec2 velocity = uVelocity / filterArea.xy;\n    float offset = -uOffset / length(uVelocity) - 0.5;\n    int k = uKernelSize - 1;\n\n    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {\n        if (i == k) {\n            break;\n        }\n        vec2 bias = velocity * (float(i) / float(k) + offset);\n        color += texture2D(uSampler, vTextureCoord + bias);\n    }\n    gl_FragColor = color / float(uKernelSize);\n}\n", ce = function (e) { function n(n, r, o) { void 0 === n && (n = [0, 0]), void 0 === r && (r = 5), void 0 === o && (o = 0), e.call(this, ae, ue), this.uniforms.uVelocity = new Float32Array(2), this._velocity = new t.ObservablePoint(this.velocityChanged, this), this.velocity = n, this.kernelSize = r, this.offset = o } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { velocity: { configurable: !0 }, offset: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { var o = this.velocity, i = o.x, l = o.y; this.uniforms.uKernelSize = 0 !== i || 0 !== l ? this.kernelSize : 0, e.applyFilter(this, t, n, r) }, r.velocity.set = function (e) { Array.isArray(e) ? this._velocity.set(e[0], e[1]) : (e instanceof t.Point || e instanceof t.ObservablePoint) && this._velocity.copy(e) }, r.velocity.get = function () { return this._velocity }, n.prototype.velocityChanged = function () { this.uniforms.uVelocity[0] = this._velocity.x, this.uniforms.uVelocity[1] = this._velocity.y }, r.offset.set = function (e) { this.uniforms.uOffset = e }, r.offset.get = function () { return this.uniforms.uOffset }, Object.defineProperties(n.prototype, r), n }(t.Filter), fe = n, he = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float epsilon;\n\nconst int MAX_COLORS = %maxColors%;\n\nuniform vec3 originalColors[MAX_COLORS];\nuniform vec3 targetColors[MAX_COLORS];\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    float alpha = gl_FragColor.a;\n    if (alpha < 0.0001)\n    {\n      return;\n    }\n\n    vec3 color = gl_FragColor.rgb / alpha;\n\n    for(int i = 0; i < MAX_COLORS; i++)\n    {\n      vec3 origColor = originalColors[i];\n      if (origColor.r < 0.0)\n      {\n        break;\n      }\n      vec3 colorDiff = origColor - color;\n      if (length(colorDiff) < epsilon)\n      {\n        vec3 targetColor = targetColors[i];\n        gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);\n        return;\n      }\n    }\n}\n", pe = function (e) { function n(t, n, r) { void 0 === n && (n = .05), void 0 === r && (r = null), r = r || t.length, e.call(this, fe, he.replace(/%maxColors%/g, r)), this.epsilon = n, this._maxColors = r, this._replacements = null, this.uniforms.originalColors = new Float32Array(3 * r), this.uniforms.targetColors = new Float32Array(3 * r), this.replacements = t } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { replacements: { configurable: !0 }, maxColors: { configurable: !0 }, epsilon: { configurable: !0 } }; return r.replacements.set = function (e) { var n = this.uniforms.originalColors, r = this.uniforms.targetColors, o = e.length; if (o > this._maxColors) throw "Length of replacements (" + o + ") exceeds the maximum colors length (" + this._maxColors + ")"; n[3 * o] = -1; for (var i = 0; i < o; i++) { var l = e[i], s = l[0]; "number" == typeof s ? s = t.utils.hex2rgb(s) : l[0] = t.utils.rgb2hex(s), n[3 * i] = s[0], n[3 * i + 1] = s[1], n[3 * i + 2] = s[2]; var a = l[1]; "number" == typeof a ? a = t.utils.hex2rgb(a) : l[1] = t.utils.rgb2hex(a), r[3 * i] = a[0], r[3 * i + 1] = a[1], r[3 * i + 2] = a[2] } this._replacements = e }, r.replacements.get = function () { return this._replacements }, n.prototype.refresh = function () { this.replacements = this._replacements }, r.maxColors.get = function () { return this._maxColors }, r.epsilon.set = function (e) { this.uniforms.epsilon = e }, r.epsilon.get = function () { return this.uniforms.epsilon }, Object.defineProperties(n.prototype, r), n }(t.Filter), de = n, me = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform float sepia;\nuniform float noise;\nuniform float noiseSize;\nuniform float scratch;\nuniform float scratchDensity;\nuniform float scratchWidth;\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\nuniform float seed;\n\nconst float SQRT_2 = 1.414213;\nconst vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvec3 Overlay(vec3 src, vec3 dst)\n{\n    // if (dst <= 0.5) then: 2 * src * dst\n    // if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)\n    return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),\n                (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),\n                (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));\n}\n\n\nvoid main()\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec3 color = gl_FragColor.rgb;\n\n    if (sepia > 0.0)\n    {\n        float gray = (color.x + color.y + color.z) / 3.0;\n        vec3 grayscale = vec3(gray);\n\n        color = Overlay(SEPIA_RGB, grayscale);\n\n        color = grayscale + sepia * (color - grayscale);\n    }\n\n    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n    if (vignetting > 0.0)\n    {\n        float outter = SQRT_2 - vignetting * SQRT_2;\n        vec2 dir = vec2(vec2(0.5, 0.5) - coord);\n        dir.y *= dimensions.y / dimensions.x;\n        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n        color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n    }\n\n    if (scratchDensity > seed && scratch != 0.0)\n    {\n        float phase = seed * 256.0;\n        float s = mod(floor(phase), 2.0);\n        float dist = 1.0 / scratchDensity;\n        float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));\n        if (d < seed * 0.6 + 0.4)\n        {\n            highp float period = scratchDensity * 10.0;\n\n            float xx = coord.x * period + phase;\n            float aa = abs(mod(xx, 0.5) * 4.0);\n            float bb = mod(floor(xx / 0.5), 2.0);\n            float yy = (1.0 - bb) * aa + bb * (2.0 - aa);\n\n            float kk = 2.0 * period;\n            float dw = scratchWidth / dimensions.x * (0.75 + seed);\n            float dh = dw * kk;\n\n            float tine = (yy - (2.0 - dh));\n\n            if (tine > 0.0) {\n                float _sign = sign(scratch);\n\n                tine = s * tine / period + scratch + 0.1;\n                tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);\n\n                color.rgb *= tine;\n            }\n        }\n    }\n\n    if (noise > 0.0 && noiseSize > 0.0)\n    {\n        vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n        pixelCoord.x = floor(pixelCoord.x / noiseSize);\n        pixelCoord.y = floor(pixelCoord.y / noiseSize);\n        // vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);\n        // float _noise = snoise(d) * 0.5;\n        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n        color += _noise * noise;\n    }\n\n    gl_FragColor.rgb = color;\n}\n", ge = function (e) { function t(t, n) { void 0 === n && (n = 0), e.call(this, de, me), this.uniforms.dimensions = new Float32Array(2), "number" == typeof t ? (this.seed = t, t = null) : this.seed = n, Object.assign(this, { sepia: .3, noise: .3, noiseSize: 1, scratch: .5, scratchDensity: .3, scratchWidth: 1, vignetting: .3, vignettingAlpha: 1, vignettingBlur: .3 }, t) } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { sepia: { configurable: !0 }, noise: { configurable: !0 }, noiseSize: { configurable: !0 }, scratch: { configurable: !0 }, scratchDensity: { configurable: !0 }, scratchWidth: { configurable: !0 }, vignetting: { configurable: !0 }, vignettingAlpha: { configurable: !0 }, vignettingBlur: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.dimensions[0] = t.sourceFrame.width, this.uniforms.dimensions[1] = t.sourceFrame.height, this.uniforms.seed = this.seed, e.applyFilter(this, t, n, r) }, n.sepia.set = function (e) { this.uniforms.sepia = e }, n.sepia.get = function () { return this.uniforms.sepia }, n.noise.set = function (e) { this.uniforms.noise = e }, n.noise.get = function () { return this.uniforms.noise }, n.noiseSize.set = function (e) { this.uniforms.noiseSize = e }, n.noiseSize.get = function () { return this.uniforms.noiseSize }, n.scratch.set = function (e) { this.uniforms.scratch = e }, n.scratch.get = function () { return this.uniforms.scratch }, n.scratchDensity.set = function (e) { this.uniforms.scratchDensity = e }, n.scratchDensity.get = function () { return this.uniforms.scratchDensity }, n.scratchWidth.set = function (e) { this.uniforms.scratchWidth = e }, n.scratchWidth.get = function () { return this.uniforms.scratchWidth }, n.vignetting.set = function (e) { this.uniforms.vignetting = e }, n.vignetting.get = function () { return this.uniforms.vignetting }, n.vignettingAlpha.set = function (e) { this.uniforms.vignettingAlpha = e }, n.vignettingAlpha.get = function () { return this.uniforms.vignettingAlpha }, n.vignettingBlur.set = function (e) { this.uniforms.vignettingBlur = e }, n.vignettingBlur.get = function () { return this.uniforms.vignettingBlur }, Object.defineProperties(t.prototype, n), t }(t.Filter), ve = n, xe = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 thickness;\nuniform vec4 outlineColor;\nuniform vec4 filterClamp;\n\nconst float DOUBLE_PI = 3.14159265358979323846264 * 2.;\n\nvoid main(void) {\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\n    vec4 curColor;\n    float maxAlpha = 0.;\n    vec2 displaced;\n    for (float angle = 0.; angle <= DOUBLE_PI; angle += ${angleStep}) {\n        displaced.x = vTextureCoord.x + thickness.x * cos(angle);\n        displaced.y = vTextureCoord.y + thickness.y * sin(angle);\n        curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n        maxAlpha = max(maxAlpha, curColor.a);\n    }\n    float resultAlpha = max(maxAlpha, ownColor.a);\n    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\n}\n", ye = function (e) { function n(t, r, o) { void 0 === t && (t = 1), void 0 === r && (r = 0), void 0 === o && (o = .1); var i = Math.max(o * n.MAX_SAMPLES, n.MIN_SAMPLES), l = (2 * Math.PI / i).toFixed(7); e.call(this, ve, xe.replace(/\$\{angleStep\}/, l)), this.uniforms.thickness = new Float32Array([0, 0]), this.thickness = t, this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]), this.color = r, this.quality = o } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { color: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { this.uniforms.thickness[0] = this.thickness / t.size.width, this.uniforms.thickness[1] = this.thickness / t.size.height, e.applyFilter(this, t, n, r) }, r.color.get = function () { return t.utils.rgb2hex(this.uniforms.outlineColor) }, r.color.set = function (e) { t.utils.hex2rgb(e, this.uniforms.outlineColor) }, Object.defineProperties(n.prototype, r), n }(t.Filter); ye.MIN_SAMPLES = 1, ye.MAX_SAMPLES = 100; var be = n, _e = "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec2 size;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n\treturn floor( coord / size ) * size;\n}\n\nvoid main(void)\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    coord = pixelate(coord, size);\n\n    coord = unmapCoord(coord);\n\n    gl_FragColor = texture2D(uSampler, coord);\n}\n", Ce = function (e) { function t(t) { void 0 === t && (t = 10), e.call(this, be, _e), this.size = t } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { size: { configurable: !0 } }; return n.size.get = function () { return this.uniforms.size }, n.size.set = function (e) { "number" == typeof e && (e = [e, e]), this.uniforms.size = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Se = n, Fe = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float uRadian;\nuniform vec2 uCenter;\nuniform float uRadius;\nuniform int uKernelSize;\n\nconst int MAX_KERNEL_SIZE = 2048;\n\nvoid main(void)\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    if (uKernelSize == 0)\n    {\n        gl_FragColor = color;\n        return;\n    }\n\n    float aspect = filterArea.y / filterArea.x;\n    vec2 center = uCenter.xy / filterArea.xy;\n    float gradient = uRadius / filterArea.x * 0.3;\n    float radius = uRadius / filterArea.x - gradient * 0.5;\n    int k = uKernelSize - 1;\n\n    vec2 coord = vTextureCoord;\n    vec2 dir = vec2(center - coord);\n    float dist = length(vec2(dir.x, dir.y * aspect));\n\n    float radianStep = uRadian;\n    if (radius >= 0.0 && dist > radius) {\n        float delta = dist - radius;\n        float gap = gradient;\n        float scale = 1.0 - abs(delta / gap);\n        if (scale <= 0.0) {\n            gl_FragColor = color;\n            return;\n        }\n        radianStep *= scale;\n    }\n    radianStep /= float(k);\n\n    float s = sin(radianStep);\n    float c = cos(radianStep);\n    mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));\n\n    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {\n        if (i == k) {\n            break;\n        }\n\n        coord -= center;\n        coord.y *= aspect;\n        coord = rotationMatrix * coord;\n        coord.y /= aspect;\n        coord += center;\n\n        vec4 sample = texture2D(uSampler, coord);\n\n        // switch to pre-multiplied alpha to correctly blur transparent images\n        // sample.rgb *= sample.a;\n\n        color += sample;\n    }\n\n    gl_FragColor = color / float(uKernelSize);\n}\n", ze = function (e) { function t(t, n, r, o) { void 0 === t && (t = 0), void 0 === n && (n = [0, 0]), void 0 === r && (r = 5), void 0 === o && (o = -1), e.call(this, Se, Fe), this._angle = 0, this.angle = t, this.center = n, this.kernelSize = r, this.radius = o } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { angle: { configurable: !0 }, center: { configurable: !0 }, radius: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.uKernelSize = 0 !== this._angle ? this.kernelSize : 0, e.applyFilter(this, t, n, r) }, n.angle.set = function (e) { this._angle = e, this.uniforms.uRadian = e * Math.PI / 180 }, n.angle.get = function () { return this._angle }, n.center.get = function () { return this.uniforms.uCenter }, n.center.set = function (e) { this.uniforms.uCenter = e }, n.radius.get = function () { return this.uniforms.uRadius }, n.radius.set = function (e) { (e < 0 || e === 1 / 0) && (e = -1), this.uniforms.uRadius = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Ae = n, we = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nuniform bool mirror;\nuniform float boundary;\nuniform vec2 amplitude;\nuniform vec2 waveLength;\nuniform vec2 alpha;\nuniform float time;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n    vec2 coord = pixelCoord / dimensions;\n\n    if (coord.y < boundary) {\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n        return;\n    }\n\n    float k = (coord.y - boundary) / (1. - boundary + 0.0001);\n    float areaY = boundary * dimensions.y / filterArea.y;\n    float v = areaY + areaY - vTextureCoord.y;\n    float y = mirror ? v : vTextureCoord.y;\n\n    float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;\n    float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;\n    float _alpha = (alpha.y - alpha.x) * k + alpha.x;\n\n    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;\n    x = clamp(x, filterClamp.x, filterClamp.z);\n\n    vec4 color = texture2D(uSampler, vec2(x, y));\n\n    gl_FragColor = color * _alpha;\n}\n", Te = function (e) { function t(t) { e.call(this, Ae, we), this.uniforms.amplitude = new Float32Array(2), this.uniforms.waveLength = new Float32Array(2), this.uniforms.alpha = new Float32Array(2), this.uniforms.dimensions = new Float32Array(2), Object.assign(this, { mirror: !0, boundary: .5, amplitude: [0, 20], waveLength: [30, 100], alpha: [1, 1], time: 0 }, t) } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { mirror: { configurable: !0 }, boundary: { configurable: !0 }, amplitude: { configurable: !0 }, waveLength: { configurable: !0 }, alpha: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.dimensions[0] = t.sourceFrame.width, this.uniforms.dimensions[1] = t.sourceFrame.height, this.uniforms.time = this.time, e.applyFilter(this, t, n, r) }, n.mirror.set = function (e) { this.uniforms.mirror = e }, n.mirror.get = function () { return this.uniforms.mirror }, n.boundary.set = function (e) { this.uniforms.boundary = e }, n.boundary.get = function () { return this.uniforms.boundary }, n.amplitude.set = function (e) { this.uniforms.amplitude[0] = e[0], this.uniforms.amplitude[1] = e[1] }, n.amplitude.get = function () { return this.uniforms.amplitude }, n.waveLength.set = function (e) { this.uniforms.waveLength[0] = e[0], this.uniforms.waveLength[1] = e[1] }, n.waveLength.get = function () { return this.uniforms.waveLength }, n.alpha.set = function (e) { this.uniforms.alpha[0] = e[0], this.uniforms.alpha[1] = e[1] }, n.alpha.get = function () { return this.uniforms.alpha }, Object.defineProperties(t.prototype, n), t }(t.Filter), De = n, Oe = "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n", Pe = function (e) { function t(t, n, r) { void 0 === t && (t = [-10, 0]), void 0 === n && (n = [0, 10]), void 0 === r && (r = [0, 0]), e.call(this, De, Oe), this.red = t, this.green = n, this.blue = r } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { red: { configurable: !0 }, green: { configurable: !0 }, blue: { configurable: !0 } }; return n.red.get = function () { return this.uniforms.red }, n.red.set = function (e) { this.uniforms.red = e }, n.green.get = function () { return this.uniforms.green }, n.green.set = function (e) { this.uniforms.green = e }, n.blue.get = function () { return this.uniforms.blue }, n.blue.set = function (e) { this.uniforms.blue = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Me = n, Re = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\n\nuniform vec2 center;\n\nuniform float amplitude;\nuniform float wavelength;\n// uniform float power;\nuniform float brightness;\nuniform float speed;\nuniform float radius;\n\nuniform float time;\n\nconst float PI = 3.14159;\n\nvoid main()\n{\n    float halfWavelength = wavelength * 0.5 / filterArea.x;\n    float maxRadius = radius / filterArea.x;\n    float currentRadius = time * speed / filterArea.x;\n\n    float fade = 1.0;\n\n    if (maxRadius > 0.0) {\n        if (currentRadius > maxRadius) {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n            return;\n        }\n        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);\n    }\n\n    vec2 dir = vec2(vTextureCoord - center / filterArea.xy);\n    dir.y *= filterArea.y / filterArea.x;\n    float dist = length(dir);\n\n    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n        return;\n    }\n\n    vec2 diffUV = normalize(dir);\n\n    float diff = (dist - currentRadius) / halfWavelength;\n\n    float p = 1.0 - pow(abs(diff), 2.0);\n\n    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );\n    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );\n\n    vec2 offset = diffUV * powDiff / filterArea.xy;\n\n    // Do clamp :\n    vec2 coord = vTextureCoord + offset;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    vec4 color = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        color *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    // No clamp :\n    // gl_FragColor = texture2D(uSampler, vTextureCoord + offset);\n\n    color.rgb *= 1.0 + (brightness - 1.0) * p * fade;\n\n    gl_FragColor = color;\n}\n", je = function (e) { function t(t, n, r) { void 0 === t && (t = [0, 0]), void 0 === n && (n = {}), void 0 === r && (r = 0), e.call(this, Me, Re), this.center = t, Array.isArray(n) && (console.warn("Deprecated Warning: ShockwaveFilter params Array has been changed to options Object."), n = {}), n = Object.assign({ amplitude: 30, wavelength: 160, brightness: 1, speed: 500, radius: -1 }, n), this.amplitude = n.amplitude, this.wavelength = n.wavelength, this.brightness = n.brightness, this.speed = n.speed, this.radius = n.radius, this.time = r } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { center: { configurable: !0 }, amplitude: { configurable: !0 }, wavelength: { configurable: !0 }, brightness: { configurable: !0 }, speed: { configurable: !0 }, radius: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.time = this.time, e.applyFilter(this, t, n, r) }, n.center.get = function () { return this.uniforms.center }, n.center.set = function (e) { this.uniforms.center = e }, n.amplitude.get = function () { return this.uniforms.amplitude }, n.amplitude.set = function (e) { this.uniforms.amplitude = e }, n.wavelength.get = function () { return this.uniforms.wavelength }, n.wavelength.set = function (e) { this.uniforms.wavelength = e }, n.brightness.get = function () { return this.uniforms.brightness }, n.brightness.set = function (e) { this.uniforms.brightness = e }, n.speed.get = function () { return this.uniforms.speed }, n.speed.set = function (e) { this.uniforms.speed = e }, n.radius.get = function () { return this.uniforms.radius }, n.radius.set = function (e) { this.uniforms.radius = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Le = n, ke = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D uLightmap;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\nuniform vec4 ambientColor;\nvoid main() {\n    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);\n    vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;\n    vec4 light = texture2D(uLightmap, lightCoord);\n    vec3 ambient = ambientColor.rgb * ambientColor.a;\n    vec3 intensity = ambient + light.rgb;\n    vec3 finalColor = diffuseColor.rgb * intensity;\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\n}\n", Ie = function (e) { function n(t, n, r) { void 0 === n && (n = 0), void 0 === r && (r = 1), e.call(this, Le, ke), this.uniforms.dimensions = new Float32Array(2), this.uniforms.ambientColor = new Float32Array([0, 0, 0, r]), this.texture = t, this.color = n } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { texture: { configurable: !0 }, color: { configurable: !0 }, alpha: { configurable: !0 } }; return n.prototype.apply = function (e, t, n, r) { this.uniforms.dimensions[0] = t.sourceFrame.width, this.uniforms.dimensions[1] = t.sourceFrame.height, e.applyFilter(this, t, n, r) }, r.texture.get = function () { return this.uniforms.uLightmap }, r.texture.set = function (e) { this.uniforms.uLightmap = e }, r.color.set = function (e) { var n = this.uniforms.ambientColor; "number" == typeof e ? (t.utils.hex2rgb(e, n), this._color = e) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = e[3], this._color = t.utils.rgb2hex(n)) }, r.color.get = function () { return this._color }, r.alpha.get = function () { return this.uniforms.ambientColor[3] }, r.alpha.set = function (e) { this.uniforms.ambientColor[3] = e }, Object.defineProperties(n.prototype, r), n }(t.Filter), Ee = n, Be = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    color /= total;\n    color.rgb /= color.a + 0.00001;\n\n    gl_FragColor = color;\n}\n", Xe = function (e) { function n(n, r, o, i) { void 0 === n && (n = 100), void 0 === r && (r = 600), void 0 === o && (o = null), void 0 === i && (i = null), e.call(this, Ee, Be), this.uniforms.blur = n, this.uniforms.gradientBlur = r, this.uniforms.start = o || new t.Point(0, window.innerHeight / 2), this.uniforms.end = i || new t.Point(600, window.innerHeight / 2), this.uniforms.delta = new t.Point(30, 30), this.uniforms.texSize = new t.Point(1024, 1024), this.updateDelta() } e && (n.__proto__ = e), n.prototype = Object.create(e && e.prototype), n.prototype.constructor = n; var r = { blur: { configurable: !0 }, gradientBlur: { configurable: !0 }, start: { configurable: !0 }, end: { configurable: !0 } }; return n.prototype.updateDelta = function () { this.uniforms.delta.x = 0, this.uniforms.delta.y = 0 }, r.blur.get = function () { return this.uniforms.blur }, r.blur.set = function (e) { this.uniforms.blur = e }, r.gradientBlur.get = function () { return this.uniforms.gradientBlur }, r.gradientBlur.set = function (e) { this.uniforms.gradientBlur = e }, r.start.get = function () { return this.uniforms.start }, r.start.set = function (e) { this.uniforms.start = e, this.updateDelta() }, r.end.get = function () { return this.uniforms.end }, r.end.set = function (e) { this.uniforms.end = e, this.updateDelta() }, Object.defineProperties(n.prototype, r), n }(t.Filter), qe = function (e) { function t() { e.apply(this, arguments) } return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t.prototype.updateDelta = function () { var e = this.uniforms.end.x - this.uniforms.start.x, t = this.uniforms.end.y - this.uniforms.start.y, n = Math.sqrt(e * e + t * t); this.uniforms.delta.x = e / n, this.uniforms.delta.y = t / n }, t }(Xe), Ne = function (e) { function t() { e.apply(this, arguments) } return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t.prototype.updateDelta = function () { var e = this.uniforms.end.x - this.uniforms.start.x, t = this.uniforms.end.y - this.uniforms.start.y, n = Math.sqrt(e * e + t * t); this.uniforms.delta.x = -t / n, this.uniforms.delta.y = e / n }, t }(Xe), We = function (e) { function t(t, n, r, o) { void 0 === t && (t = 100), void 0 === n && (n = 600), void 0 === r && (r = null), void 0 === o && (o = null), e.call(this), this.tiltShiftXFilter = new qe(t, n, r, o), this.tiltShiftYFilter = new Ne(t, n, r, o) } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { blur: { configurable: !0 }, gradientBlur: { configurable: !0 }, start: { configurable: !0 }, end: { configurable: !0 } }; return t.prototype.apply = function (e, t, n) { var r = e.getRenderTarget(!0); this.tiltShiftXFilter.apply(e, t, r), this.tiltShiftYFilter.apply(e, r, n), e.returnRenderTarget(r) }, n.blur.get = function () { return this.tiltShiftXFilter.blur }, n.blur.set = function (e) { this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = e }, n.gradientBlur.get = function () { return this.tiltShiftXFilter.gradientBlur }, n.gradientBlur.set = function (e) { this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = e }, n.start.get = function () { return this.tiltShiftXFilter.start }, n.start.set = function (e) { this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = e }, n.end.get = function () { return this.tiltShiftXFilter.end }, n.end.set = function (e) { this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Ge = n, Ke = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 twist(vec2 coord)\n{\n    coord -= offset;\n\n    float dist = length(coord);\n\n    if (dist < radius)\n    {\n        float ratioDist = (radius - dist) / radius;\n        float angleMod = ratioDist * ratioDist * angle;\n        float s = sin(angleMod);\n        float c = cos(angleMod);\n        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n    }\n\n    coord += offset;\n\n    return coord;\n}\n\nvoid main(void)\n{\n\n    vec2 coord = mapCoord(vTextureCoord);\n\n    coord = twist(coord);\n\n    coord = unmapCoord(coord);\n\n    gl_FragColor = texture2D(uSampler, coord );\n\n}\n", Ye = function (e) { function t(t, n, r) { void 0 === t && (t = 200), void 0 === n && (n = 4), void 0 === r && (r = 20), e.call(this, Ge, Ke), this.radius = t, this.angle = n, this.padding = r } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { offset: { configurable: !0 }, radius: { configurable: !0 }, angle: { configurable: !0 } }; return n.offset.get = function () { return this.uniforms.offset }, n.offset.set = function (e) { this.uniforms.offset = e }, n.radius.get = function () { return this.uniforms.radius }, n.radius.set = function (e) { this.uniforms.radius = e }, n.angle.get = function () { return this.uniforms.angle }, n.angle.set = function (e) { this.uniforms.angle = e }, Object.defineProperties(t.prototype, n), t }(t.Filter), Qe = n, Ue = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uCenter;\nuniform float uStrength;\nuniform float uInnerRadius;\nuniform float uRadius;\n\nconst float MAX_KERNEL_SIZE = 32.0;\n\n// author: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/\nhighp float rand(vec2 co, float seed) {\n    const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n    highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);\n    return fract(sin(sn) * c + seed);\n}\n\nvoid main() {\n\n    float minGradient = uInnerRadius * 0.3;\n    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;\n\n    float gradient = uRadius * 0.3;\n    float radius = (uRadius - gradient * 0.5) / filterArea.x;\n\n    float countLimit = MAX_KERNEL_SIZE;\n\n    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);\n    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));\n\n    float strength = uStrength;\n\n    float delta = 0.0;\n    float gap;\n    if (dist < innerRadius) {\n        delta = innerRadius - dist;\n        gap = minGradient;\n    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity\n        delta = dist - radius;\n        gap = gradient;\n    }\n\n    if (delta > 0.0) {\n        float normalCount = gap / filterArea.x;\n        delta = (normalCount - delta) / normalCount;\n        countLimit *= delta;\n        strength *= delta;\n        if (countLimit < 1.0)\n        {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n            return;\n        }\n    }\n\n    // randomize the lookup values to hide the fixed number of samples\n    float offset = rand(vTextureCoord, 0.0);\n\n    float total = 0.0;\n    vec4 color = vec4(0.0);\n\n    dir *= strength;\n\n    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {\n        float percent = (t + offset) / MAX_KERNEL_SIZE;\n        float weight = 4.0 * (percent - percent * percent);\n        vec2 p = vTextureCoord + dir * percent;\n        vec4 sample = texture2D(uSampler, p);\n\n        // switch to pre-multiplied alpha to correctly blur transparent images\n        // sample.rgb *= sample.a;\n\n        color += sample * weight;\n        total += weight;\n\n        if (t > countLimit){\n            break;\n        }\n    }\n\n    color /= total;\n    // switch back from pre-multiplied alpha\n    // color.rgb /= color.a + 0.00001;\n\n    gl_FragColor = color;\n}\n", Ze = function (e) { function t(t, n, r, o) { void 0 === t && (t = .1), void 0 === n && (n = [0, 0]), void 0 === r && (r = 0), void 0 === o && (o = -1), e.call(this, Qe, Ue), this.center = n, this.strength = t, this.innerRadius = r, this.radius = o } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var n = { center: { configurable: !0 }, strength: { configurable: !0 }, innerRadius: { configurable: !0 }, radius: { configurable: !0 } }; return n.center.get = function () { return this.uniforms.uCenter }, n.center.set = function (e) { this.uniforms.uCenter = e }, n.strength.get = function () { return this.uniforms.uStrength }, n.strength.set = function (e) { this.uniforms.uStrength = e }, n.innerRadius.get = function () { return this.uniforms.uInnerRadius }, n.innerRadius.set = function (e) { this.uniforms.uInnerRadius = e }, n.radius.get = function () { return this.uniforms.uRadius }, n.radius.set = function (e) { (e < 0 || e === 1 / 0) && (e = -1), this.uniforms.uRadius = e }, Object.defineProperties(t.prototype, n), t }(t.Filter); return e.AdjustmentFilter = o, e.AdvancedBloomFilter = p, e.AsciiFilter = g, e.BevelFilter = y, e.BloomFilter = F, e.BulgePinchFilter = w, e.ColorMapFilter = O, e.ColorReplaceFilter = R, e.ConvolutionFilter = k, e.CrossHatchFilter = B, e.CRTFilter = N, e.DotFilter = K, e.DropShadowFilter = U, e.EmbossFilter = H, e.GlitchFilter = ee, e.GlowFilter = re, e.GodrayFilter = se, e.KawaseBlurFilter = a, e.MotionBlurFilter = ce, e.MultiColorReplaceFilter = pe, e.OldFilmFilter = ge, e.OutlineFilter = ye, e.PixelateFilter = Ce, e.RadialBlurFilter = ze, e.ReflectionFilter = Te, e.RGBSplitFilter = Pe, e.ShockwaveFilter = je, e.SimpleLightmapFilter = Ie, e.TiltShiftFilter = We, e.TiltShiftAxisFilter = Xe, e.TiltShiftXFilter = qe, e.TiltShiftYFilter = Ne, e.TwistFilter = Ye, e.ZoomBlurFilter = Ze, e }({}, PIXI); Object.assign(PIXI.filters, this ? this.__filters : __filters);
	})();


	//=============================================================================
	// VignetteFilter
	//=============================================================================
	/*
	The MIT License
	
	Copyright (c) 2013-2018 Wei Zijun, Matt Karl
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	(() => {
		var fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform float size;
uniform float alpha;
uniform float blur;

const float SQRT_2 = 1.414213;
void main()
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 color = gl_FragColor.rgb;
    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;
   
    float outter = 1.0 - size * 1.0;
    vec2 dir = vec2(vec2(0.5, 0.5) - coord);

    float darker = clamp((outter - (length(dir)-blur) * SQRT_2)*outter / ( 0.00001 + blur*SQRT_2), 0.0, 1.0);
    color *= smoothstep(0.2, 0.8, darker + (1.0 - darker)*(1.0 - darker) * (1.0 - alpha));


    gl_FragColor.rgb = color;
}`;




		//=============================================================================
		// VignetteFilter
		//=============================================================================
		var VignetteFilter = TRP_CORE.VignetteFilter = function VignetteFilter(options) {
			var vertex = null;
			PIXI.Filter.call(this, vertex, fragment);

			this.uniforms.dimensions = new Float32Array(2);
			Object.assign(this, VignetteFilter.defaults, options);
		};
		VignetteFilter.prototype = Object.create(PIXI.Filter.prototype);
		VignetteFilter.prototype.constructor = VignetteFilter;

		VignetteFilter.DEFAULTS = {
			size: 0.3,
			alpha: 1,
			blur: 0.3,
		};

		VignetteFilter.prototype.apply = function (filterManager, input, output, clear) {
			this.uniforms.dimensions[0] = (input.filterFrame || input.destinationFrame).width;
			this.uniforms.dimensions[1] = (input.filterFrame || input.destinationFrame).height;
			filterManager.applyFilter(this, input, output, clear);
		};

		Object.defineProperty(VignetteFilter.prototype, 'size', {
			get: function () {
				return this.uniforms.size
			}, set: function (value) {
				this.uniforms.size = value;
			},
			configurable: true
		});
		Object.defineProperty(VignetteFilter.prototype, 'alpha', {
			get: function () {
				return this.uniforms.alpha
			}, set: function (value) {
				this.uniforms.alpha = value;
			},
			configurable: true
		});
		Object.defineProperty(VignetteFilter.prototype, 'blur', {
			get: function () {
				return this.uniforms.blur
			}, set: function (value) {
				this.uniforms.blur = value;
			},
			configurable: true
		});


	})();
	//=============================================================================





	//=============================================================================
	// Plugin Command
	//=============================================================================
	if (isMZ) {
		['edit', 'update', 'option'].forEach(command => {
			PluginManager.registerCommand(pluginName, command, function (args) {
				var argsArr = Object.values(args)
				argsArr.unshift(command);
				FilterManager.pluginCommand(argsArr, this);
			});
		});
	};


	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		if (command === parameters.command) {
			TRP_FilterManager.pluginCommand(args, this);
		} else {
			_Game_Interpreter_pluginCommand.call(this, ...arguments);
		}
	};

	FilterManager.pluginCommand = function (args, interpreter) {
		var name = args[0];
		var command = "processCommand" + name[0].toUpperCase() + name.substring(1)
		this[command](args, interpreter);
	};

	FilterManager.processCommandOption = function (args, interpreter) {
		var value = !(args[1] === 'false' || args[1] === false);
		ConfigManager[optionKey] = value;
		ConfigManager.save();
	};


	//=============================================================================
	// Scene_Base
	//=============================================================================
	var _Scene_Base_update = Scene_Base.prototype.update;
	Scene_Base.prototype.update = function () {
		_Scene_Base_update.call(this, ...arguments);
		FilterManager.update(this);
	};




	//=============================================================================
	// Spriteset
	//=============================================================================
	var _Spriteset_Base_initialize = Spriteset_Base.prototype.initialize;
	Spriteset_Base.prototype.initialize = function () {
		_Spriteset_Base_initialize.call(this, ...arguments);

		if (this.isTrpMapFilterEnabled()) {
			FilterManager.trySetupMapFilters(this);
		}
	};
	Spriteset_Base.prototype.isTrpMapFilterEnabled = function () {
		return false;
	};
	Spriteset_Base.prototype.overwriteTrpMapFilterSettings = function () { };



	/* Spriteset_Map
	===================================*/
	Spriteset_Map.prototype.isTrpMapFilterEnabled = function () {
		return true;
	};
	Spriteset_Map.prototype.overwriteTrpMapFilterSettings = function () { };


	/* Spriteset_Battle
	===================================*/
	Spriteset_Battle.prototype.isTrpMapFilterEnabled = function () {
		return enableOnBattle;
	};
	Spriteset_Battle.prototype.overwriteTrpMapFilterSettings = function (commands) {
		var battleDefaults = {};
		overwriteFilterCommands(battleDefaults, parameters.battleDefaults || '');

		if (overwriteAdjustmentForBattle) {
			commands.adjustment = battleDefaults.adjustment || null;
		}
		if (overwriteBloomForBattle) {
			commands.bloom = battleDefaults.bloom || null;
		}
		if (overwriteTiltshiftForBattle) {
			commands.tiltshift = battleDefaults.tiltshift || null;
		}
		if (overwriteVignetteForBattle) {
			commands.vignette = battleDefaults.vignette || null;
		}
	};




	//=============================================================================
	// Game_Object
	//=============================================================================
	var _Game_Map_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function (mapId) {
		if (mapId !== this._mapId) {
			FilterManager._updateParamsInMap = [];
		}
		_Game_Map_setup.call(this, ...arguments);
	};


	//=============================================================================
	// TRP_FilterManager
	//=============================================================================
	FilterManager._cache = {};
	FilterManager._data = {};
	FilterManager._keys = [];
	var TARGET_TYPES = FilterManager.TARGET_TYPES = {
		baseSprite: 0,
	};

	FilterManager.DEFAULT_PARAMS = {
		adjustment: [
			//gamma,saturation,contrast,brightness
			1, 1, 1, 1,
			//red,green,blue,alpha
			1, 1, 1, 1
		],
		bloom: [
			//blur,bloomScale,threshold,brightness
			1, 0.1, 0.5, 0.95
		],
		tiltshift: [
			//blur,gradientBlur,y
			5, 312, 312,
		],
		vignette: [
			//size,alpha,blur
			0.25, 1.0, 0.5,
		],
	};
	FilterManager.ZERO_EFFECT_PARAMS = {
		adjustment: [
			//gamma,saturation,contrast,brightness
			1, 1, 1, 1,
			//red,green,blue,alpha
			1, 1, 1, 1
		],
		bloom: [
			//blur,bloomScale,threshold,brightness
			0, 0.0, 1.0, 1
		],
		tiltshift: [
			//blur,gradientBlur,y
			5, 312, 312,
		],
		vignette: [
			//size,alpha,blur
			0.25, 1.0, 0.5,
		],
	};

	FilterManager.DEFAULT_PARAMS.godray = FilterManager.DEFAULT_PARAMS.godray1;

	FilterManager.get = function (type, params) {
		var filter = null;
		if (FilterManager._cache[type]) {
			filter = FilterManager._cache[type].pop();
		}
		switch (type) {
			case 'adjustment':
				filter = filter || new PIXI.filters.AdjustmentFilter;
				break;
			case 'bloom':
				filter = filter || new PIXI.filters.AdvancedBloomFilter;
				break;
			case 'tiltshift':
				filter = filter || new PIXI.filters.TiltShiftFilter;
				filter.start = filter.start;
				filter.end = filter.end;
				break;
			case 'vignette':
				filter = filter || new TRP_CORE.VignetteFilter;
				break;
		}

		return filter;
	};

	FilterManager.cache = function (data, filter) {
		var type = data.type;
		FilterManager._cache[type] = FilterManager._cache[type] || [];
		FilterManager._cache[type].push(filter);
	};

	FilterManager._init = false;
	FilterManager.init = function () {
		this._init = true;

		var tiltshift = FilterManager.DEFAULT_PARAMS.tiltshift;
		tiltshift[1] = tiltshift[2] = Graphics.height / 2;
	};

	FilterManager.filterCreate = function (id, targetArg = 'baseSprite', type = id, target = null, params = null) {
		if (this._data[id]) {
			if (params) {
				this.filterUpdate(id, params);
			}
			return false;
		}
		if (!this._init) this.init();

		target = target || this._filterTarget(targetArg);
		if (!target) {
			return false;
		}

		type = type.toLowerCase();

		var filter = this.get(type, params);
		var filters = target.filters = target.filters || [];
		filters.push(filter);
		target.filters = filters;

		var data = {
			id: id,
			type: type,

			erase: false,
			filter: filter,
			target: target,

			animation: null,
			eraseAfterMove: false,
		};

		this._data[id] = data;
		this._keys.push(id);

		params = params || FilterManager.DEFAULT_PARAMS[type];
		if (params) {
			this.filterUpdate(id, params);
		}

		return true;
	};

	FilterManager._filterTarget = function (targetArg) {
		var targetArgs = (targetArg && targetArg.contains(':')) ? targetArg.split(':') : null;
		var targetType = TARGET_TYPES[(targetArgs ? targetArgs.shift() : targetArg)];

		switch (targetType) {
			case TARGET_TYPES.baseSprite:
				var spriteset = this.activeSpriteset();
				return spriteset ? spriteset._baseSprite : null;

			default:
				return this.filterTarget(targetArgs, targetType)
		}
	};

	FilterManager.filterTarget = function () { return null };
	FilterManager.activeSpriteset = function () {
		if (SceneManager._scene) {
			return SceneManager._scene._spriteset || null;
		}
		return null;
	};


	FilterManager.filterClear = function (id, waitAnimation = false) {
		var data = this._data[id];
		if (!data) return;

		if (waitAnimation && data.animation) {
			var animation = data.animation;
			animation.loop = false;
			while (animation.animation) {
				animation = animation.animation;
				animation.loop = false;
			}
			animation.eraseAfterMove = true;
			return;
		}

		//remove filter from target
		var filter = data.filter;
		TRP_CORE.remove(data.target.filters, filter);

		FilterManager.cache(data, filter);

		data.filter = null;
		data.target = null;

		//erase data
		delete this._data[id];
		TRP_CORE.remove(this._keys, id);
	};






	/* onSceneTerminate
	===================================*/
	if (isMZ) (() => {
		var _SceneManager_onSceneTerminate = SceneManager.onSceneTerminate;
		SceneManager.onSceneTerminate = function () {
			_SceneManager_onSceneTerminate.call(this, ...arguments);
			FilterManager.onSceneTerminate();
		}
	})();
	if (!isMZ) (() => {
		var _Scene_Base_terminate = Scene_Base.prototype.terminate;
		Scene_Base.prototype.terminate = function () {
			FilterManager.onSceneTerminate();
			_Scene_Base_terminate.call(this, ...arguments);
		};
	})();

	FilterManager.onSceneTerminate = function () {
		this.clearWithTargetType(FilterManager.TARGET_TYPES.spriteset);
	};
	FilterManager.clearWithTargetType = function (targetType) {
		for (var i = this._keys.length - 1; i >= 0; i = (i - 1) | 0) {
			var id = this._keys[i];
			var data = this._data[id];

			if (data.targetType === targetType) {
				this.filterClear(id, false);
			}
		}
	};





	//=============================================================================
	// update
	//=============================================================================
	FilterManager.update = function (scene) {
		var keys = this._keys;
		var length = keys.length;
		for (var i = length - 1; i >= 0; i = (i - 1) | 0) {
			var data = this._data[keys[i]];
			if (data.animation) {
				this.updateFilterAnimation(data);
			}
			if (data.erase) {
				this.filterClear(keys[i]);
			}
		}

		for (const paramsInfo of this._updateParamsInMap) {
			if (paramsInfo.count > 0) {
				paramsInfo.count -= 1;
			}
		}
	};

	/* update filter parameters
	===================================*/
	FilterManager.filterUpdate = function (id, params) {
		var data = this._data[id];
		if (!data) return;

		this._filterUpdate(data.type, data.filter, params);
	};

	FilterManager.valueWithRate = function (target, current, rate) {
		if (rate === 1) return target;
		return current + (target - current) * rate;
	};


	FilterManager._filterUpdate = function (type, filter, params, rate = 1) {
		switch (type) {

			case 'adjustment':
				filter.gamma = this.valueWithRate(Number(params[0]), filter.gamma, rate);
				filter.saturation = this.valueWithRate(Number(params[1]), filter.saturation, rate);
				filter.contrast = this.valueWithRate(Number(params[2]), filter.contrast, rate);
				filter.brightness = this.valueWithRate(Number(params[3]), filter.brightness, rate);
				filter.red = this.valueWithRate(Number(params[4]), filter.red, rate);
				filter.green = this.valueWithRate(Number(params[5]), filter.green, rate);
				filter.blue = this.valueWithRate(Number(params[6]), filter.blue, rate);
				filter.alpha = this.valueWithRate(Number(params[7]), filter.alpha, rate);
				break;
			case 'bloom':
				filter.blur = this.valueWithRate(Number(params[0]), filter.blur, rate);
				filter.bloomScale = this.valueWithRate(Number(params[1]), filter.bloomScale, rate);
				filter.threshold = this.valueWithRate(Number(params[2]), filter.threshold, rate);
				filter.brightness = this.valueWithRate(Number(params[3]), filter.brightness, rate);
				break;
			case 'tiltshift':
				filter.blur = this.valueWithRate(Number(params[0]), filter.blur, rate);
				filter.gradientBlur = this.valueWithRate(Number(params[1]), filter.gradientBlur, rate);
				filter.start.y = filter.end.y = this.valueWithRate(Number(params[2]), filter.start.y, rate);
				if (isMZ) {
					filter.tiltShiftXFilter.uniforms.texSize.x = Graphics.width;
					filter.tiltShiftXFilter.uniforms.texSize.y = Graphics.height;
					filter.tiltShiftYFilter.uniforms.texSize.x = Graphics.width;
					filter.tiltShiftYFilter.uniforms.texSize.y = Graphics.height;
				}
				break;
			case 'vignette':
				filter.size = this.valueWithRate(Number(params[0]), filter.size, rate);
				filter.alpha = this.valueWithRate(Number(params[1]), filter.alpha, rate);
				filter.blur = this.valueWithRate(Number(params[2]), filter.blur, rate);
				break;
		}
	};

	FilterManager.currentParams = function (id) {
		var data = this._data[id];
		if (!data) return null;

		var type = data.type;
		var filter = data.filter;
		if (!filter) return null;

		switch (type) {
			case 'adjustment':
				return [
					filter.gamma,
					filter.saturation,
					filter.contrast,
					filter.brightness,
					filter.red,
					filter.green,
					filter.blue,
					filter.alpha
				];
			case 'bloom':
				return [
					filter.blur,
					filter.bloomScale,
					filter.threshold,
					filter.brightness,
				];
			case 'tiltshift':
				return [
					filter.blur,
					filter.gradientBlur,
					filter.start.y,
				];
			case 'vignette':
				return [
					filter.size,
					filter.alpha,
					filter.blur,
				];
			default:
				return [];
		}
	}


	FilterManager.filterEraseAfterAnimation = function (id) {
		var data = this._data[id];
		if (!data) return;
		data.eraseAfterMove = true;
	};

	FilterManager.filterAnimateLoop = function (id, duration, params, coeff) {
		this.filterAnimate(id, duration, params, coeff, false, true);
	};

	FilterManager.filterAnimateWait = function (id, duration) {
		this.filterAnimate(id, duration, null);
	};
	FilterManager.clearFilterAnimations = function (id) {
		var data = this._data[id];
		if (!data) return;
		data.animation = null;
	};

	FilterManager.filterAnimate = function (id, duration, params, coeff = 0.8, eraseAfterMove = false, loop = false) {
		var data = this._data[id];
		if (!data) return;

		data.eraseAfterMove = data.eraseAfterMove || eraseAfterMove;

		var animation = {
			d: duration || 1,
			total: duration || 1,
			coeff: coeff,
			params: params,
			animation: null,
			loop: loop,
		};

		var parent = data;
		while (parent.animation) {
			parent = parent.animation;
		}
		parent.animation = animation;

		if (parent === data) {
			this.updateFilterAnimation(data);
		}
		return animation;
	};

	FilterManager.tempFilterAnimationArr = [];
	FilterManager.updateFilterAnimation = function (data) {
		var animation = data.animation;

		var rate = animation.coeff === 1 ? 1 / (animation.d || 1) : 1 / Math.pow(animation.d, animation.coeff);

		if (animation.params) {
			this._filterUpdate(data.type, data.filter, animation.params, rate);
		}

		animation.d -= 1;
		if (animation.d <= 0) {
			data.animation = animation.animation;
			if (!data.animation && data.eraseAfterMove) {
				data.erase = true;
			}

			if (animation.loop) {
				var parent = data;
				while (parent.animation) {
					parent = parent.animation;
				}
				animation.d = animation.total;
				animation.animation = null;
				parent.animation = animation;
			}
		}
	};




	//=============================================================================
	// Map Filters
	//=============================================================================
	FilterManager.trySetupMapFilters = function (spriteset) {
		var commands = this.mapFilterCommandsBase();

		/* default
		===================================*/
		var defaultParams = parameters.defaultFilters;
		if (defaultParams) {
			overwriteFilterCommands(commands, defaultParams);
		}


		/* dataMap meta
		===================================*/
		var metaParams = ($dataMap && $dataMap.meta) ? $dataMap.meta[parameters.metaKey] : null;
		if (metaParams) {
			//apply default supply setting
			if (!supplyAdjustment) commands.adjustment = null;
			if (!supplyBloom) commands.bloom = null;
			if (!supplyTiltshift) commands.tiltshift = null;
			if (!supplyVignette) commands.vignette = null;


			/* check preset
			===================================*/
			metaParams = metaParams.trim();
			for (const preset of userPresets) {
				if (preset && preset.id === metaParams) {
					metaParams = preset.params;
					break;
				}
			}

			//read metaParams setttings
			overwriteFilterCommands(commands, metaParams);
		}

		spriteset.overwriteTrpMapFilterSettings(commands);

		/* apply limitMode
		===================================*/
		if (!ConfigManager[optionKey] && ConfigManager.trpMapFilterLimitTypes) {
			for (const type of ConfigManager.trpMapFilterLimitTypes) {
				if (commands[type]) {
					commands[type] = null;
				}
			}
		}


		/* apply filters
		===================================*/
		var keys = Object.keys(commands);
		var targetArg = 'baseSprite';
		var target = spriteset._baseSprite;
		for (const key of keys) {
			var command = commands[key];
			if (!command) continue;

			this.createFilterWithCommandString(command, targetArg, target);
		}



		/* apply update save data
		===================================*/
		var paramsInMap = this._updateParamsInMap;
		this._updateParamsInMap = [];
		for (const paramsInfo of paramsInMap) {
			var id = paramsInfo.id;
			var duration = paramsInfo.duration;
			var count = paramsInfo.count;
			var params = paramsInfo.params;
			if (id === '_MAP_FILTERS') {
				if (count <= 0) {
					this.updateMapFilters(params, 0, spriteset);
				} else {
					//once animate with src duration
					this.updateMapFilters(params, duration, spriteset);

					//update animation counts
					for (const id of FilterManager.mapFilterIds) {
						var filterData = this._data[id];
						if (!filterData && filterData.animation) continue;

						var animation = filterData.animation;
						while (animation.animation) {
							animation = animation.animation;
						}
						while (animation.d > count) {
							this.updateFilterAnimation(filterData);
						}
					}
				}
			}
		}
	};

	function overwriteFilterCommands(commands, params) {
		params = params.trim();
		params = params.replace('<' + parameters.metaKey + ':', '');
		if (params[params.length - 1] === '>') params = params.substring(0, params.length - 1);

		var settingArr = params.split(',');
		for (var command of settingArr) {
			command = command.trim();

			var key = command.split(' ')[0].trim();
			commands[key] = command;
		}
		return commands;
	}
	FilterManager.createFilterWithCommandString = function (command, targetArg, target) {
		var params = this.mapFilterParamsWithCommandString(command);

		var id = params.shift();
		var type;
		if (isNaN(params[0])) {
			type = params.shift();
		} else {
			type = id;
		}
		this.filterCreate(id, targetArg, type, target, params);
	};
	FilterManager.mapFilterParamsWithCommandString = function (command, trimTypeArg = false) {
		command = command.trim();

		var params = command.split(' ');
		for (var i = params.length - 1; i >= 0; i = (i - 1) | 0) {
			var arg = params[i].trim();
			if (!isNaN(arg)) {
				params[i] = Number(arg);
			} else {
				params[i] = arg;
			}
		}
		if (trimTypeArg) {
			if (isNaN(params[0])) {
				params.shift();
			}
		}
		return params;
	}



	//=============================================================================
	// Update MapFilter Params
	//=============================================================================
	FilterManager._updateParamsInMap = [];
	FilterManager.processCommandUpdate = function (args, interpreter) {
		var i = 1;
		var duration = Number(args[i++]) || 0;
		var paramsArr = args.slice(i);
		var params = '';
		for (const elem of paramsArr) {
			params += params ? ' ' : '';
			params += elem;
		}

		this.updateMapFilters(params, duration);
	};


	FilterManager.mapFilterIds = [
		'adjustment', 'bloom', 'tiltshift', 'vignette'
	];
	FilterManager.mapFilterCommandsBase = function () {
		var commands = {
			adjustment: null,
			bloom: null,
			tiltshift: null,
			vignette: null,
		};
		return commands;
	}

	FilterManager.updateMapFilters = function (params, duration = 0, sprset = this.activeSpriteset()) {
		if (!sprset) return;

		var commands = this.mapFilterCommandsBase();
		overwriteFilterCommands(commands, params);


		/* save params
		===================================*/
		for (const paramsInfo of this._updateParamsInMap) {
			paramsInfo.count = 0;
		};
		this._updateParamsInMap.push({
			id: '_MAP_FILTERS',
			duration,
			count: duration,
			params,
		});




		/* init non effect filters if not created
		===================================*/
		var keys = Object.keys(commands);
		var targetArg = 'baseSprite';
		var target = sprset._baseSprite;
		for (const key of keys) {
			var command = commands[key];
			if (!command) continue;

			var type = key;
			var id = key;
			if (this._data[id]) continue;

			if (!ConfigManager[optionKey] && ConfigManager.trpMapFilterLimitTypes) {
				if (ConfigManager.trpMapFilterLimitTypes.contains(type)) {
					continue;
				}
			}

			var params = this.mapFilterParamsWithCommandString(command, true);
			params = this.adjustMapFilterParamsToNonEffect(type, params);

			FilterManager.createFilterWithCommandString(command, targetArg, target);
		}


		/* update params
		===================================*/
		for (const key of keys) {
			var command = commands[key];
			var id = key;
			var type = key;
			var currentData = this._data[id];
			if (currentData) {
				currentData.animation = null;
			}

			var params = null;
			if (!command) {
				if (!currentData) continue;

				//erase animation
				var params = this.currentParams(id);
				if (!params) continue;

				params = this.adjustMapFilterParamsToNonEffect(type, params);
			} else {
				params = this.mapFilterParamsWithCommandString(command, true);
			}
			if (duration > 0) {
				this.filterAnimate(id, duration, params);
			} else {
				this.filterUpdate(id, params);
			}
		};



		/* sort map filters in command keys order
		===================================*/
		var filters = target.filters;
		var keysLen = this._keys.length;
		filters.sort((a, b) => {
			var idxA = -1;
			var idxB = -1;
			for (var i = keysLen - 1; i >= 0; i = (i - 1) | 0) {
				var key = this._keys[i];
				var data = this._data[key];
				if (data.filter === a) {
					idxA = keys.indexOf(data.id);
				} else if (data.filter === b) {
					idxB = keys.indexOf(data.id);
				}
			}

			if (idxA < 0 || idxB < 0) return 0;
			return idxA - idxB;
		});
		target.filters = filters;
	};

	FilterManager.adjustMapFilterParamsToNonEffect = function (type, params) {
		switch (type) {
			case 'adjustment':
				params = FilterManager.DEFAULT_PARAMS[type];
				break;
			case 'bloom':
				//scale -> 0.0
				params[1] = 0.0;
				break;
			case 'tiltshift':
				//blur -> 0.0
				params[0] = 0.0;
				break;
			case 'vignette':
				//size -> 0.0
				params[0] = 0.0;
				break;
		}
		return params;
	};

	/* save load
	===================================*/
	var _DataManager_makeSaveContents = DataManager.makeSaveContents;
	DataManager.makeSaveContents = function () {
		var contents = _DataManager_makeSaveContents.call(this, ...arguments);
		TRP_FilterManager.saveContents(contents);
		return contents;
	};
	var _DataManager_extractSaveContents = DataManager.extractSaveContents;
	DataManager.extractSaveContents = function (contents) {
		_DataManager_extractSaveContents.call(this, ...arguments);
		TRP_FilterManager.loadContents(contents);
	};
	var _DataManager_setupNewGame = DataManager.setupNewGame;
	DataManager.setupNewGame = function () {
		_DataManager_setupNewGame.call(this, ...arguments);
		TRP_FilterManager.onSetupNewGame();
	};

	TRP_FilterManager.onSetupNewGame = function () {
		this._updateParamsInMap = [];
	};
	TRP_FilterManager.saveContents = function (contents) {
		contents.trpMapFilters = this._updateParamsInMap;
	};
	TRP_FilterManager.loadContents = function (contents) {
		this._updateParamsInMap = contents.trpMapFilters || [];
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
			this.initTrpMapFilterOption();
		};
	};

	ConfigManager.initTrpMapFilterOption = function () {
		if (this[optionKey] !== undefined) return;
		if (Utils.isMobileDevice()) {
			this[optionKey] = optionValueOnMobileDevice || false;
		} else {
			this[optionKey] = false;
		}

		if (this.trpMapFilterLimitTypes === undefined) {
			this.trpMapFilterLimitTypes = limitTypes || null;
		}
	};

	ConfigManager.initTrpMapFilterOption();



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
	// Filter Editor
	//=============================================================================
	FilterManager.processCommandEdit = function () {
		var id1 = 'adjustment';
		FilterManager.filterCreate(id1, undefined);

		var id2 = 'bloom';
		FilterManager.filterCreate(id2, undefined);

		var id3 = 'tiltshift';
		FilterManager.filterCreate(id3, undefined);

		var id4 = 'vignette';
		FilterManager.filterCreate(id4, undefined);


		this._edit([id1, id2, id3, id4]);
	};


	if (!Utils.isOptionValid('test')) {
		FilterManager.edit = function () { };
		FilterManager._edit = function () { };
		return;
	}


	var _Dev = TRP_CORE.DevFuncs;


	/* shortcut
	===================================*/
	if (parameters.shortcutKey) (() => {
		var _SceneManager_onKeyDown = SceneManager.onKeyDown;
		SceneManager.onKeyDown = function (event) {
			if (event.ctrlKey || event.metaKey) {
				if (event.key === parameters.shortcutKey) {
					if (!_Dev.isAnyDevToolsBusy()) {
						FilterManager.processCommandEdit();
					}
				}
			}
			_SceneManager_onKeyDown.call(this, event);
		};
	})();



	FilterManager.edit = function (type = 'adjustment', id = type, resultFunc = false, completion = null) {
		if (arguments.length !== 0 || !FilterManager._data[id]) {
			FilterManager.filterCreate(id, undefined, type);
		}

		this._edit([id], resultFunc, completion);
	};


	//for sprite
	FilterManager._edit = function (ids, resultFunc = false, completion = null) {
		if (!Array.isArray(ids)) {
			ids = [ids];
		}

		var allData = [];
		for (const id of ids) {
			allData.push(FilterManager._data[id]);
		}

		try {
			Editor.start(allData, resultFunc, completion);
		} catch (e) {
			SoundManager.playBuzzer();
		}
	}
	FilterManager.filterEditAdjustment = FilterManager.edit.bind(FilterManager, 'adjustment');
	FilterManager.filterEditBloom = FilterManager.edit.bind(FilterManager, 'bloom');




	//=============================================================================
	// Editor
	//=============================================================================
	var Editor = FilterManager.Editor = function Editor() {
		this.initialize.apply(this, arguments);
	};

	var backspaceKey = Input.keyMapper[8] || 'backspace';
	Input.keyMapper[8] = backspaceKey;

	Editor._savedUpdate = null;
	Editor.isActive = false;

	Editor.start = function (filterDataArr, resultFunc, completion = null) {
		this.isActive = true;

		this._savedUpdate = SceneManager._scene.update;
		var editor = new Editor(filterDataArr, resultFunc, completion)
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
	Editor.prototype.initialize = function (filterDataArr, resultFunc = false, completion = null) {
		Sprite.prototype.initialize.call(this);
		this.initMembers();

		if (!Array.isArray(filterDataArr)) {
			filterDataArr = [filterDataArr];
		}

		this._filterDataArr = filterDataArr;
		this._allData = [];
		for (const filterData of filterDataArr) {
			var data = this.paramsOfFilterData(filterData);
			var dataKeys = Object.keys(data);
			this._allData.push({
				filterData,
				data,
				dataKeys,
			});
		}


		this._resultFunc = resultFunc;
		this._inputtingWords = '';
		this._completion = completion;

		SoundManager.playOk();

		this.registerKeyListeners();


		this.createSelectorSprite();
		this.createLines();
		for (const innerData of this._allData) {
			if (!innerData.filterData.filter.enabled) {
				this.setInnerDataFilterEnabled(innerData, false);
			}
		}

		this.prepareInputtingCandidates();

		_Dev.showText('filterEditHelp', [
			'←→：値の調整(+Shiftで微調整)',
			'Esc：現在のフィルターを初期化',
			ctrlKey + '+D：現在のフィルター無効化',
			ctrlKey + '+I：タイルセット画像書き出し',
			ctrlKey + '+W：編集終了&パラメータコピー',
		]);


		this._userPresetShortCuts = {};
		if (userPresets) {
			var texts = [];
			var shortcutKey = 1;
			for (const preset of userPresets) {
				if (!preset || !preset.id) continue;

				var text = ctrlKey + '+%1:「%2」'.format(shortcutKey, preset.id);
				texts.push(text);

				this._userPresetShortCuts[shortcutKey] = preset;

				if (shortcutKey === 0) break;
				shortcutKey += 1;
				if (shortcutKey >= 10) shortcutKey === 0
			}
			if (texts.length) {
				_Dev.showText('filterEditPresets', texts);
			}
		}
	};
	Editor.prototype.initMembers = function () {
		this.clearKeyDownListeneres();

		this._resultFunc = false;
		this._end = false;

		this._lastEditingIndex = -1;
		this._editingIndex = -1;

		this._filterDataArr = null;
		this._allData = null;

		this._parts = null;
		this._commands = null;

		this._inputtingWords = '';
		this._inputtingCandidates = null;
	};

	Editor.PARAMS_UNIT = {
		'adjustment': {
			gamma: 0.1,
			saturation: 0.1,
			contrast: 0.1,
			brightness: 0.1,
			red: 0.1,
			green: 0.1,
			blue: 0.1,
			alpha: 0.1,
		},
		'bloom': {
			blur: 1,
			bloomScale: 0.1,
			threshold: 0.1,
			brightness: 0.1,
		},
		'tiltshift': {
			blur: 10,
			gradientBlur: 100,
			start_y: 100,
		},
		'vignette': {
			size: 0.1,
			alpha: 0.1,
			blur: 0.1,
		},
	};

	Editor.prototype.paramsOfFilterData = function (filterData) {
		var filter = filterData.filter;
		switch (filterData.type.toLowerCase()) {
			case 'adjustment':
				return {
					gamma: filter.gamma,
					saturation: filter.saturation,
					contrast: filter.contrast,
					brightness: filter.brightness,
					red: filter.red,
					green: filter.green,
					blue: filter.blue,
					alpha: filter.alpha,
				}
			case 'bloom':
				return {
					blur: filter.blur,
					bloomScale: filter.bloomScale,
					threshold: filter.threshold,
					brightness: filter.brightness
				}
			case 'tiltshift':
				return {
					blur: filter.blur,
					gradientBlur: filter.gradientBlur,
					// start_x:filter.start.x,
					start_y: filter.start.y,
					// end_x:filter.end.x,
					// end_y:filter.end.y,
				};
			case 'vignette':
				return {
					size: filter.size,
					alpha: filter.alpha,
					blur: filter.blur,
				}
		}
		return null;
	};


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
		} else if (Input.isTriggered('cancel') && this._keyCode !== 96) {
			this.initCurrentFilterParams();
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

	Editor.prototype.initCurrentFilterParams = function () {
		var innerData = this.editingFilterInnerData();
		if (!innerData) return;

		if (!confirm('編集中のフィルターのパラメータをデフォ値に初期化しますか？')) {
			SoundManager.playCancel();
			return;
		}
		SoundManager.playOk();

		var type = innerData.filterData.type;
		var filter = innerData.filterData.filter;
		var params = FilterManager.DEFAULT_PARAMS[type]

		var defaultParams = parameters.defaultFilters;
		if (defaultParams) {
			var commands = {};
			overwriteFilterCommands(commands, defaultParams);
			if (commands[type]) {
				params = this.mapFilterParamsWithCommandString(commands[type], true);
			}
		}
		this.setFilterParams(innerData, params);

		var parts = this.editingParts();
		this.setPartsFilterEnabled(parts, true);
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

	Editor.prototype.editingFilterInnerData = function () {
		var parts = this.editingParts();
		if (!parts) return null;

		var data = parts._data;
		for (const innerData of this._allData) {
			if (innerData.data === data) {
				return innerData;
			}
		}
		return null;
	}

	Editor.prototype.addValue = function (rate) {
		var parts = this.editingParts()
		var innerData = this.editingFilterInnerData();
		if (!parts || !innerData) return;

		parts.addValue(rate);
	};


	Editor.prototype.end = function () {
		this._end = true;
		this.resignKeyListeners();

		var lines = this._parts;
		var length = lines.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var line = lines[i];
			line._filter = null;
		}


		//copy data
		var text = this.resultText();

		_Dev.copyToClipboard(text, true);
		_Dev.showTempText('clip', 'クリップボードにフィルター設定をコピー')
		SoundManager.playSave();

		_Dev.showText('filterEditHelp', null);
		_Dev.showText('filterEditPresets', null);
		_Dev.showText('filterEditTarget', null);


		if (this._completion) {
			this._completion(text);
			this._completion = null;
		}
	};
	Editor.prototype.resultText = function () {
		var text = '';
		var dataLen = this._allData.length;
		for (var di = 0; di < dataLen; di = (di + 1) | 0) {
			var innerData = this._allData[di];
			var filterData = innerData.filterData;
			if (!filterData.filter.enabled) continue;

			var data = innerData.data;
			var keys = innerData.dataKeys;
			if (text) {
				text += ',';
			}
			text += filterData.type + ' ';

			var length = keys.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var key = keys[i];
				if (i > 0) text += ' ';
				text += data[key];
			}
		}
		return '<%1:%2>'.format(parameters.metaKey, text);
	};

	Editor.prototype.startEditing = function (index) {
		if (index < 0) return;

		if (this._editingIndex === index) return;
		SoundManager.playCursor();

		_Dev.showText('filterEditTarget', ' ');

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
			if (event.key === 'd') {
				this.switchCurrentFilterEnabled();
				SoundManager.playCursor();
			} else if (event.key === 'i') {
				this.trySaveTilesetImage();
			} else if (event.key === 'g') {
				if (this.alpha === 1) {
					this.alpha = 0.25;
				} else {
					this.alpha = 1;
				}
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


	/* save tileset image
	===================================*/
	Editor.prototype.trySaveTilesetImage = function () {
		var filter = null;
		var adjustmentInnerData = null;
		for (const innerData of this._allData) {
			if (innerData.filterData.type === 'adjustment') {
				adjustmentInnerData = innerData;
				filter = innerData.filterData.filter;
				break;
			}
		}
		if (!filter) return;

		var bitmaps = SceneManager._scene._spriteset._tilemap._bitmaps;
		if (!bitmaps) return;

		if (!filter.enabled) {
			SoundManager.playBuzzer();
			_Dev.showTempAlert('「色補正」フィルターが無効です。');
			return;
		}

		if (!confirm('「色補正」を適用したタイルセット画像をプロジェクトフォルダに書き出しますか？')) {
			SoundManager.playCancel();
			return
		}

		for (const bitmap of bitmaps) {
			if (!bitmap) continue;

			var fileName = TRP_CORE.last(bitmap._url.split('/'));
			if (!fileName || (bitmap.width === 1 && bitmap.height === 1)) continue;

			var sprite = new Sprite();
			sprite.filters = [filter];
			sprite.bitmap = bitmap;
			sprite.setFrame(0, 0, bitmap.width, bitmap.height);
			_Dev.saveSpriteImage(sprite, fileName);
		}

		_Dev.showTempAlert('タイルセット画像を書き出しました！',);
		SoundManager.playSave();

		this.setInnerDataFilterEnabled(adjustmentInnerData, false);
	};


	/* User Preset
	===================================*/
	Editor.prototype.tryLoadUserPreset = function (key) {
		var preset = this._userPresetShortCuts ? this._userPresetShortCuts[key] : null;
		if (!preset) {
			SoundManager.playBuzzer();
			return;
		}

		var commands = {};
		overwriteFilterCommands(commands, preset.params);

		SoundManager.playLoad();
		_Dev.showTempAlert('プリセット「%1」読み込み完了！'.format(preset.id));

		for (const innerData of this._allData) {
			var filterData = innerData.filterData;
			var type = filterData.type;

			var command = commands[type];
			var enabled = !!command;

			this.setInnerDataFilterEnabled(innerData, enabled);
			if (!enabled) continue;

			var params = FilterManager.mapFilterParamsWithCommandString(command, true);
			this.setFilterParams(innerData, params);
		}
	}


	Editor.prototype.setInnerDataFilterEnabled = function (innerData, enabled = true) {
		innerData.filterData.filter.enabled = enabled;

		var targetData = innerData.data;
		for (const parts of this._parts) {
			if (parts._data === targetData) {
				parts.alpha = enabled ? 1 : 0.25;
			}
		}
	};

	Editor.prototype.setPartsFilterEnabled = function (parts, enabled = true) {
		if (!parts) return;

		var targetData = null;
		for (const innerData of this._allData) {
			if (innerData.data === parts._data) {
				this.setInnerDataFilterEnabled(innerData, enabled);
				return;
			}
		}
	};

	Editor.prototype.switchCurrentFilterEnabled = function () {
		var parts = this.editingParts();
		if (!parts) return;

		for (const innerData of this._allData) {
			if (innerData.data === parts._data) {
				this.setInnerDataFilterEnabled(innerData, !innerData.filterData.filter.enabled);
				return;
			}
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


		this._allData.some(innerData => {
			if (innerData.data === parts._data) {
				Editor.showFilterTypeNameHelp(innerData.filterData.type)
				return true;
			}
			return false;
		})
	};
	Editor.showFilterTypeNameHelp = function (type) {
		if ($gameSystem.isJapanese()) {
			type = Editor.filterJapaneseName(type);
		}
		var text = '[フィルター:%1]'.format(type);
		_Dev.showText('filterEditTarget', text, 'rgb(200,255,255)');

	};
	Editor.filterJapaneseName = function (type) {
		switch (type.toLowerCase()) {
			case 'adjustment':
				return '色補正';
			case 'bloom':
				return 'ブルーム';
			case 'tiltshift':
				return 'チルトシフト';
			case 'vignette':
				return 'ヴィネット';
			default:
				return type;
		}
	}


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

		for (const innerData of this._allData) {
			if (this._parts.length > 0) {
				y += categoryMargin;
			}

			var keys = innerData.dataKeys;
			var data = innerData.data;
			var filterData = innerData.filterData;

			var length = keys.length;
			for (var i = 0; i < length; i = (i + 1) | 0) {
				var key = keys[i];
				var line = new EditorLine(key, data, filterData.filter, filterData.type);
				line.y = y;
				line.refresh();

				this._parts.push(line);
				this._commands.push(key.toUpperCase());

				this.addChild(line);

				y += lineH;
			}
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
	EditorLine.prototype.initialize = function (key, data, filter, filterType) {
		PIXI.Container.call(this);
		this.width = Graphics.width;
		this.height = Graphics.height;

		this._filter = filter;
		this._key = key;
		this._data = data;
		this._filterType = filterType;

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
			case "gamma": return "ガンマ";
			case "saturation": return "彩度";
			case "contrast": return "コントラスト";
			case "brightness": return "明るさ";
			case "red": return "赤";
			case "green": return "緑";
			case "blue": return "青";
			case "alpha": return "アルファ";

			case "blur": return "ぼかし";
			case "bloomScale": return "スケール";
			case "threshold": return "しきい値";
			case "brightness": return "明るさ";

			case "gradientBlur": return "グラデ幅";
			case "start_y": return "Y座標";

			case 'size': return "サイズ";
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
		var unit = Editor.PARAMS_UNIT[this._filterType][this._key] || 0.1;
		var value = this.value();
		value += unit * rate;
		value = Math.round(value / unit * 10) * unit / 10 + 0.000000001;

		this.setValue(value);
	};

	EditorLine.prototype.setValue = function (value) {
		if (Math.abs(value) <= 0.000001) value = 0;

		var unit = Editor.PARAMS_UNIT[this._filterType][this._key] || 0.1;
		var decimal = TRP_CORE.decimal(unit) + 1;
		this._inputting = TRP_CORE.withDecimal(value, decimal);

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
		var obj = this._filter;
		var length = keys.length;

		if (key === 'start_y') {
			obj.end.y = value;
		}
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var key = keys[i];
			if (i < length - 1) {
				obj = obj[key];
			} else {
				obj[key] = value;
			}
		}
		// this._filter[this._key] = value;

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