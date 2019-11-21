// @flow

import type {Trigger, Action} from "./EventType.js";

import {AGObject} from "./AGObject.js";
import {g_history, g_loading, g_references, g_playing, getReferenceById} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";

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

    get ID() {
        return this._ID;
    }

    set ID(value) {
        this._ID = value;
    }

    _origin:AGObject;
    _trigger:Trigger;
    _action:Action;
    _object:AGObject;
    _addObject:?Object;
    _repeat:number;
    _ID:number;

    constructor(originID: number, trigger:Trigger, action:Action, objectID: number, addObjectID: number, repeat: number) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
        console.log("[Event] Creating Event [ID: " + this._ID + "] with originID " + originID + " and objectID " + objectID + ".");

        this._origin = getReferenceById(originID);
        this._trigger = trigger;
        this._action = action;
        this._object = getReferenceById(objectID);
        this._addObject = getReferenceById(addObjectID);
        this._repeat = repeat;
    }
}