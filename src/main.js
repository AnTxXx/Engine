// @flow
import { play } from './AGEngine.js';
import { AGGameArea} from "./AGGameArea.js";
import { AGObject} from "./AGObject.js";
import { AGSoundSource} from "./AGSoundSource.js";
import { AGNavigation} from "./AGNavigation.js";
import { AGPlayer} from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";

let area:AGGameArea = new AGGameArea("ebene", new Vector3(3.1,2.5,3.4));
let gegner:AGObject = new AGObject("gegner",new Vector3(0,1,0), new Vector3(1,0,0));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls:AGNavigation = new AGNavigation(38, 40, 37, 39);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(0.0, 1.0, 0.0), new Vector3(1,0,0), new Vector3(1,1,1), controls);

gegner.addSoundSource(gegner_ss);
area.add(gegner);
area.add(player);
area.listener = player;
play(area, true);