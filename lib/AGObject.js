import { Vector3 } from "./js/three/Vector3.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { move } from "./AGNavigation.js";

import { AGRoom } from "./AGRoom.js";
import { Counter } from "./IDGenerator.js";
import { AGInventory } from "./AGInventory.js";

import { g_history, g_eventHandler, g_references, g_loading } from "./AGEngine.js";
import { getReferenceById } from "./AGEngine.js";

let debug = 0;

export class AGObject {
    get route() {
        return this._route;
    }
    get damage() {
        return this._damage;
    }

    set damage(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'damage').set, arguments);
        this._damage = value;
    }

    get dangerous() {
        return this._dangerous;
    }

    set dangerous(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'dangerous').set, arguments);
        this._dangerous = value;
    }
    get range() {
        return this._range;
    }

    set range(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'range').set, arguments);
        this._range = value;
    }
    get destructible() {
        return this._destructible;
    }

    set destructible(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'destructible').set, arguments);
        this._destructible = value;
    }

    get health() {
        return this._health;
    }

    set health(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'health').set, arguments);
        this._health = value;
    }
    get ID() {
        return this._ID;
    }

    get inventory() {
        return this._inventory;
    }

    get room() {
        return this._room;
    }

    set room(value) {
        this._room = value;
    }
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
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'name').set, arguments);
        this._name = value;
    }

    get movable() {
        return this._movable;
    }

    set movable(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'movable').set, arguments);
        this._movable = value;
    }
    get size() {
        return this._size;
    }

    set size(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'size').set, arguments);
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
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'position').set, arguments);
        this._position = value;
    }
    get position() {
        return this._position;
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'speed').set, arguments);
        this._speed = value;
    }

    setSpeedSkalar(value) {
        if (!g_loading) g_history.ike(this._ID, this.setSpeedSkalar, arguments);
        this.speed = new Vector3(value, value, value);
    }

    getSpeedSkalar() {
        return this.speed.x;
    }

    get tag() {
        return this._tag;
    }

    set tag(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'tag').set, arguments);
        this._tag = value;
    }

    //TODO: deep copy for reset on stop Lodash deepclone??

    /**
     * Sets the waypoints of the respective object to which the object moves (if moveable == true).
     * @param routes The routes as rest parameter.
     */
    addRoute(...routes) {
        let i;
        for (i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
        if (!g_loading) g_history.ike(this._ID, this.addRoute, arguments);
    }

    /**
     * Adds a waypoint to the route.
     * @param node The waypoint to be added.
     */
    addRouteNode(node) {
        if (!g_loading) g_history.ike(this._ID, this.addRouteNode, arguments);
        this._route.push(node);
    }

    /**
     * Clears the route.
     */
    clearRoute() {
        this._route = [];
    }

    /**
     * Creates a new AGObject which is the basis of all objects the current scene has.
     * @param name Name of the object.
     * @param position Position (Vector3) of the object.
     * @param direction Direction (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     * @param room (optional but recommended) THe room the AGObject is in.
     */
    constructor(name, position, direction, size) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);

        if (!g_loading) g_history.ike(this._ID, this.constructor, arguments);

        console.log("[AGObject] Creating AGObject object [ID: " + this._ID + "]: " + name + " at position " + position.x + "/" + position.y + "/" + position.z);
        this._position = position;
        this._direction = direction;
        this._size = size;
        this._currentRoute = 0;
        this._movable = false;
        this._speed = new Vector3(0, 0, 0);
        this._name = name;
        this._collidable = true;
        this._type = "OBJECT";
        this._AGSoundSources = [];
        this._route = [];
        this._blockedObjects = [];
        this._tag = "";
        this._inventory = new AGInventory(this);
        this._destructible = false;
        this._health = 1;
    }

    /**
     * Adds a soundsource to the object.
     * @param source Soundsource (AGSoundSource) to be added.
     */
    addSoundSource(sourceID) {
        let source = getReferenceById(sourceID);
        source.setPosition(this._position);
        source.object = this;
        if (!g_loading) g_history.ike(this._ID, this.addSoundSource, arguments);
        this._AGSoundSources.push(source);
    }

    /**
     * the draw-loop
     */
    draw(timeStamp) {
        //as long as the draw loop is called, the sound should be played.
        for (let i = 0, len = this._AGSoundSources.length; i < len; i++) {
            //console.log(this.position);
            this._AGSoundSources[i].setPosition(this.position);
            this._AGSoundSources[i].play();
        }

        //moves the object depending on speed and direction if the object is movable and a route is given.
        if (this._movable) {
            //TODO: 0.2 suboptimal ... should be speed * deltaTime or something like that
            if (this.position.distanceTo(this._route[this._currentRoute]) < 0.2) {
                //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                this._currentRoute = ++this._currentRoute % this._route.length;
                //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
            } else {
                //console.log(this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
                move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
            }
        }

        //What happens if the object dies
        if (this._destructible && this._health <= 0) this.onDeath();
    }

    /**
     * Stops all running sounds at the object.
     */
    stop() {
        for (let i = 0, len = this._AGSoundSources.length; i < len; i++) {
            this._AGSoundSources[i].stop();
        }
    }

    /**
     * OnCollisionEnter is called as soon as a Collision happens with the respective object involved.
     * @param obj The object (AGObject) this object collided with.
     */
    onCollisionEnter(obj) {
        //console.log("Collision happened between: " + this.name + " and " + obj.name);
        g_eventHandler.call(this, "ONCONTACT");
        //adds this object to the other object on its blocked list, so the onCollisionEnter isn't called again.
        if (!this._blockedObjects.includes(obj)) {
            this._blockedObjects.push(obj);
        }
    }

    /**
     * OnCollisionExit is called as soon as a Collision ends.
     * @param obj The object (AGobject) this object collided with before it left the Collision.
     */
    onCollisionExit(obj) {
        //console.log("Collision exit between: " + this.name + " and " + obj.name);

        //deletes the object from the blockedObjects list.
        let index = this._blockedObjects.lastIndexOf(obj);
        if (index > -1) {
            //console.log("[AGObject] Collision Exit: removing object " + obj.name);
            this._blockedObjects.splice(index, 1);
        }
    }

    onDeath() {
        g_eventHandler.call(this, "ONDEATH");
        console.log("[AGObject] " + this.name + " got destroyed. Triggering death routines.");
        this.kill();
    }

    kill() {
        console.log("[AGObject] " + this.name + ": killed.");
        this.room.removeAGObject(this);
    }

    interact() {}

    doDamage(obj) {
        if (this.destructible) {
            this.health -= obj.damage;
            console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " leaving me at " + this.health + " health.");
        } else {
            console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " but cannot take any damage.");
        }
    }

    reset() {}
}