// @flow

import {AGItem} from "./AGItem.js";
import {IAGObject} from "./IAGObject.js";
import {g_loading, g_playing, g_references, getReferenceById} from "./AGEngine.js";
import {IncrementOneCounter} from "./IDGenerator.js";
import {g_history} from "./AGEngine";

/**
 * The Inventory class which can hold several items. Offers functions for inventory modification.
 */
export class AGInventory{

    _inventory:Array<AGItem>;
    _attachedTo:IAGObject;
    _ID:number;

    get ID() {
        return this._ID;
    }


    get attachedTo(): IAGObject {
        return this._attachedTo;
    }

    set attachedTo(value: IAGObject) {
        this._attachedTo = value;
    }

    constructor(object:IAGObject) {
        this._ID = IncrementOneCounter.next();
        g_references.set(this._ID, this);
        console.log("[AGInventory] Creating AGInventory object [ID: " + this._ID + "]. for Object: " + object.name);
        this._inventory = [];
        this._attachedTo = object;
    }


    get inventory(): Array<AGItem> {
        return this._inventory;
    }

    set inventory(value: Array<AGItem>) {
        this._inventory = value;
    }

    addItemById(itemID:number){
        let item = getReferenceById(itemID);
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item [" + item.ID + "] " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.addItemById.name, this.constructor.name, arguments);
    }

    //can only be triggered through events
    addItem(item:AGItem){
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
    }

    /**
     * Returns the amount of items in this AGInventory with the same name.
     * @param name The name of the AGItem.
     * @returns {number} The amount of AGItems found with the given name.
     */
    countByName(name:string):number {
        let count:number = 0;
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i].name.localeCompare(name) === 0){
                count++;
            }
        }
        return count;
    }

    /**
     * Returns the amount of items in this AGInventory with the same type.
     * @param type The type of the AGItem.
     * @returns {number} The amount of AGItems found with the given type.
     */
    countByType(type:string):number {
        let count:number = 0;
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i].type.localeCompare(type) === 0){
                count++;
            }
        }
        return count;
    }

    /**
     * Removes an item from this AGInventory by AGItem object.
     * @param item The AGItem object that should be removed from the inventory.
     */
    removeItem(item:AGItem){
        let indexToDelete:number = -1;
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i] === item){
                indexToDelete = i;
                break;
            }
        }
        if(indexToDelete > -1) {
            this._inventory.splice(indexToDelete, 1);
            console.log("[AGInventory] Removing Item " + item.name + " from Object " + this._attachedTo.name + "'s inventory.");
        } else console.log("[AGInventory] Item " + item.name + " not found in Object " + this._attachedTo.name + "'s inventory. Cannot remove.");
    }


    /**
     * Removes an item from this AGInventory by ID.
     * @param itemID The item ID that should be removed from the inventory.
     */
    removeItemById(itemID:number){
        this.removeItem(getReferenceById(itemID));
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.removeItemById.name, this.constructor.name, arguments);
    }

    searchItemByName(name:string):?AGItem{
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i].name.localeCompare(name) === 0){
                return this._inventory[i];
            }
        }
        return null;
    }

    /**
     * Searches for a AGItem in this AGInventory. Returns the item if found, otherwise null.
     * @param item The AGItem object that is being looked for.
     * @returns {null|*} Returns the AGItem if found, otherwise null.
     */
    searchItem(item:AGItem):?AGItem{
        for(let i = 0; i < this._inventory.length; i++){
            if(this._inventory[i] === item){
                return this._inventory[i];
            }
        }
        return null;
    }

    /**
     * Checks if a AGItem is in this AGInventory, by ID. Returns true if found, otherwise false.
     * @param itemID The ID of the AGItem to be found.
     * @returns {boolean} Returns true, if the inventory has the item, otherwise false.
     */
    hasItemById(itemID:number):boolean{
        if(this.searchItemById(itemID)) return true;
        return false;
    }

    /**
     Searches for a AGItem in this AGInventory, by ID. Returns the item if found, otherwise null.
     * @param item The AGItem object that is being looked for.
     * @returns {?AGItem} Returns the AGItem if found, otherwise null.
     */
    searchItemById(itemID:number):?AGItem{
        return(this.searchItem(getReferenceById(itemID)));
    }

    /**
     * Changes the amount of charges of a AGItem.
     * @param item The item for which the charges are changed.
     * @param changeBy The amount by which the charges should be changed.
     */
    changeItemCharge(item:AGItem, changeBy:number){
        if(this.searchItem(item)!==null){
            item.charges += changeBy;
        }
    }
}