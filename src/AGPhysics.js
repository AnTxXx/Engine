// @flow
import {AGObject} from "./AGObject.js";

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