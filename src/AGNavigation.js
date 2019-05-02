// @flow
import {Vector3} from "./js/three/Vector3.js";
import {AGObject} from "./AGObject.js";
import {type} from "./AGType.js";

let gForward, gBackward, gLeft, gRight;

/**
 * Function to move object (AGObject) based on its direction and speed. If the movement is not possible
 * (e.g., collision), the object does not move.
 * @param object Object (AGObject) to be moved.
 * @param add If the object should move forward (true) or backward (false).
 */
export function move(object:AGObject, add:boolean){

    let collisionArray:Array<AGObject>;
    if(add){
        //console.log("Prediction:");
        //console.log(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())));

        //calculate the point where the object should be moved to
        let testPoint:Vector3 = object.position.clone().add(object.speed.clone().multiply(object.direction.clone()));

        //get a collision-array of all objects that intersect with the calculated new position of the object
        collisionArray = object.room.predictCollisionByPointAndSize(testPoint, object.size);

        //checks if there is no collision happening and the object doesn't collide with itself
        if((collisionArray.length !== 0 && collisionArray[0].type !== type.PORTAL && object !== collisionArray[0])){
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
        if((collisionArray.length !== 0 && collisionArray[0].type !== type.PORTAL && object !== collisionArray[0])){
            console.log("[AGNavigation] " + object.name + ": Can't move Backward. Blocked by other object: " + collisionArray[0].name + ".");
        } else if(!object.room.pointInsideRoom(testPoint, object.size)){
            console.log("[AGNavigation] " + object.name + ": Can't move Backward. Blocked by room boundaries.");
        }
        else {
            object.position.sub(object.speed.clone().multiply(object.direction.clone()));
        }
    }
}

/**
 * Private function: if a collision is allowed (e.g., collision with portal) or not.
 * @param obj The object (AGObject) to be checked with.
 * @param collArray The array of AGObjects with the current collisions.
 * @returns {boolean} Returns true if collision is allowed, otherwise false.
 */
function allowedCollision(obj:AGObject, collArray:Array<AGObject>):boolean{
    for(let i = 0; i < collArray.length; i++){
        if(obj !== collArray[i] && collArray[i].type !== type.PORTAL) {
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
export function moveTo(object:AGObject, direction:Vector3){
    //TODO: should be optimized in a way, that we only need one function for moving :-) copy&pasta-ing is bad

    let collisionArray:Array<AGObject>;
    //console.log("Prediction:");
    //console.log(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())));
    let testPoint:Vector3 = object.position.clone().add(object.speed.clone().multiply(direction.clone()));
    collisionArray = object.room.predictCollisionByPointAndSize(testPoint, object.size);

    if(allowedCollision(object, collisionArray)){
        //console.log("moving");
        object.position.add(object.speed.clone().multiply(direction));
    } else {
        console.log("[AGNavigation] " + object.name + ": Can't move forward.");
    }

    /*if(object.gameArea.objectPartOfCollision(object)!=null){
        object.position.add(object.speed.clone().multiply(-direction));
        console.log("Can't move forward. Blocked. " + object.position.x + " " + object.position.y + " " + object.position.z);
    }*/
    //console.log(object.position.x + " " + object.position.y + " " + object.position.z +
    //    " " + direction.x + " " + direction.y + " " + direction.z);

}

/**
 * Class that is responsible for the movement buttons of the respective object.
 */
export class AGNavigation {

    /**
     *
     * @param forward Keycode for forward-movement.
     * @param backward Keycode for backward-movement.
     * @param left Keycode for left-turn.
     * @param right Keycode for right-turn.
     */
    constructor(forward:number, backward:number, left:number, right:number){
        console.log("[AGNavigation] Creating AGNavigation object.");
        gForward = forward;
        gBackward = backward;
        gLeft = left;
        gRight = right;
    }

    /**
     * draw-loop
     * @param player Object (AGObject) which can be moved by the player.
     */
    draw(player:AGObject){
        window.onkeydown = function(e) {
            switch(e.keyCode){
                case gForward:
                    move(player, true);
                    break;
                case gBackward:
                    move(player, false);
                    break;
                case gLeft:
                    player.direction.applyAxisAngle(new Vector3(0,1,0), 8 * (Math.PI / 180));
                    break;
                case gRight:
                    player.direction.applyAxisAngle(new Vector3(0,1,0), -8 * (Math.PI / 180));
                    break;
            }
            console.log("Position: " + player.position.x + " " + player.position.y + " " + player.position.z);
            console.log("Direction: " + player.direction.x + " " + player.direction.y + " " + player.direction.z);
        }

    }
}