import { AGGameArea, AGObject, AGSoundSource, AGPlayer, AGNavigation, play } from './AGEngine.js';
import { Vector3 } from "./js/three/Vector3.js";

let area = new AGGameArea("ebene", new Vector3(3.1, 2.5, 3.4));
let gegner = new AGObject("gegner", new Vector3(-0.707, -0.707, 0), new Vector3(1, 0, 0));
let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1);
let controls = new AGNavigation(38, 40, 37, 39);
let player = new AGPlayer("spieler", new Vector3(0.0, 1.0, 0.0), new Vector3(1, 0, 0), controls);

gegner.addSoundSource(gegner_ss);
area.add(gegner);
area.add(player);
play(area, true);