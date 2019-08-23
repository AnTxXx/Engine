// @flow
import {g_controls, g_eventHandler, g_history, g_gamearea, setControl} from "./AGEngine.js";
import { AGGameArea} from "./AGGameArea.js";
import { AGObject} from "./AGObject.js";
import { AGSoundSource} from "./AGSoundSource.js";
import { AGNavigation} from "./AGNavigation.js";
import { AGPlayer} from "./AGPlayer.js";
import { Vector3 } from "./js/three/Vector3.js";
import { AGPortal } from "./AGPortal.js";
import {AGRoom} from "./AGRoom.js";
import {AGItem} from "./AGItem.js";
import type {Trigger, Action} from "./EventType.js";
import {Event} from "./Event.js";
import {AGCondition} from "./AGCondition.js";
import { IAudiCom } from "../ui/js/IAudiCom.js";

import {AGRoomExit} from "./AGRoomExit.js";
import {getIdByReference, getReferenceById} from "./AGEngine.js";
import {g_IAudiCom} from "./AGEngine.js";


let controls:AGNavigation = new AGNavigation(38, 40, 37, 39, 32);
let controlsID:number = getIdByReference(controls);
setControl(getReferenceById(controlsID));

//let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
//let areaID:number = getIdByReference(g_gamearea);

let room_1:AGRoom = new AGRoom("Erster Raum", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID:number = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player:AGPlayer = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1,0,0), new Vector3(1,1,1));
let exit:AGRoomExit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let wallWestSmallRoom:AGObject = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1,0,0), new Vector3(1,1,4));
let wallNorthSmallRoom:AGObject = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1,0,0), new Vector3(5,1,1));
let portalSmallRoom:AGPortal = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1,0,0), new Vector3(1,1,1));
let wallSouthCorridor:AGObject = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1,0,0), new Vector3(19,1,1));
let wallLeftCorridor:AGObject = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.2), new Vector3(1,0,0), new Vector3(1,1,1.65));
let wallRightCorridor:AGObject = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1,0,0), new Vector3(1,1,1.65));
let portalCorridorRoomFromSmallRoom:AGPortal = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1,0,0), new Vector3(1,1,1));
let skeleton:AGObject = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let portalCorridorToFinal:AGPortal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1,0,0), new Vector3(1,1,1));
let portalFinalFromCorridor:AGPortal = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1,0,0), new Vector3(1,1,1));
let wallFirstFinalRoom:AGObject = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1,0,0), new Vector3(1,1,4));
let wallSecondFinalRoom:AGObject = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.6), new Vector3(1,0,0), new Vector3(1,1,3.34));
let waterFall_1:AGObject = new AGObject("Waterfall1", new Vector3(8.7, 1, 0.5), new Vector3(1,0,0), new Vector3(1,1,1));
let waterFall_2:AGObject = new AGObject("Waterfall2", new Vector3(4.5, 1, 4.5), new Vector3(1,0,0), new Vector3(1,1,1));
let waterFall_3:AGObject = new AGObject("Waterfall3", new Vector3(8, 1, 9.0), new Vector3(1,0,0), new Vector3(1,1,1));
let waterFall_4:AGObject = new AGObject("Waterfall4", new Vector3(11, 1, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let steps:AGSoundSource = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
let ouch:AGSoundSource = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
let magic_1:AGSoundSource = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let magic_2:AGSoundSource = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let magic_3:AGSoundSource = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let waterfall_1:AGSoundSource = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_2:AGSoundSource = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_3:AGSoundSource = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_4:AGSoundSource = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);


let playerID:number = getIdByReference(player);
let exitID:number = getIdByReference(exit);
let wallWestSmallRoomID:number = getIdByReference(wallWestSmallRoom);
let wallNorthSmallRoomID:number = getIdByReference(wallNorthSmallRoom);
let portalSmallRoomID:number = getIdByReference(portalSmallRoom);
let wallSouthCorridorID:number = getIdByReference(wallSouthCorridor);
let wallLeftCorridorID:number = getIdByReference(wallLeftCorridor);
let wallRightCorridorID:number = getIdByReference(wallRightCorridor);
let portalCorridorRoomFromSmallRoomID:number = getIdByReference(portalCorridorRoomFromSmallRoom);
let skeletonID:number = getIdByReference(skeleton);
let portalCorridorToFinalID:number = getIdByReference(portalCorridorToFinal);
let portalFinalFromCorridorID:number = getIdByReference(portalFinalFromCorridor);
let wallFirstFinalRoomID:number = getIdByReference(wallFirstFinalRoom);
let wallSecondFinalRoomID:number = getIdByReference(wallSecondFinalRoom);
let stepsID:number = getIdByReference(steps);
let ouchID:number = getIdByReference(ouch);
let magic_1ID:number = getIdByReference(magic_1);
let magic_2ID:number = getIdByReference(magic_2);
let magic_3ID:number = getIdByReference(magic_3);
let waterfall_1ID:number = getIdByReference(waterfall_1);
let waterfall_2ID:number = getIdByReference(waterfall_2);
let waterfall_3ID:number = getIdByReference(waterfall_3);
let waterfall_4ID:number = getIdByReference(waterfall_4);

let waterFall_1ID:number = getIdByReference(waterFall_1);
let waterFall_2ID:number = getIdByReference(waterFall_2);
let waterFall_3ID:number = getIdByReference(waterFall_3);
let waterFall_4ID:number = getIdByReference(waterFall_4);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(exitID);
getReferenceById(room_1ID).add(wallWestSmallRoomID);
getReferenceById(room_1ID).add(wallNorthSmallRoomID);
getReferenceById(room_1ID).add(portalSmallRoomID);
getReferenceById(room_1ID).add(wallSouthCorridorID);
getReferenceById(room_1ID).add(wallLeftCorridorID);
getReferenceById(room_1ID).add(wallRightCorridorID);
getReferenceById(room_1ID).add(portalCorridorRoomFromSmallRoomID);
getReferenceById(room_1ID).add(skeletonID);
getReferenceById(room_1ID).add(portalCorridorToFinalID);
getReferenceById(room_1ID).add(portalFinalFromCorridorID);
getReferenceById(room_1ID).add(wallFirstFinalRoomID);
getReferenceById(room_1ID).add(wallSecondFinalRoomID);
getReferenceById(room_1ID).add(waterFall_1ID);
getReferenceById(room_1ID).add(waterFall_2ID);
getReferenceById(room_1ID).add(waterFall_3ID);
getReferenceById(room_1ID).add(waterFall_4ID);


getReferenceById(wallWestSmallRoomID).tag = "WALL";
getReferenceById(wallNorthSmallRoomID).tag = "WALL";
getReferenceById(wallSouthCorridorID).tag = "WALL";
getReferenceById(wallLeftCorridorID).tag = "WALL";
getReferenceById(wallRightCorridorID).tag = "WALL";
getReferenceById(wallFirstFinalRoomID).tag = "WALL";
getReferenceById(wallSecondFinalRoomID).tag = "WALL";
getReferenceById(waterFall_1ID).tag = "WALL";
getReferenceById(waterFall_2ID).tag = "WALL";
getReferenceById(waterFall_3ID).tag = "WALL";
getReferenceById(waterFall_4ID).tag = "WALL";

//Soundtags
getReferenceById(stepsID).tag = "STEPS";
getReferenceById(ouchID).tag = "OUCH";
getReferenceById(magic_1ID).tag = "MAGIC";
getReferenceById(magic_2ID).tag = "MAGIC";
getReferenceById(magic_3ID).tag = "MAGIC";
getReferenceById(waterfall_1ID).tag = "WATERFALL";
getReferenceById(waterfall_2ID).tag = "WATERFALL";
getReferenceById(waterfall_3ID).tag = "WATERFALL";
getReferenceById(waterfall_4ID).tag = "WATERFALL";

//Skeleton
getReferenceById(skeletonID).setSpeedSkalar(1);
getReferenceById(skeletonID).movable = true;
getReferenceById(skeletonID).destructible = true;
getReferenceById(skeletonID).health = 4;
getReferenceById(skeletonID).addRoute(new Vector3(12,1,0.5), new Vector3(12,1,2.5));

getReferenceById(skeletonID).addSoundSource(stepsID);
getReferenceById(skeletonID).tag = "ENEMY";

//Link Portals
getReferenceById(portalSmallRoomID).linkPortals(portalCorridorRoomFromSmallRoomID);
getReferenceById(portalCorridorToFinalID).linkPortals(portalFinalFromCorridorID);

//Player Settings
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = ouchID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

//Portal Sounds
getReferenceById(portalSmallRoomID).addSoundSource(magic_1ID);
getReferenceById(portalCorridorToFinalID).addSoundSource(magic_2ID);

//Exit Sound
getReferenceById(exitID).addSoundSource(magic_3ID);

//Waterfall
getReferenceById(waterFall_1ID).collidable = false;
getReferenceById(waterFall_2ID).collidable = false;
getReferenceById(waterFall_3ID).collidable = false;
getReferenceById(waterFall_4ID).collidable = false;

getReferenceById(waterFall_1ID).addSoundSource(waterfall_1ID);
getReferenceById(waterFall_2ID).addSoundSource(waterfall_2ID);
getReferenceById(waterFall_3ID).addSoundSource(waterfall_3ID);
getReferenceById(waterFall_4ID).addSoundSource(waterfall_4ID);


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
g_IAudiCom = i_audicom;

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?