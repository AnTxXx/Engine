import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGObject } from "./AGObject.js";
import { AGNavigation } from "./AGNavigation.js";
import { type } from "./AGType.js";

export class AGPlayer extends AGObject {
    get hitSound() {
        return this._hitSound;
    }

    set hitSound(value) {
        this._hitSound = value;
    }

    constructor(name, position, direction, size, navigation) {
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, size, direction);
        this.navigation = navigation;
        this._type = type.PLAYER;
    }

    draw() {
        this.navigation.draw(this);
    }

    onCollisionEnter(obj) {
        super.onCollisionEnter(obj);
        this._hitSound.play();
    }
}