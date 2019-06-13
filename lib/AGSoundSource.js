import { Vector3 } from "./js/three/Vector3.js";

import { AGRoom } from "./AGRoom.js";
import { Counter } from "./IDGenerator.js";
import { g_history, g_references } from "./AGEngine.js";

export class AGSoundSource
/*extends AGObject*/ {

    get ID() {
        return this._ID;
    }

    get room() {
        return this._room;
    }

    set room(value) {
        this._room = value;
    }
    get looping() {
        return this._looping;
    }

    set looping(value) {
        this._looping = value;
    }

    get playing() {
        return this._playing;
    }

    set playing(value) {
        this._playing = value;
    }
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
    /**
     * Creates a new sound source for the room.
     * @param name Name of the sound source.
     * @param file Filepath to the sound source. Uses HTML5 audio.
     * @param looping If the sound source should be looped.
     * @param interval ?
     * @param room The room this sound source is going to be played.
     */
    constructor(name, file, looping, interval, room) {
        this._ID = Counter.next();
        g_references.set(this, this._ID);
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

        g_history.ike(this, this.constructor, arguments, this);
    }

    /**
     * Sets the position of the sound source.
     * @param position New position (Vector3) of the sound source.
     */
    setPosition(position) {
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
    play() {
        if (!this.playing) {
            this.playing = true;
            this.audioElement.loop = this.looping;
            this.audioElement.play();
        }
    }

    /**
     * Stops the sound source.
     */
    stop() {
        if (this.playing) {
            this.playing = false;
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

}