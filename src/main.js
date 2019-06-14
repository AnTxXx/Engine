// @flow
import {g_controls, g_eventHandler, g_history, g_references, setControl} from "./AGEngine.js";
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


let controls:AGNavigation = new AGNavigation(38, 40, 37, 39, 32);
let controlsID:number = getIdByReference(controls);
setControl(getReferenceById(controlsID));

let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
let areaID:number = getIdByReference(area);

let room_1:AGRoom = new AGRoom("Erster Raum", new Vector3(10.0, 2.5, 10.0), new Vector3(5.0, 0.0, 5.0), areaID);
let room_1ID:number = getIdByReference(room_1);
getReferenceById(areaID).addRoom(room_1ID);

let gegner:AGObject = new AGObject("gegner", new Vector3(2,1,8), new Vector3(1,0,0), new Vector3(1,1,1));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, room_1ID);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(8.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let player_hit:AGSoundSource = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, room_1ID);
let door1:AGPortal = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let door2:AGPortal = new AGPortal("Tuere 2", new Vector3(3.0, 1.0, 3.0), new Vector3(1,0,0), new Vector3(1,1,1));

let exit1:AGRoomExit = new AGRoomExit("Ausgang", new Vector3(5.0, 1.0, 1.0), new Vector3(1,0,0), new Vector3(1,1,1));

let gegnerID:number = getIdByReference(gegner);
let gegner_ssID:number = getIdByReference(gegner_ss);
let playerID:number = getIdByReference(player);
let player_hitID:number = getIdByReference(player_hit);
let door1ID:number = getIdByReference(door1);
let door2ID:number = getIdByReference(door2);
let exit1ID:number = getIdByReference(exit1);

//let wallSOUTH:AGObject = new AGObject("wall_south", new Vector3(5,1,10), new Vector3(1,0,0), new Vector3(5,1,1));

getReferenceById(areaID).listener = getIdByReference(player);

getReferenceById(gegnerID).addSoundSource(gegner_ssID);
getReferenceById(gegnerID).tag = "ENEMY";

getReferenceById(room_1ID).add(gegnerID);
getReferenceById(room_1ID).add(door1ID);
getReferenceById(room_1ID).add(door2ID);
getReferenceById(room_1ID).add(exit1ID);
//room_1.add(wallSOUTH);

//player.setSpeedSkalar(1);
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = player_hitID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;

getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).listener = getReferenceById(areaID).listener;

//gegner.addRoute(new Vector3(1,1,10), new Vector3(10,1,10), new Vector3(10, 1, 10), new Vector3(1,1,1));
getReferenceById(gegnerID).addRoute(new Vector3(9,1,8), new Vector3(2,1,8));


//gegner.setSpeedSkalar(1);
//gegner.movable = true;

getReferenceById(gegnerID).setSpeedSkalar(2);
getReferenceById(gegnerID).movable = true;

getReferenceById(gegnerID).destructible = true;
getReferenceById(gegnerID).health = 4;

getReferenceById(door1ID).linkPortals(door2ID);


//EVENT ITEM TEST

let key:AGItem = new AGItem("Schluessel", "Ein Schluessel zum Oeffnen von Tueren.", 1);
let keyID:number = getIdByReference(key);

getReferenceById(gegnerID).inventory.addItem(keyID);
g_eventHandler.addEvent(new Event(gegnerID, "ONCONTACT", "MOVE", playerID, keyID, 1));
getReferenceById(door1ID).addCondition(new AGCondition(playerID, "INVENTORY", keyID));

//EVENT ITEM TEST

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_references);

export let i_audicom = new IAudiCom(areaID, room_1ID);

//render the objects
i_audicom.renderAGRoom(getReferenceById(room_1ID));
i_audicom.renderAGObject(getReferenceById(playerID));
i_audicom.renderAGObject(getReferenceById(gegnerID));
i_audicom.renderAGObject(getReferenceById(door1ID));
i_audicom.renderAGObject(getReferenceById(door2ID));
i_audicom.renderAGObject(getReferenceById(exit1ID));

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?