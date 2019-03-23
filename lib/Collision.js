import { AGObject } from "./AGObject.js";

export function collisionIsInArray(arr, col) {
    for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i].obj1 === col.obj1 && arr[i].obj2 === col.obj2 || arr[i].obj2 === col.obj1 && arr[i].obj1 === col.obj2) {
            return i;
        }
    }
    return -1;
}

export class Collision {
    get obj1() {
        return this._obj1;
    }

    set obj1(value) {
        this._obj1 = value;
    }

    get obj2() {
        return this._obj2;
    }

    set obj2(value) {
        this._obj2 = value;
    }

    constructor(obj1, obj2) {
        this._obj1 = obj1;
        this._obj2 = obj2;
    }
}