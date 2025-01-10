/** @readonly */

import { SlashCommandClosure } from '../../../../slash-commands/SlashCommandClosure.js';
import { SlashCommandParser } from '../../../../slash-commands/SlashCommandParser.js';
import { SlashCommandScope } from '../../../../slash-commands/SlashCommandScope.js';
import { isTrueBoolean } from '../../../../utils.js';
import { quickReplyApi } from '../../../quick-reply/index.js';
import { saveSettings } from '../index.js';
import { Callback } from './Callback.js';

/** @enum {string} */
export const COMBO_ACTION = {
    DEFAULT: 'default',
    NOTHING: 'nothing',
    SCRIPT: 'script',
    CALLBACK: 'callback',
};

export class KeyCombo {
    /**@type {KeyCombo[]} */
    static list = [];

    /**
     * @param {object} props
     * @returns {KeyCombo}
     */
    static from(props) {
        const instance = Object.assign(new this(), props);
        return instance;
    }




    /**@type {boolean} */ ctrlKey = false;
    /**@type {boolean} */ shiftKey = false;
    /**@type {boolean} */ altKey = false;
    /**@type {string} */ key;
    /**@type {boolean} */ stop = true;

    /**@type {COMBO_ACTION} */ action = COMBO_ACTION.NOTHING;
    /**@type {string} */ scriptSet;
    /**@type {string} */ scriptQr;
    /**@type {string} */ scriptLabel;
    /**@type {string} */ #script;
    /**@type {string} */ callbackId;

    dom = {
        /**@type {HTMLElement} */
        root: undefined,
        /**@type {HTMLElement} */
        keys: undefined,
    };

    get script() { return this.#script; }
    set script(value) {
        this.#script = value;
        if (value) {
            // const parser = new SlashCommandParser();
            // this.closure = parser.parse(this.script);
        } else {
            this.closure = null;
        }
    }
    /**@type {SlashCommandClosure} */ closure;

    get callback() {
        if (!this.callbackId) return null;
        return Callback.index[this.callbackId];
    }


    toString() {
        return [
            this.ctrlKey ? '[Ctrl]' : false,
            this.shiftKey ? '[Shift]' : false,
            this.altKey ? '[Alt]' : false,
            `[${this.key}]`,
        ].filter(it=>it).join('+');
    }

    toJSON() {
        return {
            ctrlKey: this.ctrlKey,
            shiftKey: this.shiftKey,
            altKey: this.altKey,
            key: this.key,
            stop: this.stop,
            action: this.action,
            scriptSet: this.scriptSet,
            scriptQr: this.scriptQr,
            scriptLabel: this.scriptLabel,
            script: this.script,
            callbackId: this.callbackId,
        };
    }


    render() {
        if (!this.dom.root) {
            const root = document.createElement('div'); {
                this.dom.root = root;
                root.classList.add('stkc--item');
                const dragHandle = document.createElement('div'); {
                    dragHandle.classList.add('stkc--dragHandle');
                    dragHandle.textContent = '≡';
                    root.append(dragHandle);
                }
                const keys = document.createElement('div'); {
                    this.dom.keys = keys;
                    keys.classList.add('stkc--combo');
                    keys.classList.add('text_pole');
                    keys.title = 'Click to change keyboard shortcut';
                    this.renderKeys();
                    let isEditing = false;
                    keys.addEventListener('click', ()=>{
                        if (isEditing) {
                            return;
                        }
                        isEditing = true;
                        keys.classList.add('stkc--isEditing');
                        keys.innerHTML = '';
                        const combo = { ctrlKey:false, shiftKey:false, altKey:false, key:'' };
                        const keyDownListener = (evt)=>{
                            if (evt.key == 'Meta') return;
                            if (evt.altKey && evt.key == 'Tab') return;
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            evt.preventDefault();
                            switch (evt.key) {
                                case 'Control': {
                                    combo.ctrlKey = true;
                                    break;
                                }
                                case 'Shift': {
                                    combo.shiftKey = true;
                                    break;
                                }
                                case 'AltGraph':
                                case 'Alt': {
                                    combo.altKey = true;
                                    break;
                                }
                                default: {
                                    combo.key = evt.key;
                                    break;
                                }
                            }
                            this.renderKeys(combo);
                        };
                        const keyUpListener = (evt)=>{
                            if (evt.key == 'Meta') return;
                            if (evt.altKey && evt.key == 'Tab') return;
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            evt.preventDefault();
                            switch (evt.key) {
                                case 'Control': {
                                    combo.ctrlKey = false;
                                    break;
                                }
                                case 'Shift': {
                                    combo.shiftKey = false;
                                    break;
                                }
                                case 'AltGraph':
                                case 'Alt': {
                                    combo.altKey = false;
                                    break;
                                }
                                default: {
                                    combo.key = evt.key;
                                    isEditing = false;
                                    Object.assign(this, combo);
                                    saveSettings();
                                    keys.classList.remove('stkc--isEditing');
                                    document.body.removeEventListener('keydown', keyDownListener);
                                    document.body.removeEventListener('keyup', keyUpListener);
                                    break;
                                }
                            }
                            this.renderKeys(combo);
                        };
                        document.body.addEventListener('keydown', keyDownListener);
                        document.body.addEventListener('keyup', keyUpListener);
                    });
                    root.append(keys);
                }
                const action = document.createElement('select'); {
                    action.classList.add('stkc--action');
                    const opts = [
                        { key:COMBO_ACTION.DEFAULT, label:'System default', description: 'Perform default system action (block default SillyTavern keyboard shortcut)' },
                        { key:COMBO_ACTION.NOTHING, label:'Nothing', description: 'Block default system action and default SillyTavern keyboard shortcut' },
                        { key:COMBO_ACTION.SCRIPT, label:'STscript', description: 'Execute STscript, set "/var stop true" to block further keyboard shortcuts (block default system action and default SillyTavern keyboard shortcut)' },
                        { key:COMBO_ACTION.CALLBACK, label:'ST Action', description: 'Perform a SillyTavern function (block default system action and default SillyTavern keyboard shortcut)' },
                    ];
                    action.title = `Type of action to perform\n---\n${opts.map(it=>`${it.label} - ${it.description}`).join('\n')}`;
                    action.addEventListener('change', ()=>{
                        this.action = action.value;
                        saveSettings();
                    });
                    for (const o of opts) {
                        const opt = document.createElement('option'); {
                            opt.value = o.key;
                            opt.textContent = o.label;
                            action.append(opt);
                        }
                    }
                    action.value = this.action;
                    root.append(action);
                }
                const script = document.createElement('div'); {
                    script.classList.add('stkc--script');
                    const set = document.createElement('select'); {
                        set.addEventListener('change', ()=>{
                            this.scriptSet = set.value;
                            saveSettings();
                            updateQrOptions();
                        });
                        const blank = document.createElement('option'); {
                            blank.value = '';
                            blank.textContent = '-- Select QR Set --';
                            set.append(blank);
                        }
                        for (const s of quickReplyApi.listSets()) {
                            const opt = document.createElement('option'); {
                                opt.value = s;
                                opt.textContent = s;
                                set.append(opt);
                            }
                        }
                        set.value = this.scriptSet;
                        script.append(set);
                    }
                    const updateQrOptions = ()=>{
                        qr.innerHTML = '';
                        const blank = document.createElement('option'); {
                            blank.value = '';
                            blank.textContent = '-- Select QR --';
                            qr.append(blank);
                        }
                        if (set.value) {
                            for (const s of quickReplyApi.listQuickReplies(set.value)) {
                                const opt = document.createElement('option'); {
                                    opt.value = s;
                                    opt.textContent = s;
                                    qr.append(opt);
                                }
                            }
                            qr.value = this.scriptQr;
                            qr.dispatchEvent(new Event('change'));
                        }
                    };
                    const qr = document.createElement('select'); {
                        qr.addEventListener('change', ()=>{
                            this.scriptQr = qr.value;
                            this.script = quickReplyApi.getQrByLabel(this.scriptSet, this.scriptQr)?.message;
                            saveSettings();
                        });
                        updateQrOptions();
                        script.append(qr);
                    }
                    const edit = document.createElement('div'); {
                        edit.classList.add('stkc--edit');
                        edit.classList.add('menu_button');
                        edit.classList.add('fa-solid', 'fa-fw', 'fa-code');
                        edit.addEventListener('click', ()=>{
                            quickReplyApi.getQrByLabel(this.scriptSet, this.scriptQr)?.showEditor();
                        });
                        script.append(edit);
                    }
                    root.append(script);
                }
                const callbackId = document.createElement('select'); {
                    callbackId.classList.add('stkc--callback');
                    callbackId.addEventListener('change', ()=>{
                        this.callbackId = callbackId.value;
                        saveSettings();
                    });
                    for (const c of Object.values(Callback.index)) {
                        const opt = document.createElement('option'); {
                            opt.value = c.id;
                            opt.textContent = c.label;
                            callbackId.append(opt);
                        }
                    }
                    callbackId.value = this.callbackId;
                    root.append(callbackId);
                }
                const spacer = document.createElement('div'); {
                    spacer.classList.add('stkc--spacer');
                    root.append(spacer);
                }
                const actions = document.createElement('div'); {
                    actions.classList.add('actions');
                    const remove = document.createElement('div'); {
                        remove.classList.add('stkc--remove');
                        remove.classList.add('menu_button');
                        remove.classList.add('fa-solid', 'fa-fw', 'fa-trash-can');
                        remove.title = 'Remove keyboard shortcut';
                        remove.addEventListener('click', ()=>{
                            KeyCombo.list.splice(KeyCombo.list.indexOf(this), 1);
                            saveSettings();
                            this.dom.root.remove();
                        });
                        actions.append(remove);
                    }
                    root.append(actions);
                }
            }
        }
        return this.dom.root;
    }
    renderKeys(combo) {
        combo = combo ?? this;
        this.dom.keys.innerHTML = '';
        if (combo.ctrlKey) {
            const key = document.createElement('kbd'); {
                key.classList.add('stkc--key');
                key.textContent = 'Ctrl';
                this.dom.keys.append(key);
            }
        }
        if (combo.shiftKey) {
            const key = document.createElement('kbd'); {
                key.classList.add('stkc--key');
                key.textContent = 'Shift';
                this.dom.keys.append(key);
            }
        }
        if (combo.altKey) {
            const key = document.createElement('kbd'); {
                key.classList.add('stkc--key');
                key.textContent = 'Alt';
                this.dom.keys.append(key);
            }
        }
        if (combo.key?.length) {
            const map = {
                'ArrowRight': '→',
                'ArrowLeft': '←',
                'ArrowDown': '↓',
                'ArrowUp': '↑',
                ' ': 'Space',
            };
            const key = document.createElement('kbd'); {
                key.classList.add('stkc--key');
                key.textContent = map[combo.key] ?? combo.key;
                this.dom.keys.append(key);
            }
        }
    }




    /**
     *
     * @param {KeyboardEvent} evt
     */
    test(evt) {
        return evt.ctrlKey == this.ctrlKey
            && evt.shiftKey == this.shiftKey
            && evt.altKey == this.altKey
            && evt.key == this.key
        ;
    }

    /**
     * @param {KeyboardEvent} evt
     */
    async execute(evt) {
        switch (this.action) {
            case COMBO_ACTION.DEFAULT: {
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                return true;
            }
            case COMBO_ACTION.NOTHING: {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                return true;
            }
            case COMBO_ACTION.CALLBACK: {
                const check = this.callback?.check(evt);
                if (!check) return false;
                evt.preventDefault();
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                await this.callback?.callback(evt);
                return true;
            }
            case COMBO_ACTION.SCRIPT: {
                const msg = quickReplyApi.getQrByLabel(this.scriptSet, this.scriptQr)?.message;
                if (msg) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                    evt.stopPropagation();
                    const parser = new SlashCommandParser();
                    const scope = new SlashCommandScope();
                    scope.letVariable('stop', 'false');
                    this.closure = parser.parse(msg);
                    this.closure.scope.parent = scope;
                    await this.closure.execute();
                    return isTrueBoolean(this.closure.scope.getVariable('stop'));
                }
                return false;
            }
            default: {
                throw new Error('What?');
            }
        }
    }
}
