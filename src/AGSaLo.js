// @flow

import {g_references, g_loading, setLoading, g_gamearea} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";
import {getReferenceById} from "./AGEngine.js";
import {Vector3} from "./js/three/Vector3.js";

//import {clone} from "./js/Lodash/core.js"

//let _ = require('lodash/core');

export class AGSaLo {

    _savedObjects:Array<SaLoCommand>;

    constructor(){
        this._savedObjects = [];
    }

    ike(objID:number, func:Function, args:Array<Object>){
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, cloneArguments(_args)));
        //g_references.set(obj.id, obj);
    }

    rebuild(){
        g_references.clear();
        Counter.reset();
        setLoading(true);
        for(let i = 0; i < this._savedObjects.length; i++){
            let obj = this._savedObjects[i];

            let args = cloneArguments(obj.args);

            if(obj.func.toString().startsWith('class')) {
                let newObject = Reflect.construct(obj.func, args);
                //g_references.set(obj.objID, newObject);
            } else {
                obj.func.apply(getReferenceById(obj.objID), args);
            }
        }
        setLoading(false);
    }
}

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

    get func() {
        return this._func;
    }

    get args() {
        return this._args;
    }

    /*
    get context() {
        return this._context;
    }*/

    _objID:number;
    _func:Function;
    _args:Array<Object>;
    //_context:Object;

    constructor(objID: number, func:Function, args:Array<Object>) {
        this._func = func;
        this._args = args;
        this._objID = objID;
        //this._context = context;
    }
}