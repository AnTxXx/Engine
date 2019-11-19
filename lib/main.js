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

let controls = new AGNavigation(-1, -1, 37, 39, 67);
let controlsID = getIdByReference(controls);
setControl(getReferenceById(controlsID));

//let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
//let areaID:number = getIdByReference(g_gamearea);

let room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

let wall1 = new AGObject("Wand unten", new Vector3(14, 1.0, 6.7), new Vector3(1, 0, 0), new Vector3(12, 1, 0.5));
let wall2 = new AGObject("Wand links", new Vector3(4.5, 1.0, 6.4), new Vector3(1, 0, 0), new Vector3(0.5, 1, 5));
let wall3 = new AGObject("Wand oben", new Vector3(10.66, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(12.8, 1, 0.5));
let waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let enemy1 = new AGObject("Gegner 1", new Vector3(6.3, 1.0, 2.4), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let enemy2 = new AGObject("Gegner 2", new Vector3(12.9, 1.0, 0.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let enemy3 = new AGObject("Gegner 3", new Vector3(12.3, 1.0, 4.6), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let enemy4 = new AGObject("Gegner 4", new Vector3(12.9, 1.0, 8.9), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let enemy1_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy2_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy3_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy4_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);

let wall1_ID = wall1.ID;
let wall2_ID = wall2.ID;
let wall3_ID = wall3.ID;
let waterfall1_ID = waterfall_1.ID;
let waterfall2_ID = waterfall_2.ID;
let enemy1_ID = enemy1.ID;
let enemy2_ID = enemy2.ID;
let enemy3_ID = enemy3.ID;
let enemy4_ID = enemy4.ID;

let enemy1_ss_ID = enemy1_ss.ID;
let enemy2_ss_ID = enemy2_ss.ID;
let enemy3_ss_ID = enemy3_ss.ID;
let enemy4_ss_ID = enemy4_ss.ID;

let ouchID = getIdByReference(ouch);
let playerID = getIdByReference(player);

g_gamearea.listener = playerID;
getReferenceById(room_1ID).listener = playerID;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(wall1_ID);
getReferenceById(room_1ID).add(wall2_ID);
getReferenceById(room_1ID).add(wall3_ID);

getReferenceById(room_1ID).add(enemy1_ID);
getReferenceById(room_1ID).add(enemy2_ID);
getReferenceById(room_1ID).add(enemy3_ID);
getReferenceById(room_1ID).add(enemy4_ID);

getReferenceById(waterfall1_ID).tag = "WATERFALL";
getReferenceById(wall1_ID).tag = "WALL";
getReferenceById(wall2_ID).tag = "WALL";
getReferenceById(wall3_ID).tag = "WALL";

getReferenceById(enemy1_ID).tag = "ENEMY";
getReferenceById(enemy2_ID).tag = "ENEMY";
getReferenceById(enemy3_ID).tag = "ENEMY";
getReferenceById(enemy4_ID).tag = "ENEMY";

//getReferenceById(playerID).tag = "ENEMY";

//Player Settings
getReferenceById(playerID).setSpeedSkalar(1);
getReferenceById(playerID).hitSound = ouchID;
getReferenceById(playerID).movable = true;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 4;

getReferenceById(playerID).addRoute(new Vector3(2.16, 1, 6.07), new Vector3(2.22, 1, 1.28), new Vector3(6.33, 1, 0.73), new Vector3(12.89, 1, 2.82), new Vector3(17.67, 1, 0.84), new Vector3(18.38, 1, 4.8), new Vector3(13.02, 1, 5.93), new Vector3(7.29, 1, 5.15), new Vector3(5.87, 1, 6.78), new Vector3(8.89, 1, 8.53), new Vector3(12.42, 1, 7.42), new Vector3(18.8, 1, 8.49), new Vector3(18.84, 1, 10.02), new Vector3(1.96, 1, 9.95));

//Enemy Settings
getReferenceById(enemy1_ID).destructible = true;
getReferenceById(enemy1_ID).health = 1;
getReferenceById(enemy1_ID).movable = false;
getReferenceById(enemy1_ID).collidable = true;
getReferenceById(enemy1_ID).addSoundSource(enemy1_ss_ID);

//Enemy Settings
getReferenceById(enemy2_ID).destructible = true;
getReferenceById(enemy2_ID).health = 1;
getReferenceById(enemy2_ID).movable = false;
getReferenceById(enemy2_ID).collidable = true;
getReferenceById(enemy2_ID).addSoundSource(enemy2_ss_ID);

//Enemy Settings
getReferenceById(enemy3_ID).destructible = true;
getReferenceById(enemy3_ID).health = 1;
getReferenceById(enemy3_ID).movable = false;
getReferenceById(enemy3_ID).collidable = true;
getReferenceById(enemy3_ID).addSoundSource(enemy3_ss_ID);

//Enemy Settings
getReferenceById(enemy4_ID).destructible = true;
getReferenceById(enemy4_ID).health = 1;
getReferenceById(enemy4_ID).movable = false;
getReferenceById(enemy4_ID).collidable = true;
getReferenceById(enemy4_ID).addSoundSource(enemy4_ss_ID);

let coin_1 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", 1);
let coin1_ID = coin_1.ID;
getReferenceById(enemy1_ID).inventory.addItem(coin1_ID);
g_eventHandler.addEvent(new Event(enemy1_ID, "ONDEATH", "MOVE", playerID, coin_1, 1));

let coin_2 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", 1);
let coin2_ID = coin_2.ID;
getReferenceById(enemy2_ID).inventory.addItem(coin2_ID);
g_eventHandler.addEvent(new Event(enemy2_ID, "ONDEATH", "MOVE", playerID, coin_2, 1));

let coin_3 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", 1);
let coin3_ID = coin_3.ID;
getReferenceById(enemy3_ID).inventory.addItem(coin3_ID);
g_eventHandler.addEvent(new Event(enemy3_ID, "ONDEATH", "MOVE", playerID, coin_3, 1));

let coin_4 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", 1);
let coin4_ID = coin_4.ID;
getReferenceById(enemy4_ID).inventory.addItem(coin4_ID);
g_eventHandler.addEvent(new Event(enemy4_ID, "ONDEATH", "MOVE", playerID, coin_4, 1));

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_gamearea.AGRooms[0].AGobjects);
//console.log(g_references);

export let i_audicom = new IAudiCom();
setIAudiCom(i_audicom);

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?