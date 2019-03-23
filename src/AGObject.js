// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {moveTo} from "./AGNavigation.js";
import {type} from "./AGType.js";

let debug = 0;

export class AGObject {
    get collidable() {
        return this._collidable;
    }

    set collidable(value:boolean) {
        this._collidable = value;
    }
    get blockedObjects(): Array<AGObject> {
        return this._blockedObjects;
    }

    set blockedObjects(value: Array<AGObject>) {
        this._blockedObjects = value;
    }
    get type() {
        return this._type;
    }

    set type(value:Object) {
        this._type = value;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
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
    _type:Object;

    _name:string;
    _position:Vector3;
    _direction:Vector3;
    _size:Vector3;

    _speed:Vector3;
    _movable:boolean;
    _route:Array<Vector3>;
    _currentRoute:number;

    _collidable:boolean;
    _blockedObjects:Array<AGObject>;

    addRoute(...routes:Vector3){
        let i;
        for(i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
    }

    addRouteNode(node:Vector3){
        this._route.push(node);
    }

    clearRoute(){
        this._route = [];
    }

    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3) {
        console.log("Creating AGObject object: " + name + " at position " + position.x + "/" + position.y + "/" + position.z);
        this._position = position;
        this._direction = direction;
        this._size = size;
        this._currentRoute = 0;
        this._movable = false;
        this._speed = new Vector3(0,0,0);
        this._name = name;
        this._collidable = false; //for testing, should be true for release
        this._type = type.OBJECT;
        this._route = [];
        this._blockedObjects = [];
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

    stop(){
        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            this._AGSoundSources[i].stop();
        }
    }

    onCollisionEnter(obj: AGObject) {
        //console.log("Collision happened between: " + this.name + " and " + obj.name);
        if(!this._blockedObjects.includes(obj)){
            this._blockedObjects.push(obj);
        }
    }

    onCollisionExit(obj: AGObject) {
        //console.log("Collision exit between: " + this.name + " and " + obj.name);
        let index = this._blockedObjects.lastIndexOf(obj);
        if(index > -1){
            this._blockedObjects.splice(index, 1);
        }
    }
}