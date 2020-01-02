

//TODO: implement

import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";

export class AGRoomExit extends AGObject {
    get reached() {
        return this._reached;
    }

    constructor(name, position, direction, size) {
        console.log("[AGRoomExit] Creating AGRoomExit object: " + name + ".");

        super(name, position, direction, size);
        this._type = "EXIT";
        this._reached = false;
    }

    /**
     * The routine that is called when there is a collision happening with this and another AGObject.
     * @param obj The other AGObject that triggered the collision.
     */
    onCollisionEnter(obj) {
        super.onCollisionEnter(obj);
        if (obj.type === "PLAYER") {
            console.log("[AGRoomExit] " + obj.name + " reached exit.");
            this._reached = true;
            obj.room.solved = true;
            //TODO: Logic to shift player into new room, change audiocontext, etc.
        }
    }

    onCollisionExit(obj) {
        super.onCollisionExit(obj);
    }
}