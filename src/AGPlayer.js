// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGObject} from "./AGObject.js";
import {AGNavigation} from "./AGNavigation.js";

export class AGPlayer extends AGObject {


    navigation:AGNavigation;

    constructor(name:string, position:Vector3, direction:Vector3, navigation:AGNavigation){
        console.log("Creating AGPlayer object: " + name + ".");

        super(name, position, direction);
        this.navigation = navigation;

    }

    moveSound:AGSoundSource;
    health:number;

    draw(){
        this.navigation.draw(this);
    }
}