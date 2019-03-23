// @flow
import {Vector3} from "./js/three/Vector3.js";
import {type} from "./AGType.js";

export class AGSoundSource
  /*extends AGObject*/ {
    get looping(): boolean {
        return this._looping;
    }

    set looping(value: boolean) {
        this._looping = value;
    }

    get playing() {
        return this._playing;
    }

    set playing(value:boolean) {
        this._playing = value;
    }
    get type() {
        return this._type;
    }

    set type(value:Object) {
        this._type = value;
    }

    get audioElement() {
        return this._audioElement;
    }

    set audioElement(value:Object) {
        this._audioElement = value;
    }

    /*constructor(name, pos:Vector3, dir:Vector3) {
        super(name, pos, dir);
    }*/

    _name:string;
    file:Object;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    _looping:boolean;
    interval:number;
    _playing:boolean;
    _audioElement:Object;
    audioElementSource:Object;
    source:Object;
    _type:Object;

    // $FlowFixMe
    audioContext;
    // $FlowFixMe
    resonanceAudioScene;

    // $FlowFixMe
    constructor(name:string, file:Object, looping:boolean, interval:number, audioContext, resonanceAudioScene){
        console.log("[AGSoundSource] Creating AGSoundSource object: " + name + ".");
        this.file = file;
        this.interval = interval;
        this._playing = false;
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
        this._looping = looping;

    }

    setPosition(position: Vector3){
        this.source.setPosition(position.x, position.y, position.z);
    }

    play(){
        if(!this.playing){
            this.playing = true;
            this.audioElement.loop = this.looping;
            this.audioElement.play();
        }
    }

    stop(){
        if(this.playing){
            this.playing = false;
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

}