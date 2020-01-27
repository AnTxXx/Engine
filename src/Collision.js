// @flow

import {IAGObject} from "./IAGObject.js";

/**
 * Checks if a specific Collision is inside arr-Array. Checks for order too!
 * @param arr Array of Collisions, that holds the existing collisions in the game.
 * @param col A specific Collision, to be searched in arr.
 * @returns {number} Returns the index of the Collision in arr if found, otherwise -1.
 */
export function collisionIsInArray(arr:Array<Collision>, col:Collision):number {
    for(let i = 0, len = arr.length; i < len; i++){
        if((arr[i].obj1 === col.obj1 && arr[i].obj2 === col.obj2) /*|| (arr[i].obj2 === col.obj1 && arr[i].obj1 === col.obj2)*/){
            return i;
        }
    }
    return -1;
}
//Is the object asked for currently part of a collision (return object) or not (return null)
/**
 * Checks if a specific object is involved in a Collision happening in the scene.
 * @param arr Array of Collisions, that holds the existing collisions in the game.
 * @param obj A specific IAGObject that is going to be looked up.
 * @returns {IAGObject|null} Returns the IAGObject, that obj is colliding with.
 */
export function objectPartOfCollisions(arr:Array<Collision>, obj:IAGObject):Array<IAGObject>{
    let returnarr:Array<IAGObject> = [];
    for(let i = 0, len = arr.length; i < len; i++){
        if(arr[i].obj1 === obj) returnarr.push(arr[i].obj2);
        else if(arr[i].obj2 === obj) returnarr.push(arr[i].obj1);
    }
    return returnarr;
}

/**
 * Class that holds two IAGObjects that are involved in a collision.
 */
export class Collision {
    get obj1(): IAGObject {
        return this._obj1;
    }

    set obj1(value: IAGObject) {
        this._obj1 = value;
    }

    get obj2(): IAGObject {
        return this._obj2;
    }

    set obj2(value: IAGObject) {
        this._obj2 = value;
    }

    _obj1:IAGObject;
    _obj2:IAGObject;

    constructor(obj1:IAGObject, obj2:IAGObject){
        this._obj1 = obj1;
        this._obj2 = obj2;
    }
}