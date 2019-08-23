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


let room_1 = new AGRoom("Erster Raum", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

let skeleton_1 = new AGObject("Skeleton", new Vector3(3.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_2 = new AGObject("Skeleton", new Vector3(11, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_3 = new AGObject("Skeleton", new Vector3(14.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_4 = new AGObject("Skeleton", new Vector3(16, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

let steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
let car_1 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
let car_2 = new AGSoundSource("Car", "sounds/truck.wav", true, 1, room_1ID);
let car_3 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
let car_4 = new AGSoundSource("Car", "sounds/motorcycle.wav", true, 1, room_1ID);
let ouch = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
let magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);

let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);

let skeleton_1ID = getIdByReference(skeleton_1);
let skeleton_2ID = getIdByReference(skeleton_2);
let skeleton_3ID = getIdByReference(skeleton_3);
let skeleton_4ID = getIdByReference(skeleton_4);

let ouchID = getIdByReference(ouch);
let car_1ID = getIdByReference(car_1);
let car_2ID = getIdByReference(car_2);
let car_3ID = getIdByReference(car_3);
let car_4ID = getIdByReference(car_4);
let magic_exit_ID = getIdByReference(magic_exit);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(exitID);

getReferenceById(room_1ID).add(skeleton_1ID);
getReferenceById(room_1ID).add(skeleton_2ID);
getReferenceById(room_1ID).add(skeleton_3ID);
getReferenceById(room_1ID).add(skeleton_4ID);

//Soundtags
getReferenceById(car_1ID).tag = "CAR";
getReferenceById(car_2ID).tag = "TRUCK";
getReferenceById(car_3ID).tag = "CAR";
getReferenceById(car_4ID).tag = "MOTORCYCLE";
getReferenceById(ouchID).tag = "OUCH";
getReferenceById(magic_exit_ID).tag = "MAGIC";

//Car 1
getReferenceById(skeleton_1ID).setSpeedSkalar(1);
getReferenceById(skeleton_1ID).movable = true;
getReferenceById(skeleton_1ID).destructible = true;
getReferenceById(skeleton_1ID).health = 4;
getReferenceById(skeleton_1ID).addRoute(new Vector3(3.5, 1, 9), new Vector3(3.5, 1, 1));

getReferenceById(skeleton_1ID).addSoundSource(car_1ID);
getReferenceById(skeleton_1ID).tag = "ENEMY";

//Car 2
getReferenceById(skeleton_2ID).setSpeedSkalar(3);
getReferenceById(skeleton_2ID).movable = true;
getReferenceById(skeleton_2ID).destructible = true;
getReferenceById(skeleton_2ID).health = 4;
getReferenceById(skeleton_2ID).addRoute(new Vector3(7, 1, 1), new Vector3(11, 1, 2), new Vector3(7, 1, 3), new Vector3(11, 1, 4),
										new Vector3(7, 1, 5), new Vector3(11, 1, 6), new Vector3(7, 1, 7), new Vector3(11, 1, 8),
										new Vector3(7, 1, 9), new Vector3(11, 1, 9),
										new Vector3(7, 1, 8), new Vector3(11, 1, 7), new Vector3(7, 1, 6), new Vector3(11, 1, 5),
										new Vector3(7, 1, 4), new Vector3(11, 1, 3), new Vector3(7, 1, 2), new Vector3(11, 1, 1),

);

getReferenceById(skeleton_2ID).addSoundSource(car_2ID);
getReferenceById(skeleton_2ID).tag = "ENEMY";

//Car 3
getReferenceById(skeleton_3ID).setSpeedSkalar(1);
getReferenceById(skeleton_3ID).movable = true;
getReferenceById(skeleton_3ID).destructible = true;
getReferenceById(skeleton_3ID).health = 4;
getReferenceById(skeleton_3ID).addRoute(new Vector3(14.5, 1, 9), new Vector3(14.5, 1, 1));

getReferenceById(skeleton_3ID).addSoundSource(car_3ID);
getReferenceById(skeleton_3ID).tag = "ENEMY";

//Car 4
getReferenceById(skeleton_4ID).setSpeedSkalar(2);
getReferenceById(skeleton_4ID).movable = true;
getReferenceById(skeleton_4ID).destructible = true;
getReferenceById(skeleton_4ID).health = 4;
getReferenceById(skeleton_4ID).addRoute(new Vector3(16, 1, 9), new Vector3(16, 1, 1));

getReferenceById(skeleton_4ID).addSoundSource(car_4ID);
getReferenceById(skeleton_4ID).tag = "ENEMY";

//Player Settings
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = ouchID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

//Exit Sound
getReferenceById(exitID).addSoundSource(magic_exit_ID);

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

i_audicom.drawDot(12,1);
i_audicom.drawDot(16,1);


// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?