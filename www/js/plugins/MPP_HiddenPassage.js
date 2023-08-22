//=============================================================================
// MPP_HiddenPassage.js
//=============================================================================
// Copyright (c) 2017 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.1】指定したリージョンIDのタイルをプレイヤーより上に表示させます。
 * @author 木星ペンギン
 *
 * @help ※注意点
 * ツクール側の仕様でタイルセットのA4(壁)は上部が通行可能となっています。
 * 隠し通路等を作る際は、通行可能にした周囲を通行不可にすることをお勧めします。
 * 
 * ●リージョンIDの配列指定
 *  数値を配列で設定する際、
 *  n-m と表記することでnからmまでの数値を指定できます。
 *  (例 : 1-4,8,10-12 => 1,2,3,4,8,10,11,12)
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Upper Floor Region Ids
 * @desc キャラクターより上に表示し、通行可能になるリージョンIDの配列
 * (範囲指定可)
 * @default 32
 *
 * @param Upper Wall Region Ids
 * @desc キャラクターより上に表示し、通行不可になるリージョンIDの配列
 * (範囲指定可)
 * @default 33
 *
 *
 */

(function () {

    var MPPlugin = {};

    (function () {

        var parameters = PluginManager.parameters('MPP_HiddenPassage');

        function convertParam(name) {
            var param = parameters[name];
            var result = [];
            if (param) {
                var data = param.split(',');
                for (var i = 0; i < data.length; i++) {
                    if (/(\d+)\s*-\s*(\d+)/.test(data[i])) {
                        for (var n = Number(RegExp.$1); n <= Number(RegExp.$2); n++) {
                            result.push(n);
                        }
                    } else {
                        result.push(Number(data[i]));
                    }
                }
            }
            return result;
        };

        MPPlugin.UpperFloorIds = convertParam('Upper Floor Region Ids');
        MPPlugin.UpperWallIds = convertParam('Upper Wall Region Ids');

    })();

    var Alias = {};

    //-----------------------------------------------------------------------------
    // Tilemap

    //4860
    Alias.Tilemap__paintTiles = Tilemap.prototype._paintTiles;
    Tilemap.prototype._paintTiles = function (startX, startY, x, y) {
        var regionId = this._readMapData(startX + x, startY + y, 5);
        this._forceHigher = (MPPlugin.UpperFloorIds.contains(regionId) ||
            MPPlugin.UpperWallIds.contains(regionId));
        Alias.Tilemap__paintTiles.call(this, startX, startY, x, y);
    };

    //5216
    Alias.Tilemap__isHigherTile = Tilemap.prototype._isHigherTile;
    Tilemap.prototype._isHigherTile = function (tileId) {
        return this._forceHigher || Alias.Tilemap__isHigherTile.call(this, tileId);
    };

    //-----------------------------------------------------------------------------
    // ShaderTilemap

    //5656
    Alias.ShaderTilemap__paintTiles = ShaderTilemap.prototype._paintTiles;
    ShaderTilemap.prototype._paintTiles = function (startX, startY, x, y) {
        var regionId = this._readMapData(startX + x, startY + y, 5);
        this._forceHigher = (MPPlugin.UpperFloorIds.contains(regionId) ||
            MPPlugin.UpperWallIds.contains(regionId));
        Alias.ShaderTilemap__paintTiles.call(this, startX, startY, x, y);
    };

    //-----------------------------------------------------------------------------
    // Game_Map

    //515
    Alias.GaMa_checkPassage = Game_Map.prototype.checkPassage;
    Game_Map.prototype.checkPassage = function (x, y, bit) {
        var regionId = this.regionId(x, y);
        if (MPPlugin.UpperFloorIds.contains(regionId)) return true;
        if (MPPlugin.UpperWallIds.contains(regionId)) return false;
        return Alias.GaMa_checkPassage.call(this, x, y, bit);
    };





})();

