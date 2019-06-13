// @flow
import { g_references, g_gamearea } from './AGEngine.js';
import {g_controls, g_eventHandler, g_history, setControl} from "./AGEngine.js";
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


let controls:AGNavigation = new AGNavigation(38, 40, 37, 39, 32);
let area:AGGameArea = new AGGameArea("ebene", new Vector3(30,2.5,10));
let room_1:AGRoom = area.newRoom("Erster Raum", new Vector3(10.0, 2.5, 10.0), new Vector3(5.0, 0.0, 5.0));
setControl(controls);

let gegner:AGObject = new AGObject("gegner", new Vector3(2,1,8), new Vector3(1,0,0), new Vector3(1,1,1));
let gegner_ss:AGSoundSource = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, room_1);
let player:AGPlayer = new AGPlayer("spieler", new Vector3(8.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let player_hit:AGSoundSource = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, room_1);
let door1:AGPortal = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 5.0), new Vector3(1,0,0), new Vector3(1,1,1));
let door2:AGPortal = new AGPortal("Tuere 2", new Vector3(3.0, 1.0, 3.0), new Vector3(1,0,0), new Vector3(1,1,1));

let exit1:AGRoomExit = new AGRoomExit("Ausgang", new Vector3(5.0, 1.0, 1.0), new Vector3(1,0,0), new Vector3(1,1,1));

//let wallSOUTH:AGObject = new AGObject("wall_south", new Vector3(5,1,10), new Vector3(1,0,0), new Vector3(5,1,1));

area.listener = player;

gegner.addSoundSource(gegner_ss);
gegner.tag = "ENEMY";

room_1.add(gegner);
room_1.add(door1);
room_1.add(door2);
room_1.add(exit1);
//room_1.add(wallSOUTH);

//player.setSpeedSkalar(1);
player.speed = new Vector3(0.1, 0.0, 0.1);
player.hitSound = player_hit;

player.dangerous = true;
player.damage = 1;
player.range = 2;

room_1.add(player);
room_1.listener = area.listener;

//gegner.addRoute(new Vector3(1,1,10), new Vector3(10,1,10), new Vector3(10, 1, 10), new Vector3(1,1,1));
gegner.addRoute(new Vector3(9,1,8), new Vector3(2,1,8));


//gegner.setSpeedSkalar(1);
//gegner.movable = true;

gegner.setSpeedSkalar(2);
gegner.movable = true;

gegner.destructible = true;
gegner.health = 4;

door1.linkPortals(door2);


//EVENT ITEM TEST


let key:AGItem = new AGItem("Schluessel", "Ein Schluessel zum Oeffnen von Tueren.", 1);
gegner.inventory.addItem(key);
g_eventHandler.addEvent(new Event(gegner, "ONCONTACT", "MOVE", player, key, 1));
door1.addCondition(new AGCondition(player, "INVENTORY",key ));

//EVENT ITEM TEST

console.log(g_history);

room_1.live = true;
//play(area, true);

export let i_audicom = new IAudiCom(area, room_1);

//render the objects
i_audicom.renderAGRoom(room_1);
i_audicom.renderAGObject(player);
//i_audicom.renderAGObject(gegner);
//i_audicom.renderAGObject(door1);
//i_audicom.renderAGObject(door2);
//i_audicom.renderAGObject(exit1);

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?