// @flow

import type {ConditionObject, Action} from "./EventType.js";
import {AGObject} from "./AGObject.js";
import {getReferenceById} from "./AGEngine.js";

export class GlobalEvent {
    _object:AGObject;
    _conditionObject:ConditionObject;
    _funcOfConditionObject:Function;
    _funcArgs:Array<any>;
    _value:Object;
    _action:Action;

    get object(): AGObject {
        return this._object;
    }

    set object(value: AGObject) {
        this._object = value;
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


    constructor(objectID: number, conditionObject: ConditionObject, funcOfConditionObject: Function, funcArgs: Array<*>, value: Object, action: any) {
        this._object = getReferenceById(objectID);
        this._conditionObject = conditionObject;
        this._funcOfConditionObject = funcOfConditionObject;
        this._funcArgs = funcArgs;
        this._value = value;
        this._action = action;
    }
}