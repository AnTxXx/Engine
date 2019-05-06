import { Counter } from "./IDGenerator.js";

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

    constructor(name, description, charges) {
        this._ID = Counter.next();
        console.log("[AGItem] Creating AGItem object [ID: " + this._ID + "]: " + name + ".");
        this._name = name;
        this._description = description;
        this._charges = charges;
    }
}