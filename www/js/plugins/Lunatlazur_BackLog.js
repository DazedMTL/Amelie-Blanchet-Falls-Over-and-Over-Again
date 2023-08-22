//=============================================================================
// Lunatlazur_BackLog.js
// ----------------------------------------------------------------------------
// Copyright (c) 2019 Taku Aoi
// This plugin is released under the zlib License.
// https://zlib.net/zlib_license.html
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2021-05-16
// ----------------------------------------------------------------------------
// [Web]    : https://lunatlazur.com
// [Twitter]: https://twitter.com/aoitaku
// [GitHub] : https://github.com/lunatlazur
//=============================================================================
/*:
 * @plugindesc Show message back log
 * @author Taku Aoi
 * @help This plugin shows message back log.
 *
 * Usage
 * =====
 *
 * The backlog feature is enabled by default when you install the plugin.
 * To disable or re-enable the backlog function, use the plug-in command
 * to enable / disable it.
 *
 *
 * Plug-in command list
 * ====================
 *
 * ENABLE_BACKLOG
 * --------------
 *
 *     ENABLE_BACKLOG
 *
 * Enable backlog.
 * The backlog is displayed by scrolling up the mouse wheel or pressing
 * the PageUp key.
 *
 * DISABLE_BACKLOG
 * ---------------
 *
 *     DISABLE_BACKLOG
 *
 * Disable the backlog.
 * The backlog is not displayed even if the mouse wheel is scrolled up
 * or the PageUp key is entered.
 *
 *
 * Changelog
 * =========
 *
 * 1.1.0 2021-05-16
 * ----------------
 * - Added plugin parameters to choose whether to make the backlog
 *   layout 2 columns
 *
 * 1.0.0 2019-12-21
 * ----------------
 * - Published.
 *
 *
 * @param 2-columns layout
 * @desc Select whether to display the backlog in two columns.
 * `Yes` to diplay in two columns.
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 */
/*:ja
 * @plugindesc バックログ表示プラグイン
 * @author あおいたく
 * @help このプラグインはバックログを表示できるようにします。
 *
 * 名前ウィンドウ表示プラグイン、メッセージ表示継続プラグインと同時に使う場合は、
 * 本プラグインを上記プラグインよりも下に配置してください。
 *
 * 使い方
 * ======
 *
 * プラグインを導入した状態では、バックログ機能はデフォルトで有効になっています。
 * バックログ機能を無効化したり再度有効化したりする場合は、プラグインコマンドで
 * 適宜、有効・無効の切替を行ってください。
 *
 *
 * プラグインコマンド一覧
 * ======================
 *
 * バックログの有効化
 * ------------------
 *
 *     バックログの有効化
 *
 * バックログを有効化します。
 * 以降、マウスホイールのスクロールアップや PageUp キーの入力でバックログを
 * 表示することができます。
 *
 *
 * バックログの無効化
 * ------------------
 *
 *     バックログの無効化
 *
 * バックログを無効化します。
 * 以降、マウスホイールのスクロールアップや PageUp キーの入力でバックログを
 * 表示できなくなります。
 *
 *
 * 変更履歴
 * ========
 *
 * 1.1.0 2021-05-16
 * ----------------
 * - 2カラムレイアウトにするかどうか選択できるようにプラグインパラメータを追加
 *
 * 1.0.0 2019-12-21
 * ----------------
 * - 公開
 *
 *
 * @param 2カラムレイアウト
 * @desc バックログの表示を2カラムにするかどうかを選択します。
 * `する` で2カラムで表示します。
 * @type boolean
 * @on する
 * @off しない
 * @default true
 */
(function () {
    'use strict';

    const pluginName = 'Lunatlazur_BackLog';
    function getValue(params, ...names) {
        let found = null;
        names.forEach((name) => {
            if (!!params[name]) {
                found = params[name];
            }
        });
        return found;
    }
    function asNumber(params, ...names) {
        return parseInt(getValue(params, ...names), 10);
    }
    function asBoolean(params, ...names) {
        const value = getValue(params, ...names).toLowerCase();
        return value === 'true' || value === 'on';
    }
    const parameters = PluginManager.parameters(pluginName);
    const maxNumberOfMessages = 100;
    const isMultiColumnLayout = asBoolean(parameters, '2カラムレイアウト', '2-columns layout');
    const actorNameWindowPlugin = {
        enabled: false,
    };
    if (PluginManager._scripts.includes('Lunatlazur_ActorNameWindow')) {
        actorNameWindowPlugin.enabled = true;
        const parameters = PluginManager.parameters('Lunatlazur_ActorNameWindow');
        actorNameWindowPlugin.params = {
            textColor: asNumber(parameters, 'テキストカラー'),
            horizontalOffset: asNumber(parameters, '水平位置'),
        };
    }
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        switch ((command || '').toUpperCase()) {
            case 'ENABLE_BACKLOG':
            case 'バックログの有効化':
                BackLogManager.enable();
                break;
            case 'DISABLE_BACKLOG':
            case 'バックログの無効化':
                BackLogManager.disable();
                break;
        }
    };
    class BackLogManager {
        static initialize() {
            this._backLog = { rows: [] };
            this._hiddenWindows = [];
            this._enabled = true;
            this._busy = false;
        }
        static makeSaveContents() {
            return {
                enabled: this._enabled,
            };
        }
        static extractSaveContents(contents) {
            if (contents.backLogState) {
                this._enabled = contents.backLogState.enabled;
            }
        }
        static get numberOfRows() {
            return this._backLog.rows.length;
        }
        static get hiddenWindows() {
            return this._hiddenWindows;
        }
        static get disabled() {
            return !this._enabled;
        }
        static enable() {
            this._enabled = true;
        }
        static disable() {
            this._enabled = false;
        }
        static pushRow(text, actorName) {
            if (maxNumberOfMessages <= this.numberOfRows) {
                this._backLog.rows.shift();
            }
            this._backLog.rows.push({ text, actorName });
        }
        static pushHiddenWindow(...windows) {
            this._hiddenWindows.push(...windows);
        }
        static clearHiddenWindows() {
            this._hiddenWindows = [];
        }
        static clearRows() {
            this._backLog.rows = [];
        }
        static scrolledContent(offset, length) {
            return [...this._backLog.rows].reverse().slice(offset, offset + length);
        }
        static isBusy() {
            return this._busy;
        }
        static setBusy(busy) {
            this._busy = busy;
        }
    }
    BackLogManager._backLog = {
        rows: [],
    };
    BackLogManager._hiddenWindows = [];
    BackLogManager._enabled = true;
    BackLogManager._busy = false;
    const DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        DataManager_createGameObjects.apply(this, arguments);
        BackLogManager.initialize();
    };
    const DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = DataManager_makeSaveContents.call(this);
        contents.backLogState = BackLogManager.makeSaveContents();
        return contents;
    };
    const DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        DataManager_extractSaveContents.apply(this, arguments);
        BackLogManager.extractSaveContents(contents);
    };
    const Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function () {
        Scene_Map_createDisplayObjects.call(this);
        this._backLogWindow = new Window_BackLog();
        this.addChild(this._backLogWindow);
    };
    const Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        const threshold = 20;
        if (this._backLogWindow.visible) {
            this._backLogWindow.update();
            return;
        }
        Scene_Map_update.call(this);
        if (BackLogManager.disabled) {
            return;
        }
        if (this._messageWindow.isClosing() || this._messageWindow.isOpening()) {
            return;
        }
        if (this._scrollTextWindow.visible) {
            return;
        }
        if (Input.isTriggered('pageup') || TouchInput.wheelY <= -threshold) {
            if (this._messageWindow.isOpen()) {
                BackLogManager.pushHiddenWindow(this._messageWindow);
                const visibleWindows = [...this._messageWindow.subWindows()].filter((window) => {
                    return window.visible;
                });
                if (!this._messageWindow._hideMessageManager) {
                    visibleWindows.forEach((window) => window.hide());
                    BackLogManager.pushHiddenWindow(...visibleWindows);
                }
                this._messageWindow._showFast = true;
                this._messageWindow.hide();
            }
            if (this._mapNameWindow.isOpen()) {
                BackLogManager.pushHiddenWindow(this._mapNameWindow);
                this._mapNameWindow.hide();
            }
            this._backLogWindow.offset = 0;
            this._backLogWindow.show();
        }
    };
    const Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        Window_Message_startMessage.call(this);
        if (BackLogManager.isBusy()) {
            return;
        }
        BackLogManager.setBusy(true);
        const lines = this._textState.text.split('\n');
        const numVisibleRows = this.numVisibleRows();
        lines.reduce((prev, _, index) => {
            return (index % numVisibleRows ? prev : [...prev, lines.slice(index, index + numVisibleRows).join('\n')]);
        }, []).forEach((row) => {
            BackLogManager.pushRow(row, this._nameWindow && this._nameWindow.visible && this._nameWindow._text);
        });
    };
    const Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        BackLogManager.setBusy(false);
        Window_Message_terminateMessage.call(this);
    };
    class Window_BackLog extends Window_Base {
        constructor(_) {
            super();
            this.initialize.apply(this, arguments);
        }
        initialize(fontSize) {
            super.initialize(0, 0, Graphics.width, Graphics.height);
            this._fontSize = fontSize || 28;
            this.offset = 0;
            this._stayCount = 0;
            this._touching = false;
            this.deactivate();
            this.hide();
        }
        messageWindow() {
            return SceneManager._scene._messageWindow;
        }
        standardPadding() {
            return 4;
        }
        standardFontSize() {
            return this._fontSize;
        }
        standardFontFace() {
            return Window_Message.prototype.standardFontFace.call(this);
        }
        rowHeight() {
            const padding = 18;
            let rowsPerMessage;
            if (isMultiColumnLayout) {
                rowsPerMessage = this.messageWindow().numVisibleRows();
            }
            else {
                rowsPerMessage = this.messageWindow().numVisibleRows() + (actorNameWindowPlugin.enabled ? 1 : 0);
            }
            return this.lineHeight() * rowsPerMessage + padding * 2;
        }
        numVisibleRows() {
            return Math.floor(Graphics.height / this.rowHeight());
        }
        update() {
            Window_Base.prototype.update.call(this);
            this.updateArrows();
            this.processHandling();
            this.processWheel();
            this.processTouch();
            this._stayCount++;
        }
        updateArrows() {
            this.downArrowVisible = this.offset > 0;
            this.upArrowVisible = this.offset < BackLogManager.numberOfRows - 1;
        }
        _refreshArrows() {
            Window.prototype._refreshArrows.call(this);
            this._downArrowSprite.move(this.width - 16, this._downArrowSprite.y);
            this._upArrowSprite.move(this.width - 16, this._upArrowSprite.y);
        }
        refresh() {
            this.createContents();
            this.contents.clear();
            this.resetFontSettings();
            this.updateArrows();
            this.drawRows(this.offset);
            this._stayCount = 0;
        }
        rewind() {
            if (this.offset > 0) {
                this.offset -= 1;
                this.refresh();
            }
        }
        forward() {
            if (this.offset < BackLogManager.numberOfRows - 1) {
                this.offset += 1;
                this.refresh();
            }
        }
        rewindPage() {
            const offset = this.offset;
            this.offset -= this.numVisibleRows();
            if (this.offset < 0) {
                this.offset = 0;
            }
            if (offset !== this.offset) {
                this.refresh();
            }
        }
        forwardPage() {
            const offset = this.offset;
            this.offset += this.numVisibleRows();
            if (this.offset >= BackLogManager.numberOfRows) {
                this.offset = BackLogManager.numberOfRows - 1;
            }
            if (offset !== this.offset) {
                this.refresh();
            }
        }
        isCancelTriggered() {
            return Input.isRepeated('cancel');
        }
        processHandling() {
            if (Input.isRepeated('up')) {
                this.forward();
            }
            if (Input.isRepeated('down')) {
                this.rewind();
            }
            if (this.isCancelTriggered()) {
                this.processCancel();
            }
            else if (Input.isTriggered('pageup')) {
                this.forwardPage();
            }
            else if (Input.isTriggered('pagedown')) {
                this.rewindPage();
            }
        }
        processCancel() {
            this.hide();
            BackLogManager.hiddenWindows.forEach((window) => {
                window.show();
            });
            BackLogManager.clearHiddenWindows();
        }
        processWheel() {
            if (this.isOpen()) {
                const threshold = 20;
                if (TouchInput.wheelY >= threshold) {
                    this.rewind();
                }
                if (TouchInput.wheelY <= -threshold) {
                    this.forward();
                }
            }
        }
        isTouchedInsideFrame() {
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            return x >= 0 && y >= 0 && x < this.width && y < this.height;
        }
        processTouch() {
            if (this.isOpen()) {
                if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
                    this._touching = true;
                    this.onTouch();
                }
                else if (TouchInput.isCancelled()) {
                    this.processCancel();
                }
                if (this._touching) {
                    if (TouchInput.isPressed()) {
                        this.onTouch();
                    }
                    else {
                        this._touching = false;
                    }
                }
            }
            else {
                this._touching = false;
            }
        }
        onTouch() {
            const x = this.canvasToLocalX(TouchInput.x);
            const y = this.canvasToLocalY(TouchInput.y);
            if (this._stayCount > 10 && x >= this.width - 20) {
                if (y < 20) {
                    this.forward();
                }
                else if (y >= this.height - 20) {
                    this.rewind();
                }
            }
        }
        show() {
            this.refresh();
            super.show();
        }
        drawRows(offset) {
            const rows = BackLogManager.scrolledContent(offset, this.numVisibleRows() + 1);
            const x = 14;
            const marginY = (this.lineHeight() - 2) / 2;
            const lastFontSize = this._fontSize;
            if (isMultiColumnLayout && actorNameWindowPlugin.enabled) {
                const ratio = (this.contentsWidth() - 168) / this.contentsWidth();
                this._fontSize = lastFontSize * ratio;
                this.contents.fontSize = this._fontSize;
            }
            rows.forEach((row, index) => {
                const y = this.contentsHeight() - marginY - this.rowHeight() * (index + 1);
                this.contents.fillRect(0, y + marginY, this.contentsWidth(), 2, this.textColor(8));
                if (isMultiColumnLayout) {
                    if (actorNameWindowPlugin.enabled) {
                        if (row.actorName) {
                            this.changeTextColor(this.textColor(actorNameWindowPlugin.params.textColor));
                            this.drawText(row.actorName, x, y + this.lineHeight());
                        }
                        this.drawTextEx(row.text, x + 168, y + this.lineHeight());
                    }
                    else {
                        this.drawTextEx(row.text, x, y + this.lineHeight());
                    }
                }
                else {
                    if (actorNameWindowPlugin.enabled && row.actorName) {
                        this.changeTextColor(this.textColor(actorNameWindowPlugin.params.textColor));
                        this.drawText(row.actorName, x, y + this.lineHeight());
                    }
                    this.drawTextEx(row.text, x, y + this.lineHeight() * (actorNameWindowPlugin.enabled ? 2 : 1));
                }
            });
            this._fontSize = lastFontSize;
        }
    }

}());
