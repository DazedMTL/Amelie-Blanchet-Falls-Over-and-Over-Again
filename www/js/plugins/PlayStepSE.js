//=============================================================================
// PlayStepSE.js
//=============================================================================

/*:
 * @plugindesc Play footstep SE for each character, each region
 * @author Sasuke KANNAZUKI
 * 
 * @param Play Player Step SE
 * @desc Whether to play footstep SE of Player by default (true/false)
 * @default false
 * 
 * @param Default SE Filename
 * @desc default footstep SE filename for every characters
 * @default Equip2
 * @require 1
 * @dir audio/se/
 * @type file
 * 
 * @param Default Volume
 * @desc default footstep SE volume. (90 is normal)
 * @default 20
 * 
 * @param Default Pitch
 * @desc default footstep SE pitch (100 is normal)
 * @default 60
 * 
 * @param Default Interval
 * @desc default interval. it'll play SE for each this count step.
 * @default 1
 * 
 * @param Enable in EventRunning
 * @desc Whether to play footstep SE at event running(true/false)
 * @default false
 * 
 * @help
 * This plugin enables player and events' footstep SE.
 * It can set different SE for each character and each region.
 * You can configure footstep SE by plugin command, note in map/event,
 * and plugin parameter.(the former is higher priority)
 * 
 * [PARAMETER]
 * - You can set default SE and whether to play player's footstep SE.
 * - This priority is lower than note and plugin commands
 * 
 * ［NOTE］
 * ・MAP
 * <StepSE:filename,volume,pitch,interval>  #=> default footstep SE in the map
 * <StepRegion<regionId>SE:filename,volume,pitch,interval>
 *  #=> default footstep SE in the specified region of the map
 * 
 * - At the map with no StepSE notation in note, defalut footstep SE becomes
 *   the one set in the plugin command, otherwise default in parameter.
 * - In order to validate map SE configuration, set the character's footstep
 *   setting be ON by either plugin command , note, or parameter.
 * - Where 'StepRegion<regionId>SE' means replace <regionId> to the number,
 *   such as StepRegion1SE or StepRegion255SE.
 * - When you describe without after : like <StepSE><StepRegion10SE>,
 *   silence is set as the default.
 * 
 * ・EVENT
 * <StepSE:filename,volume,pitch,interval> #=> default footstep SE by the event
 * <StepRegion<regionId>SE:filename,volume,pitch,interval>
 *  #=> default footstep SE at the specified region of the event
 * 
 * - You may cannot enumurate so much notations in Event's note,
 *   so I recommend you to set several event's configuration by plugin command.
 * - When you write above at a event note, the event's footstep SE
 *   is ON by default, otherwise OFF by default.
 * 
 * ・COMMON SETTING IN NOTE
 * - you can set SE to plural regions. if the region's SE is not set,
 *   it'll play default footstep SE.
 * - filename, volume, pitch, and interval are omissible.
 *  default is empty string,100,90,1.
 *  where interval set, it'll play SE for each the count step.
 * 
 * example of notations:
 * <StepSe:Coin,100>
 * <StepRegion12SE:Coin,90,150>
 * <StepRegion5SE:Noise,20,150,3>
 * 
 * [PLUGIN COMMAND]
 * ・SET/RESET DEFAULT FOOTSTEP SE:
 * PlayStepSE default set <filename> <volume> <pitch> <interval>
 * PlayStepSE default reset
 * PlayStepSE player set <filename> <volume> <pitch> <interval>
 * PlayStepSE player reset
 * PlayStepSE event <eventId> set <filename> <volume> <pitch> <interval>
 * PlayStepSE event <eventId> reset
 * 
 * ・SET/RESET REGION FOOTSTEP SE:
 * PlayStepSE region <regionId> set <filename> <volume> <pitch> <interval>
 * PlayStepSE region <regionId> reset
 * PlayStepSE player region <regionId> set <filename> <volume> <pitch> <interval>
 * PlayStepSE player region <regionId> reset
 * PlayStepSE event <eventId> region <regionId> set <filename> <volume> <pitch>  <interval>
 * PlayStepSE event <eventId> region <regionId> reset
 * PlayStepSE region <regionId> allreset 
 *  #=> reset all of the region's default, player, events SE
 * 
 * - <filename> <volume> <pitch> and <interval> are omissible.
 *   default value is empty string, 100, 90, 1.
 * - <interval> means it plays SE each <interval> steps.
 * - plugin command setting is higher priority than note and parameters.
 * - events' setting is all reset when map transfer performed,
 *   while player's settings are remain forever unless perform reset.
 * - To set specified region's footstep silent, use following notations:
 *   PlayStepSE player set  #=> mute player's footstep
 *   PlayStepSE region 10 set  #=> mute footstep at region 10
 *   PlayStepSE player region 10 set  #=> mute player's footstep at region 10
 * 
 * ・PLAY/STOP FOOTSTEP SE
 * PlayStepSE play player
 * PlayStepSE stop player
 * PlayStepSE play event <eventId>
 * PlayStepSE stop event <eventId>
 * 
 * - events' setting are reset when map transform performed,
 *   while player's setting remains forever.
 * 
 * ・PLAY/STOP FOOTSTEP SE ON EVENT
 * PlayStepSE onEvent set
 * PlayStepSE onEvent reset
 * 
 * [SUMMARY OF FOOTSTEP SE SETTING PRIORITY]
 * former is higher priority.
 * ・WHETHER TO PLAY PLAYER'S FOOTSTEP
 *  - setting by plugin command
 *  - setting in parameter (Play Player Step SE)
 * ・WHETHER TO PLAY EVENTS' FOOTSTEP
 *  - setting by plugin command
 *  - ON if setting in note, otherwise OFF
 * ・PLAYER'S FOOTSTEP SE
 *  - player's region SE set by plugin command
 *  - common region SE set by plugin command
 *  - region SE setting in the map note (StepRegion???SE)
 *  - player's SE set by plugin command
 *  - common SE setting in the map note (StepSE)
 *  - default SE set by the plugin command
 *  - parameter(Default SE Filename)
 * ・EVENT'S FOOTSTEP SE
 *  - event's region SE set by plugin command
 *  - region SE setting in the event note (StepRegion???SE)
 *  - common region SE set by plugin command
 *  - region SE setting in the map note (StepRegion???SE)
 *  - event's SE set by plugin command
 *  - common SE setting in the event note (StepSE)
 *  - common SE setting in the map note (StepSE)
 *  - default SE set by the plugin command
 *  - parameter(Default SE Filename)
 * 
 * [CAUTION]
 * SE files set in either map/event note or plugin command may be excluded
 * when check 'Exclude unused files' option at deproyment!
 * To prevent this, for example, make dummy event and set SE files at
 * command 'Play SE'.
 */
/*:ja
 * @plugindesc プレイヤーとイベントの足音を演奏します
 * @author 神無月サスケ
 * 
 * @param Play Player Step SE
 * @desc デフォルトでプレイヤーの足音を出すかどうか(true:する false:しない)
 * @default false
 * 
 * @param Default SE Filename
 * @desc デフォルトの足音SEファイル名
 * @default Equip2
 * @require 1
 * @dir audio/se/
 * @type file
 * 
 * @param Default Volume
 * @desc デフォルトの足音ボリューム 
 * @default 20
 * 
 * @param Default Pitch
 * @desc デフォルトの足音ピッチ
 * @default 60
 * 
 * @param Default Interval
 * @desc デフォルトのインターバル。n歩ごとにSEを演奏
 * @default 1
 * 
 * @param Enable in EventRunning
 * @desc イベント中に音を出すか(true:する false:しない)
 * @default false
 * 
 * @help
 * プレイヤーとイベントの足音の設定を行います。
 * リージョン毎の指定も可能なのが特徴です。
 * 優先順位順にプラグインコマンド、マップやイベントでのメモ、
 * パラメータでの設定が可能です。
 * 
 * [パラメータ]
 * - デフォルトのSEおよびプレイヤーの演奏の是非を設定
 * - メモやプラグインコマンドに設定がある場合、そちらが優先
 * 
 * ［メモ］
 * ・マップ
 * <StepSE:filename,volume,pitch,interval> マップ内のデフォルトの足音を設定
 * <StepRegion<regionId>SE:filename,volume,pitch,interval> マップ内の
 *  指定したリージョンでの足音を設定
 * 
 * - StepSE設定のないマップでは「パラメータまたはプラグインコマンドで設定した
 *   デフォルト」に
 * - マップのメモに設定があっても、自動的にはONにならない。
 *   プラグインコマンドで各キャラをONにする必要あり
 * - StepRegion<regionId>SE とは、StepRegion1SE やStepRegion255SE のように
 *   RegionIdを指定する形式のこと
 * - <StepSE><StepRegion10SE>のように : 以下を省略した場合、無音が設定される
 * 
 * ・イベント
 * <StepSE:filename,volume,pitch,interval> イベントのデフォルトの足音を設定
 * <StepRegion<regionId>SE:filename,volume,pitch,interval>
 *  イベントの指定したリージョンでの足音を設定
 * 
 * - イベントのメモに設定がある場合、デフォルトで足音ON。そうでない場合、OFF
 * - イベントのメモ欄に多数は書けないので、
 *   イベントのリージョンを多数指定したい場合、
 *   いくつかはプラグインコマンドで書くといい
 * 
 * ・メモ共通
 * - リージョンは複数指定可能。指定のないリージョンではデフォルトの足音を採用
 * - filename,volume,pitch,interval は省略可。
 *  省略の場合 空文字,100,90,1が設定される。
 *  interval とは何歩毎にSEを演奏するか
 * 
 * 例：
 * <StepSe:Coin,100>
 * <StepRegion12SE:Coin,90,150>
 * <StepRegion5SE:Noise,20,150,3>
 * 
 * [プラグインコマンド]
 * ・デフォルト足音の一時的変更
 * PlayStepSE default set <filename> <volume> <pitch> <interval>
 *  # ↑デフォルト設定を変更
 * PlayStepSE default reset  # デフォルト設定をリセット
 * PlayStepSE player set <filename> <volume> <pitch> <interval>
 *  # ↑プレイヤーの設定を変更
 * PlayStepSE player reset  # プレイヤーの設定をリセット
 * PlayStepSE event <eventId> set <filename> <volume> <pitch> <interval>
 *  # ↑イベントの設定を一時的に変更
 * PlayStepSE event <eventId> reset  # イベントの設定をリセット
 * 
 * ・リージョン関係の足音の一時的変更
 * PlayStepSE region <regionId> set <filename> <volume> <pitch> <interval>
 *  # ↑リージョンSE(共通)の設定を変更
 * PlayStepSE region <regionId> reset # リージョンSE(共通)をリセット
 * PlayStepSE player region <regionId> set <filename> <volume> <pitch> <interval>
 *  # ↑プレイヤーのリージョン設定を変更
 * PlayStepSE player region <regionId> reset
 *  # ↑プレイヤーのリージョン設定をリセット
 * PlayStepSE event <eventId> region <regionId> set <filename> <volume> <pitch>  <interval>
 *  # ↑イベントのリージョン設定を一時的に変更
 * PlayStepSE event <eventId> region <regionId> reset
 *  # ↑イベントのリージョン設定をリセット
 * PlayStepSE region <regionId> allreset 
 *  # ↑リージョンSE(共通)、プレイヤー、イベントの設定を一括リセット。
 *    マップの設定に戻す
 * 
 * - <filename> <volume> <pitch>  <interval> は省略可能で、省略した場合、
 *   空文字, 100, 90, 1 が設定される
 * - <interval> とは何歩毎にSEを演奏するか
 * - パラメータやメモの設定よりもプラグインコマンドが優先
 * - イベントの設定は、マップ移動が行われると、自動的にリセット
 * - プレイヤー、リージョンの設定はマップ移動が行われても持続。
 *   よってマップの設定に変更したい場合 reset や allreset を行うこと
 * - 「特定のリージョンだけ音を出したくない」という場合、そのリージョンの
 *   <filename>以下を全て省略するといい
 *   例：
 *   PlayStepSE player set  # プレイヤーの足音を無音に設定
 *   PlayStepSE region 10 set  # リージョン10の足音を無音に設定
 *   PlayStepSE player region 10 set  # プレイヤーのリージョン10の足音を無音に
 * 
 * ・設定音の演奏・停止の変更
 * PlayStepSE play player  # プレイヤーの足音を演奏開始
 * PlayStepSE stop player  # プレイヤーの足音を停止
 * PlayStepSE play event <eventId>  # 指定したイベントの足音を演奏開始
 * PlayStepSE stop event <eventId>  # 指定したイベントの足音を停止
 * 
 * - プレイヤーの設定は持続する。イベントの設定はマップ移動で自動的にリセット
 * 
 * ・イベント中足音演奏・停止の変更
 * PlayStepSE onEvent set   # イベント中でも足音を演奏するように設定
 * PlayStepSE onEvent reset # イベント中は足音を停止するように設定
 * 
 * [足音決定の優先順位の整理]
 * 設定がいろいろ複雑なので、優先順位を確認してください。
 * これで不便な場合、プラグイン作者までご連絡ください。
 * 
 * ・プレイヤーの足音を演奏するか
 *  - プラグインコマンドでの設定が優先
 *  - プラグインコマンドで設定しない場合、パラメータの設定(Play Player Step SE)
 * ・イベントの足音を演奏するか
 *  - プラグインコマンドでの設定が優先
 *  - プラグインコマンドで設定していない場合、イベントのメモに記述があればON、
 *    なければOFF
 * ・プレイヤーの足音
 *  - プラグインコマンドでのプレイヤーのリージョンSE
 *    (set で設定、 reset で設定解除。以下のプラグインコマンドも同様)
 *  - プラグインコマンドでの共通リージョンのSE
 *  - マップのメモのStepRegion???SE
 *  - プラグインコマンドでのプレイヤーのSE
 *  - マップのメモのStepSE
 *  - プラグインコマンドでのデフォルトのSE
 *  - パラメータ(Default SE Filename)
 * ・イベントの足音
 *  - プラグインコマンドでのイベントのリージョンSE
 *  - イベントのメモでのStepRegion???SE
 *  - プラグインコマンドでの共通リージョンSE
 *  - マップのメモのStepRegion???SE
 *  - プラグインコマンドでのイベントのSE
 *  - イベントのメモでのStepSE
 *  - マップのメモのStepSE
 *  - プラグインコマンドでのデフォルトのSE
 *  - パラメータ(Default SE Filename)
 * 
 * [注意]
 * - プラグインコマンドやメモで設定したSEファイルは不要ファイル削除ツールに
 *   必要ファイルとして登録されない。不要ファイル削除ツールを使う想定の場合
 *   ダミーのイベントを作成し、そこで設定するなど工夫が必要
 */
(function () {
  //
  // process options
  //
  var parameters = PluginManager.parameters('PlayStepSE');
  var defaultPlayerStepSeEnabled = !!eval(parameters['Play Player Step SE']);
  var playStepSeOnEvent = !!eval(parameters['Enable in EventRunning']);
  var defaultStepSe = {};
  defaultStepSe.name = parameters['Default SE Filename'] || '';
  defaultStepSe.volume = Number(parameters['Default Volume'] || 90);
  defaultStepSe.pitch = Number(parameters['Default Pitch'] || 100);
  defaultStepSe.interval = Number(parameters['Default Interval'] || 1);

  //
  // process plugin commands
  //
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'PlayStepSE') {
      // define utility function
      var argsToSe = function (op) {
        var se = {};
        se.name = args[op] || '';
        se.volume = Number(args[op + 1] || 90);
        se.pitch = Number(args[op + 2] || 100);
        se.interval = Number(args[op + 3] || 1);
        return se;
      };
      // parse parameters
      switch (args[0]) {
        case 'onEvent':
          switch (args[1]) {
            case 'set':
              $gameSystem.playStepSeOnEvent = true;
              break;
            case 'reset':
              $gameSystem.playStepSeOnEvent = false;
              break;
          }
          break;
        case 'play':
        case 'stop':
          var enabled = args[0] === 'play';
          switch (args[1]) {
            case 'player':
              $gamePlayer.stepEnabledByCommand = enabled;
              break;
            case 'event':
              var event = $gameMap.event(Number(args[2]));
              if (event) {
                event.stepEnabledByCommand = enabled;
              }
              break;
          }
          break;
        case 'default':
          switch (args[1]) {
            case 'set':
              $gameMap.stepDefalutSeByCommand = argsToSe(2);
              break;
            case 'reset':
              $gameMap.stepDefalutSeByCommand = null;
              break;
          }
          break;
        case 'region':
          var id = Number(args[1]);
          $gameMap.stepRegionSeByCommand = $gameMap.stepRegionSeByCommand || [];
          if (id) {
            switch (args[2]) {
              case 'set':
                $gameMap.stepRegionSeByCommand[id] = argsToSe(3);
                break;
              case 'reset':
                $gameMap.stepRegionSeByCommand[id] = null;
                break;
              case 'allreset':
                $gameMap.stepRegionSeByCommand[id] = null;
                $gamePlayer.stepRegionSeByCommand =
                  $gamePlayer.stepRegionSeByCommand || [];
                $gamePlayer.stepRegionSeByCommand[id] = null;
                $gameMap.events().forEach(function (event) {
                  event.stepRegionSeByCommand = event.stepRegionSeByCommand || [];
                  event.stepRegionSeByCommand[id] = null;
                });
                break;
            }
          }
          break;
        case 'player':
          switch (args[1]) {
            case 'set':
              $gamePlayer.stepSeByCommand = argsToSe(2);
              break;
            case 'reset':
              $gamePlayer.stepSeByCommand = null;
              break;
            case 'region':
              var id = Number(args[2]);
              $gamePlayer.stepRegionSeByCommand =
                $gamePlayer.stepRegionSeByCommand || [];
              switch (args[3]) {
                case 'set':
                  $gamePlayer.stepRegionSeByCommand[id] = argsToSe(4);
                  break;
                case 'reset':
                  $gamePlayer.stepRegionSeByCommand[id] = null;
                  break;
              }
              break;
          }
          break;
        case 'event':
          var event = $gameMap.event(Number(args[1]));
          if (event) {
            event.stepSeEnabled = true;
            switch (args[2]) {
              case 'set':
                event.stepSeByCommand = argsToSe(3);
                break;
              case 'reset':
                event.stepSeByCommand = null;
                break;
              case 'region':
                var id = Number(args[3]);
                event.stepRegionSeByCommand = event.stepRegionSeByCommand || [];
                switch (args[4]) {
                  case 'set':
                    event.stepRegionSeByCommand[id] = argsToSe(5);
                    break;
                  case 'reset':
                    event.stepRegionSeByCommand[id] = null;
                    break;
                }
                break;
            }
            break;
          }
      }
    }
  };

  //
  // routine to process note
  //
  var noteValueToSe = function (value) {
    if (value === true) {
      return { name: '', volume: 90, pitch: 100 };
    } else if (value) {
      var arr = value.split(',');
      var se = {};
      se.name = arr[0];
      se.volume = Number(arr[1] || 90);
      se.pitch = Number(arr[2] || 100);
      se.interval = Number(arr[3] || 1);
      return se;
    }
    return null;
  }

  var processNote = function (meta) {
    if (!meta) { // when note is not set (ex.event test mode)
      return false;
    }
    var someoneSet = false;
    // general setting
    this.stepSeInMemo = noteValueToSe(meta.StepSE);
    if (this.stepSeInMemo) {
      someoneSet = true;
    }
    // region setting
    var se;
    for (var i = 1; i <= 255; i++) {
      se = noteValueToSe(meta['StepRegion' + i + 'SE']);
      if (se) {
        this.stepRegionSeInMemo[i] = se;
        someoneSet = true;
      }
    }
    return someoneSet;
  };

  //
  // define variables for options (and set note)
  //
  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function (mapId) {
    _Game_Map_setup.call(this, mapId);
    this.stepSeInMemo = null;
    this.stepRegionSeInMemo = [];
    this.stepRegionSeByCommand = [];
    this.stepDefalutSeByCommand = null;
    processNote.call(this, $dataMap.meta);
  };

  var _Game_CharacterBase_initMembers =
    Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function () {
    _Game_CharacterBase_initMembers.call(this);
    this.stepSeEnabledByCommand = null;
    this.stepSeByCommand = null;
    this.stepRegionSeByCommand = [];
    this.stepEnabledByCommand = null;
    this.stepCount = 0;
  };

  var _Game_Event_initMembers = Game_Event.prototype.initMembers;
  Game_Event.prototype.initMembers = function () {
    _Game_Event_initMembers.call(this);
    this.stepSeEnabled = false;
    this.stepSeInMemo = null;
    this.stepRegionSeInMemo = [];
  };

  var _Game_Event_initialize = Game_Event.prototype.initialize;
  Game_Event.prototype.initialize = function (mapId, eventId) {
    _Game_Event_initialize.call(this, mapId, eventId);
    this.stepSeEnabled = processNote.call(this, this.event().meta);
  };

  var _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    _Game_System_initialize.call(this);
    this.playStepSeOnEvent = null;
  };

  //
  // check routine whether to play sound or not
  //
  Game_CharacterBase.prototype.stepSoundEnabled = function () {
    return false;
  };

  Game_Player.prototype.stepSoundEnabled = function () {
    if (this.stepEnabledByCommand != null) {
      return this.stepEnabledByCommand;
    } else {
      return defaultPlayerStepSeEnabled;
    }
  };

  Game_Event.prototype.stepSoundEnabled = function () {
    if (this.stepEnabledByCommand != null) {
      return this.stepEnabledByCommand;
    } else {
      return !!this.stepSeEnabled;
    }
  };

  //
  // sound finding routine
  //
  Game_CharacterBase.prototype.stepSound = function (regionId) {
    return { name: '', volume: 90, pitch: 100 };
  };

  Game_Player.prototype.stepSound = function (regionId) {
    var se;
    if ((se = this.stepRegionSeByCommand) && se[regionId]) {
      return se[regionId];
    } else if ((se = $gameMap.stepRegionSeByCommand) && se[regionId]) {
      return se[regionId];
    } else if ((se = $gameMap.stepRegionSeInMemo) && se[regionId]) {
      return se[regionId];
    } else if (se = this.stepSeByCommand) {
      return se;
    } else if (se = $gameMap.stepSeInMemo) {
      return se;
    } else if (se = $gameMap.stepDefalutSeByCommand) {
      return se;
    } else {
      return defaultStepSe;
    }
  };

  Game_Event.prototype.stepSound = function (regionId) {
    var se;
    if ((se = this.stepRegionSeByCommand) && se[regionId]) {
      return se[regionId];
    } else if ((se = this.stepRegionSeInMemo) && se[regionId]) {
      return se[regionId];
    } else if ((se = $gameMap.stepRegionSeByCommand) && se[regionId]) {
      return se[regionId];
    } else if ((se = $gameMap.stepRegionSeInMemo) && se[regionId]) {
      return se[regionId];
    } else if (se = this.stepSeByCommand) {
      return se;
    } else if (se = this.stepSeInMemo) {
      return se;
    } else if (se = $gameMap.stepSeInMemo) {
      return se;
    } else if (se = $gameMap.stepDefalutSeByCommand) {
      return se;
    } else {
      return defaultStepSe;
    }
  };

  //
  // judge occasion and interval routine
  //
  var _playStepSeOnEvent = function () {
    if ($gameSystem.playStepSeOnEvent != null) {
      return $gameSystem.playStepSeOnEvent;
    }
    return playStepSeOnEvent;
  };

  var stepSoundOccasionOK = function () {
    if (!_playStepSeOnEvent() && $gameMap.isEventRunning()) {
      return false;
    }
    return true;
  };

  var stepSoundIntervalMet = function (audio) {
    if (!audio.interval || audio.interval === 1) {
      return true;
    } else {
      return this.stepCount % audio.interval === 0;
    }
  };

  //
  // routine at each step
  //
  var _Game_CharacterBase_increaseSteps =
    Game_CharacterBase.prototype.increaseSteps;
  Game_CharacterBase.prototype.increaseSteps = function () {
    _Game_CharacterBase_increaseSteps.call(this);
    this.stepCount = this.stepCount || 0;
    this.stepCount++;
    if (this.stepSoundEnabled() && stepSoundOccasionOK()) {
      var audio = this.stepSound(this.regionId());
      if (audio && stepSoundIntervalMet.call(this, audio)) {
        AudioManager.playSe(audio);
      }
    }
  };
})();
