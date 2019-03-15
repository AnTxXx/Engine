// @flow
import {Vector3} from "./js/three/Vector3.js";

export class AGSoundSource /*extends AGObject*/ {

    get audioElement() {
        return this._audioElement;
    }

    set audioElement(value:Object) {
        this._audioElement = value;
    }

    /*constructor(name, pos:Vector3, dir:Vector3) {
        super(name, pos, dir);
    }*/

    name:string;
    file:Object;
    looping:boolean;
    interval:number;
    playing:boolean;
    _audioElement:Object;
    audioElementSource:Object;
    source:Object;

    // $FlowFixMe
    audioContext;
    // $FlowFixMe
    resonanceAudioScene;

    // $FlowFixMe
    constructor(name:string, file:Object, looping:boolean, interval:number, audioContext, resonanceAudioScene){
        console.log("Creating AGSoundSource object: " + name + ".");
        this.name = name;
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

    }

    setPosition(position: Vector3){
        this.source.setPosition(position.x, position.y, position.z);
    }

    play(){
        if(!this.playing){
            this.playing = true;
            this.audioElement.loop = true;
            this.audioElement.play();
        }
    }

}