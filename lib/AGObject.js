import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";

let debug = 0;

export class AGObject {
    get direction() {
        return this._direction;
    }

    set direction(value) {
        this._direction = value;
    }
    get AGSoundSources() {
        return this._AGSoundSources;
    }

    set position(value) {
        this._position = value;
    }
    get position() {
        return this._position;
    }

    constructor(name, position, direction) {
        console.log("Creating AGObject object: " + name + ".");
        this.name = name;
        this._position = position;
        this._direction = direction;
    }

    addSoundSource(source) {
        if (!this._AGSoundSources) {
            this._AGSoundSources = [];
        }
        source.setPosition(this._position);
        this._AGSoundSources.push(source);
    }

    draw() {
        this._AGSoundSources.forEach(function (element) {
            element.play();
            if (debug) console.log("draw on element: " + element.name);
        });
    }
}