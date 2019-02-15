import { AGGameArea, AGObject, AGSoundSource, AGPlayer, play } from './AGEngine.js';
import { Vector3 } from "./js/three/Vector3.js";

let area = new AGGameArea("ebene", new Vector3(3.1, 2.5, 3.4));
let gegner = new AGObject("gegner", new Vector3(-0.707, -0.707, 0), new Vector3(1, 0, 0));
let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1);
gegner.addSoundSource(gegner_ss);
area.add(gegner);
play(area, true);