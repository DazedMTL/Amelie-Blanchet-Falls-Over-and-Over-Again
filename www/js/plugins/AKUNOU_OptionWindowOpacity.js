//=============================================================================
// AKUNOU_OptionWindowOpacity.js
// Version: 1.01
// ----------------------------------------------------------------------------
// 河原 つつみ
// 連絡先 ：『アクマの脳髄』http://www.akunou.com/
//=============================================================================

/*:
 * @plugindesc オプションにウィンドウ透明度の変更を追加します。
 * 動作には同作者のオプションベーススクリプトが必須です。
 * @author Tsutumi Kawahara
 *
 * @param Window Opacity Term
 * @desc ウィンドウ透明度のオプション画面での表示名を変更します。
 * @default ウィンドウ透明度
 *
 * @param Window Opacity Offset
 * @desc ウィンドウ透明度のオフセット値。
 * @default 1
 *
 * @param Window Opacity Default
 * @desc ウィンドウ透明度のデフォルト値。
 * 0～255の間で設定して下さい。
 * @default 192
 *
 * @help
 * プラグインコマンド:
 *   必要なし
 * プラグイン ON にするだけで適用されるスクリプトです。
 */

(function () {

	var parameters = PluginManager.parameters('AKUNOU_OptionWindowOpacity');
	var windowOpacityText = parameters['Window Opacity Term'];
	var windowOpacityOffset = Number(parameters['Window Opacity Offset']);
	var windowOpacityDefault = Number(parameters['Window Opacity Default']);

	//-------------------------------------------------------------------------
	// ConfigManager
	//-------------------------------------------------------------------------

	ConfigManager.windowOpacityHex = windowOpacityDefault;

	var akunou6_makeExtraData = ConfigManager.makeExtraData;

	ConfigManager.makeExtraData = function (config) {
		akunou6_makeExtraData.call(this, config);
		config.windowOpacityHex = this.windowOpacityHex;
		return config;
	};

	var akunou6_applyData = ConfigManager.applyData;

	ConfigManager.applyData = function (config) {
		akunou6_applyData.call(this, config);
		this.windowOpacityHex = this.readWindowOpacity(config, 'windowOpacityHex');
	};

	ConfigManager.readWindowOpacity = function (config, name) {
		var value = config[name];
		if (value !== undefined) {
			return Number(value).clamp(0, 255);
		} else {
			return windowOpacityDefault;
		}
	};

	//-------------------------------------------------------------------------
	// Window_Base
	//-------------------------------------------------------------------------

	Window_Base.prototype.standardBackOpacity = function () {
		return ConfigManager['windowOpacityHex'];
	};

	//-------------------------------------------------------------------------
	// Window_Options
	//-------------------------------------------------------------------------

	var akunou6_addExtraOptions = Window_Options.prototype.addExtraOptions;

	Window_Options.prototype.addExtraOptions = function () {
		this.addCommand(windowOpacityText, 'windowOpacityHex');
		akunou6_addExtraOptions.call(this);
	};

	Window_Options.prototype.opacityOffset = function () {
		if (windowOpacityOffset <= 0) {
			return 1;
		}
		return windowOpacityOffset;
	};

	var akunou6_setConfigValue = Window_Options.prototype.setConfigValue;

	Window_Options.prototype.setConfigValue = function (symbol, volume) {
		akunou6_setConfigValue.call(this, symbol, volume);
		this.updateBackOpacity();
	};

	var akunou6_defaultAll = Window_Options.prototype.defaultAll;

	Window_Options.prototype.defaultAll = function () {
		akunou6_defaultAll.call(this);
		this.changeValue('windowOpacityHex', windowOpacityDefault);
	};

})();
