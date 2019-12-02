
import { AGObject } from "./AGObject.js";

import { g_loading, g_playing, g_history, g_references, getReferenceById } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";

export class GlobalEvent {

    get object() {
        return this._object;
    }

    set object(objectID) {
        let go = getReferenceById(objectID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(GlobalEvent.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = go;
    }

    get conditionObject() {
        return this._conditionObject;
    }

    set conditionObject(value) {
        this._conditionObject = value;
    }

    get funcOfConditionObject() {
        return this._funcOfConditionObject;
    }

    set funcOfConditionObject(value) {
        this._funcOfConditionObject = value;
    }

    get funcArgs() {
        return this._funcArgs;
    }

    set funcArgs(value) {
        this._funcArgs = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get action() {
        return this._action;
    }

    set action(value) {
        this._action = value;
    }

    get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = value;
    }

    get ID() {
        return this._ID;
    }

    set ID(value) {
        this._ID = value;
    }

    constructor(objectID, conditionObject, funcOfConditionObject, funcArgs, value, action, repeat) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
        console.log("[GlobalEvent] Creating Event [ID: " + this._ID + "] with objectID " + objectID + ", conditionObject " + conditionObject + " and Function " + funcOfConditionObject + ".");

        this._object = getReferenceById(objectID);
        this._conditionObject = conditionObject;

        let f;
        switch (conditionObject) {
            case "INVENTORY":
                f = g_history.getFunction("AGInventory", funcOfConditionObject);
                break;
        }

        this._funcOfConditionObject = f;
        this._funcArgs = funcArgs;
        this._value = value;
        this._action = action;
        this._repeat = repeat;
    }
}