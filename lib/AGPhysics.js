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