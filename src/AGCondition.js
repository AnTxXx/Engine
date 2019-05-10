// @flow

import {AGObject} from "./AGObject.js";
import type {ConditionType} from "./ConditionType.js";

export class AGCondition {

    _object:AGObject;
    _conditionType:ConditionType;
    _object2:Object;

    constructor(object: AGObject, conditionType:ConditionType, object2: Object) {
        this._object = object;
        this._conditionType = conditionType;
        this._object2 = object2;
    }

    evaluate():boolean{
        switch(this._conditionType){
            case("INVENTORY"):
                if(this._object.inventory.searchItem(this._object2)) return true;
                break;
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