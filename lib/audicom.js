
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
var _Math = {
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  generateUUID: function () {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
    var lut = [];

    for (var i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + i.toString(16);
    }

    return function generateUUID() {
      var d0 = Math.random() * 0xffffffff | 0;
      var d1 = Math.random() * 0xffffffff | 0;
      var d2 = Math.random() * 0xffffffff | 0;
      var d3 = Math.random() * 0xffffffff | 0;
      var uuid = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff]; // .toUpperCase() here flattens concatenated strings to save heap memory space.

      return uuid.toUpperCase();
    };
  }(),
  clamp: function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  // compute euclidian modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  euclideanModulo: function euclideanModulo(n, m) {
    return (n % m + m) % m;
  },
  // Linear mapping from range <a1, a2> to range <b1, b2>
  mapLinear: function mapLinear(x, a1, a2, b1, b2) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  },
  // https://en.wikipedia.org/wiki/Linear_interpolation
  lerp: function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  },
  // http://en.wikipedia.org/wiki/Smoothstep
  smoothstep: function smoothstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  },
  smootherstep: function smootherstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  },
  // Random integer from <low, high> interval
  randInt: function randInt(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
  },
  // Random float from <low, high> interval
  randFloat: function randFloat(low, high) {
    return low + Math.random() * (high - low);
  },
  // Random float from <-range/2, range/2> interval
  randFloatSpread: function randFloatSpread(range) {
    return range * (0.5 - Math.random());
  },
  degToRad: function degToRad(degrees) {
    return degrees * _Math.DEG2RAD;
  },
  radToDeg: function radToDeg(radians) {
    return radians * _Math.RAD2DEG;
  },
  isPowerOfTwo: function isPowerOfTwo(value) {
    return (value & value - 1) === 0 && value !== 0;
  },
  ceilPowerOfTwo: function ceilPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
  },
  floorPowerOfTwo: function floorPowerOfTwo(value) {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
  }
};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 */

function Matrix4() {
  this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  if (arguments.length > 0) {
    console.error('THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.');
  }
}

Object.assign(Matrix4.prototype, {
  isMatrix4: true,
  set: function set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    var te = this.elements;
    te[0] = n11;
    te[4] = n12;
    te[8] = n13;
    te[12] = n14;
    te[1] = n21;
    te[5] = n22;
    te[9] = n23;
    te[13] = n24;
    te[2] = n31;
    te[6] = n32;
    te[10] = n33;
    te[14] = n34;
    te[3] = n41;
    te[7] = n42;
    te[11] = n43;
    te[15] = n44;
    return this;
  },
  identity: function identity() {
    this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  },
  clone: function clone() {
    return new Matrix4().fromArray(this.elements);
  },
  copy: function copy(m) {
    var te = this.elements;
    var me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    te[9] = me[9];
    te[10] = me[10];
    te[11] = me[11];
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    te[15] = me[15];
    return this;
  },
  copyPosition: function copyPosition(m) {
    var te = this.elements,
        me = m.elements;
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    return this;
  },
  extractBasis: function extractBasis(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);
    return this;
  },
  makeBasis: function makeBasis(xAxis, yAxis, zAxis) {
    this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
    return this;
  },
  extractRotation: function () {
    var v1 = new Vector3();
    return function extractRotation(m) {
      // this method does not support reflection matrices
      var te = this.elements;
      var me = m.elements;
      var scaleX = 1 / v1.setFromMatrixColumn(m, 0).length();
      var scaleY = 1 / v1.setFromMatrixColumn(m, 1).length();
      var scaleZ = 1 / v1.setFromMatrixColumn(m, 2).length();
      te[0] = me[0] * scaleX;
      te[1] = me[1] * scaleX;
      te[2] = me[2] * scaleX;
      te[3] = 0;
      te[4] = me[4] * scaleY;
      te[5] = me[5] * scaleY;
      te[6] = me[6] * scaleY;
      te[7] = 0;
      te[8] = me[8] * scaleZ;
      te[9] = me[9] * scaleZ;
      te[10] = me[10] * scaleZ;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    };
  }(),
  makeRotationFromEuler: function makeRotationFromEuler(euler) {
    if (!(euler && euler.isEuler)) {
      console.error('THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.');
    }

    var te = this.elements;
    var x = euler.x,
        y = euler.y,
        z = euler.z;
    var a = Math.cos(x),
        b = Math.sin(x);
    var c = Math.cos(y),
        d = Math.sin(y);
    var e = Math.cos(z),
        f = Math.sin(z);

    if (euler.order === 'XYZ') {
      var ae = a * e,
          af = a * f,
          be = b * e,
          bf = b * f;
      te[0] = c * e;
      te[4] = -c * f;
      te[8] = d;
      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = -b * c;
      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;
    } else if (euler.order === 'YXZ') {
      var ce = c * e,
          cf = c * f,
          de = d * e,
          df = d * f;
      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;
      te[1] = a * f;
      te[5] = a * e;
      te[9] = -b;
      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;
    } else if (euler.order === 'ZXY') {
      var ce = c * e,
          cf = c * f,
          de = d * e,
          df = d * f;
      te[0] = ce - df * b;
      te[4] = -a * f;
      te[8] = de + cf * b;
      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;
      te[2] = -a * d;
      te[6] = b;
      te[10] = a * c;
    } else if (euler.order === 'ZYX') {
      var ae = a * e,
          af = a * f,
          be = b * e,
          bf = b * f;
      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;
      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;
      te[2] = -d;
      te[6] = b * c;
      te[10] = a * c;
    } else if (euler.order === 'YZX') {
      var ac = a * c,
          ad = a * d,
          bc = b * c,
          bd = b * d;
      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;
      te[1] = f;
      te[5] = a * e;
      te[9] = -b * e;
      te[2] = -d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === 'XZY') {
      var ac = a * c,
          ad = a * d,
          bc = b * c,
          bd = b * d;
      te[0] = c * e;
      te[4] = -f;
      te[8] = d * e;
      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;
      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;
    } // bottom row


    te[3] = 0;
    te[7] = 0;
    te[11] = 0; // last column

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  },
  makeRotationFromQuaternion: function () {
    var zero = new Vector3(0, 0, 0);
    var one = new Vector3(1, 1, 1);
    return function makeRotationFromQuaternion(q) {
      return this.compose(zero, q, one);
    };
  }(),
  lookAt: function () {
    var x = new Vector3();
    var y = new Vector3();
    var z = new Vector3();
    return function lookAt(eye, target, up) {
      var te = this.elements;
      z.subVectors(eye, target);

      if (z.lengthSq() === 0) {
        // eye and target are in the same position
        z.z = 1;
      }

      z.normalize();
      x.crossVectors(up, z);

      if (x.lengthSq() === 0) {
        // up and z are parallel
        if (Math.abs(up.z) === 1) {
          z.x += 0.0001;
        } else {
          z.z += 0.0001;
        }

        z.normalize();
        x.crossVectors(up, z);
      }

      x.normalize();
      y.crossVectors(z, x);
      te[0] = x.x;
      te[4] = y.x;
      te[8] = z.x;
      te[1] = x.y;
      te[5] = y.y;
      te[9] = z.y;
      te[2] = x.z;
      te[6] = y.z;
      te[10] = z.z;
      return this;
    };
  }(),
  multiply: function multiply(m, n) {
    if (n !== undefined) {
      console.warn('THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.');
      return this.multiplyMatrices(m, n);
    }

    return this.multiplyMatrices(this, m);
  },
  premultiply: function premultiply(m) {
    return this.multiplyMatrices(m, this);
  },
  multiplyMatrices: function multiplyMatrices(a, b) {
    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;
    var a11 = ae[0],
        a12 = ae[4],
        a13 = ae[8],
        a14 = ae[12];
    var a21 = ae[1],
        a22 = ae[5],
        a23 = ae[9],
        a24 = ae[13];
    var a31 = ae[2],
        a32 = ae[6],
        a33 = ae[10],
        a34 = ae[14];
    var a41 = ae[3],
        a42 = ae[7],
        a43 = ae[11],
        a44 = ae[15];
    var b11 = be[0],
        b12 = be[4],
        b13 = be[8],
        b14 = be[12];
    var b21 = be[1],
        b22 = be[5],
        b23 = be[9],
        b24 = be[13];
    var b31 = be[2],
        b32 = be[6],
        b33 = be[10],
        b34 = be[14];
    var b41 = be[3],
        b42 = be[7],
        b43 = be[11],
        b44 = be[15];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  },
  multiplyScalar: function multiplyScalar(s) {
    var te = this.elements;
    te[0] *= s;
    te[4] *= s;
    te[8] *= s;
    te[12] *= s;
    te[1] *= s;
    te[5] *= s;
    te[9] *= s;
    te[13] *= s;
    te[2] *= s;
    te[6] *= s;
    te[10] *= s;
    te[14] *= s;
    te[3] *= s;
    te[7] *= s;
    te[11] *= s;
    te[15] *= s;
    return this;
  },
  applyToBufferAttribute: function () {
    var v1 = new Vector3();
    return function applyToBufferAttribute(attribute) {
      for (var i = 0, l = attribute.count; i < l; i++) {
        v1.x = attribute.getX(i);
        v1.y = attribute.getY(i);
        v1.z = attribute.getZ(i);
        v1.applyMatrix4(this);
        attribute.setXYZ(i, v1.x, v1.y, v1.z);
      }

      return attribute;
    };
  }(),
  determinant: function determinant() {
    var te = this.elements;
    var n11 = te[0],
        n12 = te[4],
        n13 = te[8],
        n14 = te[12];
    var n21 = te[1],
        n22 = te[5],
        n23 = te[9],
        n24 = te[13];
    var n31 = te[2],
        n32 = te[6],
        n33 = te[10],
        n34 = te[14];
    var n41 = te[3],
        n42 = te[7],
        n43 = te[11],
        n44 = te[15]; //TODO: make this more efficient
    //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

    return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
  },
  transpose: function transpose() {
    var te = this.elements;
    var tmp;
    tmp = te[1];
    te[1] = te[4];
    te[4] = tmp;
    tmp = te[2];
    te[2] = te[8];
    te[8] = tmp;
    tmp = te[6];
    te[6] = te[9];
    te[9] = tmp;
    tmp = te[3];
    te[3] = te[12];
    te[12] = tmp;
    tmp = te[7];
    te[7] = te[13];
    te[13] = tmp;
    tmp = te[11];
    te[11] = te[14];
    te[14] = tmp;
    return this;
  },
  setPosition: function setPosition(v) {
    var te = this.elements;
    te[12] = v.x;
    te[13] = v.y;
    te[14] = v.z;
    return this;
  },
  getInverse: function getInverse(m, throwOnDegenerate) {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    var te = this.elements,
        me = m.elements,
        n11 = me[0],
        n21 = me[1],
        n31 = me[2],
        n41 = me[3],
        n12 = me[4],
        n22 = me[5],
        n32 = me[6],
        n42 = me[7],
        n13 = me[8],
        n23 = me[9],
        n33 = me[10],
        n43 = me[11],
        n14 = me[12],
        n24 = me[13],
        n34 = me[14],
        n44 = me[15],
        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
    var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {
      var msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";

      if (throwOnDegenerate === true) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }

      return this.identity();
    }

    var detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
    return this;
  },
  scale: function scale(v) {
    var te = this.elements;
    var x = v.x,
        y = v.y,
        z = v.z;
    te[0] *= x;
    te[4] *= y;
    te[8] *= z;
    te[1] *= x;
    te[5] *= y;
    te[9] *= z;
    te[2] *= x;
    te[6] *= y;
    te[10] *= z;
    te[3] *= x;
    te[7] *= y;
    te[11] *= z;
    return this;
  },
  getMaxScaleOnAxis: function getMaxScaleOnAxis() {
    var te = this.elements;
    var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  },
  makeTranslation: function makeTranslation(x, y, z) {
    this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    return this;
  },
  makeRotationX: function makeRotationX(theta) {
    var c = Math.cos(theta),
        s = Math.sin(theta);
    this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
    return this;
  },
  makeRotationY: function makeRotationY(theta) {
    var c = Math.cos(theta),
        s = Math.sin(theta);
    this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
    return this;
  },
  makeRotationZ: function makeRotationZ(theta) {
    var c = Math.cos(theta),
        s = Math.sin(theta);
    this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  },
  makeRotationAxis: function makeRotationAxis(axis, angle) {
    // Based on http://www.gamedev.net/reference/articles/article1199.asp
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var t = 1 - c;
    var x = axis.x,
        y = axis.y,
        z = axis.z;
    var tx = t * x,
        ty = t * y;
    this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
    return this;
  },
  makeScale: function makeScale(x, y, z) {
    this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    return this;
  },
  makeShear: function makeShear(x, y, z) {
    this.set(1, y, z, 0, x, 1, z, 0, x, y, 1, 0, 0, 0, 0, 1);
    return this;
  },
  compose: function compose(position, quaternion, scale) {
    var te = this.elements;
    var x = quaternion._x,
        y = quaternion._y,
        z = quaternion._z,
        w = quaternion._w;
    var x2 = x + x,
        y2 = y + y,
        z2 = z + z;
    var xx = x * x2,
        xy = x * y2,
        xz = x * z2;
    var yy = y * y2,
        yz = y * z2,
        zz = z * z2;
    var wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    var sx = scale.x,
        sy = scale.y,
        sz = scale.z;
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;
    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;
    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;
    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;
    return this;
  },
  decompose: function () {
    var vector = new Vector3();
    var matrix = new Matrix4();
    return function decompose(position, quaternion, scale) {
      var te = this.elements;
      var sx = vector.set(te[0], te[1], te[2]).length();
      var sy = vector.set(te[4], te[5], te[6]).length();
      var sz = vector.set(te[8], te[9], te[10]).length(); // if determine is negative, we need to invert one scale

      var det = this.determinant();
      if (det < 0) sx = -sx;
      position.x = te[12];
      position.y = te[13];
      position.z = te[14]; // scale the rotation part

      matrix.copy(this);
      var invSX = 1 / sx;
      var invSY = 1 / sy;
      var invSZ = 1 / sz;
      matrix.elements[0] *= invSX;
      matrix.elements[1] *= invSX;
      matrix.elements[2] *= invSX;
      matrix.elements[4] *= invSY;
      matrix.elements[5] *= invSY;
      matrix.elements[6] *= invSY;
      matrix.elements[8] *= invSZ;
      matrix.elements[9] *= invSZ;
      matrix.elements[10] *= invSZ;
      quaternion.setFromRotationMatrix(matrix);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return this;
    };
  }(),
  makePerspective: function makePerspective(left, right, top, bottom, near, far) {
    if (far === undefined) {
      console.warn('THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.');
    }

    var te = this.elements;
    var x = 2 * near / (right - left);
    var y = 2 * near / (top - bottom);
    var a = (right + left) / (right - left);
    var b = (top + bottom) / (top - bottom);
    var c = -(far + near) / (far - near);
    var d = -2 * far * near / (far - near);
    te[0] = x;
    te[4] = 0;
    te[8] = a;
    te[12] = 0;
    te[1] = 0;
    te[5] = y;
    te[9] = b;
    te[13] = 0;
    te[2] = 0;
    te[6] = 0;
    te[10] = c;
    te[14] = d;
    te[3] = 0;
    te[7] = 0;
    te[11] = -1;
    te[15] = 0;
    return this;
  },
  makeOrthographic: function makeOrthographic(left, right, top, bottom, near, far) {
    var te = this.elements;
    var w = 1.0 / (right - left);
    var h = 1.0 / (top - bottom);
    var p = 1.0 / (far - near);
    var x = (right + left) * w;
    var y = (top + bottom) * h;
    var z = (far + near) * p;
    te[0] = 2 * w;
    te[4] = 0;
    te[8] = 0;
    te[12] = -x;
    te[1] = 0;
    te[5] = 2 * h;
    te[9] = 0;
    te[13] = -y;
    te[2] = 0;
    te[6] = 0;
    te[10] = -2 * p;
    te[14] = -z;
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[15] = 1;
    return this;
  },
  equals: function equals(matrix) {
    var te = this.elements;
    var me = matrix.elements;

    for (var i = 0; i < 16; i++) {
      if (te[i] !== me[i]) return false;
    }

    return true;
  },
  fromArray: function fromArray(array, offset) {
    if (offset === undefined) offset = 0;

    for (var i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }

    return this;
  },
  toArray: function toArray(array, offset) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    var te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];
    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];
    return array;
  }
});

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 */

function Quaternion(x, y, z, w) {
  this._x = x || 0;
  this._y = y || 0;
  this._z = z || 0;
  this._w = w !== undefined ? w : 1;
}

Object.assign(Quaternion, {
  slerp: function slerp(qa, qb, qm, t) {
    return qm.copy(qa).slerp(qb, t);
  },
  slerpFlat: function slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
    // fuzz-free, array-based Quaternion SLERP operation
    var x0 = src0[srcOffset0 + 0],
        y0 = src0[srcOffset0 + 1],
        z0 = src0[srcOffset0 + 2],
        w0 = src0[srcOffset0 + 3],
        x1 = src1[srcOffset1 + 0],
        y1 = src1[srcOffset1 + 1],
        z1 = src1[srcOffset1 + 2],
        w1 = src1[srcOffset1 + 3];

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      var s = 1 - t,
          cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
          dir = cos >= 0 ? 1 : -1,
          sqrSin = 1 - cos * cos; // Skip the Slerp for tiny steps to avoid numeric problems:

      if (sqrSin > Number.EPSILON) {
        var sin = Math.sqrt(sqrSin),
            len = Math.atan2(sin, cos * dir);
        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;
      }

      var tDir = t * dir;
      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir; // Normalize in case we just did a lerp:

      if (s === 1 - t) {
        var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;
      }
    }

    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }
});
Object.defineProperties(Quaternion.prototype, {
  x: {
    get: function get() {
      return this._x;
    },
    set: function set(value) {
      this._x = value;
      this.onChangeCallback();
    }
  },
  y: {
    get: function get() {
      return this._y;
    },
    set: function set(value) {
      this._y = value;
      this.onChangeCallback();
    }
  },
  z: {
    get: function get() {
      return this._z;
    },
    set: function set(value) {
      this._z = value;
      this.onChangeCallback();
    }
  },
  w: {
    get: function get() {
      return this._w;
    },
    set: function set(value) {
      this._w = value;
      this.onChangeCallback();
    }
  }
});
Object.assign(Quaternion.prototype, {
  isQuaternion: true,
  set: function set(x, y, z, w) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onChangeCallback();
    return this;
  },
  clone: function clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  },
  copy: function copy(quaternion) {
    this._x = quaternion.x;
    this._y = quaternion.y;
    this._z = quaternion.z;
    this._w = quaternion.w;
    this.onChangeCallback();
    return this;
  },
  setFromEuler: function setFromEuler(euler, update) {
    if (!(euler && euler.isEuler)) {
      throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
    }

    var x = euler._x,
        y = euler._y,
        z = euler._z,
        order = euler.order; // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    var cos = Math.cos;
    var sin = Math.sin;
    var c1 = cos(x / 2);
    var c2 = cos(y / 2);
    var c3 = cos(z / 2);
    var s1 = sin(x / 2);
    var s2 = sin(y / 2);
    var s3 = sin(z / 2);

    if (order === 'XYZ') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'YXZ') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === 'ZXY') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'ZYX') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === 'YZX') {
      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === 'XZY') {
      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;
    }

    if (update !== false) this.onChangeCallback();
    return this;
  },
  setFromAxisAngle: function setFromAxisAngle(axis, angle) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
    // assumes axis is normalized
    var halfAngle = angle / 2,
        s = Math.sin(halfAngle);
    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos(halfAngle);
    this.onChangeCallback();
    return this;
  },
  setFromRotationMatrix: function setFromRotationMatrix(m) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    var te = m.elements,
        m11 = te[0],
        m12 = te[4],
        m13 = te[8],
        m21 = te[1],
        m22 = te[5],
        m23 = te[9],
        m31 = te[2],
        m32 = te[6],
        m33 = te[10],
        trace = m11 + m22 + m33,
        s;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);
      this._w = 0.25 / s;
      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      this._w = (m32 - m23) / s;
      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      this._w = (m13 - m31) / s;
      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      this._w = (m21 - m12) / s;
      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
    }

    this.onChangeCallback();
    return this;
  },
  setFromUnitVectors: function () {
    // assumes direction vectors vFrom and vTo are normalized
    var v1 = new Vector3();
    var r;
    var EPS = 0.000001;
    return function setFromUnitVectors(vFrom, vTo) {
      if (v1 === undefined) v1 = new Vector3();
      r = vFrom.dot(vTo) + 1;

      if (r < EPS) {
        r = 0;

        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          v1.set(-vFrom.y, vFrom.x, 0);
        } else {
          v1.set(0, -vFrom.z, vFrom.y);
        }
      } else {
        v1.crossVectors(vFrom, vTo);
      }

      this._x = v1.x;
      this._y = v1.y;
      this._z = v1.z;
      this._w = r;
      return this.normalize();
    };
  }(),
  angleTo: function angleTo(q) {
    return 2 * Math.acos(Math.abs(_Math.clamp(this.dot(q), -1, 1)));
  },
  rotateTowards: function rotateTowards(q, step) {
    var angle = this.angleTo(q);
    if (angle === 0) return this;
    var t = Math.min(1, step / angle);
    this.slerp(q, t);
    return this;
  },
  inverse: function inverse() {
    // quaternion is assumed to have unit length
    return this.conjugate();
  },
  conjugate: function conjugate() {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;
    this.onChangeCallback();
    return this;
  },
  dot: function dot(v) {
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
  },
  lengthSq: function lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  },
  length: function length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  },
  normalize: function normalize() {
    var l = this.length();

    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;
      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }

    this.onChangeCallback();
    return this;
  },
  multiply: function multiply(q, p) {
    if (p !== undefined) {
      console.warn('THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
      return this.multiplyQuaternions(q, p);
    }

    return this.multiplyQuaternions(this, q);
  },
  premultiply: function premultiply(q) {
    return this.multiplyQuaternions(q, this);
  },
  multiplyQuaternions: function multiplyQuaternions(a, b) {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
    var qax = a._x,
        qay = a._y,
        qaz = a._z,
        qaw = a._w;
    var qbx = b._x,
        qby = b._y,
        qbz = b._z,
        qbw = b._w;
    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    this.onChangeCallback();
    return this;
  },
  slerp: function slerp(qb, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    var x = this._x,
        y = this._y,
        z = this._z,
        w = this._w; // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

    if (cosHalfTheta < 0) {
      this._w = -qb._w;
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }

    if (cosHalfTheta >= 1.0) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;
      return this;
    }

    var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      var s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;
      return this.normalize();
    }

    var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
        ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    this._w = w * ratioA + this._w * ratioB;
    this._x = x * ratioA + this._x * ratioB;
    this._y = y * ratioA + this._y * ratioB;
    this._z = z * ratioA + this._z * ratioB;
    this.onChangeCallback();
    return this;
  },
  equals: function equals(quaternion) {
    return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
  },
  fromArray: function fromArray(array, offset) {
    if (offset === undefined) offset = 0;
    this._x = array[offset];
    this._y = array[offset + 1];
    this._z = array[offset + 2];
    this._w = array[offset + 3];
    this.onChangeCallback();
    return this;
  },
  toArray: function toArray(array, offset) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._w;
    return array;
  },
  onChange: function onChange(callback) {
    this.onChangeCallback = callback;
    return this;
  },
  onChangeCallback: function onChangeCallback() {}
});

/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Object.assign(Vector3.prototype, {
  isVector3: true,
  set: function set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  setScalar: function setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  },
  setX: function setX(x) {
    this.x = x;
    return this;
  },
  setY: function setY(y) {
    this.y = y;
    return this;
  },
  setZ: function setZ(z) {
    this.z = z;
    return this;
  },
  setComponent: function setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;

      case 1:
        this.y = value;
        break;

      case 2:
        this.z = value;
        break;

      default:
        throw new Error('index is out of range: ' + index);
    }

    return this;
  },
  getComponent: function getComponent(index) {
    switch (index) {
      case 0:
        return this.x;

      case 1:
        return this.y;

      case 2:
        return this.z;

      default:
        throw new Error('index is out of range: ' + index);
    }
  },
  clone: function clone() {
    return new this.constructor(this.x, this.y, this.z);
  },
  copy: function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  },
  add: function add(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
      return this.addVectors(v, w);
    }

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  },
  addScalar: function addScalar(s) {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  },
  addVectors: function addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  },
  addScaledVector: function addScaledVector(v, s) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    return this;
  },
  sub: function sub(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
      return this.subVectors(v, w);
    }

    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  },
  subScalar: function subScalar(s) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  },
  subVectors: function subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  },
  multiply: function multiply(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.');
      return this.multiplyVectors(v, w);
    }

    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  },
  multiplyScalar: function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  },
  multiplyVectors: function multiplyVectors(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  },
  applyEuler: function () {
    var quaternion = new Quaternion();
    return function applyEuler(euler) {
      if (!(euler && euler.isEuler)) {
        console.error('THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.');
      }

      return this.applyQuaternion(quaternion.setFromEuler(euler));
    };
  }(),
  applyAxisAngle: function () {
    var quaternion = new Quaternion();
    return function applyAxisAngle(axis, angle) {
      return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
    };
  }(),
  applyMatrix3: function applyMatrix3(m) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;
    return this;
  },
  applyMatrix4: function applyMatrix4(m) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var e = m.elements;
    var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
    return this;
  },
  applyQuaternion: function applyQuaternion(q) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var qx = q.x,
        qy = q.y,
        qz = q.z,
        qw = q.w; // calculate quat * vector

    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  },
  project: function project(camera) {
    return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  },
  unproject: function () {
    var matrix = new Matrix4();
    return function unproject(camera) {
      return this.applyMatrix4(matrix.getInverse(camera.projectionMatrix)).applyMatrix4(camera.matrixWorld);
    };
  }(),
  transformDirection: function transformDirection(m) {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction
    var x = this.x,
        y = this.y,
        z = this.z;
    var e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  },
  divide: function divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  },
  divideScalar: function divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  },
  min: function min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  },
  max: function max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  },
  clamp: function clamp(min, max) {
    // assumes min < max, componentwise
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  },
  clampScalar: function () {
    var min = new Vector3();
    var max = new Vector3();
    return function clampScalar(minVal, maxVal) {
      min.set(minVal, minVal, minVal);
      max.set(maxVal, maxVal, maxVal);
      return this.clamp(min, max);
    };
  }(),
  clampLength: function clampLength(min, max) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  },
  floor: function floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  },
  ceil: function ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  },
  round: function round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  },
  roundToZero: function roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  },
  negate: function negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  },
  dot: function dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  // TODO lengthSquared?
  lengthSq: function lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },
  length: function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  manhattanLength: function manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  },
  normalize: function normalize() {
    return this.divideScalar(this.length() || 1);
  },
  setLength: function setLength(length) {
    return this.normalize().multiplyScalar(length);
  },
  lerp: function lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  },
  lerpVectors: function lerpVectors(v1, v2, alpha) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },
  cross: function cross(v, w) {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
      return this.crossVectors(v, w);
    }

    return this.crossVectors(this, v);
  },
  crossVectors: function crossVectors(a, b) {
    var ax = a.x,
        ay = a.y,
        az = a.z;
    var bx = b.x,
        by = b.y,
        bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  },
  projectOnVector: function projectOnVector(vector) {
    var scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  },
  projectOnPlane: function () {
    var v1 = new Vector3();
    return function projectOnPlane(planeNormal) {
      v1.copy(this).projectOnVector(planeNormal);
      return this.sub(v1);
    };
  }(),
  reflect: function () {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length
    var v1 = new Vector3();
    return function reflect(normal) {
      return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
    };
  }(),
  angleTo: function angleTo(v) {
    var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq()); // clamp, to handle numerical problems

    return Math.acos(_Math.clamp(theta, -1, 1));
  },
  distanceTo: function distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  },
  distanceToSquared: function distanceToSquared(v) {
    var dx = this.x - v.x,
        dy = this.y - v.y,
        dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  },
  manhattanDistanceTo: function manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  },
  setFromSpherical: function setFromSpherical(s) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  },
  setFromSphericalCoords: function setFromSphericalCoords(radius, phi, theta) {
    var sinPhiRadius = Math.sin(phi) * radius;
    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);
    return this;
  },
  setFromCylindrical: function setFromCylindrical(c) {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
  },
  setFromCylindricalCoords: function setFromCylindricalCoords(radius, theta, y) {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);
    return this;
  },
  setFromMatrixPosition: function setFromMatrixPosition(m) {
    var e = m.elements;
    this.x = e[12];
    this.y = e[13];
    this.z = e[14];
    return this;
  },
  setFromMatrixScale: function setFromMatrixScale(m) {
    var sx = this.setFromMatrixColumn(m, 0).length();
    var sy = this.setFromMatrixColumn(m, 1).length();
    var sz = this.setFromMatrixColumn(m, 2).length();
    this.x = sx;
    this.y = sy;
    this.z = sz;
    return this;
  },
  setFromMatrixColumn: function setFromMatrixColumn(m, index) {
    return this.fromArray(m.elements, index * 4);
  },
  equals: function equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  },
  fromArray: function fromArray(array, offset) {
    if (offset === undefined) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  },
  toArray: function toArray(array, offset) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  },
  fromBufferAttribute: function fromBufferAttribute(attribute, index, offset) {
    if (offset !== undefined) {
      console.warn('THREE.Vector3: offset has been removed from .fromBufferAttribute().');
    }

    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    return this;
  }
});

/**
 * Checks if two objects (IAGObject) are currently colliding. AABBxAABB testing
 * @param obj1 The first object (IAGObject).
 * @param obj2 The second object (IAGObject).
 * @returns {boolean} Returns true if the two objects are colliding, otherwise false.
 */

function colliding(obj1, obj2) {
  /*console.log((obj1.position.x-obj1.size.x/2 <= obj2.position.x+obj2.size.x/2 &&
      obj1.position.x+obj1.size.x/2 >= obj2.position.x-obj2.size.x/2) + " // " + (obj1.position.y-obj1.size.y/2 <= obj2.position.y+obj2.size.y/2 &&
      obj1.position.y+obj1.size.y/2 >= obj2.position.y-obj2.size.y/2) + " // " + (obj1.position.z-obj1.size.z/2 <= obj2.position.z+obj2.size.z/2 &&
      obj1.position.z+obj1.size.z/2 >= obj2.position.z-obj2.size.z/2));*/
  return obj1.position.x - obj1.size.x / 2 <= obj2.position.x + obj2.size.x / 2 && obj1.position.x + obj1.size.x / 2 >= obj2.position.x - obj2.size.x / 2 && obj1.position.y - obj1.size.y / 2 <= obj2.position.y + obj2.size.y / 2 && obj1.position.y + obj1.size.y / 2 >= obj2.position.y - obj2.size.y / 2 && obj1.position.z - obj1.size.z / 2 <= obj2.position.z + obj2.size.z / 2 && obj1.position.z + obj1.size.z / 2 >= obj2.position.z - obj2.size.z / 2;
}
/**
 * Checks if a point (without size!) is inside an object.
 * @param point The point (Vector3) to be checked.
 * @param obj The object (IAGObject) in which the point is to be suspected.
 * @returns {boolean} Returns true, if the point is inside the object. Otherwise false.
 */

function isPointInsideAABB(point, obj) {
  return point.x >= obj.position.x - obj.size.x / 2 && point.x <= obj.position.x + obj.size.x / 2 && point.y >= obj.position.y - obj.size.y / 2 && point.y <= obj.position.y + obj.size.y / 2 && point.z >= obj.position.z - obj.size.z / 2 && point.z <= obj.position.z + obj.size.z / 2;
}
/**
 * Checks if a point with a size is inside a given object.
 * @param point The point (Vector3) to be checked.
 * @param size The size(Vector3) of the point.
 * @param obj The object (IAGObject) in which the point with size is to be suspected.
 * @returns {boolean} Returns true, if the point with size is inside the object. Otherwise false.
 */

function isAABBInsideAABB(point, size, obj) {
  return point.x - size.x / 2 <= obj.position.x + obj.size.x / 2 && point.x + size.x / 2 >= obj.position.x - obj.size.x / 2 && point.y - size.y / 2 <= obj.position.y + obj.size.y / 2 && point.y + size.y / 2 >= obj.position.y - obj.size.y / 2 && point.z - size.z / 2 <= obj.position.z + obj.size.z / 2 && point.z + size.z / 2 >= obj.position.z - obj.size.z / 2;
}
/**
 * Checks if a point with a size is inside a given room.
 * @param point The point (Vector3) to be checked.
 * @param size The size(Vector3) of the point.
 * @param obj The room (AGRoom) in which the point with size is to be suspected.
 * @returns {boolean} Returns true, if the point with size is inside the room. Otherwise false.
 */

function isAABBInsideRoom(point, size, room) {
  return point.x - size.x / 2 >= 0.0 && point.x + size.x / 2 <= room.size.x && point.y - size.y / 2 >= 0.0 && point.y + size.y / 2 <= room.size.y && point.z - size.z / 2 >= 0.0 && point.z + size.z / 2 <= room.size.z;
}
function frbIntersectionPoint(target, source, direction) {
  var v_minB = new Vector3(target.position.x - target.size.x / 2, target.position.y - target.size.y / 2, target.position.z - target.size.z / 2);
  var v_maxB = new Vector3(target.position.x + target.size.x / 2, target.position.y + target.size.y / 2, target.position.z + target.size.z / 2);
  var v_origin = source;
  var v_direction = direction;
  var NUMDIM = 3,
      RIGHT = 0,
      LEFT = 1,
      MIDDLE = 2;
  var minB = [0, 0, 0],
      maxB = [0, 0, 0];
  /*box*/

  var origin = [0, 0, 0],
      dir = [0, 0, 0];
  /*ray*/

  var coord = [0, 0, 0];
  /* hit point */

  var inside = true;
  var quadrant = [0, 0, 0];
  var i;
  var whichPlane;
  var maxT = [0, 0, 0];
  var candidatePlane = [0, 0, 0];
  minB[0] = v_minB.x;
  minB[1] = v_minB.y;
  minB[2] = v_minB.z;
  maxB[0] = v_maxB.x;
  maxB[1] = v_maxB.y;
  maxB[2] = v_maxB.z;
  origin[0] = v_origin.x;
  origin[1] = v_origin.y;
  origin[2] = v_origin.z;
  dir[0] = v_direction.x;
  dir[1] = v_direction.y;
  dir[2] = v_direction.z;
  /* Find candidate planes; this loop can be avoided if
     rays cast all from the eye(assume perpsective view) */

  for (i = 0; i < NUMDIM; i++) {
    if (origin[i] < minB[i]) {
      quadrant[i] = LEFT;
      candidatePlane[i] = minB[i];
      inside = false;
    } else if (origin[i] > maxB[i]) {
      quadrant[i] = RIGHT;
      candidatePlane[i] = maxB[i];
      inside = false;
    } else {
      quadrant[i] = MIDDLE;
    }
  }
  /* Ray origin inside bounding box */


  if (inside) {
    coord = origin;
    return new Vector3(coord[0], coord[1], coord[2]);
  }
  /* Calculate T distances to candidate planes */


  for (i = 0; i < NUMDIM; i++) {
    if (quadrant[i] != MIDDLE && dir[i] != 0.) maxT[i] = (candidatePlane[i] - origin[i]) / dir[i];else maxT[i] = -1.;
  }
  /* Get largest of the maxT's for final choice of intersection */


  whichPlane = 0;

  for (i = 1; i < NUMDIM; i++) {
    if (maxT[whichPlane] < maxT[i]) whichPlane = i;
  }
  /* Check final candidate actually inside box */


  if (maxT[whichPlane] < 0.) return null;

  for (i = 0; i < NUMDIM; i++) {
    if (whichPlane != i) {
      coord[i] = origin[i] + maxT[whichPlane] * dir[i];
      if (coord[i] < minB[i] || coord[i] > maxB[i]) return null;
    } else {
      coord[i] = candidatePlane[i];
    }
  }

  return new Vector3(coord[0], coord[1], coord[2]);
}
/*
Fast Ray-Box Intersection
by Andrew Woo
from "Graphics Gems", Academic Press, 1990
*/

function hitBoundingBox(target, source, direction) {
  var v_minB = new Vector3(target.position.x - target.size.x / 2, target.position.y - target.size.y / 2, target.position.z - target.size.z / 2);
  var v_maxB = new Vector3(target.position.x + target.size.x / 2, target.position.y + target.size.y / 2, target.position.z + target.size.z / 2);
  var v_origin = source.position;
  var v_direction = direction === undefined ? source.direction : direction;
  var NUMDIM = 3,
      RIGHT = 0,
      LEFT = 1,
      MIDDLE = 2;
  var minB = [0, 0, 0],
      maxB = [0, 0, 0];
  /*box*/

  var origin = [0, 0, 0],
      dir = [0, 0, 0];
  /*ray*/

  var coord = [0, 0, 0];
  /* hit point */

  var inside = true;
  var quadrant = [0, 0, 0];
  var i;
  var whichPlane;
  var maxT = [0, 0, 0];
  var candidatePlane = [0, 0, 0];
  minB[0] = v_minB.x;
  minB[1] = v_minB.y;
  minB[2] = v_minB.z;
  maxB[0] = v_maxB.x;
  maxB[1] = v_maxB.y;
  maxB[2] = v_maxB.z;
  origin[0] = v_origin.x;
  origin[1] = v_origin.y;
  origin[2] = v_origin.z;
  dir[0] = v_direction.x;
  dir[1] = v_direction.y;
  dir[2] = v_direction.z;
  /* Find candidate planes; this loop can be avoided if
     rays cast all from the eye(assume perpsective view) */

  for (i = 0; i < NUMDIM; i++) {
    if (origin[i] < minB[i]) {
      quadrant[i] = LEFT;
      candidatePlane[i] = minB[i];
      inside = false;
    } else if (origin[i] > maxB[i]) {
      quadrant[i] = RIGHT;
      candidatePlane[i] = maxB[i];
      inside = false;
    } else {
      quadrant[i] = MIDDLE;
    }
  }
  /* Ray origin inside bounding box */


  if (inside) {
    coord = origin;
    return true;
  }
  /* Calculate T distances to candidate planes */


  for (i = 0; i < NUMDIM; i++) {
    if (quadrant[i] != MIDDLE && dir[i] != 0.) maxT[i] = (candidatePlane[i] - origin[i]) / dir[i];else maxT[i] = -1.;
  }
  /* Get largest of the maxT's for final choice of intersection */


  whichPlane = 0;

  for (i = 1; i < NUMDIM; i++) {
    if (maxT[whichPlane] < maxT[i]) whichPlane = i;
  }
  /* Check final candidate actually inside box */


  if (maxT[whichPlane] < 0.) return false;

  for (i = 0; i < NUMDIM; i++) {
    if (whichPlane != i) {
      coord[i] = origin[i] + maxT[whichPlane] * dir[i];
      if (coord[i] < minB[i] || coord[i] > maxB[i]) return false;
    } else {
      coord[i] = candidatePlane[i];
    }
  }

  return true;
}
/*export function getMinMaxB(obj:IAGObject):Array<number>{
    let minV3:Vector3 = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    let maxV3:Vector3 = new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

    let coords:Array<Vector3>;

    coords.push(new Vector3(obj.position.x-obj.size.x/2, obj.position.y-obj.size.y/2, obj.position.z-obj.size.z/2));
    coords.push(new Vector3(obj.position.x+obj.size.x/2, obj.position.y+obj.size.y/2, obj.position.z+obj.size.z/2));



    for(let i = 0; i <)
}*/

/**
 * Checks if a specific Collision is inside arr-Array. Checks for order too!
 * @param arr Array of Collisions, that holds the existing collisions in the game.
 * @param col A specific Collision, to be searched in arr.
 * @returns {number} Returns the index of the Collision in arr if found, otherwise -1.
 */
function collisionIsInArray(arr, col) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].obj1 === col.obj1 && arr[i].obj2 === col.obj2)
      /*|| (arr[i].obj2 === col.obj1 && arr[i].obj1 === col.obj2)*/
      {
        return i;
      }
  }

  return -1;
} //Is the object asked for currently part of a collision (return object) or not (return null)

/**
 * Checks if a specific object is involved in a Collision happening in the scene.
 * @param arr Array of Collisions, that holds the existing collisions in the game.
 * @param obj A specific IAGObject that is going to be looked up.
 * @returns {IAGObject|null} Returns the IAGObject, that obj is colliding with.
 */

function objectPartOfCollisions(arr, obj) {
  var returnarr = [];

  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].obj1 === obj) returnarr.push(arr[i].obj2);else if (arr[i].obj2 === obj) returnarr.push(arr[i].obj1);
  }

  return returnarr;
}
/**
 * Class that holds two IAGObjects that are involved in a collision.
 */

var Collision =
/*#__PURE__*/
function () {
  _createClass(Collision, [{
    key: "obj1",
    get: function get() {
      return this._obj1;
    },
    set: function set(value) {
      this._obj1 = value;
    }
  }, {
    key: "obj2",
    get: function get() {
      return this._obj2;
    },
    set: function set(value) {
      this._obj2 = value;
    }
  }]);

  function Collision(obj1, obj2) {
    _classCallCheck(this, Collision);

    this._obj1 = obj1;
    this._obj2 = obj2;
  }

  return Collision;
}();

function new_counter() {
  var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return {
    next: function next() {
      return ++init;
    },
    reset: function reset() {
      return init = 0;
    }
  };
}
var IncrementOneCounter = new_counter(0);

/**
 * AGRoom is a physically separated room of a game scene (e.g., level or floor). It follows resonance audio's room idea.
 */

var AGRoom =
/*#__PURE__*/
function () {
  _createClass(AGRoom, [{
    key: "collisions",
    get: function get() {
      return this._collisions;
    },
    set: function set(value) {
      this._collisions = value;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "live",
    get: function get() {
      return this._live;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGRoom.prototype, 'live').set.name, this.constructor.name, arguments);
      this._live = value;
    }
  }, {
    key: "positionOnGameArea",
    get: function get() {
      return this._positionOnGameArea;
    },
    set: function set(value) {
      this._positionOnGameArea = value;
    }
  }, {
    key: "gameArea",
    get: function get() {
      return this._gameArea;
    },
    set: function set(value) {
      this._gameArea = value;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      this._size = value;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      this._type = value;
    }
  }, {
    key: "listener",
    get: function get() {
      return this._listener;
    },
    set: function set(valueID) {
      this._listener = getReferenceById(valueID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGRoom.prototype, 'listener').set.name, this.constructor.name, arguments);
    }
  }, {
    key: "solved",
    get: function get() {
      return this._solved;
    },
    set: function set(value) {
      console.log("[AGRoom] Room " + this._name + (value ? " solved." : " unsolved."));
      this._solved = value;
    }
  }, {
    key: "resonanceAudioScene",
    get: function get() {
      return this._resonanceAudioScene;
    } // $FlowFixMe
    ,
    set: function set(value) {
      this._resonanceAudioScene = value;
    } // $FlowFixMe

  }, {
    key: "AGobjects",
    get: function get() {
      return this._AGobjects;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      this._name = value;
    }
  }]);

  /**
   *
   * @param name The name of the room.
   * @param size The size of the room as Vector3.
   * @param positionOnGrid The position of the room in the overall grid (the game 'map').
   * @param gameArea The AGGameArea this room is part of.
   */
  function AGRoom(name, size, positionOnGrid) {
    _classCallCheck(this, AGRoom);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGRoom] Creating AGRoom object [ID: " + this._ID + "]: " + name + ".");
    this._positionOnGameArea = positionOnGrid;
    this._live = false; // Create a (first-order Ambisonic) Resonance Audio scene and pass it
    // the AudioContext.
    // $FlowFixMe

    this._resonanceAudioScene = g_gamearea.resonanceAudioScene;
    this.size = size;
    this.roomDimensions = {
      width: this.size.x,
      height: this.size.y,
      depth: this.size.z
    };
    this.roomMaterials = {
      // Room wall materials
      left: 'brick-bare',
      right: 'curtain-heavy',
      front: 'marble',
      back: 'glass-thin',
      // Room floor
      down: 'grass',
      // Room ceiling
      up: 'transparent'
    };

    this._resonanceAudioScene.setRoomProperties(this.roomDimensions, this.roomMaterials);

    this._name = name;
    this._type = "GAMEAREA";

    if (!this._collisions) {
      this._collisions = [];
    }

    this._size = size;
    this._lastTime = new Date(0);
    this._AGobjects = [];
    this._solved = false;
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
  }

  _createClass(AGRoom, [{
    key: "add",

    /**
     * Adds a IAGObject to the room (and will therefore be considered with every draw loop)
     * @param gameObject The IAGObject to add.
     */
    value: function add(gameObjectID) {
      if (!this._AGobjects) {
        this._AGobjects = [];
      }

      var gameObject = getReferenceById(gameObjectID);

      this._AGobjects.push(gameObject);

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.add.name, this.constructor.name, arguments);
      gameObject.room = this;
    }
    /**
     * Add a collision to the room Collision array.
     * @param obj1 The first object that is involved in a collision.
     * @param obj2 The second object that is involved in a collision.
     */

  }, {
    key: "addCollision",
    value: function addCollision(obj1, obj2) {
      this._collisions.push(new Collision(obj1, obj2));
    }
  }, {
    key: "objectsRayIntersect",
    value: function objectsRayIntersect(obj) {
      var returnArr = [];

      for (var i = 0; i < this._AGobjects.length; i++) {
        if (hitBoundingBox(this._AGobjects[i], obj) && this._AGobjects[i] !== obj) returnArr.push(this._AGobjects[i]);
      }

      return returnArr;
    }
  }, {
    key: "betweenPlayerObjectRayIntersect",
    value: function betweenPlayerObjectRayIntersect(obj) {
      var returnArr = [];

      for (var i = 0; i < this._AGobjects.length; i++) {
        //console.log(obj);
        //console.log(hitBoundingBox(this._AGobjects[i], obj, (g_gamearea.listener.position.clone().sub(obj.position.clone())).normalize()));
        //console.log(this._AGobjects[i] !== obj);
        //console.log(this._AGobjects[i] !== g_gamearea.listener);
        //console.log((g_gamearea.listener.position.distanceTo(obj.position) < obj.position.distanceTo(this._AGobjects[i])));
        if (obj && hitBoundingBox(this._AGobjects[i], obj, g_gamearea.listener.position.clone().sub(obj.position.clone()).normalize()) && this._AGobjects[i] !== obj && this._AGobjects[i] !== g_gamearea.listener && g_gamearea.listener.position.distanceTo(obj.position) < obj.position.distanceTo(this._AGobjects[i])) returnArr.push(this._AGobjects[i]);
      }

      return returnArr;
    }
    /*objectPartOfCollision(obj:IAGObject):?IAGObject {
        return objectPartOfCollision(this._collisions, obj);
    }*/

    /**
     * Checks if a collision is happening in the respective room. If yes, it will be added to the local room collision array.
     */

  }, {
    key: "checkForCollision",
    value: function checkForCollision() {
      //Collision?
      for (var i = 0, len = this._AGobjects.length; i < len; i++) {
        for (var j = 0; j < len; j++) {
          if (i === j) continue;else {
            if (this._AGobjects[i].collidable && this._AGobjects[j].collidable) {
              if (colliding(this._AGobjects[i], this._AGobjects[j])) {
                if (collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j])) === -1) {
                  //console.log("[AGRoom] " + this.name + ": Collision between " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                  this._AGobjects[i].onCollisionEnter(this._AGobjects[j]);

                  this.addCollision(this._AGobjects[i], this._AGobjects[j]);
                }
              } else {
                var index = collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]));

                if (index > -1) {
                  //console.log("[AGRoom] " + this.name + ": Collision exit on " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                  this._AGobjects[i].onCollisionExit(this._AGobjects[j]);

                  this._collisions.splice(index, 1);
                }
              }
            }
          }
        }
      }
    }
  }, {
    key: "predictCollisionByPoint",
    value: function predictCollisionByPoint(position) {
      var collisionArray = [];

      for (var i = 0, len = this._AGobjects.length; i < len; i++) {
        if (isPointInsideAABB(position, this._AGobjects[i])) collisionArray.push(this._AGobjects[i]);
      }

      return collisionArray;
    }
    /**
     * Removes the IAGObject from the room.
     * @param obj The IAGObject to be removed.
     */

  }, {
    key: "removeIAGObject",
    value: function removeIAGObject(obj) {
      var index = -1;

      for (var i = 0; i < this._AGobjects.length; i++) {
        if (obj === this._AGobjects[i]) index = i;
      }

      if (index === -1) return;

      this._AGobjects.splice(index, 1);

      this.removeCollisionWithObject(obj);
      console.log("[AGRoom] Removed object " + obj.name + " from room " + this.name + ".");
    }
  }, {
    key: "removeCollisionWithObject",
    value: function removeCollisionWithObject(obj) {
      for (var i = this._collisions.length - 1; i >= 0; i--) {
        if (this._collisions[i].obj1 === obj || this._collisions[i].obj2 === obj) this._collisions.splice(i, 1);
      }
    }
    /**
     * Cross AABB check if two objects intersect. Returns an array of collisions.
     * @param position Position (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     * @returns {Array<IAGObject>} An Array of IAGObjects that intersect with the position and size of the object given.
     */

  }, {
    key: "predictCollisionByPointAndSize",
    value: function predictCollisionByPointAndSize(position, size) {
      var collisionArray = [];

      for (var i = 0, len = this._AGobjects.length; i < len; i++) {
        if (isAABBInsideAABB(position, size, this._AGobjects[i])) collisionArray.push(this._AGobjects[i]);
      }

      return collisionArray;
    }
    /**
     * Checks if a position is inside a room (true) or not (false)
     * @param position The position (Vector3) to be checked.
     * @param size The size (Vector3) of the surrounding boundary the point.
     * @returns {boolean} True, if point is inside room, otherwise false.
     */

  }, {
    key: "pointInsideRoom",
    value: function pointInsideRoom(position, size) {
      return isAABBInsideRoom(position, size, this);
    }
    /**
     * draw-loop
     */

  }, {
    key: "draw",
    value: function draw() {
      if (this._lastTime.getTime() === new Date(0).getTime()) this._lastTime = new Date(); //console.log(this._lastTime);
      //All objects draw

      for (var i = 0; i < this._AGobjects.length; i++) {
        this._AGobjects[i].draw(this._lastTime);
      }

      this.checkForCollision();
      /*this._resonanceAudioScene.setListenerPosition(this._listener.position.x -  this.size.x/2,
          this._listener.position.y - this.size.y/2,
          this._listener.position.z - this.size.z/2);*/

      this._resonanceAudioScene.setListenerPosition(this._listener.position.x, this._listener.position.y, this._listener.position.z);

      this._resonanceAudioScene.setListenerOrientation(-this._listener.direction.x, 0, this._listener.direction.z, 0, 1, 0);

      this._lastTime = new Date();
    }
    /**
     * Iteratively goes through all objects stored in IAGObjects and calls their respective stop. Clears collision array too.
     */

  }, {
    key: "stop",
    value: function stop() {
      this._collisions = [];

      this._AGobjects.forEach(function (element) {
        element.stop();
      });
    }
  }]);

  return AGRoom;
}();

/**
 * GameArea that holds several AGRooms. It can be considered as the plane on which the game is played.
 */

var AGGameArea =
/*#__PURE__*/
function () {
  _createClass(AGGameArea, [{
    key: "audioContext",
    get: function get() {
      return this._audioContext;
    } // $FlowFixMe
    ,
    set: function set(value) {
      this._audioContext = value;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "resonanceAudioScene",
    get: function get() {
      return this._resonanceAudioScene;
    } // $FlowFixMe
    ,
    set: function set(value) {
      this._resonanceAudioScene = value;
    }
  }, {
    key: "listener",
    get: function get() {
      return this._listener;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGGameArea.prototype, 'listener').set.name, this.constructor.name, arguments);
      this._listener = getReferenceById(value);
    }
  }, {
    key: "AGRooms",
    get: function get() {
      return this._AGRooms;
    },
    set: function set(value) {
      this._AGRooms = value;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      this._name = value;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      this._size = value;
    }
  }]);

  function AGGameArea(name, size) {
    _classCallCheck(this, AGGameArea);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGGameArea] Creating AGGameArea object [ID: " + this._ID + "].");
    this.AGRooms = [];
    this.name = name;
    this.size = size; // Create an AudioContext

    this._audioContext = new AudioContext(); // Create a (first-order Ambisonic) Resonance Audio scene and pass it
    // the AudioContext.
    // $FlowFixMe

    this._resonanceAudioScene = new ResonanceAudio(this._audioContext); // Connect the scene’s binaural output to stereo out.

    this._resonanceAudioScene.output.connect(this._audioContext.destination);

    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
  }

  _createClass(AGGameArea, [{
    key: "addRoom",
    value: function addRoom(room) {
      this.AGRooms.push(getReferenceById(room));
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addRoom.name, this.constructor.name, arguments);
    }
    /**
     * Unsolves all rooms (sets the solved attribute of all rooms to false).
     */

  }, {
    key: "unsolveRooms",
    value: function unsolveRooms() {
      this._AGRooms.forEach(function (element) {
        console.log("[AGGameArea] Unsolving Room [ID: " + element.ID + "].");
        element.solved = false;
      });
    }
  }, {
    key: "clearRooms",
    value: function clearRooms() {
      this._AGRooms = [];
    }
    /*newRoom(name:string, size:Vector3, position:Vector3):AGRoom{
        let agRoom:AGRoom = new AGRoom(name, size, position, this);
        this.addRoom(agRoom);
        return agRoom;
    }*/

  }, {
    key: "draw",
    value: function draw() {
      this._AGRooms.forEach(function (element) {
        if (element.live) {
          element.draw();
        }
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      this._AGRooms.forEach(function (element) {
        element.stop();
      });
    }
  }]);

  return AGGameArea;
}();

/**
 * Class that represents one event, including object, trigger, action, etc.
 */

var Event =
/*#__PURE__*/
function () {
  _createClass(Event, [{
    key: "origin",
    get: function get() {
      return this._origin;
    },
    set: function set(originID) {
      var go = getReferenceById(originID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'origin').set.name, this.constructor.name, arguments);
      this._origin = go;
    }
  }, {
    key: "repeat",
    get: function get() {
      return this._repeat;
    },
    set: function set(value) {
      this._repeat = value;
    }
  }, {
    key: "trigger",
    get: function get() {
      return this._trigger;
    },
    set: function set(value) {
      this._trigger = value;
    }
  }, {
    key: "action",
    get: function get() {
      return this._action;
    },
    set: function set(value) {
      this._action = value;
    }
  }, {
    key: "addObject",
    get: function get() {
      return this._addObject;
    },
    set: function set(addObjectID) {
      var go = getReferenceById(addObjectID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'addObject').set.name, this.constructor.name, arguments);
      this._addObject = go;
    }
  }, {
    key: "object",
    get: function get() {
      return this._object;
    },
    set: function set(objectID) {
      var go = getReferenceById(objectID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(Event.prototype, 'object').set.name, this.constructor.name, arguments);
      this._object = go;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    },
    set: function set(value) {
      this._ID = value;
    }
  }]);

  function Event(originID, trigger, action, objectID, addObjectID, repeat) {
    _classCallCheck(this, Event);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    console.log("[Event] Creating Event [ID: " + this._ID + "] with originID " + originID + " and objectID " + objectID + ".");
    this._origin = getReferenceById(originID);
    this._trigger = trigger;
    this._action = action;
    this._object = getReferenceById(objectID);
    this._addObject = getReferenceById(addObjectID);
    this._repeat = repeat;
  }

  return Event;
}();

/**
 * Similar to Event class but with a focus on Global Events.
 */

var GlobalEvent =
/*#__PURE__*/
function () {
  _createClass(GlobalEvent, [{
    key: "object",
    get: function get() {
      return this._object;
    },
    set: function set(objectID) {
      var go = getReferenceById(objectID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(GlobalEvent.prototype, 'object').set.name, this.constructor.name, arguments);
      this._object = go;
    }
  }, {
    key: "conditionObject",
    get: function get() {
      return this._conditionObject;
    },
    set: function set(value) {
      this._conditionObject = value;
    }
  }, {
    key: "funcOfConditionObject",
    get: function get() {
      return this._funcOfConditionObject;
    },
    set: function set(value) {
      this._funcOfConditionObject = value;
    }
  }, {
    key: "funcArgs",
    get: function get() {
      return this._funcArgs;
    },
    set: function set(value) {
      this._funcArgs = value;
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      this._value = value;
    }
  }, {
    key: "action",
    get: function get() {
      return this._action;
    },
    set: function set(value) {
      this._action = value;
    }
  }, {
    key: "repeat",
    get: function get() {
      return this._repeat;
    },
    set: function set(value) {
      this._repeat = value;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    },
    set: function set(value) {
      this._ID = value;
    }
  }]);

  function GlobalEvent(objectID, conditionObject, funcOfConditionObject, funcArgs, value, action, repeat) {
    _classCallCheck(this, GlobalEvent);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    console.log("[GlobalEvent] Creating Event [ID: " + this._ID + "] with objectID " + objectID + ", conditionObject " + conditionObject + " and Function " + funcOfConditionObject + ".");
    this._object = getReferenceById(objectID);
    this._conditionObject = conditionObject;
    var f;

    switch (conditionObject) {
      case "INVENTORY":
        f = g_history.getFunction("AGInventory", funcOfConditionObject);
        break;
    }

    this._funcOfConditionObject = f;
    this._funcArgs = funcArgs;
    this._value = value;
    this._action = action;
    this._repeat = repeat;
  }

  return GlobalEvent;
}();

/**
 * In-game item class.
 */

var AGItem =
/*#__PURE__*/
function () {
  _createClass(AGItem, [{
    key: "addCharge",
    value: function addCharge() {
      this._charges++;
    }
  }, {
    key: "removeCharge",
    value: function removeCharge() {
      return --this._charges;
    }
  }, {
    key: "name",
    set: function set(value) {
      this._name = value; // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'name').set.name, this.constructor.name, arguments);
    },
    get: function get() {
      return this._name;
    }
  }, {
    key: "description",
    set: function set(value) {
      this._description = value;
    },
    get: function get() {
      return this._description;
    }
  }, {
    key: "charges",
    set: function set(value) {
      this._charges = value; // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'charges').set.name, this.constructor.name, arguments);
    },
    get: function get() {
      return this._charges;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      this._type = value; // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGItem.prototype, 'type').set.name, this.constructor.name, arguments);
    }
  }]);

  function AGItem(name, description, type, charges) {
    _classCallCheck(this, AGItem);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGItem] Creating AGItem object [ID: " + this._ID + "]: " + name + ".");
    this._name = name;
    this._description = description;
    this._charges = charges;
    this._type = type;
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
  }

  _createClass(AGItem, [{
    key: "deleteItemInReferences",
    value: function deleteItemInReferences() {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.deleteItemInReferences.name, this.constructor.name, arguments);
      g_references["delete"](this._ID);
    }
  }]);

  return AGItem;
}();

/**
 * Eventhandler Class
 */

var AGEventHandler =
/*#__PURE__*/
function () {
  _createClass(AGEventHandler, [{
    key: "addEvent",

    /**
     * Adds a new event to the Eventlist.
     * @param eventID The event ID of the event to be added to the Eventlist.
     */
    value: function addEvent(eventID) {
      this._events.push(getReferenceById(eventID));

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addEvent.name, this.constructor.name, arguments);
    }
    /**
     * Removes an Event from the Eventlist by ID.
     * @param eventID The ID of the Event to be removed.
     */

  }, {
    key: "removeEventByID",
    value: function removeEventByID(eventID) {
      this.removeEvent(getReferenceById(eventID));
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.removeEventByID.name, this.constructor.name, arguments);
      g_references["delete"](eventID);
    }
    /**
     * Removes an Event from the Eventlist by Event Object.
     * @param event The Object that should be removed.
     */

  }, {
    key: "removeEvent",
    value: function removeEvent(event) {
      console.log("[AGEventHandler] Removing Event [ID: " + event.ID + "].");

      this._events.splice(this.findEventIndex(event), 1);
    }
    /**
     * Removes a GlobalEvent from the GlobalEventlist by ID.
     * @param eventID The ID of the GlobalEvent to be removed.
     */

  }, {
    key: "removeGlobalEventByID",
    value: function removeGlobalEventByID(eventID) {
      this.removeEvent(getReferenceById(eventID));
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.removeGlobalEventByID.name, this.constructor.name, arguments);
      g_references["delete"](eventID);
    }
    /**
     * Removes a GlobalEvent from the Eventlist by GlobalEvent Object.
     * @param event The Object that should be removed.
     */

  }, {
    key: "removeGlobalEvent",
    value: function removeGlobalEvent(event) {
      console.log("[AGEventHandler] Removing Global Event [ID: " + event.ID + "].");

      this._globalEvents.splice(this.findGlobalEventIndex(event), 1);
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "events",
    get: function get() {
      return this._events;
    },
    set: function set(value) {
      this._events = value;
    }
  }]);

  function AGEventHandler() {
    _classCallCheck(this, AGEventHandler);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    console.log("[AGEventHandler] Creating AGEventHandler object [ID: " + this._ID + "].");
    this._events = [];
    this._globalEvents = [];
  }

  _createClass(AGEventHandler, [{
    key: "evaluateGlobalEvents",
    value: function evaluateGlobalEvents() {
      for (var i = 0; i < this._globalEvents.length; i++) {
        this.evaluateGlobalEvent(this._globalEvents[i]);
      }
    }
  }, {
    key: "addGlobalEvent",
    value: function addGlobalEvent(eventID) {
      this._globalEvents.push(getReferenceById(eventID));

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addGlobalEvent.name, this.constructor.name, arguments);
    }
    /**
     * Evaluates a GlobalEvent if the conditions are met. Returns true, if the conditions are met.
     * @param event The GlobalEvent object to be evaluated.
     * @returns {boolean} Returns true, if the event's conditions are met, otherwise false.
     */

  }, {
    key: "evaluateGlobalEvent",
    value: function evaluateGlobalEvent(event) {
      //console.log(event.funcOfConditionObject.apply(event.object.inventory, event.funcArgs));
      if (event.repeat >= 1 || event.repeat === -1) {
        switch (event.conditionObject) {
          case "INVENTORY":
            if (event.object.inventory) {
              if (event.funcOfConditionObject.apply(event.object.inventory, event.funcArgs) === event.value) {
                console.log("[AGEventHandler] Requirements for Global Event fulfilled. Executing action.");
                console.log(event);
                this.fireAction(event.action);
                if (event.repeat >= 1) event.repeat--;
                return true;
              }
            }

            break;
        }
      }

      return false;
    }
    /**
     * Triggers an action. Currently only WINGAME is available.
     * @param action The Action to be triggered.
     */

  }, {
    key: "fireAction",
    value: function fireAction(action) {
      switch (action) {
        case "WINGAME":
          g_gamearea.listener.room.solved = true;
          break;
      }
    }
    /**
     * Returns the index of the event.
     * @param event Event to be queried.
     * @returns {number} Returns the index of the event.
     */

  }, {
    key: "findEventIndex",
    value: function findEventIndex(event) {
      for (var i = 0; i < this._events.length; i++) {
        if (this._events[i].origin === event.origin && this._events[i].trigger === event.trigger && this._events[i].action === event.action && this._events[i].object === event.object && this._events[i].addObject === event.addObject) return i;
      }

      return -1;
    }
    /**
     * Returns the index of the GlobalEvent object in the global events list. (function deprecated)
     * @param event The GlobalEvent object to be searched for.
     * @returns {number} Returns the ID of the GlobalEvent.
     */

  }, {
    key: "findGlobalEventIndex",
    value: function findGlobalEventIndex(event) {
      for (var i = 0; i < this._globalEvents.length; i++) {
        if (this._globalEvents[i].ID === event.ID) return i;
      }

      return -1;
    }
    /**
     * Deletes all events (also removing from reference table) that contain a specific item (ID).
     * @param itemID The ID of the AGItem.
     */

  }, {
    key: "deleteEventsContainingItemById",
    value: function deleteEventsContainingItemById(itemID) {
      var agitem = getReferenceById(itemID);
      var that = this;

      this._events.forEach(function (item) {
        if (item.addObject === agitem) {
          that.removeEventByID(item.ID);
          console.log("[AGEventHandler] Deleted Event [ID: " + item.ID + "] from References Table.");
        }
      });
    }
    /**
     * Deletes all events (also removing from reference table) that contain a specific object (ID).
     * @param objectID The ID of the AGObject.
     */

  }, {
    key: "deleteEventsContainingObjectById",
    value: function deleteEventsContainingObjectById(objectID) {
      var agobject = getReferenceById(objectID);
      var that = this;

      this._events.forEach(function (item) {
        if (item.addObject === agobject || item.origin === agobject || item.object === agobject) {
          that.removeEventByID(item.ID);
          console.log("[AGEventHandler] Deleted Event [ID: " + item.ID + "] from References Table.");
        }
      });
    }
    /**
     * Deletes all GlobalEvents (also removing from reference table) that contain a specific object (ID).
     * @param objectID The ID of the AGObject.
     */

  }, {
    key: "deleteGlobalEventsContainingObjectById",
    value: function deleteGlobalEventsContainingObjectById(objectID) {
      var agobject = getReferenceById(objectID);
      var that = this;

      this._globalEvents.forEach(function (item) {
        if (item.object === agobject) {
          that.removeGlobalEventByID(item.ID);
          console.log("[AGEventHandler] Deleted Global Event [ID: " + item.ID + "] from References Table.");
        }
      });
    }
    /*
    findEvent(event:Event):?Event {
        for(let i = 0; i < this._events.length; i++){
            if(this._events[i].origin === event.origin &&
                this._events[i].trigger === event.trigger &&
                this._events[i].action === event.action &&
                this._events[i].object === event.object &&
                this._events[i].addObject === event.addObject
            ) return this._events[i];
        }
        return null;
    }
    */

    /**
     * Finds and returns events that are connected to a respective AGObject, triggered by a Trigger.
     * @param object The object the Event is expected to be fired.
     * @param trigger The trigger that fires the event.
     * @returns {Array<Event>} Returns an Array of Events that fits the requested AGObject and Trigger.
     */

  }, {
    key: "findEventsAfterCall",
    value: function findEventsAfterCall(object, trigger) {
      var events = [];

      for (var i = 0; i < this._events.length; i++) {
        if (this._events[i].origin === object && this._events[i].trigger === trigger) {
          events.push(this._events[i]);
        }
      }

      return events;
    }
    /**
     * Function is called if certain events happen (e.g., collision, death) and reacts by triggering the respective function.
     * @param object The IAGObject that called this function.
     * @param trigger The Trigger (e.g., ONCONTACT, ONDEATH)
     */

  }, {
    key: "call",
    value: function call(object, trigger) {
      //console.log("[AGEventHandler] Received Event-Call from " + object.name);
      var events = this.findEventsAfterCall(object, trigger);

      for (var i = 0; i < events.length; i++) {
        if (events[i].repeat >= 1 || events[i].repeat === -1) {
          console.log("[AGEventHandler] Event triggered:");
          console.log(events[i]);

          switch (events[i].trigger) {
            //TRIGGER: ON CONTACT WITH OTHER OBJECT
            case "ONCONTACT":
              switch (events[i].action) {
                // TRIGGER: ONCONTACT, ACTION: ADD TO INVENTORY
                case "ADD":
                  events[i].object.inventory.addItem(events[i].addObject);
                  break;
                // TRIGGER: ONCONTACT, ACTION: REMOVE FROM INVENTORY

                case "REMOVE":
                  events[i].origin.inventory.removeItem(events[i].addObject);
                  break;
                // TRIGGER: ONCONTACT, ACTION: MOVE FROM INVENTORY TO OTHER

                case "MOVE":
                  events[i].origin.inventory.removeItem(events[i].addObject);
                  events[i].object.inventory.addItem(events[i].addObject);
                  break;
              }

              break;

            case "ONDEATH":
              switch (events[i].action) {
                // TRIGGER: ONDEATH, ACTION: ADD TO INVENTORY
                case "ADD":
                  events[i].object.inventory.addItem(events[i].addObject);
                  break;
                // TRIGGER: ONDEATH, ACTION: REMOVE FROM INVENTORY

                case "REMOVE":
                  events[i].origin.inventory.removeItem(events[i].addObject);
                  break;
                // TRIGGER: ONDEATH, ACTION: MOVE FROM INVENTORY TO OTHER

                case "MOVE":
                  events[i].origin.inventory.removeItem(events[i].addObject);
                  events[i].object.inventory.addItem(events[i].addObject);
                  break;
              }

              break;
          }

          events[i].repeat--;
        }
      }
    }
  }]);

  return AGEventHandler;
}();

var gForward, gBackward, gLeft, gRight, gInteract; //let moveTimestamp;

/**
 * Private function: if a collision is allowed (e.g., collision with portal) or not.
 * @param obj The object (IAGObject) to be checked with.
 * @param collArray The array of IAGObjects with the current collisions.
 * @returns {boolean} Returns true if collision is allowed, otherwise false.
 */

function allowedCollision(obj, collArray) {
  for (var i = 0; i < collArray.length; i++) {
    if (obj !== collArray[i] && collArray[i].type !== "PORTAL") {
      //console.log("[AGNavigation] " + obj.name + ": Condition failed at object " + collArray[i].name + ".");
      return false;
    }
  }

  return true;
}
/**
 * Moves the IAGObject into direction, depending on speed. Needs a timeStamp for deltaTime (frame-independent movement)
 * @param object The IAGObject that should be move.
 * @param direction The direction as Vector3 the object should be moved to.
 * @param timeStamp A current frame-timestamp.
 */


function move(object, direction, timeStamp) {
  var timeDiff;

  if (timeStamp !== undefined) {
    timeDiff = new Date() - timeStamp;
    timeDiff /= 1000;
  } else {
    timeDiff = 1;
  }

  object.position.add(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
  object.room.checkForCollision();
  var PoC = objectPartOfCollisions(object.room.collisions, object);

  if (!allowedCollision(object, PoC)) {
    console.log("[AGNavigation] " + object.name + ": Can't move forward. Colliding with other object."); //Calculate position for collision sound, can be put before or after the sub

    pointOfIntersectionForSound(PoC[0], object);
    object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
  } else if (!object.room.pointInsideRoom(object.position, object.size)) {
    console.log("[AGNavigation] " + object.name + ": Can't move forward. Colliding with room boundaries.");
    object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
  }
}

function pointOfIntersectionForSound(collisionObject, object) {
  var p1, p2, p3, p4; //get the 8 corners of the cube

  var p1TOP = extractPlanePoint(object, -1, +1, -1);
  var p1BOTTOM = extractPlanePoint(object, -1, -1, -1);
  var p2TOP = extractPlanePoint(object, +1, +1, -1);
  var p2BOTTOM = extractPlanePoint(object, +1, -1, -1);
  var p3TOP = extractPlanePoint(object, -1, +1, +1);
  var p3BOTTOM = extractPlanePoint(object, -1, -1, +1);
  var p4TOP = extractPlanePoint(object, +1, +1, +1);
  var p4BOTTOM = extractPlanePoint(object, +1, -1, 1); //middle it to 4

  p1 = p1TOP.clone().sub(p1TOP.clone().sub(p1BOTTOM).clone().multiplyScalar(0.5));
  p2 = p2TOP.clone().sub(p2TOP.clone().sub(p2BOTTOM).clone().multiplyScalar(0.5));
  p3 = p3TOP.clone().sub(p3TOP.clone().sub(p3BOTTOM).clone().multiplyScalar(0.5));
  p4 = p4TOP.clone().sub(p4TOP.clone().sub(p4BOTTOM).clone().multiplyScalar(0.5)); //rotate the corners according to the direction of the object

  p1 = rotateAroundPoint(object.position, p1, getAngle(object.direction));
  p2 = rotateAroundPoint(object.position, p2, getAngle(object.direction));
  p3 = rotateAroundPoint(object.position, p3, getAngle(object.direction));
  p4 = rotateAroundPoint(object.position, p4, getAngle(object.direction)); //array for the 4 points, so it is easier to iterate later on

  var points = [];
  points.push(p2);
  points.push(p3);
  points.push(p4);
  points.push(p1);
  points.push(p4);
  points.push(p3);
  points.push(p2);
  points.push(p1); //build directions between points

  var dirs = [];
  dirs.push(p1.clone().sub(p2).normalize());
  dirs.push(p2.clone().sub(p3).normalize());
  dirs.push(p3.clone().sub(p4).normalize());
  dirs.push(p4.clone().sub(p1).normalize());
  dirs.push(p1.clone().sub(p4).normalize());
  dirs.push(p4.clone().sub(p3).normalize());
  dirs.push(p3.clone().sub(p2).normalize());
  dirs.push(p2.clone().sub(p1).normalize());
  var intersectPoints = []; //closest point after iteration

  var smallest = null;
  var smallestDist = Number.MAX_VALUE; //saves pair of Distance and Vector

  var pairDistancePoint = [];
  if (g_IAudiCom) g_IAudiCom.deleteDots(); //shoot rays from 8 directions, over corners

  for (var i = 0; i < 8; i++) {
    var dist = extractPointToArray(collisionObject, points[i], dirs[i], intersectPoints);

    if (dist !== undefined && dist !== 0) {
      pairDistancePoint.push([dist, intersectPoints[intersectPoints.length - 1]]); //g_IAudiCom.drawDot(pairDistancePoint[pairDistancePoint.length-1][1].x, pairDistancePoint[pairDistancePoint.length-1][1].z);

      if (pairDistancePoint[pairDistancePoint.length - 1][0] < smallestDist) {
        smallestDist = pairDistancePoint[pairDistancePoint.length - 1][0];
        smallest = pairDistancePoint[pairDistancePoint.length - 1][1];
      }
    }
  } //console.log(pairDistancePoint);
  //console.log(extractPointToArray(collisionObject, p2, dirs[0], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p3, dirs[1], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p4, dirs[2], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p1, dirs[3], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p4, dirs[4], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p3, dirs[5], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p2, dirs[6], intersectPoints));
  //console.log(extractPointToArray(collisionObject, p1, dirs[7], intersectPoints));
  //console.log(smallest);
  //console.log(smallestDist);
  //console.log(intersectPoints);
  //for(let i = 0; i < intersectPoints.length; i++){


  if (g_IAudiCom && smallest != null) {
    //console.log(intersectPoints[i].distanceTo(object.position));
    g_IAudiCom.drawDot(smallest.x, smallest.z);
    if (object.type === "PLAYER" && object.hitSound) object.hitSound.playOnceAtPosition(smallest);
  } //}

}

function getAngle(dir) {
  var angle = Math.atan2(dir.x, dir.z);
  var degrees = 180 * angle / Math.PI;
  return (180 + Math.round(degrees)) % 360;
}

function rotateAroundPoint(center, point, angle) {
  var radians = Math.PI / 180 * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (point.x - center.x) + sin * (point.z - center.z) + center.x,
      nz = cos * (point.z - center.z) - sin * (point.x - center.x) + center.z;
  return new Vector3(nx, point.y, nz);
}

function extractPointToArray(collisionObject, point, dir, arrToAdd) {
  var pt = frbIntersectionPoint(collisionObject, point, dir);

  if (pt !== null) {
    arrToAdd.push(pt);
    return point.distanceTo(pt);
  }

  return 0;
}
/*
function pointOfIntersection(PoC_arr:Array<IAGObject>, obj:IAGObject){
    let point:Vector3;
    for(let i = -1; i <= 1; i+=2){
        for(let j = -1; j <= 1; j+=2){
            for(let k = -1; k <= 1; k+=2){
                point = new Vector3(obj.position.x-(obj.size.x/2)*(i), obj.position.y-(obj.size.y/2)*(j), obj.position.z-(obj.size.z/2)*(k));
                if(isPointInsideAABB(point, PoC_arr[0])){
                    console.log("[AGNavigation] " + obj.name + ": Playing sound at position: " + Math.round(point.x) + " " + Math.round(point.y) + " " + Math.round(point.z));
                }
            }
        }
    }
}*/

/*
//https://stackoverflow.com/questions/6408670/line-of-intersection-between-two-planes
function planeIntersectPlane(PoC_arr:Array<IAGObject>, obj:IAGObject){
    let r_points:Array<Vector3> = [], r_normals:Array<Vector3> = [];
    let plane1_arr:Array<Plane> = calculatePlanesCCW(PoC_arr[0]);
    let plane2_arr:Array<Plane> = calculatePlanesCCW(obj);

    if(g_IAudiCom) g_IAudiCom.deleteDots();

    for(let i = 0; i < plane1_arr.length; i++){
        for(let j = 0; j < plane2_arr.length; j++){
            let plane1:Plane = plane1_arr[i];
            let plane2:Plane = plane2_arr[j];

            let p3_normal:Vector3 = new Vector3();
            p3_normal.crossVectors(plane1.normal, plane2.normal);
            const det:number = p3_normal.lengthSq();

            //console.log(p3_normal.clone().cross(plane2.normal).clone().multiplyScalar(plane1.constant).clone().add(plane1.clone().normal.cross(p3_normal).clone().multiplyScalar(plane2.constant)));
            if(det !== 0.0){
                let vToPush:Vector3 = (p3_normal.clone().cross(plane2.normal).clone().multiplyScalar(plane1.constant).add(plane1.clone().normal.cross(p3_normal).clone().multiplyScalar(plane2.constant))).clone().divideScalar(det);
                if(pointInsideSphere(vToPush, obj)){
                    if(g_IAudiCom) {
                        g_IAudiCom.drawDot(vToPush.x, vToPush.z);
                    }
                    r_points.push(vToPush);
                    r_normals.push(p3_normal);
                }
            } else {
                //console.log("nah");
            }

        }
    }

    //console.log(r_points);
    //console.log(r_normals);
}

 */

/*
function pointInsideSphere(point:Vector3, obj:IAGObject):boolean{
    //console.log((point.clone().distanceTo(obj.position.clone())));
    if((point.clone().distanceTo(obj.position.clone())) <= (obj.position.clone().add(obj.size)).clone().distanceTo(obj.position)) return true;
    return false;
}*/

/*
function calculatePlanesCCW(obj:IAGObject):Array<IAGObject> {
    let return_arr:Array<IAGObject> = [];

    let plane_a:Plane = new Plane();
    let plane_b:Plane = new Plane();
    let plane_c:Plane = new Plane();
    let plane_d:Plane = new Plane();
    let plane_e:Plane = new Plane();
    let plane_f:Plane = new Plane();
    let v1:Vector3, v2:Vector3, v3:Vector3;

    v1 = extractPlanePoint(obj, -1,+1,-1);
    v2 = extractPlanePoint(obj, -1, -1, -1);
    v3 = extractPlanePoint(obj, +1, -1, -1);
    plane_a.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    console.log(plane_a);
    return_arr.push(plane_a);

    v1 = extractPlanePoint(obj, +1,+1,-1);
    v2 = extractPlanePoint(obj, +1, -1, -1);
    v3 = extractPlanePoint(obj, +1, -1, +1);
    plane_b.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_b);

    v1 = extractPlanePoint(obj, -1,+1,+1);
    v2 = extractPlanePoint(obj, -1, +1, -1);
    v3 = extractPlanePoint(obj, +1, +1, -1);
    plane_c.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_c);

    v1 = extractPlanePoint(obj, +1,+1,+1);
    v2 = extractPlanePoint(obj, +1, -1, +1);
    v3 = extractPlanePoint(obj, -1, -1, +1);
    plane_d.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_d);

    v1 = extractPlanePoint(obj, -1,+1,+1);
    v2 = extractPlanePoint(obj, -1, -1, +1);
    v3 = extractPlanePoint(obj, -1, -1, -1);
    plane_e.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_e);

    v1 = extractPlanePoint(obj, +1,-1,+1);
    v2 = extractPlanePoint(obj, +1, -1, -1);
    v3 = extractPlanePoint(obj, -1, -1, -1);
    plane_f.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_f);

    return return_arr;
}
 */


function extractPlanePoint(obj, x, y, z) {
  var returnV = new Vector3(obj.position.x + obj.size.x / 2 * x, obj.position.y + obj.size.x / 2 * y, obj.position.z + obj.size.z / 2 * z);
  return returnV;
}
/**
 * Class that is responsible for the movement buttons of the respective object.
 */


var AGNavigation =
/*#__PURE__*/
function () {
  _createClass(AGNavigation, [{
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "forward",
    get: function get() {
      return gForward;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGNavigation.prototype, 'forward').set.name, this.constructor.name, arguments);
      gForward = value;
    }
  }, {
    key: "backward",
    get: function get() {
      return gBackward;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGNavigation.prototype, 'backward').set.name, this.constructor.name, arguments);
      gBackward = value;
    }
  }, {
    key: "left",
    get: function get() {
      return gLeft;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGNavigation.prototype, 'left').set.name, this.constructor.name, arguments);
      gLeft = value;
    }
  }, {
    key: "right",
    get: function get() {
      return gRight;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGNavigation.prototype, 'right').set.name, this.constructor.name, arguments);
      gRight = value;
    }
  }, {
    key: "interact",
    get: function get() {
      return gInteract;
    },
    set: function set(value) {
      gInteract = value;
    }
    /**
     *
     * @param forward Keycode for forward-movement.
     * @param backward Keycode for backward-movement.
     * @param left Keycode for left-turn.
     * @param right Keycode for right-turn.
     */

  }]);

  function AGNavigation(forward, backward, left, right, interact) {
    _classCallCheck(this, AGNavigation);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGNavigation] Creating AGNavigation object [ID: " + this._ID + "].");
    gForward = forward;
    gBackward = backward;
    gLeft = left;
    gRight = right;
    gInteract = interact;
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments); //moveTimestamp = new Date(0);
  }
  /**
   * draw-loop
   * @param player Object (IAGObject) which can be moved by the player.
   */


  _createClass(AGNavigation, [{
    key: "draw",
    value: function draw(player) {
      //if(moveTimestamp.getTime() === new Date(0).getTime()) moveTimestamp = new Date();
      window.onkeydown = function (e) {
        if (e.keyCode === -1) return;

        switch (e.keyCode) {
          case gForward:
            //move(player, true);
            move(player, player.direction);
            break;

          case gBackward:
            //move(player, false);
            move(player, player.direction.clone().multiplyScalar(-1));
            break;

          case gLeft:
            player.direction.applyAxisAngle(new Vector3(0, 1, 0), 8 * (Math.PI / 180));
            break;

          case gRight:
            player.direction.applyAxisAngle(new Vector3(0, 1, 0), -8 * (Math.PI / 180));
            break;

          case gInteract:
            player.interact();
            break;
        } // moveTimestamp = new Date();
        //console.log("Position: " + player.position.x + " " + player.position.y + " " + player.position.z);
        //console.log("Direction: " + player.direction.x + " " + player.direction.y + " " + player.direction.z);

      };
    }
  }]);

  return AGNavigation;
}();

/**
 * Class that is responsible for sound propagation related stuff.
 */

var AGSoundSource =
/*#__PURE__*/
function () {
  _createClass(AGSoundSource, [{
    key: "update",
    get: function get() {
      return this._update;
    },
    set: function set(value) {
      this._update = value;
    }
  }, {
    key: "object",
    get: function get() {
      return this._object;
    },
    set: function set(value) {
      this._object = value;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "room",
    get: function get() {
      return this._room;
    },
    set: function set(value) {
      this._room = value;
    }
  }, {
    key: "looping",
    get: function get() {
      return this._looping;
    },
    set: function set(value) {
      this._looping = value;
    }
  }, {
    key: "playing",
    get: function get() {
      return this._playing;
    },
    set: function set(value) {
      this._playing = value;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      this._type = value;
    }
  }, {
    key: "audioElement",
    get: function get() {
      return this._audioElement;
    },
    set: function set(value) {
      this._audioElement = value;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGSoundSource.prototype, 'tag').set.name, this.constructor.name, arguments);
      this._tag = value;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGSoundSource.prototype, 'name').set.name, this.constructor.name, arguments);
      this._name = value;
    }
  }, {
    key: "maxDistance",
    get: function get() {
      return this._maxDistance;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGSoundSource.prototype, 'maxDistance').set.name, this.constructor.name, arguments);
      this._maxDistance = value;
      if (this.source) this.source.setMaxDistance(this._maxDistance);
    }
  }, {
    key: "volume",
    get: function get() {
      return this._volume;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGSoundSource.prototype, 'volume').set.name, this.constructor.name, arguments);
      console.log("[AGSoundSource] Changing volume of AGSoundSource object [ID: " + this._ID + "] to " + value + ".");
      this._volume = value;
      if (this.source) this._gainNode.gain.value = value;
    }
  }]);

  // $FlowFixMe

  /**
   * Creates a new sound source for the room.
   * @param name Name of the sound source.
   * @param file Filepath to the sound source. Uses HTML5 audio.
   * @param looping If the sound source should be looped.
   * @param interval ?
   * @param room The room this sound source is going to be played.
   */
  function AGSoundSource(name, file, looping, interval, roomID) {
    _classCallCheck(this, AGSoundSource);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGSoundSource] Creating AGSoundSource object [ID: " + this._ID + "]: " + name + ".");
    this.file = file;
    this.interval = interval;
    this._playing = false;
    this._update = true;
    this._room = getReferenceById(roomID);
    this.audioContext = g_gamearea.audioContext;
    this.resonanceAudioScene = this._room.resonanceAudioScene; // Create an AudioElement.

    this._audioElement = document.createElement('audio'); // Load an audio file into the AudioElement.

    this.audioElement.src = this.file;
    this.audioElementSource = this.audioContext.createMediaElementSource(this.audioElement);
    this._gainNode = this.audioContext.createGain();
    this._gainNode.gain.value = 1;
    this.source = this.resonanceAudioScene.createSource();
    this._obstructionFilter = this.audioContext.createBiquadFilter();
    this._obstructionFilter.type = "lowpass";
    this._obstructionFilter.frequency.value = 300;
    this._obstructionFilter.gain.value = -8; //this.audioElementSource.connect(this. _obstructionFilter);
    //this. _obstructionFilter.connect(this.source.input);

    this.source.setRolloff('logarithmic');
    this.source.setMaxDistance(8);
    this.audioElementSource.connect(this._gainNode).connect(this.source.input);
    this._name = name;
    this._type = "SOUNDSOURCE";
    this._looping = looping;
    this._volume = 1;
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
  }
  /**
   * Sets the position of the sound source.
   * @param position New position (Vector3) of the sound source.
   */


  _createClass(AGSoundSource, [{
    key: "setPosition",
    value: function setPosition(position) {
      /*this.source.setPosition(position.x - this.room.positionOnGameArea.x + this.room.size.x/2,
          position.y - this.room.positionOnGameArea.y +this.room.size.y/2,
          position.z - this.room.positionOnGameArea.z + this.room.size.z/2);*/
      this.source.setPosition(position.x, position.y, position.z);
      /*console.log(new Vector3(position.x - this.room.positionOnGameArea.x + this.room.size.x/2,
          position.y - this.room.positionOnGameArea.y +this.room.size.y/2,
          position.z - this.room.positionOnGameArea.z + this.room.size.z/2));*/
    }
    /**
     * Starts the sound source. Doesn't care if it's already playing.
     */

  }, {
    key: "play",
    value: function play() {
      if (!this._playing && this._looping) {
        this._playing = true;
        this.audioElement.loop = this._looping;
        this.audioElement.play();
      }

      if (!this._looping) {
        this.audioElement.currentTime = 0;
        this.audioElement.play();
      } //Attenuation not working properly...
      //check objects between sound source and player
      //if(this._object.name.localeCompare("Waterfall3")==0) console.log(this._room.betweenPlayerObjectRayIntersect(this._object));


      if (this._room.betweenPlayerObjectRayIntersect(this._object).length > 0) {
        this.audioElementSource.disconnect();
        this.audioElementSource.connect(this._gainNode).connect(this._obstructionFilter);

        this._obstructionFilter.connect(this.source.input);
      } else {
        this.audioElementSource.disconnect();
        this.audioElementSource.connect(this._gainNode).connect(this.source.input);
      }
    }
    /**
     * Stops the sound source.
     */

  }, {
    key: "stop",
    value: function stop() {
      this.playing = false;
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.audioElement.pause();
    }
    /**
     * Plays the sound source on the given position at least once (depending on loop property of the AGSoundSource)
     * @param pos The Vector3 position where the sound is played at
     */

  }, {
    key: "playOnceAtPosition",
    value: function playOnceAtPosition(pos) {
      console.log("[AGSoundSource] Playing AGSoundSource [ID: " + this._ID + "]: " + this._name + " at position " + pos.x.toFixed(2) + "/" + pos.y.toFixed(2) + "/" + pos.z.toFixed(2) + ".");
      this.stop();
      this.setPosition(pos);
      this.play();
    }
  }]);

  return AGSoundSource;
}();

/**
 * The Inventory class which can hold several items. Offers functions for inventory modification.
 */

var AGInventory =
/*#__PURE__*/
function () {
  _createClass(AGInventory, [{
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "attachedTo",
    get: function get() {
      return this._attachedTo;
    },
    set: function set(value) {
      this._attachedTo = value;
    }
  }]);

  function AGInventory(object) {
    _classCallCheck(this, AGInventory);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    console.log("[AGInventory] Creating AGInventory object [ID: " + this._ID + "]. for Object: " + object.name);
    this._inventory = [];
    this._attachedTo = object;
  }

  _createClass(AGInventory, [{
    key: "addItemById",
    value: function addItemById(itemID) {
      var item = getReferenceById(itemID);

      this._inventory.push(item);

      console.log("[AGInventory] Adding Item [" + item.ID + "] " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addItemById.name, this.constructor.name, arguments);
    } //can only be triggered through events

  }, {
    key: "addItem",
    value: function addItem(item) {
      this._inventory.push(item);

      console.log("[AGInventory] Adding Item " + item.name + " to Object " + this._attachedTo.name + "'s inventory.");
    }
    /**
     * Returns the amount of items in this AGInventory with the same name.
     * @param name The name of the AGItem.
     * @returns {number} The amount of AGItems found with the given name.
     */

  }, {
    key: "countByName",
    value: function countByName(name) {
      var count = 0;

      for (var i = 0; i < this._inventory.length; i++) {
        if (this._inventory[i].name.localeCompare(name) === 0) {
          count++;
        }
      }

      return count;
    }
    /**
     * Returns the amount of items in this AGInventory with the same type.
     * @param type The type of the AGItem.
     * @returns {number} The amount of AGItems found with the given type.
     */

  }, {
    key: "countByType",
    value: function countByType(type) {
      var count = 0;

      for (var i = 0; i < this._inventory.length; i++) {
        if (this._inventory[i].type.localeCompare(type) === 0) {
          count++;
        }
      }

      return count;
    }
    /**
     * Removes an item from this AGInventory by AGItem object.
     * @param item The AGItem object that should be removed from the inventory.
     */

  }, {
    key: "removeItem",
    value: function removeItem(item) {
      var indexToDelete = -1;

      for (var i = 0; i < this._inventory.length; i++) {
        if (this._inventory[i] === item) {
          indexToDelete = i;
          break;
        }
      }

      if (indexToDelete > -1) {
        this._inventory.splice(indexToDelete, 1);

        console.log("[AGInventory] Removing Item " + item.name + " from Object " + this._attachedTo.name + "'s inventory.");
      } else console.log("[AGInventory] Item " + item.name + " not found in Object " + this._attachedTo.name + "'s inventory. Cannot remove.");
    }
    /**
     * Removes an item from this AGInventory by ID.
     * @param itemID The item ID that should be removed from the inventory.
     */

  }, {
    key: "removeItemById",
    value: function removeItemById(itemID) {
      this.removeItem(getReferenceById(itemID));
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.removeItemById.name, this.constructor.name, arguments);
    }
  }, {
    key: "searchItemByName",
    value: function searchItemByName(name) {
      for (var i = 0; i < this._inventory.length; i++) {
        if (this._inventory[i].name.localeCompare(name) === 0) {
          return this._inventory[i];
        }
      }

      return null;
    }
    /**
     * Searches for a AGItem in this AGInventory. Returns the item if found, otherwise null.
     * @param item The AGItem object that is being looked for.
     * @returns {null|*} Returns the AGItem if found, otherwise null.
     */

  }, {
    key: "searchItem",
    value: function searchItem(item) {
      for (var i = 0; i < this._inventory.length; i++) {
        if (this._inventory[i] === item) {
          return this._inventory[i];
        }
      }

      return null;
    }
    /**
     * Checks if a AGItem is in this AGInventory, by ID. Returns true if found, otherwise false.
     * @param itemID The ID of the AGItem to be found.
     * @returns {boolean} Returns true, if the inventory has the item, otherwise false.
     */

  }, {
    key: "hasItemById",
    value: function hasItemById(itemID) {
      if (this.searchItemById(itemID)) return true;
      return false;
    }
    /**
     Searches for a AGItem in this AGInventory, by ID. Returns the item if found, otherwise null.
     * @param item The AGItem object that is being looked for.
     * @returns {?AGItem} Returns the AGItem if found, otherwise null.
     */

  }, {
    key: "searchItemById",
    value: function searchItemById(itemID) {
      return this.searchItem(getReferenceById(itemID));
    }
    /**
     * Changes the amount of charges of a AGItem.
     * @param item The item for which the charges are changed.
     * @param changeBy The amount by which the charges should be changed.
     */

  }, {
    key: "changeItemCharge",
    value: function changeItemCharge(item, changeBy) {
      if (this.searchItem(item) !== null) {
        item.charges += changeBy;
      }
    }
  }, {
    key: "inventory",
    get: function get() {
      return this._inventory;
    },
    set: function set(value) {
      this._inventory = value;
    }
  }]);

  return AGInventory;
}();

/**
 * The main class that serves as basis for other objects.
 */

var AGObject =
/*#__PURE__*/
function () {
  _createClass(AGObject, [{
    key: "clearDeathSound",
    value: function clearDeathSound() {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.clearDeathSound.name, this.constructor.name, arguments);

      var index = this._AGSoundSources.indexOf(this._deathSound);

      if (this._deathSound && index !== -1) {
        this._AGSoundSources.splice(index, 1);

        this._deathSound = null;
      }
    }
  }, {
    key: "clearAliveSound",
    value: function clearAliveSound() {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.clearAliveSound.name, this.constructor.name, arguments);

      var index = this._AGSoundSources.indexOf(this._aliveSound);

      if (this._aliveSound && index !== -1) {
        this._AGSoundSources.splice(index, 1);

        this._aliveSound = null;
      }
    }
  }, {
    key: "clearInteractionSound",
    value: function clearInteractionSound() {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.clearInteractionSound.name, this.constructor.name, arguments);

      var index = this._AGSoundSources.indexOf(this._interactionSound);

      if (this._interactionSound && index !== -1) {
        this._AGSoundSources.splice(index, 1);

        this._interactionSound = null;
      }
    }
  }, {
    key: "setSpeedSkalar",
    value: function setSpeedSkalar(value) {
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.setSpeedSkalar.name, this.constructor.name, arguments);
      this.speed = new Vector3(value, value, value);
    }
  }, {
    key: "getSpeedSkalar",
    value: function getSpeedSkalar() {
      return this.speed.x;
    }
  }, {
    key: "addRoute",

    /**
     * Sets the waypoints of the respective object to which the object moves (if moveable == true).
     * @param routes The routes as rest parameter.
     */
    value: function addRoute() {
      for (var _len = arguments.length, routes = new Array(_len), _key = 0; _key < _len; _key++) {
        routes[_key] = arguments[_key];
      }

      var i;

      for (i = 0; i < routes.length; i++) {
        this._route.push(routes[i]);
      }

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addRoute.name, this.constructor.name, arguments);
    }
    /**
     * Adds a waypoint to the route.
     * @param node The waypoint to be added.
     */

  }, {
    key: "addRouteNode",
    value: function addRouteNode(node) {
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addRouteNode.name, this.constructor.name, arguments);

      this._route.push(node);
    }
    /**
     * Clears the route.
     */

  }, {
    key: "clearRoute",
    value: function clearRoute() {
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.clearRoute.name, this.constructor.name, arguments);
      this._route = [];
    }
    /**
     * Creates a new AGObject which is the basis of all objects the current scene has.
     * @param name Name of the object.
     * @param position Position (Vector3) of the object.
     * @param direction Direction (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     */

  }, {
    key: "deathSound",
    get: function get() {
      return this._deathSound;
    },
    set: function set(soundID) {
      var deathSound = getReferenceById(soundID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'deathSound').set.name, this.constructor.name, arguments);
      if (this._AGSoundSources.indexOf(deathSound) === -1) this._AGSoundSources.push(deathSound);
      this._deathSound = deathSound;
    }
  }, {
    key: "aliveSound",
    get: function get() {
      return this._aliveSound;
    },
    set: function set(soundID) {
      var aliveSound = getReferenceById(soundID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'aliveSound').set.name, this.constructor.name, arguments);
      if (this._AGSoundSources.indexOf(aliveSound) === -1) this._AGSoundSources.push(aliveSound);
      this._aliveSound = aliveSound;
    }
  }, {
    key: "interactionSound",
    get: function get() {
      return this._interactionSound;
    },
    set: function set(soundID) {
      var interactionSound = getReferenceById(soundID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'interactionSound').set.name, this.constructor.name, arguments);
      if (this._AGSoundSources.indexOf(interactionSound) === -1) this._AGSoundSources.push(interactionSound);
      this._interactionSound = interactionSound;
    }
  }, {
    key: "movementSound",
    get: function get() {
      return this._movementSound;
    },
    set: function set(soundID) {
      var movementSound = getReferenceById(soundID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'movementSound').set.name, this.constructor.name, arguments);
      if (this._AGSoundSources.indexOf(movementSound) === -1) this._AGSoundSources.push(movementSound);
      this._movementSound = movementSound;
    }
  }, {
    key: "route",
    get: function get() {
      return this._route;
    }
  }, {
    key: "damage",
    get: function get() {
      return this._damage;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'damage').set.name, this.constructor.name, arguments);
      this._damage = value;
    }
  }, {
    key: "dangerous",
    get: function get() {
      return this._dangerous;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'dangerous').set.name, this.constructor.name, arguments);
      this._dangerous = value;
    }
  }, {
    key: "range",
    get: function get() {
      return this._range;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'range').set.name, this.constructor.name, arguments);
      this._range = value;
    }
  }, {
    key: "destructible",
    get: function get() {
      return this._destructible;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'destructible').set.name, this.constructor.name, arguments);
      this._destructible = value;
    }
  }, {
    key: "health",
    get: function get() {
      return this._health;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'health').set.name, this.constructor.name, arguments);
      this._health = value;
    }
  }, {
    key: "ID",
    get: function get() {
      return this._ID;
    }
  }, {
    key: "inventory",
    get: function get() {
      return this._inventory;
    }
  }, {
    key: "room",
    get: function get() {
      return this._room;
    },
    set: function set(value) {
      this._room = value;
    }
  }, {
    key: "collidable",
    get: function get() {
      return this._collidable;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'collidable').set.name, this.constructor.name, arguments);
      this._collidable = value;
    }
  }, {
    key: "blockedObjects",
    get: function get() {
      return this._blockedObjects;
    },
    set: function set(value) {
      this._blockedObjects = value;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      this._type = value;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'name').set.name, this.constructor.name, arguments);
      this._name = value;
    }
  }, {
    key: "movable",
    get: function get() {
      return this._movable;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'movable').set.name, this.constructor.name, arguments);
      this._movable = value;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'size').set.name, this.constructor.name, arguments);
      this._size = value;
    }
  }, {
    key: "direction",
    get: function get() {
      return this._direction;
    },
    set: function set(value) {
      this._direction = value;
    }
  }, {
    key: "AGSoundSources",
    get: function get() {
      return this._AGSoundSources;
    }
  }, {
    key: "position",
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'position').set.name, this.constructor.name, arguments);
      this._position = value; //console.log(this._position);
      //console.log(this._direction);
      //console.log(this._size);
    },
    get: function get() {
      return this._position;
    }
  }, {
    key: "speed",
    get: function get() {
      return this._speed;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'speed').set.name, this.constructor.name, arguments);
      this._speed = value;
    }
  }, {
    key: "runaway",
    get: function get() {
      return this._runaway;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'runaway').set.name, this.constructor.name, arguments);
      this._runaway = value;
    }
  }, {
    key: "circle",
    get: function get() {
      return this._circle;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'circle').set.name, this.constructor.name, arguments);
      this._circle = value;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'tag').set.name, this.constructor.name, arguments);
      this._tag = value;
    }
  }, {
    key: "hitSound",
    get: function get() {
      return this._hitSound;
    },
    set: function set(valueID) {
      var value = getReferenceById(valueID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGObject.prototype, 'hitSound').set.name, this.constructor.name, arguments);
      this._hitSound = value;
    }
  }, {
    key: "interactionCooldown",
    get: function get() {
      return this._interactionCooldown;
    },
    set: function set(value) {
      this._interactionCooldown = value;
    }
  }]);

  function AGObject(name, position, direction, size) {
    _classCallCheck(this, AGObject);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    console.log("[AGObject] Creating AGObject object [ID: " + this._ID + "]: " + name + " at position " + position.x + "/" + position.y + "/" + position.z);
    this._position = position;
    this._direction = direction;
    this._size = size;
    this._currentRoute = 0;
    this._movable = false;
    this._speed = new Vector3(0, 0, 0);
    this._name = name;
    this._collidable = true;
    this._type = "OBJECT";
    this._AGSoundSources = [];
    this._route = [];
    this._blockedObjects = [];
    this._tag = "";
    this._inventory = new AGInventory(this);
    this._destructible = false;
    this._health = 1;
    this._moveableSign = 1;
    this._movementSoundLastPosition = this.position.clone();
    this._interactionCDTimestamp = new Date(0);
    this._aliveSound = null;
    this._interactionSound = null;
    this._deathSound = null;
    this._runaway = false;
    this._circle = true;
  }

  _createClass(AGObject, [{
    key: "addSoundSource",

    /**
     * Adds a soundsource to the object.
     * @param sourceID Soundsource (AGSoundSource) to be added.
     */
    value: function addSoundSource(sourceID) {
      var source = getReferenceById(sourceID);
      source.setPosition(this._position);
      source.object = this;
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addSoundSource.name, this.constructor.name, arguments);

      this._AGSoundSources.push(source);
    }
  }, {
    key: "clearSoundSources",
    value: function clearSoundSources() {
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.clearSoundSources.name, this.constructor.name, arguments);
      this._AGSoundSources = [];
    }
  }, {
    key: "getSoundSources",
    value: function getSoundSources() {
      return this._AGSoundSources;
    }
  }, {
    key: "draw",

    /**
     * the draw-loop
     */
    value: function draw(timeStamp) {
      //as long as the draw loop is called, the sound should be played.
      for (var i = 0, len = this._AGSoundSources.length; i < len; i++) {
        //console.log(this.position);
        if (this._AGSoundSources[i].update) this._AGSoundSources[i].setPosition(this.position);
        if (this._AGSoundSources[i].looping) this._AGSoundSources[i].play();
      }
      /*
      if(this._auditoryPointer){
          if((this.position.distanceTo(this._route[this._currentRoute]) < 0.2)){
              //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
              this._currentRoute = this._currentRoute + this._moveableSign;
              if(this._currentRoute == this._route.length || this._currentRoute < 0) {
                  this._moveableSign *= (-1);
                  this._currentRoute += this._moveableSign;
               }
              //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
          } else {
              //console.log(this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
              if(g_gamearea.listener.position.distanceTo(this._position) < 2.0) {
                  move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
              }
          }
      } else {
          //moves the object depending on speed and direction if the object is movable and a route is given.
          if(this._movable){
              //this._auditoryPointer && (this.position.distanceTo(g_gamearea.listener.position) < 0.2)
                if((this.position.distanceTo(this._route[this._currentRoute]) < 0.2)){
                  //console.log("Object " + this.name + " has reached target: " + this._route[this._currentRoute]);
                  this._currentRoute = ++this._currentRoute % this._route.length;
                  //console.log("Object " + this.name + " takes now route to: " + this._route[this._currentRoute]);
              } else {
                  //console.log(this._route[this._currentRoute].clone().sub(this.position.clone()).normalize());
                  move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
              }
          }
      }*/


      if (this._movable) {
        if (this.position.distanceTo(this._route[this._currentRoute]) < 0.2) {
          if (this._circle) {
            this._currentRoute = ++this._currentRoute % this._route.length;
          } else {
            this._currentRoute = this._currentRoute + this._moveableSign;

            if (this._currentRoute == this._route.length || this._currentRoute < 0) {
              this._moveableSign *= -1;
              this._currentRoute += this._moveableSign;
            }
          }
        } else {
          if (this._runaway) {
            if (g_gamearea.listener.position.distanceTo(this._position) < 2.0) {
              move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
            }
          } else {
            move(this, this._route[this._currentRoute].clone().sub(this.position.clone()).normalize(), timeStamp);
          }
        }
      }
      /*
      if(this._movementSound){
          if(this.position.clone().distanceTo(this._movementSoundLastPosition) === 0.0) {
              this._movementSound.pause();
          }
          else if(!this._movementSound.playing) this._movementSound.play();
           this._movementSound.setPosition(this.position.clone());
      }*/
      //What happens if the object dies


      if (this._destructible && this._health <= 0) this.onDeath(); //this._movementSoundLastPosition = this.position.clone();
    }
    /**
     * Stops all running sounds at the object.
     */

  }, {
    key: "stop",
    value: function stop() {
      for (var i = 0, len = this._AGSoundSources.length; i < len; i++) {
        if (this._AGSoundSources[i].looping) {
          this._AGSoundSources[i].stop();
        }
      }
    }
    /**
     * OnCollisionEnter is called as soon as a Collision happens with the respective object involved.
     * @param obj The object (AGObject) this object collided with.
     */

  }, {
    key: "onCollisionEnter",
    value: function onCollisionEnter(obj) {
      //console.log("Collision happened between: " + this.name + " and " + obj.name);
      g_eventHandler.call(this, "ONCONTACT"); //adds this object to the other object on its blocked list, so the onCollisionEnter isn't called again.

      if (!this._blockedObjects.includes(obj)) {
        this._blockedObjects.push(obj);
      }
    }
    /**
     * OnCollisionExit is called as soon as a Collision ends.
     * @param obj The object (AGobject) this object collided with before it left the Collision.
     */

  }, {
    key: "onCollisionExit",
    value: function onCollisionExit(obj) {
      //console.log("Collision exit between: " + this.name + " and " + obj.name);
      //deletes the object from the blockedObjects list.
      var index = this._blockedObjects.lastIndexOf(obj);

      if (index > -1) {
        //console.log("[AGObject] Collision Exit: removing object " + obj.name);
        this._blockedObjects.splice(index, 1);
      }
    }
    /**
     * Actions to do when an AGObject dies.
     */

  }, {
    key: "onDeath",
    value: function onDeath() {
      g_eventHandler.call(this, "ONDEATH");
      if (this._deathSound) this._deathSound.play();
      console.log("[AGObject] " + this.name + " got destroyed. Triggering death routines.");
      this.kill();
    }
    /**
     * Kills the AGObject and removes it from the reference table.
     */

  }, {
    key: "kill",
    value: function kill() {
      console.log("[AGObject] " + this.name + ": killed.");
      this.stop();
      this.room.removeAGObject(this);
      g_eventHandler.deleteEventsContainingObjectById(this._ID);
      g_eventHandler.deleteGlobalEventsContainingObjectById(this._ID);
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.kill.name, this.constructor.name, arguments);
      g_references["delete"](this._ID);
    }
  }, {
    key: "interact",
    value: function interact() {
      if (this._interactionSound) this._interactionSound.play();
    }
    /**
     * AGObject receives damage from obj.
     * @param obj The AGObject that does damage to this AGObject.
     */

  }, {
    key: "doDamage",
    value: function doDamage(obj) {
      if (this.destructible) {
        this.health -= obj.damage;
        console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " leaving me at " + this.health + " health.");
      } else {
        console.log("[AGObject] " + this.name + " got " + obj.damage + " damage from object " + obj.name + " but cannot take any damage.");
      }
    }
  }, {
    key: "reset",
    value: function reset() {}
  }]);

  return AGObject;
}();

/**
 * Player class that derives from AGObject. Allows interactions.
 */

var AGPlayer =
/*#__PURE__*/
function (_AGObject) {
  _inherits(AGPlayer, _AGObject);

  /**
   * Creates a player of the game.
   * @param name Name of the player.
   * @param position Position (Vector3) of the player.
   * @param direction Direction (Vector3) the player is facing.
   * @param size Size (Vector3) of the player.
   * @param navigation Navigation (AGNavigation) that has the controls for the player.
   * @param room
   */
  function AGPlayer(name, position, direction, size) {
    var _this;

    _classCallCheck(this, AGPlayer);

    console.log("[AGPlayer] Creating AGPlayer object: " + name + ".");
    _this = _possibleConstructorReturn(this, _getPrototypeOf(AGPlayer).call(this, name, position, direction, size));
    _this._type = "PLAYER";
    return _this;
  }

  _createClass(AGPlayer, [{
    key: "draw",

    /**
     * draw-loop
     */
    value: function draw(timeStamp) {
      _get(_getPrototypeOf(AGPlayer.prototype), "draw", this).call(this, timeStamp);

      if (g_controls !== undefined) g_controls.draw(this);
    }
    /**
     * Extends onCollisionEnter of AGObject and plays the hit sound.
     * @param obj The object (AGObject) the player collides with.
     */

  }, {
    key: "onCollisionEnter",
    value: function onCollisionEnter(obj) {
      _get(_getPrototypeOf(AGPlayer.prototype), "onCollisionEnter", this).call(this, obj);

      if (this._hitSound) this._hitSound.audioElement.currentTime = 0;
      if (this._hitSound) this._hitSound.play();
    }
    /**
     * Called if the AGPlayer does the interact action.
     */

  }, {
    key: "interact",
    value: function interact() {
      //damage others
      if (!this.dangerous) return;
      var timeDiff = new Date() - this._interactionCDTimestamp; //console.log(timeDiff);

      if (timeDiff < this._interactionCooldown) {
        console.log("[AGPlayer] " + this.name + "still on Cooldown for " + (this._interactionCooldown - timeDiff) + "ms.");
        return;
      }

      _get(_getPrototypeOf(AGPlayer.prototype), "interact", this).call(this);

      var hits = this.room.objectsRayIntersect(this);

      for (var i = 0; i < hits.length; i++) {
        //if the object is in hit range
        if (hits[i].position.distanceTo(this.position) < this.range) {
          console.log("[AGPlayer] Interaction Hits:");
          console.log(hits);
          hits[i].doDamage(this);
        }
      }

      this._interactionCDTimestamp = new Date();
    }
  }]);

  return AGPlayer;
}(AGObject);

/**
 * Portal class that offers options to move a player from X to Y via in-game objects.
 */

var AGPortal =
/*#__PURE__*/
function (_AGObject) {
  _inherits(AGPortal, _AGObject);

  _createClass(AGPortal, [{
    key: "conditions",
    get: function get() {
      return this._conditions;
    }
  }, {
    key: "exit",
    get: function get() {
      return this._exit;
    },
    set: function set(value) {
      this._exit = value;
    }
  }]);

  /**
   * Creates a portal (to and from the player can teleport)
   * @param name The name of the portal.
   * @param position Position (Vector3) of the portal.
   * @param direction Direction (Vector3) of the portal.
   * @param size Size (Vector3) of the portal.
   */
  function AGPortal(name, position, direction, size) {
    var _this;

    _classCallCheck(this, AGPortal);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AGPortal).call(this, name, position, direction, size));
    console.log("[AGPortal] Creating AGPortal object [ID: " + _this._ID + "]: " + name + ".");
    _this._type = "PORTAL";
    _this._conditions = [];
    return _this;
  }
  /**
   * Overrides onCollisionEnter of AGObject
   * @param obj The object (AGObject) the portal collides with.
   */


  _createClass(AGPortal, [{
    key: "onCollisionEnter",
    value: function onCollisionEnter(obj) {
      //console.log(obj.type);
      if ((obj.type === "PLAYER" || obj.tag === "ENEMY") && !this._blockedObjects.includes(obj) && evaluateAll(this._conditions)) {
        //Blocks object that has just been teleported in other Portal to not get teleported again (until leave)
        if (this._exit) this._exit.blockedObjects.push(obj);

        if (this._exit) {
          setLoading(true);
          if (this._exit) obj.position = this._exit.position.clone();
          setLoading(false);
        }

        if (this._exit) console.log("[AGPortal] Teleporting Object: " + obj.name + " to exit: " + this._exit.name); //this._blockedObjects.push(obj);
      }
    }
    /**
     * Links two portal with each other.
     * @param portal Portal (AGPortal) this portal should be linked with.
     */

  }, {
    key: "linkPortals",
    value: function linkPortals(portalID) {
      var portal = getReferenceById(portalID);
      console.log("[AGPortal] Linking Portal: " + this.name + " to " + portal.name);
      portal.exit = this;
      this.exit = portal;
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.linkPortals.name, this.constructor.name, arguments);
    }
    /**
     * Unlinks this portal and the other.
     */

  }, {
    key: "unlink",
    value: function unlink() {
      if (this._exit != null && this._exit.exit != null) this._exit.exit = null;
      this._exit = null;
      if (!g_loading && !g_playing) g_history.ike(this._ID, this.unlink.name, this.constructor.name, arguments);
    }
    /**
     * Adds an AGCondition to this AGPortal by ID.
     * @param condition The ID of the AGCondition to be added.
     */

  }, {
    key: "addConditionById",
    value: function addConditionById(condition) {
      var cond = getReferenceById(condition);

      this._conditions.push(cond);

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.addConditionById.name, this.constructor.name, arguments);
    }
    /**
     * Deletes an AGCondition of this AGPortal by ID.
     * @param condition The ID of the AGCondition to be deleted.
     */

  }, {
    key: "deleteConditionById",
    value: function deleteConditionById(condition) {
      var cond = getReferenceById(condition);
      var index = -1;
      index = this._conditions.indexOf(cond);

      if (index > -1) {
        this._conditions.splice(index, 1);

        console.log("[AGPortal] Removing Condition ID: [" + condition + "] from Object " + this._name + "'s list of conditions.");
      } else console.log("[AGPortal] Condition ID: [" + condition + "] not found in Object " + this._name + "'s list of conditions. Cannot remove.");

      if (!g_loading && !g_playing) g_history.ike(this._ID, this.deleteConditionById.name, this.constructor.name, arguments);
      g_references["delete"](condition);
    }
  }, {
    key: "getConditionById",
    value: function getConditionById(condition) {
      var cond = getReferenceById(condition);
      return this._conditions[this._conditions.indexOf(cond)];
    }
    /**
     * Kills the AGPortal and triggers the kill function of the superclass.
     */

  }, {
    key: "kill",
    value: function kill() {
      var that = this;

      this._conditions.forEach(function (element) {
        return that.deleteConditionById(element.ID);
      });

      this._conditions = [];

      _get(_getPrototypeOf(AGPortal.prototype), "kill", this).call(this);
    }
    /**
     * draw-loop
     */

    /*draw(){
        super.draw();
        //console.log(this.position.x + " " + this.position.y + " " + this.position.z);
    }*/

    /*onCollisionExit(obj: AGObject) {
     }*/

  }]);

  return AGPortal;
}(AGObject);

/**
 * Exit that triggers the WINGAME if player collides with it.
 */

var AGRoomExit =
/*#__PURE__*/
function (_AGObject) {
  _inherits(AGRoomExit, _AGObject);

  _createClass(AGRoomExit, [{
    key: "reached",
    get: function get() {
      return this._reached;
    }
  }]);

  function AGRoomExit(name, position, direction, size) {
    var _this;

    _classCallCheck(this, AGRoomExit);

    console.log("[AGRoomExit] Creating AGRoomExit object: " + name + ".");
    _this = _possibleConstructorReturn(this, _getPrototypeOf(AGRoomExit).call(this, name, position, direction, size));
    _this._type = "EXIT";
    _this._reached = false;
    return _this;
  }
  /**
   * The routine that is called when there is a collision happening with this and another AGObject.
   * @param obj The other AGObject that triggered the collision.
   */


  _createClass(AGRoomExit, [{
    key: "onCollisionEnter",
    value: function onCollisionEnter(obj) {
      _get(_getPrototypeOf(AGRoomExit.prototype), "onCollisionEnter", this).call(this, obj);

      if (obj.type === "PLAYER") {
        console.log("[AGRoomExit] " + obj.name + " reached exit.");
        this._reached = true;
        obj.room.solved = true;
      }
    }
  }, {
    key: "onCollisionExit",
    value: function onCollisionExit(obj) {
      _get(_getPrototypeOf(AGRoomExit.prototype), "onCollisionExit", this).call(this, obj);
    }
  }]);

  return AGRoomExit;
}(AGObject);

/**
 * Handles communication between UI and Engine
 */

var IAudiCom =
/*#__PURE__*/
function () {
  _createClass(IAudiCom, [{
    key: "position",
    set: function set(value) {
      this._scale = value;
    },
    get: function get() {
      return this._scale;
    }
  }, {
    key: "room_canvas",
    set: function set(value) {
      this._room_canvas = value;
    },
    get: function get() {
      return this._room_canvas;
    }
    /**
     *
     */

  }]);

  function IAudiCom() {
    _classCallCheck(this, IAudiCom);

    this._scale = 55;
    this._vision_mode = 0;
    this._interval = '';
    this._room_canvas = new fabric.Canvas('c', {
      selection: false
    });
    this._controlsID = 3;
    this._colors = [['#e2e2e2', '#000060'], //0 canvas
    ['#ebebeb', '#cccccc'], //1 grid
    ['#6fafeb', '#FFFACD'], //2 player
    ['#d47070', '#F7CA18'], //3 enemy
    ['#FDA038', '#DDA0DD'], //4 wall, portal, exit
    ['#60cd4b', '#38fd4f'], //5 colors for highlighted objects
    ['#000000', '#ffffff'], //6 colors for path-points
    ['#000000', '#f02727'], //7 colors for path-lines
    ['#7079d4', '#39adff'] //8 colors for generic objects
    ];
    this.renderScene(); //this.renderPathDot();
  }
  /**
   * Clears all objects of the current room and sets up an empty canvas with a player-object
   */


  _createClass(IAudiCom, [{
    key: "newScene",
    value: function newScene() {
      if (confirm("Clear all objects of current room?")) {
        var room_buffer = this._room_canvas;
        var scale_buffer = this._scale;
        var canvas_objects = room_buffer.getObjects();
        canvas_objects.forEach(function (item, i) {
          if (item.type == 'player') {
            item.LineArray = [];
            item.PathArray = [];
            getReferenceById(item.AGObjectID).clearRoute();
            getReferenceById(item.AGObjectID).movable = false;
          }

          if (item.isObject && item.type != 'player') {
            getReferenceById(item.AGObjectID).kill();
          }

          if (item.type != 'grid_line' && item.type != 'player') {
            room_buffer.remove(item);
          }
        });
        this.deleteItemsEventsEtc();
        room_buffer.renderAll();
      }
    }
    /**
     * Starts the scene and enables the player to control the player-object
     */

  }, {
    key: "startArea",
    value: function startArea() {
      this.disableKeyScrolling();
      var that = this;
      /*lower opacity and disable click for elements*/

      $('#ui_part_right').addClass('no_click lower_opacity');
      $('select').addClass('no_click lower_opacity');
      $('#ui_controls').addClass('no_click lower_opacity');
      $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').addClass('no_click lower_opacity');
      /*remove tab-index after play was clicked*/

      $('.faboject_').prop('tabIndex', -1);
      $('input').prop('tabIndex', -1);
      $('select').prop('tabIndex', -1);
      $('.sb_object').prop('tabIndex', -1);
      $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').prop('tabIndex', -1);
      var room_buffer = this._room_canvas;
      var scale_buffer = this._scale;
      var canvas_objects = room_buffer.getObjects();
      play(getReferenceById(g_gamearea.ID), true);
      this._interval = setInterval(function () {
        canvas_objects = room_buffer.getObjects();

        if (getReferenceById(that._AGroomID).solved) {
          that.stopArea();
          $('#win_screen').fadeIn(100);
        }

        canvas_objects.forEach(function (item, i) {
          if (item.isObject) {
            if (item.type == 'player') {
              if (item.left + 200 > $('#canvas_container').width() + $('#canvas_container').scrollLeft()) {
                $('#canvas_container').scrollLeft($('#canvas_container').scrollLeft() + 1);
              } else if (item.left - 200 < $('#canvas_container').scrollLeft()) {
                $('#canvas_container').scrollLeft($('#canvas_container').scrollLeft() - 1);
              }

              if (item.top + 200 > $('#canvas_container').height() + $('#canvas_container').scrollTop()) {
                $('#canvas_container').scrollTop($('#canvas_container').scrollTop() + 1);
              } else if (item.top - 200 < $('#canvas_container').scrollTop()) {
                $('#canvas_container').scrollTop($('#canvas_container').scrollTop() - 1);
              }
            } // item.left = item.AGObject.position.x*scale_buffer + item.AGObject.size.x*scale_buffer/2;
            // item.top = item.AGObject.position.z*scale_buffer + item.AGObject.size.z*scale_buffer/2;
            // item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);
            // check if not null or undefined


            if (getReferenceById(item.AGObjectID)) {
              //remove "dead" objects [URB WZ HERE]
              if (getReferenceById(item.AGObjectID).destructible && getReferenceById(item.AGObjectID).health <= 0) {
                //remove path of dead enemies
                if (item.type == 'enemy') {
                  item.PathArray.forEach(function (ele) {
                    room_buffer.remove(ele);
                  });
                }

                room_buffer.remove(item);
              }

              item.left = getReferenceById(item.AGObjectID).position.x * scale_buffer;
              item.top = getReferenceById(item.AGObjectID).position.z * scale_buffer;

              if (item == room_buffer.getActiveObject()) {
                $('#coord_x span').text(getReferenceById(item.AGObjectID).position.x);
                $('#coord_y span').text(getReferenceById(item.AGObjectID).position.z);
              }

              item.set('angle', Math.atan2(getReferenceById(item.AGObjectID).direction.z, getReferenceById(item.AGObjectID).direction.x) * 180 / Math.PI);
            } else {
              room_buffer.remove(item);
            }
          }
        });
        room_buffer.renderAll();
      }, 33);
    }
    /**
     * Stops and rebuilds the scene
     */

  }, {
    key: "stopArea",
    value: function stopArea() {
      //this.enableKeyScrolling();

      /*make clickable again*/
      $('#ui_part_right').removeClass('no_click lower_opacity');
      $('select').removeClass('no_click lower_opacity');
      $('#ui_controls').removeClass('no_click lower_opacity');
      $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').removeClass('no_click lower_opacity');
      $('#fabric_objects_container').empty();
      /*add tab-index after play was clicked*/

      $('.faboject_').prop('tabIndex', 0);
      $('input').prop('tabIndex', 0);
      $('select').prop('tabIndex', 0);
      $('.sb_object').prop('tabIndex', 0);
      $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').prop('tabIndex', 0);
      play(getReferenceById(g_gamearea.ID), false);
      clearInterval(this._interval);

      this._room_canvas.clear();

      g_references.clear();
      g_history.rebuild();
      this.renderScene();
    }
    /**
     * Renders the canvas
     * @param ID of the AGRoom
     */

  }, {
    key: "renderAGRoom",
    value: function renderAGRoom(ag_roomID) {
      this._room_canvas.setWidth(getReferenceById(ag_roomID).size.x * this._scale);

      this._room_canvas.setHeight(getReferenceById(ag_roomID).size.z * this._scale);

      var options = {
        distance: this._scale,
        width: this._room_canvas.width,
        height: this._room_canvas.height,
        param: {
          stroke: this._colors[1][this._vision_mode],
          strokeWidth: 1,
          selectable: false,
          type: 'grid_line'
        }
      }; //grid for the canvas

      var gridHeight = options.height / options.distance;
      var gridLen = options.width / options.distance;

      for (var i = 0; i < gridLen; i++) {
        var distance = i * options.distance,
            vertical = new fabric.Line([distance, 0, distance, options.height], options.param);

        this._room_canvas.add(vertical);
      }

      for (var i = 0; i < gridHeight; i++) {
        var distance = i * options.distance,
            horizontal = new fabric.Line([0, distance, options.width, distance], options.param);

        this._room_canvas.add(horizontal);
      }
      this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];

      this._room_canvas.renderAll();
    }
    /**
     * Changes the dimensions of the canvas
     * @param Width of the new canvas
     * @param Height of the new canvas
     */

  }, {
    key: "setAGRoomDimensions",
    value: function setAGRoomDimensions(width, height) {
      var room_buffer = this._room_canvas;
      var old_width = room_buffer.getWidth();
      var old_height = room_buffer.getHeight();
      var new_width = width * this._scale;
      var new_height = height * this._scale;
      var that = this; //delete objects which lie outside boundaries after resize

      if (new_width < old_width || new_height < old_height) {
        //Check if objects lie outside
        var scale_buffer = this._scale;
        var canvas_objects = room_buffer.getObjects();
        canvas_objects.forEach(function (item, i) {
          if (item.type != 'grid_line') {
            var item_right_buffer = item.left + Math.round(item.width * item.scaleX) / 2;
            var item_top_buffer = item.top + Math.round(item.height * item.scaleY) / 2;

            if (item_right_buffer > new_width || item_top_buffer > new_height) {
              if (item.type == 'path_line' || item.type == 'path_dot') {
                //Hierher
                item.parentFab.PathArray.forEach(function (ele) {
                  room_buffer.remove(ele);
                });
                item.parentFab.LineArray.forEach(function (ele) {
                  room_buffer.remove(ele);
                });
                room_buffer.remove(item);
                item.parentFab.PathArray = [];
                getReferenceById(item.parentFab.AGObjectID).clearRoute();
                getReferenceById(item.parentFab.AGObjectID).movable = false;
              } else if (item.type == 'player') {
                item.left = 0.5 * that._scale;
                item.top = 0.5 * that._scale;
                item.setCoords();
                getReferenceById(item.AGObjectID).position = new Vector3(0.5, 1, 0.5);
              } else {
                that.deleteObject(item);
              }
            }
          }
        });
      }

      this._room_canvas.setWidth(width * this._scale);

      this._room_canvas.setHeight(height * this._scale);

      this._room_canvas.renderAll(); //set room size of AGRoom (what happens with objects, which "fall out")


      getReferenceById(this._AGroomID).size = new Vector3(width, 2.5, height);
    }
    /**
     * Creates an AGObject and calls renderAGObject with its ID
     * @param The type of the AGObject
     * @param The x-position of the AGObject
     * @param The y-position of the AGObject
     */

  }, {
    key: "makeThenRenderAGObject",
    value: function makeThenRenderAGObject(obj_type, obj_left, obj_top) {
      var obj_buffer;
      var obj_buffer_ID;

      switch (obj_type) {
        case 'enemy':
          obj_buffer = new AGObject("AGgegner", new Vector3(obj_left / this._scale, 1, obj_top / this._scale), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          obj_buffer_ID = getIdByReference(obj_buffer);
          getReferenceById(obj_buffer_ID).tag = "ENEMY";
          getReferenceById(obj_buffer_ID).setSpeedSkalar(0);
          break;

        case 'wall':
          obj_buffer = new AGObject("Structure", new Vector3(obj_left / this._scale, 1.0, obj_top / this._scale), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          obj_buffer_ID = getIdByReference(obj_buffer);
          getReferenceById(obj_buffer_ID).tag = "WALL";
          break;

        case 'portal':
          obj_buffer = new AGPortal("Portal", new Vector3(obj_left / this._scale, 1.0, obj_top / this._scale), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          obj_buffer_ID = getIdByReference(obj_buffer);
          break;

        case 'exit':
          obj_buffer = new AGRoomExit("Exit", new Vector3(obj_left / this._scale, 1.0, obj_top / this._scale), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          obj_buffer_ID = getIdByReference(obj_buffer);
          break;

        case 'generic':
          obj_buffer = new AGObject("Generic", new Vector3(obj_left / this._scale, 1.0, obj_top / this._scale), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          obj_buffer_ID = getIdByReference(obj_buffer);
          getReferenceById(obj_buffer_ID).collidable = false;
          getReferenceById(obj_buffer_ID).tag = "GENERIC";
      }

      getReferenceById(this._AGroomID).add(obj_buffer_ID);
      this.renderAGObject(obj_buffer_ID);
      this.refreshObjectSelect();
      this.listItems();
      this.listConditions();
      return obj_buffer_ID;
    }
    /**
     * Creates a fabric-Object and renders it
     * @param The ID of the AGOBject
     */

  }, {
    key: "renderAGObject",
    value: function renderAGObject(ag_objectID) {
      var _scalebuffer = this._scale;
      var colors_buffer = this._colors;
      var vision_mode_buffer = this._vision_mode;
      var room_canvas_buffer = this._room_canvas; //add details for tapping

      $('<div tabindex = "0" id = "fabobject_' + ag_objectID + '" obj_id = "' + ag_objectID + '" class = "faboject_">test</div>').prependTo('#fabric_objects_container');

      if (getReferenceById(ag_objectID).tag) {
        switch (getReferenceById(ag_objectID).tag) {
          case 'ENEMY':
            fabric.loadSVGFromURL('ui/img/enemy.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
              obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[3][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.PathArray = [];
              obj.LineArray = [];
              obj.isObject = true;
              obj.isRecording = false;
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'enemy';
              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });

              if (getReferenceById(ag_objectID).route.length > 0) {
                getReferenceById(ag_objectID).route.forEach(function (item, index) {
                  var dot = new fabric.Circle({
                    left: item.x * _scalebuffer - 4,
                    top: item.z * _scalebuffer - 4,
                    radius: 4,
                    fill: colors_buffer[6][vision_mode_buffer],
                    objectCaching: false,
                    selectable: false,
                    opacity: 0,
                    type: 'path_dot',
                    parentFab: obj
                  });

                  if (obj.PathArray.length >= 1) {
                    var last_dot_buffer = obj.PathArray[obj.PathArray.length - 1];
                    var line = new fabric.Line([dot.left + 4, dot.top + 4, last_dot_buffer.left + 4, last_dot_buffer.top + 4], {
                      fill: colors_buffer[7][vision_mode_buffer],
                      stroke: colors_buffer[7][vision_mode_buffer],
                      strokeWidth: 2,
                      selectable: false,
                      evented: false,
                      opacity: 0,
                      type: 'path_line',
                      parentFab: obj
                    });
                    obj.LineArray.push(line);
                    room_canvas_buffer.add(line);
                  }

                  obj.PathArray.push(dot);
                  room_canvas_buffer.add(dot);
                });
              }

              room_canvas_buffer.add(obj).renderAll();
            });
            break;

          case 'WALL':
            var obj = new fabric.Rect({
              width: getReferenceById(ag_objectID).size.x * _scalebuffer,
              height: getReferenceById(ag_objectID).size.z * _scalebuffer,
              fill: colors_buffer[4][vision_mode_buffer],
              left: getReferenceById(ag_objectID).position.x * _scalebuffer,
              top: getReferenceById(ag_objectID).position.z * _scalebuffer,
              AGObjectID: ag_objectID,
              isObject: true,
              name: getReferenceById(ag_objectID).name,
              type: 'wall',
              strokeWidth: 1,
              originX: 'center',
              originY: 'center'
            });
            obj.hasRotatingPoint = false;
            room_canvas_buffer.add(obj).renderAll();
            break;

          default:
            fabric.loadSVGFromURL('ui/img/generic.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
              obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[8][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.PathArray = [];
              obj.LineArray = [];
              obj.isObject = true;
              obj.isRecording = false;
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'generic';
              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });
              room_canvas_buffer.add(obj).renderAll();
            });
        }
      } else if (getReferenceById(ag_objectID).type) {
        switch (getReferenceById(ag_objectID).type) {
          case 'PORTAL':
            fabric.loadSVGFromURL('ui/img/portal.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
              obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[4][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.isObject = true;
              obj.isRecording = false;
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'portal';

              if (getReferenceById(ag_objectID).exit) {
                var secDoorAGObject = getReferenceById(ag_objectID).exit;
                obj.secDoor = getIdByReference(secDoorAGObject);
                var dot = new fabric.Circle({
                  left: obj.left - 4,
                  top: obj.top - 4,
                  radius: 4,
                  fill: colors_buffer[6][vision_mode_buffer],
                  objectCaching: false,
                  selectable: false,
                  type: 'portal_dot',
                  opacity: 0
                }); //draw line between portals

                var line = new fabric.Line([obj.left, obj.top, secDoorAGObject.position.x * _scalebuffer, secDoorAGObject.position.z * _scalebuffer], {
                  fill: colors_buffer[7][vision_mode_buffer],
                  stroke: colors_buffer[7][vision_mode_buffer],
                  strokeWidth: 2,
                  selectable: false,
                  evented: false,
                  type: 'portal_line',
                  dot: dot,
                  opacity: 0
                });
                obj.line = line;
                obj.line.dot = dot;
                room_canvas_buffer.add(dot);
                room_canvas_buffer.add(line);
              } else {
                obj.secDoor = false;
                obj.line = false;
              }

              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });
              room_canvas_buffer.add(obj).renderAll();
            });
            break;

          case 'EXIT':
            fabric.loadSVGFromURL('ui/img/exit.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
              obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[4][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.isObject = true;
              obj.isRecording = false;
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'exit';
              obj.secDoor = false;
              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });
              room_canvas_buffer.add(obj).renderAll();
            });
            break;

          case 'PLAYER':
            //TODO change size of player
            fabric.loadSVGFromURL('ui/img/player.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(1 * _scalebuffer);
              obj.scaleToHeight(1 * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[2][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.isObject = true;
              obj.PathArray = [];
              obj.LineArray = [];
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'player';
              room_canvas_buffer.add(obj).renderAll();
              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });

              if (getReferenceById(ag_objectID).route.length > 0) {
                getReferenceById(ag_objectID).route.forEach(function (item, index) {
                  var dot = new fabric.Circle({
                    left: item.x * _scalebuffer - 4,
                    top: item.z * _scalebuffer - 4,
                    radius: 4,
                    fill: colors_buffer[6][vision_mode_buffer],
                    objectCaching: false,
                    selectable: false,
                    opacity: 0,
                    type: 'path_dot',
                    parentFab: obj
                  });

                  if (obj.PathArray.length >= 1) {
                    var last_dot_buffer = obj.PathArray[obj.PathArray.length - 1];
                    var line = new fabric.Line([dot.left + 4, dot.top + 4, last_dot_buffer.left + 4, last_dot_buffer.top + 4], {
                      fill: colors_buffer[7][vision_mode_buffer],
                      stroke: colors_buffer[7][vision_mode_buffer],
                      strokeWidth: 2,
                      selectable: false,
                      evented: false,
                      opacity: 0,
                      type: 'path_line',
                      parentFab: obj
                    });
                    obj.LineArray.push(line);
                    room_canvas_buffer.add(line);
                  }

                  obj.PathArray.push(dot);
                  room_canvas_buffer.add(dot);
                });
              }

              room_canvas_buffer.add(obj).renderAll();
            });
            break;

          default:
            fabric.loadSVGFromURL('ui/img/generic.svg', function (objects) {
              var obj = fabric.util.groupSVGElements(objects);
              obj.scaleToWidth(1 * _scalebuffer);
              obj.scaleToHeight(1 * _scalebuffer);
              obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
              obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
              obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
              obj.fill = colors_buffer[4][vision_mode_buffer];
              obj.AGObjectID = ag_objectID;
              obj.isObject = true;
              obj.name = getReferenceById(ag_objectID).name;
              obj.type = 'generic';
              room_canvas_buffer.add(obj).renderAll();
              obj.originX = 'center';
              obj.originY = 'center';
              obj.hasRotatingPoint = false;
              obj.lockScalingX = true;
              obj.lockScalingY = true;
              obj.setControlsVisibility({
                mt: false,
                // middle top disable
                mb: false,
                // midle bottom
                ml: false,
                // middle left
                mr: false,
                // I think you get it
                tr: false,
                tl: false,
                br: false,
                bl: false
              });
              room_canvas_buffer.add(obj).renderAll();
            });
        }
      }
    }
    /**
     * Deletes Items, Conditions, Global Events & Events
     */

  }, {
    key: "deleteItemsEventsEtc",
    value: function deleteItemsEventsEtc() {
      var items_buffer = getReferencesOfType('AGItem');
      items_buffer.forEach(function (buffer) {
        deleteItem(buffer);
      });
      var conditions_buffer = getReferencesOfType('AGCondition');
      conditions_buffer.forEach(function (buffer) {
        deleteCondition(buffer);
      });
      var glevents_buffer = getReferencesOfType('GlobalEvent');
      glevents_buffer.forEach(function (buffer) {
        getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeGlobalEventByID(parseInt(buffer));
      });
      var events_buffer = getReferencesOfType('Event');
      events_buffer.forEach(function (buffer) {
        getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeEventByID(parseInt(buffer));
      });
      this.listItems();
      this.listEvents();
      this.refreshItemSelect();
      this.listGlobalEvents();
      this.listConditions();
    }
    /**
     * Lists all Items
     */

  }, {
    key: "listItems",
    value: function listItems() {
      var select_obj_buffer = '<option value = ""></option>' + this.prepareSelectObjects();
      $('#item_carrier').empty().append(select_obj_buffer);
      $('#item_table tbody tr').not('#item_input_row').empty();
      var items_buffer = getReferencesOfType('AGItem');

      if (items_buffer.length > 0) {
        items_buffer.forEach(function (element) {
          var item_buffer = getReferenceById(element);
          $('#item_table tbody').append('<tr id = "item_' + element + '" item_id = "' + element + '"><td><input class = "input_item_name" placeholder="New Item" maxlength="100" type="text" name="item_name" value="' + item_buffer.name + '"></td><td><input class = "input_item_desc" placeholder="This item..." maxlength="100" type="text" name="item_description" value="' + item_buffer.description + '"></td><td><input class = "input_item_type" placeholder="Generic" maxlength="100" type="text" name="item_type" value="' + item_buffer.type + '"></td><td><input class = "input_item_charges" placeholder="1" maxlength="10" type="number" step="1" min="1" name="item_charges" value="' + item_buffer.charges + '"></td><td><select class = "select_item_carrier">' + select_obj_buffer + '</select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
          $('#item_' + element + ' .select_item_carrier').val(getOwnerIdOfItemById(element));
        });
      }
    }
    /**
     * Updates the Item Lists
     */

  }, {
    key: "refreshItemSelect",
    value: function refreshItemSelect() {
      var select_item_buffer = this.prepareSelectItems();
      $('.select_event_item').empty().append(select_item_buffer);
      $('#event_item').empty().append(select_item_buffer);
      $('.select_event_item').each(function (index) {
        var id_buffer = parseInt($(this).parents('tr').attr('event_id'));
        var event_buffer = getReferenceById(id_buffer);
        $('#event_' + id_buffer + ' .select_event_item').val(event_buffer.addObject.ID);
      });
    }
    /**
     * Lists all Conditions
     */

  }, {
    key: "listConditions",
    value: function listConditions() {
      $('#condition_table tbody tr').not('#condition_input_row').remove();
      var select_obj_buffer = this.prepareSelectObjects();
      var select_item_buffer = this.prepareSelectItems();
      var select_portals_buffer = this.prepareSelectPortals();
      var select_type_buffer = this.prepareSelectTypes();
      var conditions_buffer = getReferencesOfType('AGCondition');
      $('#condition_primary').empty().append(select_obj_buffer);
      $('#condition_item').empty().append(select_item_buffer);
      $('#condition_portal').empty().append(select_portals_buffer);
      $('#condition_type').empty().append(select_type_buffer);
      var that = this;

      if (conditions_buffer.length > 0) {
        conditions_buffer.forEach(function (element) {
          var condition_buffer = getReferenceById(element);
          $('#condition_table tbody').append('<tr id="condition_' + element + '" condition_id = "' + element + '"><td><select class = "select_condition_portal">' + select_portals_buffer + '</select></td><td><select class = "select_condition_primary">' + select_obj_buffer + '</select></td><td><select class="select_condition_trigger"><option value="countByType">Count By Type</option><option value="hasItemById">Has Item</option></select></td><td class = "condition_cnt"><select class = "input_condition_type"  class = "input_row">' + select_type_buffer + '</select></td><td class = "condition_cnt"><input class = " input_condition_count" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_count" style = "width:auto;" value = "' + 4 + '"></td><td class = "condition_has"><select class = "select_condition_item">' + select_item_buffer + '</select></td><td class = "condition_has"><select class = "select_condition_tf"  class = "input_row"><option value = "true">True</option><option value = "false">False</option></select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
          var portal_id_buffer = that.getIdOfPortal(element);

          if (portal_id_buffer) {
            $('#condition_' + element + ' .select_condition_portal').val(portal_id_buffer);
          }

          $('#condition_' + element + ' .select_condition_primary').val(condition_buffer.object.ID);
          $('#condition_' + element + ' .select_condition_trigger').val(condition_buffer.funcOfConditionObject.name);
          var condition_func_buffer = condition_buffer.funcOfConditionObject.name;

          if (condition_func_buffer == 'countByType') {
            $('#condition_' + element).find(".condition_has").hide();
            $('#condition_' + element).find('.condition_cnt').show();
            $('#condition_' + element + ' .input_condition_type').val(condition_buffer.funcArgs[0]);
            $('#condition_' + element + ' .input_condition_count').val(condition_buffer.value);
          } else if (condition_func_buffer == 'hasItemById') {
            $('#condition_' + element).find('.condition_cnt').hide();
            $('#condition_' + element).find(".condition_has").show();
            $('#condition_' + element + ' .select_condition_item').val(condition_buffer.funcArgs[0]);

            if (condition_buffer.value) {
              $('#condition_' + element + ' .select_condition_tf').val("true");
            } else {
              $('#condition_' + element + ' .select_condition_tf').val("false");
            }
          }
        });
      }
    }
    /**
     * Generates a new Item with the given properties
     * @param The name of the item
     * @param The description of the item
     * @param The type of the item
     * @param The charges count of the item
     * @param The carrier object of the item
     */

  }, {
    key: "generateItem",
    value: function generateItem(_item_name, _item_desc, _item_type, _item_charges, _item_carriedby) {
      var item_buffer = new AGItem(_item_name, _item_desc, _item_type, _item_charges);
      var id_buffer = getIdByReference(item_buffer);
      var select_obj_buffer = '<option value = ""></option>' + this.prepareSelectObjects();
      $('#item_table tbody').append('<tr id = "item_' + id_buffer + '" item_id = "' + id_buffer + '"><td><input class = "input_item_name" placeholder="New Item" maxlength="100" type="text" name="item_name" value="' + item_buffer.name + '"></td><td><input class = "input_item_desc" placeholder="This item..." maxlength="100" type="text" name="item_description" value="' + item_buffer.description + '"></td><td><input class = "input_item_type" placeholder="Generic" maxlength="100" type="text" name="item_type" value="' + item_buffer.type + '"></td><td><input class = "input_item_charges" placeholder="1" maxlength="10" type="number" step="1" min="1" name="item_charges" value="' + item_buffer.charges + '"></td><td><select class = "select_item_carrier">' + select_obj_buffer + '</select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');

      if (_item_carriedby) {
        getReferenceById(parseInt(_item_carriedby)).inventory.addItemById(id_buffer);
        $('#item_' + id_buffer + ' .select_item_carrier').val(_item_carriedby);
      }

      this.refreshItemSelect();
      this.listGlobalEvents();
      this.listConditions();
    }
    /**
     * Generates a new Condition with the given properties
     * @param The portal the condition applies to
     * @param The object interacting with the portal
     * @param The trigger function
     * @param The type of the item
     * @param The count of the item
     */

  }, {
    key: "generateCondition",
    value: function generateCondition(_cond_portal, _cond_primary, _cond_func, _cond_arg1, _cond_arg2) {
      var cond_buffer = new AGCondition(_cond_primary, "INVENTORY", _cond_func, [_cond_arg1], _cond_arg2);
      getReferenceById(_cond_portal).addConditionById(getIdByReference(cond_buffer));
      this.listConditions();
    }
    /**
     * Prepares the content of the Dropdown for the portals
     * @returns The String with the Dropdown-Options
     */

  }, {
    key: "prepareSelectPortals",
    value: function prepareSelectPortals() {
      var select_obj_buffer = ''; //prepare the select for the objects

      var rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
      this._AGroomID = rooms_buffer[0].ID;

      if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
        getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
          if (element.type == 'PORTAL') {
            select_obj_buffer = select_obj_buffer + '<option value = "' + element.ID + '">' + element.name + '</option>';
          }
        });
      }

      return select_obj_buffer;
    }
    /**
     * Returns all Portal Objects
     * @returns The array of portals
     */

  }, {
    key: "getPortals",
    value: function getPortals() {
      var portals_buffer = [];
      var rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
      this._AGroomID = rooms_buffer[0].ID;

      if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
        getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
          if (element.type == 'PORTAL') {
            portals_buffer.push(element); //select_obj_buffer = select_obj_buffer + '<option value = "'+ element.ID + '">' + element.name + '</option>';
          }
        });
      }

      return portals_buffer;
    }
    /**
     * Returns the ID of a Portal linked to a Condition ID
     * @param The Condition ID
     * @returns The Portal ID
     */

  }, {
    key: "getIdOfPortal",
    value: function getIdOfPortal(_condition_id) {
      var portals_buffer = this.getPortals();
      var portal_id_buffer = null;
      portals_buffer.forEach(function (portal_buffer) {
        var conditions_buffer = portal_buffer.conditions;
        conditions_buffer.forEach(function (condition_buffer) {
          if (condition_buffer.ID == _condition_id) {
            portal_id_buffer = getIdByReference(portal_buffer);
          }
        });
      });
      return portal_id_buffer;
    }
    /**
     * Prepares the content of the Dropdown for the Item Types
     * @returns The String with the Dropdown-Options
     */

  }, {
    key: "prepareSelectTypes",
    value: function prepareSelectTypes() {
      var items_buffer = getReferencesOfType('AGItem');
      var types_buffer = [];
      var append_buffer = "<option item_type = ''></option>";

      if (items_buffer.length > 0) {
        items_buffer.forEach(function (element) {
          var type_buffer = getReferenceById(element).type;

          if (!types_buffer.includes(type_buffer)) {
            types_buffer.push(type_buffer);
            append_buffer += "<option item_type = " + type_buffer + ">" + type_buffer + "</option>";
          }
        });
      }

      return append_buffer;
    }
    /**
     * Deletes a Condition by ID
     * @param The Condition ID
     */

  }, {
    key: "deleteConditionFromList",
    value: function deleteConditionFromList(_cond_id) {
      deleteCondition(_cond_id);
      this.listConditions();
    }
    /**
     * Generates a new Event with the given properties
     * @param The primary object of the Event
     * @param The trigger
     * @param The resulting action
     * @param The item name
     * @param The secondary object
     * @param The repeat count
     */

  }, {
    key: "generateEvent",
    value: function generateEvent(_event_primary, _event_trigger, _event_action, _event_item, _event_secondary, _event_repeat) {
      var event_buffer = new Event(_event_primary, _event_trigger, _event_action, _event_secondary, _event_item, _event_repeat);
      var id_buffer = getIdByReference(event_buffer);
      var select_obj_buffer = this.prepareSelectObjects();
      var select_item_buffer = this.prepareSelectItems();
      $('#event_table tbody').append('<tr id = "event_' + id_buffer + '" event_id = "' + id_buffer + '"><td><select class = "select_event_primary">' + select_obj_buffer + '</select></td><td><select class = "select_event_trigger"><option value = "null">None</option><option value = "ONDEATH">ONDEATH</option><option value = "ONCONTACT">ONCONTACT</option><option value = "ONSIGHT">ONSIGHT</option></select></td><td><select class = "select_event_action"><option value = "null">None</option><option value = "ADD">ADD</option><option value = "REMOVE">REMOVE</option><option value = "MOVE">MOVE</option><option value = "ACTIVATE">ACTIVATE</option><option value = "DEACTIVATE">DEACTIVATE</option><option value = "WINGAME">WINGAME</option></select></td><td><select class = "select_event_item">' + select_item_buffer + '</select></td><td><select class = "select_event_secondary">' + select_obj_buffer + '</select></td><td><input class = "input_events_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="events_repeat" value="' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
      $('#event_' + id_buffer + ' .select_event_trigger').val(_event_trigger);
      $('#event_' + id_buffer + ' .select_event_action').val(_event_action);
      $('#event_' + id_buffer + ' .input_events_repeat').val(_event_repeat);
      this.refreshObjectSelect();
      this.refreshItemSelect();
    }
    /**
     * Deletes an Item by ID
     * @param The Item ID
     */

  }, {
    key: "deleteItemfromList",
    value: function deleteItemfromList(_item_id) {
      deleteItem(parseInt(_item_id));
      this.listEvents();
      this.refreshItemSelect();
      this.listGlobalEvents();
      this.listConditions();
    }
    /**
     * Generates a new Global Event with the given properties
     * @param The primary object of the event
     * @param The condition object
     * @param The called function
     * @param The item type
     * @param The item count
     * @param The resulting action
     * @param The repeat count
     */

  }, {
    key: "generateGlobalEvent",
    value: function generateGlobalEvent(_glevent_primary, _glevent_conobject, _glevent_func, _glevent_type, _glevent_count, _glevent_action, _glevent_repeat) {
      var glevent_buffer = new GlobalEvent(_glevent_primary, _glevent_conobject, _glevent_func, [_glevent_type], _glevent_count, _glevent_action, _glevent_repeat);
      this.refreshObjectSelect();
      this.listGlobalEvents();
    }
    /**
     * Refreshes the Object Selects for Events and Global Events
     */

  }, {
    key: "refreshObjectSelect",
    value: function refreshObjectSelect() {
      var select_obj_buffer = this.prepareSelectObjects();
      $('.select_event_primary').empty().append(select_obj_buffer);
      $('#event_primary').empty().append(select_obj_buffer);
      $('#glevent_primary').empty().append(select_obj_buffer); //globalevent

      $('.select_glevent_primary').each(function (index) {
        var id_buffer = parseInt($(this).parents('tr').attr('glevent_id'));
        var event_buffer = getReferenceById(id_buffer);
        $('#glevent_' + id_buffer + ' .select_glevent_primary').val(event_buffer.object.ID);
      }); //event

      $('.select_event_primary').each(function (index) {
        var id_buffer = parseInt($(this).parents('tr').attr('event_id'));
        var event_buffer = getReferenceById(id_buffer);
        $('#event_' + id_buffer + ' .select_event_primary').val(event_buffer.origin.ID);
      });
      $('.select_event_secondary').empty().append(select_obj_buffer);
      $('#event_secondary').append(select_obj_buffer);
      $('.select_event_secondary').each(function (index) {
        var id_buffer = parseInt($(this).parents('tr').attr('event_id'));
        var event_buffer = getReferenceById(id_buffer);
        $('#event_' + id_buffer + ' .select_event_primary').val(event_buffer.origin.ID);
      });
    }
    /**
     * Lists the Global Events
     */

  }, {
    key: "listGlobalEvents",
    value: function listGlobalEvents() {
      //fill the global events
      $('#glevent_table tbody tr').not('#glevent_input_row').remove();
      var glevents_buffer = getReferencesOfType('GlobalEvent');
      var select_obj_buffer = this.prepareSelectObjects();
      $('#glevent_primary').empty().append(select_obj_buffer);
      $('#glevent_type').empty();
      $('.select_glevent_type').empty(); //get all types from items

      if (glevents_buffer.length > 0) {
        glevents_buffer.forEach(function (element) {
          var event_buffer = getReferenceById(element);
          $('#glevent_table tbody').append('<tr id="glevent_' + element + '" glevent_id = "' + element + '"><td><select class = "select_glevent_primary">' + select_obj_buffer + '</select></td><td><select class = "select_glevent_conobject"><option value="INVENTORY">Inventory</option></select></td><td><select class = "select_glevent_func"><option value="countByType">Count by Type</option></select></td><td><select class = "select_glevent_type"></select></td><td><input class = " input_glevent_count" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_count" style = "width:auto;" value = "' + event_buffer.value + '"></td><td><select class = "select_glevent_action"><option value="WINGAME">Win Game</option></select></td><td><input class = "input_glevent_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_repeat" style = "width:auto;" value = "' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
          $('#glevent_' + element + ' .select_glevent_primary').val(event_buffer.object.ID);
          $('#glevent_' + element + ' .select_glevent_conobject').val(event_buffer.conditionObject); //$('#glevent_' + element + ' .select_glevent_func').val(event_buffer.funcOfConditionObject);

          $('#glevent_' + element + ' .select_glevent_type').val(event_buffer.funcArgs[0]);
          $('#glevent_' + element + ' .input_glevent_count').val(event_buffer.value);
          $('#glevent_' + element + ' .select_glevent_action').val(event_buffer.action);
          $('#glevent_' + element + ' .input_glevent_repeat').val(event_buffer.repeat);
        });
      }

      var items_buffer = getReferencesOfType('AGItem');
      var append_buffer = "<option item_type = ''><i></i></option>";
      $('#glevent_type').append(append_buffer);
      $('.select_glevent_type').append(append_buffer);

      if (items_buffer.length > 0) {
        items_buffer.forEach(function (element) {
          var type_buffer = getReferenceById(element).type;
          var bool_buffer = false; //console.log(type_buffer);
          //check if already there

          $('#glevent_type option').each(function (ele) {
            if (!bool_buffer) {
              bool_buffer = $(this).attr('item_type') == type_buffer;
            }
          });

          if (!bool_buffer) {
            append_buffer = "<option item_type = " + type_buffer + ">" + type_buffer + "</option>";
            $('#glevent_type').append(append_buffer);
            $('.select_glevent_type').append(append_buffer);
          }
        });
      }

      $('.select_glevent_type').each(function (ele) {
        var id_buffer = parseInt($(this).parents('tr').attr('glevent_id'));
        var event_buffer = getReferenceById(id_buffer);
        $(this).val(event_buffer.funcArgs[0]);
      });
    }
    /**
     * Lists the Events
     */

  }, {
    key: "listEvents",
    value: function listEvents() {
      $('#event_table tbody tr').not('#event_input_row').empty();
      var events_buffer = getReferencesOfType('Event');
      var select_obj_buffer = this.prepareSelectObjects();
      var select_item_buffer = this.prepareSelectItems(); //fill the generation-inputs

      $('#event_primary').empty().append(select_obj_buffer);
      $('#event_item').empty().append(select_item_buffer);
      $('#event_secondary').empty().append(select_obj_buffer);

      if (events_buffer.length > 0) {
        events_buffer.forEach(function (element) {
          var event_buffer = getReferenceById(element);
          $('#event_table tbody').append('<tr id = "event_' + element + '" event_id = "' + element + '"><td><select class = "select_event_primary">' + select_obj_buffer + '</select></td><td><select class = "select_event_trigger"><option value = "null">None</option><option value = "ONDEATH">ONDEATH</option><option value = "ONCONTACT">ONCONTACT</option><option value = "ONSIGHT">ONSIGHT</option></select></td><td><select class = "select_event_action"><option value = "null">None</option><option value = "ADD">ADD</option><option value = "REMOVE">REMOVE</option><option value = "MOVE">MOVE</option><option value = "ACTIVATE">ACTIVATE</option><option value = "DEACTIVATE">DEACTIVATE</option><option value = "WINGAME">WINGAME</option></select></td><td><select class = "select_event_item">' + select_item_buffer + '</select></td><td><select class = "select_event_secondary">' + select_obj_buffer + '</select></td><td><input class = "input_events_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="events_repeat" value="' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
          $('#event_' + element + ' .select_event_primary').val(event_buffer.origin.ID);
          $('#event_' + element + ' .select_event_trigger').val(event_buffer.trigger);
          $('#event_' + element + ' .select_event_action').val(event_buffer.action);
          $('#event_' + element + ' .select_event_item').val(event_buffer.addObject.ID);
          $('#event_' + element + ' .select_event_secondary').val(event_buffer.object.ID);
        });
      }
    }
    /**
     * Deletes an Event by ID
     * @param The Event ID
     */

  }, {
    key: "deleteEvent",
    value: function deleteEvent(_event_id) {
      //console.log(getReferenceById(getReferencesOfType("AGEventHandler")[0]))
      getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeEventByID(parseInt(_event_id));
    }
    /**
     * Deletes a Global Event by ID
     * @param The Global Event ID
     */

  }, {
    key: "deleteGlobalEvent",
    value: function deleteGlobalEvent(_event_id) {
      getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeGlobalEventByID(parseInt(_event_id));
    }
    /**
     * Prepares the content of the Dropdown for the Items (by Name)
     * @returns The String with the Dropdown-Options
     */

  }, {
    key: "prepareSelectItems",
    value: function prepareSelectItems() {
      var items_buffer = getReferencesOfType('AGItem');
      var select_item_buffer = '';

      if (items_buffer.length > 0) {
        items_buffer.forEach(function (element) {
          select_item_buffer = select_item_buffer + '<option value = "' + getReferenceById(element).ID + '">' + getReferenceById(element).name + '</option>';
        });
      }

      return select_item_buffer;
    }
    /**
     * Prepares the content of the Dropdown for the Objects
     * @returns The String with the Dropdown-Options
     */

  }, {
    key: "prepareSelectObjects",
    value: function prepareSelectObjects() {
      var select_obj_buffer = ''; //prepare the select for the objects

      var rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
      this._AGroomID = rooms_buffer[0].ID;

      if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
        getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
          select_obj_buffer = select_obj_buffer + '<option value = "' + element.ID + '">' + element.name + '</option>';
        });
      }

      return select_obj_buffer;
    }
    /**
     * Removes a fabric-object from the canvas (in case of enemy deletes the path/in case of portal deletes the link)
     * @param The fabric-object
     */

  }, {
    key: "deleteObject",
    value: function deleteObject(_fabobject) {
      var room_buffer = this._room_canvas; //console.log("hallo");

      getReferenceById(_fabobject.AGObjectID).kill(); //check if removed element was linked to portal or has path points and remove that stuff
      //TODO wait for portal remove function in AGPortal

      if (_fabobject.type == 'enemy') {
        _fabobject.PathArray.forEach(function (ele) {
          room_buffer.remove(ele);
        });

        _fabobject.LineArray.forEach(function (ele) {
          room_buffer.remove(ele);
        });
      }

      if (_fabobject.type == 'portal') {
        //_fabobject.secDoor
        var fab_buffer = this.getFabricObject(_fabobject.secDoor);

        if (fab_buffer) {
          fab_buffer.secDoor = false;
          fab_buffer.set("fill", this._colors[4][this._vision_mode]);
        }

        if (_fabobject.line) {
          this._room_canvas.remove(this.getFabricObject(_fabobject.secDoor).line.dot);

          this._room_canvas.remove(this.getFabricObject(_fabobject.secDoor).line);

          this.getFabricObject(_fabobject.secDoor).line = false;

          this._room_canvas.remove(_fabobject.line.dot);

          this._room_canvas.remove(_fabobject.line);

          _fabobject.line.line = false;
        }
      }

      this._room_canvas.remove(_fabobject);

      this._room_canvas.renderAll();

      this.listEvents();
      this.listConditions();
      this.listItems();
      this.listGlobalEvents();
    }
    /**
     * Calls renderAGObject for all AGObjects of a n AGRoom
     */

  }, {
    key: "renderScene",
    value: function renderScene() {
      //console.log(getReferenceById(g_gamearea.ID));
      var rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
      this._AGroomID = rooms_buffer[0].ID; //prefill the inputs with Room name and Dimensions

      $('#input_room_name').val(getReferenceById(this._AGroomID).name);
      $('#tb_canvas_dim_width').val(getReferenceById(this._AGroomID).size.x);
      $('#tb_canvas_dim_height').val(getReferenceById(this._AGroomID).size.z);
      this.renderAGRoom(this._AGroomID);
      var that = this;

      if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
        getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
          that.renderAGObject(element.ID);
        });
      }

      this.listItems();
      this.listEvents();
      this.listConditions();
      this.listGlobalEvents();
    }
    /**
     * Adds a soundsource to an AGobject
     * @param The ID of the AGOBject
     * @param The name of the soundsource
     */

  }, {
    key: "addSoundSource",
    value: function addSoundSource(ag_object_id, ss_name, state_) {
      var ag_object_buffer = getReferenceById(ag_object_id);
      var roomID_buffer = getReferenceById(g_gamearea.ID).AGRooms[0].ID;
      var ss_buffer;
      var loop = false;

      if (state_ == 'on_death') {
        loop = false;
        ag_object_buffer.clearDeathSound();
      } else if (state_ == 'on_action') {
        loop = false;
        ag_object_buffer.clearInteractionSound();
      } else if (state_ == 'on_alive') {
        ag_object_buffer.clearAliveSound();
      }

      switch (ss_name) {
        case 'steps':
          ss_buffer = new AGSoundSource("Steps", "sounds/steps.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "STEPS";
          break;

        case 'waterfall':
          ss_buffer = new AGSoundSource("Waterfall", "sounds/waterfall.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "WATERFALL";
          break;

        case 'magic':
          ss_buffer = new AGSoundSource("Magic", "sounds/magic.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "MAGIC";
          break;

        case 'ouch':
          ss_buffer = new AGSoundSource("Ouch", "sounds/ouch.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "OUCH";
          break;

        case 'car':
          ss_buffer = new AGSoundSource("Car", "sounds/car.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "CAR";
          break;

        case 'monster':
          ss_buffer = new AGSoundSource("Monster", "sounds/monster.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "MONSTER";
          break;

        case 'truck':
          ss_buffer = new AGSoundSource("Truck", "sounds/truck.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "TRUCK";
          break;

        case 'motorcycle':
          ss_buffer = new AGSoundSource("Motorcycle", "sounds/motorcycle.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "MOTORCYCLE";
          break;

        case 'fainting':
          ss_buffer = new AGSoundSource("Fainting", "sounds/monsterpain.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "FAINTING";
          break;

        case 'arrow':
          ss_buffer = new AGSoundSource("Arrow", "sounds/arrow.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "ARROW";
          break;

        case 'bats':
          ss_buffer = new AGSoundSource("Bats", "sounds/bats.wav", loop, 1, roomID_buffer);
          ss_buffer.tag = "BATS";
          break;
      }

      ss_buffer.playOnceAtPosition(g_gamearea.listener.position);
      ss_buffer.looping = true;

      if (ss_name != 'none') {
        if (state_ == 'on_death') {
          ag_object_buffer.deathSound = getIdByReference(ss_buffer);
        } else if (state_ == 'on_action') {
          ag_object_buffer.interactionSound = getIdByReference(ss_buffer);
        } else if (state_ == 'on_alive') {
          ag_object_buffer.aliveSound = getIdByReference(ss_buffer);
        }
      }
    }
    /**
     * Draws a small dot for debugging
     * @param The x-position of the Dot
     * @param The y-position of the Dot
     */

  }, {
    key: "drawDot",
    value: function drawDot(x_, y_) {
      var dot = new fabric.Circle({
        left: x_ * this._scale - 1,
        top: y_ * this._scale - 1,
        radius: 2,
        fill: '#f51a1a',
        type: 'debug',
        selectable: false
      });

      this._room_canvas.add(dot);

      this._room_canvas.renderAll();
    }
    /**
     * Deletes all debugging dots
     */

  }, {
    key: "deleteDots",
    value: function deleteDots() {
      var room_buffer = this._room_canvas;
      var canvas_objects = room_buffer.getObjects();
      canvas_objects.forEach(function (item, i) {
        if (item.type == 'debug') {
          room_buffer.remove(item);
        }
      });
      room_buffer.renderAll();
    }
    /**
     * Returns the fabric-object linked to an AGObject-ID
     * @param The ID of the AGOBject
     * @return The fabric-object
     */

  }, {
    key: "getFabricObject",
    value: function getFabricObject(ag_objectID) {
      var canvas_objects = this._room_canvas.getObjects();

      var fab_buffer;
      canvas_objects.forEach(function (item, i) {
        if (item.isObject && item.AGObjectID == ag_objectID) {
          fab_buffer = item;
        }
      });
      return fab_buffer;
    }
    /**
     * Toggles the visual representation of the editor for higher contrasts
     */

  }, {
    key: "toggleVisionMode",
    value: function toggleVisionMode() {
      var _this = this;

      this._vision_mode = +!this._vision_mode;
      this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];

      this._room_canvas.getObjects().forEach(function (object) {
        switch (object.type) {
          case 'grid_line':
            object.set("stroke", _this._colors[1][_this._vision_mode]);
            break;

          case 'player':
            object.set("fill", _this._colors[2][_this._vision_mode]);
            object.set("fill", _this._colors[2][_this._vision_mode]);
            break;

          case 'enemy':
            object.set("fill", _this._colors[3][_this._vision_mode]);
            break;

          case 'portal':
          case 'wall':
          case 'exit':
            object.set("fill", _this._colors[4][_this._vision_mode]);
            break;

          case 'path_dot':
            object.set("fill", _this._colors[6][_this._vision_mode]);
            break;

          case 'path_line':
            object.set("fill", _this._colors[7][_this._vision_mode]);
            object.set("stroke", _this._colors[7][_this._vision_mode]);
            break;

          default:
            object.set("fill", _this._colors[8][_this._vision_mode]);
        }
      });

      this._room_canvas.renderAll(); //toggle contrast class for css


      $(".item_event_tab_active,.item_event_tab,h1,h2,h3,h4,h5,h6,body,#sb_object_enemy,.sb_object_structure,#sb_object_generic,.btn,#canvas_container,label,.gegner_speed_active,.ss_active,#btn_help,#overlay_text_box").toggleClass("contrast");
    }
    /**
     * Zooms the scenes in or out
     * @param the zoom factor
     */

  }, {
    key: "zoomCanvas",
    value: function zoomCanvas(zoom_factor) {
      //min : 0.5
      //max : 1.5
      var room_buffer = this._room_canvas;
      room_buffer.setZoom(room_buffer.getZoom() * zoom_factor); //set stroke-width to 1 again

      var canvas_objects = room_buffer.getObjects();
      canvas_objects.forEach(function (item, i) {
        if (item.type == 'grid_line') {
          item.strokeWidth = 1 / room_buffer.getZoom() * 1;
        }
      }); //console.log(room_buffer.width*room_buffer.getZoom());

      var width_buffer = room_buffer.width * room_buffer.getZoom();
      var height_buffer = room_buffer.height * room_buffer.getZoom();
      var middle_width_buffer = $('#ui_part_middle').width();

      if (width_buffer < middle_width_buffer) {
        $('#canvas_container').width(room_buffer.width * room_buffer.getZoom());
        $('#canvas_container').addClass('canvas_no_overflow_x');
      } else {
        $('#canvas_container').removeClass('canvas_no_overflow_x');
      }

      if (height_buffer < 600) {
        $('#canvas_container').addClass('canvas_no_overflow_y');
        $('#canvas_container').height(room_buffer.height * room_buffer.getZoom());
        $('#canvas_container').height(room_buffer.height * room_buffer.getZoom());
      } else {
        $('#canvas_container').height(600);
        $('#canvas_container').removeClass('canvas_no_overflow_y');
      }

      room_buffer.renderAll();
    }
    /**
     * Disables key scrolling
     */

  }, {
    key: "disableKeyScrolling",
    value: function disableKeyScrolling() {
      window.addEventListener("keydown", function (e) {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      }, false);
    }
    /**
     * Enables key scrolling
     */

  }, {
    key: "enableKeyScrolling",
    value: function enableKeyScrolling() {} //window.removeEventListener("keydown");

    /**
     * save Level from Clipboard
     */

  }, {
    key: "saveLevelSALO",
    value: function saveLevelSALO() {
      g_history.saveLevelToClipboard();
    }
    /**
     * load Level from Clipboard
     */

  }, {
    key: "loadLevelSALO",
    value: function loadLevelSALO() {
      g_references.clear();
      g_history.loadLevelFromClipboard().then(function () {
        this.deleteItemsEventsEtc();
        var that = this;

        this._room_canvas.clear();

        that.renderScene();
      })["catch"](function () {
        alert("Something went wrong while loading your Level Code. Please check your Level Code and try again!");
      });
    }
    /**
     * gets called by the UI in case of loading a level in Firefox
     * @param the level code to load
     */

  }, {
    key: "loadFFLevel",
    value: function loadFFLevel(_ff_lvl_code) {
      try {
        g_references.clear();
        g_history.rebuild(_ff_lvl_code);
        this.renderScene();
      } catch (err) {
        alert("Something went wrong while loading your Level Code. - Please check your Level Code and try again!");
      }
    }
    /**
     * Loads a level
     * @param the level ID
     */

  }, {
    key: "loadLevel",
    value: function loadLevel(lvl_) {
      var that = this; //restore default view

      $('#ui_part_right_inner').hide();
      $('#input_room_name').val(getReferenceById(that._AGroomID).name);
      $('#tb_canvas_dim_width').val(getReferenceById(that._AGroomID).size.x);
      $('#tb_canvas_dim_height').val(getReferenceById(that._AGroomID).size.z);
      $('.ui_box_special').hide();
      $('.ui_box_general').hide();
      $('.ui_box_room').show();
      $('#ui_part_right_inner').show();
      $('#fabric_objects_container').empty();
      play(getReferenceById(g_gamearea.ID), false);

      this._room_canvas.clear();

      g_references.clear();
      rebuildHandlerGameArea(); //stop level clear everything

      switch (lvl_) {
        case 1:
          var controls = new AGNavigation(-1, -1, 37, 39, 67);
          var controlsID = getIdByReference(controls);
          that._controlsID = controlsID;
          setControl(getReferenceById(controlsID));
          var room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
          var room_1ID = getIdByReference(room_1);
          g_gamearea.addRoom(room_1ID);
          var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
          var wall1 = new AGObject("Wand unten", new Vector3(14, 1.0, 6.7), new Vector3(1, 0, 0), new Vector3(12, 1, 0.5));
          var wall2 = new AGObject("Wand links", new Vector3(4.5, 1.0, 6.4), new Vector3(1, 0, 0), new Vector3(0.5, 1, 5));
          var wall3 = new AGObject("Wand oben", new Vector3(10.66, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(12.8, 1, 0.5));
          var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var enemy1 = new AGObject("Gegner 1", new Vector3(6.3, 1.0, 2.4), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var enemy2 = new AGObject("Gegner 2", new Vector3(12.9, 1.0, 0.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var enemy3 = new AGObject("Gegner 3", new Vector3(12.3, 1.0, 4.6), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var enemy4 = new AGObject("Gegner 4", new Vector3(12.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var enemy1_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
          var enemy2_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
          var enemy3_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
          var enemy4_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
          var arrow = new AGSoundSource("Pfeil", "sounds/arrow.wav", false, 1, room_1ID);
          var monsterDeath_enemy1 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
          var monsterDeath_enemy2 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
          var monsterDeath_enemy3 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
          var monsterDeath_enemy4 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
          var steps = new AGSoundSource("Schritte", "sounds/steps.wav", true, 1, room_1ID);
          var environmental1 = new AGObject("Wasserfall", new Vector3(19.3, 1.0, 2.1), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var environmental1SS = new AGSoundSource("Wasserfall Sound", "sounds/waterfall.wav", true, 1, room_1ID);
          var environmental2 = new AGObject("Fledermaus", new Vector3(7.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var environmental2SS = new AGSoundSource("Fledermaus Sound", "sounds/bats.wav", true, 1, room_1ID);
          var wall1_ID = wall1.ID;
          var wall2_ID = wall2.ID;
          var wall3_ID = wall3.ID;
          var waterfall1_ID = waterfall_1.ID;
          var waterfall2_ID = waterfall_2.ID;
          var enemy1_ID = enemy1.ID;
          var enemy2_ID = enemy2.ID;
          var enemy3_ID = enemy3.ID;
          var enemy4_ID = enemy4.ID;
          var enemy1_ss_ID = enemy1_ss.ID;
          var enemy2_ss_ID = enemy2_ss.ID;
          var enemy3_ss_ID = enemy3_ss.ID;
          var enemy4_ss_ID = enemy4_ss.ID;
          var monsterDeathEnemy1SS_ID = monsterDeath_enemy1.ID;
          var monsterDeathEnemy2SS_ID = monsterDeath_enemy2.ID;
          var monsterDeathEnemy3SS_ID = monsterDeath_enemy3.ID;
          var monsterDeathEnemy4SS_ID = monsterDeath_enemy4.ID;
          var stepsID = steps.ID;
          var arrow_ID = arrow.ID;
          var environmental1_ID = environmental1.ID;
          var environmental1SS_ID = environmental1SS.ID;
          var environmental2_ID = environmental2.ID;
          var environmental2SS_ID = environmental2SS.ID;
          var ouchID = getIdByReference(ouch);
          var playerID = getIdByReference(player);
          g_gamearea.listener = playerID;
          getReferenceById(room_1ID).listener = playerID; //Add ObjectsToRoom

          getReferenceById(room_1ID).add(playerID);
          getReferenceById(room_1ID).add(wall1_ID);
          getReferenceById(room_1ID).add(wall2_ID);
          getReferenceById(room_1ID).add(wall3_ID);
          getReferenceById(room_1ID).add(enemy1_ID);
          getReferenceById(room_1ID).add(enemy2_ID);
          getReferenceById(room_1ID).add(enemy3_ID);
          getReferenceById(room_1ID).add(enemy4_ID);
          getReferenceById(room_1ID).add(environmental1_ID);
          getReferenceById(room_1ID).add(environmental2_ID);
          getReferenceById(wall1_ID).tag = "WALL";
          getReferenceById(wall2_ID).tag = "WALL";
          getReferenceById(wall3_ID).tag = "WALL";
          getReferenceById(environmental1_ID).tag = "WATERFALL";
          getReferenceById(environmental2_ID).tag = "FLEDERMAUS";
          getReferenceById(enemy1_ID).tag = "ENEMY";
          getReferenceById(enemy2_ID).tag = "ENEMY";
          getReferenceById(enemy3_ID).tag = "ENEMY";
          getReferenceById(enemy4_ID).tag = "ENEMY";
          getReferenceById(monsterDeathEnemy1SS_ID).tag = 'FAINTING';
          getReferenceById(monsterDeathEnemy2SS_ID).tag = 'FAINTING';
          getReferenceById(monsterDeathEnemy3SS_ID).tag = 'FAINTING';
          getReferenceById(monsterDeathEnemy4SS_ID).tag = 'FAINTING';
          getReferenceById(stepsID).tag = 'STEPS';
          getReferenceById(arrow_ID).tag = 'FAINTING'; //getReferenceById(playerID).tag = "ENEMY";
          //Player Settings

          getReferenceById(playerID).setSpeedSkalar(2);
          getReferenceById(playerID).hitSound = ouchID;
          getReferenceById(playerID).movable = true;
          getReferenceById(playerID).dangerous = true;
          getReferenceById(playerID).damage = 1;
          getReferenceById(playerID).range = 7; //getReferenceById(playerID).addSoundSource(stepsID);

          getReferenceById(playerID).interactionSound = arrow_ID;
          getReferenceById(playerID).interactionCooldown = 500; //getReferenceById(playerID).movementSound = stepsID;

          getReferenceById(playerID).addRoute(new Vector3(2.16, 1, 6.07), new Vector3(2.22, 1, 1.28), new Vector3(6.33, 1, 0.73), new Vector3(12.89, 1, 2.82), new Vector3(17.67, 1, 0.84), new Vector3(18.38, 1, 4.8), new Vector3(13.02, 1, 5.93), new Vector3(7.29, 1, 5.15), new Vector3(5.87, 1, 6.78), new Vector3(8.89, 1, 8.53), new Vector3(12.42, 1, 7.42), new Vector3(18.8, 1, 8.49), new Vector3(18.84, 1, 10.02), new Vector3(1.96, 1, 9.95)); //Enemy Settings

          getReferenceById(enemy1_ID).destructible = true;
          getReferenceById(enemy1_ID).health = 1;
          getReferenceById(enemy1_ID).movable = false;
          getReferenceById(enemy1_ID).collidable = true;
          getReferenceById(enemy1_ID).setAliveSound = enemy1_ss_ID;
          getReferenceById(enemy1_ID).deathSound = monsterDeathEnemy1SS_ID; //Enemy Settings

          getReferenceById(enemy2_ID).destructible = true;
          getReferenceById(enemy2_ID).health = 1;
          getReferenceById(enemy2_ID).movable = false;
          getReferenceById(enemy2_ID).collidable = true;
          getReferenceById(enemy2_ID).setAliveSound = enemy2_ss_ID;
          getReferenceById(enemy2_ID).deathSound = monsterDeathEnemy2SS_ID; //Enemy Settings

          getReferenceById(enemy3_ID).destructible = true;
          getReferenceById(enemy3_ID).health = 1;
          getReferenceById(enemy3_ID).movable = false;
          getReferenceById(enemy3_ID).collidable = true;
          getReferenceById(enemy3_ID).setAliveSound = enemy3_ss_ID;
          getReferenceById(enemy3_ID).deathSound = monsterDeathEnemy3SS_ID; //Enemy Settings

          getReferenceById(enemy4_ID).destructible = true;
          getReferenceById(enemy4_ID).health = 1;
          getReferenceById(enemy4_ID).movable = false;
          getReferenceById(enemy4_ID).collidable = true;
          getReferenceById(enemy4_ID).setAliveSound = enemy4_ss_ID;
          getReferenceById(enemy4_ID).deathSound = monsterDeathEnemy4SS_ID; //Environmental Settings

          getReferenceById(environmental1_ID).addSoundSource(environmental1SS_ID);
          getReferenceById(environmental1_ID).collidable = false;
          getReferenceById(environmental2SS_ID).maxDistance = 4;
          getReferenceById(environmental2_ID).addSoundSource(environmental2SS_ID);
          getReferenceById(environmental2_ID).collidable = false; //Coins

          var coin_1 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
          var coin_2 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
          var coin_3 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
          var coin_4 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
          var coin1_ID = coin_1.ID;
          var coin2_ID = coin_2.ID;
          var coin3_ID = coin_3.ID;
          var coin4_ID = coin_4.ID; //Events

          var eventEnemy1 = new Event(enemy1_ID, "ONDEATH", "MOVE", playerID, coin1_ID, 1);
          var eventEnemy2 = new Event(enemy2_ID, "ONDEATH", "MOVE", playerID, coin2_ID, 1);
          var eventEnemy3 = new Event(enemy3_ID, "ONDEATH", "MOVE", playerID, coin3_ID, 1);
          var eventEnemy4 = new Event(enemy4_ID, "ONDEATH", "MOVE", playerID, coin4_ID, 1);
          var eventEnemy1_ID = eventEnemy1.ID;
          var eventEnemy2_ID = eventEnemy2.ID;
          var eventEnemy3_ID = eventEnemy3.ID;
          var eventEnemy4_ID = eventEnemy4.ID;
          getReferenceById(enemy1_ID).inventory.addItemById(coin1_ID);
          g_eventHandler.addEvent(eventEnemy1_ID);
          getReferenceById(enemy2_ID).inventory.addItemById(coin2_ID);
          g_eventHandler.addEvent(eventEnemy2_ID);
          getReferenceById(enemy3_ID).inventory.addItemById(coin3_ID);
          g_eventHandler.addEvent(eventEnemy3_ID);
          getReferenceById(enemy4_ID).inventory.addItemById(coin4_ID);
          g_eventHandler.addEvent(eventEnemy4_ID);
          var globalEventFinish = new GlobalEvent(playerID, "INVENTORY", "countByType", ["coin"], 4, "WINGAME", 1);
          g_eventHandler.addGlobalEvent(globalEventFinish.ID);
          getReferenceById(room_1ID).live = true;
          break;

        case 2:
          var controls = new AGNavigation(38, 40, -1, -1, 67);
          var controlsID = getIdByReference(controls);
          that._controlsID = controlsID;
          setControl(getReferenceById(controlsID));
          var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
          var room_1ID = getIdByReference(room_1);
          g_gamearea.addRoom(room_1ID);
          var player = new AGPlayer("Player", new Vector3(1, 1.0, 5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var skeleton_1 = new AGObject("Skeleton", new Vector3(3.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var skeleton_2 = new AGObject("Skeleton", new Vector3(11, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var skeleton_3 = new AGObject("Skeleton", new Vector3(14.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var skeleton_4 = new AGObject("Skeleton", new Vector3(16, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
          var car_1 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
          var car_2 = new AGSoundSource("Car", "sounds/truck.wav", true, 1, room_1ID);
          var car_3 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
          var car_4 = new AGSoundSource("Car", "sounds/motorcycle.wav", true, 1, room_1ID);
          var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
          var magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
          var playerID = getIdByReference(player);
          var exitID = getIdByReference(exit);
          var skeleton_1ID = getIdByReference(skeleton_1);
          var skeleton_2ID = getIdByReference(skeleton_2);
          var skeleton_3ID = getIdByReference(skeleton_3);
          var skeleton_4ID = getIdByReference(skeleton_4);
          var ouchID = getIdByReference(ouch);
          var car_1ID = getIdByReference(car_1);
          var car_2ID = getIdByReference(car_2);
          var car_3ID = getIdByReference(car_3);
          var car_4ID = getIdByReference(car_4);
          var magic_exit_ID = getIdByReference(magic_exit);
          g_gamearea.listener = getIdByReference(player);
          getReferenceById(room_1ID).listener = getIdByReference(player); //Add ObjectsToRoom

          getReferenceById(room_1ID).add(playerID);
          getReferenceById(room_1ID).add(exitID);
          getReferenceById(room_1ID).add(skeleton_1ID);
          getReferenceById(room_1ID).add(skeleton_2ID);
          getReferenceById(room_1ID).add(skeleton_3ID);
          getReferenceById(room_1ID).add(skeleton_4ID); //Soundtags

          getReferenceById(car_1ID).tag = "CAR";
          getReferenceById(car_2ID).tag = "CAR";
          getReferenceById(car_3ID).tag = "CAR";
          getReferenceById(car_4ID).tag = "CAR";
          getReferenceById(ouchID).tag = "OUCH";
          getReferenceById(magic_exit_ID).tag = "MAGIC"; //Car 1

          getReferenceById(skeleton_1ID).setSpeedSkalar(1);
          getReferenceById(skeleton_1ID).movable = true;
          getReferenceById(skeleton_1ID).destructible = true;
          getReferenceById(skeleton_1ID).health = 4;
          getReferenceById(skeleton_1ID).addRoute(new Vector3(3.5, 1, 9), new Vector3(3.5, 1, 1));
          getReferenceById(skeleton_1ID).addSoundSource(car_1ID);
          getReferenceById(skeleton_1ID).tag = "ENEMY"; //Car 2

          getReferenceById(skeleton_2ID).setSpeedSkalar(3);
          getReferenceById(skeleton_2ID).movable = true;
          getReferenceById(skeleton_2ID).destructible = true;
          getReferenceById(skeleton_2ID).health = 4;
          getReferenceById(skeleton_2ID).addRoute(new Vector3(7, 1, 1), new Vector3(11, 1, 2), new Vector3(7, 1, 3), new Vector3(11, 1, 4), new Vector3(7, 1, 5), new Vector3(11, 1, 6), new Vector3(7, 1, 7), new Vector3(11, 1, 8), new Vector3(7, 1, 9), new Vector3(11, 1, 9), new Vector3(7, 1, 8), new Vector3(11, 1, 7), new Vector3(7, 1, 6), new Vector3(11, 1, 5), new Vector3(7, 1, 4), new Vector3(11, 1, 3), new Vector3(7, 1, 2), new Vector3(11, 1, 1));
          getReferenceById(skeleton_2ID).addSoundSource(car_2ID);
          getReferenceById(skeleton_2ID).tag = "ENEMY"; //Car 3

          getReferenceById(skeleton_3ID).setSpeedSkalar(1);
          getReferenceById(skeleton_3ID).movable = true;
          getReferenceById(skeleton_3ID).destructible = true;
          getReferenceById(skeleton_3ID).health = 4;
          getReferenceById(skeleton_3ID).addRoute(new Vector3(14.5, 1, 9), new Vector3(14.5, 1, 1));
          getReferenceById(skeleton_3ID).addSoundSource(car_3ID);
          getReferenceById(skeleton_3ID).tag = "ENEMY"; //Car 4

          getReferenceById(skeleton_4ID).setSpeedSkalar(2);
          getReferenceById(skeleton_4ID).movable = true;
          getReferenceById(skeleton_4ID).destructible = true;
          getReferenceById(skeleton_4ID).health = 4;
          getReferenceById(skeleton_4ID).addRoute(new Vector3(16, 1, 9), new Vector3(16, 1, 1));
          getReferenceById(skeleton_4ID).addSoundSource(car_4ID);
          getReferenceById(skeleton_4ID).tag = "ENEMY"; //Player Settings

          getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
          getReferenceById(playerID).hitSound = ouchID;
          getReferenceById(playerID).dangerous = true;
          getReferenceById(playerID).damage = 1;
          getReferenceById(playerID).range = 2; //Exit Sound

          getReferenceById(exitID).addSoundSource(magic_exit_ID);
          getReferenceById(room_1ID).live = true;
          break;

        case 3:
          var controls = new AGNavigation(38, 40, 37, 39, 67);
          var controlsID = getIdByReference(controls);
          that._controlsID = controlsID;
          setControl(getReferenceById(controlsID));
          var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
          var room_1ID = getIdByReference(room_1);
          g_gamearea.addRoom(room_1ID);
          var player = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var exit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var wallWestSmallRoom = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
          var wallNorthSmallRoom = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(5, 1, 1));
          var portalSmallRoom = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var wallSouthCorridor = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1, 0, 0), new Vector3(19, 1, 1));
          var wallLeftCorridor = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
          var wallRightCorridor = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
          var portalCorridorRoomFromSmallRoom = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var skeleton = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var portalCorridorToFinal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var portalFinalFromCorridor = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var wallFirstFinalRoom = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
          var wallSecondFinalRoom = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.6), new Vector3(1, 0, 0), new Vector3(1, 1, 3.34));
          var waterFall_1 = new AGObject("Waterfall1", new Vector3(8.7, 1, 0.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var waterFall_2 = new AGObject("Waterfall2", new Vector3(4.5, 1, 4.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var waterFall_3 = new AGObject("Waterfall3", new Vector3(8, 1, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var waterFall_4 = new AGObject("Waterfall4", new Vector3(11, 1, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
          var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
          var magic_1 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
          var magic_2 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
          var magic_3 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
          var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var waterfall_3 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var waterfall_4 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var playerID = getIdByReference(player);
          var exitID = getIdByReference(exit);
          var wallWestSmallRoomID = getIdByReference(wallWestSmallRoom);
          var wallNorthSmallRoomID = getIdByReference(wallNorthSmallRoom);
          var portalSmallRoomID = getIdByReference(portalSmallRoom);
          var wallSouthCorridorID = getIdByReference(wallSouthCorridor);
          var wallLeftCorridorID = getIdByReference(wallLeftCorridor);
          var wallRightCorridorID = getIdByReference(wallRightCorridor);
          var portalCorridorRoomFromSmallRoomID = getIdByReference(portalCorridorRoomFromSmallRoom);
          var skeletonID = getIdByReference(skeleton);
          var portalCorridorToFinalID = getIdByReference(portalCorridorToFinal);
          var portalFinalFromCorridorID = getIdByReference(portalFinalFromCorridor);
          var wallFirstFinalRoomID = getIdByReference(wallFirstFinalRoom);
          var wallSecondFinalRoomID = getIdByReference(wallSecondFinalRoom);
          var stepsID = getIdByReference(steps);
          var ouchID = getIdByReference(ouch);
          var magic_1ID = getIdByReference(magic_1);
          var magic_2ID = getIdByReference(magic_2);
          var magic_3ID = getIdByReference(magic_3);
          var waterfall_1ID = getIdByReference(waterfall_1);
          var waterfall_2ID = getIdByReference(waterfall_2);
          var waterfall_3ID = getIdByReference(waterfall_3);
          var waterfall_4ID = getIdByReference(waterfall_4);
          var waterFall_1ID = getIdByReference(waterFall_1);
          var waterFall_2ID = getIdByReference(waterFall_2);
          var waterFall_3ID = getIdByReference(waterFall_3);
          var waterFall_4ID = getIdByReference(waterFall_4);
          g_gamearea.listener = getIdByReference(player);
          getReferenceById(room_1ID).listener = getIdByReference(player); //Add ObjectsToRoom

          getReferenceById(room_1ID).add(playerID);
          getReferenceById(room_1ID).add(exitID);
          getReferenceById(room_1ID).add(wallWestSmallRoomID);
          getReferenceById(room_1ID).add(wallNorthSmallRoomID);
          getReferenceById(room_1ID).add(portalSmallRoomID);
          getReferenceById(room_1ID).add(wallSouthCorridorID);
          getReferenceById(room_1ID).add(wallLeftCorridorID);
          getReferenceById(room_1ID).add(wallRightCorridorID);
          getReferenceById(room_1ID).add(portalCorridorRoomFromSmallRoomID);
          getReferenceById(room_1ID).add(skeletonID);
          getReferenceById(room_1ID).add(portalCorridorToFinalID);
          getReferenceById(room_1ID).add(portalFinalFromCorridorID);
          getReferenceById(room_1ID).add(wallFirstFinalRoomID);
          getReferenceById(room_1ID).add(wallSecondFinalRoomID);
          getReferenceById(room_1ID).add(waterFall_1ID);
          getReferenceById(room_1ID).add(waterFall_2ID);
          getReferenceById(room_1ID).add(waterFall_3ID);
          getReferenceById(room_1ID).add(waterFall_4ID);
          getReferenceById(wallWestSmallRoomID).tag = "WALL";
          getReferenceById(wallNorthSmallRoomID).tag = "WALL";
          getReferenceById(wallSouthCorridorID).tag = "WALL";
          getReferenceById(wallLeftCorridorID).tag = "WALL";
          getReferenceById(wallRightCorridorID).tag = "WALL";
          getReferenceById(wallFirstFinalRoomID).tag = "WALL";
          getReferenceById(wallSecondFinalRoomID).tag = "WALL";
          getReferenceById(waterFall_1ID).tag = "BLA";
          getReferenceById(waterFall_2ID).tag = "BLA";
          getReferenceById(waterFall_3ID).tag = "BLA";
          getReferenceById(waterFall_4ID).tag = "BLA"; //Soundtags

          getReferenceById(stepsID).tag = "STEPS";
          getReferenceById(ouchID).tag = "OUCH";
          getReferenceById(magic_1ID).tag = "MAGIC";
          getReferenceById(magic_2ID).tag = "MAGIC";
          getReferenceById(magic_3ID).tag = "MAGIC";
          getReferenceById(waterfall_1ID).tag = "WATERFALL";
          getReferenceById(waterfall_2ID).tag = "WATERFALL";
          getReferenceById(waterfall_3ID).tag = "WATERFALL";
          getReferenceById(waterfall_4ID).tag = "WATERFALL"; //Skeleton

          getReferenceById(skeletonID).setSpeedSkalar(1);
          getReferenceById(skeletonID).movable = true;
          getReferenceById(skeletonID).destructible = true;
          getReferenceById(skeletonID).health = 4;
          getReferenceById(skeletonID).addRoute(new Vector3(12, 1, 0.5), new Vector3(12, 1, 2.5));
          getReferenceById(skeletonID).addSoundSource(stepsID);
          getReferenceById(skeletonID).tag = "ENEMY"; //Link Portals

          getReferenceById(portalSmallRoomID).linkPortals(portalCorridorRoomFromSmallRoomID);
          getReferenceById(portalCorridorToFinalID).linkPortals(portalFinalFromCorridorID); //Player Settings

          getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
          getReferenceById(playerID).hitSound = ouchID;
          getReferenceById(playerID).dangerous = true;
          getReferenceById(playerID).damage = 1;
          getReferenceById(playerID).range = 2; //Portal Sounds

          getReferenceById(portalSmallRoomID).addSoundSource(magic_1ID);
          getReferenceById(portalCorridorToFinalID).addSoundSource(magic_2ID); //Exit Sound

          getReferenceById(exitID).addSoundSource(magic_3ID); //Waterfall

          getReferenceById(waterFall_1ID).collidable = false;
          getReferenceById(waterFall_2ID).collidable = false;
          getReferenceById(waterFall_3ID).collidable = false;
          getReferenceById(waterFall_4ID).collidable = false;
          getReferenceById(waterFall_1ID).addSoundSource(waterfall_1ID);
          getReferenceById(waterFall_2ID).addSoundSource(waterfall_2ID);
          getReferenceById(waterFall_3ID).addSoundSource(waterfall_3ID);
          getReferenceById(waterFall_4ID).addSoundSource(waterfall_4ID);
          getReferenceById(room_1ID).live = true;
          break;

        case 4:
          var controls = new AGNavigation(38, 40, 37, 39, 67);
          var controlsID = getIdByReference(controls);
          that._controlsID = controlsID;
          setControl(getReferenceById(controlsID));
          var room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
          var room_1ID = getIdByReference(room_1);
          g_gamearea.addRoom(room_1ID);
          var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
          var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
          var wall1 = new AGObject("Wand oben 1", new Vector3(6.3, 1.0, 0.6), new Vector3(1, 0, 0), new Vector3(4.8, 1, 1.3));
          var wall2 = new AGObject("Wand oben 2", new Vector3(8.2, 1.0, 2.5), new Vector3(1, 0, 0), new Vector3(1, 1, 2.6));
          var wall3 = new AGPortal("Wand oben 3", new Vector3(12.8, 1.0, 0.3), new Vector3(1, 0, 0), new Vector3(8.2, 1, 0.5));
          var wall4 = new AGObject("Wand seitlich rechts", new Vector3(16.4, 1.0, 3.6), new Vector3(1, 0, 0), new Vector3(1, 1, 6.2));
          var wall5 = new AGObject("Wand unten 3", new Vector3(14.4, 1.0, 6.4), new Vector3(1, 0, 0), new Vector3(3, 1, 0.5));
          var wall6 = new AGObject("Wand unten 2", new Vector3(12.4, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(1, 1, 4.1));
          var wall7 = new AGObject("Wand unten 1", new Vector3(8.5, 1.0, 6.2), new Vector3(1, 0, 0), new Vector3(8.9, 1, 1.0));
          var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
          var fee = new AGObject("Fee", new Vector3(5.0, 1, 3.0), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
          var wall1_ID = wall1.ID;
          var wall2_ID = wall2.ID;
          var wall3_ID = wall3.ID;
          var wall4_ID = wall4.ID;
          var wall5_ID = wall5.ID;
          var wall6_ID = wall6.ID;
          var wall7_ID = wall7.ID;
          var waterfall1_ID = waterfall_1.ID;
          var fee_ID = fee.ID;
          var ouchID = getIdByReference(ouch);
          var playerID = getIdByReference(player);
          g_gamearea.listener = playerID;
          getReferenceById(room_1ID).listener = playerID; //Add ObjectsToRoom

          getReferenceById(room_1ID).add(playerID);
          getReferenceById(room_1ID).add(wall1_ID);
          getReferenceById(room_1ID).add(wall2_ID);
          getReferenceById(room_1ID).add(wall3_ID);
          getReferenceById(room_1ID).add(wall4_ID);
          getReferenceById(room_1ID).add(wall5_ID);
          getReferenceById(room_1ID).add(wall6_ID);
          getReferenceById(room_1ID).add(wall7_ID);
          getReferenceById(room_1ID).add(fee_ID);
          getReferenceById(waterfall1_ID).tag = "WATERFALL";
          getReferenceById(wall1_ID).tag = "WALL";
          getReferenceById(wall2_ID).tag = "WALL";
          getReferenceById(wall3_ID).tag = "WALL";
          getReferenceById(wall4_ID).tag = "WALL";
          getReferenceById(wall5_ID).tag = "WALL";
          getReferenceById(wall6_ID).tag = "WALL";
          getReferenceById(wall7_ID).tag = "WALL";
          getReferenceById(fee_ID).tag = "ENEMY"; //Player Settings

          getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
          getReferenceById(playerID).hitSound = ouchID;
          getReferenceById(playerID).dangerous = true;
          getReferenceById(playerID).damage = 1;
          getReferenceById(playerID).range = 2; //Fee

          getReferenceById(fee_ID).setSpeedSkalar(3);
          getReferenceById(fee_ID).movable = true;
          getReferenceById(fee_ID).runaway = true;
          getReferenceById(fee_ID).circle = false;
          getReferenceById(fee_ID).destructible = false;
          getReferenceById(fee_ID).collidable = false;
          getReferenceById(fee_ID).health = 4;
          getReferenceById(fee_ID).addRoute(new Vector3(5, 1, 3), new Vector3(6.7, 1, 4.8), new Vector3(11.42, 1, 4.84), new Vector3(9.33, 1, 2.71), new Vector3(11.17, 1, 0.95), new Vector3(15.4, 1, 0.93), new Vector3(13.55, 1, 3.11), new Vector3(15.27, 1, 4.78), new Vector3(14.38, 1, 5.51));
          getReferenceById(fee_ID).addSoundSource(waterfall1_ID);
          getReferenceById(fee_ID).tag = "ENEMY";
          getReferenceById(room_1ID).live = true;
          break;
      }

      this.renderScene();
    }
  }]);

  return IAudiCom;
}();

var g_loading = false;
var g_playing = false;
var g_references = new Map();
var g_eventHandler; // set by initializeEngine-function

var g_history; // set by initializeEngine-function

var g_gamearea; // set by initializeEngine-function

var g_controls;
var g_IAudiCom; // set in initialization call in index.html

/**
 * Sets the IAudiCom Interface that connects the GUI with the Engine. Global variable.
 * @param IAC The IAudiCom interface.
 */

function setIAudiCom(IAC) {
  g_IAudiCom = IAC;
}
function initializeEngine() {
  var initialized = false;

  if (g_history === undefined) {
    g_history = new AGSaLo();
    initialized = true;
  }

  if (g_eventHandler === undefined) {
    g_eventHandler = new AGEventHandler();
    initialized = true;
  }

  if (g_gamearea === undefined) {
    g_gamearea = new AGGameArea("Area", new Vector3(30, 2.5, 10));
    initialized = true;
  }

  if (initialized) {
    console.debug("[AGEngine] Initialized g_history, g_eventHandler and g_gamearea", g_history, g_eventHandler, g_gamearea);
  }

  return initialized;
}
function startAGEngine() {
  if (!initializeEngine()) {
    return;
  }

  var controls = new AGNavigation(38, 40, 37, 39, 67);
  var controlsID = getIdByReference(controls);
  setControl(getReferenceById(controlsID));
  var room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
  var room_1ID = getIdByReference(room_1);
  g_gamearea.addRoom(room_1ID);
  var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
  var playerID = getIdByReference(player);
  var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
  getReferenceById(room_1ID).add(playerID);
  g_gamearea.listener = playerID;
  getReferenceById(room_1ID).listener = playerID; //Player Settings

  getReferenceById(playerID).setSpeedSkalar(0.1); //getReferenceById(playerID).movable = true;

  getReferenceById(playerID).dangerous = true;
  getReferenceById(playerID).damage = 1;
  getReferenceById(playerID).range = 1;
  getReferenceById(playerID).interactionCooldown = 500;
  getReferenceById(playerID).hitSound = ouch.ID;
  getReferenceById(room_1ID).live = true; //play(area, true);

  console.log(g_history); //g_history.rebuild();
  //console.log(g_gamearea.AGRooms[0].AGobjects);
  //console.log(g_references);

  setIAudiCom(new IAudiCom());
}
/**
 * Sets the GameArea. Global variable.
 * @param gameArea The AGGameArea to be set.
 */

function setGameArea(gameArea) {
  if (g_gamearea) g_gamearea = gameArea;
}
/**
 * Sets the EventHandler. Global variable.
 * @param eventHandler The AGEventHandler to be set.
 */

function setEventHandler(eventHandler) {
  if (g_eventHandler) g_eventHandler = eventHandler;
}
/**
 * Deletes an Item from the inventories, events (including the events themselves), and from the reference list.
 * @param itemID The id of the AGItem to be removed.
 */

function deleteItem(itemID) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = g_references[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          k = _step$value[0],
          v = _step$value[1];

      if (v.constructor.name === "AGInventory") {
        v.removeItemById(itemID);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
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

function deleteCondition(conditionID) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = g_references[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2),
          k = _step2$value[0],
          v = _step2$value[1];

      if (v.constructor.name === "AGPortal") {
        v.deleteConditionById(conditionID);
      }
    } // g_references.delete(conditionID);

  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  console.log("[AGEngine] Deleted Condition ID " + conditionID + " from Objects and References Table.");
}
/**
 * Returns the ID of the AGObject, in which's inventory the item is.
 * @param itemID The ID of the AGItem.
 * @returns {number} Returns the ID of the AGObject.
 */

function getOwnerIdOfItemById(itemID) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = g_references[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _step3$value = _slicedToArray(_step3.value, 2),
          k = _step3$value[0],
          v = _step3$value[1];

      if (v.constructor.name === "AGInventory") {
        var item = v.searchItemById(itemID);

        if (item) {
          return v.attachedTo.ID;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
} //let resonanceAudioScene; //for first testings, maybe we will need something like AGRoom, where we can also put the resonance rooms into
//let AGGameArea = new AGGameArea("main", new Vector3(20,20,0)); //simulate something "static", probably (quite sure :p) not state of the art

/*
Game Area in which the audio game is played. It holds all audio game objects.
 */

/**
 * Creates a new EventHandler and GameArea, mainly for rebuilding the whole scene or creating a new one.
 */

function rebuildHandlerGameArea() {
  g_eventHandler = new AGEventHandler();
  g_gamearea = new AGGameArea("Area", new Vector3(30, 2.5, 10));
}
/**
 * Sets the Navigation to be a global variable.
 * @param controls The AGNavigation controls to be set as global variable.
 */

function setControl(controls) {
  g_controls = controls;
}
/**
 * Looks up the reference of the ID in the Reference-ID-Table and returns the object under the saved ID.
 * @param id ID where you want to retrieve the respective object from.
 * @returns {void|Object} Return the object or void.
 */

function getReferenceById(id) {
  return g_references.get(id);
}
/**
 * Looks up the ID of the reference in the Reference-ID-Table and returns the saved ID. Every object should have an ID as well which -- again-- should be the same as in the Reference-ID-Table
 * @param obj Object where you want to retrieve the respective ID from.
 * @returns {*} Returns the ID (number).
 */

function getIdByReference(obj) {
  return _toConsumableArray(g_references.entries()) // $FlowFixMe
  .filter(function (_ref) {
    var v = _ref[1];
    return v === obj;
  }).map(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 1),
        k = _ref3[0];

    return k;
  })[0]; //return Object.keys(g_references).find(key => g_references[key] === obj);
}
/**
 * Returns all IDs of a given Type (e.g., AGItem) from the references table.
 * @param type The type as string.
 * @returns {Array} Returns an array of found IDs.
 */

function getReferencesOfType(type) {
  var returnArr = [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = g_references[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _step4$value = _slicedToArray(_step4.value, 2),
          k = _step4$value[0],
          v = _step4$value[1];

      if (v.constructor.name === type) returnArr.push(k);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return returnArr;
}
/**
 * Public flag that should be set to true if the system loads or rebuilds a level. Disables the automated saving during loading.
 * @param bool True if the system is in loading state, false if not.
 */

function setLoading(bool) {
  g_loading = bool;
}
/*
const ConditionEnum = {
    None: 0,
    Moving: 1,
    Permanent: 2,
};*/

var request; //Update Loop

function animate(gameArea) {
  draw(gameArea);
  request = window.requestAnimationFrame(function () {
    animate(gameArea);
  });
} //Calling the gameArea for draw (update loop tick)


function draw(gameArea) {
  g_eventHandler.evaluateGlobalEvents();
  gameArea.draw();
}
/**
 * Starts and stops the game.
 * @param gameArea The AGGameArea the game is running in.
 * @param state Set to true, if the game should run, otherwise set to false.
 */


function play(gameArea, state) {
  g_playing = state;

  if (g_playing) {
    console.log("[AGEngine] Playing...");
    animate(gameArea);
  } else {
    console.log("[AGEngine] Stop Playing...");
    cancelAnimationFrame(request);
    stop(gameArea);
    unsolveRooms(gameArea);
  }
} //Stop game

function stop(gameArea) {
  gameArea.stop();
}
/**
 * Sets a room to be unsolved again, if it has been set to solved (e.g., player has reached the goal).
 * @param gameArea The AGGameArea the game is running in.
 */


function unsolveRooms(gameArea) {
  gameArea.unsolveRooms();
}
/**
 * Class which is responsible for saving and loading of levels.
 */


var AGSaLo =
/*#__PURE__*/
function () {
  _createClass(AGSaLo, [{
    key: "savedObjects",
    get: function get() {
      return this._savedObjects;
    }
  }]);

  function AGSaLo() {
    _classCallCheck(this, AGSaLo);

    this._savedObjects = [];
    this._classes = [];

    this._classes.push(AGEventHandler.prototype, AGGameArea.prototype, AGNavigation.prototype, AGRoom.prototype, AGPlayer.prototype, AGRoomExit.prototype, AGObject.prototype, AGSoundSource.prototype, AGPortal.prototype, Event.prototype, GlobalEvent.prototype, AGInventory.prototype, AGItem.prototype, AGCondition.prototype);
  }

  _createClass(AGSaLo, [{
    key: "ike",
    value: function ike(objID, func, fclass, args) {
      var _args = Array.prototype.slice.call(args);

      this._savedObjects.push(new SaLoCommand(objID, func, fclass, cloneArguments(_args)));
    }
  }, {
    key: "printLevel",
    value: function printLevel() {
      console.log(JSON.stringify(this._savedObjects));
    }
    /**
     * Saves a string to the browser's clipboard.
     * @param val The string that should be copied to the clipboard.
     */

  }, {
    key: "saveValueToClipboard",
    value: function saveValueToClipboard(val) {
      var dummy = document.createElement("textarea"); // to avoid breaking orgain page when copying more words
      // cant copy when adding below this code
      // dummy.style.display = 'none'

      if (document.body) document.body.appendChild(dummy); //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard

      dummy.value = val;
      dummy.select();
      document.execCommand("copy");
      if (document.body) document.body.removeChild(dummy);
    } //only works outside of the little firefox world

  }, {
    key: "loadLevelFromClipboard",
    value: function () {
      var _loadLevelFromClipboard = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var items, textBlob, text;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("[AGSaLo] Loading Level from Clipboard.");
                _context.next = 3;
                return navigator.clipboard.read();

              case 3:
                items = _context.sent;
                _context.next = 6;
                return items[0].getType("text/plain");

              case 6:
                textBlob = _context.sent;
                _context.next = 9;
                return new Response(textBlob).text();

              case 9:
                text = _context.sent;
                this.rebuild(text);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadLevelFromClipboard() {
        return _loadLevelFromClipboard.apply(this, arguments);
      }

      return loadLevelFromClipboard;
    }()
  }, {
    key: "saveLevelToClipboard",
    value: function saveLevelToClipboard() {
      console.log("[AGSaLo] Saving Level to Clipboard.");
      this.saveValueToClipboard(JSON.stringify(this._savedObjects));
    }
    /**
     * Rebuilds the game / level based on the provided string. Only accepts a string that has been created by the export function of the engine before.
     * @param lvl The game / level to be rebuilt.
     */

  }, {
    key: "rebuild",
    value: function rebuild(lvl) {
      //console.log(g_history);
      IncrementOneCounter.reset();

      if (!lvl) ; else {
        console.log("[AGSaLo] Reading ...");
        this._savedObjects = JSON.parse(lvl);
        console.log("[AGSaLo] Parsing complete!");
      } //this.printLevel();
      //console.log(parsedObject);


      console.log("[AGSaLo] Start rebuilding. Loading Toggle has been ENABLED.");
      setLoading(true);

      for (var i = 0; i < this._savedObjects.length; i++) {
        var obj = this._savedObjects[i]; //this._savedObjects
        //console.log(prepareForStringify(this._savedObjects));
        //obj.args

        var args = cloneArguments(obj._args); //prepare args (e.g., x,y,z -> Vector3)

        for (var _i = 0; _i < args.length; _i++) {
          var type = _typeof(args[_i]); //console.log("[AGSaLo] Conversion from Object to Vector3. Type: " + type.toString() + " arg " + args[i].toString());


          if (type === "object" && args[_i].x != null && args[_i].y != null && args[_i].z != null) {
            args[_i] = new Vector3(args[_i].x, args[_i].y, args[_i].z);
          }
        } //------------------------------------


        if (obj._func === obj._fclass) {
          //console.log(obj._func);
          var _constructor = getConstructor(obj._func, this._classes); //console.log(constructor);


          var newObject = Reflect.construct(_constructor, args); //TEMPORARY SOLUTION FOR EVENTHANDLER FIRST (NEEDED TO REFRESH global variables)

          if (i === 0) g_eventHandler = newObject;
          if (i === 1) g_gamearea = newObject;
        } else {
          var applyFunc = this.getFunction(obj._fclass, obj._func);
          if (applyFunc) applyFunc.apply(getReferenceById(obj._objID), args);
        }
      }

      setLoading(false);
      console.log("[AGSaLo] Rebuilding finished! Loading Toggle has been DISABLED.");
      console.log(this._savedObjects); //console.log(g_history);
      //this.saveLevel();
    }
    /**
     * Returns a Function depending on the provided classname and name of the function.
     * @param classname The class that entails the function.
     * @param funct The function name provided as string.
     * @returns {Function} The function found. Returns null if the function or the class does not exist.
     */

  }, {
    key: "getFunction",
    value: function getFunction(classname, funct) {
      var returnFunc = null;

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
          } //console.log(returnFunc);

        }
      });

      return returnFunc; //Object.getOwnPropertyDescriptor(((class) classname).prototype, funct)
    }
  }]);

  return AGSaLo;
}();
/**
 * Gets the constructor as function depending on the provided classname and name of the constructor.
 * @param classname The class that entails a constructor function.
 * @param obj An Array of classes.
 * @returns {null} Returns the Constructor found, otherwise null.
 */

function getConstructor(classname, obj) {
  var returnFunc = null;
  obj.forEach(function (item) {
    if (item.constructor.name === classname) returnFunc = item.constructor;
  });
  return returnFunc;
}
/**
 * Deep clones arguments and converts 3 part array back to Vector3.
 * @param args The arguments (args) provided by a function.
 * @returns {Object} Returns the new (converted) arugments array.
 */


function cloneArguments(args) {
  var arr = [];

  for (var i = 0; i < args.length; i++) {
    if (args[i] instanceof Vector3) {
      arr.push(new Vector3(args[i].x, args[i].y, args[i].z));
    } else {
      arr.push(args[i]);
    }
  }

  return arr;
}

var SaLoCommand =
/*#__PURE__*/
function () {
  _createClass(SaLoCommand, [{
    key: "objID",
    get: function get() {
      return this._objID;
    }
    /*get obj(): Object {
        return this._obj;
    }*/

  }, {
    key: "func",
    get: function get() {
      return this._func;
    }
  }, {
    key: "fclass",
    get: function get() {
      return this._fclass;
    }
  }, {
    key: "args",
    get: function get() {
      return this._args;
    }
    /*
    get context() {
        return this._context;
    }*/

  }]);

  //_context:Object;
  function SaLoCommand(objID, func, fclass, args) {
    _classCallCheck(this, SaLoCommand);

    this._func = func;
    this._args = args;
    this._objID = objID;
    this._fclass = fclass; //this._context = context;
  }

  return SaLoCommand;
}();

/**
 * Class for Conditions that must be fulfilled before an action can take place. (Very WIP)
 */

var AGCondition =
/*#__PURE__*/
function () {
  _createClass(AGCondition, [{
    key: "ID",
    //_amount:number;
    get: function get() {
      return this._ID;
    }
  }, {
    key: "conditionObject",
    get: function get() {
      return this._conditionObject;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'conditionObject').set.name, this.constructor.name, arguments);
      this._conditionObject = value;
    }
  }, {
    key: "funcOfConditionObject",
    get: function get() {
      return this._funcOfConditionObject;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcOfConditionObject').set.name, this.constructor.name, arguments);
      var f;

      switch (this._conditionObject) {
        case "INVENTORY":
          f = g_history.getFunction("AGInventory", value);
          break;
      }

      this._funcOfConditionObject = f;
    }
  }, {
    key: "funcArgs",
    get: function get() {
      return this._funcArgs;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'funcArgs').set.name, this.constructor.name, arguments);
      this._funcArgs = value;
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      // $FlowFixMe
      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'value').set.name, this.constructor.name, arguments);
      this._value = value;
    }
  }, {
    key: "object",
    get: function get() {
      return this._object;
    },
    set: function set(objectID) {
      var obj = getReferenceById(objectID); // $FlowFixMe

      if (!g_loading && !g_playing) g_history.ike(this._ID, Object.getOwnPropertyDescriptor(AGCondition.prototype, 'object').set.name, this.constructor.name, arguments);
      this._object = obj;
    }
  }]);

  function AGCondition(objectID, conditionObject, funcOfConditionObject, funcArgs, value) {
    _classCallCheck(this, AGCondition);

    this._ID = IncrementOneCounter.next();
    g_references.set(this._ID, this);
    if (!g_loading && !g_playing) g_history.ike(this._ID, this.constructor.name, this.constructor.name, arguments);
    this._object = getReferenceById(objectID);
    this._conditionObject = conditionObject; //this._amount = amount;

    var f;

    switch (conditionObject) {
      case "INVENTORY":
        f = g_history.getFunction("AGInventory", funcOfConditionObject);
        break;
    }

    this._funcOfConditionObject = f;
    this._funcArgs = funcArgs;
    this._value = value;
  }
  /**
   * Evaluates the Condition.
   * @returns {boolean} Returns true, if the condition is met, otherwise false.
   */


  _createClass(AGCondition, [{
    key: "evaluate",
    value: function evaluate() {
      switch (this._conditionObject) {
        case "INVENTORY":
          if (this._object.inventory) {
            if (this._funcOfConditionObject.apply(this._object.inventory, this._funcArgs) === this._value) {
              //console.log("[AGCondition] Condition [ID: " + this._ID + "] with Object [ID: " + this._object.ID + "] fulfilled.");
              return true;
            }
          }

      }

      return false;
    }
  }]);

  return AGCondition;
}();
/**
 * Evaluates all Conditions in an Array with AGConditions.
 * @param conditions An Array with AGConditions to be checked.
 * @returns {boolean} Returns true, if all conditions are met, otherwise false.
 */

function evaluateAll(conditions) {
  for (var i = 0; i < conditions.length; i++) {
    if (!conditions[i].evaluate()) return false;
  }

  return true;
}

export { AGCondition, AGEventHandler, AGGameArea, AGInventory, AGItem, AGNavigation, AGObject, AGPlayer, AGPortal, AGRoom, AGRoomExit, AGSaLo, AGSoundSource, Collision, Event, GlobalEvent, IncrementOneCounter, SaLoCommand, colliding, collisionIsInArray, deleteCondition, deleteItem, evaluateAll, frbIntersectionPoint, g_IAudiCom, g_controls, g_eventHandler, g_gamearea, g_history, g_loading, g_playing, g_references, getIdByReference, getOwnerIdOfItemById, getReferenceById, getReferencesOfType, hitBoundingBox, isAABBInsideAABB, isAABBInsideRoom, isPointInsideAABB, move, objectPartOfCollisions, play, rebuildHandlerGameArea, setControl, setEventHandler, setGameArea, setIAudiCom, setLoading, startAGEngine };
