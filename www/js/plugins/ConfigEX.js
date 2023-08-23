/*:ja
 * @plugindesc 標準コマンドのオプションに音声関連の項目を追加します。
 * @author 黒崎 綾人
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * 入れておくだけでタイトル、メニューのオプションコマンドに
 * 会話音声、戦闘音声の有無や音量調節が追加されます。
 * 
 * 【このプラグインを入れた場合に影響を受ける他のプラグイン】
 * AudioVoice.js
 * 
 * ※他のコンフィグプラグインと併用すると、
 * 競合する可能性が極めて高まります。
 */


//-----------------------------------------------------------------------------
// ConfigManager
//
// The static class that manages the configuration data.

AudioManager._bgmVolume = 60;

function ConfigManager() {
    throw new Error('This is a static class');
}

ConfigManager.alwaysDash = false;
ConfigManager.commandRemember = false;
ConfigManager.Voice = true;
ConfigManager.battleVoice = true;

Object.defineProperty(ConfigManager, 'bgmVolume', {
    get: function () {
        return AudioManager._bgmVolume;
    },
    set: function (value) {
        AudioManager.bgmVolume = value;
        AudioManager.updateBgmParameters(AudioManager._currentBgm);
    },
    configurable: true
});

Object.defineProperty(ConfigManager, 'bgsVolume', {
    get: function () {
        return AudioManager.bgsVolume;
    },
    set: function (value) {
        AudioManager.bgsVolume = value;
        AudioManager.updateBgsParameters(AudioManager._currentBgs);
    },
    configurable: true
});

Object.defineProperty(ConfigManager, 'meVolume', {
    get: function () {
        return AudioManager.meVolume;
    },
    set: function (value) {
        AudioManager.meVolume = value;
        AudioManager.updateMeParameters(AudioManager._currentMe);
    },
    configurable: true
});

Object.defineProperty(ConfigManager, 'seVolume', {
    get: function () {
        return AudioManager.seVolume;
    },
    set: function (value) {
        AudioManager.seVolume = value;
    },
    configurable: true
});

Object.defineProperty(ConfigManager, 'vcVolume', {
    get: function () {
        return AudioVoice.vcVolume;
    },
    set: function (value) {
        AudioVoice.vcVolume = value;
    },
    configurable: true
});


ConfigManager.load = function () {
    var json;
    var config = {};
    try {
        json = StorageManager.load(-1);
    } catch (e) {
        console.error(e);
    }
    if (json) {
        config = JSON.parse(json);
    }
    this.applyData(config);
};

ConfigManager.save = function () {
    StorageManager.save(-1, JSON.stringify(this.makeData()));
};

ConfigManager.makeData = function () {
    var config = {};
    config.alwaysDash = this.alwaysDash;
    config.commandRemember = this.commandRemember;
    config.Voice = this.Voice
    config.battleVoice = this.battleVoice
    config.bgmVolume = this.bgmVolume;
    config.bgsVolume = this.bgsVolume;
    config.meVolume = this.meVolume;
    config.seVolume = this.seVolume;
    config.vcVolume = this.vcVolume;
    return config;
};

ConfigManager.applyData = function (config) {
    this.alwaysDash = this.readFlag(config, 'alwaysDash');
    this.commandRemember = this.readFlag(config, 'commandRemember');
    this.Voice = this.readFlag(config, 'Voice');
    this.battleVoice = this.readFlag(config, 'battleVoice');
    this.bgmVolume = this.readVolume(config, 'bgmVolume');
    this.bgsVolume = this.readVolume(config, 'bgsVolume');
    this.meVolume = this.readVolume(config, 'meVolume');
    this.seVolume = this.readVolume(config, 'seVolume');
    this.vcVolume = this.readVolume(config, 'vcVolume');
};

ConfigManager.readFlag = function (config, name) {

    if (name == "Voice" && config[name] === undefined) {
        config[name] = true;
        return !!config[name];
    }

    if (name == "battleVoice" && config[name] === undefined) {
        config[name] = true;
        return !!config[name];
    }

    return !!config[name];
};

ConfigManager.readVolume = function (config, name) {
    var value = config[name];
    if (value !== undefined) {
        return Number(value).clamp(0, 100);
    } else {
        return 100;
    }
};

(function () {

    var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function () {

        _Window_Options_addGeneralOptions.call(this);

        this.addCommand('Voice', 'Voice');
        //あああ    this.addCommand('戦闘音声', 'battleVoice');
    };
    var _Window_Options_addVolumeOptions = Window_Options.prototype.addVolumeOptions;
    Window_Options.prototype.addVolumeOptions = function () {

        _Window_Options_addVolumeOptions.call(this);

        this.addCommand('Voice Volume', 'vcVolume');
    };

})();