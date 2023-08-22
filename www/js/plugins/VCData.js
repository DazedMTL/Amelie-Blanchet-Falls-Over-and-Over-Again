/*:ja
 * @plugindesc RPGツクールMVに別途音声用の再生jsonデータを作成します。
 * @author 黒崎 綾人
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * 
 * 【このプラグインが機能を拡張する他のプラグイン】
 * BasicBattleVoice.js
 * BasicMapVoice.js
 * 
 * このプラグインは音声のjsonを読み込むために
 * DataManager._databaseFiles の読み込み箇所を再定義しています。
 * 他のプラグインで同等の箇所を同じように再定義している場合は、
 * 38行目と39行目を最後に再定義されているプラグイン内部の
 * DataManager._databaseFiles へ
 * { name: '$databattlevoice',  src: 'BattleVoice.json'  }と
 * { name: '$datamapvoice',     src: 'MapVoice.json'     }を
 * 追加してあげてください。
*/

(function () {

    DataManager._databaseFiles = [
        { name: '$dataActors', src: 'Actors.json' },
        { name: '$dataClasses', src: 'Classes.json' },
        { name: '$dataSkills', src: 'Skills.json' },
        { name: '$dataItems', src: 'Items.json' },
        { name: '$dataWeapons', src: 'Weapons.json' },
        { name: '$dataArmors', src: 'Armors.json' },
        { name: '$dataEnemies', src: 'Enemies.json' },
        { name: '$dataTroops', src: 'Troops.json' },
        { name: '$dataStates', src: 'States.json' },
        { name: '$dataAnimations', src: 'Animations.json' },
        { name: '$dataTilesets', src: 'Tilesets.json' },
        { name: '$dataCommonEvents', src: 'CommonEvents.json' },
        { name: '$dataSystem', src: 'System.json' },
        { name: '$dataMapInfos', src: 'MapInfos.json' },
        { name: '$databattlevoice', src: 'BattleVoice.json' },
        { name: '$datamapvoice', src: 'MapVoice.json' }
    ];

    DataManager.loadDatabase = function () {
        var test = this.isBattleTest() || this.isEventTest();
        var prefix = test ? 'Test_' : '';
        for (var i = 0; i < this._databaseFiles.length; i++) {
            var name = this._databaseFiles[i].name;
            var src = this._databaseFiles[i].src;
            if (src == 'BattleVoice.json' || src == 'MapVoice.json') {
                this.loadDataFile(name, src);
            } else {
                this.loadDataFile(name, prefix + src);
            }
        }
        if (this.isEventTest()) {
            this.loadDataFile('$testEvent', prefix + 'Event.json');
        }
    };

})();