import {g_references} from "./AGEngine.js";

export class AGSaLo {

    _savedObjects:Array<Object>;

    constructor(){
        this._savedObjects = [];
    }

    ike(obj:Object, func, args, context){
        let _args = Array.prototype.slice.call(args);
        this._savedObjects.push(new SaLoCommand(obj, func, _args, context));
        g_references.set(obj, obj.id);
    }
}


export class SaLoCommand {
    get obj(): Object {
        return this._obj;
    }

    get func() {
        return this._func;
    }

    get args() {
        return this._args;
    }

    get context() {
        return this._context;
    }

    _obj:Object;
    _func;
    _args;
    _context;

    constructor(obj: Object, func, args, context) {
        this._obj = obj;
        this._func = func;
        this._args = args;
        this._context = context;
    }
}