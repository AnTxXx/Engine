// @flow

import {AGObject} from "./AGObject.js";

export function collisionIsInArray(arr:Array<Collision>, col:Collision):number {
    for(let i = 0, len = arr.length; i < len; i++){
        if((arr[i].obj1 === col.obj1 && arr[i].obj2 === col.obj2) /*|| (arr[i].obj2 === col.obj1 && arr[i].obj1 === col.obj2)*/){
            return i;
        }
    }
    return -1;
}
//Is the object asked for currently part of a collision (return object) or not (return null)
export function objectPartOfCollision(arr:Array<Collision>, obj:AGObject):?AGObject{
    for(let i = 0, len = arr.length; i < len; i++){
        if(arr[i].obj1 === obj) return arr[i].obj2;
        else if(arr[i].obj2 === obj) return arr[i].obj1;
    }
    return null;
}

export class Collision {
    get obj1(): AGObject {
        return this._obj1;
    }

    set obj1(value: AGObject) {
        this._obj1 = value;
    }

    get obj2(): AGObject {
        return this._obj2;
    }

    set obj2(value: AGObject) {
        this._obj2 = value;
    }

    _obj1:AGObject;
    _obj2:AGObject;

    constructor(obj1:AGObject, obj2:AGObject){
        this._obj1 = obj1;
        this._obj2 = obj2;
    }
}