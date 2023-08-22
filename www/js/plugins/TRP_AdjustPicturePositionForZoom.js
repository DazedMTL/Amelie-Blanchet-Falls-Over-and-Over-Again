//=============================================================================
// TRP_AdjustPicturePositionForZoom.js
//=============================================================================
/*:
 * @author Thirop
 * @plugindesc ズーム時に等倍表示しているピクチャのボケを修正
 * @help スクリーンズーム時に等倍換算で表示しているピクチャのスクリーン座標が
 * 小数点になることで生じるピクチャのボケを修正します。
 *
 * このプラグインはプラグイン管理画面でなるべく下の方に配置して下さい。
 */
//============================================================================= 

(function () {
	var _Sprite_Picture_update = Sprite_Picture.prototype.update;
	Sprite_Picture.prototype.update = function () {
		_Sprite_Picture_update.call(this);
		if (this.visible) {
			this.adjustPositionFractionForZoom();
		}
	};

	Sprite_Picture.prototype.adjustPositionFractionForZoom = function () {
		var zoom = $gameScreen.zoomScale();
		this.x = Math.floor(this.x * zoom) / zoom;
		this.y = Math.floor(this.y * zoom) / zoom;
	}

})();