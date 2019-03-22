import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";
import { type } from "./AGType.js";

export class AGPortal extends AGObject {

    get exit() {
        return this._exit;
    }

    set exit(value) {
        this._exit = value;
    }

    constructor(name, position, direction, size) {
        console.log("Creating AGPortal object: " + name + ".");
        super(name, position, direction, size);
        this._type = type.PORTAL;
    }

    onCollisionEnter(obj) {
        if (obj.type === type.PLAYER && !this._blockedObjects.includes(obj)) {
            obj.position = this.exit.position;
            this._blockedObjects.push(obj);
            //Blocks object that has just been teleported in other Portal to not get teleported again (until leave)
            obj.blockedObjects.push(obj);
        }
    }

    /*onCollisionExit(obj: AGObject) {
      }*/
}