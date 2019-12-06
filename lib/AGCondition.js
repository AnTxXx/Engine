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

    get conditionType() {
        return this._conditionType;
    }

    set conditionType(value) {
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'conditionType').set.name, this.constructor.name, arguments);
        this._conditionType = value;
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

    get object2() {
        return this._object2;
    }

    set object2(objectID) {
        let obj = getReferenceById(objectID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'object2').set.name, this.constructor.name, arguments);
        this._object2 = obj;
    }

    constructor(objectID, conditionType, object2ID) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);

        this._object = getReferenceById(objectID);
        this._conditionType = conditionType;
        this._object2 = getReferenceById(object2ID);

        console.log("[AGCondition] Creating AGCondition object [ID: " + this._ID + "], requiring object [ID: " + this._object.ID + "] to have object [ID: " + this._object2.ID + "] in " + conditionType.toString() + ".");
    }

    evaluate() {
        switch (this._conditionType) {
            case "INVENTORY":
                if (this._object.inventory.searchItem(this._object2)) return true;
                break;
        }
        return false;
    }

}

export function evaluateAll(conditions) {
    for (let i = 0; i < conditions.length; i++) {
        if (!conditions[i].evaluate()) return false;
    }
    return true;
}