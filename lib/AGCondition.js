import { AGObject } from "./AGObject.js";

import { getReferenceById } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { g_history, g_loading, g_playing, g_references } from "./AGEngine.js";


/**
 * Class for Conditions that must be fulfilled before an action can take place. (Very WIP)
 */
export class AGCondition {

    get ID() {
        return this._ID;
    }
    //_amount:number;


    get conditionObject() {
        return this._conditionObject;
    }

    set conditionObject(value) {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'conditionObject').set.name, this.constructor.name, arguments);
        this._conditionObject = value;
    }

    get funcOfConditionObject() {
        return this._funcOfConditionObject;
    }

    set funcOfConditionObject(value) {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcOfConditionObject').set.name, this.constructor.name, arguments);
        let f;
        switch (this._conditionObject) {
            case "INVENTORY":
                f = g_history.getFunction("AGInventory", value);
                break;
        }
        this._funcOfConditionObject = f;
    }

    get funcArgs() {
        return this._funcArgs;
    }

    set funcArgs(value) {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcArgs').set.name, this.constructor.name, arguments);
        this._funcArgs = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'value').set.name, this.constructor.name, arguments);
        this._value = value;
    }

    get object() {
        return this._object;
    }

    set object(objectID) {
        let obj = getReferenceById(objectID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = obj;
    }

    constructor(objectID, conditionObject, funcOfConditionObject, funcArgs, value) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);

        this._object = getReferenceById(objectID);
        this._conditionObject = conditionObject;
        //this._amount = amount;

        let f;
        switch (conditionObject) {
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
    evaluate() {
        switch (this._conditionObject) {
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
export function evaluateAll(conditions) {
    for (let i = 0; i < conditions.length; i++) {
        if (!conditions[i].evaluate()) return false;
    }
    return true;
}