import { AGGameArea } from "./AGGameArea.js";
import { AGSaLo } from "./AGSaLo.js";
import { AGEventHandler } from "./AGEventHandler.js";
import { AGNavigation } from "./AGNavigation.js";
//import * as ResonanceAudio from './js/resonance/resonance-audio.min.js';
//import * as bla from './js/resonance/resonance-audio.js';

let debug = 0;

export let g_references = new Map();
export let g_history = new AGSaLo();
export let g_eventHandler = new AGEventHandler();
export let g_gamearea;
export let g_controls;

//let resonanceAudioScene; //for first testings, maybe we will need something like AGRoom, where we can also put the resonance rooms into
//let AGGameArea = new AGGameArea("main", new Vector3(20,20,0)); //simulate something "static", probably (quite sure :p) not state of the art
/*
Game Area in which the audio game is played. It holds all audio game objects.
 */

export function setControl(controls) {
    g_controls = controls;
}

const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2
};

let request;

//Update Loop
function animate(gameArea) {
    draw(gameArea);
    request = window.requestAnimationFrame(function () {
        animate(gameArea);
    });
}

//Calling the gameArea for draw (update loop tick)
function draw(gameArea) {
    gameArea.draw();
}

//Start or Stop the game
export function play(gameArea, state) {
    if (state) {
        animate(gameArea);
        console.debug("[AGEngine] Playing...");
    } else {
        cancelAnimationFrame(request);
        stop(gameArea);
    }
}

//Stop game
function stop(gameArea) {
    gameArea.stop();
}