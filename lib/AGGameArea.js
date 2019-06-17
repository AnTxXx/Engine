import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { AGRoom } from "./AGRoom.js";

import { AGSaLo } from "./AGSaLo.js";
import { Counter } from "./IDGenerator.js";
import { g_history, g_references, g_loading } from "./AGEngine.js";
import { getReferenceById } from "./AGEngine.js";

let debug = 0;

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
    get listener() {
        return this._listener;
    }

    set listener(value) {
        // $FlowFixMe
        if (!g_loading) g_history.ike(this, Object.getOwnPropertyDescriptor(AGGameArea.prototype, 'listener').set, arguments, this);
        this._listener = getReferenceById(value);
    }
    get AGRooms() {
        return this._AGRooms;
    }

    set AGRooms(value) {
        this._AGRooms = value;
    }


    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
    }

    // $FlowFixMe

    // $FlowFixMe


    constructor(name, size) {
        this._ID = Counter.next();
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

        //if(!g_loading) g_history.ike(this, this.constructor, arguments, this);
    }

    addRoom(room) {
        this.AGRooms.push(getReferenceById(room));
        if (!g_loading) g_history.ike(this, this.addRoom, arguments, this);
    }

    /*newRoom(name:string, size:Vector3, position:Vector3):AGRoom{
        let agRoom:AGRoom = new AGRoom(name, size, position, this);
        this.addRoom(agRoom);
        return agRoom;
    }*/

    draw() {
        this._AGRooms.forEach(function (element) {
            if (element.live) {
                element.draw();
                if (debug) console.log("draw on element: " + element.name);
            }
        });
    }

    stop() {
        this._AGRooms.forEach(function (element) {
            element.stop();
            if (debug) console.log("draw on element: " + element.name);
        });
    }
}