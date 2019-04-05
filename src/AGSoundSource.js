// @flow
import {Vector3} from "./js/three/Vector3.js";
import {type} from "./AGType.js";
import {AGGameArea} from "./AGGameArea.js";

export class AGSoundSource
  /*extends AGObject*/ {
    get area(): AGGameArea {
        return this._area;
    }

    set area(value: AGGameArea) {
        this._area = value;
    }
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

    _area:AGGameArea;

    // $FlowFixMe
    audioContext;
    // $FlowFixMe
    resonanceAudioScene;

    // $FlowFixMe
    constructor(name:string, file:Object, looping:boolean, interval:number, area:AGGameArea){
        console.log("[AGSoundSource] Creating AGSoundSource object: " + name + ".");
        this.file = file;
        this.interval = interval;
        this._playing = false;
        this.audioContext = area.audioContext;
        this.resonanceAudioScene = area.resonanceAudioScene;

        // Create an AudioElement.
        this._audioElement = document.createElement('audio');

        // Load an audio file into the AudioElement.
        this.audioElement.src = this.file;

        this.audioElementSource = this.audioContext.createMediaElementSource(this.audioElement);

        this.source = this.resonanceAudioScene.createSource();
        this.audioElementSource.connect(this.source.input);
        this._name = name;
        this._type = type.SOUNDSOURCE;
        this._looping = looping;

        this._area = area;

    }

    setPosition(position: Vector3){
        this.source.setPosition(position.x - this.area.size.x/2,
            position.y - this.area.size.y/2,
            position.z - this.area.size.z/2);
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