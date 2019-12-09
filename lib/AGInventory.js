import { AGItem } from "./AGItem.js";
import { AGObject } from "./AGObject.js";
import { g_history } from "./AGEngine.js";
import { g_references, g_loading, g_playing } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { getReferenceById } from "./AGEngine.js";

export class AGInventory {

    get ID() {
        return this._ID;
    }

    get attachedTo() {
        return this._attachedTo;
    }

    set attachedTo(value) {
        this._attachedTo = value;
    }

    constructor(object) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        console.log("[AGInventory] Creating AGInventory object [ID: " + this._ID + "]. for Object: " + object.name);
        this._inventory = [];
        this._attachedTo = object;
    }

    get inventory() {
        return this._inventory;
    }

    set inventory(value) {
        this._inventory = value;
    }

    addItemById(itemID) {
        let item = getReferenceById(itemID);
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item [" + item.ID + "] " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.addItemById.name, this.constructor.name, arguments);
    }

    //can only be triggered through events
    addItem(item) {
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
    }

    countByName(name) {
        let count = 0;
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].name.localeCompare(name) === 0) {
                count++;
            }
        }
        return count;
    }

    countByType(type) {
        let count = 0;
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].type.localeCompare(type) === 0) {
                count++;
            }
        }
        return count;
    }

    removeItem(item) {
        let indexToDelete = -1;
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i] === item) {
                indexToDelete = i;
                break;
            }
        }
        if (indexToDelete > -1) {
            this._inventory.splice(indexToDelete, 1);
            console.log("[AGInventory] Removing Item " + item.name + " from Object " + this._attachedTo.name + "'s inventory.");
        } else console.log("[AGInventory] Item " + item.name + " not found in Object " + this._attachedTo.name + "'s inventory. Cannot remove.");
    }

    removeItemById(itemID) {
        this.removeItem(getReferenceById(itemID));
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.removeItemById.name, this.constructor.name, arguments);
    }

    searchItemByName(name) {
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].name.localeCompare(name) === 0) {
                return this._inventory[i];
            }
        }
        return null;
    }

    searchItem(item) {
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i] === item) {
                return this._inventory[i];
            }
        }
        return null;
    }

    hasItemById(itemID) {
        if (this.searchItemById(itemID)) return true;
        return false;
    }

    searchItemById(itemID) {
        return this.searchItem(getReferenceById(itemID));
    }

    changeItemCharge(item, changeBy) {
        if (this.searchItem(item) !== null) {
            item.charges += changeBy;
        }
    }
}