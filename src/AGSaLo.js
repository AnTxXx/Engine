// @flow

import {g_references, g_loading, setLoading, g_gamearea} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";
import {getReferenceById} from "./AGEngine.js";
import {Vector3} from "./js/three/Vector3.js";
import {g_history} from "./AGEngine.js";
import {AGEventHandler} from "./AGEventHandler.js";
import {AGGameArea} from "./AGGameArea.js";
import {AGNavigation} from "./AGNavigation.js";
import {AGRoom} from "./AGRoom.js";
import {AGPlayer} from "./AGPlayer.js";
import {AGRoomExit} from "./AGRoomExit.js";
import {AGObject} from "./AGObject.js";
import {AGSoundSource} from "./AGSoundSource.js";
import {AGPortal} from "./AGPortal.js";


//import {clone} from "./js/Lodash/core.js"

//let _ = require('lodash/core');

export class AGSaLo {
    _classes:Array<Function>;


    get savedObjects() {
        return this._savedObjects;
    }

    _savedObjects:Array<SaLoCommand>;

    constructor(){
        this._savedObjects = [];
        this._classes = [];
        this._classes.push(AGEventHandler.prototype, AGGameArea.prototype, AGNavigation.prototype, AGRoom.prototype, AGPlayer.prototype, AGRoomExit.prototype, AGObject.prototype, AGSoundSource.prototype, AGPortal.prototype);
    }

    ike(objID:number, func:string, fclass:string, args:Array<Object>){
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, fclass, cloneArguments(_args)));
        //g_references.set(obj.id, obj);
    }

    printLevel(){
        console.log(JSON.stringify(this._savedObjects));
    }

    rebuild(){
        console.log(g_history);
        g_references.clear();
        Counter.reset();

        //TODO JSON HIN UND HER
        const serialized = JSON.stringify(this._savedObjects);

        const parsedObject = JSON.parse(serialized);

        this.printLevel();
        //console.log(parsedObject);

        setLoading(true);
        for(let i = 0; i < parsedObject.length; i++){
            let obj = parsedObject[i];
            //this._savedObjects

            //console.log(prepareForStringify(this._savedObjects));
            //obj.args
            let args = cloneArguments(obj._args);

            //prepare args (e.g., x,y,z -> Vector3)
            for(let i = 0; i < args.length; i++){
                let type = typeof args[i];
                if(type === "object" && args[i].x != null && args[i].y != null && args[i].z != null){
                    args[i] = new Vector3(args[i].x, args[i].y, args[i].z);
                }
            }
            //------------------------------------

            if(obj._func === obj._fclass){
                let constructor:Function = getConstructor(obj._func, this._classes);
                //console.log(constructor);
                let newObject = Reflect.construct(constructor, args);
            } else {
                let applyFunc:Function = getFunction(obj._fclass, obj._func, this._classes);
                
                if(applyFunc) applyFunc.apply(getReferenceById(obj._objID), args)
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
        //console.log(g_history);
    }
}

function getFunction(classname:string, funct:string, obj:Array<Function>):?Function{
    let returnFunc:Function = null;
    obj.forEach(function (item) {
        if(item.constructor.name === classname){
            //console.log(classname + " " + item.constructor.name);
            if(funct.indexOf('set ') === 0){
                if(Object.getOwnPropertyDescriptor(item, funct.substring(4))){
                    // $FlowFixMe
                    returnFunc = Object.getOwnPropertyDescriptor(item, funct.substring(4)).set;
                } else {
                    // $FlowFixMe
                    returnFunc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(item), funct.substring(4)).set;
                }
            } else {
                if(Object.getOwnPropertyDescriptor(item, funct)){
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

function getConstructor(classname:string, obj:Array<Function>):?Function{
    let returnFunc = null;
    obj.forEach(function (item) {
        if(item.constructor.name === classname) returnFunc = item.constructor;
    })
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

function cloneArguments(args:Array<Object>):Array<Object> {
    let arr:Object = [];
    for(let i = 0; i < args.length; i++){
        if(args[i] instanceof Vector3){
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

    _objID:number;
    _func:string;
    _fclass:string;
    _args:Array<Object>;
    //_context:Object;

    constructor(objID: number, func:string, fclass:string, args:Array<Object>) {
        this._func = func;
        this._args = args;
        this._objID = objID;
        this._fclass = fclass;
        //this._context = context;
    }
}