// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {moveTo} from "./AGNavigation.js";

let debug = 0;

export class AGObject {
    get movable() {
        return this._movable;
    }

    set movable(value:boolean) {
        this._movable = value;
    }
    get size(): Vector3 {
        return this._size;
    }

    set size(value: Vector3) {
        this._size = value;
    }
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

    get speed(): Vector3 {
        return this._speed;
    }

    set speed(value: Vector3) {
        this._speed = value;
    }

    setSpeedSkalar(value:number){
        this.speed = new Vector3(value, value, value);
    }

    getSpeedSkalar(){
        return this.speed.x;
    }

    name:string;
    _position:Vector3;
    _direction:Vector3;
    _size:Vector3;

    _speed:Vector3;
    _movable:boolean;
    _route:Array<Vector3>;
    _currentRoute:number;

    addRoute(...routes:Vector3){
        if(!this._route){
            this._route = [];
        }
        let i;
        for(i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
    }

    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3) {
        console.log("Creating AGObject object: " + name + " at position " + position.x + "/" + position.y + "/" + position.z + ".");
        this.name = name;
        this._position = position;
        this._direction = direction;
        this._size = size;
        this._currentRoute = 0;
        this._movable = false;
        this._speed = new Vector3(0,0,0);
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
        /*this._AGSoundSources.forEach(function(element) {
            element.play();
            if(debug) console.log("draw on element: " + element.name);
        })*/

        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            this._AGSoundSources[i].setPosition(this.position);
            this._AGSoundSources[i].play();
        }

        if(this._movable){
            if(this.position.distanceTo(this._route[this._currentRoute]) < this.getSpeedSkalar()*1){
                //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                this._currentRoute = ++this._currentRoute % this._route.length;
                //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
            } else {
                moveTo(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
            }
        }
    }
}