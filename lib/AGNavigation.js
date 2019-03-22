import { Vector3 } from "./js/three/Vector3.js";
import { AGObject } from "./AGObject.js";

let gForward, gBackward, gLeft, gRight;

export function move(object, add) {
    if (add) object.position.add(object.speed.clone().multiply(object.direction.clone()));else object.position.sub(object.speed.clone().multiply(object.direction.clone()));
}

//TODO: debug warum das object bei moveTo sich nicht bewegt, bekommt aus AGObject alle wichtigen Daten

export function moveTo(object, direction) {
    object.position.add(object.speed.clone().multiply(direction));
    //console.log(object.position.x + " " + object.position.y + " " + object.position.z +
    //    " " + direction.x + " " + direction.y + " " + direction.z);
}

export class AGNavigation {

    constructor(forward, backward, left, right) {
        console.log("Creating AGNavigation object.");
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