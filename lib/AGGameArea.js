import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { colliding } from "./AGPhysics.js";
import { type } from "./AGType.js";
import { Collision, collisionIsInArray } from "./Collision.js";

let debug = 0;

export class AGGameArea {
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
    get listener() {
        return this._listener;
    }

    set listener(value) {
        this._listener = value;
    }
    get audioContext() {
        return this._audioContext;
    }
    get resonanceAudioScene() {
        return this._resonanceAudioScene;
    }
    // $FlowFixMe
    set resonanceAudioScene(value) {
        this._resonanceAudioScene = value;
    }

    // $FlowFixMe

    // $FlowFixMe


    get AGobjects() {
        return this._AGobjects;
    }


    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    constructor(name, size) {
        console.log("Creating AGGameArea object: " + name + ".");
        this.size = size;

        // Create an AudioContext
        this._audioContext = new AudioContext();
        // Create a (first-order Ambisonic) Resonance Audio scene and pass it
        // the AudioContext.
        // $FlowFixMe
        this._resonanceAudioScene = new ResonanceAudio(this._audioContext);
        // Connect the scene’s binaural output to stereo out.
        this._resonanceAudioScene.output.connect(this._audioContext.destination);

        this.roomDimensions = {
            width: this.size.x,
            height: this.size.y,
            depth: this.size.z
        };

        this.roomMaterials = {
            // Room wall materials
            left: 'brick-bare',
            right: 'curtain-heavy',
            front: 'marble',
            back: 'glass-thin',
            // Room floor
            down: 'grass',
            // Room ceiling
            up: 'transparent'
        };

        this._resonanceAudioScene.setRoomProperties(this.roomDimensions, this.roomMaterials);
        this._name = name;
        this._type = type.GAMEAREA;

        if (!this._collisions) {
            this._collisions = [];
        }
    }

    add(gameObject) {
        if (!this._AGobjects) {
            this._AGobjects = [];
        }
        this._AGobjects.push(gameObject);
    }

    addCollision(obj1, obj2) {
        this._collisions.push(new Collision(obj1, obj2));
    }

    draw() {
        //All objects draw
        this._AGobjects.forEach(function (element) {
            element.draw();
            if (debug) console.log("draw on element: " + element.name);
        });

        //Collision?
        for (let i = 0, len = this._AGobjects.length; i < len; i++) {
            for (let j = 0; j < len; j++) {
                if (i == j) continue;else {
                    if (colliding(this._AGobjects[i], this._AGobjects[j])) {
                        this._AGobjects[i].onCollisionEnter(this._AGobjects[j]);
                        this.addCollision(this._AGobjects[i], this._AGobjects[j]);
                    } else {
                        let index = collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]));
                        if (index > -1) {
                            this._AGobjects[i].onCollisionExit(this._AGobjects[j]);
                            this._collisions.splice(index, 1);
                        }
                    }
                }
            }
        }

        this._resonanceAudioScene.setListenerPosition(this._listener.position.x, this._listener.position.y, this._listener.position.z);
        this._resonanceAudioScene.setListenerOrientation(this._listener.direction.x, this._listener.direction.y, this._listener.direction.z, 0, 1, 0);
    }

}