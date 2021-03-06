// @flow

import {IncrementOneCounter} from "./IDGenerator.js";
import {g_loading, g_playing, g_references} from "./AGEngine.js";
import {g_history} from "./AGEngine";

/**
 * In-game item class.
 */
export class AGItem {
    _name: string;
    _description: string;
    _charges: number;
    _ID: number;
    _type: string;

    set name(value: string) {
        this._name = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, 'set name', this.constructor.name, arguments);
    }

    set description(value: string) {
        this._description = value;
    }

    set charges(value: number) {
        this._charges = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, 'set charges', this.constructor.name, arguments);
    }

    addCharge() {
        this._charges++;
    }

    removeCharge(): number {
        return --this._charges;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get charges(): number {
        return this._charges;
    }

    get ID() {
        return this._ID;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, 'set type', this.constructor.name, arguments);
    }

    constructor(name: string, description: string, type: string, charges: number) {
        this._ID = IncrementOneCounter.next();
        g_references.set(this._ID, this);
        console.log("[AGItem] Creating AGItem object [ID: " + this._ID + "]: " + name + ".");
        this._name = name;
        this._description = description;
        this._charges = charges;
        this._type = type;

        if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    }

    deleteItemInReferences() {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.deleteItemInReferences.name, this.constructor.name, arguments);
        g_references.delete(this._ID);
    }
}