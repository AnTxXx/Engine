// @flow
import {Vector3} from "./js/three/Vector3.js";
import type {Type} from "./AGType.js";
import {AGRoom} from "./AGRoom.js";
import {Counter} from "./IDGenerator.js";

export class AGSoundSource
  /*extends AGObject*/ {

    get ID() {
        return this._ID;
    }

    get room(): AGRoom {
        return this._room;
    }

    set room(value: AGRoom) {
        this._room = value;
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
    get type():Type {
        return this._type;
    }

    set type(value:Type) {
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
    _type:Type;
    _ID:number;

    _room:AGRoom;

    // $FlowFixMe
    audioContext;
    // $FlowFixMe
    resonanceAudioScene;

    // $FlowFixMe
    /**
     * Creates a new sound source for the room.
     * @param name Name of the sound source.
     * @param file Filepath to the sound source. Uses HTML5 audio.
     * @param looping If the sound source should be looped.
     * @param interval ?
     * @param room The room this sound source is going to be played.
     */
    constructor(name:string, file:Object, looping:boolean, interval:number, room:AGRoom){
        this._ID = Counter.next();
        console.log("[AGSoundSource] Creating AGSoundSource object [ID: " + this._ID + "]: " + name + ".");
        this.file = file;
        this.interval = interval;
        this._playing = false;
        this.audioContext = room.audioContext;
        this.resonanceAudioScene = room.resonanceAudioScene;

        // Create an AudioElement.
        this._audioElement = document.createElement('audio');

        // Load an audio file into the AudioElement.
        this.audioElement.src = this.file;

        this.audioElementSource = this.audioContext.createMediaElementSource(this.audioElement);

        this.source = this.resonanceAudioScene.createSource();
        this.audioElementSource.connect(this.source.input);
        this._name = name;
        this._type = "SOUNDSOURCE";
        this._looping = looping;

        this._room = room;
    }

    /**
     * Sets the position of the sound source.
     * @param position New position (Vector3) of the sound source.
     */
    setPosition(position: Vector3){
        this.source.setPosition(position.x - this.room.positionOnGameArea.x + this.room.size.x/2,
            position.y - this.room.positionOnGameArea.y +this.room.size.y/2,
            position.z - this.room.positionOnGameArea.z + this.room.size.z/2);

    }

    /**
     * Starts the sound source. Doesn't care if it's already playing.
     */
    play(){
        if(!this.playing){
            this.playing = true;
            this.audioElement.loop = this.looping;
            this.audioElement.play();
        }
    }

    /**
     * Stops the sound source.
     */
    stop(){
        if(this.playing){
            this.playing = false;
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

}