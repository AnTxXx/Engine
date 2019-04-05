// @flow
import {AGObject} from "./AGObject.js";
import {Vector3} from "./js/three/Vector3.js";
import {AGRoom} from "./AGRoom.js";

export function colliding(obj1:AGObject, obj2:AGObject):boolean{
    /*console.log((obj1.position.x-obj1.size.x/2 <= obj2.position.x+obj2.size.x/2 &&
        obj1.position.x+obj1.size.x/2 >= obj2.position.x-obj2.size.x/2) + " // " + (obj1.position.y-obj1.size.y/2 <= obj2.position.y+obj2.size.y/2 &&
        obj1.position.y+obj1.size.y/2 >= obj2.position.y-obj2.size.y/2) + " // " + (obj1.position.z-obj1.size.z/2 <= obj2.position.z+obj2.size.z/2 &&
        obj1.position.z+obj1.size.z/2 >= obj2.position.z-obj2.size.z/2));*/
    return (obj1.position.x-obj1.size.x/2 <= obj2.position.x+obj2.size.x/2 &&
        obj1.position.x+obj1.size.x/2 >= obj2.position.x-obj2.size.x/2) &&
        (obj1.position.y-obj1.size.y/2 <= obj2.position.y+obj2.size.y/2 &&
            obj1.position.y+obj1.size.y/2 >= obj2.position.y-obj2.size.y/2) &&
        (obj1.position.z-obj1.size.z/2 <= obj2.position.z+obj2.size.z/2 &&
            obj1.position.z+obj1.size.z/2 >= obj2.position.z-obj2.size.z/2);
}

export function isPointInsideAABB(point:Vector3, obj:AGObject):boolean {
    return (point.x >= obj.position.x-obj.size.x/2 && point.x <= obj.position.x+obj.size.x/2) &&
        (point.y >= obj.position.y-obj.size.y/2 && point.y <= obj.position.y+obj.size.y/2) &&
        (point.z >= obj.position.z-obj.size.z/2 && point.z <= obj.position.z+obj.size.z/2);
}

export function isAABBInsideAABB(point:Vector3, size:Vector3, obj:AGObject):boolean {
    return (point.x-size.x/2 <= obj.position.x+obj.size.x/2 &&
        point.x+size.x/2 >= obj.position.x-obj.size.x/2) &&
        (point.y-size.y/2 <= obj.position.y+obj.size.y/2 &&
            point.y+size.y/2 >= obj.position.y-obj.size.y/2) &&
        (point.z-size.z/2 <= obj.position.z+obj.size.z/2 &&
            point.z+size.z/2 >= obj.position.z-obj.size.z/2);
}

export function isAABBInsideRoom(point:Vector3, size:Vector3, room:AGRoom):boolean{
    return (point.x - size.x/2 >= 0.0 &&
    point.x + size.x/2 <= room.size.x) &&
        (point.y - size.y/2 >= 0.0 &&
    point.y + size.y/2 <= room.size.y) &&
        (point.z - size.z/2 >= 0.0 &&
    point.z + size.z/2 <= room.size.z);
}