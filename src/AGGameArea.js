// @flow

import {Vector3} from "../lib/js/three/Vector3.js";
import type {IAGObject} from "./IAGObject.js";
import {AGRoom} from "./AGRoom.js";

import {IncrementOneCounter} from "./IDGenerator.js";
import {g_loading, g_playing, g_references, getReferenceById} from "./AGEngine.js";
import {AGSaLo, g_history} from "./AGEngine";

let debug:number = 0;

/**
 * GameArea that holds several AGRooms. It can be considered as the plane on which the game is played.
 */
export class AGGameArea {

    get audioContext() {
        return this._audioContext;
    }
    // $FlowFixMe
    set audioContext(value) {
        this._audioContext = value;
    }

    get ID() {
        return this._ID;
    }

    get resonanceAudioScene() {
        return this._resonanceAudioScene;
    }
    // $FlowFixMe
    set resonanceAudioScene(value) {
        this._resonanceAudioScene = value;
    }
    get listener(): IAGObject {
        return this._listener;
    }

    set listener(value:number) {
        // $FlowFixMe
        if(!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGGameArea.prototype, 'listener').set.name, this.constructor.name, arguments);
        this._listener = getReferenceById(value);
    }
    get AGRooms(): Array<AGRoom> {
        return this._AGRooms;
    }

    set AGRooms(value: Array<AGRoom>) {
        this._AGRooms = value;
    }
    _AGRooms:Array<AGRoom>;
    _name:string;
    _size:Vector3;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get size(): Vector3 {
        return this._size;
    }

    set size(value: Vector3) {
        this._size = value;
    }

    _listener:IAGObject;

    // $FlowFixMe
    _resonanceAudioScene;
    // $FlowFixMe
    _audioContext;

    _ID:number;


    _history:AGSaLo;

    constructor(name:string, size:Vector3){
        this._ID = IncrementOneCounter.next();
        g_references.set(this._ID, this);
        console.log("[AGGameArea] Creating AGGameArea object [ID: " + this._ID + "].");

        this.AGRooms = [];
        this.name = name;
        this.size = size;

        // Create an AudioContext
        this._audioContext = new AudioContext();
        // Create a (first-order Ambisonic) Resonance Audio scene and pass it
        // the AudioContext.
        // $FlowFixMe
        this._resonanceAudioScene = new ResonanceAudio(this._audioContext);
        // Connect the scene’s binaural output to stereo out.
        this._resonanceAudioScene.output.connect(this._audioContext.destination);

        if(!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    }

    addRoom(room:number){
        this.AGRooms.push(getReferenceById(room));
        if(!g_loading && !g_playing) g_history.ike(this._ID, this.addRoom.name, this.constructor.name, arguments);
    }

    /**
     * Unsolves all rooms (sets the solved attribute of all rooms to false).
     */
    unsolveRooms(){
        this._AGRooms.forEach(function(element) {
            console.log("[AGGameArea] Unsolving Room [ID: " + element.ID + "].");
            element.solved = false;
        });
    }

    clearRooms(){
        this._AGRooms = [];
    }

    /*newRoom(name:string, size:Vector3, position:Vector3):AGRoom{
        let agRoom:AGRoom = new AGRoom(name, size, position, this);
        this.addRoom(agRoom);
        return agRoom;
    }*/

    draw(){
        this._AGRooms.forEach(function(element) {
            if(element.live){
                element.draw();
                if(debug) console.log("draw on element: " + element.name);
            }
        });
    }

    stop(){
        this._AGRooms.forEach(function(element) {
            element.stop();
            if(debug) console.log("draw on element: " + element.name);
        });
    }
}