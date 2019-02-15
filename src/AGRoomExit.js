// @flow

import {AGObject} from "./AGObject.js";
import {Vector3} from "../lib/js/three/Vector3.js";

/**
 * Exit that triggers the WINGAME if player collides with it.
 */
export class AGRoomExit extends AGObject {
    get reached() {
        return this._reached;
    }

    _reached: boolean;

    constructor(name: string, position: Vector3, direction: Vector3, size: Vector3) {
        console.log("[AGRoomExit] Creating AGRoomExit object: " + name + ".");

        super(name, position, direction, size);
        this._type = "EXIT";
        this._reached = false;
    }

    /**
     * The routine that is called when there is a collision happening with this and another AGObject.
     * @param obj The other AGObject that triggered the collision.
     */
    onCollisionEnter(obj: AGObject) {
        super.onCollisionEnter(obj);
        if (obj.type === "PLAYER") {
            console.log("[AGRoomExit] " + obj.name + " reached exit.");
            this._reached = true;
            obj.room.solved = true;
        }

    }

    onCollisionExit(obj: AGObject) {
        super.onCollisionExit(obj);
    }
}