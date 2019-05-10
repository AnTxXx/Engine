
import { AGObject } from "./AGObject.js";

export class Event {
    get origin() {
        return this._origin;
    }

    set origin(value) {
        this._origin = value;
    }

    get repeat() {
        return this._repeat;
    }

    set repeat(value) {
        this._repeat = value;
    }
    get trigger() {
        return this._trigger;
    }

    set trigger(value) {
        this._trigger = value;
    }

    get action() {
        return this._action;
    }

    set action(value) {
        this._action = value;
    }

    get addObject() {
        return this._addObject;
    }

    set addObject(value) {
        this._addObject = value;
    }

    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
    }

    constructor(origin, trigger, action, object, addObject, repeat) {
        this._origin = origin;
        this._trigger = trigger;
        this._action = action;
        this._object = object;
        this._addObject = addObject;
        this._repeat = repeat;
    }
}