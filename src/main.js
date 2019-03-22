// @flow
import { play } from './AGEngine.js';
import { AGGameArea} from "./AGGameArea.js";
import { AGObject} from "./AGObject.js";
import { AGSoundSource} from "./AGSoundSource.js";
import { AGNavigation} from "./AGNavigation.js";
import { AGPlayer} from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";
import { AGPortal } from "./AGPortal.js";

let area:AGGameArea = new AGGameArea("ebene", new Vector3(10,2.5,10));
let gegner:AGObject = new AGObject("gegner", new Vector3(0,1,0), new Vector3(1,0,0), new Vector3(1,1,1));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls:AGNavigation = new AGNavigation(38, 40, 37, 39);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(2.0, 1.0, 2.0), new Vector3(1,0,0), new Vector3(1,1,1), controls);
let door1:AGPortal = new AGPortal("Tuere 1", new Vector3(2.0, 1.0, 2.0), new Vector3(1,0,0), new Vector3(1,1,1));
let door2:AGPortal = new AGPortal("Tuere 1", new Vector3(8.0, 1.0, 8.0), new Vector3(1,0,0), new Vector3(1,1,1));

gegner.addSoundSource(gegner_ss);
area.add(gegner);

//player.setSpeedSkalar(1);
player.speed = new Vector3(0.1, 0.0, 0.1);
area.add(player);
area.listener = player;

gegner.addRoute(new Vector3(0,1,10), new Vector3(10,1,10), new Vector3(10,1,0), new Vector3(0,1,0));
gegner.setSpeedSkalar(1);
gegner.movable = true;

//Player spawns at door, should be instantly teleported
door1.exit = door2;
door2.exit = door1;

//Physics debug:
player.collidable = true;
door1.collidable = true;
//door2.collidable = true;

play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?