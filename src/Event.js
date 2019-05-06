// @flow

import {trigger, action} from "./EventType.js";
import {AGObject} from "./AGObject.js";

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
    get trigger(): Object {
        return this._trigger;
    }

    set trigger(value: Object) {
        this._trigger = value;
    }

    get action(): Object {
        return this._action;
    }

    set action(value:Object) {
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
    _trigger:typeof(trigger);
    _action:typeof(action);
    _object:AGObject;
    _addObject:?Object;
    _repeat:number;

    constructor(origin: AGObject, trigger:Object, action:Object, object: AGObject, addObject: Object, repeat: number) {
        this._origin = origin;
        this._trigger = trigger;
        this._action = action;
        this._object = object;
        this._addObject = addObject;
        this._repeat = repeat;
    }
}