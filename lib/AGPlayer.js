import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGObject } from "./AGObject.js";
import { AGNavigation } from "./AGNavigation.js";

export class AGPlayer extends AGObject {
    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    constructor(name, position, direction, speed, navigation) {
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, direction);
        this.navigation = navigation;
        this._speed = speed;
    }

    draw() {
        this.navigation.draw(this);
    }
}