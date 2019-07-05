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

let room_1 = new AGRoom("Erster Raum", new Vector3(10.0, 2.5, 19.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallWestSmallRoom = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
let wallNorthSmallRoom = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(5, 1, 1));
let portalSmallRoom = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallSouthCorridor = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1, 0, 0), new Vector3(19, 1, 1));
let wallLeftCorridor = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
let wallRightCorridor = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
let portalCorridorRoomFromSmallRoom = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let skeleton = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let portalCorridorToFinal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let portalFinalFromCorridor = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallFirstFinalRoom = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
let wallSecondFinalRoom = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.7), new Vector3(1, 0, 0), new Vector3(1, 1, 3.34));
let waterFall = new AGObject("Waterfall", new Vector3(8.7, 1, 0.5), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
let skeletonSound = new AGSoundSource("SkeletonSound", "sounds/steps.wav", true, 1, room_1ID);
let playerHit = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, room_1ID);

let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);
let wallWestSmallRoomID = getIdByReference(wallWestSmallRoom);
let wallNorthSmallRoomID = getIdByReference(wallNorthSmallRoom);
let portalSmallRoomID = getIdByReference(portalSmallRoom);
let wallSouthCorridorID = getIdByReference(wallSouthCorridor);
let wallLeftCorridorID = getIdByReference(wallLeftCorridor);
let wallRightCorridorID = getIdByReference(wallRightCorridor);
let portalCorridorRoomFromSmallRoomID = getIdByReference(portalCorridorRoomFromSmallRoom);
let skeletonID = getIdByReference(skeleton);
let portalCorridorToFinalID = getIdByReference(portalCorridorToFinal);
let portalFinalFromCorridorID = getIdByReference(portalFinalFromCorridor);
let wallFirstFinalRoomID = getIdByReference(wallFirstFinalRoom);
let wallSecondFinalRoomID = getIdByReference(wallSecondFinalRoom);
let waterFallID = getIdByReference(waterFall);
let skeletonSoundID = getIdByReference(skeletonSound);
let playerHitID = getIdByReference(playerHit);

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
getReferenceById(room_1ID).add(waterFallID);

//Skeleton
getReferenceById(skeletonID).setSpeedSkalar(2);
getReferenceById(skeletonID).movable = true;
getReferenceById(skeletonID).destructible = true;
getReferenceById(skeletonID).health = 4;
getReferenceById(skeletonID).addRoute(new Vector3(9, 1, 8), new Vector3(2, 1, 8));

getReferenceById(skeletonID).addSoundSource(skeletonSoundID);
getReferenceById(skeletonID).tag = "ENEMY";

//Link Portals
getReferenceById(portalSmallRoomID).linkPortals(portalCorridorRoomFromSmallRoomID);
getReferenceById(portalCorridorToFinalID).linkPortals(portalFinalFromCorridorID);

getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = playerHitID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

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