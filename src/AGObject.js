// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {move} from "./AGNavigation.js";
import type {Type} from "./AGType.js";
import {AGRoom} from "./AGRoom.js";
import {Counter} from "./IDGenerator.js";
import {AGInventory} from "./AGInventory.js";
import {g_history, g_eventHandler, g_references, g_loading, g_gamearea, g_playing} from "./AGEngine.js";
import {getReferenceById} from "./AGEngine.js";


let debug = 0;

export class AGObject {
    get deathSound(): ?AGSoundSource {
        return this._deathSound;
    }

    set deathSound(soundID:number) {
        let deathSound = getReferenceById(soundID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'deathSound').set.name, this.constructor.name, arguments);
        if(this._AGSoundSources.indexOf(deathSound) === -1) this._AGSoundSources.push(deathSound);
        this._deathSound = deathSound;
    }

    clearDeathSound(){
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.clearDeathSound.name, this.constructor.name, arguments);
        let index:number = (this._AGSoundSources.indexOf(this._deathSound));
        if(this._deathSound && (index !== -1)) {
            this._AGSoundSources.splice(index, 1);
            this._deathSound = null;
        }
    }

    get aliveSound(): ?AGSoundSource {
        return this._aliveSound;
    }

    set aliveSound(soundID:number) {
        let aliveSound = getReferenceById(soundID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'aliveSound').set.name, this.constructor.name, arguments);
        if(this._AGSoundSources.indexOf(aliveSound) === -1) this._AGSoundSources.push(aliveSound);
        this._aliveSound = aliveSound;
    }

    clearAliveSound(){
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.clearAliveSound.name, this.constructor.name, arguments);
        let index:number = (this._AGSoundSources.indexOf(this._aliveSound));
        if(this._aliveSound && (index !== -1)) {
            this._AGSoundSources.splice(index, 1);
            this._aliveSound = null;
        }
    }

    get interactionSound():?AGSoundSource {
        return this._interactionSound;
    }

    set interactionSound(soundID:number) {
        let interactionSound = getReferenceById(soundID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'interactionSound').set.name, this.constructor.name, arguments);
        if(this._AGSoundSources.indexOf(interactionSound) === -1) this._AGSoundSources.push(interactionSound);
        this._interactionSound = interactionSound;
    }

    clearInteractionSound(){
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.clearInteractionSound.name, this.constructor.name, arguments);
        let index:number = (this._AGSoundSources.indexOf(this._interactionSound));
        if(this._interactionSound && (index !== -1)) {
            this._AGSoundSources.splice(index, 1);
            this._interactionSound = null;
        }
    }

    get movementSound() {
        return this._movementSound;
    }

    set movementSound(soundID:number) {
        let movementSound = getReferenceById(soundID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'movementSound').set.name, this.constructor.name, arguments);
        if(this._AGSoundSources.indexOf(movementSound) === -1) this._AGSoundSources.push(movementSound);
        this._movementSound = movementSound;
    }

    get route():Array<Vector3> {
        return this._route;
    }
    get damage(): number {
        return this._damage;
    }

    set damage(value: number) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'damage').set.name, this.constructor.name, arguments);
        this._damage = value;
    }

    get dangerous(): boolean {
        return this._dangerous;
    }

    set dangerous(value: boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'dangerous').set.name, this.constructor.name, arguments);
        this._dangerous = value;
    }
    get range(): number {
        return this._range;
    }

    set range(value: number) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'range').set.name, this.constructor.name, arguments);
        this._range = value;
    }
    get destructible():boolean {
        return this._destructible;
    }

    set destructible(value:boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'destructible').set.name, this.constructor.name, arguments);
        this._destructible = value;
    }

    get health():number {
        return this._health;
    }

    set health(value:number) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'health').set.name, this.constructor.name, arguments);
        this._health = value;
    }
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
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'collidable').set.name, this.constructor.name, arguments);
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
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'name').set.name, this.constructor.name, arguments);
        this._name = value;
    }

    get movable() {
        return this._movable;
    }

    set movable(value:boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'movable').set.name, this.constructor.name, arguments);
        this._movable = value;
    }
    get size(): Vector3 {
        return this._size;
    }

    set size(value: Vector3) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'size').set.name, this.constructor.name, arguments);
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
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'position').set.name, this.constructor.name, arguments);
        this._position = value;
        //console.log(this._position);
        //console.log(this._direction);
        //console.log(this._size);
    }
    get position(): Vector3 {
        return this._position;
    }

    get speed(): Vector3 {
        return this._speed;
    }

    set speed(value: Vector3) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'speed').set.name, this.constructor.name, arguments);
        this._speed = value;
    }

    setSpeedSkalar(value:number){
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.setSpeedSkalar.name, this.constructor.name, arguments);
        this.speed = new Vector3(value, value, value);
    }

    getSpeedSkalar(){
        return this.speed.x;
    }


    get runaway() {
        return this._runaway;
    }

    set runaway(value:boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'runaway').set.name, this.constructor.name, arguments);
        this._runaway = value;
    }

    get circle() {
        return this._circle;
    }

    set circle(value:boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'circle').set.name, this.constructor.name, arguments);
        this._circle = value;
    }

    get tag(): string {
        return this._tag;
    }

    set tag(value: string) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'tag').set.name, this.constructor.name, arguments);
        this._tag = value;
    }

    get hitSound(): ?AGSoundSource {
        return this._hitSound;
    }

    set hitSound(valueID: number) {
        let value = getReferenceById(valueID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'hitSound').set.name, this.constructor.name, arguments);
        this._hitSound = value;
    }


    get interactionCooldown(): number {
        return this._interactionCooldown;
    }

    set interactionCooldown(value: number) {
        this._interactionCooldown = value;
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

    _hitSound:?AGSoundSource;

    _collidable:boolean;
    _blockedObjects:Array<AGObject>;
    _tag:string;

    _inventory:AGInventory;

    _destructible:boolean;
    _health:number;

    _range:number;

    _damage:number;
    _dangerous:boolean;

    _interactionSound:?AGSoundSource;
    _movementSound:AGSoundSource;
    _deathSound: ?AGSoundSource;
    _aliveSound: ?AGSoundSource;

    _interactionCooldown:number;
    _interactionCDTimestamp:Date;

    _runaway:boolean;
    _circle:boolean;

    /**
     * Sets the waypoints of the respective object to which the object moves (if moveable == true).
     * @param routes The routes as rest parameter.
     */
    addRoute(...routes:Vector3){
        let i;
        for(i = 0; i < routes.length; i++) {
            this._route.push(routes[i]);
        }
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.addRoute.name, this.constructor.name, arguments);
    }

    /**
     * Adds a waypoint to the route.
     * @param node The waypoint to be added.
     */
    addRouteNode(node:Vector3){
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.addRouteNode.name, this.constructor.name, arguments);
        this._route.push(node);
    }


    /**
     * Clears the route.
     */
    clearRoute(){
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.clearRoute.name, this.constructor.name, arguments);
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
        g_references.set(this._ID, this);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);

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
        this._destructible = false;
        this._health = 1;
        this._moveableSign = 1;

        this._movementSoundLastPosition = this.position.clone();
        this._interactionCDTimestamp = new Date(0);

        this._aliveSound = null;
        this._interactionSound = null;
        this._deathSound = null;
        this._runaway = false;
        this._circle = true;
    }

    _AGSoundSources:Array<AGSoundSource>;

    /**
     * Adds a soundsource to the object.
     * @param source Soundsource (AGSoundSource) to be added.
     */
    addSoundSource(sourceID: number){
        let source = getReferenceById(sourceID);
        source.setPosition(this._position);
        source.object = this;
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.addSoundSource.name, this.constructor.name, arguments);
        this._AGSoundSources.push(source);
    }

    clearSoundSources(){
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.clearSoundSources.name, this.constructor.name, arguments);
        this._AGSoundSources = [];
    }

    getSoundSources(){
        return this._AGSoundSources;
    }

    _moveableSign:number;
    _movementSoundLastPosition:Vector3;



    /**
     * the draw-loop
     */

    draw(timeStamp:Date){
        //as long as the draw loop is called, the sound should be played.
        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            //console.log(this.position);
            if(this._AGSoundSources[i].update) this._AGSoundSources[i].setPosition(this.position);
            if(this._AGSoundSources[i].looping) this._AGSoundSources[i].play();
        }

        /*
        if(this._auditoryPointer){
            if((this.position.distanceTo(this._route[this._currentRoute]) < 0.2)){
                //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                this._currentRoute = this._currentRoute + this._moveableSign;
                if(this._currentRoute == this._route.length || this._currentRoute < 0) {
                    this._moveableSign *= (-1);
                    this._currentRoute += this._moveableSign;

                }
                //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
            } else {
                //console.log(this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
                if(g_gamearea.listener.position.distanceTo(this._position) < 2.0) {
                    move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
                }
            }
        } else {
            //moves the object depending on speed and direction if the object is movable and a route is given.
            if(this._movable){
                //this._auditoryPointer && (this.position.distanceTo(g_gamearea.listener.position) < 0.2)


                if((this.position.distanceTo(this._route[this._currentRoute]) < 0.2)){
                    //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                    this._currentRoute = ++this._currentRoute % this._route.length;
                    //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
                } else {
                    //console.log(this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
                    move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
                }
            }
        }*/

        if(this._movable) {
            //TODO: 0.2 suboptimal ... should be speed * deltaTime or something like that
            if ((this.position.distanceTo(this._route[this._currentRoute]) < 0.2)) {
                if (this._circle) {
                    this._currentRoute = ++this._currentRoute % this._route.length;
                }
                else {
                    this._currentRoute = this._currentRoute + this._moveableSign;
                    if (this._currentRoute == this._route.length || this._currentRoute < 0) {
                        this._moveableSign *= (-1);
                        this._currentRoute += this._moveableSign;
                    }
                }
            } else {
                if(this._runaway){
                    if(g_gamearea.listener.position.distanceTo(this._position) < 2.0) {
                        move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
                    }
                } else {
                    move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
                }
            }
        }



        /*
        if(this._movementSound){
            if(this.position.clone().distanceTo(this._movementSoundLastPosition) === 0.0) {
                this._movementSound.pause();
            }
            else if(!this._movementSound.playing) this._movementSound.play();

            this._movementSound.setPosition(this.position.clone());
        }*/

        //What happens if the object dies
        if(this._destructible && this._health <= 0) this.onDeath();

       //this._movementSoundLastPosition = this.position.clone();
    }

    /**
     * Stops all running sounds at the object.
     */
    stop(){
        for(let i = 0, len = this._AGSoundSources.length; i < len; i++){
            if(this._AGSoundSources[i].looping) {
                this._AGSoundSources[i].stop();
            }
        }
    }

    /**
     * OnCollisionEnter is called as soon as a Collision happens with the respective object involved.
     * @param obj The object (AGObject) this object collided with.
     */
    onCollisionEnter(obj: AGObject) {
        //console.log("Collision happened between: " + this.name + " and " + obj.name);
        g_eventHandler.call(this, "ONCONTACT");
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

    /**
     * Actions to do when an AGObject dies.
     */
    onDeath(){
        g_eventHandler.call(this, "ONDEATH");
        if(this._deathSound) this._deathSound.play();
        console.log("[AGObject] " + this.name + " got destroyed. Triggering death routines.");
        this.kill();
    }

    /**
     * Kills the AGObject and removes it from the reference table.
     */
    kill(){
        console.log("[AGObject] " + this.name + ": killed.");
        this.stop();
        this.room.removeAGObject(this);
        g_eventHandler.deleteEventsContainingObjectById(this._ID);
        g_eventHandler.deleteGlobalEventsContainingObjectById(this._ID);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.kill.name, this.constructor.name, arguments);
        g_references.delete(this._ID);
    }

    interact(){
        if(this._interactionSound) this._interactionSound.play();
    }

    /**
     * AGObject receives damage from obj.
     * @param obj The AGObject that does damage to this AGObject.
     */
    doDamage(obj:AGObject){
        if(this.destructible) {
            this.health -= obj.damage;
            console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " leaving me at " + this.health + " health.");
        } else {
            console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " but cannot take any damage.");
        }
    }

    reset(){

    }
}