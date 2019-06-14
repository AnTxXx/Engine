import { AGItem } from "./AGItem.js";
import { AGObject } from "./AGObject.js";
import { g_history } from "./AGEngine.js";
import { g_references, g_loading } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { getReferenceById } from "./AGEngine.js";

export class AGInventory {

    get ID() {
        return this._ID;
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

    addItem(itemID) {
        let item = getReferenceById(itemID);
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
        if (!g_loading) g_history.ike(this, this.addItem, arguments, this);
    }

    //can only be triggered through events
    addItem(item) {
        this._inventory.push(item);
        console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
    }

    removeItem(item) {
        let indexToDelete = -1;
        for (let i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i] === item) {
                indexToDelete = i;
                break;
            }
        }
        if (indexToDelete > -1) this._inventory.splice(indexToDelete, 1);
        console.log("[AGInventory] Removing Item " + item.name + " from Object " + this._attachedTo.name + "'s inventory.");
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

    changeItemCharge(item, changeBy) {
        if (this.searchItem(item) !== null) {
            item.charges += changeBy;
        }
    }
}