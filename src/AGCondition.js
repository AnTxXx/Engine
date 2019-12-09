// @flow

import {AGObject} from "./AGObject.js";
import type {ConditionType} from "./ConditionType.js";
import {getReferenceById} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";
import {g_history, g_loading, g_playing, g_references} from "./AGEngine.js";
import type {ConditionObject} from "./EventType";

/**
 * Class for Conditions that must be fulfilled before an action can take place. (Very WIP)
 */
export class AGCondition {

    _object:AGObject;
    _conditionObject:ConditionObject;
    _funcOfConditionObject:Function;
    _funcArgs:Array<any>;
    _value:Object;
    //_amount:number;
    _ID:number;

    get ID() {
        return this._ID;
    }

    get conditionObject(): any {
        return this._conditionObject;
    }

    set conditionObject(value: any) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'conditionObject').set.name, this.constructor.name, arguments);
        this._conditionObject = value;
    }

    get funcOfConditionObject(): Function {
        return this._funcOfConditionObject;
    }

    set funcOfConditionObject(value: string) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcOfConditionObject').set.name, this.constructor.name, arguments);
        let f:Function;
        switch(this._conditionObject){
            case "INVENTORY":
                f = g_history.getFunction("AGInventory", value);
                break;
        }
        this._funcOfConditionObject = f;
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

    get object():AGObject {
        return this._object;
    }

    set object(objectID:number) {
        let obj:AGObject = getReferenceById(objectID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = obj;
    }

    constructor(objectID: number, conditionObject:ConditionObject, funcOfConditionObject: string, funcArgs: Array<*>, value: Object) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);

        this._object = getReferenceById(objectID);
        this._conditionObject = conditionObject;
        //this._amount = amount;

        let f:Function;
        switch(conditionObject){
            case "INVENTORY":
                f = g_history.getFunction("AGInventory", funcOfConditionObject);
                break;
        }

        this._funcOfConditionObject = f;
        this._funcArgs = funcArgs;
        this._value = value;
    }

    evaluate():boolean {
        switch(this._conditionObject) {
            case "INVENTORY":
                if (this._object.inventory) {
                    if (this._funcOfConditionObject.apply(this._object.inventory, this._funcArgs) === this._value) {
                        //console.log("[AGCondition] Condition [ID: " + this._ID + "] with Object [ID: " + this._object.ID + "] fulfilled.");
                        return true;
                    }
                }
        }
        return false;
    }

}

export function evaluateAll(conditions:Array<AGCondition>):boolean{
    for(let i = 0; i < conditions.length; i++){
        if(!conditions[i].evaluate()) return false;
    }
    return true;
}