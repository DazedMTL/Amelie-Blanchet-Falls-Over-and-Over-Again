//=============================================================================
// Escape100.js
//=============================================================================
/*:
 * @plugindesc 逃げる成功率を100%にする
 * @author みこと
 * 
 * @param escapeSwitche
 * @desc 逃げる成功率を100%にするスイッチの番号
 * @default 10
 * 
 * @help 指定のスイッチがONになっている間、戦闘コマンド『逃げる』を必ず成功させます。
 * ただしバトルの処理で『逃走可能』にチェックが入っていない場合は逃げられません。
 * 
 * このプラグインには、プラグインコマンドはありません。
 */

(function () {
    var parameters = PluginManager.parameters('Escape100');
    BattleManager.processEscape = function () {
        $gameParty.performEscape();
        SoundManager.playEscape();
        var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
        if (success || $gameSwitches.value(parameters['escapeSwitche'])) {
            this.displayEscapeSuccessMessage();
            this._escaped = true;
            this.processAbort();
        } else {
            this.displayEscapeFailureMessage();
            this._escapeRatio += 0.1;
            $gameParty.clearActions();
            this.startTurn();
        }
        return success;
    };
})();
