import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { AGRoom } from "./AGRoom.js";

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
        this._listener = value;
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

    addRoom(room) {
        this.AGRooms.push(room);
    }

    newRoom(name, size, position) {
        let agRoom = new AGRoom(name, size, position, this);
        this.addRoom(agRoom);
        return agRoom;
    }

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