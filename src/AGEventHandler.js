// @flow

import {AGRoom} from "./AGRoom.js";
import {Event} from "./Event.js";
import {AGObject} from "./AGObject.js";
import type {Action, Trigger} from "./EventType.js";
import {Counter} from "./IDGenerator.js";

export class AGEventHandler{
    get ID() {
        return this._ID;
    }

    get events(): Array<Event> {
        return this._events;
    }

    set events(value: Array<Event>) {
        this._events = value;
    }

    addEvent(event:Event){
        this._events.push(event);
    }

    removeEvent(event:Event){
        this._events.splice(this.findEventIndex(event), 1);
    }

    _ID:number;
    _events:Array<Event>;

    constructor(){
        this._ID = Counter.next();
        console.log("[AGEventHandler] Creating AGEventHandler object [ID: " + this._ID + "].");
        this._events = [];
    }

    findEventIndex(event:Event):number {
        for(let i = 0; i < this._events.length; i++){
            if(this._events[i].origin === event.origin &&
                this._events[i].trigger === event.trigger &&
                this._events[i].action === event.action &&
                this._events[i].object === event.object &&
                this._events[i].addObject === event.addObject
            ) return i;
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

    findEventsAfterCall(object:AGObject, trigger:Trigger):Array<Event>{
        let events:Array<Event> = [];
        for(let i = 0; i < this._events.length; i++){
            if(this._events[i].origin === object &&
                this._events[i].trigger === trigger
            ) {
                events.push(this._events[i]);
            }
        }
        return events;
    }

    call(object:AGObject, trigger:Trigger){
        //console.log("[AGEventHandler] Received Event-Call from " + object.name);
        let events:Array<Event> = this.findEventsAfterCall(object, trigger);
        for(let i = 0; i < events.length; i++){
            if(events[i].repeat >= 1 || events[i].repeat === -1){
                //TODO: implement remaining action
                console.log(events[i]);
                switch(events[i].trigger){
                    //TRIGGER: ON CONTACT WITH OTHER OBJECT
                    case "ONCONTACT":
                        switch(events[i].action){
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
                        switch(events[i].trigger){
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