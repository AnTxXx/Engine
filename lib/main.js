import { g_controls, g_references, g_eventHandler, g_history, g_gamearea, setControl, deleteItem } from "./AGEngine.js";
import { AGGameArea } from "./AGGameArea.js";
import { AGObject } from "./AGObject.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { AGNavigation } from "./AGNavigation.js";
import { AGPlayer } from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";
import { AGPortal } from "./AGPortal.js";
import { AGRoom } from "./AGRoom.js";
import { AGItem } from "./AGItem.js";

import { Event } from "./Event.js";
import { AGCondition } from "./AGCondition.js";
import { IAudiCom } from "../ui/js/IAudiCom.js";

import { AGRoomExit } from "./AGRoomExit.js";
import { getIdByReference, getReferenceById, getReferencesOfType } from "./AGEngine.js";
import { g_IAudiCom } from "./AGEngine.js";
import { setIAudiCom } from "./AGEngine.js";
import { AGInventory } from "./AGInventory.js";
import { GlobalEvent } from "./GlobalEvent.js";

let controls = new AGNavigation(38, 40, 37, 39, 67);
let controlsID = getIdByReference(controls);
setControl(getReferenceById(controlsID));

let room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);
let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let playerID = getIdByReference(player);

let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

getReferenceById(room_1ID).add(playerID);

g_gamearea.listener = playerID;
getReferenceById(room_1ID).listener = playerID;

//Player Settings
getReferenceById(playerID).setSpeedSkalar(0.1);

//getReferenceById(playerID).movable = true;
getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 1;
getReferenceById(playerID).interactionCooldown = 500;
getReferenceById(playerID).hitSound = ouch.ID;

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_gamearea.AGRooms[0].AGobjects);
//console.log(g_references);

export let i_audicom = new IAudiCom();
setIAudiCom(i_audicom);

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?