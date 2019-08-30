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

let controls = new AGNavigation(38, 40, 37, 39, 32);
let controlsID = getIdByReference(controls);
setControl(getReferenceById(controlsID));

//let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
//let areaID:number = getIdByReference(g_gamearea);

let room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(15.5, 1.0, 6.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let skeleton_1 = new AGObject("Skeleton", new Vector3(5.5, 1, 1.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_2 = new AGObject("Skeleton", new Vector3(10, 1, 3), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_3 = new AGObject("Skeleton", new Vector3(13.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

let wallHorizontal = new AGObject("WallHorizontal", new Vector3(7, 1.0, 4.5), new Vector3(1, 0, 0), new Vector3(14, 1, 1));
let wallVertical = new AGObject("WallVertical", new Vector3(13.5, 1.0, 6), new Vector3(1, 0, 0), new Vector3(1, 1, 2));

let waterfall = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let ouch = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
let monster_1 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let monster_2 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let monster_3 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);

let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);
let skeleton_1ID = getIdByReference(skeleton_1);
let skeleton_2ID = getIdByReference(skeleton_2);
let skeleton_3ID = getIdByReference(skeleton_3);
let waterfallID = getIdByReference(waterfall);
let ouchID = getIdByReference(ouch);
let monster_1ID = getIdByReference(monster_1);
let monster_2ID = getIdByReference(monster_2);
let monster_3ID = getIdByReference(monster_3);

let wallHorizontalID = getIdByReference(wallHorizontal);
let wallVerticalID = getIdByReference(wallVertical);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(exitID);

getReferenceById(room_1ID).add(skeleton_1ID);
getReferenceById(room_1ID).add(skeleton_2ID);
getReferenceById(room_1ID).add(skeleton_3ID);

getReferenceById(room_1ID).add(wallHorizontalID);
getReferenceById(room_1ID).add(wallVerticalID);
getReferenceById(wallHorizontalID).tag = "WALL";
getReferenceById(wallVerticalID).tag = "WALL";

//Soundtags
getReferenceById(waterfallID).tag = "WATERFALL";
getReferenceById(ouchID).tag = "OUCH";
getReferenceById(monster_1ID).tag = "MONSTER";
getReferenceById(monster_2ID).tag = "MONSTER";
getReferenceById(monster_3ID).tag = "MONSTER";

//Monster 1
getReferenceById(skeleton_1ID).setSpeedSkalar(0);

getReferenceById(skeleton_1ID).destructible = true;
getReferenceById(skeleton_1ID).health = 4;

getReferenceById(skeleton_1ID).addSoundSource(monster_1ID);
getReferenceById(skeleton_1ID).tag = "ENEMY";

//Monster 2
getReferenceById(skeleton_2ID).setSpeedSkalar(0);

getReferenceById(skeleton_2ID).destructible = true;
getReferenceById(skeleton_2ID).health = 4;

getReferenceById(skeleton_2ID).addSoundSource(monster_2ID);
getReferenceById(skeleton_2ID).tag = "ENEMY";

//Monster 3
getReferenceById(skeleton_3ID).setSpeedSkalar(0);

getReferenceById(skeleton_3ID).destructible = true;
getReferenceById(skeleton_3ID).health = 4;

getReferenceById(skeleton_3ID).addSoundSource(monster_3ID);
getReferenceById(skeleton_3ID).tag = "ENEMY";

//Player Settings
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = ouchID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

//Exit Sound
getReferenceById(exitID).addSoundSource(waterfallID);

//EVENT ITEM TEST

/*let key:AGItem = new AGItem("Schluessel", "Ein Schluessel zum Oeffnen von Tueren.", 1);
let keyID:number = getIdByReference(key);

getReferenceById(gegnerID).inventory.addItem(keyID);
g_eventHandler.addEvent(new Event(gegnerID, "ONCONTACT", "MOVE", playerID, keyID, 1));
getReferenceById(door1ID).addCondition(new AGCondition(playerID, "INVENTORY", keyID));*/
//EVENT ITEM TEST

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_gamearea.AGRooms[0].AGobjects);
//console.log(g_references);

export let i_audicom = new IAudiCom();

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?