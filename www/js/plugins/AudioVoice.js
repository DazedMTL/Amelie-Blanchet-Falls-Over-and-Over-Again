/*:ja
 * @plugindesc RPGツクールMVに別途音声用の再生機能補助を追加します。
 * @author 黒崎 綾人
 * 
 *
 * @help このプラグインより上に、VCData.jsを設定してください。
 * それが済めば入れておくだけで音声動作を補助します。
 * 音声を再生するには、別途各種ボイスプラグインが必要です。
 * 
 * 【このプラグインの機能を有効にする他のプラグイン】
 * BasicBattleVoice.js
 * BasicMapVoice.js
 * 
 * 【独立音声オーディオ（本プラグイン）について】
 * 基本構造は、RPGツクールMVのAudioManagerと同様です。
 * ストップ指令である、各種音源停止にシンクロしていないため、
 * 独自のstopVcを呼び出さない限り、音声は終始まで再生します。
 * ＭＡＰ音声の場合は、
 * 次の音声を読み込む時に前の音声を停止する仕様に構成されています。
 * 戦闘の場合は、重複再生のままです。
 * 
 * 【イベントコマンドスクリプトから呼び出す場合】
 * MAP・BATTLEの二つに分けられますが、標準で再生する場合は
 * スクリプトに以下のように書き込んでください。
 * Map音声の再生＞＞※拡張子は入れないでください。
 * var obj = {"name":"FileName","pan":0,"pitch":100,"volume":100};
 * var folder = "FolderName"
 * AudioVoice.playVc(obj,folder);
 * 
 * Battle音声の再生＞＞※拡張子は入れないでください。
 * 再生したいアクション音声ファイル名等を指定します。
 * var obj = {"name":"attack1","pan":0,"pitch":100,"volume":100};
 * 
 * 続いて、アクション音声を再生したいアクターを指定します。
 * 以下の表記の場合、アクター１番のキャラを参照します。
 * var Subject = $gameActors.actor(1);
 * 
 * 音声を再生します。
 * AudioVoice.playbattleVc(obj,Subject);
 * 
 * 以下をコピーして貼り付けて $gameActors.actor(n) に好きなキャラ番号を入れるといいでしょう。
 * var obj = {"name":"attack1","pan":0,"pitch":100,"volume":100};
 * var Subject = $gameActors.actor(n);
 * AudioVoice.playbattleVc(obj,Subject);
 */

//-----------------------------------------------------------------------------
// AudioVoice
//-----------------------------------------------------------------------------

function AudioVoice() {
    throw new Error('This is a static class');
}

AudioVoice._vcVolume = 100;
AudioVoice._vcBuffers = [];
AudioVoice._staticBuffers = [];
AudioVoice._charaBuffers = [];
AudioVoice._charaObj = null;
AudioVoice._path = 'audio/';
AudioVoice._Plugpath = 'audio/voice/'
AudioVoice._blobUrl = null;

Object.defineProperty(AudioVoice, 'vcVolume', {
    get: function () {
        return this._vcVolume;
    },
    set: function (value) {
        this._vcVolume = value;
    },
    configurable: true
});

AudioVoice.playVc = function (vc, folder) {
    if (!ConfigManager.Voice) {
        return
    }
    if (vc.name) {
        this._vcBuffers = this._vcBuffers.filter(function (audio) {
            return audio.isPlaying();
        });
        var buffer = this.createBuffer(folder, vc.name);
        this.updateVcParameters(buffer, vc);
        buffer.play(false);
        this._vcBuffers.push(buffer);
    }
};

AudioVoice.playbattleVc = function (vc, chara) {
    if (!ConfigManager.battleVoice) {
        return
    }
    this._charaObj = chara;
    if (vc.name) {
        this._vcBuffers = this._vcBuffers.filter(function (audio) {
            return audio.isPlaying();
        });
        if (chara.isActor()) {
            var actorid = chara.actorId();
            var buffer = this.createBuffer('voice/actor0' + String(actorid), vc.name);
            this.updateVcParameters(buffer, vc);
            buffer.play(false);
            this._vcBuffers.push(buffer);
        } else {
            var enemyid = chara.enemyId();
            var buffer = this.createBuffer('voice/enemy0' + String(enemyid), vc.name);
            this.updateVcParameters(buffer, vc);
            buffer.play(false);
            this._vcBuffers.push(buffer);
        }
    }
};

AudioVoice.explaybattleVc = function (vc, chara, addstr) {
    if (!ConfigManager.battleVoice) {
        return
    }
    this._charaObj = chara;
    if (vc.name) {
        this._vcBuffers = this._vcBuffers.filter(function (audio) {
            return audio.isPlaying();
        });
        if (chara.isActor()) {
            var actorid = chara.actorId();
            var buffer = this.createBuffer('voice/actor0' + String(actorid),
                vc.name + addstr);
            this.updateVcParameters(buffer, vc);
            buffer.play(false);
            this._vcBuffers.push(buffer);
        } else {
            var enemyid = chara.enemyId();
            var buffer = this.createBuffer('voice/enemy0' + String(enemyid),
                vc.name + addstr);
            this.updateVcParameters(buffer, vc);
            buffer.play(false);
            this._vcBuffers.push(buffer);
        }
    }
};

AudioVoice.updateVcParameters = function (buffer, vc) {
    this.updateBufferParameters(buffer, this._vcVolume, vc);
};

AudioVoice.stopVc = function () {
    this._vcBuffers.forEach(function (buffer) {
        buffer.stop();
    });
    this._vcBuffers = [];
};

AudioVoice.playStaticVc = function (vc) {
    if (vc.name) {
        this.loadStaticSe(vc);
        for (var i = 0; i < this._staticBuffers.length; i++) {
            var buffer = this._staticBuffers[i];
            if (buffer._reservedVcName === vc.name) {
                buffer.stop();
                this.updateVcParameters(buffer, vc);
                buffer.play(false);
                break;
            }
        }
    }
};

AudioVoice.loadStaticVc = function (vc) {
    if (vc.name && !this.isStaticVc(vc)) {
        var buffer = this.createBuffer('voice', vc.name);
        buffer._reservedVcName = vc.name;
        this._staticBuffers.push(buffer);
        if (this.shouldUseHtml5Audio()) {
            Html5Audio.setStaticSe(buffer._url);
        }
    }
};

AudioVoice.isStaticVc = function (vc) {
    for (var i = 0; i < this._staticBuffers.length; i++) {
        var buffer = this._staticBuffers[i];
        if (buffer._reservedVcName === vc.name) {
            return true;
        }
    }
    return false;
};

AudioVoice.stopAll = function () {
    this.stopVc();
};

AudioVoice.makeEmptyAudioObject = function () {
    return { name: '', volume: 0, pitch: 0 };
};

AudioVoice.createBuffer = function (folder, name) {
    var ext = this.audioFileExt();
    var url = this._path + folder + '/' + encodeURIComponent(name) + ext;
    if (this.shouldUseHtml5Audio() && folder === 'bgm') {
        if (this._blobUrl) Html5Audio.setup(this._blobUrl);
        else Html5Audio.setup(url);
        return Html5Audio;
    } else {
        return new WebAudio(url);
    }
};

AudioVoice.updateBufferParameters = function (buffer, configVolume, audio) {
    if (buffer && audio) {
        buffer.volume = configVolume * (audio.volume || 0) / 10000;
        buffer.pitch = (audio.pitch || 0) / 100;
        buffer.pan = (audio.pan || 0) / 100;
    }
};

AudioVoice.audioFileExt = function () {
    if (WebAudio.canPlayOgg() && !Utils.isMobileDevice()) {
        return '.ogg';
    } else {
        return '.m4a';
    }
};

AudioVoice.shouldUseHtml5Audio = function () {
    return Utils.isAndroidChrome() && !Decrypter.hasEncryptedAudio;
};

AudioVoice.checkErrors = function () {
    this._vcBuffers.forEach(function (buffer) {
        this.checkWebAudioError(buffer);
    }.bind(this));
    this._staticBuffers.forEach(function (buffer) {
        this.checkWebAudioError(buffer);
    }.bind(this));
};

AudioVoice.checkWebAudioError = function (webAudio) {
    if (webAudio && webAudio.isError()) {
        throw new Error('Failed to load: ' + webAudio.url);
    }
};
