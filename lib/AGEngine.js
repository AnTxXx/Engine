import { Vector3 } from './js/three/Vector3.js';
//import { ResonanceAudio } from './js/resonance/resonance-audio.min.js';
//import * as resonance from './js/resonance/resonance-audio.js';

let audioContext;
let resonanceAudioScene; //for first testings, maybe we will need something like AGRoom, where we can also put the resonance rooms into
//let AGGameArea = new AGGameArea("main", new Vector3(20,20,0)); //simulate something "static", probably (quite sure :p) not state of the art
/*
Game Area in which the audio game is played. It holds all audio game objects.
 */

const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2
};

export class AGGameArea {

    get AGobjects() {
        return this._AGobjects;
    }


    constructor(name, size) {
        this.name = name;
        this.size = size;

        // Create an AudioContext
        audioContext = new AudioContext();
        // Create a (first-order Ambisonic) Resonance Audio scene and pass it
        // the AudioContext.
        resonanceAudioScene = new ResonanceAudio(audioContext);
        // Connect the scene’s binaural output to stereo out.
        resonanceAudioScene.output.connect(audioContext.destination);

        this.roomDimensions = {
            width: this.size.x,
            height: this.size.y,
            depth: this.size.z
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
            up: 'transparent'
        };

        resonanceAudioScene.setRoomProperties(this.roomDimensions, this.roomMaterials);
    }

    add(gameObject) {
        if (!this._AGobjects) {
            this._AGobjects = [];
        }
        this._AGobjects.push(gameObject);
    }

    draw() {
        this._AGobjects.forEach(function (element) {
            element.draw();
            console.log('draw on element: ' + element);
        });
    }
}

export class AGObject {
    get AGSoundSources() {
        return this._AGSoundSources;
    }

    set position(value) {
        this._position = value;
    }
    get position() {
        return this._position;
    }

    constructor(name, position, direction) {
        this.name = name;
        this.direction = direction;
        this._position = position;
    }

    addSoundSource(source) {
        if (!this._AGSoundSources) {
            this._AGSoundSources = [];
        }
        source.setPosition(this._position);
        this._AGSoundSources.push(source);
    }

    draw() {
        this._AGSoundSources.forEach(function (element) {
            element.play();
            console.log('draw on element: ' + element);
        });
    }
}

export class AGPlayer /*extends AGObject*/ {}

export class AGSoundSource /*extends AGObject*/ {
    get audioElement() {
        return this._audioElement;
    }
    /*constructor(name, pos:Vector3, dir:Vector3) {
        super(name, pos, dir);
    }*/

    constructor(name, file, looping, interval) {
        this.name = name;
        this.file = file;
        this.looping = looping;
        this.interval = interval;
        this.playing = false;

        // Create an AudioElement.
        this._audioElement = document.createElement('audio');

        // Load an audio file into the AudioElement.
        this.audioElement.src = this.file;

        this.audioElementSource = audioContext.createMediaElementSource(this.audioElement);

        this.source = resonanceAudioScene.createSource();
        this.audioElementSource.connect(this.source.input);
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

let request;

function animate(gameArea) {
    request = requestAnimationFrame(animate);
    draw(gameArea);
}

function draw(gameArea) {
    gameArea.draw();
}

export function play(gameArea, state) {
    if (state) {
        animate(gameArea);
        console.debug("Playing...");
    } else {
        cancelAnimationFrame(request);
    }
}