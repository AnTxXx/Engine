import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";

import { AGCondition } from "./AGCondition.js";
import { evaluateAll } from "./AGCondition.js";
import { AGRoom } from "./AGRoom.js";
import { g_history } from "./AGEngine.js";

export class AGPortal extends AGObject {

    get exit() {
        return this._exit;
    }

    set exit(value) {
        this._exit = value;
    }

    /**
     * Creates a portal (to and from the player can teleport)
     * @param name The name of the portal.
     * @param position Position (Vector3) of the portal.
     * @param direction Direction (Vector3) of the portal.
     * @param size Size (Vector3) of the portal.
     */
    constructor(name, position, direction, size) {
        super(name, position, direction, size);
        console.log("[AGPortal] Creating AGPortal object [ID: " + this._ID + "]: " + name + ".");
        this._type = "PORTAL";
        this._conditions = [];
    }

    /**
     * Overrides onCollisionEnter of AGObject
     * @param obj The object (AGObject) the portal collides with.
     */
    onCollisionEnter(obj) {
        //console.log(obj.type);
        if ((obj.type === "PLAYER" || obj.tag === "ENEMY") && !this._blockedObjects.includes(obj) && evaluateAll(this._conditions)) {
            //Blocks object that has just been teleported in other Portal to not get teleported again (until leave)
            this.exit.blockedObjects.push(obj);
            obj.position = this.exit.position.clone();
            //this._blockedObjects.push(obj);

            console.log("[AGPortal] Teleporting Object: " + obj.name + " to exit: " + this.exit.name);
        } else {
            //console.log("[AGPortal] Registering already blocked object: " + obj.name);
        }
    }

    /**
     * Links two portal with each other.
     * @param portal Portal (AGPortal) this portal should be linked with.
     */
    linkPortals(portal) {
        console.log("[AGPortal] Linking Portal: " + this.name + " to " + portal.name);
        portal.exit = this;
        this.exit = portal;
        g_history.ike(this, this.linkPortals, arguments, this);
    }

    addCondition(condition) {
        this._conditions.push(condition);
        g_history.ike(this, this.addCondition, arguments, this);
    }

    /**
     * draw-loop
     */
    /*draw(){
        super.draw();
        //console.log(this.position.x + " " + this.position.y + " " + this.position.z);
    }*/

    /*onCollisionExit(obj: AGObject) {
      }*/
}