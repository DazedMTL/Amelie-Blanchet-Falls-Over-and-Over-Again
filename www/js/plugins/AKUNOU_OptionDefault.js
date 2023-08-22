//=============================================================================
// AKUNOU_OptionDefault.js
// Version: 1.00
// ----------------------------------------------------------------------------
// 河原 つつみ
// 連絡先 ：『アクマの脳髄』http://www.akunou.com/
//=============================================================================

/*:
 * @plugindesc オプションにデフォルトに戻すコマンドを追加します。
 * 動作には同作者のオプションベーススクリプトが必須です。
 * @author Tsutumi Kawahara
 *
 * @param Default Term
 * @desc デフォルトに戻すコマンドのオプション画面での表示名を変更します。
 * @default 全て初期値に戻す
 *
 * @param Always Dash Default
 * @desc 常時ダッシュのデフォルト値。
 * 0でOFF、1でON
 * @default 0
 *
 * @param Command Remember Default
 * @desc コマンド記憶のデフォルト値。
 * 0でOFF、1でON
 * @default 0
 *
 * @param Bgm Volume Default
 * @desc BGM 音量のデフォルト値。
 * @default 80
 *
 * @param Bgs Volume Default
 * @desc BGS 音量のデフォルト値。
 * @default 90
 *
 * @param Me Volume Default
 * @desc ME 音量のデフォルト値。
 * @default 80
 *
 * @param Se Volume Default
 * @desc SE 音量のデフォルト値。
 * @default 100
 *
 * @help
 * プラグインコマンド:
 *   必要なし
 * プラグイン ON にするだけで適用されるスクリプトです。
 */

(function () {

	var parameters = PluginManager.parameters('AKUNOU_OptionDefault');
	var defaultText = parameters['Default Term'];
	var alwaysDashDefault = Boolean(Number(parameters['Always Dash Default']));
	var commandRememberDefault = Boolean(Number(parameters['Command Remember Default']));
	var bgmVolumeDefault = Number(parameters['Bgm Volume Default']);
	var bgsVolumeDefault = Number(parameters['Bgs Volume Default']);
	var meVolumeDefault = Number(parameters['Me Volume Default']);
	var seVolumeDefault = Number(parameters['Se Volume Default']);

	//-------------------------------------------------------------------------
	// ConfigManager
	//-------------------------------------------------------------------------

	ConfigManager.readFlag = function (config, name) {
		var value = config[name];
		if (value !== undefined) {
			return !!config[name];
		} else {
			if (name === 'alwaysDash') {
				return alwaysDashDefault;
			} else if (name === 'commandRemember') {
				return commandRememberDefault;
			} else {
				return false;
			}
		}
	};

	ConfigManager.readVolume = function (config, name) {
		var value = config[name];
		if (value !== undefined) {
			return Number(value).clamp(0, 100);
		} else {
			if (name === 'bgmVolume') {
				return bgmVolumeDefault;
			} else if (name === 'bgsVolume') {
				return bgsVolumeDefault;
			} else if (name === 'meVolume') {
				return meVolumeDefault;
			} else if (name === 'seVolume') {
				return seVolumeDefault;
			} else {
				return 100;
			}
		}
	};

	//-------------------------------------------------------------------------
	// Window_Options
	//-------------------------------------------------------------------------

	var akunou7_makeCommandList = Window_Options.prototype.makeCommandList;

	Window_Options.prototype.makeCommandList = function () {
		akunou7_makeCommandList.call(this);
		this.addDefaultOptions();
	}

	Window_Options.prototype.addDefaultOptions = function () {
		this.addCommand(defaultText, 'default');
	};

	var akunou7_drawItem = Window_Options.prototype.drawItem;

	Window_Options.prototype.drawItem = function (index) {
		var symbol = this.commandSymbol(index);
		if (this.isDefaultSymbol(symbol)) {
			var rect = this.itemRectForText(index);
			this.resetTextColor();
			this.changePaintOpacity(this.isCommandEnabled(index));
			this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
		} else {
			akunou7_drawItem.call(this, index);
		}
	};

	Window_Options.prototype.defaultAll = function () {
		this.changeValue('alwaysDash', alwaysDashDefault);
		this.changeValue('commandRemember', commandRememberDefault);
		this.changeValue('bgmVolume', bgmVolumeDefault);
		this.changeValue('bgsVolume', bgsVolumeDefault);
		this.changeValue('meVolume', meVolumeDefault);
		this.changeValue('seVolume', seVolumeDefault);
	};

})();
