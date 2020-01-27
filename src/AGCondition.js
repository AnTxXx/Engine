// @flow

import {IAGObject} from "./IAGObject.js";
import {g_loading, g_playing, g_references, getReferenceById} from "./AGEngine.js";
import {IncrementOneCounter} from "./IDGenerator.js";
import type {ConditionObject} from "./EventType.js";
import {g_history} from "./AGEngine";

/**
 * Class for Conditions that must be fulfilled before an action can take place. (Very WIP)
 */
export class AGCondition {

    _object:IAGObject;
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
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcArgs').set.name, this.constructor.name, arguments);
        this._funcArgs = value;
    }

    get value(): Object {
        return this._value;
    }

    set value(value: Object) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'value').set.name, this.constructor.name, arguments);
        this._value = value;
    }

    get object():IAGObject {
        return this._object;
    }

    set object(objectID:number) {
        let obj:IAGObject = getReferenceById(objectID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = obj;
    }

    constructor(objectID: number, conditionObject:ConditionObject, funcOfConditionObject: string, funcArgs: Array<*>, value: Object) {
        this._ID = IncrementOneCounter.next();
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

    /**
     * Evaluates the Condition.
     * @returns {boolean} Returns true, if the condition is met, otherwise false.
     */
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

/**
 * Evaluates all Conditions in an Array with AGConditions.
 * @param conditions An Array with AGConditions to be checked.
 * @returns {boolean} Returns true, if all conditions are met, otherwise false.
 */
export function evaluateAll(conditions:Array<AGCondition>):boolean{
    for(let i = 0; i < conditions.length; i++){
        if(!conditions[i].evaluate()) return false;
    }
    return true;
}