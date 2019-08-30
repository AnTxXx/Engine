import { AGObject } from "./AGObject.js";
import { Vector3 } from "./js/three/Vector3.js";
import { AGRoom } from "./AGRoom.js";

/**
 * Checks if two objects (AGObject) are currently colliding. AABBxAABB testing
 * @param obj1 The first object (AGObject).
 * @param obj2 The second object (AGObject).
 * @returns {boolean} Returns true if the two objects are colliding, otherwise false.
 */
export function colliding(obj1, obj2) {
    /*console.log((obj1.position.x-obj1.size.x/2 <= obj2.position.x+obj2.size.x/2 &&
        obj1.position.x+obj1.size.x/2 >= obj2.position.x-obj2.size.x/2) + " // " + (obj1.position.y-obj1.size.y/2 <= obj2.position.y+obj2.size.y/2 &&
        obj1.position.y+obj1.size.y/2 >= obj2.position.y-obj2.size.y/2) + " // " + (obj1.position.z-obj1.size.z/2 <= obj2.position.z+obj2.size.z/2 &&
        obj1.position.z+obj1.size.z/2 >= obj2.position.z-obj2.size.z/2));*/
    return obj1.position.x - obj1.size.x / 2 <= obj2.position.x + obj2.size.x / 2 && obj1.position.x + obj1.size.x / 2 >= obj2.position.x - obj2.size.x / 2 && obj1.position.y - obj1.size.y / 2 <= obj2.position.y + obj2.size.y / 2 && obj1.position.y + obj1.size.y / 2 >= obj2.position.y - obj2.size.y / 2 && obj1.position.z - obj1.size.z / 2 <= obj2.position.z + obj2.size.z / 2 && obj1.position.z + obj1.size.z / 2 >= obj2.position.z - obj2.size.z / 2;
}

/**
 * Checks if a point (without size!) is inside an object.
 * @param point The point (Vector3) to be checked.
 * @param obj The object (AGObject) in which the point is to be suspected.
 * @returns {boolean} Returns true, if the point is inside the object. Otherwise false.
 */
export function isPointInsideAABB(point, obj) {
    return point.x >= obj.position.x - obj.size.x / 2 && point.x <= obj.position.x + obj.size.x / 2 && point.y >= obj.position.y - obj.size.y / 2 && point.y <= obj.position.y + obj.size.y / 2 && point.z >= obj.position.z - obj.size.z / 2 && point.z <= obj.position.z + obj.size.z / 2;
}

/**
 * Checks if a point with a size is inside a given object.
 * @param point The point (Vector3) to be checked.
 * @param size The size(Vector3) of the point.
 * @param obj The object (AGObject) in which the point with size is to be suspected.
 * @returns {boolean} Returns true, if the point with size is inside the object. Otherwise false.
 */
export function isAABBInsideAABB(point, size, obj) {
    return point.x - size.x / 2 <= obj.position.x + obj.size.x / 2 && point.x + size.x / 2 >= obj.position.x - obj.size.x / 2 && point.y - size.y / 2 <= obj.position.y + obj.size.y / 2 && point.y + size.y / 2 >= obj.position.y - obj.size.y / 2 && point.z - size.z / 2 <= obj.position.z + obj.size.z / 2 && point.z + size.z / 2 >= obj.position.z - obj.size.z / 2;
}

/**
 * Checks if a point with a size is inside a given room.
 * @param point The point (Vector3) to be checked.
 * @param size The size(Vector3) of the point.
 * @param obj The room (AGRoom) in which the point with size is to be suspected.
 * @returns {boolean} Returns true, if the point with size is inside the room. Otherwise false.
 */
export function isAABBInsideRoom(point, size, room) {
    return point.x - size.x / 2 >= 0.0 && point.x + size.x / 2 <= room.size.x && point.y - size.y / 2 >= 0.0 && point.y + size.y / 2 <= room.size.y && point.z - size.z / 2 >= 0.0 && point.z + size.z / 2 <= room.size.z;
}

export function frbIntersectionPoint(target, source, direction) {
    let v_minB = new Vector3(target.position.x - target.size.x / 2, target.position.y - target.size.y / 2, target.position.z - target.size.z / 2);
    let v_maxB = new Vector3(target.position.x + target.size.x / 2, target.position.y + target.size.y / 2, target.position.z + target.size.z / 2);

    let v_origin = source;
    let v_direction = direction;

    let NUMDIM = 3,
        RIGHT = 0,
        LEFT = 1,
        MIDDLE = 2;
    let minB = [0, 0, 0],
        maxB = [0, 0, 0]; /*box*/
    let origin = [0, 0, 0],
        dir = [0, 0, 0]; /*ray*/
    let coord = [0, 0, 0]; /* hit point */

    let inside = true;
    let quadrant = [0, 0, 0];
    let i;
    let whichPlane;
    let maxT = [0, 0, 0];
    let candidatePlane = [0, 0, 0];

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
    for (i = 0; i < NUMDIM; i++) if (origin[i] < minB[i]) {
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

    /* Ray origin inside bounding box */
    if (inside) {
        coord = origin;
        return coord;
    }

    /* Calculate T distances to candidate planes */
    for (i = 0; i < NUMDIM; i++) if (quadrant[i] != MIDDLE && dir[i] != 0.) maxT[i] = (candidatePlane[i] - origin[i]) / dir[i];else maxT[i] = -1.;

    /* Get largest of the maxT's for final choice of intersection */
    whichPlane = 0;
    for (i = 1; i < NUMDIM; i++) if (maxT[whichPlane] < maxT[i]) whichPlane = i;

    /* Check final candidate actually inside box */
    if (maxT[whichPlane] < 0.) return null;
    for (i = 0; i < NUMDIM; i++) if (whichPlane != i) {
        coord[i] = origin[i] + maxT[whichPlane] * dir[i];
        if (coord[i] < minB[i] || coord[i] > maxB[i]) return false;
    } else {
        coord[i] = candidatePlane[i];
    }
    return coord;
}

/*
Fast Ray-Box Intersection
by Andrew Woo
from "Graphics Gems", Academic Press, 1990
*/
export function hitBoundingBox(target, source, direction) {

    let v_minB = new Vector3(target.position.x - target.size.x / 2, target.position.y - target.size.y / 2, target.position.z - target.size.z / 2);
    let v_maxB = new Vector3(target.position.x + target.size.x / 2, target.position.y + target.size.y / 2, target.position.z + target.size.z / 2);

    let v_origin = source.position;
    let v_direction = direction === undefined ? source.direction : direction;

    let NUMDIM = 3,
        RIGHT = 0,
        LEFT = 1,
        MIDDLE = 2;
    let minB = [0, 0, 0],
        maxB = [0, 0, 0]; /*box*/
    let origin = [0, 0, 0],
        dir = [0, 0, 0]; /*ray*/
    let coord = [0, 0, 0]; /* hit point */

    let inside = true;
    let quadrant = [0, 0, 0];
    let i;
    let whichPlane;
    let maxT = [0, 0, 0];
    let candidatePlane = [0, 0, 0];

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
    for (i = 0; i < NUMDIM; i++) if (origin[i] < minB[i]) {
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

    /* Ray origin inside bounding box */
    if (inside) {
        coord = origin;
        return true;
    }

    /* Calculate T distances to candidate planes */
    for (i = 0; i < NUMDIM; i++) if (quadrant[i] != MIDDLE && dir[i] != 0.) maxT[i] = (candidatePlane[i] - origin[i]) / dir[i];else maxT[i] = -1.;

    /* Get largest of the maxT's for final choice of intersection */
    whichPlane = 0;
    for (i = 1; i < NUMDIM; i++) if (maxT[whichPlane] < maxT[i]) whichPlane = i;

    /* Check final candidate actually inside box */
    if (maxT[whichPlane] < 0.) return false;
    for (i = 0; i < NUMDIM; i++) if (whichPlane != i) {
        coord[i] = origin[i] + maxT[whichPlane] * dir[i];
        if (coord[i] < minB[i] || coord[i] > maxB[i]) return false;
    } else {
        coord[i] = candidatePlane[i];
    }
    return true;
}

/*export function getMinMaxB(obj:AGObject):Array<number>{
    let minV3:Vector3 = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    let maxV3:Vector3 = new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

    let coords:Array<Vector3>;

    coords.push(new Vector3(obj.position.x-obj.size.x/2, obj.position.y-obj.size.y/2, obj.position.z-obj.size.z/2));
    coords.push(new Vector3(obj.position.x+obj.size.x/2, obj.position.y+obj.size.y/2, obj.position.z+obj.size.z/2));



    for(let i = 0; i <)
}*/