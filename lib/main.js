import { play } from './AGEngine.js';
import { AGGameArea } from "./AGGameArea.js";
import { AGObject } from "./AGObject.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGNavigation } from "./AGNavigation.js";
import { AGPlayer } from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";

let area = new AGGameArea("ebene", new Vector3(10, 2.5, 10));
let gegner = new AGObject("gegner", new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls = new AGNavigation(38, 40, 37, 39);
let player = new AGPlayer("spieler", new Vector3(5.0, 1.0, 5.0), new Vector3(1, 0, 0), controls);

gegner.addSoundSource(gegner_ss);
area.add(gegner);

player.setSpeedSkalar(1);
area.add(player);
area.listener = player;

gegner.addRoute(new Vector3(0, 1, 10), new Vector3(10, 1, 10), new Vector3(10, 1, 0), new Vector3(0, 1, 0));
gegner.setSpeedSkalar(1);
gegner.movable = true;

play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?