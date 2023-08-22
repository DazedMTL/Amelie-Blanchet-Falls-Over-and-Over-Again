/*:ja
 * @plugindesc 会話音声を文章中のコードから拾う機能を追加します。
 * @author 黒崎 綾人
 * 
 * @param AutoVolumeset
 * @desc 音声再生前に自動で音量を調整します。
 * ON / true    OFF / false
 * @default true
 * 
 * @param Setbgmvolume
 * @desc AutoVolumeが実行された場合の音量規定値。
 * 規定値：20
 * @default 20
 * 
 * @param AutoVolumesetather
 * @desc 音声再生の制御文字\zを含まない文章はBGM音量を元に戻す。
 * 戻す / true    メッセージ中は常に規定値演奏 / false
 * @default true
 * 
 * @help ゲームフォルダ内のdataに MapVoice.json を入れて使用ください。
 * ファイル名の詳細な書き換えは上記のjsonファイル内部を書き換えるか加筆してください。
 * プラグインの改造は直接このプラグインを書き換えてください。
 * 
 *  【このプラグインを使うのに必要な必須プラグイン】
 * VCData.js
 * AudioVoice.js
 * 
 * 文章入力時に使用する制御文字を追加します。
 * \m ： audioフォルダで管理する番号フォルダを参照する。
 * \z : \mで参照したフォルダから再生するファイル番号を参照する。
 * 
 * 例＞＞
 * \m[1]\z[0]
 * 上記を入力した場合、コードを読み込んだところから、
 * audio/001/0001を参照します。
 * 指定できるaudio/xxx/xxxxの x 部分は現在半角数字のみ対応しています。
 * 
 * 具体的な使用例＞＞
 * 農家のおっさん\m[5]\z[0]
 * 「いよう！\c[4]シラード\c[0]！
 * 相変わらず定職にもつかず暇人してるのかい？」
 * 
 * 上記の場合、audio/005/0001を読み込み再生します。
 * 
 * 【補足】
 * MapVoice.json に定義される一つのフォルダから参照できる最大ファイル数は
 * １６０個までです。
 * １キャラ辺り、上限を増やす場合は、MapVoice.json に加筆していく必要があります。
*/

function Volume_Back() {
    throw new Error('This is a static class');
}

Volume_Back.Volume = 0;

(function () {

    var parameters = PluginManager.parameters('BasicMapVoice');
    var AutoVolumeset = JSON.parse(parameters['AutoVolumeset']);
    var Setbgmvolume = JSON.parse(parameters['Setbgmvolume']);
    var AutoVolumesetather = JSON.parse(parameters['AutoVolumesetather']);

    Game_Interpreter.prototype.executeCommand = function () {
        var command = this.currentCommand();
        if (command && command.code != 101 && AutoVolumeset && Volume_Back.Volume != 0) {
            AudioManager.bgmVolume = Volume_Back.Volume;
            AudioManager.updateBgmParameters(AudioManager._currentBgm);
            Volume_Back.Volume = 0;
        }
        if (command) {
            this._params = command.parameters;
            this._indent = command.indent;
            var methodName = 'command' + command.code;
            if (typeof this[methodName] === 'function') {
                if (!this[methodName]()) {
                    return false;
                }
            }
            this._index++;
        } else {
            this.terminate();
        }
        return true;
    };

    Window_Base.prototype.convertEscapeCharacters = function (text) {
        this._Memory = -1;
        this._playNum = -1;
        if (!text.match(/\z/i) && AutoVolumeset && AutoVolumesetather && Volume_Back.Volume != 0) {
            AudioManager.bgmVolume = Volume_Back.Volume;
            AudioManager.updateBgmParameters(AudioManager._currentBgm);
            Volume_Back.Volume = 0;
        }
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        text = text.replace(/\x1bV\[(\d+)\]/gi, function () {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bV\[(\d+)\]/gi, function () {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bN\[(\d+)\]/gi, function () {
            return this.actorName(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bP\[(\d+)\]/gi, function () {
            return this.partyMemberName(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bM\[(\d+)\]/gi, function () {
            AudioVoice.stopVc();
            this._Memory = parseInt(arguments[1]).toString(10).padZero(3);
            return ""
        }.bind(this));
        text = text.replace(/\x1bZ\[(\d+)\]/gi, function () {
            this._playNum = $datamapvoice.voices[parseInt(arguments[1])];
            if (AutoVolumeset && Volume_Back.Volume == 0) {
                Volume_Back.Volume = AudioManager.bgmVolume;
                AudioManager.bgmVolume = Setbgmvolume;
                AudioManager.updateBgmParameters(AudioManager._currentBgm);
            }
            AudioVoice.playVc(this._playNum, this._Memory);
            return ""
        }.bind(this));
        text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
        return text;
    };

    var _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
    Window_Message.prototype.isTriggered = function () {

        return _Window_Message_isTriggered.call(this)
    };


    var _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        if (!$gameParty.inBattle()) {
            AudioVoice.stopVc();
        }

        _Window_Message_terminateMessage.call(this)
    };



})();
