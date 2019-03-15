import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGObject } from "./AGObject.js";
import { AGNavigation } from "./AGNavigation.js";

export class AGPlayer extends AGObject {

    constructor(name, position, direction, navigation) {
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, direction);
        this.navigation = navigation;
    }

    draw() {
        this.navigation.draw(this);
    }
}