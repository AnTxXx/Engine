import { play } from './AGEngine.js';
import { AGGameArea } from "./AGGameArea.js";
import { AGObject } from "./AGObject.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGNavigation } from "./AGNavigation.js";
import { AGPlayer } from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";
import { AGPortal } from "./AGPortal.js";

let area = new AGGameArea("ebene", new Vector3(10, 2.5, 10));
let gegner = new AGObject("gegner", new Vector3(1, 1, 1), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls = new AGNavigation(38, 40, 37, 39);
let player = new AGPlayer("spieler", new Vector3(4.0, 1.0, 4.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1), controls);
let player_hit = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, area.audioContext, area.resonanceAudioScene);
let door1 = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 4.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let door2 = new AGPortal("Tuere 2", new Vector3(8.0, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

gegner.addSoundSource(gegner_ss);
area.add(gegner);

//player.setSpeedSkalar(1);
player.speed = new Vector3(0.1, 0.0, 0.1);
player.hitSound = player_hit;

area.add(player);
area.listener = player;

gegner.addRoute(new Vector3(1, 1, 10), new Vector3(10, 1, 10), new Vector3(10, 1, 10), new Vector3(1, 1, 1));
gegner.setSpeedSkalar(1);
gegner.movable = true;

//Player spawns at door, should be instantly teleported
door1.exit = door2;
door2.exit = door1;

//Physics debug:
player.collidable = true;
gegner.collidable = false;
door1.collidable = true;
door2.collidable = true;

play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?