// @flow
import {AGObject} from "./AGObject.js";
import {Vector3} from "./js/three/Vector3.js";
import {type} from "./AGType.js";

export class AGPortal extends AGObject{

    get exit(): AGPortal {
        return this._exit;
    }

    set exit(value: AGPortal) {
        this._exit = value;
    }

    _exit:AGPortal;

    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3){
        console.log("Creating AGPortal object: " + name + ".");
        super(name, position, direction, size);
        this._type = type.PORTAL;
    }

    onCollisionEnter(obj: AGObject) {
        if(obj.type === type.PLAYER && !this._blockedObjects.includes(obj)){
            obj.position = this.exit.position;
            this._blockedObjects.push(obj);
            //Blocks object that has just been teleported in other Portal to not get teleported again (until leave)
            obj.blockedObjects.push(obj);
        }

    }

    /*onCollisionExit(obj: AGObject) {

    }*/
}