// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";

let debug = 0;

export class AGGameArea {
    get audioContext() {
        return this._audioContext;
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
    // $FlowFixMe
    _audioContext;

    get AGobjects(): AGObject[] {
        return this._AGobjects;
    }
    name:string;
    size:Vector3;
    roomDimensions:Object;
    roomMaterials:Object;


    constructor(name:string, size:Vector3){
        console.log("Creating AGGameArea object: " + name + ".");
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
    }

    _AGobjects:Array<AGObject>;

    add(gameObject :AGObject){
        if(!this._AGobjects){
            this._AGobjects = [];
        }
        this._AGobjects.push(gameObject);
    }

    draw(){
        this._AGobjects.forEach(function(element) {
            element.draw();
            if(debug) console.log("draw on element: " + element.name);
        });
    }
}