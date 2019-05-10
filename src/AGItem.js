// @flow

import {Counter} from "./IDGenerator.js";

export class AGItem {
    _name:string;
    _description:string;
    _charges:number;
    _ID:number;


    set name(value: string) {
        this._name = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set charges(value: number) {
        this._charges = value;
    }

    addCharge(){
        this._charges++;
    }

    removeCharge():number{
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

    constructor(name: string, description: string, charges: number) {
        this._ID = Counter.next();
        console.log("[AGItem] Creating AGItem object [ID: " + this._ID + "]: " + name + ".");
        this._name = name;
        this._description = description;
        this._charges = charges;
    }
}