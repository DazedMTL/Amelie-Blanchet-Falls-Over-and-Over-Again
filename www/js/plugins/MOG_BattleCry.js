//=============================================================================
// MOG_BattleCry.js
//=============================================================================

/*:
 * @plugindesc (v1.4) Adiciona vozes na batalha.
 * @author Moghunter
 *
 * @param Volume
 * @desc Definição do volume.
 * @default 120 
 * 
 * @help  
 * =============================================================================
 * +++ MOG - Battle Cry (v1.4) +++
 * By Moghunter 
 * https://atelierrgss.wordpress.com/
 * =============================================================================
 * Adiciona vozes na batalha (ação, dano, vitória,etc...)
 * Para definir as vozes é necessário editar o plugin manualmente.
 * A edição do plugin deve ser feita a partir da linha 70.
 *
 * =============================================================================
 * HISTÓRICO
 * =============================================================================
 * (v1.4) - Correção do tocar as vozes no menu.
 *        - Correção de não atualizar a ID do inimigo no efeito transformação.
 * (v1.3) Compatibilidade com MOG Battle Result.  
 * (v1.2) Compatibilidade com MOG Battle Transitions. 
 * (v1.1) Corrigido o bug de não mover o personagem na hora da ação.
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================

// Não modifique essa parte.
// ☢CAUTION!!☢ Don't Touch.^_^ ----------------------------------------
var Imported = Imported || {};
Imported.MOG_BattleCry = true;
var Moghunter = Moghunter || {};
Moghunter.parameters = PluginManager.parameters('MOG_BattleCry');
Moghunter.v_volume = Number(Moghunter.parameters['Volume'] || 100);
Moghunter.v_actor_start = [];
Moghunter.v_actor_turn = [];
Moghunter.v_actor_default_action = [];
Moghunter.v_actor_skill = [];
Moghunter.v_actor_item = [];
Moghunter.v_actor_damage = [];
Moghunter.v_actor_evaded = [];
Moghunter.v_actor_dead = [];
Moghunter.v_actor_recover = [];
Moghunter.v_actor_counter = [];
Moghunter.v_actor_reflection = [];
Moghunter.v_actor_victory = [];
Moghunter.v_actor_levelup = [];
Moghunter.v_actor_escape = [];
Moghunter.v_enemy_default_action = [];
Moghunter.v_enemy_damage = [];
Moghunter.v_enemy_evaded = [];
Moghunter.v_enemy_counter = [];
Moghunter.v_enemy_reflection = [];
Moghunter.v_enemy_dead = [];
Moghunter.v_enemy_recover = [];
Moghunter.v_enemy_skill = [];
// ☢CAUTION!!☢ Don't Touch.^_^ ----------------------------------------




// SETUP ----------------------------------------------------------------
// Exemplo de configuração geral, o modo de configurar é igual para todas 
// ações.
//
// Moghunter.v_actor_start[A] = [B,B,B,B...]
//
// A - Actor ID 
// B - File Name
//
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// ACTOR - BATTLE START
// -----------------------------------------------------------------------
//Moghunter.v_actor_start[2] = ["3s0001"];
//Moghunter.v_actor_start[3] = ["3l0001"];
//Moghunter.v_actor_start[4] = ["3n0001"];

// -----------------------------------------------------------------------
// ACTOR - BATTLE TURN
// -----------------------------------------------------------------------		
//Moghunter.v_actor_turn[1] = ["P1_Turn_01","P1_Turn_02"];
//Moghunter.v_actor_turn[2] = ["P2_Turn_01","P2_Turn_02","P2_Turn_03"];
//Moghunter.v_actor_turn[3] = ["P3_Turn_01","P3_Turn_02"];
//Moghunter.v_actor_turn[4] = ["P4_Turn_01","P4_Turn_02","P4_Turn_03"];
// -----------------------------------------------------------------------
// ACTOR - DEFAULT ACTION (Skill/ITEM)
// -----------------------------------------------------------------------		
Moghunter.v_actor_default_action[2] = ["BGV_a01"];
Moghunter.v_actor_default_action[3] = ["BGV_e01"];
Moghunter.v_actor_default_action[4] = ["BGV_s01"];
Moghunter.v_actor_default_action[5] = ["BGV_o01"];

// -----------------------------------------------------------------------
// ACTOR - SKILL
// -----------------------------------------------------------------------	
// Moghunter.v_actor_skill[A] = {B:[C,C,C,C,...] }
// 
// A - Actor ID
// B - Skill ID
// C - File Name
// -----------------------------------------------------------------------	
Moghunter.v_actor_skill[2] = {
	54: ["BGV_a02"],
	98: ["BGV_a13"],
	99: ["BGV_a14"],
	100: ["BGV_a15"],
	101: ["BGV_a16"],
	102: ["BGV_a17"],
	103: ["BGV_a18"],
	104: ["BGV_a19"],

};


Moghunter.v_actor_skill[3] = {
	66: ["BGV_e02"],

};

Moghunter.v_actor_skill[4] = {
	78: ["BGV_s02"],

};

Moghunter.v_actor_skill[5] = {
	86: ["BGV_o02"],
	87: ["BGV_o02"],
	88: ["BGV_o03"],
	89: ["BGV_o03"],
};


// -----------------------------------------------------------------------
// ACTOR - ITEM
// -----------------------------------------------------------------------	

// -----------------------------------------------------------------------
// ACTOR - DAMAGE
// -----------------------------------------------------------------------		
Moghunter.v_actor_damage[2] = ["BGV_a04"];
Moghunter.v_actor_damage[3] = ["BGV_e04"];
Moghunter.v_actor_damage[4] = ["BGV_s04"];
Moghunter.v_actor_damage[5] = ["BGV_o05"];

// -----------------------------------------------------------------------
// ACTOR - EVADED  &   MISS
// -----------------------------------------------------------------------		
//Moghunter.v_actor_evaded[1] = ["P1_Evade_01"];
//Moghunter.v_actor_evaded[2] = ["P2_Evade_01"];
//Moghunter.v_actor_evaded[3] = ["P3_Evade_01"];
//Moghunter.v_actor_evaded[4] = ["P4_Evade_01"];	
// -----------------------------------------------------------------------
// ACTOR - COUNTER
// -----------------------------------------------------------------------		
//	Moghunter.v_actor_counter[1] = ["P1_Counter_01"];
//	Moghunter.v_actor_counter[2] = ["P2_Counter_01"];
//	Moghunter.v_actor_counter[3] = ["P3_Counter_01"];
//	Moghunter.v_actor_counter[4] = ["P4_Counter_01"];	
// -----------------------------------------------------------------------
// ACTOR - REFLECTION
// -----------------------------------------------------------------------		
//	Moghunter.v_actor_reflection[1] = ["P1_Reflection_01"];
//	Moghunter.v_actor_reflection[2] = ["P2_Reflection_01"];
//	Moghunter.v_actor_reflection[3] = ["P3_Reflection_01"];
//	Moghunter.v_actor_reflection[4] = ["P4_Reflection_01"];			
// -----------------------------------------------------------------------
// ACTOR - RECOVER
// -----------------------------------------------------------------------		
Moghunter.v_actor_recover[2] = ["BGV_a03"];
Moghunter.v_actor_recover[3] = ["BGV_e03"];
Moghunter.v_actor_recover[4] = ["BGV_s03"];
Moghunter.v_actor_recover[5] = ["BGV_o04"];

// -----------------------------------------------------------------------
// ACTOR - DEAD
// -----------------------------------------------------------------------		
Moghunter.v_actor_dead[2] = ["BGV_a05"];
Moghunter.v_actor_dead[3] = ["BGV_e05"];
Moghunter.v_actor_dead[4] = ["BGV_s05"];
Moghunter.v_actor_dead[5] = ["BGV_o06"];

// -----------------------------------------------------------------------
// ACTOR - ESCAPE
// -----------------------------------------------------------------------		
//	Moghunter.v_actor_escape[1] = ["P1_Escape_01"];
//	Moghunter.v_actor_escape[2] = ["P2_Escape_01"];
//	Moghunter.v_actor_escape[3] = ["P3_Escape_01"];
//	Moghunter.v_actor_escape[4] = ["P4_Escape_01"];
// -----------------------------------------------------------------------
// ACTOR - VICTORY
// -----------------------------------------------------------------------		
Moghunter.v_actor_victory[2] = ["BGV_a06"];
Moghunter.v_actor_victory[3] = ["BGV_e06"];
Moghunter.v_actor_victory[4] = ["BGV_s06"];
Moghunter.v_actor_victory[5] = ["BGV_o07"];

// -----------------------------------------------------------------------
// ACTOR - LEVEL UP
// -----------------------------------------------------------------------		
//	Moghunter.v_actor_levelup[1] = ["P1_Recover_02"];
//	Moghunter.v_actor_levelup[2] = ["P2_Recover_02"];
//	Moghunter.v_actor_levelup[3] = ["P3_Recover_01"];
//	Moghunter.v_actor_levelup[4] = ["P4_Recover_01"];	





// -----------------------------------------------------------------------
// ENEMY - DEFAULT ACTION
// -----------------------------------------------------------------------		
//Moghunter.v_enemy_default_action[900] = ["P1_Action_01","P1_Action_02","P1_Action_03"];
//Moghunter.v_enemy_default_action[901] = ["P2_Action_01","P2_Action_02","P2_Action_03"];
// -----------------------------------------------------------------------
// ENEMY - SKILL
// -----------------------------------------------------------------------	


//	Moghunter.v_enemy_skill[901] = {1:["P2_Action_04","P2_Action_05","P2_Action_06"]};	
// -----------------------------------------------------------------------
// ENEMY - DAMAGE
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_damage[900] = ["P1_Damage_01","P1_Damage_02","P1_Damage_03"];
//	Moghunter.v_enemy_damage[901] = ["P2_Damage_01","P2_Damage_02","P2_Damage_03"];
// -----------------------------------------------------------------------
// ENEMY - EVADED  &   MISS
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_evaded[900] = ["P1_Evade_01"];	
//	Moghunter.v_enemy_evaded[901] = ["P1_Evade_01"];
// -----------------------------------------------------------------------
// ENEMY - COUNTER
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_counter[900] = ["P1_Counter_01"];
//	Moghunter.v_enemy_counter[901] = ["P2_Counter_01"];
// -----------------------------------------------------------------------
// ENEMY - REFLECTION
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_reflection[900] = ["P1_Reflection_01"];
//	Moghunter.v_enemy_reflection[901] = ["P2_Reflection_01"];
// -----------------------------------------------------------------------
// ENEMY - RECOVER
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_recover[900] = ["P1_Recover_01","P1_Recover_02"];
//	Moghunter.v_enemy_recover[901] = ["P2_Recover_01","P2_Recover_02"];
// -----------------------------------------------------------------------
// ENEMY - DEAD
// -----------------------------------------------------------------------		
//	Moghunter.v_enemy_dead[900] = ["P1_Dead_01","P1_Dead_02"];
//	Moghunter.v_enemy_dead[901] = ["P2_Dead_01"];	





//=============================================================================
// ** Sound Manager
//=============================================================================	

//==============================
// * select Voice
//==============================
SoundManager.selectVoice = function (voices) {
	if (!voices) { return };
	if (voices.length === 0) { return };
	var voiceIndex = Math.randomInt(voices.length);
	var fileName = voices[voiceIndex];
	this.playVoice(fileName);
};

//==============================
// * Play Voice
//==============================
SoundManager.playVoice = function (fileName) {
	var se = {};
	se.name = fileName;
	se.pitch = 100;
	se.volume = Moghunter.v_volume;
	AudioManager.playSe(se);
};

//=============================================================================
// ** BattleManager
//=============================================================================	

//================================
// ** Random Actor
//================================
BattleManager.randomActor = function () {
	var actorIndex = Math.randomInt($gameParty.aliveMembers().length);
	return $gameParty.aliveMembers()[actorIndex];
};

//==================================
// ** Start Battle
//==================================
var _alias_mog_bmngr_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function () {
	_alias_mog_bmngr_startBattle.call(this);
	if (!Imported.MOG_BattleTransitions ||
		(Imported.MOG_BattleTransitions && $gameSystem._treType[1] === -1)) {
		var actor = this.randomActor();
		if (actor) { SoundManager.selectVoice(actor._v_start) };
	};
};

//==================================
// ** Process Victory
//==================================
var _alias_mog_bcry_processVictory = BattleManager.processVictory;
BattleManager.processVictory = function () {
	var actor = this.randomActor();
	if (actor) { SoundManager.selectVoice(actor._v_victory) };
	_alias_mog_bcry_processVictory.call(this);
};

//==================================
// ** Process Escape
//==================================
var _alias_mog_bcry_processEscape = BattleManager.processEscape;
BattleManager.processEscape = function () {
	var actor = this.randomActor();
	if (actor) { SoundManager.selectVoice(actor._v_escape) };
	_alias_mog_bcry_processEscape.call(this);
};

//=============================================================================
// ** Game Battler
//=============================================================================

//==============================
// * InitMembers
//==============================
var _alias_mog_batcry_gbattler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function () {
	_alias_mog_batcry_gbattler_initMembers.call(this);
	this.battleCrySetup();
};

//==============================
// * Battle Cry Setup
//==============================
Game_Battler.prototype.battleCrySetup = function () {
	this._v_start = [];
	this._v_turn = [];
	this._v_default_action = [];
	this._v_damage = [];
	this._v_evaded = [];
	this._v_counter = [];
	this._v_reflection = [];
	this._v_dead = [];
	this._v_recover = [];
	this._v_escape = [];
	this._v_victory = [];
	this._v_levelup = [];
};

//==============================
// * Battle Cry Setup Actor
//==============================
Game_Battler.prototype.battleCrySetupActor = function () {
	if (Moghunter.v_actor_start[this._actorId]) { this._v_start = Moghunter.v_actor_start[this._actorId] };
	if (Moghunter.v_actor_turn[this._actorId]) { this._v_turn = Moghunter.v_actor_turn[this._actorId] };
	if (Moghunter.v_actor_default_action[this._actorId]) {
		this._v_default_action = Moghunter.v_actor_default_action[this._actorId]
	};
	if (Moghunter.v_actor_damage[this._actorId]) { this._v_damage = Moghunter.v_actor_damage[this._actorId] };
	if (Moghunter.v_actor_evaded[this._actorId]) { this._v_evaded = Moghunter.v_actor_evaded[this._actorId] };
	if (Moghunter.v_actor_counter[this._actorId]) { this._v_counter = Moghunter.v_actor_counter[this._actorId] };
	if (Moghunter.v_actor_reflection[this._actorId]) { this._v_reflection = Moghunter.v_actor_reflection[this._actorId] };
	if (Moghunter.v_actor_dead[this._actorId]) { this._v_dead = Moghunter.v_actor_dead[this._actorId] };
	if (Moghunter.v_actor_recover[this._actorId]) { this._v_recover = Moghunter.v_actor_recover[this._actorId] };
	if (Moghunter.v_actor_escape[this._actorId]) { this._v_escape = Moghunter.v_actor_escape[this._actorId] };
	if (Moghunter.v_actor_victory[this._actorId]) { this._v_victory = Moghunter.v_actor_victory[this._actorId] };
	if (Moghunter.v_actor_levelup[this._actorId]) { this._v_levelup = Moghunter.v_actor_levelup[this._actorId] };
};

//==============================
// * Battle Cry Setup Enemy
//==============================
Game_Battler.prototype.battleCrySetupEnemy = function () {
	if (Moghunter.v_enemy_default_action[this._enemyId]) {
		this._v_default_action = Moghunter.v_enemy_default_action[this._enemyId]
	};
	if (Moghunter.v_enemy_damage[this._enemyId]) { this._v_damage = Moghunter.v_enemy_damage[this._enemyId] };
	if (Moghunter.v_enemy_evaded[this._enemyId]) { this._v_evaded = Moghunter.v_enemy_evaded[this._enemyId] };
	if (Moghunter.v_enemy_counter[this._enemyId]) { this._v_counter = Moghunter.v_enemy_counter[this._enemyId] };
	if (Moghunter.v_enemy_reflection[this._enemyId]) { this._v_reflection = Moghunter.v_enemy_reflection[this._enemyId] };
	if (Moghunter.v_enemy_dead[this._enemyId]) { this._v_dead = Moghunter.v_enemy_dead[this._enemyId] };
	if (Moghunter.v_enemy_recover[this._enemyId]) { this._v_recover = Moghunter.v_enemy_recover[this._enemyId] };
};

//===============================
// ** PerfotmAction
//===============================
var _alias_mog_bcry_performActionStart = Game_Battler.prototype.performActionStart;
Game_Battler.prototype.performActionStart = function (action) {
	if (action) { this.playVoiceAction(action) };
	_alias_mog_bcry_performActionStart.call(this, action);
};

//===============================
// ** play Voice Action
//===============================
Game_Battler.prototype.playVoiceAction = function (action) {
	var actionID = action.item().id
	if (this.isActor()) {
		if (action.isSkill() && Moghunter.v_actor_skill[this._actorId] &&
			Moghunter.v_actor_skill[this._actorId][actionID]) {
			SoundManager.selectVoice(Moghunter.v_actor_skill[this._actorId][actionID]);
			return;
		} else if (action.isItem() && Moghunter.v_actor_item[this._actorId] &&
			Moghunter.v_actor_item[this._actorId][actionID]) {
			SoundManager.selectVoice(Moghunter.v_actor_item[this._actorId][actionID]);
			return;
		};
	} else if (this.isEnemy()) {
		if (Moghunter.v_enemy_skill[this._enemyId] && Moghunter.v_enemy_skill[this._enemyId][actionID]) {
			SoundManager.selectVoice(Moghunter.v_enemy_skill[this._enemyId][actionID]);
			return;
		};
	};
	SoundManager.selectVoice(this._v_default_action);
};

//==============================
// ** perform Counter
//==============================
var _mog_btcry_gbat_performCounter = Game_Battler.prototype.performCounter;
Game_Battler.prototype.performCounter = function () {
	_mog_btcry_gbat_performCounter.call(this);
	SoundManager.selectVoice(this._v_counter);
};


//==============================
// ** perform Reflection
//==============================
var _mog_btcry_gbat_performReflection = Game_Battler.prototype.performReflection;
Game_Battler.prototype.performReflection = function () {
	_mog_btcry_gbat_performReflection.call(this);
	SoundManager.selectVoice(this._v_reflection);
};

//=============================================================================
// ** Game Actor
//=============================================================================	

//==============================
// * Setup
//==============================
var _mog_bcry_gact_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function (actorId) {
	_mog_bcry_gact_setup.call(this, actorId);
	this.battleCrySetupActor();
};

//=============================================================================
// ** Game Enemy
//=============================================================================	

//==============================
// * Setup
//==============================
var _mog_bcry_gemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function (enemyId, x, y) {
	_mog_bcry_gemy_setup.call(this, enemyId, x, y);
	this.battleCrySetupEnemy();
};

//===============================
// ** transform
//===============================
var _mog_battlecry_genemy_transform = Game_Enemy.prototype.transform;
Game_Enemy.prototype.transform = function (enemyId) {
	_mog_battlecry_genemy_transform.call(this, enemyId);
	this.battleCrySetupEnemy();
};

//=============================================================================
// ** Scene Battle
//=============================================================================	

//==============================
// * select Voice
//==============================
var _alias_mog_bcry_scbat_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function () {
	_alias_mog_bcry_scbat_start.call(this);
	this._actorvoice = null;
};

//==============================
// * Update Battle Process
//==============================
var _alias_mog_bcry_updateBattleProcess = Scene_Battle.prototype.updateBattleProcess;
Scene_Battle.prototype.updateBattleProcess = function () {
	if (this._actorvoice != BattleManager.actor()) { this.playActorTurn() };
	_alias_mog_bcry_updateBattleProcess.call(this);
};

//==============================
// * Play Actor Turn
//==============================
Scene_Battle.prototype.playActorTurn = function () {
	this._actorvoice = BattleManager.actor();
	if (this._actorvoice) {
		if (this._actorvoice._v_turn && this._actorvoice._v_turn.length > 0) {
			AudioManager.stopSe();
			SoundManager.selectVoice(this._actorvoice._v_turn)
		};
	};
};

//=============================================================================
// ** Game Action
//=============================================================================

//==============================
// * Apply
//==============================
var _alias_mog_bcry_gaction_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function (target) {
	var old_hp = target.hp
	_alias_mog_bcry_gaction_apply.call(this, target);
	if ($gameParty.inBattle()) {
		if (old_hp != target.hp || this.item().damage.type === 3) { this.playVoiceHP(old_hp, target.hp, target) };
		if (target.result().missed || target.result().evaded) { SoundManager.selectVoice(target._v_evaded) };
	};
};

//==============================
// * Play Voice HP
//==============================
Game_Action.prototype.playVoiceHP = function (old_hp, now_hp, target) {
	if (target.isDead()) {
		SoundManager.selectVoice(target._v_dead);
	} else if (old_hp < now_hp || this.item().damage.type === 3) {
		SoundManager.selectVoice(target._v_recover);
	} else if (old_hp > now_hp) {
		SoundManager.selectVoice(target._v_damage);
	};
};

//==============================
// * Item Effect Recover HP
//==============================
var _alias_mog_btcry_gact_itemEffectRecoverHp = Game_Action.prototype.itemEffectRecoverHp;
Game_Action.prototype.itemEffectRecoverHp = function (target, effect) {
	var old_hp = target.hp;
	_alias_mog_btcry_gact_itemEffectRecoverHp.call(this, target, effect)
	if (old_hp <= target.hp) { SoundManager.selectVoice(target._v_recover) };
};
