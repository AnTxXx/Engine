import { AGObject } from "./AGObject.js";


export class AGCondition {

    constructor(object, conditionType, object2) {
        this._object = object;
        this._conditionType = conditionType;
        this._object2 = object2;
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