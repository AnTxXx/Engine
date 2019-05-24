import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGObject } from "./AGObject.js";
import { AGNavigation } from "./AGNavigation.js";


export class AGPlayer extends AGObject {
    get hitSound() {
        return this._hitSound;
    }

    set hitSound(value) {
        this._hitSound = value;
    }

    /**
     * Creates a player of the game.
     * @param name Name of the player.
     * @param position Position (Vector3) of the player.
     * @param direction Direction (Vector3) the player is facing.
     * @param size Size (Vector3) of the player.
     * @param navigation Navigation (AGNavigation) that has the controls for the player.
     */
    constructor(name, position, direction, size, navigation) {
        console.log("[AGPlayer] Creating AGPlayer object: " + name + ".");

        super(name, position, direction, size);
        this.navigation = navigation;
        this._type = "PLAYER";
    }

    /**
     * draw-loop
     */
    draw() {
        this.navigation.draw(this);
    }

    /**
     * Extends onCollisionEnter of AGObject and plays the hit sound.
     * @param obj The object (AGObject) the player collides with.
     */
    onCollisionEnter(obj) {
        super.onCollisionEnter(obj);
        this._hitSound.audioElement.currentTime = 0;
        this._hitSound.play();
    }

    interact() {
        super.interact();
        //damage others
        if (!this.dangerous) return;
        let hits = this.room.objectsRayIntersect(this);
        console.log("[AGPlayer] Interaction Hits:");
        console.log(hits);
        for (let i = 0; i < hits.length; i++) {
            //if the object is in hit range
            if (hits[i].position.distanceTo(this.position) < this.range) {
                hits[i].doDamage(this);
            }
        }
    }
}