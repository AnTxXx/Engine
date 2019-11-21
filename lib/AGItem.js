import { Counter } from "./IDGenerator.js";
import { g_history } from "./AGEngine.js";
import { g_references, g_loading, g_playing } from "./AGEngine.js";

export class AGItem {

    set name(value) {
        this._name = value;
    }

    set description(value) {
        this._description = value;
    }

    set charges(value) {
        this._charges = value;
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
        this._type = type;
    }
}