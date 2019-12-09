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

let controls = new AGNavigation(-1, -1, 37, 39, 67);
let controlsID = getIdByReference(controls);
setControl(getReferenceById(controlsID));

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
let enemy4 = new AGObject("Gegner 4", new Vector3(12.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let enemy1_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy2_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy3_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let enemy4_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);

let arrow = new AGSoundSource("Pfeil", "sounds/arrow.wav", false, 1, room_1ID);
let monsterDeath_enemy1 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
let monsterDeath_enemy2 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
let monsterDeath_enemy3 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
let monsterDeath_enemy4 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);

let steps = new AGSoundSource("Schritte", "sounds/steps.wav", true, 1, room_1ID);

let environmental1 = new AGObject("Wasserfall", new Vector3(19.3, 1.0, 2.1), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let environmental1SS = new AGSoundSource("Wasserfall Sound", "sounds/waterfall.wav", true, 1, room_1ID);

let environmental2 = new AGObject("Fledermaus", new Vector3(7.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let environmental2SS = new AGSoundSource("Fledermaus Sound", "sounds/bats.wav", true, 1, room_1ID);

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

let monsterDeathEnemy1SS_ID = monsterDeath_enemy1.ID;
let monsterDeathEnemy2SS_ID = monsterDeath_enemy2.ID;
let monsterDeathEnemy3SS_ID = monsterDeath_enemy3.ID;
let monsterDeathEnemy4SS_ID = monsterDeath_enemy4.ID;

let stepsID = steps.ID;

let arrow_ID = arrow.ID;

let environmental1_ID = environmental1.ID;
let environmental1SS_ID = environmental1SS.ID;
let environmental2_ID = environmental2.ID;
let environmental2SS_ID = environmental2SS.ID;

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

getReferenceById(room_1ID).add(environmental1_ID);
getReferenceById(room_1ID).add(environmental2_ID);

getReferenceById(wall1_ID).tag = "WALL";
getReferenceById(wall2_ID).tag = "WALL";
getReferenceById(wall3_ID).tag = "WALL";

getReferenceById(environmental1_ID).tag = "WATERFALL";

getReferenceById(enemy1_ID).tag = "ENEMY";
getReferenceById(enemy2_ID).tag = "ENEMY";
getReferenceById(enemy3_ID).tag = "ENEMY";
getReferenceById(enemy4_ID).tag = "ENEMY";

getReferenceById(monsterDeathEnemy1SS_ID).tag = 'FAINTING';
getReferenceById(monsterDeathEnemy2SS_ID).tag = 'FAINTING';
getReferenceById(monsterDeathEnemy3SS_ID).tag = 'FAINTING';
getReferenceById(monsterDeathEnemy4SS_ID).tag = 'FAINTING';

getReferenceById(stepsID).tag = 'STEPS';
getReferenceById(arrow_ID).tag = 'FAINTING';

//getReferenceById(playerID).tag = "ENEMY";

//Player Settings
getReferenceById(playerID).setSpeedSkalar(2);
getReferenceById(playerID).hitSound = ouchID;
getReferenceById(playerID).movable = true;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 4;

//getReferenceById(playerID).addSoundSource(stepsID);
getReferenceById(playerID).interactionSound = arrow_ID;
getReferenceById(playerID).interactionCooldown = 500;

//getReferenceById(playerID).movementSound = stepsID;


getReferenceById(playerID).addRoute(new Vector3(2.16, 1, 6.07), new Vector3(2.22, 1, 1.28), new Vector3(6.33, 1, 0.73), new Vector3(12.89, 1, 2.82), new Vector3(17.67, 1, 0.84), new Vector3(18.38, 1, 4.8), new Vector3(13.02, 1, 5.93), new Vector3(7.29, 1, 5.15), new Vector3(5.87, 1, 6.78), new Vector3(8.89, 1, 8.53), new Vector3(12.42, 1, 7.42), new Vector3(18.8, 1, 8.49), new Vector3(18.84, 1, 10.02), new Vector3(1.96, 1, 9.95));

//Enemy Settings
getReferenceById(enemy1_ID).destructible = true;
getReferenceById(enemy1_ID).health = 1;
getReferenceById(enemy1_ID).movable = false;
getReferenceById(enemy1_ID).collidable = true;
getReferenceById(enemy1_ID).setAliveSound = enemy1_ss_ID;
getReferenceById(enemy1_ID).deathSound = monsterDeathEnemy1SS_ID;

//Enemy Settings
getReferenceById(enemy2_ID).destructible = true;
getReferenceById(enemy2_ID).health = 1;
getReferenceById(enemy2_ID).movable = false;
getReferenceById(enemy2_ID).collidable = true;
getReferenceById(enemy2_ID).setAliveSound = enemy2_ss_ID;
getReferenceById(enemy2_ID).deathSound = monsterDeathEnemy2SS_ID;

//Enemy Settings
getReferenceById(enemy3_ID).destructible = true;
getReferenceById(enemy3_ID).health = 1;
getReferenceById(enemy3_ID).movable = false;
getReferenceById(enemy3_ID).collidable = true;
getReferenceById(enemy3_ID).setAliveSound = enemy3_ss_ID;
getReferenceById(enemy3_ID).deathSound = monsterDeathEnemy3SS_ID;

//Enemy Settings
getReferenceById(enemy4_ID).destructible = true;
getReferenceById(enemy4_ID).health = 1;
getReferenceById(enemy4_ID).movable = false;
getReferenceById(enemy4_ID).collidable = true;
getReferenceById(enemy4_ID).setAliveSound = enemy4_ss_ID;
getReferenceById(enemy4_ID).deathSound = monsterDeathEnemy4SS_ID;

//Environmental Settings
getReferenceById(environmental1_ID).addSoundSource(environmental1SS_ID);
getReferenceById(environmental1_ID).collidable = false;

getReferenceById(environmental2SS_ID).maxDistance = 4;
getReferenceById(environmental2_ID).addSoundSource(environmental2SS_ID);
getReferenceById(environmental2_ID).collidable = false;

//Coins
let coin_1 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
let coin_2 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
let coin_3 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
let coin_4 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);

let coin1_ID = coin_1.ID;
let coin2_ID = coin_2.ID;
let coin3_ID = coin_3.ID;
let coin4_ID = coin_4.ID;

//Events
let eventEnemy1 = new Event(enemy1_ID, "ONDEATH", "MOVE", playerID, coin1_ID, 1);
let eventEnemy2 = new Event(enemy2_ID, "ONDEATH", "MOVE", playerID, coin2_ID, 1);
let eventEnemy3 = new Event(enemy3_ID, "ONDEATH", "MOVE", playerID, coin3_ID, 1);
let eventEnemy4 = new Event(enemy4_ID, "ONDEATH", "MOVE", playerID, coin4_ID, 1);

let eventEnemy1_ID = eventEnemy1.ID;
let eventEnemy2_ID = eventEnemy2.ID;
let eventEnemy3_ID = eventEnemy3.ID;
let eventEnemy4_ID = eventEnemy4.ID;

getReferenceById(enemy1_ID).inventory.addItemById(coin1_ID);
g_eventHandler.addEvent(eventEnemy1_ID);
getReferenceById(enemy2_ID).inventory.addItemById(coin2_ID);
g_eventHandler.addEvent(eventEnemy2_ID);
getReferenceById(enemy3_ID).inventory.addItemById(coin3_ID);
g_eventHandler.addEvent(eventEnemy3_ID);
getReferenceById(enemy4_ID).inventory.addItemById(coin4_ID);
g_eventHandler.addEvent(eventEnemy4_ID);

let globalEventFinish = new GlobalEvent(playerID, "INVENTORY", "countByType", ["coin"], 4, "WINGAME", 1);
g_eventHandler.addGlobalEvent(globalEventFinish.ID);

//g_eventHandler.removeEventByID(eventEnemy1_ID);

//getReferenceById(globalEventFinish.ID).object = enemy1_ID;
//getReferenceById(enemy1_ID).kill();
//console.log(g_references);

let portal1 = new AGPortal("Portal im Weg", new Vector3(2.1, 1, 7.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let portal2 = new AGPortal("Portal nicht im Weg", new Vector3(8.9, 1, 5.4), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let portal3 = new AGPortal("Portal mit Condition", new Vector3(19.2, 1, 7.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

getReferenceById(room_1ID).add(portal1.ID);
getReferenceById(room_1ID).add(portal2.ID);
getReferenceById(room_1ID).add(portal3.ID);

getReferenceById(portal1.ID).linkPortals(portal2.ID);
let cond = new AGCondition(playerID, "INVENTORY", "hasItemById", [coin1_ID], true);
getReferenceById(portal2.ID).addConditionById(cond.ID);

getReferenceById(room_1ID).live = true;
//play(area, true);

console.log(g_history);

//g_history.rebuild();

//console.log(g_gamearea.AGRooms[0].AGobjects);
//console.log(g_references);

export let i_audicom = new IAudiCom();
setIAudiCom(i_audicom);

// TODO: eine art pushforce pro objekt, damit das staerkere Objekt das schwaechere zurueckdraengen kann?