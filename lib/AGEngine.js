import { AGGameArea } from "./AGGameArea.js";
import { AGSaLo } from "./AGSaLo.js";
import { AGEventHandler } from "./AGEventHandler.js";
import { AGNavigation } from "./AGNavigation.js";
import { Vector3 } from "./js/three/Vector3.js";
import { IAudiCom } from "../ui/js/IAudiCom.js";
import { AGItem } from "./AGItem.js";

export let g_loading = false;
export let g_playing = false;
export let g_references = new Map();
export let g_history = new AGSaLo();
export let g_eventHandler = new AGEventHandler();
export let g_gamearea = new AGGameArea("Area", new Vector3(30, 2.5, 10));
export let g_controls;

export let g_IAudiCom;

/**
 * Sets the IAudiCom Interface that connects the GUI with the Engine. Global variable.
 * @param IAC The IAudiCom interface.
 */
export function setIAudiCom(IAC) {
    g_IAudiCom = IAC;
}

/**
 * Sets the GameArea. Global variable.
 * @param gameArea The AGGameArea to be set.
 */
export function setGameArea(gameArea) {
    if (g_gamearea) g_gamearea = gameArea;
}

/**
 * Sets the EventHandler. Global variable.
 * @param eventHandler The AGEventHandler to be set.
 */
export function setEventHandler(eventHandler) {
    if (g_eventHandler) g_eventHandler = eventHandler;
}

/**
 * Deletes an Item from the inventories, events (including the events themselves), and from the reference list.
 * @param itemID The id of the AGItem to be removed.
 */
export function deleteItem(itemID) {
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGInventory") {
            v.removeItemById(itemID);
        }
    }
    g_eventHandler.deleteEventsContainingItemById(itemID);

    getReferenceById(itemID).deleteItemInReferences();

    console.log("[AGEngine] Deleted Item ID " + itemID + " from Inventories and References Table.");
}

/**
 * Deletes a Condition by ID.
 * @param conditionID The ID of the AGCondition to be removed.
 */
export function deleteCondition(conditionID) {
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGPortal") {
            v.deleteConditionById(conditionID);
        }
    }

    // g_references.delete(conditionID);
    console.log("[AGEngine] Deleted Condition ID " + conditionID + " from Objects and References Table.");
}

/**
 * Returns the ID of the AGObject, in which's inventory the item is.
 * @param itemID The ID of the AGItem.
 * @returns {number} Returns the ID of the AGObject.
 */
export function getOwnerIdOfItemById(itemID) {
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGInventory") {
            let item = v.searchItemById(itemID);
            if (item) {
                return v.attachedTo.ID;
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
 * Creates a new EventHandler and GameArea, mainly for rebuilding the whole scene or creating a new one.
 */
export function rebuildHandlerGameArea() {
    g_eventHandler = new AGEventHandler();
    g_gamearea = new AGGameArea("Area", new Vector3(30, 2.5, 10));
}

/**
 * Sets the Navigation to be a global variable.
 * @param controls The AGNavigation controls to be set as global variable.
 */
export function setControl(controls) {
    g_controls = controls;
}

/**
 * Looks up the reference of the ID in the Reference-ID-Table and returns the object under the saved ID.
 * @param id ID where you want to retrieve the respective object from.
 * @returns {void|Object} Return the object or void.
 */
export function getReferenceById(id) {
    return g_references.get(id);
}

/**
 * Looks up the ID of the reference in the Reference-ID-Table and returns the saved ID. Every object should have an ID as well which -- again-- should be the same as in the Reference-ID-Table
 * @param obj Object where you want to retrieve the respective ID from.
 * @returns {*} Returns the ID (number).
 */
export function getIdByReference(obj) {
    return [...g_references.entries()]
    // $FlowFixMe
    .filter(({ 1: v }) => v === obj).map(([k]) => k)[0];
    //return Object.keys(g_references).find(key => g_references[key] === obj);
}

/**
 * Returns all IDs of a given Type (e.g., AGItem) from the references table.
 * @param type The type as string.
 * @returns {[]} Returns an array of found IDs.
 */
export function getReferencesOfType(type) {
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
export function setLoading(bool) {
    g_loading = bool;
}
/*
const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2,
};*/

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
    g_eventHandler.evaluateGlobalEvents();
    gameArea.draw();
}

/**
 * Starts and stops the game.
 * @param gameArea The AGGameArea the game is running in.
 * @param state Set to true, if the game should run, otherwise set to false.
 */
export function play(gameArea, state) {
    g_playing = state;
    if (g_playing) {
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
function stop(gameArea) {
    gameArea.stop();
}

/**
 * Sets a room to be unsolved again, if it has been set to solved (e.g., player has reached the goal).
 * @param gameArea The AGGameArea the game is running in.
 */
function unsolveRooms(gameArea) {
    gameArea.unsolveRooms();
}