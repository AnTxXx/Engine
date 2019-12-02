

import { AGObject } from "./AGObject.js";

import { g_history, g_loading, g_references, g_playing, getReferenceById } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";

export class Event {
    get origin() {
        return this._origin;
    }

    set origin(originID) {
        let go = getReferenceById(originID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'origin').set.name, this.constructor.name, arguments);
        this._origin = go;
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

    set addObject(addObjectID) {
        let go = getReferenceById(addObjectID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'addObject').set.name, this.constructor.name, arguments);
        this._addObject = go;
    }

    get object() {
        return this._object;
    }

    set object(objectID) {
        let go = getReferenceById(objectID);
        // $FlowFixMe
        if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'object').set.name, this.constructor.name, arguments);
        this._object = go;
    }

    get ID() {
        return this._ID;
    }

    set ID(value) {
        this._ID = value;
    }

    constructor(originID, trigger, action, objectID, addObjectID, repeat) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
        console.log("[Event] Creating Event [ID: " + this._ID + "] with originID " + originID + " and objectID " + objectID + ".");

        this._origin = getReferenceById(originID);
        this._trigger = trigger;
        this._action = action;
        this._object = getReferenceById(objectID);
        this._addObject = getReferenceById(addObjectID);
        this._repeat = repeat;
    }
}