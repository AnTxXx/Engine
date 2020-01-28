// @flow

import type {Action, Trigger} from "./EventType.js";

import type {IAGObject} from "./IAGObject.js";
import {g_loading, g_playing, g_references, getReferenceById} from "./AGEngine.js";
import {IncrementOneCounter} from "./IDGenerator.js";
import {g_history} from "./AGEngine";

/**
 * Class that represents one event, including object, trigger, action, etc.
 */
export class Event {
    get origin(): IAGObject {
        return this._origin;
    }

    set origin(originID:number) {
        let go = getReferenceById(originID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'origin').set.name, this.constructor.name, arguments);
        this._origin = go;
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

    set addObject(addObjectID: number) {
        let go = getReferenceById(addObjectID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'addObject').set.name, this.constructor.name, arguments);
        this._addObject = go;
    }

    get object(): IAGObject {
        return this._object;
    }

    set object(objectID: number) {
        let go = getReferenceById(objectID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = go;
    }

    get ID() {
        return this._ID;
    }

    set ID(value:number) {
        this._ID = value;
    }

    _origin:IAGObject;
    _trigger:Trigger;
    _action:Action;
    _object:IAGObject;
    _addObject:?Object;
    _repeat:number;
    _ID:number;

    constructor(originID: number, trigger:Trigger, action:Action, objectID: number, addObjectID: number, repeat: number) {
        this._ID = IncrementOneCounter.next();
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