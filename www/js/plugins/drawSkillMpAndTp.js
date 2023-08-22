/*:
@plugindesc
スキルのMPコストとTPコストを両方表示することができます

@author
シトラス

@help
このプラグインには、プラグインコマンドはありません
スキルのコストが表示される場所の
右側にMPコストが、左側にTPコストが表示されます

*/
Window_SkillList.prototype.drawSkillCost = function (skill, x, y, width) {
    if (this._actor.skillTpCost(skill) > 0 && this._actor.skillMpCost(skill) > 0) {
        //MPコストもTPコストも両方存在する場合
        //TPコストを描画
        this.changeTextColor(this.tpCostColor());
        this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');

        //MPコストを描画
        this.changeTextColor(this.mpCostColor());
        var blank = this.textWidth(" " + this._actor.skillTpCost(skill));
        this.drawText(this._actor.skillMpCost(skill), x - blank, y, width, 'right');

    } else if (this._actor.skillTpCost(skill) > 0) {
        this.changeTextColor(this.tpCostColor());
        this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
    } else if (this._actor.skillMpCost(skill) > 0) {
        this.changeTextColor(this.mpCostColor());
        this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right');
    }
};