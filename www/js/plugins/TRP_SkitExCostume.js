//=============================================================================
// TRP_SkitExCostume.js
//=============================================================================
// Copyright (c) 2019 Thirop
//============================================================================= 

(function () {
	var parameters = PluginManager.parameters('TRP_SkitExCostume');
	parameters = JSON.parse(JSON.stringify(parameters, function (key, value) {
		try {
			return JSON.parse(value);
		} catch (e) {
			try {
				return eval(value);
			} catch (e) {
				return value;
			}
		}
	}));

	var actorSetting = {};
	parameters.actorSetting.forEach(function (setting) {
		actorSetting[setting.fileName] = setting;
	});
	parameters.actorSetting = actorSetting;
	parameters.costumeTypeMap = {};
	var costumeTypes = {};
	parameters.types.forEach(function (type) {
		var length = type.costumes.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			costumeTypes[type.name] = type;

			var costume = type.costumes[i];
			parameters.costumeTypeMap[costume] = type.name;
		}
	})
	parameters.types = costumeTypes;




	if (!TRP_CORE.pushUnieqly) {
		TRP_CORE.pushUnieqly = function (array, arg) {
			if (!array.contains(arg)) {
				array.push(arg);
			}
		}
	}

	if (!TRP_CORE.removeArrayObjectsInArray) {
		TRP_CORE.removeArrayObjectsInArray = function (array, argArray) {
			var length = argArray.length;
			for (var i = 0; i < length; i = i + 1) {
				this.removeArrayObject(array, argArray[i]);
			}
		};
	}



	//=============================================================================
	// Skit
	//=============================================================================
	var _Skit_initialize = Skit.prototype.initialize;
	Skit.prototype.initialize = function () {
		_Skit_initialize.call(this);
		this._costumes = {};
	};

	var _Skit_processCommand = Skit.prototype._processCommand || Skit.prototype.processCommand;
	Skit.prototype._processCommand = function (args, macroPos) {
		_Skit_processCommand.call(this, args, macroPos);

		var skitCommand = args[0];
		switch (skitCommand) {
			case 'costume':
			case Skit.COMMAND_COSTUME_J1:
			case Skit.COMMAND_COSTUME_J2:
				this.registerCostume(args);
				return;
		}
	};

	Skit.prototype.registerCostume = function (args) {
		this._costumes = this._costumes || {};

		var subCommand = args[1].toLowerCase();
		var targetName = args[2];
		var costumeName = args[3];
		var fade = TRP_CORE.supplementDefBool(parameters.defaultFade, args[4]);
		var isCommandOn = (subCommand === 'on' || subCommand === 'オン');
		var isCommandOff = !isCommandOn && (subCommand === 'off' || subCommand === 'オフ');
		var forAll = targetName === 'all' || targetName === '全員';

		/* process resetAllCostume firstly
		===================================*/
		if (forAll) {
			if (isCommandOn) return;
			if (isCommandOff) return;
			this._processResetAllActorsCostume(fade);
			return;
		}

		/* prepare target actor data
		===================================*/
		targetName = this.actorFolderName(targetName);
		if (!targetName) return;

		var targetData = this._costumes[targetName];
		if (!targetData) {
			this._costumes[targetName] = targetData = [];
		}


		/* prepare targetCostumeType
		===================================*/
		var targetType;
		var typeName = parameters.costumeTypeMap[costumeName];
		if (typeName) {
			targetType = parameters.types[typeName];
		} else {
			targetType = parameters.types[costumeName];
			if (targetType) {
				typeName = costumeName;
				costumeName = '';
			} else {
				targetType = null;
			}
		}

		/* remove costumes at once
		===================================*/
		var costumeAll = costumeName.toLowerCase() === 'all' || costumeName === '全て';
		if (targetType) {
			TRP_CORE.removeArrayObject(targetData, 'NONE_' + targetType.name)
			TRP_CORE.removeArrayObjectsInArray(targetData, targetType.costumes);
		} else if (!costumeAll) {
			TRP_CORE.removeArrayObject(targetData, costumeName);
		}

		/* processCommand
		===================================*/
		if (isCommandOn) {
			this._processCostumeOn(targetData, costumeName);
		} else if (isCommandOff) {
			this._processCostumeOff(targetData, targetType, costumeAll);
		} else {
			this._processCostumeReset(targetData, costumeAll)
		}

		/* apply costume if showing
		===================================*/
		if (forAll) {
			this._applyAllActorsCostume(fade);
		} else if (this.names().contains(targetName)) {
			this.actor(targetName).applyCostume(fade);
		}
	};


	Skit.prototype._processCostumeOn = function (targetData, costumeName) {
		if (!costumeName || costumeName === '') return;
		TRP_CORE.pushUnieqly(targetData, costumeName);
	};

	Skit.prototype._processCostumeOff = function (targetData, targetType, costumeAll) {
		if (costumeAll) {
			targetData.length = 0;
			for (var typeName in parameters.types) {
				var type = parameters.types[typeName];
				targetData.push('NONE_' + type.name);
			}
		} else {
			if (targetType.name) {
				targetData.push('NONE_' + targetType.name);
			}
		}
	};

	Skit.prototype._processCostumeReset = function (targetData, costumeAll) {
		if (costumeAll) {
			targetData.length = 0;
		}
	};

	Skit.prototype._processResetAllActorsCostume = function (fade) {
		this._costumes = {};
		if (this.isSkitOn()) {
			this._applyAllActorsCostume(fade);
		}
	};
	Skit.prototype._applyAllActorsCostume = function (fade) {
		var names = this.names();
		var length = names.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var name = names[i];
			var actor = this.actor(name);
			if (actor && actor.isShowing()) {
				actor.applyCostume(fade);
			}
		}
	};




	//=============================================================================
	// SkitActor
	//=============================================================================
	SkitActor.prototype.setupCostume = function () {
		var setting = parameters.actorSetting[this._name]
		var costumes;

		//defaultCostume
		if (setting) {
			this._costumes = costumes = setting.defaultCostumes.concat();

			//equips
			if (setting.actorId) {
				var actor = $gameActors.actor(setting.actorId);
				var equips = actor.equips();
				var length = equips.length;
				for (var i = 0; i < length; i = (i + 1) | 0) {
					var equip = equips[i];
					if (!equip) continue;
					var costume = equip.meta.costume;
					if (!costume) continue;
					this._setupCostume(costumes, costume);
				}
			}
		}

		var actorData = $gameSkit._costumes[this._name];
		if (!actorData) return;
		if (!costumes) costumes = [];

		var length = actorData.length;
		for (var i = 0; i < length; i = (i + 1) | 0) {
			var costume = actorData[i].toString();
			this._setupCostume(costumes, costume);
		}

		this._costumes = costumes;
	};

	SkitActor.prototype._setupCostume = function (costumes, costume) {
		var noneType = costume.replace('NONE_', '');
		var targetType;
		var isNone = (noneType !== costume);
		if (isNone) {
			targetType = noneType;
		} else {
			targetType = parameters.costumeTypeMap[costume];
			noneType = null;
		}
		// remove same type init-costume
		if (targetType) {
			var type = parameters.types[targetType];
			TRP_CORE.removeArrayObjectsInArray(costumes, type.costumes);
		}
		//pushType
		if (!isNone) {
			costumes.push(costume);
		}
	};

	SkitActor.prototype.costumeImages = function () {
		//check pose valid
		var setting = parameters.actorSetting[this._name];
		if (setting) {
			if (setting.invalidPose.contains(this._pose)) {
				return null;
			}
		}

		if (this._costumes) {
			return this._costumes.concat();
		} else {
			return null;
		}
	};



	/* apply Costume
	===================================*/
	SkitActor.prototype.applyCostume = function (animation, force) {
		if (this.isShowing()) {
			this.setupCostume();
			var picture = this.picture();
			var images = this.costumeImages()
			picture.setExOverlays(images, animation, force);
		}
	};

	var _SkitActor_changeImageWithoutAnimation = SkitActor.prototype.changeImageWithoutAnimation;
	SkitActor.prototype.changeImageWithoutAnimation = function (wait, duration, poseChange, expressionChange) {
		_SkitActor_changeImageWithoutAnimation.call(this, wait, duration, poseChange, expressionChange);
		if (poseChange) {
			this.applyCostume(false, true);
		}
	};

	var _SkitActor_changeImageStartFlipEmerge = SkitActor.prototype.changeImageStartFlipEmerge;
	SkitActor.prototype.changeImageStartFlipEmerge = function (wait, easeType, duration) {
		_SkitActor_changeImageStartFlipEmerge.call(this, wait, easeType, duration);
		this.applyCostume(false, true);
	};

	var _SkitActor_changeImageStartFadeEmerge = SkitActor.prototype.changeImageStartFadeEmerge;
	SkitActor.prototype.changeImageStartFadeEmerge = function (wait, easeType, duration, opacity) {
		_SkitActor_changeImageStartFadeEmerge.call(this, wait, easeType, duration, opacity);
		this.applyCostume(false, true);
	};

	var _SkitActor_show = SkitActor.prototype.show;
	SkitActor.prototype.show = function (position, opacity) {
		_SkitActor_show.call(this, position, opacity);
		this.applyCostume(false, true);
	};



	//=============================================================================
	// Game_Picture
	//=============================================================================
	var _Game_Picture_initBustPicture = Game_Picture.prototype.initBustPicture;
	Game_Picture.prototype.initBustPicture = function () {
		_Game_Picture_initBustPicture.call(this);
		this._exOverlays = [];
	};

	Game_Picture.prototype.setExOverlays = function (imageNames, animation, force) {
		//check cache & args both not empty
		if (!force && !imageNames && !this._exOverlays) return;

		//check not equals
		if (!force && imageNames && this._exOverlays && imageNames.equals(this._exOverlays)) return;

		this._exOverlays = imageNames || [];
		this._exOverlaysChanged = true;
		this._changeExOverlaysWithFade = animation || false;
	};
	Game_Picture.prototype.isExOverlayChangeWithFade = function () {
		return this._changeExOverlaysWithFade || false;
	}
	Game_Picture.prototype.didChangeExOverlays = function () {
		delete this._exOverlaysChanged;
		delete this._changeExOverlaysWithFade;
	};


	//=============================================================================
	// Sprite_Picture
	//=============================================================================
	var _Sprite_Picture_initialize = Sprite_Picture.prototype.initialize;
	Sprite_Picture.prototype.initialize = function (pictureId) {
		_Sprite_Picture_initialize.call(this, pictureId);
		this._exOverlays = null;
		this._exOverlayInitialized = false;
	};


	var _Sprite_Picture_updateOverlay = Sprite_Picture.prototype.updateOverlay;
	Sprite_Picture.prototype.updateOverlay = function () {
		_Sprite_Picture_updateOverlay.call(this);
		var picture = this.picture();
		if (picture) {
			if (!this._exOverlayInitialized || picture._exOverlaysChanged) {
				this.refreshExOverlays();
				this._exOverlayInitialized = true;
			}
		}
	};



	Sprite_Picture.prototype.refreshExOverlays = function () {
		var overlays = this._overlays;
		var length = overlays.length;
		var overlay, i;

		var picture = this.picture();
		var fadeFlag = picture.isExOverlayChangeWithFade();
		var fadeDur = fadeFlag ? parameters.fadeDuration || 1 : 0;
		picture.didChangeExOverlays();

		var overlayNames = picture._exOverlays.concat();

		/* remove old overlays
		===================================*/
		var overlayNamePrefix = this._pictureName + '_costume_';
		for (i = length; i >= 0; i = (i - 1) | 0) {
			overlay = overlays[i];
			if (overlay && overlay._isExOverlay) {
				if (//check is cosutmeOverlay
					overlayNames.contains(overlay._exOverlayName)
					//check pose not changed
					&& overlay._overlayName.indexOf(overlayNamePrefix) === 0
				) {
					//skip if current pose overlay
					TRP_CORE.removeArrayObject(overlayNames, overlay._exOverlayName);
					continue;
				}
				//remove old overlay
				if (fadeFlag) {
					overlay._fadeInDuration = 0;
					overlay._fadeSpeed = -overlay.opacity / fadeDur;
					overlay._fadeOutDuration = fadeDur;
				} else {
					this.removeChild(overlay);
					overlays.splice(i, 1);
				}
			}
		}

		/* add new overlays
		===================================*/
		length = overlayNames.length;
		for (i = 0; i < length; i = (i + 1) | 0) {
			var name = 'costume_' + overlayNames[i] + '_' + this._pictureName;
			var bitmap = ImageManager.loadBust(this._skitActorName, name);
			overlay = new Sprite(bitmap);
			overlay.visible = true;
			overlay.anchor.set(0.5, 0);
			overlay._isExOverlay = true;

			var overlayName = overlayNames[i].toString();
			overlay._overlayName = overlayNamePrefix + overlayName;
			overlay._exOverlayName = overlayName;

			var typeName = parameters.costumeTypeMap[overlayName];
			var type = parameters.types[typeName];
			overlay.z = type ? (type.priority || 1) : 1;
			overlays.push(overlay);
			if (fadeFlag) {
				overlay.opacity = 0;
				overlay._fadeInDuration = fadeDur;
				overlay._fadeSpeed = 255 / fadeDur;
				overlay._fadeOutDuration = 0;
			}

			this.addChild(overlay);
			bitmap.addLoadListener(this.setOverlayPosition.bind(this));
		}
	}

	var _Sprite_Picture_setOverlayPosition = Sprite_Picture.prototype.setOverlayPosition;
	Sprite_Picture.prototype.setOverlayPosition = function () {
		_Sprite_Picture_setOverlayPosition.call(this);
		if (!this.bitmap || !this.bitmap.isReady()) { return; }

		this.children.sort(this.sortChildren.bind(this));
	};

	Sprite_Picture.prototype.sortChildren = function (a, b) {
		return (a.z || 0) - (b.z || 0)
	};




	Skit.COMMAND_COSTUME_J1 = '衣装';
	Skit.COMMAND_COSTUME_J2 = 'コスチューム';
})();


//=============================================================================
/*:
 * @plugindesc TRP_Skitのポーズごとの衣装差分拡張
 * @author Thirop
 * @help
 * TRP_Skit.jsの下に配置
 * TRP_Skit本体はversion1.08以上を対象
 * (おまけパッチのため動作保証はありません。)
 *
 * ポーズ画像に対応した衣装差分を設定できます。
 * 異なるタイプの複数の衣装を重ねて表示できます。
 * 重ねて表示する衣装画像の規格は表情差分画像と同様です。
 *
 * 【衣装画像の名前】
 * 衣装画像は各キャラの画像フォルダ内に、costume_衣装名_ポーズ名.png
 * という名前で配置してください。
 * ポーズ名が「pose2」、衣装名が「1」の場合の画像名は
 * costume_1_pose2.png
 *
 *
 * 【衣装タイプ】
 * コンフィグで衣装タイプを設定することで、
 * 衣装の重ね順の設定ができる他、
 * 同じタイプの衣装を重ねて表示しないように調整できます。
 * 例えば、「服」「帽子」といったようにタイプ分けして、
 * それぞれのタイプに属する衣装名を登録してください。
 *
 *
 * 【初期衣装】
 * コンフィグでアクターごとの初期衣装を設定できます。
 *
 * 【プラグインコマンド】
 * プラグインコマンドで着脱した衣装は、reset/リセットコマンドで
 * 初期化しない限り引き継がれます。
 *
 * パラメータの「フェード」は"true"または"t"で、フェードしながら変更。
 * "false"または"f"で瞬時に変更。また、このパラメータは省略可
 *
 *
 * □コスチュームを着用
 * skit costume on アクター名 衣装名 フェード
 * スキット 衣装 オン アクター名 衣装名 フェード
 *
 * □コスチュームを脱ぐ
 * skit costume off アクター名 衣装名(またはタイプ名または"all") フェード
 * スキット 衣装 オフ アクター名 衣装名(またはタイプ名または"全て") フェード
 * ※衣装名に「タイプ名」を指定可
 * ※衣装名に"all"または"全て"を指定すると全ての衣装を脱ぐ
 *
 * □初期衣装に戻す
 * skit costume reset アクター名(または"all") タイプ名 フェード
 * スキット 衣装 リセット アクター名(または"全員"") タイプ名 フェード
 * ※タイプ名に"all"または"全て"を指定すると全ての衣装を初期状態に
 *
 *
 * 【装備】
 * コンフィグのアクター設定でツクール上のアクターIDを設定することで
 * 装備のノート欄に設定された衣装が反映されます。
 * 装備のノート欄には<costume:衣装名>の形式で衣装名を指定できます。
 * 装備によりアクターの初期衣装を脱がす場合は、
 * 衣装名に「NONE_衣装タイプ」という形式で衣装タイプを指定してください。
 *
 *
 * 【衣装の優先度】
 * 衣装の優先度は高い順に
 * ・プラグインコマンドで着脱した命令
 * ・装備で設定された衣装
 * ・アクターごとの初期衣装
 *
 *
 * 【更新履歴】
 * 1.02 2021/7/17  ポーズ変更時に反映されない不具合対応
 * 1.01 2019/1/22 ロード後に衣装が反映されてない不具合修正
 * 1.00 2019/1/22 初版
 *
 * @param types
 * @text 衣装のタイプ
 * @desc 衣装のタイプの設定。
 * @type struct<CostumeType>[]
 * @default []
 *
 * @param actorSetting
 * @text アクター設定
 * @desc アクター設定
 * @type struct<ActorSetting>[]
 * @default []
 *
 * @param defaultFade
 * @text 衣装変更時のフェードフラグ
 * @desc 衣装変更時のフェードフラグのデフォルト値
 * @type boolean
 * @default false
 *
 * @param fadeDuration
 * @text フェード所要時間
 * @desc フェード所要時間(1以上の整数)
 * @type number
 * @default 10
 *
 */
//============================================================================= 

/*~struct~CostumeType:
 * @param name
 * @text タイプ名
 * @desc タイプ名。他のタイプ名、衣装名と被らないように注意。
 *
 * @param priority
 * @text 重ね順の優先度
 * @type number
 * @min 1
 * @desc 重ね順の優先度(1以上の整数)。大きいほど手前に表示。
 * @default 1
 *
 * @param costumes
 * @text 衣装名
 * @type string[]
 * @desc タイプに属している衣装名(アルファベット)。
 */

/*~struct~ActorSetting:
 * @param fileName
 * @text キャラのフォルダ名
 * @desc キャラのフォルダ名
 *
 * @param actorId
 * @text ツクール上のアクターID
 * @desc 対応するアクターIDをセットすると、装備に設定されたコスチュームを反映されます。
 * @type actor
 * @default 0
 *
 * @param defaultCostumes
 * @text デフォルトの衣装
 * @desc デフォルトの衣装
 * @type string[]
 * @default []
 *
 * @param invalidPose
 * @text 衣装無効のポーズ名
 * @desc ここで設定しなかったポーズはポーズごとのコスチューム画像が読み込まれます。
 * @type string[]
 * @default []
 *
 */
