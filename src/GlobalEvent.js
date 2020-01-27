// @flow

import type {Action, ConditionObject} from "./EventType.js";
import {IAGObject} from "./IAGObject.js";
import {g_loading, g_playing, g_references, getReferenceById} from "./AGEngine.js";
import {IncrementOneCounter} from "./IDGenerator.js";
import {g_history} from "./AGEngine";

/**
 * Similar to Event class but with a focus on Global Events.
 */
export class GlobalEvent {
    _object:IAGObject;
    _conditionObject:ConditionObject;
    _funcOfConditionObject:Function;
    _funcArgs:Array<any>;
    _value:Object;
    _action:Action;
    _repeat:number;
    _ID:number;

    get object(): IAGObject {
        return this._object;
    }

    set object(objectID: number) {
        let go = getReferenceById(objectID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(GlobalEvent.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = go;
    }

    get conditionObject(): any {
        return this._conditionObject;
    }

    set conditionObject(value: any) {
        this._conditionObject = value;
    }

    get funcOfConditionObject(): Function {
        return this._funcOfConditionObject;
    }

    set funcOfConditionObject(value: Function) {
        this._funcOfConditionObject = value;
    }

    get funcArgs(): Array<*> {
        return this._funcArgs;
    }

    set funcArgs(value: Array<*>) {
        this._funcArgs = value;
    }

    get value(): Object {
        return this._value;
    }

    set value(value: Object) {
        this._value = value;
    }

    get action(): any {
        return this._action;
    }

    set action(value: any) {
        this._action = value;
    }

    get repeat(): number {
        return this._repeat;
    }

    set repeat(value: number) {
        this._repeat = value;
    }

    get ID() {
        return this._ID;
    }

    set ID(value:number) {
        this._ID = value;
    }

    constructor(objectID: number, conditionObject: ConditionObject, funcOfConditionObject: string, funcArgs: Array<*>, value: Object, action:Action, repeat:number) {
        this._ID = IncrementOneCounter.next();
        g_references.set(this._ID, this);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
        console.log("[GlobalEvent] Creating Event [ID: " + this._ID + "] with objectID " + objectID + ", conditionObject " + conditionObject + " and Function " + funcOfConditionObject + ".");

        this._object = getReferenceById(objectID);
        this._conditionObject = conditionObject;

        let f:Function;
        switch(conditionObject){
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