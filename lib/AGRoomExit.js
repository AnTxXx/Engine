

//TODO: implement

import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";

export class AGRoomExit extends AGObject {

    constructor(name, position, direction, size) {
        console.log("[AGRoomExit] Creating AGRoomExit object: " + name + ".");

        super(name, position, direction, size);
        this._type = "EXIT";
    }

    onCollisionEnter(obj) {
        super.onCollisionEnter(obj);
        if (obj.type === "PLAYER") {
            console.log("[AGRoomExit] " + obj.name + " reached exit.");
            //TODO: Logic to shift player into new room, change audiocontext, etc.
        }
    }

    onCollisionExit(obj) {
        super.onCollisionExit(obj);
    }
}