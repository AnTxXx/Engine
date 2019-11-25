// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";
import {isAABBInsideAABB, isPointInsideAABB, colliding, isAABBInsideRoom, hitBoundingBox} from "./AGPhysics.js";
import type {Type} from "./AGType.js";
import {Collision, collisionIsInArray} from "./Collision.js";
import {AGGameArea} from "./AGGameArea.js";
import {Counter} from "./IDGenerator.js";
import {g_history, g_references, g_loading, g_playing} from "./AGEngine.js";
import {getReferenceById} from "./AGEngine.js";
import {g_gamearea} from "./AGEngine.js";

let debug = 0;

/**
 * AGRoom is a physically separated room of a game scene (e.g., level or floor). It follows resonance audio's room idea.
 */
export class AGRoom {
    get collisions() {
        return this._collisions;
    }

    set collisions(value:Array<Collision>) {
        this._collisions = value;
    }

    get ID() {
        return this._ID;
    }

    get live() {
        return this._live;
    }

    set live(value:boolean) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGRoom.prototype, 'live').set.name, this.constructor.name, arguments);
        this._live = value;
    }
    get positionOnGameArea(): Vector3 {
        return this._positionOnGameArea;
    }

    set positionOnGameArea(value: Vector3) {
        this._positionOnGameArea = value;
    }

    get gameArea(): AGGameArea {
        return this._gameArea;
    }

    set gameArea(value: AGGameArea) {
        this._gameArea = value;
    }
    get size(): Vector3 {
        return this._size;
    }

    set size(value: Vector3) {
        this._size = value;
    }
    get type():Type {
        return this._type;
    }

    set type(value:Type) {
        this._type = value;
    }
    get listener(): AGObject {
        return this._listener;
    }


    get solved(): boolean {
        return this._solved;
    }

    set solved(value: boolean) {
        console.log("[AGRoom] Room " + this._name + (value ? " solved." : " unsolved."));
        this._solved = value;
    }

    set listener(valueID: number) {
        this._listener = getReferenceById(valueID);
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGRoom.prototype, 'listener').set.name, this.constructor.name, arguments);
    }

    get resonanceAudioScene() {
        return this._resonanceAudioScene;
    }
    // $FlowFixMe
    set resonanceAudioScene(value) {
        this._resonanceAudioScene = value;
    }

    // $FlowFixMe
    _resonanceAudioScene;

    get AGobjects(): Array<AGObject> {
        return this._AGobjects;
    }
    _name:string;
    _size:Vector3;
    _ID:number;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    roomDimensions:Object;
    roomMaterials:Object;

    _listener:AGObject;
    _type:Type;

    _positionOnGameArea:Vector3;
    _gameArea:AGGameArea;
    _live:boolean;

    _lastTime:Date;

    _solved:boolean;

    /**
     *
     * @param name The name of the room.
     * @param size The size of the room as Vector3.
     * @param positionOnGrid The position of the room in the overall grid (the game 'map').
     * @param gameArea The AGGameArea this room is part of.
     */
    constructor(name:string, size:Vector3, positionOnGrid:Vector3){
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        console.log("[AGRoom] Creating AGRoom object [ID: " + this._ID + "]: " + name + ".");
        this._positionOnGameArea = positionOnGrid;
        this._live = false;

        // Create a (first-order Ambisonic) Resonance Audio scene and pass it
        // the AudioContext.
        // $FlowFixMe
        this._resonanceAudioScene = g_gamearea.resonanceAudioScene;

        this.size = size;

        this.roomDimensions = {
            width: this.size.x,
            height: this.size.y,
            depth: this.size.z,
        };

        this.roomMaterials = {
            // Room wall materials
            left: 'brick-bare',
            right: 'curtain-heavy',
            front: 'marble',
            back: 'glass-thin',
            // Room floor
            down: 'grass',
            // Room ceiling
            up: 'transparent',
        };

        this._resonanceAudioScene.setRoomProperties(this.roomDimensions, this.roomMaterials);

        this._name = name;
        this._type = "GAMEAREA";

        if(!this._collisions){
            this._collisions = [];
        }
        this._size = size;

        this._lastTime = new Date(0);

        this._AGobjects = [];

        this._solved = false;

        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    }

    _AGobjects:Array<AGObject>;
    _collisions:Array<Collision>;

    /**
     * Adds a AGObject to the room (and will therefore be considered with every draw loop)
     * @param gameObject The AGObject to add.
     */
    add(gameObjectID :number){
        if(!this._AGobjects){
            this._AGobjects = [];
        }
        let gameObject = getReferenceById(gameObjectID);
        this._AGobjects.push(gameObject);
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.add.name, this.constructor.name, arguments);
        gameObject.room = this;
    }

    /**
     * Add a collision to the room Collision array.
     * @param obj1 The first object that is involved in a collision.
     * @param obj2 The second object that is involved in a collision.
     */
    addCollision(obj1:AGObject, obj2:AGObject){
        this._collisions.push(new Collision(obj1, obj2));
    }

    objectsRayIntersect(obj:AGObject):Array<AGObject>{
        let returnArr:Array<AGObject> = [];
        for(let i = 0; i < this._AGobjects.length; i++){
           if(hitBoundingBox(this._AGobjects[i], obj) && this._AGobjects[i] !== obj) returnArr.push((this._AGobjects[i]));
        }
        return returnArr;
    }

    betweenPlayerObjectRayIntersect(obj:AGObject):Array<AGObject>{
        let returnArr:Array<AGObject> = [];
        for(let i = 0; i < this._AGobjects.length; i++){
            //console.log(obj);
            //console.log(hitBoundingBox(this._AGobjects[i], obj, (g_gamearea.listener.position.clone().sub(obj.position.clone())).normalize()));
            //console.log(this._AGobjects[i] !== obj);
            //console.log(this._AGobjects[i] !== g_gamearea.listener);
            //console.log((g_gamearea.listener.position.distanceTo(obj.position) < obj.position.distanceTo(this._AGobjects[i])));
            if(obj && hitBoundingBox(this._AGobjects[i], obj, (g_gamearea.listener.position.clone().sub(obj.position.clone())).normalize()) && this._AGobjects[i] !== obj && this._AGobjects[i] !== g_gamearea.listener && (g_gamearea.listener.position.distanceTo(obj.position) < obj.position.distanceTo(this._AGobjects[i]))) returnArr.push((this._AGobjects[i]));
        }
        return returnArr;
    }

    /*objectPartOfCollision(obj:AGObject):?AGObject {
        return objectPartOfCollision(this._collisions, obj);
    }*/

    /**
     * Checks if a collision is happening in the respective room. If yes, it will be added to the local room collision array.
     */
    checkForCollision(){
        //Collision?
        for(let i = 0, len = this._AGobjects.length; i < len; i++){
            for(let j = 0; j < len; j++){
                if(i === j) continue;
                else {
                    if(this._AGobjects[i].collidable && this._AGobjects[j].collidable) {
                        if (colliding(this._AGobjects[i], this._AGobjects[j])) {
                            if((collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]))) === -1){
                                //console.log("[AGRoom] " + this.name + ": Collision between " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                                this._AGobjects[i].onCollisionEnter(this._AGobjects[j]);
                                this.addCollision(this._AGobjects[i], this._AGobjects[j]);
                            }
                        } else {
                            let index:number = collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]));
                            if (index > -1) {
                                //console.log("[AGRoom] " + this.name + ": Collision exit on " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                                this._AGobjects[i].onCollisionExit(this._AGobjects[j]);
                                this._collisions.splice(index, 1);
                            }
                        }
                    }
                }
            }
        }
    }

    predictCollisionByPoint(position:Vector3):Array<AGObject>{
        let collisionArray:Array<AGObject> = [];
        for(let i = 0, len = this._AGobjects.length; i < len; i++){
            if(isPointInsideAABB(position, this._AGobjects[i])) collisionArray.push(this._AGobjects[i]);
        }
        return collisionArray;
    }

    removeAGObject(obj:AGObject){
        let index:number = -1;
        for(let i = 0; i < this._AGobjects.length; i++){
            if(obj === this._AGobjects[i]) index = i;
        }
        if(index === -1) return;
        this._AGobjects.splice(index, 1);
        this.removeCollisionWithObject(obj);
        console.log("[AGRoom] Removed object " + obj.name + " from room " + this.name + ".");
    }

    removeCollisionWithObject(obj:AGObject){
        for(let i = this._collisions.length-1; i>=0; i--){
            if(this._collisions[i].obj1 === obj || this._collisions[i].obj2 === obj) this._collisions.splice(i,1);
        }
    }

    /**
     * Cross AABB check if two objects intersect. Returns an array of collisions.
     * @param position Position (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     * @returns {Array<AGObject>} An Array of AGObjects that intersect with the position and size of the object given.
     */
    predictCollisionByPointAndSize(position:Vector3, size:Vector3):Array<AGObject>{
        let collisionArray:Array<AGObject> = [];
        for(let i = 0, len = this._AGobjects.length; i < len; i++){
            if(isAABBInsideAABB(position, size, this._AGobjects[i])) collisionArray.push(this._AGobjects[i]);
        }
        return collisionArray;
    }

    /**
     * Checks if a position is inside a room (true) or not (false)
     * @param position The position (Vector3) to be checked.
     * @param size The size (Vector3) of the surrounding boundary the point.
     * @returns {boolean} True, if point is inside room, otherwise false.
     */
    pointInsideRoom(position:Vector3, size:Vector3):boolean{
        return isAABBInsideRoom(position, size, this);
    }

    /**
     * draw-loop
     */
    draw(){
        if(this._lastTime.getTime() === new Date(0).getTime()) this._lastTime = new Date();
        //console.log(this._lastTime);
        //All objects draw
        for(let i = 0; i < this._AGobjects.length; i++){
            this._AGobjects[i].draw(this._lastTime);
            if(debug) console.log("draw on element: " + this._AGobjects[i].name);
        }

        this.checkForCollision();
        //TODO wtf? see uncommented version ...
        /*this._resonanceAudioScene.setListenerPosition(this._listener.position.x -  this.size.x/2,
            this._listener.position.y - this.size.y/2,
            this._listener.position.z - this.size.z/2);*/

        this._resonanceAudioScene.setListenerPosition(this._listener.position.x,
            this._listener.position.y,
            this._listener.position.z);

        this._resonanceAudioScene.setListenerOrientation(-this._listener.direction.x, 0, this._listener.direction.z, 0, 1, 0);

        this._lastTime = new Date();
    }

    /**
     * Iteratively goes through all objects stored in AGobjects and calls their respective stop. Clears collision array too.
     */
    stop(){
        this._collisions = [];
        this._AGobjects.forEach(function(element) {
            element.stop();
            if(debug) console.log("stop on element: " + element.name);
        });
    }

}