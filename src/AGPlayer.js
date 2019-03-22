// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGObject} from "./AGObject.js";
import {AGNavigation} from "./AGNavigation.js";
import {type} from "./AGType.js";

export class AGPlayer extends AGObject {


    navigation:AGNavigation;

    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3, navigation:AGNavigation){
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, size, direction);
        this.navigation = navigation;
        this._type = type.PLAYER;

    }

    moveSound:AGSoundSource;
    health:number;

    draw(){
        this.navigation.draw(this);
    }
}