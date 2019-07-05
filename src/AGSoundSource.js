// @flow
import {Vector3} from "./js/three/Vector3.js";
import type {Type} from "./AGType.js";
import {AGRoom} from "./AGRoom.js";
import {Counter} from "./IDGenerator.js";
import {g_history, g_references, g_loading, g_gamearea} from "./AGEngine.js";
import {getReferenceById} from "./AGEngine.js";
import {hitBoundingBox} from "./AGPhysics.js";
import {AGObject} from "./AGObject.js";

export class AGSoundSource
  /*extends AGObject*/ {
    get object(): AGObject {
        return this._object;
    }

    set object(value: AGObject) {
        this._object = value;
    }

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

    get tag(): string {
        return this._tag;
    }

    set tag(value: string) {
        this._tag = value;
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

    _object:AGObject;

    _room:AGRoom;

    // $FlowFixMe
    audioContext;
    // $FlowFixMe
    resonanceAudioScene;

    _obstructionFilter:BiquadFilterNode;

    _tag:string;



// $FlowFixMe
    /**
     * Creates a new sound source for the room.
     * @param name Name of the sound source.
     * @param file Filepath to the sound source. Uses HTML5 audio.
     * @param looping If the sound source should be looped.
     * @param interval ?
     * @param room The room this sound source is going to be played.
     */
    constructor(name:string, file:Object, looping:boolean, interval:number, roomID:number){
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        console.log("[AGSoundSource] Creating AGSoundSource object [ID: " + this._ID + "]: " + name + ".");
        this.file = file;
        this.interval = interval;
        this._playing = false;

        this._room = getReferenceById(roomID);

        this.audioContext = g_gamearea.audioContext;
        this.resonanceAudioScene = this._room.resonanceAudioScene;

        // Create an AudioElement.
        this._audioElement = document.createElement('audio');

        // Load an audio file into the AudioElement.
        this.audioElement.src = this.file;

        this.audioElementSource = this.audioContext.createMediaElementSource(this.audioElement);

        this.source = this.resonanceAudioScene.createSource();
        //TODO: activate filter when obstruction between listener and soundsource
        this._obstructionFilter = this.audioContext.createBiquadFilter();
        this._obstructionFilter.type = "lowpass";
        this._obstructionFilter.frequency.value = 400;
        this._obstructionFilter.gain.value = -10;

        //this.audioElementSource.connect(this. _obstructionFilter);
        //this. _obstructionFilter.connect(this.source.input);

        this.source.setRolloff('logarithmic');
        this.source.setMaxDistance(6);

        this.audioElementSource.connect(this.source.input);
        this._name = name;
        this._type = "SOUNDSOURCE";
        this._looping = looping;

        if(!g_loading) g_history.ike(this._ID, this.constructor, arguments);
    }

    /**
     * Sets the position of the sound source.
     * @param position New position (Vector3) of the sound source.
     */
    setPosition(position: Vector3){
        //TODO maybe buggy, should be tested, workaround for now see uncommented
        /*this.source.setPosition(position.x - this.room.positionOnGameArea.x + this.room.size.x/2,
            position.y - this.room.positionOnGameArea.y +this.room.size.y/2,
            position.z - this.room.positionOnGameArea.z + this.room.size.z/2);*/

        this.source.setPosition(position.x, position.y, position.z);

        /*console.log(new Vector3(position.x - this.room.positionOnGameArea.x + this.room.size.x/2,
            position.y - this.room.positionOnGameArea.y +this.room.size.y/2,
            position.z - this.room.positionOnGameArea.z + this.room.size.z/2));*/

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

        //check objects between sound source and player
        //console.log(this._room.betweenPlayerObjectRayIntersect(this._object));
        if(this._room.betweenPlayerObjectRayIntersect(this._object).length>0){
            this.audioElementSource.disconnect();
            this.audioElementSource.connect(this. _obstructionFilter);
            this. _obstructionFilter.connect(this.source.input);
        } else {
            this.audioElementSource.disconnect();
            this.audioElementSource.connect(this.source.input);
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