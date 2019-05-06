// @flow

import {AGItem} from "./AGItem.js";

export class AGInventory{

    _inventory:Array<AGItem>;

    constructor() {
        this._inventory = [];
    }


    get inventory(): Array<AGItem> {
        return this._inventory;
    }

    set inventory(value: Array<AGItem>) {
        this._inventory = value;
    }

    addItem(item:AGItem){
        this._inventory.push(item);
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