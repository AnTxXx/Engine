// @flow

import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";
import {AGRoom} from "./AGRoom.js";

let debug:number = 0;

export class AGGameArea {
    get audioContext() {
        return this._audioContext;
    }
    // $FlowFixMe
    set audioContext(value) {
        this._audioContext = value;
    }

    get resonanceAudioScene() {
        return this._resonanceAudioScene;
    }
    // $FlowFixMe
    set resonanceAudioScene(value) {
        this._resonanceAudioScene = value;
    }
    get listener(): AGObject {
        return this._listener;
    }

    set listener(value: AGObject) {
        this._listener = value;
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

    _listener:AGObject;

    // $FlowFixMe
    _resonanceAudioScene;
    // $FlowFixMe
    _audioContext;

    constructor(name:string, size:Vector3){
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
    }

    addRoom(room:AGRoom){
        this.AGRooms.push(room);
    }



    newRoom(name:string, size:Vector3, position:Vector3):AGRoom{
        let agRoom:AGRoom = new AGRoom(name, size, position, this);
        this.addRoom(agRoom);
        return agRoom;
    }

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