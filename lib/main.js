import { g_controls, g_eventHandler, g_history, g_gamearea, setControl } from "./AGEngine.js";
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
import { getIdByReference, getReferenceById } from "./AGEngine.js";
import { g_IAudiCom } from "./AGEngine.js";
import { setIAudiCom } from "./AGEngine.js";

let controls = new AGNavigation(38, 40, 37, 39, 67);
let controlsID = getIdByReference(controls);
setControl(getReferenceById(controlsID));

//let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
//let areaID:number = getIdByReference(g_gamearea);

let room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

let wall1 = new AGObject("Wand oben 1", new Vector3(6.3, 1.0, 0.6), new Vector3(1, 0, 0), new Vector3(4.8, 1, 1.3));
let wall2 = new AGObject("Wand oben 2", new Vector3(8.2, 1.0, 2.5), new Vector3(1, 0, 0), new Vector3(1, 1, 2.6));
let wall3 = new AGPortal("Wand oben 3", new Vector3(12.8, 1.0, 0.2), new Vector3(1, 0, 0), new Vector3(8.2, 1, 0.5));
let wall4 = new AGObject("Wand seitlich rechts", new Vector3(16.4, 1.0, 3.6), new Vector3(1, 0, 0), new Vector3(1, 1, 6.2));
let wall5 = new AGObject("Wand unten 3", new Vector3(14.4, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(3, 1, 0.5));
let wall6 = new AGObject("Wand unten 2", new Vector3(12.5, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(1, 1, 4.1));
let wall7 = new AGObject("Wand unten 1", new Vector3(8.5, 1.0, 6.2), new Vector3(1, 0, 0), new Vector3(8.9, 1, 1.0));
let waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let fee = new AGObject("Fee", new Vector3(5.0, 1, 3.0), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

let wall1_ID = wall1.ID;
let wall2_ID = wall2.ID;
let wall3_ID = wall3.ID;
let wall4_ID = wall4.ID;
let wall5_ID = wall5.ID;
let wall6_ID = wall6.ID;
let wall7_ID = wall7.ID;
let waterfall1_ID = waterfall_1.ID;
let fee_ID = fee.ID;

let ouchID = getIdByReference(ouch);
let playerID = getIdByReference(player);

g_gamearea.listener = playerID;
getReferenceById(room_1ID).listener = playerID;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(wall1_ID);
getReferenceById(room_1ID).add(wall2_ID);
getReferenceById(room_1ID).add(wall3_ID);
getReferenceById(room_1ID).add(wall4_ID);
getReferenceById(room_1ID).add(wall5_ID);
getReferenceById(room_1ID).add(wall6_ID);
getReferenceById(room_1ID).add(wall7_ID);
getReferenceById(room_1ID).add(fee_ID);

getReferenceById(waterfall1_ID).tag = "WATERFALL";
getReferenceById(wall1_ID).tag = "WALL";
getReferenceById(wall2_ID).tag = "WALL";
getReferenceById(wall3_ID).tag = "WALL";
getReferenceById(wall4_ID).tag = "WALL";
getReferenceById(wall5_ID).tag = "WALL";
getReferenceById(wall6_ID).tag = "WALL";
getReferenceById(wall7_ID).tag = "WALL";
getReferenceById(fee_ID).tag = "ENEMY";

//Player Settings
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = ouchID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

//Fee
getReferenceById(fee_ID).setSpeedSkalar(3);
getReferenceById(fee_ID).movable = true;
getReferenceById(fee_ID).auditoryPointer = true;
getReferenceById(fee_ID).destructible = false;
getReferenceById(fee_ID).collidable = false;
getReferenceById(fee_ID).health = 4;
getReferenceById(fee_ID).addRoute(new Vector3(5, 1, 3), new Vector3(6.7, 1, 4.8), new Vector3(11.42, 1, 4.84), new Vector3(9.33, 1, 2.71), new Vector3(11.17, 1, 0.95), new Vector3(15.4, 1, 0.93), new Vector3(13.55, 1, 3.11), new Vector3(15.27, 1, 4.78), new Vector3(14.38, 1, 5.51));

getReferenceById(fee_ID).addSoundSource(waterfall1_ID);
getReferenceById(fee_ID).tag = "ENEMY";

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_gamearea.AGRooms[0].AGobjects);
//console.log(g_references);

export let i_audicom = new IAudiCom();
setIAudiCom(i_audicom);

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?