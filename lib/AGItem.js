import { Counter } from "./IDGenerator.js";
import { g_history } from "./AGEngine.js";
import { g_references, g_loading, g_playing } from "./AGEngine.js";

export class AGItem {

    set name(value) {
        this._name = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'name').set.name, this.constructor.name, arguments);
    }

    set description(value) {
        this._description = value;
    }

    set charges(value) {
        this._charges = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'charges').set.name, this.constructor.name, arguments);
    }

    addCharge() {
        this._charges++;
    }

    removeCharge() {
        return --this._charges;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get charges() {
        return this._charges;
    }

    get ID() {
        return this._ID;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'type').set.name, this.constructor.name, arguments);
    }

    constructor(name, description, type, charges) {
        this._ID = Counter.next();
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