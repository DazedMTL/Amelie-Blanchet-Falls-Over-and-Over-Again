// FesScroll.js Ver.1.0.1
// MIT License (C) 2022 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MV MZ
* @orderAfter PluginCommonBase
* @orderAfter ScrollForceCenter
* @plugindesc マップのスクロールをツクールフェスレベルまで強化します。
* 少しだけ追加機能もあります。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/
* @help 【プラグインコマンド（MV）】
* fesScroll                              //直下のｺﾏﾝﾄﾞをｽｸﾛｰﾙ専用にする。下記の【拡張機能】を参照。
* fesScroll locate x y                   //画面を指定した場所に瞬間移動させる。
* fesScroll locate                       //主人公の位置にリセット。
* fesScroll locateToCharacter evId       //指定したキャラクターに瞬間移動。
* fesScroll setScrollSpeed speed         //移動速度を変更。
* fesScroll startScroll 向き 距離 wait   //指定した向きと距離だけｽｸﾛｰﾙします。
* fesScroll scrollToX x wait             //X座標に向かってｽｸﾛｰﾙします。
* fesScroll scrollToY y wait             //Y座標に向かってｽｸﾛｰﾙします。
* fesScroll scrollToCharacterX evId wait //ｷｬﾗｸﾀｰのX座標に向かってｽｸﾛｰﾙします。
* fesScroll scrollToCharacterY evId wait //ｷｬﾗｸﾀｰのY座標に向かってｽｸﾛｰﾙします。
*
* 【引数】
* x,y：座標。数値で指定。
* evId：イベントID。数値で指定。プレイヤー：-1　このイベント：0
* wait：完了までウェイトするか（true/false）。未入力だとウェイト。
* speed：移動速度。数値で指定。
* 向き：下：2　左：4　右：6　上：8　左下：1　右下：3　左上：7　右上：9
* 距離：数値で指定。
*
* 【スクリプト（移動ルートの設定）】
* this.locate(x, y);             //画面を指定した場所に瞬間移動させる。
* this.locate();                 //主人公の位置にリセット。
* this.locateToCharacter(evId);  //指定したキャラクターに瞬間移動。
* this.setScrollSpeed(speed);    //移動速度を変更。
* this.startScroll(向き, 距離);  //指定した向きと距離だけｽｸﾛｰﾙします。
* this.scrollToX(x);             //X座標に向かってｽｸﾛｰﾙします。
* this.scrollToY(y);             //Y座標に向かってｽｸﾛｰﾙします。
* this.scrollToCharacterX(evId); //ｷｬﾗｸﾀｰのX座標に向かってｽｸﾛｰﾙします。
* this.scrollToCharacterY(evId); //ｷｬﾗｸﾀｰのY座標に向かってｽｸﾛｰﾙします。
*
* 【スクリプト（イベントエディター）】
* $gameMap.locate(x, y);
* $gameMap.locate();
* $gameMap.locateToCharacter(evId);
* $gameMap.setScrollSpeed(speed);
* $gameMap.startScroll(向き, 距離);
* $gameMap.scrollToX(x);
* $gameMap.scrollToY(y);
* $gameMap.scrollToCharacterX(evId);
* $gameMap.scrollToCharacterY(evId);
* this.setWaitMode("scroll");        //スクロール完了までウェイト
* this.setWaitMode("scrollRoute");   //移動ルート完了までウェイト
*
* 【拡張機能】
* “直下のコマンドをスクロール専用にする”コマンドの下に置いたイベントコマンド、
* 以下の２つをマップのスクロールとして使えるようにします。
* ・移動ルートの設定
* ・イベントの位置設定
* 移動ルートの設定では、キャラクターと同様に移動コマンドで画面のスクロールを
* 制御できます。オプションは“動作を繰り返す”と“完了までウェイト”が使用可能です。
* イベントの位置設定は、画面の瞬間移動として使えます。
* ただし、“他のイベントと交換”は、そのイベントの位置に瞬間移動するだけの
* 機能にしています。
*
* 【使用可能な移動コマンド】
* 下に移動～プレイヤーに近づく、ウェイト
* スイッチON～移動速度の変更
* 向き固定ON、向き固定OFF（自動ｽｸﾛｰﾙ無効化ｽｲｯﾁを操作）
* 透明化ON、透明化OFF（それぞれフェードアウト、フェードイン）
* SEの演奏、スクリプト
*
* ［仕様］
* 移動ルートのメソッドを流用している為、可能な限りプラグインリストの上の方に
* 配置して下さい。
*
* ［更新履歴］
* 2022/02/17：Ver.1.0.0 公開。
* 2022/06/23：Ver.1.0.1 イベントの位置設定と併用した時のバグを修正。
*
* @command replaceCommand
* @desc 直下のコマンドを画面のスクロール専用にします。
*
* @command locate
* @desc 指定した座標に画面を瞬間移動します。
* @arg x
* @default 0
* @arg y
* @default 0
*
* @command locateToCharacter
* @desc 指定したキャラクターの座標に画面を瞬間移動します。
* @arg eventId
* @text イベントID
* @desc プレイヤー：-1　このイベント：0
* @default -1
*
* @command setScrollSpeed
* @desc スクロールの速度を指定します。
* @arg speed
* @default 4
* @text 移動速度
*
* @command startScroll
* @desc 指定した向きと距離だけスクロールします。
* @arg direction
* @text 向き
* @desc 下：2　左：4　右：6　上：8
* 左下：1　右下：3　左上：7　右上：9
* @default 2
* @arg distance
* @text 距離
* @default 1
* @arg wait
* @text 完了までウェイト
* @type boolean
* @default true
*
* @command scrollToX
* @desc 指定したX座標に向かってスクロールします。
* @arg x
* @text X座標
* @default 0
* @arg wait
* @text 完了までウェイト
* @type boolean
* @default true
*
* @command scrollToY
* @desc 指定したY座標に向かってスクロールします。
* @arg y
* @text Y座標
* @default 0
* @arg wait
* @text 完了までウェイト
* @type boolean
* @default true
*
* @command scrollToCharacterX
* @desc 指定したキャラクターのX座標に向かってスクロールします。
* @arg eventId
* @text イベントID
* @desc 主人公：-1　このイベント：0
* @default -1
* @arg wait
* @text 完了までウェイト
* @type boolean
* @default true
*
* @command scrollToCharacterY
* @desc 指定したキャラクターのY座標に向かってスクロールします。
* @arg eventId
* @text イベントID
* @desc 主人公：-1　このイベント：0
* @default -1
* @arg wait
* @text 完了までウェイト
* @type boolean
* @default true
*
* @param disableAutoScrollSwitch1
* @text 自動ｽｸﾛｰﾙ無効化ｽｲｯﾁ1
* @desc 主人公への追従をOFFにするスイッチです。
* @type switch
* @default 0
*
* @param disableAutoScrollSwitch2
* @text 自動ｽｸﾛｰﾙ無効化ｽｲｯﾁ2
* @desc このスイッチを設定した場合、スイッチ1が縦のスクロール、スイッチ2が横スクロールを禁じます。
* @type switch
* @default 0
*
*/

'use strict';
{
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const param = PluginManager.parameters(pluginName);
	const das1 = Number(param['disableAutoScrollSwitch1']);
	const das2 = Number(param['disableAutoScrollSwitch2']);

	//-----------------------------------------------------------------------------
	// PluginManager

	const useMZ = Utils.RPGMAKER_NAME === 'MZ';
	const hasPluginCommonBase = typeof PluginManagerEx === "function";
	let fesScroll = false;
	if (useMZ) {
		PluginManager.registerCommand(pluginName, "replaceCommand", function () {
			this.setScrollMapFes();
		});
		if (!hasPluginCommonBase) {
			PluginManager.registerCommand(pluginName, "locate", function (args) {
				$gameMap.locate(+args.x, +args.y);
			});
			PluginManager.registerCommand(pluginName, "locateToCharacter", function (args) {
				$gameMap.locateToCharacter(+args.eventId);
			});
			PluginManager.registerCommand(pluginName, "setScrollSpeed", function (args) {
				$gameMap.setScrollSpeed(+args.speed);
			});
			PluginManager.registerCommand(pluginName, "startScroll", function (args) {
				$gameMap.startScroll(+args.direction, +args.distance);
				if (args.wait === "true") this.setWaitMode("scroll");
			});
			PluginManager.registerCommand(pluginName, "scrollToX", function (args) {
				$gameMap.scrollToX(+args.x);
				if (args.wait === "true") this.setWaitMode("scroll");
			});
			PluginManager.registerCommand(pluginName, "scrollToY", function (args) {
				$gameMap.scrollToY(+args.y);
				if (args.wait === "true") this.setWaitMode("scroll");
			});
			PluginManager.registerCommand(pluginName, "scrollToCharacterX", function (args) {
				$gameMap.scrollToCharacterX(+args.eventId);
				if (args.wait === "true") this.setWaitMode("scroll");
			});
			PluginManager.registerCommand(pluginName, "scrollToCharacterY", function (args) {
				$gameMap.scrollToCharacterY(+args.eventId);
				if (args.wait === "true") this.setWaitMode("scroll");
			});
		} else {
			PluginManagerEx.registerCommand(document.currentScript, "locate", function (args) {
				$gameMap.locate(args.x, args.y);
			});
			PluginManagerEx.registerCommand(document.currentScript, "locateToCharacter", function (args) {
				$gameMap.locateToCharacter(args.eventId);
			});
			PluginManagerEx.registerCommand(document.currentScript, "setScrollSpeed", function (args) {
				$gameMap.setScrollSpeed(args.speed);
			});
			PluginManagerEx.registerCommand(document.currentScript, "startScroll", function (args) {
				$gameMap.startScroll(args.direction, args.distance);
				if (args.wait) this.setWaitMode("scroll");
			});
			PluginManagerEx.registerCommand(document.currentScript, "scrollToX", function (args) {
				$gameMap.scrollToX(args.x);
				if (args.wait) this.setWaitMode("scroll");
			});
			PluginManagerEx.registerCommand(document.currentScript, "scrollToY", function (args) {
				$gameMap.scrollToY(args.y);
				if (args.wait) this.setWaitMode("scroll");
			});
			PluginManagerEx.registerCommand(document.currentScript, "scrollToCharacterX", function (args) {
				$gameMap.scrollToCharacterX(args.eventId);
				if (args.wait) this.setWaitMode("scroll");
			});
			PluginManagerEx.registerCommand(document.currentScript, "scrollToCharacterY", function (args) {
				$gameMap.scrollToCharacterY(args.eventId);
				if (args.wait) this.setWaitMode("scroll");
			});
		}
	}

	//-----------------------------------------------------------------------------
	// Game_Interpreter

	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === "fesScroll") {
			const func = args[0];
			if (func) {
				switch (func) {
					case "locate":
						if (typeof args[1] === "undefined") $gameMap[func]();
						else $gameMap[func](+args[1], +args[2]);
						break;
					case "locateToCharacter":
					case "setScrollSpeed":
						$gameMap[func](+args[1]);
						break;
					case "startScroll":
						$gameMap[func](+args[1], +args[2]);
						if (args[3] !== "false") this.setWaitMode("scroll");
						break;
					default:
						$gameMap[func](+args[1]);
						if (args[2] !== "false") this.setWaitMode("scroll");
						break;
				}
			} else {
				this.setScrollMapFes();
			}
		}
	};

	Game_Interpreter.prototype.setScrollMapFes = function () {
		if (!$gameParty.inBattle()) fesScroll = true;
	};

	const _Game_Interpreter_command203 = Game_Interpreter.prototype.command203;
	Game_Interpreter.prototype.command203 = function (params) {
		if (fesScroll) {
			return this.commandFesLocateMap203(params);
		}
		return _Game_Interpreter_command203.call(this, params);
	};

	Game_Interpreter.prototype.commandFesLocateMap203 = function (params = this._params) {
		if (!$gameParty.inBattle()) {
			if (params[1] === 0) {
				$gameMap.locate(params[2], params[3]);
			} else if (params[1] === 1) {
				const x = $gameVariables.value(params[2]);
				const y = $gameVariables.value(params[3]);
				$gameMap.locate(x, y);
			} else {
				$gameMap.locateToCharacter(params[2]);
			}
		}
		fesScroll = false;
		return true;
	};

	const _Game_Interpreter_command205 = Game_Interpreter.prototype.command205;
	Game_Interpreter.prototype.command205 = function (params) {
		if (fesScroll) {
			return this.commandFesScrollMap205(params);
		}
		return _Game_Interpreter_command205.call(this, params);
	};

	Game_Interpreter.prototype.commandFesScrollMap205 = function (params = this._params) {
		if (!$gameParty.inBattle()) {
			if ($gameMap.isScrolling()) {
				this.setWaitMode("scroll");
				return false;
			}
			$gameMap.forceMoveRoute(params[1]);
			if (params[1].wait) {
				this.setWaitMode("scrollRoute");
			}
		}
		fesScroll = false;
		return true;
	};

	const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
	Game_Interpreter.prototype.updateWaitMode = function () {
		switch (this._waitMode) {
			case "scrollRoute":
				const waiting = $gameMap.isMoveRouteForcing();
				if (!waiting) this._waitMode = "";
				return waiting;
			default:
				return _Game_Interpreter_updateWaitMode.call(this);
		}
	};

	//-----------------------------------------------------------------------------
	// Game_Player

	const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
	if (das1) {
		if (!das2) {
			Game_Player.prototype.updateScroll = function (lx, ly) {
				if (!$gameSwitches._data[das1]) _Game_Player_updateScroll.call(this, lx, ly);
			};
		} else {
			Game_Player.prototype.updateScroll = function (lx, ly) {
				if ($gameSwitches._data[das2]) lx = this.scrolledX();
				if ($gameSwitches._data[das1]) ly = this.scrolledY();
				_Game_Player_updateScroll.call(this, lx, ly);
			};
		}
	}

	//-----------------------------------------------------------------------------
	// Game_Map

	const _Game_Map_initialize = Game_Map.prototype.initialize;
	Game_Map.prototype.initialize = function () {
		_Game_Map_initialize.call(this);
		this._moveRouteForcing = false;
		this._moveRoute = null;
		this._moveRouteIndex = 0;
		this._waitCount = 0;
	};

	Game_Map.prototype.isMoveRouteForcing = function () {
		return this._moveRouteForcing;
	};

	Game_Map.prototype.isMovementSucceeded = function () {//未使用
		return true;
	};

	Game_Map.prototype.setMovementSuccess = function (success) { };//未使用

	Game_Map.prototype.setScrollSpeed = function (scrollSpeed) {
		this._scrollSpeed = scrollSpeed;
	};

	Game_Map.prototype.memorizeMoveRoute = function () { };//未使用

	Game_Map.prototype.forceMoveRoute = function (moveRoute) {
		this._moveRoute = moveRoute;
		this._moveRouteIndex = 0;
		this._moveRouteForcing = true;
		this._waitCount = 0;
	};

	const _Game_Map_updateScroll = Game_Map.prototype.updateScroll;
	Game_Map.prototype.updateScroll = function () {
		if (this.isMoveRouteForcing() && !this.isScrolling()) {
			this.updateRoutineMove()
		}
		_Game_Map_updateScroll.call(this);
	};

	const _Game_Map_doScroll = Game_Map.prototype.doScroll;
	Game_Map.prototype.doScroll = function (dir, dis) {
		switch (dir) {
			case 1:
				this.scrollDown(dis);
				this.scrollLeft(dis);
				break;
			case 3:
				this.scrollDown(dis);
				this.scrollRight(dis);
				break;
			case 7:
				this.scrollUp(dis);
				this.scrollLeft(dis);
				break;
			case 9:
				this.scrollUp(dis);
				this.scrollRight(dis);
				break;
			default:
				_Game_Map_doScroll.call(this, dir, dis);
		}
	};

	Game_Map.prototype.doScrollFes = function (x, y) {
		const lx = this._displayX;
		const ly = this._displayY;
		if (y > ly) this.scrollDown(y - ly);
		if (x < lx) this.scrollLeft(lx - x);
		if (x > lx) this.scrollRight(x - lx);
		if (y < ly) this.scrollUp(ly - y);
	};

	const _Game_Character_updateRoutineMove = Game_Character.prototype.updateRoutineMove;
	Game_Map.prototype.updateRoutineMove = function () {
		let index;
		do {
			index = this._moveRouteIndex;
			_Game_Character_updateRoutineMove.call(this);
		} while (!this.isScrolling() && index !== this._moveRouteIndex && !this._waitCount && this._moveRouteForcing);
	};

	const _Game_Character_advanceMoveRouteIndex = Game_Character.prototype.advanceMoveRouteIndex;
	Game_Map.prototype.advanceMoveRouteIndex = function () {
		_Game_Character_advanceMoveRouteIndex.call(this);
	};

	Game_Map.prototype.restoreMoveRoute = function () { };//未使用

	const _Game_Character_processRouteEnd = Game_Character.prototype.processRouteEnd;
	Game_Map.prototype.processRouteEnd = function () {
		_Game_Character_processRouteEnd.call(this);
	};

	const dir = [0, 2, 4, 6, 8, 1, 3, 7, 9];
	Game_Map.prototype.processMoveCommand = function (command) {
		const params = command.parameters;
		switch (command.code) {
			case 0:
				this.processRouteEnd();
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
				this.startScroll(dir[command.code], 1);
				break;
			case 9:
				this.scrollRandom(1);
				break;
			case 10:
				this.locate();
				break;
			case 15:
				this._waitCount = params[0];
				break;
			case 27:
				$gameSwitches.setValue(params[0], true);
				break;
			case 28:
				$gameSwitches.setValue(params[0], false);
				break;
			case 29:
				this.setScrollSpeed(params[0]);
				break;
			case 35:
				$gameSwitches.setValue(das1, true);
				$gameSwitches.setValue(das2, true);
				break;
			case 36:
				$gameSwitches.setValue(das1, false);
				$gameSwitches.setValue(das2, false);
				break;
			case 39:
				var duration = $gameMap._interpreter.fadeSpeed()
				$gameScreen.startFadeOut(duration);
				this._waitCount = duration;
				break;
			case 40:
				var duration = $gameMap._interpreter.fadeSpeed()
				$gameScreen.startFadeIn(duration);
				this._waitCount = duration;
				break;
			case 44:
				AudioManager.playSe(params[0]);
				break;
			case 45:
				eval(params[0]);
				break;
		}
	};

	Game_Map.prototype.locate = function (x = $gamePlayer.x, y = $gamePlayer.y) {
		const lastX = this._displayX;
		const lastY = this._displayY;
		const dx = this.deltaX(x, lastX + $gamePlayer.centerX());
		const dy = this.deltaY(y, lastY + $gamePlayer.centerY());
		const destX = lastX + dx;
		const destY = lastY + dy;
		this.doScrollFes(destX, destY);
	};

	Game_Map.prototype.locateToCharacter = function (eventId) {
		const character = eventId > 0 ? this.event(eventId) : this._interpreter.character(eventId);
		if (character) this.locate(character.x, character.y);
	};

	const _Game_Map_startScroll = Game_Map.prototype.startScroll;
	Game_Map.prototype.startScroll = function (dir, dis, speed = this._scrollSpeed) {
		_Game_Map_startScroll.call(this, dir, dis, speed);
	};

	Game_Map.prototype.scrollToX = function (x) {
		const dx = this.deltaX(x, this._displayX + $gamePlayer.centerX());
		this.startScroll(dx < 0 ? 4 : 6, Math.abs(dx));
	};

	Game_Map.prototype.scrollToY = function (y) {
		const dy = this.deltaY(y, this._displayY + $gamePlayer.centerY());
		this.startScroll(dy < 0 ? 8 : 2, Math.abs(dy));
	};

	Game_Map.prototype.scrollToCharacterX = function (eventId) {
		const character = eventId > 0 ? this.event(eventId) : this._interpreter.character(eventId);
		if (character) {
			const dx = this.deltaX(character.x, this._displayX + $gamePlayer.centerX());
			this.startScroll(dx < 0 ? 4 : 6, Math.abs(dx));
		}
	};

	Game_Map.prototype.scrollToCharacterY = function (eventId) {
		const character = eventId > 0 ? this.event(eventId) : this._interpreter.character(eventId);
		if (character) {
			const dy = this.deltaY(character.y, this._displayY + $gamePlayer.centerY());
			this.startScroll(dy < 0 ? 8 : 2, Math.abs(dy));
		}
	};

	Game_Map.prototype.scrollRandom = function (dis, speed) {
		const dir = 1 + Math.randomInt(9);
		this.startScroll.call(this, dir, dis, speed);
	};

}