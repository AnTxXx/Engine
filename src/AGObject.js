// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";

let debug = 0;

export class AGObject {
    get direction(): Vector3 {
        return this._direction;
    }

    set direction(value: Vector3) {
        this._direction = value;
    }
    get AGSoundSources(): AGSoundSource[] {
        return this._AGSoundSources;
    }

    set position(value: Vector3) {
        this._position = value;
    }
    get position(): Vector3 {
        return this._position;
    }

    name:string;
    _position:Vector3;
    _direction:Vector3;

    constructor(name:string, position:Vector3, direction:Vector3) {
        console.log("Creating AGObject object: " + name + ".");
        this.name = name;
        this._position = position;
        this._direction = direction;
    }

    _AGSoundSources:Array<AGSoundSource>;

    addSoundSource(source: AGSoundSource){
        if(!this._AGSoundSources){
            this._AGSoundSources = [];
        }
        source.setPosition(this._position);
        this._AGSoundSources.push(source);
    }

    draw(){
        this._AGSoundSources.forEach(function(element) {
            element.play();
            if(debug) console.log("draw on element: " + element.name);
        });
    }
}