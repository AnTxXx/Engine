import { g_references, g_loading, setLoading, g_gamearea } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { getReferenceById } from "./AGEngine.js";
import { Vector3 } from "./js/three/Vector3.js";
import { g_history } from "./AGEngine.js";

//import {clone} from "./js/Lodash/core.js"

//let _ = require('lodash/core');

export class AGSaLo {
    get savedObjects() {
        return this._savedObjects;
    }

    constructor() {
        this._savedObjects = [];
    }

    ike(objID, func, args) {
        let _args = Array.prototype.slice.call(args);

        this._savedObjects.push(new SaLoCommand(objID, func, cloneArguments(_args)));
        //g_references.set(obj.id, obj);
    }

    rebuild() {
        console.log(g_history);
        g_references.clear();
        Counter.reset();

        //TODO JSON HIN UND HER
        let replacer = (key, value) => {
            // if we get a function give us the code for that function
            if (typeof value === 'function') {
                //console.log('f ' + value.toString());
                let returnVal;
                if (value.toString().startsWith('class')) returnVal = value.toString();else returnVal = 'f ' + value.toString();
                console.log(returnVal);
                return returnVal;
            }
            return value;
        };
        const serialized = JSON.stringify(this._savedObjects, replacer, 2);
        console.log(serialized);

        let reviver = (key, value) => {
            if (typeof value === 'string') {
                let functionTemplate;
                console.log(value);
                if (value.indexOf('f ') === 0) functionTemplate = value.substring(2);else functionTemplate = value;
                console.log(functionTemplate);
                return eval(functionTemplate);
            }

            return value;
        };

        const parsedObject = JSON.parse(serialized, reviver);

        console.log(parsedObject);
        //TODO
        setLoading(true);
        for (let i = 0; i < parsedObject.length; i++) {
            let obj = parsedObject[i];
            //this._savedObjects

            //console.log(prepareForStringify(this._savedObjects));
            //obj.args
            let args = cloneArguments(obj._args);

            //obj.func
            if (obj._func.toString().startsWith('class')) {
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

function prepareForStringify(obj) {
    let rString = [];
    for (let i = 0; i < obj.length; i++) {
        let string = [];
        string[0] = obj[i].objID.toString();
        string[1] = obj[i].func.name;
        string[2] = JSON.stringify(obj[i].args);
        rString.push(string);
    }
    return JSON.stringify(rString);
}

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

    get args() {
        return this._args;
    }

    /*
    get context() {
        return this._context;
    }*/

    //_context:Object;

    constructor(objID, func, args) {
        this._func = func;
        this._args = args;
        this._objID = objID;
        //this._context = context;
    }
}