import { play } from '../../lib/AGEngine.js';
import { AGGameArea } from "../../lib/AGGameArea.js";
import { AGObject } from "../../lib/AGObject.js";
import { AGSoundSource } from "../../lib/AGSoundSource.js";
import { AGNavigation } from "../../lib/AGNavigation.js";
import { AGPlayer } from "../../lib/AGPlayer.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";
import { AGPortal } from "../../lib/AGPortal.js";
import { AGRoom } from "../../lib/AGRoom.js";
import { AGItem } from "../../lib/AGItem.js";
import { AGEventHandler } from "../../lib/AGEventHandler.js";
import {AGCondition} from "../../lib/AGCondition.js";
import { Event } from "../../lib/Event.js";
import { IAudiCom } from "./IAudiCom.js";


let eventHandler = new AGEventHandler();
let area = new AGGameArea("ebene", new Vector3(30, 2.5, 10), eventHandler);
let room_1 = area.newRoom("Erster Raum", new Vector3(10.0, 2.5, 10.0), new Vector3(0.0, 0.0, 0.0));

let gegner = new AGObject("gegner", new Vector3(2, 1, 8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, room_1);
let controls = new AGNavigation(38, 40, 37, 39);
let player = new AGPlayer("spieler", new Vector3(8.0, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1), controls);
let player_hit = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, room_1);
let door1 = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let door2 = new AGPortal("Tuere 2", new Vector3(3.0, 1.0, 3.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

area.listener = player;

gegner.addSoundSource(gegner_ss);
gegner.tag = "ENEMY";

room_1.add(gegner);
room_1.add(door1);
room_1.add(door2);
//room_1.add(wallSOUTH);

//player.setSpeedSkalar(1);
player.speed = new Vector3(0.1, 0.0, 0.1);
player.hitSound = player_hit;

room_1.add(player);
room_1.listener = area.listener;

//gegner.addRoute(new Vector3(1,1,10), new Vector3(10,1,10), new Vector3(10, 1, 10), new Vector3(1,1,1));
gegner.addRoute(new Vector3(9, 1, 8), new Vector3(2, 1, 8));

gegner.setSpeedSkalar(1);
gegner.movable = true;

door1.linkPortals(door2);

//EVENT ITEM TEST

let key = new AGItem("Schluessel", "Ein Schluessel zum Oeffnen von Tueren.", 1);
gegner.inventory.addItem(key);
eventHandler.addEvent(new Event(gegner, "ONCONTACT", "MOVE", player, key, 1));

//

room_1.live = true;
//play(area, true);

// TODO: https://github.com/schteppe/cannon.js inkludieren?


//******TEST START******//

export let i_audicom = new IAudiCom(area, room_1);

//render the objects
i_audicom.renderAGRoom(room_1);
i_audicom.renderAGObject(player);
i_audicom.renderAGObject(gegner);
i_audicom.renderAGObject(door1);
i_audicom.renderAGObject(door2);


//*******TEST END*******//




<<<<<<< HEAD
=======
jQuery(function($){
	
	let eventHandler = new AGEventHandler();
	let area = new AGGameArea("ebene", new Vector3(30, 2.5, 10), eventHandler);
	let room_1 = area.newRoom("Erster Raum", new Vector3(10.0, 2.5, 10.0), new Vector3(0.0, 0.0, 0.0));

	let gegner = new AGObject("gegner", new Vector3(2, 1, 8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
	let gegner_ss = new AGSoundSource("schritte", "sounds/steps.wav", true, 1, room_1);
	let controls = new AGNavigation(38, 40, 37, 39);
	let player = new AGPlayer("spieler", new Vector3(8.0, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1), controls);
	let player_hit = new AGSoundSource("hit", "sounds/ouch.mp3", false, 1, room_1);
	let door1 = new AGPortal("Tuere 1", new Vector3(5.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
	let door2 = new AGPortal("Tuere 2", new Vector3(3.0, 1.0, 3.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

	//let wallSOUTH:AGObject = new AGObject("wall_south", new Vector3(5,1,10), new Vector3(1,0,0), new Vector3(5,1,1));

	area.listener = player;

	gegner.addSoundSource(gegner_ss);
	gegner.setSpeedSkalar(0.1);
	gegner.tag = "ENEMY";

	room_1.add(gegner);
	room_1.add(door1);
	room_1.add(door2);
	//room_1.add(wallSOUTH);

	//player.setSpeedSkalar(1);
	player.speed = new Vector3(0.1, 0.0, 0.1);
	player.hitSound = player_hit;

	room_1.add(player);
	room_1.listener = area.listener;

	//gegner.addRoute(new Vector3(1,1,10), new Vector3(10,1,10), new Vector3(10, 1, 10), new Vector3(1,1,1));
	gegner.addRoute(new Vector3(9, 1, 8), new Vector3(2, 1, 8));

	gegner.setSpeedSkalar(1);
	gegner.movable = true;

	door1.linkPortals(door2);

	//EVENT ITEM TEST

	let key = new AGItem("Schluessel", "Ein Schluessel zum Oeffnen von Tueren.", 1);
	gegner.inventory.addItem(key);
	eventHandler.addEvent(new Event(gegner, "ONCONTACT", "MOVE", player, key, 1));

    door1.addCondition(new AGCondition(player, "INVENTORY", key));
    //


	//render the objects
	renderAGRoom(room_1);
	renderAGObject(player);
	renderAGObject(gegner);
	renderAGObject(door1);
	renderAGObject(door2);
	


	room_1.live = true;
	//play(area, true);

	// TODO: https://github.com/schteppe/cannon.js inkludieren?
	
	
	
	
	
	//Play-Button
	let interval;
	$('#btn_start_scene').click(function(){
		play(area, true);
		interval = setInterval(function(){			
			let canvas_objects = room_canvas.getObjects();
			canvas_objects.forEach(function(item, i) {
				if(item.isObject){
	 			   item.left = item.AGObject.position.x*scale_;
	  			   item.top = item.AGObject.position.z*scale_;
	  			   item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);
				   room_canvas.renderAll();
				}
			});	
		}, 30);	
	});
	$('#btn_stop_scene').click(function(){
		play(area, false);
		interval = 0;
	});
});
>>>>>>> a659ddc86f5d498bec6b8ca0b8542f24eba9e327




