import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { moveTo } from "./AGNavigation.js";
import { type } from "./AGType.js";

let debug = 0;

export class AGObject {
    get collidable() {
        return this._collidable;
    }

    set collidable(value) {
        this._collidable = value;
    }
    get blockedObjects() {
        return this._blockedObjects;
    }

    set blockedObjects(value) {
        this._blockedObjects = value;
    }
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
    get movable() {
        return this._movable;
    }

    set movable(value) {
        this._movable = value;
    }
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
    }
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

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    setSpeedSkalar(value) {
        this.speed = new Vector3(value, value, value);
    }

    getSpeedSkalar() {
        return this.speed.x;
    }


    addRoute(...routes) {
        let i;
        for (i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
    }

    addRouteNode(node) {
        this._route.push(node);
    }

    clearRoute() {
        this._route = [];
    }

    constructor(name, position, direction, size) {
        console.log("Creating AGObject object: " + name + " at position " + position.x + "/" + position.y + "/" + position.z);
        this._position = position;
        this._direction = direction;
        this._size = size;
        this._currentRoute = 0;
        this._movable = false;
        this._speed = new Vector3(0, 0, 0);
        this._name = name;
        this._collidable = false; //for testing, should be true for release
        this._type = type.OBJECT;
        this._AGSoundSources = [];
        this._route = [];
        this._blockedObjects = [];
    }

    addSoundSource(source) {
        source.setPosition(this._position);
        this._AGSoundSources.push(source);
    }

    draw() {
        /*this._AGSoundSources.forEach(function(element) {
            element.play();
            if(debug) console.log("draw on element: " + element.name);
        })*/

        for (let i = 0, len = this._AGSoundSources.length; i < len; i++) {
            this._AGSoundSources[i].setPosition(this.position);
            this._AGSoundSources[i].play();
        }

        if (this._movable) {
            if (this.position.distanceTo(this._route[this._currentRoute]) < this.getSpeedSkalar() * 1) {
                //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                this._currentRoute = ++this._currentRoute % this._route.length;
                //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
            } else {
                moveTo(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
            }
        }
    }

    stop() {
        for (let i = 0, len = this._AGSoundSources.length; i < len; i++) {
            this._AGSoundSources[i].stop();
        }
    }

    onCollisionEnter(obj) {
        //console.log("Collision happened between: " + this.name + " and " + obj.name);
        if (!this._blockedObjects.includes(obj)) {
            this._blockedObjects.push(obj);
        }
    }

    onCollisionExit(obj) {
        //console.log("Collision exit between: " + this.name + " and " + obj.name);
        let index = this._blockedObjects.lastIndexOf(obj);
        if (index > -1) {
            this._blockedObjects.splice(index, 1);
        }
    }
}