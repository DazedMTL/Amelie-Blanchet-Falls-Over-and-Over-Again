//=============================================================================
// ChoiceList2.js
//=============================================================================
// [Update History]
// 2022.May.24 Ver1.0.0 First Release

/*:
 * @target MV MZ
 * @plugindesc Add constraint for each choice to message window's choice list
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MV and MZ.
 *
 * This plugin enables to set constraint for each choice in choice list,
 * whose constraint is switch. If specified switch is OFF, player cannot
 * select the choice.
 *
 * [Summary]
 * If you want set constraint to a choice, and whose constraint is
 * Switch #15 is ON, write down as follows:
 *
 * Yes~15
 *
 * At this case, display 'Yes', and cannot select if Switch #15 is false.
 * If not ~ (=tilda) in the choice, it's selectable any case.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @target MV MZ
 * @plugindesc 「選択肢の表示」の選択肢に選択可否の制約を導入します。
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 * このプラグインは、RPGツクールMVおよびMZに対応しています。
 *
 * このプラグインは、「選択肢の表示」の選択肢に、選択可否の制約を導入します。
 * 具体的には、特定のスイッチがONの時だけ選択可能になる選択肢が作れます。
 *
 * ■概要
 * スイッチ15番がONの時だけ選択可能になる選択肢は、
 * 以下のように ~(チルダ)を使って記述します。
 * 
 * はい~15
 *
 * この場合、選択肢は「はい」と表示され、スイッチ15番がOFFの時は選択不可です。
  *
 * ~ (=チルダ)をつけない選択肢については、通常表示となります。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function () {

  //
  // replace ChoiceList window
  //
  if ("ColorManager" in window) { // MZ
    Scene_Message.prototype.createChoiceListWindow = function () {
      this._choiceListWindow = new Window_ChoiceList2();
      this.addWindow(this._choiceListWindow);
    };
  } else { // MV
    var _Window_Message_createSubWindows =
      Window_Message.prototype.createSubWindows;
    Window_Message.prototype.createSubWindows = function () {
      _Window_Message_createSubWindows.call(this);
      this._choiceWindow = new Window_ChoiceList2(this);
    };
  }

  // ------------------------------------------------------------------
  // define CoiceList2 class
  // ------------------------------------------------------------------
  function Window_ChoiceList2() {
    this.initialize.apply(this, arguments);
  }

  Window_ChoiceList2.prototype = Object.create(Window_ChoiceList.prototype);
  Window_ChoiceList2.prototype.constructor = Window_ChoiceList2;

  //
  // judge and process routine to gold is enough or not
  //
  var choiceRE = /^(?:(.+)\~([0-9]+))|(.+)$/;

  Window_ChoiceList2.prototype.commandName = function (index) {
    var res = choiceRE.exec(this._list[index].name);
    return res[1] || res[3];
  };

  Window_ChoiceList2.prototype.isEnabled = function (index) {
    if (index >= 0) {
      var res = choiceRE.exec(this._list[index].name);
      if (res[2]) {
        return $gameSwitches.value(+res[2]);
      }
      return true;
    }
    return false;
  };

  Window_ChoiceList2.prototype.isCurrentItemEnabled = function () {
    return this.isEnabled(this.index());
  };

  Window_ChoiceList2.prototype.drawItem = function (index) {
    this.changePaintOpacity(this.isEnabled(index));
    Window_ChoiceList.prototype.drawItem.call(this, index);
    this.changePaintOpacity(true);
  };

})();
