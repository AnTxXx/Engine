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
let gegner:AGObject = new AGObject("gegner", new Vector3(1,1,1), new Vector3(1,0,0), new Vector3(1,1,1));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls:AGNavigation = new AGNavigation(38, 40, 37, 39);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(5.0, 1.0, 8.5), new Vector3(1,0,0), new Vector3(1,1,1), controls);
let player_hit:AGSoundSource = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, area.audioContext, area.resonanceAudioScene);
let door1:AGPortal = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let door2:AGPortal = new AGPortal("Tuere 2", new Vector3(8.0, 1.0, 8.0), new Vector3(1,0,0), new Vector3(1,1,1));

let wallSOUTH:AGObject = new AGObject("wall_south", new Vector3(5,1,10), new Vector3(1,0,0), new Vector3(5,1,1));

gegner.addSoundSource(gegner_ss);
area.add(gegner);
area.add(door1);
area.add(door2);
area.add(wallSOUTH);

//player.setSpeedSkalar(1);
player.speed = new Vector3(0.1, 0.0, 0.1);
player.hitSound = player_hit;

area.add(player);
area.listener = player;

gegner.addRoute(new Vector3(1,1,10), new Vector3(10,1,10), new Vector3(10, 1, 10), new Vector3(1,1,1));
gegner.setSpeedSkalar(1);
gegner.movable = true;

door1.linkPortals(door2);

play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?