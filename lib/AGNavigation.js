import { AGPlayer } from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";

let gForward, gBackward, gLeft, gRight;

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
                    //player.position += player.direction * 0.3;
                    player.position.add(player.speed.clone().multiply(player.direction.clone()));
                    break;
                case gBackward:
                    player.position.sub(player.speed.clone().multiply(player.direction.clone()));
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