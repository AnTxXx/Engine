import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";

import { AGCondition } from "./AGCondition.js";
import { evaluateAll } from "./AGCondition.js";
import { AGRoom } from "./AGRoom.js";
import { g_history, g_loading, g_playing, g_references } from "./AGEngine.js";
import { getReferenceById } from "./AGEngine.js";
import { setLoading } from "./AGEngine.js";

/**
 * Portal class that offers options to move a player from X to Y via in-game objects.
 */
export class AGPortal extends AGObject {
    get conditions() {
        return this._conditions;
    }

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
            if (this._exit) this._exit.blockedObjects.push(obj);
            if (this._exit) {
                setLoading(true);
                if (this._exit) obj.position = this._exit.position.clone();
                setLoading(false);
            }
            if (this._exit) console.log("[AGPortal] Teleporting Object: " + obj.name + " to exit: " + this._exit.name);
            //this._blockedObjects.push(obj);
        } else {
                //console.log("[AGPortal] Registering already blocked object: " + obj.name);
            }
    }

    /**
     * Links two portal with each other.
     * @param portal Portal (AGPortal) this portal should be linked with.
     */
    linkPortals(portalID) {
        let portal = getReferenceById(portalID);
        console.log("[AGPortal] Linking Portal: " + this.name + " to " + portal.name);
        portal.exit = this;
        this.exit = portal;
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.linkPortals.name, this.constructor.name, arguments);
    }

    /**
     * Unlinks this portal and the other.
     */
    unlink() {
        if (this._exit != null && this._exit.exit != null) this._exit.exit = null;
        this._exit = null;
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.unlink.name, this.constructor.name, arguments);
    }

    /**
     * Adds an AGCondition to this AGPortal by ID.
     * @param condition The ID of the AGCondition to be added.
     */
    addConditionById(condition) {
        let cond = getReferenceById(condition);
        this._conditions.push(cond);
        if (!g_loading && !g_playing) g_history.ike(this._ID, this.addConditionById.name, this.constructor.name, arguments);
    }

    /**
     * Deletes an AGCondition of this AGPortal by ID.
     * @param condition The ID of the AGCondition to be deleted.
     */
    deleteConditionById(condition) {
        let cond = getReferenceById(condition);
        let index = -1;
        index = this._conditions.indexOf(cond);

        if (index > -1) {
            this._conditions.splice(index, 1);
            console.log("[AGPortal] Removing Condition ID: [" + condition + "] from Object " + this._name + "'s list of conditions.");
        } else console.log("[AGPortal] Condition ID: [" + condition + "] not found in Object " + this._name + "'s list of conditions. Cannot remove.");

        if (!g_loading && !g_playing) g_history.ike(this._ID, this.deleteConditionById.name, this.constructor.name, arguments);
        g_references.delete(condition);
    }

    getConditionById(condition) {
        let cond = getReferenceById(condition);
        return this._conditions[this._conditions.indexOf(cond)];
    }

    /**
     * Kills the AGPortal and triggers the kill function of the superclass.
     */
    kill() {
        let that = this;
        this._conditions.forEach(element => that.deleteConditionById(element.ID));
        this._conditions = [];
        super.kill();
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