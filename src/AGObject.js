// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {moveTo} from "./AGNavigation.js";
import type {Type} from "./AGType.js";
import {AGRoom} from "./AGRoom.js";
import {Counter} from "./IDGenerator.js";
import {AGInventory} from "./AGInventory.js";
import type {Trigger} from "./EventType.js";

let debug = 0;

export class AGObject {
    get ID() {
        return this._ID;
    }

    get inventory() {
        return this._inventory;
    }

    get room(): AGRoom {
        return this._room;
    }

    set room(value: AGRoom) {
        this._room = value;
    }
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
    get type():Type {
        return this._type;
    }

    set type(value:Type) {
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


    get tag(): string {
        return this._tag;
    }

    set tag(value: string) {
        this._tag = value;
    }

    _type:Type;

    _room:AGRoom;

    _ID:number;

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
    _tag:string;

    _inventory:AGInventory;

    /**
     * Sets the waypoints of the respective object to which the object moves (if moveable == true).
     * @param routes The routes as rest parameter.
     */
    addRoute(...routes:Vector3){
        let i;
        for(i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
    }

    /**
     * Adds a waypoint to the route.
     * @param node The waypoint to be added.
     */
    addRouteNode(node:Vector3){
        this._route.push(node);
    }


    /**
     * Clears the route.
     */
    clearRoute(){
        this._route = [];
    }

    /**
     * Creates a new AGObject which is the basis of all objects the current scene has.
     * @param name Name of the object.
     * @param position Position (Vector3) of the object.
     * @param direction Direction (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     */
    constructor(name:string, position:Vector3, direction:Vector3, size:Vector3) {
        this._ID = Counter.next();
        console.log("[AGObject] Creating AGObject object [ID: " + this._ID + "]: " + name + " at position " + position.x + "/" + position.y + "/" + position.z);
        this._position = position;
        this._direction = direction;
        this._size = size;
        this._currentRoute = 0;
        this._movable = false;
        this._speed = new Vector3(0,0,0);
        this._name = name;
        this._collidable = true;
        this._type = "OBJECT";
        this._AGSoundSources = [];
        this._route = [];
        this._blockedObjects = [];
        this._tag = "";
        this._inventory = new AGInventory(this);
    }


    _AGSoundSources:Array<AGSoundSource>;

    /**
     * Adds a soundsource to the object.
     * @param source Soundsource (AGSoundSource) to be added.
     */
    addSoundSource(source: AGSoundSource){
        source.setPosition(this._position);
        this._AGSoundSources.push(source);
    }

    /**
     * the draw-loop
     */
    draw(){
        //as long as the draw loop is called, the sound should be played.
        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            this._AGSoundSources[i].setPosition(this.position);
            this._AGSoundSources[i].play();
        }

        //moves the object depending on speed and direction if the object is movable and a route is given.
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

    /**
     * Stops all running sounds at the object.
     */
    stop(){
        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            this._AGSoundSources[i].stop();
        }
    }

    /**
     * OnCollisionEnter is called as soon as a Collision happens with the respective object involved.
     * @param obj The object (AGObject) this object collided with.
     */
    onCollisionEnter(obj: AGObject) {
        //console.log("Collision happened between: " + this.name + " and " + obj.name);
        //TODO: call EventHandler with onContact() Trigger
        this.room.gameArea.eventHandler.call(this, "ONCONTACT");
        //adds this object to the other object on its blocked list, so the onCollisionEnter isn't called again.
        if(!this._blockedObjects.includes(obj)){
            this._blockedObjects.push(obj);
        }
    }

    /**
     * OnCollisionExit is called as soon as a Collision ends.
     * @param obj The object (AGobject) this object collided with before it left the Collision.
     */
    onCollisionExit(obj: AGObject) {
        //console.log("Collision exit between: " + this.name + " and " + obj.name);

        //deletes the object from the blockedObjects list.
        let index = this._blockedObjects.lastIndexOf(obj);
        if(index > -1){
            //console.log("[AGObject] Collision Exit: removing object " + obj.name);
            this._blockedObjects.splice(index, 1);
        }
    }
}