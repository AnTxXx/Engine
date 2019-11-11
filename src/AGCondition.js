// @flow

import {AGObject} from "./AGObject.js";
import type {ConditionType} from "./ConditionType.js";
import {getReferenceById} from "./AGEngine.js";

/**
 * Class for Conditions that must be fulfilled before an action can take place. (Very WIP)
 */
export class AGCondition {

    _object:AGObject;
    _conditionType:ConditionType;
    _object2:Object;

    constructor(objectID: number, conditionType:ConditionType, object2ID: number) {
        this._object = getReferenceById(objectID);
        this._conditionType = conditionType;
        this._object2 = getReferenceById(object2ID);
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