//=============================================================================
// ConditionalItem.js
// ----------------------------------------------------------------------------
// <利用規約>
//  利用はRPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
//  商用、非商用、ゲームの内容を問わず利用可能です。
//  ゲームへの利用の際、報告や出典元の記載等は必須ではありません。
//  二次配布や転載は禁止します。
//  ソースコードURL、ダウンロードURLへの直接リンクも禁止します。
//  不具合対応以外のサポートやリクエストは受け付けておりません。
//  スクリプト利用により生じたいかなる問題においても、一切責任を負いかねます。
// ----------------------------------------------------------------------------
//  Ver1.00  2016/01/31  初版
//=============================================================================

/*:
 * @plugindesc アイテムやスキルに、使用対象の条件を設定します。
 * @author こま
 *
 * @param Tag Name
 * @desc メモ欄に記入する、条件タグの名前を変更できます。
 * @default condition_item
 *
 * @help
 * アイテムやスキルのメモ欄に、以下の様な記述をすることで、使用対象の条件を設定で
 * きます。
 *
 * <condition_item:actor=1,2>        # アクターの1番と2番のみ使用可。
 * <condition_item:class=3,4>        # 3番と4番の職業のアクターのみ使用可。
 * <condition_item:level=5>          # レベルが5以上のアクターのみ使用可。
 * <condition_item:skill=6,7>        # 6番と7番のスキルを習得していたら使用可。
 * <condition_item:weapon=8,9>       # 8番と9番の武器を装備していたら使用可。
 * <condition_item:armor=10,11>      # 10番と11番の防具を装備していたら使用可。
 *
 * 「=」を「!=」とすると、条件が逆転します。
 *
 * <condition_item:actor!=1>         # アクターの1番以外使用可。
 * <condition_item:level!=5>         # レベルが5未満のアクターのみ使用可。
 * <condition_item:skill!=6>         # 6番のスキルを習得していなければ使用可。
 *
 * 複数の条件を同時に満たす必要がある場合、以下のように記述します。
 *
 * <condition_item:actor=1;level=5>  # レベル5以上のアクター1番のみ使用可。
 *
 * 1つのアイテムやスキルに複数の条件タグが設定されていた場合、いずれかの条件が満
 * たされれば使用可能となります。
 *
 * ▽同じアイテムに以下の2つの条件タグが設定されていた場合
 * <condition_item:actor=1;level=10>
 * <condition_item:actor=2;level=20>
 * → レベル10以上のアクター1番か、レベル20以上のアクター2番が使用可。
 *
 * プラグインパラメータのTag Nameを変更することで、条件タグの名前を変更できます。
 *
 * ▽Tag Nameを「cond_item」に変更した場合
 * <cond_item:actor=1,2>
 * <cond_item:level=5>
 *
 * *このプラグインには、プラグインコマンドはありません。
 */

(function () {
    var parameters = PluginManager.parameters('ConditionalItem');

    var exp = new RegExp('<' + parameters['Tag Name'] + ':(.+)>', 'gim');

    function checkCondition(target, item) {
        var total_result = false;
        var condition_check = false;
        if (~target.constructor.toString().indexOf('Game_Actor')) {
            while ((cond_all = exp.exec(item.note)) != null) {
                var individual_result = true;
                condition_check = true;
                cond_all = cond_all[1].replace(/ /g, '');
                cond_all.split(';').forEach(function (c) {
                    if (cond_detail = c.match(/([^!=]+)(!?=)(.+)/)) {
                        var category = cond_detail[1].toLowerCase();
                        var operator = cond_detail[2];
                        var values = cond_detail[3].split(',');
                        var value = '';
                        var category_result;
                        switch (category) {
                            case 'actor':
                                category_result = (values.indexOf(target._actorId.toString()) >= 0);
                                break;
                            case 'class':
                                category_result = (values.indexOf(target._classId.toString()) >= 0);
                                break;
                            case 'level':
                                category_result = (target._level >= values[0]);
                                break;
                            case 'skill':
                                category_result = target._skills.some(function (s) {
                                    return (values.indexOf(s.toString()) >= 0);
                                });
                                break;
                            case 'weapon':
                                category_result = target._equips.some(function (e) {
                                    return ((e._dataClass == 'weapon') && (values.indexOf(e._itemId.toString()) >= 0));
                                });
                                break;
                            case 'armor':
                                category_result = target._equips.some(function (e) {
                                    return ((e._dataClass == 'armor') && (values.indexOf(e._itemId.toString()) >= 0));
                                });
                                break;
                        }
                        if (operator == '=') {
                            individual_result = individual_result && category_result;
                        } else {
                            individual_result = individual_result && !category_result;
                        }
                    }
                });
                total_result = total_result || individual_result;
            }
        }
        return total_result || !condition_check;
    }

    var _Game_Action_testApply = Game_Action.prototype.testApply;
    Game_Action.prototype.testApply = function (target) {
        return _Game_Action_testApply.call(this, target) && checkCondition(target, this.item());
    };
}());
