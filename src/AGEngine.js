// @flow
import { AGGameArea} from "./AGGameArea.js";
//import * as ResonanceAudio from './js/resonance/resonance-audio.min.js';
//import * as bla from './js/resonance/resonance-audio.js';

let debug = 0;

//let resonanceAudioScene; //for first testings, maybe we will need something like AGRoom, where we can also put the resonance rooms into
//let AGGameArea = new AGGameArea("main", new Vector3(20,20,0)); //simulate something "static", probably (quite sure :p) not state of the art
/*
Game Area in which the audio game is played. It holds all audio game objects.
 */

const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2,
};

let request;

//Update Loop
function animate(gameArea:AGGameArea) {
    draw(gameArea);
    request = window.requestAnimationFrame(function () {
        animate(gameArea);
    })
}

//Calling the gameArea for draw (update loop tick)
function draw(gameArea:AGGameArea) {
    gameArea.draw();
}

//Start or Stop the game
export function play(gameArea:AGGameArea, state:boolean){
    if(state){
        animate(gameArea);
        console.debug("[AGEngine] Playing...");
    } else {
        cancelAnimationFrame(request)
        stop(gameArea);
    }
}

//Stop game
function stop(gameArea:AGGameArea){
    gameArea.stop();
}