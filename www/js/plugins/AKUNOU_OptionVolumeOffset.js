//=============================================================================
// AKUNOU_OptionVolumeOffset.js
// Version: 1.02
// ----------------------------------------------------------------------------
// 河原 つつみ
// 連絡先 ：『アクマの脳髄』http://www.akunou.com/
//=============================================================================

/*:
 * @plugindesc オプションのボリューム設定の値の幅を設定できます。
 * @author Tsutumi Kawahara
 *
 * @param Offset
 * @desc ボリュームのオフセット値。MV本体のデフォルトは20。
 * オプションベースを入れない場合、100を割り切れる数値にして下さい。
 * @default 1
 *
 * @help
 * プラグインコマンド:
 *   必要なし
 * プラグイン ON にするだけで適用されるスクリプトです。
 */

(function () {

	var parameters = PluginManager.parameters('AKUNOU_OptionVolumeOffset');
	var offset = Number(parameters['Offset'] || 1);

	//-------------------------------------------------------------------------
	// Window_Options
	//-------------------------------------------------------------------------

	Window_Options.prototype.volumeOffset = function () {
		if (offset <= 0) {
			return 1;
		}
		return offset;
	};

})();
