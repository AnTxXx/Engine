

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

    onCollisionEnter(obj) {
        super.onCollisionEnter(obj);
        if (obj.type === "PLAYER") {
            console.log("[AGRoomExit] " + obj.name + " reached exit.");
            this._reached = true;
            //TODO: Logic to shift player into new room, change audiocontext, etc.
        }
    }

    onCollisionExit(obj) {
        super.onCollisionExit(obj);
    }
}