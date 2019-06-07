

export class AGSaLo {

    constructor() {
        this._savedObjects = [];
    }

    ike(obj, func, args, context) {
        let _args = Array.prototype.slice.call(args);
        this._savedObjects.push(new SaLoCommand(obj, func, _args, context));
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