import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";
import { type } from "./AGType.js";

let gForward, gBackward, gLeft, gRight;

export function move(object, add) {

    let collisionArray;
    if (add) {
        //console.log("Prediction:");
        //console.log(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())));
        collisionArray = object.gameArea.predictCollisionByPointAndSize(object.position.clone().add(object.speed.clone().multiply(object.direction.clone())), object.size);
        if (collisionArray.length !== 0 && collisionArray[0].type !== type.PORTAL) {
            console.log("Can't move forward. Blocked.");
        } else {
            object.position.add(object.speed.clone().multiply(object.direction.clone()));
        }
    } else {
        //console.log("Prediction:");
        //console.log(object.position.clone().sub(object.speed.clone().multiply(object.direction.clone())));
        collisionArray = object.gameArea.predictCollisionByPointAndSize(object.position.clone().sub(object.speed.clone().multiply(object.direction.clone())), object.size);
        if (collisionArray.length !== 0 && collisionArray[0].type !== type.PORTAL) {
            console.log("Can't move backward. Blocked.");
        } else {
            object.position.sub(object.speed.clone().multiply(object.direction.clone()));
        }
    }

    //if(add) object.position.add(object.speed.clone().multiply(object.direction.clone()));
    //else object.position.sub(object.speed.clone().multiply(object.direction.clone()));
    //let colObject = object.gameArea.objectPartOfCollision(object);
    /*if(colObject != null && colObject.type !== type.PORTAL){
        console.log("Can't move forward. Blocked. (" + object.name + " " + (colObject).name + ") " + object.position.x + " " + object.position.y + " " + object.position.z);
        add ? object.position.sub(object.speed.clone().multiply(object.direction.clone())) : object.position.add(object.speed.clone().multiply(object.direction.clone()));
        console.log("Can't move forward. Blocked. (" + object.name + " " + (colObject).name + ") " + object.position.x + " " + object.position.y + " " + object.position.z);
    }*/
}

export function moveTo(object, direction) {
    object.position.add(object.speed.clone().multiply(direction));
    //TODO: Collision detection from above adapt for moveTo
    /*if(object.gameArea.objectPartOfCollision(object)!=null){
        object.position.add(object.speed.clone().multiply(-direction));
        console.log("Can't move forward. Blocked. " + object.position.x + " " + object.position.y + " " + object.position.z);
    }*/
    //console.log(object.position.x + " " + object.position.y + " " + object.position.z +
    //    " " + direction.x + " " + direction.y + " " + direction.z);
}

export class AGNavigation {

    constructor(forward, backward, left, right) {
        console.log("[AGNavigation] Creating AGNavigation object.");
        gForward = forward;
        gBackward = backward;
        gLeft = left;
        gRight = right;
    }

    draw(player) {
        window.onkeydown = function (e) {
            switch (e.keyCode) {
                case gForward:
                    move(player, true);
                    break;
                case gBackward:
                    move(player, false);
                    break;
                case gLeft:
                    player.direction.applyAxisAngle(new Vector3(0, 1, 0), 8 * (Math.PI / 180));
                    break;
                case gRight:
                    player.direction.applyAxisAngle(new Vector3(0, 1, 0), -8 * (Math.PI / 180));
                    break;
            }
            console.log("Position: " + player.position.x + " " + player.position.y + " " + player.position.z);
            console.log("Direction: " + player.direction.x + " " + player.direction.y + " " + player.direction.z);
        };
    }
}