// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";
import {colliding} from "./AGPhysics.js";
import {type} from "./AGType.js";
import {Collision, collisionIsInArray} from "./Collision.js";

let debug = 0;

export class AGGameArea {
    get type() {
        return this._type;
    }

    set type(value:Object) {
        this._type = value;
    }
    get listener(): AGObject {
        return this._listener;
    }

    set listener(value: AGObject) {
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
    _resonanceAudioScene;
    // $FlowFixMe
    _audioContext;

    get AGobjects(): AGObject[] {
        return this._AGobjects;
    }
    _name:string;
    size:Vector3;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    roomDimensions:Object;
    roomMaterials:Object;

    _listener:AGObject;
    _type:Object;

    constructor(name:string, size:Vector3){
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
            depth: this.size.z,
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
            up: 'transparent',
        };

        this._resonanceAudioScene.setRoomProperties(this.roomDimensions, this.roomMaterials);
        this._name = name;
        this._type = type.GAMEAREA;

        if(!this._collisions){
            this._collisions = [];
        }
    }

    _AGobjects:Array<AGObject>;
    _collisions:Array<Collision>;

    add(gameObject :AGObject){
        if(!this._AGobjects){
            this._AGobjects = [];
        }
        this._AGobjects.push(gameObject);
    }

    addCollision(obj1:AGObject, obj2:AGObject){
        this._collisions.push(new Collision(obj1, obj2));
    }

    draw(){
        //All objects draw
        this._AGobjects.forEach(function(element) {
            element.draw();
            if(debug) console.log("draw on element: " + element.name);
        });

        //Collision?
        for(let i = 0, len = this._AGobjects.length; i < len; i++){
            for(let j = 0; j < len; j++){
                if(i == j) continue;
                else {
                    if(this._AGobjects[i].collidable && this._AGobjects[j].collidable) {
                        if (colliding(this._AGobjects[i], this._AGobjects[j])) {
                            this._AGobjects[i].onCollisionEnter(this._AGobjects[j]);
                            this.addCollision(this._AGobjects[i], this._AGobjects[j]);
                            console.log("Collision between " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                        } else {
                            let index: number = collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]));
                            if (index > -1) {
                                this._AGobjects[i].onCollisionExit(this._AGobjects[j]);
                                this._collisions.splice(index, 1);
                            }
                        }
                    }
                }
            }
        }

        this._resonanceAudioScene.setListenerPosition(this._listener.position.x, this._listener.position.y, this._listener.position.z);
        this._resonanceAudioScene.setListenerOrientation(this._listener.direction.x, this._listener.direction.y, this._listener.direction.z, 0, 1, 0);
    }

    stop(){
        this._collisions = [];
        this._AGobjects.forEach(function(element) {
            element.stop();
            if(debug) console.log("stop on element: " + element.name);
        });
    }

}