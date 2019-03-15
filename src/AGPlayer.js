// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGObject} from "./AGObject.js";
import {AGNavigation} from "./AGNavigation.js";

export class AGPlayer extends AGObject {
    get speed(): Vector3 {
        return this._speed;
    }

    set speed(value: Vector3) {
        this._speed = value;
    }

    navigation:AGNavigation;
    _speed:Vector3;
    constructor(name:string, position:Vector3, direction:Vector3, speed:Vector3, navigation:AGNavigation){
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, direction);
        this.navigation = navigation;
        this._speed = speed;
    }

    moveSound:AGSoundSource;
    health:number;

    draw(){
        this.navigation.draw(this);
    }
}