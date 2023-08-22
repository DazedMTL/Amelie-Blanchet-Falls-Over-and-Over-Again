//=============================================================================
// MPP_RemovoEquipText.js
//=============================================================================
// Copyright (c) 2017 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.1】装備画面で装備後のアイテムを選択する際、一番左上の空白に「はずす」などの文字を入れます。
 * @author 木星ペンギン
 *
 * @help 
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Text
 * @desc 表示する文字列
 * @default はずす
 * 
 * @param Text X
 * @desc 表示するX座標
 * @default 36
 * 
 * @param Text Enabled
 * @desc 文字列を有効状態で表示するかどうか
 * (trueで白, falseでグレー)
 * @default true
 * 
 * 
 * 
 */

(function () {

    var MPPlugin = { params: PluginManager.parameters('MPP_RemovoEquipText') };

    MPPlugin.Text = MPPlugin.params['Text'];
    MPPlugin.TextX = Number(MPPlugin.params['Text X'] || 6);
    MPPlugin.TextEnabled = !!eval(MPPlugin.params['Text Enabled']);

    var Alias = {};

    //-----------------------------------------------------------------------------
    // Window_EquipItem

    if (Window_EquipItem.prototype.hasOwnProperty('makeItemList')) {
        Alias.WiEqIt_drawItem = Window_EquipItem.prototype.makeItemList;
    }
    Window_EquipItem.prototype.makeItemList = function () {
        if (Alias.WiEqIt_drawItem) {
            Alias.WiEqIt_drawItem.call(this);
        } else {
            Window_ItemList.prototype.makeItemList.call(this);
        }
        if (this._data.indexOf(null) === this._data.length - 1) {
            this._data = this._data.slice(0, -1);
            this._data.unshift(null);
        }
    };

    if (Window_EquipItem.prototype.hasOwnProperty('drawItem')) {
        Alias.WiEqIt_drawItem = Window_EquipItem.prototype.drawItem;
    }
    Window_EquipItem.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (!item && this._actor && this._slotId >= 0) {
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.changePaintOpacity(MPPlugin.TextEnabled);
            var tx = MPPlugin.TextX;
            this.drawText(MPPlugin.Text, rect.x + tx, rect.y, rect.width - tx);
            this.changePaintOpacity(true);
        } else {
            if (Alias.WiEqIt_drawItem) {
                Alias.WiEqIt_drawItem.call(this, index);
            } else {
                Window_ItemList.prototype.drawItem.call(this, index);
            }
        }
    };



})();
