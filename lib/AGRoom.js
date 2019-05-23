import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { isAABBInsideAABB, isPointInsideAABB, colliding, isAABBInsideRoom } from "./AGPhysics.js";

import { Collision, collisionIsInArray } from "./Collision.js";
import { AGGameArea } from "./AGGameArea.js";
import { Counter } from "./IDGenerator.js";

let debug = 0;

/**
 * AGRoom is a physically separated room of a game scene (e.g., level or floor). It follows resonance audio's room idea.
 */
export class AGRoom {
    get collisions() {
        return this._collisions;
    }

    set collisions(value) {
        this._collisions = value;
    }

    get ID() {
        return this._ID;
    }

    get live() {
        return this._live;
    }

    set live(value) {
        this._live = value;
    }
    get positionOnGameArea() {
        return this._positionOnGameArea;
    }

    set positionOnGameArea(value) {
        this._positionOnGameArea = value;
    }

    get gameArea() {
        return this._gameArea;
    }

    set gameArea(value) {
        this._gameArea = value;
    }
    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
    }
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
    get listener() {
        return this._listener;
    }

    set listener(value) {
        this._listener = value;
    }
    get audioContext() {
        return this._audioContext;
    }
    get resonanceAudioScene() {
        return this._resonanceAudioScene;
    }
    // $FlowFixMe
    set resonanceAudioScene(value) {
        this._resonanceAudioScene = value;
    }

    // $FlowFixMe

    // $FlowFixMe


    get AGobjects() {
        return this._AGobjects;
    }


    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    /**
     *
     * @param name The name of the room.
     * @param size The size of the room as Vector3.
     * @param positionOnGrid The position of the room in the overall grid (the game 'map').
     * @param gameArea The AGGameArea this room is part of.
     */
    constructor(name, size, positionOnGrid, gameArea) {
        this._ID = Counter.next();
        console.log("[AGRoom] Creating AGRoom object [ID: " + this._ID + "]: " + name + ".");
        this._positionOnGameArea = positionOnGrid;
        this._gameArea = gameArea;
        this._live = false;
        // Create an AudioContext
        this._audioContext = gameArea.audioContext;
        // Create a (first-order Ambisonic) Resonance Audio scene and pass it
        // the AudioContext.
        // $FlowFixMe
        this._resonanceAudioScene = gameArea.resonanceAudioScene;

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
    }

    /**
     * Adds a AGObject to the room (and will therefore be considered with every draw loop)
     * @param gameObject The AGObject to add.
     */
    add(gameObject) {
        if (!this._AGobjects) {
            this._AGobjects = [];
        }
        this._AGobjects.push(gameObject);
        gameObject.room = this;
    }

    /**
     * Add a collision to the room Collision array.
     * @param obj1 The first object that is involved in a collision.
     * @param obj2 The second object that is involved in a collision.
     */
    addCollision(obj1, obj2) {
        this._collisions.push(new Collision(obj1, obj2));
    }

    /*objectPartOfCollision(obj:AGObject):?AGObject {
        return objectPartOfCollision(this._collisions, obj);
    }*/

    /**
     * Checks if a collision is happening in the respective room. If yes, it will be added to the local room collision array.
     */
    checkForCollision() {
        //Collision?
        for (let i = 0, len = this._AGobjects.length; i < len; i++) {
            for (let j = 0; j < len; j++) {
                if (i === j) continue;else {
                    if (this._AGobjects[i].collidable && this._AGobjects[j].collidable) {
                        if (colliding(this._AGobjects[i], this._AGobjects[j])) {
                            if (collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j])) === -1) {
                                //console.log("[AGRoom] " + this.name + ": Collision between " + this._AGobjects[i].name + " and " + this._AGobjects[j].name);
                                this._AGobjects[i].onCollisionEnter(this._AGobjects[j]);
                                this.addCollision(this._AGobjects[i], this._AGobjects[j]);
                            }
                        } else {
                            let index = collisionIsInArray(this._collisions, new Collision(this._AGobjects[i], this._AGobjects[j]));
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

    predictCollisionByPoint(position) {
        let collisionArray = [];
        for (let i = 0, len = this._AGobjects.length; i < len; i++) {
            if (isPointInsideAABB(position, this._AGobjects[i])) collisionArray.push(this._AGobjects[i]);
        }
        return collisionArray;
    }

    /**
     * Cross AABB check if two objects intersect. Returns an array of collisions.
     * @param position Position (Vector3) of the object.
     * @param size Size (Vector3) of the object.
     * @returns {Array<AGObject>} An Array of AGObjects that intersect with the position and size of the object given.
     */
    predictCollisionByPointAndSize(position, size) {
        let collisionArray = [];
        for (let i = 0, len = this._AGobjects.length; i < len; i++) {
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
    pointInsideRoom(position, size) {
        return isAABBInsideRoom(position, size, this);
    }

    /**
     * draw-loop
     */
    draw() {
        if (this._lastTime.getTime() === new Date(0).getTime()) this._lastTime = new Date();
        //console.log(this._lastTime);
        //All objects draw
        for (let i = 0; i < this._AGobjects.length; i++) {
            this._AGobjects[i].draw(this._lastTime);
            if (debug) console.log("draw on element: " + this._AGobjects[i].name);
        }

        this.checkForCollision();

        this._resonanceAudioScene.setListenerPosition(this._listener.position.x - this.size.x / 2, this._listener.position.y - this.size.y / 2, this._listener.position.z - this.size.z / 2);

        this._resonanceAudioScene.setListenerOrientation(this._listener.direction.x, this._listener.direction.y, this._listener.direction.z, 0, 1, 0);

        this._lastTime = new Date();
    }

    /**
     * Iteratively goes through all objects stored in AGobjects and calls their respective stop. Clears collision array too.
     */
    stop() {
        this._collisions = [];
        this._AGobjects.forEach(function (element) {
            element.stop();
            if (debug) console.log("stop on element: " + element.name);
        });
    }

}