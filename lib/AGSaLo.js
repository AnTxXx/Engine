import { g_references, g_loading, setLoadin, g_gamearea } from "./AGEngine.js";
import { Counter } from "./IDGenerator.js";

export class AGSaLo {

    constructor() {
        this._savedObjects = [];
    }

    ike(obj, func, args, context) {
        let _args = Array.prototype.slice.call(args);
        this._savedObjects.push(new SaLoCommand(obj, func, _args, context));
        //g_references.set(obj.id, obj);
    }

    rebuild() {
        g_references.clear();
        Counter.reset();
        g_gamearea.clearRooms();
        setLoading(true);
        for (let i = 0; i < this._savedObjects.length; i++) {
            let obj = this._savedObjects[i];
            if (obj.func.toString().startsWith('class')) {
                let newObject = Reflect.construct(obj.func, obj.args);
            } else {
                obj.func.apply(obj.context, obj.args);
            }
        }
        setLoading(false);
    }
}

export class SaLoCommand {
    get obj() {
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

    constructor(obj, func, args, context) {
        this._obj = obj;
        this._func = func;
        this._args = args;
        this._context = context;
    }
}