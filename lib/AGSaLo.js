import { g_references, g_loading, setLoading, g_gamearea } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { getReferenceById } from "./AGEngine.js";
import { Vector3 } from "./js/three/Vector3.js";
import { g_history } from "./AGEngine.js";
import { AGEventHandler } from "./AGEventHandler.js";
import { AGGameArea } from "./AGGameArea.js";
import { AGNavigation } from "./AGNavigation.js";
import { AGRoom } from "./AGRoom.js";
import { AGPlayer } from "./AGPlayer.js";
import { AGRoomExit } from "./AGRoomExit.js";
import { AGObject } from "./AGObject.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGPortal } from "./AGPortal.js";
import { AGInventory } from "./AGInventory.js";
import { GlobalEvent } from "./GlobalEvent.js";
import { Event } from "./Event.js";
import { AGItem } from "./AGItem.js";
import { setEventHandler, setGameArea } from "./AGEngine.js";
import { AGCondition } from "./AGCondition.js";

//import {clone} from "./js/Lodash/core.js"

//let _ = require('lodash/core');

export class AGSaLo {

    get savedObjects() {
        return this._savedObjects;
    }

    constructor() {
        this._savedObjects = [];
        this._classes = [];
        this._classes.push(AGEventHandler.prototype, AGGameArea.prototype, AGNavigation.prototype, AGRoom.prototype, AGPlayer.prototype, AGRoomExit.prototype, AGObject.prototype, AGSoundSource.prototype, AGPortal.prototype, Event.prototype, GlobalEvent.prototype, AGInventory.prototype, AGItem.prototype, AGCondition.prototype);
    }

    ike(objID, func, fclass, args) {
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, fclass, cloneArguments(_args)));
        //g_references.set(obj.id, obj);
    }

    printLevel() {
        console.log(JSON.stringify(this._savedObjects));
    }

    /**
     * Saves a string to the browser's clipboard.
     * @param val The string that should be copied to the clipboard.
     */
    saveValueToClipboard(val) {
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
        const text = await new Response(textBlob).text();
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
    rebuild(lvl) {
        //console.log(g_history);
        g_references.clear();
        Counter.reset();

        //TODO JSON HIN UND HER

        let serialized;
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
                let constructor = getConstructor(obj._func, this._classes);
                //console.log(constructor);
                let newObject = Reflect.construct(constructor, args);
                //TODO: TEMPORARY SOLUTION FOR EVENTHANDLER FIRST (NEEDED TO REFRESH global variables)
                if (i === 0) setEventHandler(newObject);
                if (i === 1) setGameArea(newObject);
            } else {
                let applyFunc = this.getFunction(obj._fclass, obj._func);

                if (applyFunc) applyFunc.apply(getReferenceById(obj._objID), args);
            }

            //obj.func
            /*if(obj._func.toString().startsWith('class')) {
                let newObject = Reflect.construct(obj._func, args);
                //g_references.set(obj.objID, newObject);
            } else {
                obj._func.apply(getReferenceById(obj.objID), args);
            }*/
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
    getFunction(classname, funct) {
        let returnFunc = null;
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
        });
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
function getConstructor(classname, obj) {
    let returnFunc = null;
    obj.forEach(function (item) {
        if (item.constructor.name === classname) returnFunc = item.constructor;
    });
    return returnFunc;
}
/*
function prepareForStringify(obj:Array<SaLoCommand>){
    let rString: Array<Array<string>> = [];
    for(let i = 0; i < obj.length; i++) {
        let string: Array<string> = [];
        string[0] = obj[i].objID.toString();
        string[1] = obj[i].func.name;
        string[2] = JSON.stringify(obj[i].args);
        rString.push(string);
    }
    return JSON.stringify(rString);
}*/

/**
 * Deep clones arguments and converts 3 part array back to Vector3.
 * @param args The arguments (args) provided by a function.
 * @returns {Object} Returns the new (converted) arugments array.
 */
function cloneArguments(args) {
    let arr = [];
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
    get objID() {
        return this._objID;
    }
    /*get obj(): Object {
        return this._obj;
    }*/

    get func() {
        return this._func;
    }

    get fclass() {
        return this._fclass;
    }

    get args() {
        return this._args;
    }

    /*
    get context() {
        return this._context;
    }*/

    //_context:Object;

    constructor(objID, func, fclass, args) {
        this._func = func;
        this._args = args;
        this._objID = objID;
        this._fclass = fclass;
        //this._context = context;
    }
}