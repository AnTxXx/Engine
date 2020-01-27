// @flow
import {AGGameArea} from "./AGGameArea.js";
import {AGEventHandler} from "./AGEventHandler.js";
import {AGNavigation} from "./AGNavigation.js";
import {Vector3} from "../lib/js/three/Vector3.js";
import {IAudiCom} from "../ui/js/IAudiCom.js";
import {AGItem} from "./AGItem.js";
import {AGRoom} from "./AGRoom";
import {AGPlayer} from "./AGPlayer";
import {AGRoomExit} from "./AGRoomExit";
import {AGObject} from "./AGObject";
import {AGSoundSource} from "./AGSoundSource";
import {AGPortal} from "./AGPortal";
import {Event} from "./Event";
import {GlobalEvent} from "./GlobalEvent";
import {AGInventory} from "./AGInventory";
import {AGCondition} from "./AGCondition";
import {IncrementOneCounter} from "./IDGenerator";

export let g_loading:boolean = false;
export let g_playing:boolean = false;
export let g_references:Map<number, Object> = new Map();
export let g_eventHandler:AGEventHandler = null; // set by initializeEngine-function
export let g_history: AGSaLo = null; // set by initializeEngine-function
export let g_gamearea:AGGameArea = null; // set by initializeEngine-function
export let g_controls:AGNavigation;
export let g_IAudiCom:IAudiCom; // set in initialization call in index.html

/**
 * Sets the IAudiCom Interface that connects the GUI with the Engine. Global variable.
 * @param IAC The IAudiCom interface.
 */
export function setIAudiCom(IAC:IAudiCom){
    g_IAudiCom = IAC;
}

export function initializeEngine() {
    g_history = new AGSaLo();
    g_eventHandler = new AGEventHandler();
    g_gamearea = new AGGameArea("Area", new Vector3(30,2.5,10));
}

export function startAGEngine() {
    initializeEngine();

    let controls: AGNavigation = new AGNavigation(38, 40, 37, 39, 67);
    let controlsID: number = getIdByReference(controls);
    setControl(getReferenceById(controlsID));

    let room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
    let room_1ID = getIdByReference(room_1);
    g_gamearea.addRoom(room_1ID);
    let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
    let playerID = getIdByReference(player);

    let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

    getReferenceById(room_1ID).add(playerID);

    g_gamearea.listener = playerID;
    getReferenceById(room_1ID).listener = playerID;


    //Player Settings
    getReferenceById(playerID).setSpeedSkalar(0.1);

    //getReferenceById(playerID).movable = true;
    getReferenceById(playerID).dangerous = true;
    getReferenceById(playerID).damage = 1;
    getReferenceById(playerID).range = 1;
    getReferenceById(playerID).interactionCooldown = 500;
    getReferenceById(playerID).hitSound = ouch.ID;

    getReferenceById(room_1ID).live = true;
    //play(area, true);

    console.log(g_history);

    //g_history.rebuild();

    //console.log(g_gamearea.AGRooms[0].AGobjects);
    //console.log(g_references);

    setIAudiCom(new IAudiCom());
}

/**
 * Sets the GameArea. Global variable.
 * @param gameArea The AGGameArea to be set.
 */
export function setGameArea(gameArea:AGGameArea){
    if(g_gamearea) g_gamearea = gameArea;
}

/**
 * Sets the EventHandler. Global variable.
 * @param eventHandler The AGEventHandler to be set.
 */
export function setEventHandler(eventHandler:AGEventHandler){
    if(g_eventHandler) g_eventHandler = eventHandler;
}

/**
 * Deletes an Item from the inventories, events (including the events themselves), and from the reference list.
 * @param itemID The id of the AGItem to be removed.
 */
export function deleteItem(itemID:number){
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
export function deleteCondition(conditionID:number){
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
export function getOwnerIdOfItemById(itemID:number){
    for (let [k, v] of g_references) {
        if (v.constructor.name === "AGInventory") {
            let item:AGItem = v.searchItemById(itemID);
            if(item){
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

/**
 * Returns all IDs of a given Type (e.g., AGItem) from the references table.
 * @param type The type as string.
 * @returns {Array} Returns an array of found IDs.
 */
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
/*
const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2,
};*/

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

/**
 * Starts and stops the game.
 * @param gameArea The AGGameArea the game is running in.
 * @param state Set to true, if the game should run, otherwise set to false.
 */
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

/**
 * Sets a room to be unsolved again, if it has been set to solved (e.g., player has reached the goal).
 * @param gameArea The AGGameArea the game is running in.
 */
function unsolveRooms(gameArea:AGGameArea){
    gameArea.unsolveRooms();
}

/**
 * Class which is responsible for saving and loading of levels.
 */
export class AGSaLo {
    _classes: Array<Function>;


    get savedObjects() {
        return this._savedObjects;
    }

    _savedObjects: Array<SaLoCommand>;

    constructor() {
        this._savedObjects = [];
        this._classes = [];
        this._classes.push(AGEventHandler.prototype, AGGameArea.prototype, AGNavigation.prototype, AGRoom.prototype, AGPlayer.prototype, AGRoomExit.prototype, AGObject.prototype, AGSoundSource.prototype, AGPortal.prototype, Event.prototype, GlobalEvent.prototype, AGInventory.prototype, AGItem.prototype, AGCondition.prototype);
    }

    ike(objID: number, func: string, fclass: string, args: Array<Object>) {
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, fclass, cloneArguments(_args)));
    }

    printLevel() {
        console.log(JSON.stringify(this._savedObjects));
    }

    /**
     * Saves a string to the browser's clipboard.
     * @param val The string that should be copied to the clipboard.
     */
    saveValueToClipboard(val: string) {
        let dummy = document.createElement("textarea");
        // to avoid breaking orgain page when copying more words
        // cant copy when adding below this code
        // dummy.style.display = 'none'
        if (document.body) document.body.appendChild(dummy);
        //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
        dummy.value = val;
        dummy.select();
        document.execCommand("copy");
        if (document.body) document.body.removeChild(dummy);
    }

    //only works outside of the little firefox world
    async loadLevelFromClipboard() {
        console.log("[AGSaLo] Loading Level from Clipboard.");
        const items = await navigator.clipboard.read();
        // $FlowFixMe
        const textBlob = await items[0].getType("text/plain");
        const text = await (new Response(textBlob)).text();
        this.rebuild(text);
    }

    saveLevelToClipboard() {
        console.log("[AGSaLo] Saving Level to Clipboard.");
        this.saveValueToClipboard(JSON.stringify(this._savedObjects));
    }

    /**
     * Rebuilds the game / level based on the provided string. Only accepts a string that has been created by the export function of the engine before.
     * @param lvl The game / level to be rebuilt.
     */
    rebuild(lvl?: string) {
        //console.log(g_history);
        IncrementOneCounter.reset();

        let serialized: string;
        //let parsedObject:Object;

        if (!lvl) {
            //serialized = JSON.stringify(this._savedObjects);
            //this._savedObjects = JSON.parse(serialized);
        } else {
            console.log("[AGSaLo] Reading ...");
            this._savedObjects = JSON.parse(lvl);
            console.log("[AGSaLo] Parsing complete!");
        }

        //this.printLevel();
        //console.log(parsedObject);
        console.log("[AGSaLo] Start rebuilding. Loading Toggle has been ENABLED.");
        setLoading(true);
        for (let i = 0; i < this._savedObjects.length; i++) {
            let obj = this._savedObjects[i];
            //this._savedObjects

            //console.log(prepareForStringify(this._savedObjects));
            //obj.args
            let args = cloneArguments(obj._args);

            //prepare args (e.g., x,y,z -> Vector3)
            for (let i = 0; i < args.length; i++) {
                let type = typeof args[i];
                //console.log("[AGSaLo] Conversion from Object to Vector3. Type: " + type.toString() + " arg " + args[i].toString());
                if (type === "object" && args[i].x != null && args[i].y != null && args[i].z != null) {
                    args[i] = new Vector3(args[i].x, args[i].y, args[i].z);
                }
            }
            //------------------------------------

            if (obj._func === obj._fclass) {
                //console.log(obj._func);
                let constructor: Function = getConstructor(obj._func, this._classes);
                //console.log(constructor);
                let newObject = Reflect.construct(constructor, args);
                //TEMPORARY SOLUTION FOR EVENTHANDLER FIRST (NEEDED TO REFRESH global variables)
                if (i === 0) g_eventHandler = newObject;
                if (i === 1) g_gamearea = newObject;
            } else {
                let applyFunc: Function = this.getFunction(obj._fclass, obj._func);

                if (applyFunc) applyFunc.apply(getReferenceById(obj._objID), args)
            }
        }
        setLoading(false);
        console.log("[AGSaLo] Rebuilding finished! Loading Toggle has been DISABLED.");
        console.log(this._savedObjects);
        //console.log(g_history);
        //this.saveLevel();
    }

    /**
     * Returns a Function depending on the provided classname and name of the function.
     * @param classname The class that entails the function.
     * @param funct The function name provided as string.
     * @returns {Function} The function found. Returns null if the function or the class does not exist.
     */
    getFunction(classname: string, funct: string): ?Function {
        let returnFunc: Function = null;
        this._classes.forEach(function (item) {
            if (item.constructor.name === classname) {
                //console.log(classname + " " + item.constructor.name);
                if (funct.indexOf('set ') === 0) {
                    if (Object.getOwnPropertyDescriptor(item, funct.substring(4))) {
                        // $FlowFixMe
                        returnFunc = Object.getOwnPropertyDescriptor(item, funct.substring(4)).set;
                    } else {
                        // $FlowFixMe
                        returnFunc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(item), funct.substring(4)).set;
                    }
                } else {
                    if (Object.getOwnPropertyDescriptor(item, funct)) {
                        // $FlowFixMe
                        returnFunc = Object.getOwnPropertyDescriptor(item, funct).value;
                    } else {
                        // $FlowFixMe
                        returnFunc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(item), funct).value;
                    }
                }

                //console.log(returnFunc);
            }
        })
        return returnFunc;
        //Object.getOwnPropertyDescriptor(((class) classname).prototype, funct)
    }
}

/**
 * Gets the constructor as function depending on the provided classname and name of the constructor.
 * @param classname The class that entails a constructor function.
 * @param obj An Array of classes.
 * @returns {null} Returns the Constructor found, otherwise null.
 */
function getConstructor(classname: string, obj: Array<Function>): ?Function {
    let returnFunc = null;
    obj.forEach(function (item) {
        if (item.constructor.name === classname) returnFunc = item.constructor;
    })
    return returnFunc;
}

/**
 * Deep clones arguments and converts 3 part array back to Vector3.
 * @param args The arguments (args) provided by a function.
 * @returns {Object} Returns the new (converted) arugments array.
 */
function cloneArguments(args: Array<Object>): Array<Object> {
    let arr: Object = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof Vector3) {
            arr.push(new Vector3(args[i].x, args[i].y, args[i].z));
        } else {
            arr.push(args[i]);
        }
    }

    return arr;
}

export class SaLoCommand {
    get objID(): number {
        return this._objID;
    }

    /*get obj(): Object {
        return this._obj;
    }*/


    get func(): string {
        return this._func;
    }

    get fclass(): string {
        return this._fclass;
    }

    get args() {
        return this._args;
    }

    /*
    get context() {
        return this._context;
    }*/

    _objID: number;
    _func: string;
    _fclass: string;
    _args: Array<Object>;

    //_context:Object;

    constructor(objID: number, func: string, fclass: string, args: Array<Object>) {
        this._func = func;
        this._args = args;
        this._objID = objID;
        this._fclass = fclass;
        //this._context = context;
    }
}