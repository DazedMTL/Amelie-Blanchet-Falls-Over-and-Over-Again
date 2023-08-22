//===============================
// RestoreMenuAfterCommon.js
//===============================

/*:
 * @plugindesc Back to the same menu scene after common events caused by items.
 * @author terunon (AliasAche)
 *
 * @help
 * メニュー上でコモンイベントを呼ぶアイテムを使用してメニューが閉じられたとき、
 * 元の画面に戻す処理を提供します。
 * 再定義を行っているので上の方に配置してください。
 *
 * 対象コモンイベントの末尾にスクリプト：this.sceneRestore()と入れることで使用できます。
 *
 * クレジットとして、「terunon（エイリアスエイク）」の素材を使用した旨を
 * ReadMeまたはブラウザ等の視認できる場所に記載していただければ、
 * 営利非営利問わず、あらゆるツクールMV作品で使用・改変いただけます。
 *
 * ※ 2018.10.30 ver 1.1：不要な処理を削除。
 *
 * Copyright (c) 2016 terunon (AliasAche)
 * You can use and modify it for every your commercial/non-commercial RPG Maker MV game
 * if you credit "terunon (AliasAche)"
 */

//Global variables
var aliasAcheCommon = false;
var aliasAcheSelectRestore = false;

(function () {

    Scene_Item.prototype.popScene = function () {
        if (aliasAcheCommon) {
            aliasAcheCommon = false;
            aliasAcheSelectRestore = false;
            SceneManager.goto(Scene_Menu);
        } else {
            SceneManager.pop();
        }
    };

    Game_Interpreter.prototype.sceneRestore = function () {
        if (!$gameParty.inBattle()) {
            aliasAcheCommon = true;
            aliasAcheSelectRestore = true;
            SceneManager.push(Scene_Item);
        }
    };



})();
