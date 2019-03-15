// @flow
import { play } from './AGEngine.js';
import { AGGameArea} from "./AGGameArea.js";
import { AGObject} from "./AGObject.js";
import { AGSoundSource} from "./AGSoundSource.js";
import { AGNavigation} from "./AGNavigation.js";
import { AGPlayer} from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";

let area:AGGameArea = new AGGameArea("ebene", new Vector3(5,2.5,5));
let gegner:AGObject = new AGObject("gegner",new Vector3(0,1,0), new Vector3(1,0,0), new Vector3(1,1,1));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, area.audioContext, area.resonanceAudioScene);
let controls:AGNavigation = new AGNavigation(38, 40, 37, 39);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(0.0, 1.0, 0.0), new Vector3(1,0,0), controls);

gegner.addSoundSource(gegner_ss);
area.add(gegner);

player.speed = new Vector3(1,1,1);
area.add(player);
area.listener = player;

gegner.addRoute(new Vector3(0,1,4), new Vector3(4,1,4), new Vector3(4,1,0), new Vector3(0,1,0));
gegner.movable = true;

play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?