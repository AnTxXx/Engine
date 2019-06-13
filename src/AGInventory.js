// @flow

import {AGItem} from "./AGItem.js";
import {AGObject} from "./AGObject.js";
import {g_history} from "./AGEngine.js";
import {g_references} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";

export class AGInventory{

    _inventory:Array<AGItem>;
    _attachedTo:AGObject;

    constructor(object:AGObject) {
        this._ID = Counter.next();
        g_references.set(this, this._ID);
        console.log("[AGInventory] Creating AGInventory object [ID: " + this._ID + "]. for Object: " + object.name);
        this._inventory = [];
        this._attachedTo = object;
        g_history.ike(this, this.constructor, arguments, this);
    }


    get inventory(): Array<AGItem> {
        return this._inventory;
    }

    set inventory(value: Array<AGItem>) {
        this._inventory = value;
    }

    addItem(item:AGItem){
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
        g_history.ike(this, this.addItem, arguments, this);
    }

    removeItem(item:AGItem){
        let indexToDelete:number = -1;
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i] === item){
                indexToDelete = i;
                break;
            }
        }
        if(indexToDelete > -1) this._inventory.splice(indexToDelete, 1);
        console.log("[AGInventory] Removing Item " + item.name + " from Object " + this._attachedTo.name + "'s inventory.");
    }

    searchItemByName(name:string):?AGItem{
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i].name.localeCompare(name) === 0){
                return this._inventory[i];
            }
        }
        return null;
    }

    searchItem(item:AGItem):?AGItem{
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i] === item){
                return this._inventory[i];
            }
        }
        return null;
    }

    changeItemCharge(item:AGItem, changeBy:number){
        if(this.searchItem(item)!==null){
            item.charges += changeBy;
        }
    }
}