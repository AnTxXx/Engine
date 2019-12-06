// @flow
import { AGGameArea} from "./AGGameArea.js";
import {AGSaLo} from "./AGSaLo.js";
import {AGEventHandler} from "./AGEventHandler.js";
import {AGNavigation} from "./AGNavigation.js";
import {Vector3} from "./js/three/Vector3.js";
import {IAudiCom} from "../ui/js/IAudiCom.js";
import {AGItem} from "./AGItem.js";

export let g_loading:boolean = false;
export let g_playing:boolean = false;
export let g_references:Map<number, Object> = new Map();
export let g_history:AGSaLo = new AGSaLo();
export let g_eventHandler:AGEventHandler = new AGEventHandler();
export let g_gamearea:AGGameArea = new AGGameArea("Area", new Vector3(30,2.5,10));
export let g_controls:AGNavigation;


export let g_IAudiCom:IAudiCom;

export function setIAudiCom(IAC:IAudiCom){
    g_IAudiCom = IAC;
}

export function setGameArea(gameArea:AGGameArea){
    if(g_gamearea) g_gamearea = gameArea;
}

export function setEventHandler(eventHandler:AGEventHandler){
    if(g_eventHandler) g_eventHandler = eventHandler;
}

export function deleteItem(itemID:number){
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGInventory") {
           v.removeItemById(itemID);
        }
    }
    g_eventHandler.deleteEventsContainingItemById(itemID);

    g_references.delete(itemID);
    console.log("[AGEngine] Deleted Item ID " + itemID + " from Inventories and References Table.");
}

export function getOwnerOfItemById(itemID:number){
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGInventory") {
            let item:AGItem = v.searchItemById(itemID);
            if(item){
                return v.attachedTo;
            }
        }
    }
}
//let resonanceAudioScene; //for first testings, maybe we will need something like AGRoom, where we can also put the resonance rooms into
//let AGGameArea = new AGGameArea("main", new Vector3(20,20,0)); //simulate something "static", probably (quite sure :p) not state of the art
/*
Game Area in which the audio game is played. It holds all audio game objects.
 */

/**
 * Creates a new EventHandler and GameArea, mainly for rebuilding the whole scene or creating a new one
 */
export function rebuildHandlerGameArea(){
    g_eventHandler = new AGEventHandler();
    g_gamearea = new AGGameArea("Area", new Vector3(30,2.5,10));
}

/**
 * Sets the Navigation to be a global variable.
 * @param controls The AGNavigation controls to be set as global variable.
 */
export function setControl(controls:AGNavigation){
    g_controls = controls;
}

/**
 * Looks up the reference of the ID in the Reference-ID-Table and returns the object under the saved ID.
 * @param id ID where you want to retrieve the respective object from.
 * @returns {void|Object} Return the object or void.
 */
export function getReferenceById(id:number):Object{
    return g_references.get(id);
}

/**
 * Looks up the ID of the reference in the Reference-ID-Table and returns the saved ID. Every object should have an ID as well which -- again-- should be the same as in the Reference-ID-Table
 * @param obj Object where you want to retrieve the respective ID from.
 * @returns {*} Returns the ID (number).
 */
export function getIdByReference(obj:Object):number{
    return [...g_references.entries()]
    // $FlowFixMe
        .filter(({ 1: v }) => v === obj)
        .map(([k]) => k)[0];
    //return Object.keys(g_references).find(key => g_references[key] === obj);
}

export function getReferencesOfType(type:string):Array<number> {
    let returnArr = [];
    for (let [k, v] of g_references) {
        if (v.constructor.name === type) returnArr.push(k);
    }
    return returnArr;
}

/**
 * Public flag that should be set to true if the system loads or rebuilds a level. Disables the automated saving during loading.
 * @param bool True if the system is in loading state, false if not.
 */
export function setLoading(bool:boolean){
    g_loading = bool;
}

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
    g_eventHandler.evaluateGlobalEvents();
    gameArea.draw();
}

//Start or Stop the game
export function play(gameArea:AGGameArea, state:boolean){
    g_playing = state;
    if(g_playing){
        console.log("[AGEngine] Playing...");
        animate(gameArea);
    } else {
        console.log("[AGEngine] Stop Playing...");
        cancelAnimationFrame(request);
        stop(gameArea);
        unsolveRooms(gameArea);
    }
}

//Stop game
function stop(gameArea:AGGameArea){
    gameArea.stop();
}

function unsolveRooms(gameArea:AGGameArea){
    gameArea.unsolveRooms();
}