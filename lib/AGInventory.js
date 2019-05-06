import { AGItem } from "./AGItem.js";

export class AGInventory {

    constructor() {
        this._inventory = [];
    }

    get inventory() {
        return this._inventory;
    }

    set inventory(value) {
        this._inventory = value;
    }

    addItem(item) {
        this._inventory.push(item);
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