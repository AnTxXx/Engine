// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGObject} from "./AGObject.js";
import {AGNavigation} from "./AGNavigation.js";
import {type} from "./AGType.js";

export class AGPlayer extends AGObject {
    get hitSound(): AGSoundSource {
        return this._hitSound;
    }

    set hitSound(value: AGSoundSource) {
        this._hitSound = value;
    }


    navigation:AGNavigation;

    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3, navigation:AGNavigation){
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, size, direction);
        this.navigation = navigation;
        this._type = type.PLAYER;

    }

    moveSound:AGSoundSource;
    _hitSound:AGSoundSource;
    health:number;

    draw(){
        this.navigation.draw(this);
    }

    onCollisionEnter(obj: AGObject) {
        super.onCollisionEnter(obj);
        this._hitSound.play();
    }
}