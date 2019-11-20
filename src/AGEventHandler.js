// @flow

import {Event} from "./Event.js";
import {AGObject} from "./AGObject.js";
import type {Trigger, ConditionObject, Action} from "./EventType.js";
import {Counter} from "./IDGenerator.js";
import {g_history, g_loading, g_references} from "./AGEngine.js";
import {GlobalEvent} from "./GlobalEvent.js";

/**
 * Eventhandler Class (Very WIP)
 */
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

    /**
     * Adds a new event to the Eventlist.
     * @param event The event to be added to the Eventlist.
     */
    addEvent(event:Event){
        this._events.push(event);
        if(!g_loading) g_history.ike(this._ID, this.addEvent.name, this.constructor.name, arguments);
    }

    removeEvent(event:Event){
        this._events.splice(this.findEventIndex(event), 1);
    }

    _ID:number;
    _events:Array<Event>;
    _globalEvents:Array<GlobalEvent>;

    constructor(){
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        if(!g_loading) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
        console.log("[AGEventHandler] Creating AGEventHandler object [ID: " + this._ID + "].");
        this._events = [];
    }

    evaluateGlobalEvents(){
        for(let i = 0; i < this._globalEvents.length; i++){
            this.evaluateGlobalEvent(this._globalEvents[i]);
        }
    }

    addGlobalEvent(object:number, conditionObject:ConditionObject, funcName:string, funcArgs:Array<any>, value:Object, action:Action){
        if(!g_loading) g_history.ike(this._ID, this.addGlobalEvent.name, this.constructor.name, arguments);
        let f:Function;
        switch(conditionObject){
            case "INVENTORY":
                f = g_history.getFunction("AGInventory", funcName);
                break;
        }
        this._globalEvents.push(new GlobalEvent(object, conditionObject, f, funcArgs, value, action));
    }

    evaluateGlobalEvent(event:GlobalEvent):boolean{
        switch(event.conditionObject){
            case "INVENTORY":
                if(event.object.inventory){
                    if(event.funcOfConditionObject.apply(event.object, event.funcArgs) === value){
                        console.log("HERE WE ARE");
                    }
                }
                break;
        }

    }

    /**
     * Returns the Index of the event.
     * @param event Event to be queried.
     * @returns {number} Returns the index of the event.
     */
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

    /**
     * Finds and returns events that are connected to a respective AGObject, triggered by a Trigger.
     * @param object The object the Event is expected to be fired.
     * @param trigger The trigger that fires the event.
     * @returns {Array<Event>} Returns an Array of Events that fits the requested AGObject and Trigger.
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

    /**
     * 
     * @param object
     * @param trigger
     */
    call(object:AGObject, trigger:Trigger){
        //console.log("[AGEventHandler] Received Event-Call from " + object.name);
        let events:Array<Event> = this.findEventsAfterCall(object, trigger);
        for(let i = 0; i < events.length; i++){
            if(events[i].repeat >= 1 || events[i].repeat === -1){
                //TODO: implement remaining action
                console.log("[AGEventHandler] Event triggered:");
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