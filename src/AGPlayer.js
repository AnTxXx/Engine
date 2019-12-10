// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGObject} from "./AGObject.js";
import {AGNavigation} from "./AGNavigation.js";
import {g_history} from "./AGEngine.js";
import {g_controls, g_loading} from "./AGEngine.js";
import {getReferenceById} from "./AGEngine.js";

export class AGPlayer extends AGObject {


    navigation:AGNavigation;

    /**
     * Creates a player of the game.
     * @param name Name of the player.
     * @param position Position (Vector3) of the player.
     * @param direction Direction (Vector3) the player is facing.
     * @param size Size (Vector3) of the player.
     * @param navigation Navigation (AGNavigation) that has the controls for the player.
     * @param room
     */
    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3){
        console.log("[AGPlayer] Creating AGPlayer object: " + name + ".");

        super(name, position, direction, size);
        this._type = "PLAYER";

    }

    moveSound:AGSoundSource;

    health:number;

    /**
     * draw-loop
     */

    draw(timeStamp:Date){
        super.draw(timeStamp);
        if(g_controls !== undefined) g_controls.draw(this);
    }

    /**
     * Extends onCollisionEnter of AGObject and plays the hit sound.
     * @param obj The object (AGObject) the player collides with.
     */
    onCollisionEnter(obj: AGObject) {
        super.onCollisionEnter(obj);
        if(this._hitSound) this._hitSound.audioElement.currentTime = 0;
        if(this._hitSound) this._hitSound.play();
    }

    interact() {

        //damage others

        if(!this.dangerous) return;

        let timeDiff = new Date() - this._interactionCDTimestamp;
        //console.log(timeDiff);
        if(timeDiff < this._interactionCooldown) {
            console.log("[AGPlayer] " + this.name + "still on Cooldown for " + (this._interactionCooldown - timeDiff) + "ms.");
            return;
        }

        super.interact();

        let hits:Array<AGObject> = this.room.objectsRayIntersect(this);
        for(let i = 0; i < hits.length; i++){
            //if the object is in hit range
            if(hits[i].position.distanceTo(this.position)<this.range){
                console.log("[AGPlayer] Interaction Hits:");
                console.log(hits);
                hits[i].doDamage(this);
            }
        }

        this._interactionCDTimestamp = new Date();
    }
}