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
        console.log("[AGPortal] Creating AGPortal object: " + name + ".");
        super(name, position, direction, size);
        this._type = type.PORTAL;
    }

    onCollisionEnter(obj: AGObject) {
        if(obj.type === type.PLAYER && !this._blockedObjects.includes(obj)){
            //Blocks object that has just been teleported in other Portal to not get teleported again (until leave)
            this.exit.blockedObjects.push(obj);
            obj.position = this.exit.position.clone();
            //this._blockedObjects.push(obj);

            console.log("[AGPortal] Teleporting Object: " + obj.name + " to exit: " + this.exit.name);
        } else {
            console.log("[AGPortal] Registering already blocked object: " + obj.name);
        }
    }

    linkPortals(portal:AGPortal){
        portal.exit = (this);
        this.exit = portal;
    }

    draw(){
        super.draw();
        //console.log(this.position.x + " " + this.position.y + " " + this.position.z);
    }

    /*onCollisionExit(obj: AGObject) {

    }*/
}