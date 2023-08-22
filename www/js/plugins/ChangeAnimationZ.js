//=============================================================================
// ChangeAnimationZ.js
//=============================================================================

/*:
 * @plugindesc マップシーンでのアニメーションの奥行きを変更
 * @author jp_asty
 *
 * @help
 * RPGツクールMVでは奥行き情報が次のように決められています。
 * 0 ： 地面のタイルセット
 * 1 ： プライオリティが通常キャラの下に設定されているキャラクター
 * 3 ： プライオリティが通常キャラと同じに設定されているキャラクター
 * 4 ： 木などのキャラクターの上に表示されるタイルセット
 * 5 ： プライオリティが通常キャラの上に設定されているキャラクター
 * 6 ： 飛行船の影
 * 7 ： フキダシアイコン
 * 8 ： アニメーション
 * 9 ： 移動時に拡大＆フェードアウトするの白い四角
 *
 * 表示したい場所に合わせてプラグインコマンドで奥行きを設定します。
 * 対象の数値より小さい値のとき奥に表示され、大きい値のとき手前に表示されます。
 * 数値はマイナスや小数点も設定可能です。
 * 設定後にアニメーションの再生をすると現在の奥行きで再生されます。
 *
 * 例1）キャラクターの奥に設定。
 * SET_ANIME_Z 2
 *
 * 例2) 通常の奥行きに戻す。
 * SET_ANIME_Z 8
 *
 * 利用規約
 * This plugin is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function () {
  'use strict';
  let animationZ = 8;

  //-----------------------------------------------------------------------------
  // Sprite_Animation
  //
  const _Sprite_Animation_initMembers = Sprite_Animation.prototype.initMembers;
  Sprite_Animation.prototype.initMembers = function () {
    _Sprite_Animation_initMembers.call(this);
    this.z = animationZ;
  };

  //-----------------------------------------------------------------------------
  // Game_Interpreter
  //
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    const COM = command.toUpperCase();
    if (COM == "SET_ANIME_Z") {
      animationZ = Number(args[0]);
    }
  };

})();
