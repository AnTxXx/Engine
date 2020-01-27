//@flow

import {AGSoundSource} from "./AGSoundSource";
import {AGRoom} from "./AGRoom";
import type {Type} from "./AGType";
import {Vector3} from "../lib/js/three/Vector3.js";

export interface IAGObject {
    get deathSound(): ?AGSoundSource;
    set deathSound(soundID:number):void;
    clearDeathSound():void;
    get aliveSound(): ?AGSoundSource;
    set aliveSound(soundID:number):void;
    clearAliveSound():void;
    get interactionSound():?AGSoundSource;
    set interactionSound(soundID:number):void;
    clearInteractionSound():void;
    get movementSound():void;
    set movementSound(soundID:number):void;
    get route():Array<Vector3>;
    get damage(): number;
    set damage(value: number):void;
    get dangerous(): boolean;
    set dangerous(value: boolean):void;
    get range(): number;
    set range(value: number):void;
    get destructible():boolean;
    set destructible(value:boolean):void;
    get health():number;
    set health(value:number):void;
    get ID():void;
    get inventory():void;
    get room(): AGRoom;
    set room(value: AGRoom):void;
    get collidable():void;
    set collidable(value:boolean):void;
    get blockedObjects(): Array<IAGObject>;
    set blockedObjects(value: Array<IAGObject>):void;
    get type():Type;
    set type(value:Type):void;
    get name(): string;
    set name(value: string):void;
    get movable():void;
    set movable(value:boolean):void;
    get size(): Vector3;
    set size(value: Vector3):void;
    get direction(): Vector3;
    set direction(value: Vector3):void;
    get AGSoundSources(): AGSoundSource[];
    set position(value: Vector3):void;
    get position(): Vector3 ;
    get speed(): Vector3 ;
    set speed(value: Vector3):void;
    setSpeedSkalar(value:number):void;
    getSpeedSkalar():void;
    get runaway():void;
    set runaway(value:boolean):void;
    get circle():void;
    set circle(value:boolean):void;
    get tag(): string ;
    set tag(value: string):void;
    get hitSound(): ?AGSoundSource ;
    set hitSound(valueID: number):void;
    get interactionCooldown(): number ;
    set interactionCooldown(value: number):void;
    /**
     * Sets the waypoints of the respective object to which the object moves (if moveable == true).
     * @param routes The routes as rest parameter.
     */
    addRoute(...routes:Vector3):void;
    /**
     * Adds a waypoint to the route.
     * @param node The waypoint to be added.
     */
    addRouteNode(node:Vector3):void;
    /**
     * Clears the route.
     */
    clearRoute():void;
    /**
     * Adds a soundsource to the object.
     * @param sourceID Soundsource (AGSoundSource) to be added.
     */
    addSoundSource(sourceID: number):void;
    clearSoundSources():void;
    getSoundSources():Array<AGSoundSource>;

    _moveableSign:number;
    _movementSoundLastPosition:Vector3;

    /**
     * the draw-loop
     */
    draw(timeStamp:Date):void;

    /**
     * Stops all running sounds at the object.
     */
    stop():void;

    /**
     * OnCollisionEnter is called as soon as a Collision happens with the respective object involved.
     * @param obj The object (AGObject) this object collided with.
     */
    onCollisionEnter(obj: IAGObject):void;

    /**
     * OnCollisionExit is called as soon as a Collision ends.
     * @param obj The object (AGobject) this object collided with before it left the Collision.
     */
    onCollisionExit(obj: IAGObject):void;

    /**
     * Actions to do when an AGObject dies.
     */
    onDeath():void;

    /**
     * Kills the AGObject and removes it from the reference table.
     */
    kill():void;

    interact():void;

    /**
     * AGObject receives damage from obj.
     * @param obj The AGObject that does damage to this AGObject.
     */
    doDamage(obj:IAGObject):void;

    reset():void;
}