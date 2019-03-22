import { Vector3 } from "./js/three/Vector3.js";
import { type } from "./AGType.js";

export class AGSoundSource
/*extends AGObject*/ {
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get audioElement() {
        return this._audioElement;
    }

    set audioElement(value) {
        this._audioElement = value;
    }

    /*constructor(name, pos:Vector3, dir:Vector3) {
        super(name, pos, dir);
    }*/

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    // $FlowFixMe

    // $FlowFixMe


    // $FlowFixMe
    constructor(name, file, looping, interval, audioContext, resonanceAudioScene) {
        console.log("Creating AGSoundSource object: " + name + ".");
        this.file = file;
        this.looping = looping;
        this.interval = interval;
        this.playing = false;
        this.audioContext = audioContext;
        this.resonanceAudioScene = resonanceAudioScene;

        // Create an AudioElement.
        this._audioElement = document.createElement('audio');

        // Load an audio file into the AudioElement.
        this.audioElement.src = this.file;

        this.audioElementSource = audioContext.createMediaElementSource(this.audioElement);

        this.source = resonanceAudioScene.createSource();
        this.audioElementSource.connect(this.source.input);
        this._name = name;
        this._type = type.SOUNDSOURCE;
    }

    setPosition(position) {
        this.source.setPosition(position.x, position.y, position.z);
    }

    play() {
        if (!this.playing) {
            this.playing = true;
            this.audioElement.loop = true;
            this.audioElement.play();
        }
    }

}