import { g_references } from "./AGEngine.js";
import { AGRoom } from "./AGRoom.js";
import { Event } from "./Event.js";
import { AGObject } from "./AGObject.js";

import { Counter } from "./IDGenerator.js";
import { g_history } from "./AGEngine.js";

export class AGEventHandler {
    get ID() {
        return this._ID;
    }

    get events() {
        return this._events;
    }

    set events(value) {
        this._events = value;
    }

    addEvent(event) {
        this._events.push(event);
        g_history.ike(this, this.addEvent, arguments, this);
    }

    removeEvent(event) {
        this._events.splice(this.findEventIndex(event), 1);
    }

    constructor() {
        this._ID = Counter.next();
        g_references.set(this, this._ID);
        console.log("[AGEventHandler] Creating AGEventHandler object [ID: " + this._ID + "].");
        this._events = [];
    }

    findEventIndex(event) {
        for (let i = 0; i < this._events.length; i++) {
            if (this._events[i].origin === event.origin && this._events[i].trigger === event.trigger && this._events[i].action === event.action && this._events[i].object === event.object && this._events[i].addObject === event.addObject) return i;
        }
        return -1;
    }

    /*
    findEvent(event:Event):?Event {
        for(let i = 0; i < this._events.length; i++){
            if(this._events[i].origin === event.origin &&
                this._events[i].trigger === event.trigger &&
                this._events[i].action === event.action &&
                this._events[i].object === event.object &&
                this._events[i].addObject === event.addObject
            ) return this._events[i];
        }
        return null;
    }
    */

    findEventsAfterCall(object, trigger) {
        let events = [];
        for (let i = 0; i < this._events.length; i++) {
            if (this._events[i].origin === object && this._events[i].trigger === trigger) {
                events.push(this._events[i]);
            }
        }
        return events;
    }

    call(object, trigger) {
        //console.log("[AGEventHandler] Received Event-Call from " + object.name);
        let events = this.findEventsAfterCall(object, trigger);
        for (let i = 0; i < events.length; i++) {
            if (events[i].repeat >= 1 || events[i].repeat === -1) {
                //TODO: implement remaining action
                console.log("[AGEventHandler] Event triggered:");
                console.log(events[i]);
                switch (events[i].trigger) {
                    //TRIGGER: ON CONTACT WITH OTHER OBJECT
                    case "ONCONTACT":
                        switch (events[i].action) {
                            // TRIGGER: ONCONTACT, ACTION: ADD TO INVENTORY
                            case "ADD":
                                events[i].object.inventory.addItem(events[i].addObject);
                                break;
                            // TRIGGER: ONCONTACT, ACTION: REMOVE FROM INVENTORY
                            case "REMOVE":
                                events[i].origin.inventory.removeItem(events[i].addObject);
                                break;
                            // TRIGGER: ONCONTACT, ACTION: MOVE FROM INVENTORY TO OTHER
                            case "MOVE":
                                events[i].origin.inventory.removeItem(events[i].addObject);
                                events[i].object.inventory.addItem(events[i].addObject);
                                break;
                        }
                        break;
                    case "ONDEATH":
                        switch (events[i].trigger) {
                            // TRIGGER: ONDEATH, ACTION: ADD TO INVENTORY
                            case "ADD":
                                events[i].object.inventory.addItem(events[i].addObject);
                                break;
                            // TRIGGER: ONDEATH, ACTION: REMOVE FROM INVENTORY
                            case "REMOVE":
                                events[i].origin.inventory.removeItem(events[i].addObject);
                                break;
                            // TRIGGER: ONDEATH, ACTION: MOVE FROM INVENTORY TO OTHER
                            case "MOVE":
                                events[i].origin.inventory.removeItem(events[i].addObject);
                                events[i].object.inventory.addItem(events[i].addObject);
                                break;
                        }
                        break;
                }
                events[i].repeat--;
            }
        }
    }
}