// @flow

import {g_references, g_loading, setLoading, g_gamearea} from "./AGEngine.js";
import {Counter} from "./IDGenerator.js";
import {getReferenceById} from "./AGEngine.js";
import {Vector3} from "./js/three/Vector3.js";
import {g_history} from "./AGEngine.js";

//import {clone} from "./js/Lodash/core.js"

//let _ = require('lodash/core');

export class AGSaLo {
    _classes:Array<Class>;


    get savedObjects() {
        return this._savedObjects;
    }

    _savedObjects:Array<SaLoCommand>;

    constructor(){
        this._savedObjects = [];

        this._classes.push(AGEventHandler.prototype);


    }

    ike(objID:number, func:Function, args:Array<Object>){
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, cloneArguments(_args)));
        //g_references.set(obj.id, obj);
    }

    rebuild(){
        console.log(g_history);
        g_references.clear();
        Counter.reset();

        //TODO JSON HIN UND HER
        let replacer = (key, value) => {
            // if we get a function give us the code for that function
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        }
        const serialized = JSON.stringify(this._savedObjects, replacer, 2);
        console.log(serialized);

        let reviver = (key, value) => {
            if (typeof value === 'string'
                && value.indexOf('function ') === 0) {
                let functionTemplate = `(${value})`;
                return eval(functionTemplate);
            }
            return value;
        }

        const parsedObject = JSON.parse(serialized, reviver);

        console.log(parsedObject);
        //TODO
        setLoading(true);
        for(let i = 0; i < parsedObject.length; i++){
            let obj = parsedObject[i];
            //this._savedObjects

            //console.log(prepareForStringify(this._savedObjects));
            //obj.args
            let args = cloneArguments(obj._args);

            //obj.func
            if(obj._func.toString().startsWith('class')) {
                let newObject = Reflect.construct(obj._func, args);
                //g_references.set(obj.objID, newObject);
            } else {
                obj._func.apply(getReferenceById(obj.objID), args);
            }
        }
        setLoading(false);
        //console.log(g_history);
    }
}

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