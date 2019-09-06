import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { Counter } from "./IDGenerator.js";
import { objectPartOfCollisions } from "./Collision.js";
import { g_references } from "./AGEngine.js";
import { g_history, g_loading, g_IAudiCom } from "./AGEngine.js";
import { isPointInsideAABB, frbIntersectionPoint } from "./AGPhysics.js";
import { Plane } from "./js/three/Plane.js";

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
function allowedCollision(obj, collArray) {
    for (let i = 0; i < collArray.length; i++) {
        if (obj !== collArray[i] && collArray[i].type !== "PORTAL") {
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
export function move(object, direction, timeStamp) {
    let timeDiff;
    if (timeStamp !== undefined) {
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

    let PoC = objectPartOfCollisions(object.room.collisions, object);

    if (!allowedCollision(object, PoC)) {
        console.log("[AGNavigation] " + object.name + ": Can't move forward. Colliding with other object.");
        //TODO: HIER WEITER MACHEN
        // TEST
        //planeIntersectPlane(PoC, object);
        //
        //pointOfIntersection(PoC, object);


        object.position.sub(object.speed.clone().multiply(direction).clone().multiplyScalar(timeDiff));
        pointOfIntersectionForSound(PoC[0], object);
    } else if (!object.room.pointInsideRoom(object.position, object.size)) {
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

function pointOfIntersectionForSound(collisionObject, object) {
    let p1, p2, p3, p4;

    //get the 8 corners of the cube
    let p1TOP = extractPlanePoint(object, -1, +1, -1);
    let p1BOTTOM = extractPlanePoint(object, -1, -1, -1);

    let p2TOP = extractPlanePoint(object, +1, +1, -1);
    let p2BOTTOM = extractPlanePoint(object, +1, -1, -1);

    let p3TOP = extractPlanePoint(object, -1, +1, +1);
    let p3BOTTOM = extractPlanePoint(object, -1, -1, +1);

    let p4TOP = extractPlanePoint(object, +1, +1, +1);
    let p4BOTTOM = extractPlanePoint(object, +1, -1, 1);

    //middle it to 4
    p1 = p1TOP.clone().sub(p1TOP.clone().sub(p1BOTTOM).clone().multiplyScalar(0.5));
    p2 = p2TOP.clone().sub(p2TOP.clone().sub(p2BOTTOM).clone().multiplyScalar(0.5));
    p3 = p3TOP.clone().sub(p3TOP.clone().sub(p3BOTTOM).clone().multiplyScalar(0.5));
    p4 = p4TOP.clone().sub(p4TOP.clone().sub(p4BOTTOM).clone().multiplyScalar(0.5));

    console.log(getAngle(object.direction));
    object.direction.normalize();

    p1 = rotateAroundPoint(object.position, p1, getAngle(object.direction));
    p2 = rotateAroundPoint(object.position, p2, getAngle(object.direction));
    p3 = rotateAroundPoint(object.position, p3, getAngle(object.direction));
    p4 = rotateAroundPoint(object.position, p4, getAngle(object.direction));

    //p1.add(object.direction);
    //p2.add(object.direction);
    //p3.add(object.direction);
    //p4.add(object.direction);


    let points = [];
    points.push(p2);
    points.push(p3);
    points.push(p4);
    points.push(p1);

    //build directions between points
    let dirs = [];
    dirs.push(p1.clone().sub(p2).normalize());
    dirs.push(p2.clone().sub(p3).normalize());
    dirs.push(p3.clone().sub(p4).normalize());
    dirs.push(p4.clone().sub(p1).normalize());
    //dirs.push(p1.clone().sub(p4).normalize());
    //dirs.push(p4.clone().sub(p3).normalize());
    //dirs.push(p3.clone().sub(p2).normalize());
    //dirs.push(p2.clone().sub(p1).normalize());

    //shoot the rays to object
    let intersectPoints = [];

    let smallest = null;
    let smallestDist = Number.MAX_VALUE;
    let dist = 0;

    let pairDistancePoint = [];

    for (let i = 0; i < 4; i++) {
        let dist = extractPointToArray(collisionObject, points[i], dirs[i], intersectPoints);
        if (dist !== undefined || dist !== 0) {
            pairDistancePoint.push([dist, intersectPoints[intersectPoints.length - 1]]);
            if (pairDistancePoint[pairDistancePoint.length - 1][0] < smallestDist) {
                smallestDist = pairDistancePoint[pairDistancePoint.length - 1][0];
                smallest = pairDistancePoint[pairDistancePoint.length - 1][1];
            }
        }
    }

    //console.log(pairDistancePoint);

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

    if (g_IAudiCom) g_IAudiCom.deleteDots();

    //console.log(intersectPoints);

    //for(let i = 0; i < intersectPoints.length; i++){

    if (g_IAudiCom && smallest != null) {
        //console.log(intersectPoints[i].distanceTo(object.position));
        g_IAudiCom.drawDot(smallest.x, smallest.z);
        if (object.type === "PLAYER") object.hitSound.playOnceAtPosition(smallest);
        /*
        for(let i = 0; i < 4; i++){
            g_IAudiCom.drawDot(points[i].x, points[i].z);
        }*/
    }
    //}
}

function getAngle(dir) {
    let angle = Math.atan2(dir.x, dir.z);
    let degrees = 180 * angle / Math.PI;
    return (180 + Math.round(degrees)) % 360;
}

function rotateAroundPoint(center, point, angle) {
    let radians = Math.PI / 180 * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = cos * (point.x - center.x) + sin * (point.z - center.z) + center.x,
        nz = cos * (point.z - center.z) - sin * (point.x - center.x) + center.z;
    return new Vector3(nx, point.y, nz);
}

function extractPointToArray(collisionObject, point, dir, arrToAdd) {
    let pt = frbIntersectionPoint(collisionObject, point, dir);
    if (pt !== null) {
        arrToAdd.push(pt);
        return point.distanceTo(pt);
    }
    return 0;
}

function pointOfIntersection(PoC_arr, obj) {
    let point;
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -1; k <= 1; k += 2) {
                point = new Vector3(obj.position.x - obj.size.x / 2 * i, obj.position.y - obj.size.y / 2 * j, obj.position.z - obj.size.z / 2 * k);
                if (isPointInsideAABB(point, PoC_arr[0])) {
                    console.log("[AGNavigation] " + obj.name + ": Playing sound at position: " + point.x + " " + point.y + " " + point.z);
                }
            }
        }
    }
}
//https://stackoverflow.com/questions/6408670/line-of-intersection-between-two-planes
function planeIntersectPlane(PoC_arr, obj) {
    let r_points = [],
        r_normals = [];
    let plane1_arr = calculatePlanesCCW(PoC_arr[0]);
    let plane2_arr = calculatePlanesCCW(obj);

    if (g_IAudiCom) g_IAudiCom.deleteDots();

    for (let i = 0; i < plane1_arr.length; i++) {
        for (let j = 0; j < plane2_arr.length; j++) {
            let plane1 = plane1_arr[i];
            let plane2 = plane2_arr[j];

            let p3_normal = new Vector3();
            p3_normal.crossVectors(plane1.normal, plane2.normal);
            const det = p3_normal.lengthSq();

            //console.log(p3_normal.clone().cross(plane2.normal).clone().multiplyScalar(plane1.constant).clone().add(plane1.clone().normal.cross(p3_normal).clone().multiplyScalar(plane2.constant)));
            if (det !== 0.0) {
                let vToPush = p3_normal.clone().cross(plane2.normal).clone().multiplyScalar(plane1.constant).add(plane1.clone().normal.cross(p3_normal).clone().multiplyScalar(plane2.constant)).clone().divideScalar(det);
                if (pointInsideSphere(vToPush, obj)) {
                    if (g_IAudiCom) {
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

function pointInsideSphere(point, obj) {
    //console.log((point.clone().distanceTo(obj.position.clone())));
    if (point.clone().distanceTo(obj.position.clone()) <= obj.position.clone().add(obj.size).clone().distanceTo(obj.position)) return true;
    return false;
}

function calculatePlanesCCW(obj) {
    let return_arr = [];

    let plane_a = new Plane();
    let plane_b = new Plane();
    let plane_c = new Plane();
    let plane_d = new Plane();
    let plane_e = new Plane();
    let plane_f = new Plane();
    let v1, v2, v3;

    v1 = extractPlanePoint(obj, -1, +1, -1);
    v2 = extractPlanePoint(obj, -1, -1, -1);
    v3 = extractPlanePoint(obj, +1, -1, -1);
    plane_a.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    console.log(plane_a);
    return_arr.push(plane_a);

    v1 = extractPlanePoint(obj, +1, +1, -1);
    v2 = extractPlanePoint(obj, +1, -1, -1);
    v3 = extractPlanePoint(obj, +1, -1, +1);
    plane_b.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_b);

    v1 = extractPlanePoint(obj, -1, +1, +1);
    v2 = extractPlanePoint(obj, -1, +1, -1);
    v3 = extractPlanePoint(obj, +1, +1, -1);
    plane_c.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_c);

    v1 = extractPlanePoint(obj, +1, +1, +1);
    v2 = extractPlanePoint(obj, +1, -1, +1);
    v3 = extractPlanePoint(obj, -1, -1, +1);
    plane_d.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_d);

    v1 = extractPlanePoint(obj, -1, +1, +1);
    v2 = extractPlanePoint(obj, -1, -1, +1);
    v3 = extractPlanePoint(obj, -1, -1, -1);
    plane_e.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_e);

    v1 = extractPlanePoint(obj, +1, -1, +1);
    v2 = extractPlanePoint(obj, +1, -1, -1);
    v3 = extractPlanePoint(obj, -1, -1, -1);
    plane_f.setFromCoplanarPoints(v1.clone(), v2.clone(), v3.clone());
    return_arr.push(plane_f);

    return return_arr;
}

function extractPlanePoint(obj, x, y, z) {
    let returnV = new Vector3(obj.position.x + obj.size.x / 2 * x, obj.position.y + obj.size.x / 2 * y, obj.position.z + obj.size.z / 2 * z);
    return returnV;
}

/**
 * Class that is responsible for the movement buttons of the respective object.
 */
export class AGNavigation {

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
    constructor(forward, backward, left, right, interact) {
        this._ID = Counter.next();
        g_references.set(this._ID, this);
        console.log("[AGNavigation] Creating AGNavigation object [ID: " + this._ID + "].");
        gForward = forward;
        gBackward = backward;
        gLeft = left;
        gRight = right;
        gInteract = interact;

        if (!g_loading) g_history.ike(this._ID, this.constructor, arguments);
        //moveTimestamp = new Date(0);
    }

    /**
     * draw-loop
     * @param player Object (AGObject) which can be moved by the player.
     */
    draw(player) {
        //if(moveTimestamp.getTime() === new Date(0).getTime()) moveTimestamp = new Date();
        window.onkeydown = function (e) {
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
            }
            // moveTimestamp = new Date();
            //console.log("Position: " + player.position.x + " " + player.position.y + " " + player.position.z);
            //console.log("Direction: " + player.direction.x + " " + player.direction.y + " " + player.direction.z);
        };
    }
}