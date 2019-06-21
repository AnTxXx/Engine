import { g_references, g_loading, setLoading, g_gamearea } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";
import { getReferenceById } from "./AGEngine.js";

//import {cloneDeep} from "./js/Lodash/core.js"

let _ = require('lodash/core');

export class AGSaLo {

    constructor() {
        this._savedObjects = [];
    }

    ike(objID, func, args) {
        let _args = Array.prototype.slice.call(args);
        this._savedObjects.push(new SaLoCommand(objID, func, _.cloneDeep(_args)));
        //g_references.set(obj.id, obj);
    }

    rebuild() {
        g_references.clear();
        Counter.reset();
        setLoading(true);
        for (let i = 0; i < this._savedObjects.length; i++) {
            let obj = this._savedObjects[i];
            if (obj.func.toString().startsWith('class')) {
                let newObject = Reflect.construct(obj.func, obj.args);
            } else {
                obj.func.apply(getReferenceById(obj.objID), obj.args);
            }
        }
        setLoading(false);
    }
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