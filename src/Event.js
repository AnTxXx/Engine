// @flow

import type {Trigger, Action} from "./EventType.js";
import {AGObject} from "./AGObject.js";
import {getReferenceById} from "./AGEngine.js";

export class Event {
    get origin(): AGObject {
        return this._origin;
    }

    set origin(value: AGObject) {
        this._origin = value;
    }

    get repeat(): number {
        return this._repeat;
    }

    set repeat(value: number) {
        this._repeat = value;
    }
    get trigger(): Trigger {
        return this._trigger;
    }

    set trigger(value: Trigger) {
        this._trigger = value;
    }

    get action(): Action {
        return this._action;
    }

    set action(value:Action) {
        this._action = value;
    }

    get addObject(): Object {
        return this._addObject;
    }

    set addObject(value: Object) {
        this._addObject = value;
    }

    get object(): AGObject {
        return this._object;
    }

    set object(value: AGObject) {
        this._object = value;
    }

    _origin:AGObject;
    _trigger:Trigger;
    _action:Action;
    _object:AGObject;
    _addObject:?Object;
    _repeat:number;

    constructor(originID: number, trigger:Trigger, action:Action, objectID: number, addObjectID: number, repeat: number) {
        this._origin = getReferenceById(originID);
        this._trigger = trigger;
        this._action = action;
        this._object = getReferenceById(objectID);
        this._addObject = getReferenceById(addObjectID);
        this._repeat = repeat;
    }
}