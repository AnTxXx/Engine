// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";
import {Counter} from "./IDGenerator.js";
import {objectPartOfCollisions} from "./Collision.js";
import {g_references} from "./AGEngine.js";
import {g_history, g_loading} from "./AGEngine.js";
import {isPointInsideAABB} from "./AGPhysics.js";
import {Plane} from "./js/three/Plane.js";

let gForward, gBackward, gLeft, gRight, gInteract;

//let moveTimestamp;

/**
 * Function to move object (AGObject) based on its direction and speed. If the movement is not possible
 * (e.g., collision), the object does not move.
 * @param object Object (AGObject) to be moved.
 * @param add If the object should move forward (true) or backward (false).
 */
//OLD
/*export function move(object:AGObject, add:boolean){

    let collisionArray:Array<AGObject>;
    if(add){
        //console.log("Prediction:");
        //console.log(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())));

        //calculate the point where the object should be moved to
        let testPoint:Vector3 = object.position.clone().add(object.speed.clone().multiply(object.direction.clone()));

        //get a collision-array of all objects that intersect with the calculated new position of the object
        collisionArray = object.room.predictCollisionByPointAndSize(testPoint, object.size);

        //checks if there is no collision happening and the object doesn't collide with itself
        if((collisionArray.length !== 0 && collisionArray[0].type !== "PORTAL" && object !== collisionArray[0])){
            console.log("[AGNavigation] " + object.name + ": Can't move forward. Blocked by other object: " + collisionArray[0].name + ".");
        } else
            //checks if the new point is still inside the room
            if(!object.room.pointInsideRoom(testPoint, object.size)){
            console.log("[AGNavigation] " + object.name + ": Can't move forward. Blocked by room boundaries.");
        }
        else {
            object.position.add(object.speed.clone().multiply(object.direction.clone()));
        }
    } else {
        //same as above but with .sub

        //console.log("Prediction:");
        //console.log(object.position.clone().sub(object.speed.clone().multiply(object.direction.clone())));
        let testPoint:Vector3 = object.position.clone().sub(object.speed.clone().multiply(object.direction.clone()));
        collisionArray = object.room.predictCollisionByPointAndSize(testPoint, object.size);
        if((collisionArray.length !== 0 && collisionArray[0].type !== "PORTAL" && object !== collisionArray[0])){
            console.log("[AGNavigation] " + object.name + ": Can't move Backward. Blocked by other object: " + collisionArray[0].name + ".");
        } else if(!object.room.pointInsideRoom(testPoint, object.size)){
            console.log("[AGNavigation] " + object.name + ": Can't move Backward. Blocked by room boundaries.");
        }
        else {
            object.position.sub(object.speed.clone().multiply(object.direction.clone()));
        }
    }
}*/

/**
 * Private function: if a collision is allowed (e.g., collision with portal) or not.
 * @param obj The object (AGObject) to be checked with.
 * @param collArray The array of AGObjects with the current collisions.
 * @returns {boolean} Returns true if collision is allowed, otherwise false.
 */
function allowedCollision(obj:AGObject, collArray:Array<AGObject>):boolean{
    for(let i = 0; i < collArray.length; i++){
        if(obj !== collArray[i] && collArray[i].type !== "PORTAL") {
            //console.log("[AGNavigation] " + obj.name + ": Condition failed at object " + collArray[i].name + ".");
            return false;
        }
    }
    return true;
}

/**
 * Moves an object (AGObject) into a give direction (Vector3), independent of its current facing direction
 * @param object The object (AGObject) that is going to be moved.
 * @param direction The direction (Vector3) the object is moved towards.
 */
/*export function moveTo(object:AGObject, direction:Vector3, timeStamp:Date){
    let timeDiff = new Date() - timeStamp;
    timeDiff /= 1000;
    //Math.abs(timeDiff);

    let collisionArray:Array<AGObject>;
    //console.log("Prediction:");
    //console.log(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())));
    let testPoint:Vector3 = object.position.clone().add(object.speed.clone().multiply(direction.clone().multiplyScalar(timeDiff)));
    collisionArray = object.room.predictCollisionByPointAndSize(testPoint, object.size);

    if(allowedCollision(object, collisionArray)){
        //console.log("moving");
        object.position.add(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
    } else {
        console.log("[AGNavigation] " + object.name + ": Can't move forward.");
    }

    //console.log(object.position.x + " " + object.position.y + " " + object.position.z +
    //    " " + direction.x + " " + direction.y + " " + direction.z);
}*/

//new moveTo function that forces collision and does not stop before it without triggering collision
export function move(object:AGObject, direction:Vector3, timeStamp?:Date){
    let timeDiff;
    if(timeStamp!==undefined){
        timeDiff = new Date() - timeStamp;
        timeDiff /= 1000;
    } else {
        timeDiff = 1;
    }

    //Math.abs(timeDiff);

    object.position.add(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
    object.room.checkForCollision();

    /*if(!allowedCollision(object, objectPartOfCollisions(object.room.collisions, object)) ||
        !object.room.pointInsideRoom(object.position, object.size)){
        object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
        console.log("[AGNavigation] " + object.name + ": Can't move forward.");
    }*/

    let PoC:Array<AGObject> = objectPartOfCollisions(object.room.collisions, object);

    if(!allowedCollision(object, PoC)) {
        console.log("[AGNavigation] " + object.name + ": Can't move forward. Colliding with other object.");
        //TODO: HIER WEITER MACHEN
        // TEST
        planeIntersectPlane(PoC, object);
        //
        pointOfIntersection(PoC, object);
        object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
    } else if(!object.room.pointInsideRoom(object.position, object.size)){
        console.log("[AGNavigation] " + object.name + ": Can't move forward. Colliding with room boundaries.");
        object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
    }

    /*if(object.gameArea.objectPartOfCollision(object)!=null){
        object.position.add(object.speed.clone().multiply(-direction));
        console.log("Can't move forward. Blocked. " + object.position.x + " " + object.position.y + " " + object.position.z);
    }*/
    //console.log(object.position.x + " " + object.position.y + " " + object.position.z +
    //    " " + direction.x + " " + direction.y + " " + direction.z);
}

function pointOfIntersection(PoC_arr:Array<AGObject>, obj:AGObject){
    let point:Vector3;
    for(let i = -1; i <= 1; i+=2){
        for(let j = -1; j <= 1; j+=2){
            for(let k = -1; k <= 1; k+=2){
                point = new Vector3(obj.position.x-(obj.size.x/2)*(i), obj.position.y-(obj.size.y/2)*(j), obj.position.z-(obj.size.z/2)*(k));
                if(isPointInsideAABB(point, PoC_arr[0])){
                    console.log("[AGNavigation] " + obj.name + ": Playing sound at position: " + point.x + " " + point.y + " " + point.z);
                }
            }
        }
    }
}
//https://stackoverflow.com/questions/6408670/line-of-intersection-between-two-planes
function planeIntersectPlane(PoC_arr:Array<AGObject>, obj:AGObject){
    let r_points:Array<Vector3> = [], r_normals:Array<Vector3> = [];
    let plane1_arr:Array<Plane> = calculatePlanesCCW(PoC_arr[0]);
    let plane2_arr:Array<Plane> = calculatePlanesCCW(obj);

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
                    r_points.push(vToPush);
                    r_normals.push(p3_normal);
                }
            } else {
                console.log("nah");
            }

        }
    }

    console.log(r_points);
    console.log(r_normals);
}

function pointInsideSphere(point:Vector3, obj:AGObject):boolean{
    //console.log((point.clone().distanceTo(obj.position.clone())));
    if((point.clone().distanceTo(obj.position.clone())) <= (obj.position.clone().add(obj.size)).clone().distanceTo(obj.position)) return true;
    return false;
}

function calculatePlanesCCW(obj:AGObject):Array<AGObject> {
    let return_arr:Array<AGObject> = [];

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

function extractPlanePoint(obj:AGObject, x:number, y:number, z:number):Vector3{
    return new Vector3(obj.position.x+(obj.size.x/2*x), obj.position.y+(obj.size.x/2*y), obj.position.z+(obj.size.z/2*z));
}

/**
 * Class that is responsible for the movement buttons of the respective object.
 */
export class AGNavigation {

    _ID:number;

    get ID() {
        return this._ID;
    }

    /**
     *
     * @param forward Keycode for forward-movement.
     * @param backward Keycode for backward-movement.
     * @param left Keycode for left-turn.
     * @param right Keycode for right-turn.
     */
    constructor(forward:number, backward:number, left:number, right:number, interact:number){
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        console.log("[AGNavigation] Creating AGNavigation object [ID: " + this._ID + "].");
        gForward = forward;
        gBackward = backward;
        gLeft = left;
        gRight = right;
        gInteract = interact;

        if(!g_loading) g_history.ike(this._ID, this.constructor, arguments);
        //moveTimestamp = new Date(0);
    }

    /**
     * draw-loop
     * @param player Object (AGObject) which can be moved by the player.
     */
    draw(player:AGObject){
        //if(moveTimestamp.getTime() === new Date(0).getTime()) moveTimestamp = new Date();
        window.onkeydown = function(e) {
            switch(e.keyCode){
                case gForward:
                    //move(player, true);
                    move(player, player.direction);
                    break;
                case gBackward:
                    //move(player, false);
                    move(player, player.direction.clone().multiplyScalar(-1));
                    break;
                case gLeft:
                    player.direction.applyAxisAngle(new Vector3(0,1,0), 8 * (Math.PI / 180));
                    break;
                case gRight:
                    player.direction.applyAxisAngle(new Vector3(0,1,0), -8 * (Math.PI / 180));
                    break;
                case gInteract:
                    player.interact();
                    break;
            }
           // moveTimestamp = new Date();
            //console.log("Position: " + player.position.x + " " + player.position.y + " " + player.position.z);
            //console.log("Direction: " + player.direction.x + " " + player.direction.y + " " + player.direction.z);
        }

    }
}