import { play } from '../../lib/AGEngine.js';
import { AGGameArea } from "../../lib/AGGameArea.js";
import { AGObject } from "../../lib/AGObject.js";
import { AGSoundSource } from "../../lib/AGSoundSource.js";
import { AGNavigation } from "../../lib/AGNavigation.js";
import { AGPlayer } from "../../lib/AGPlayer.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";
import { AGPortal } from "../../lib/AGPortal.js";
import { AGRoom } from "../../lib/AGRoom.js";
import { AGRoomExit } from "../../lib/AGRoomExit.js";
import { AGItem } from "../../lib/AGItem.js";
import { AGEventHandler } from "../../lib/AGEventHandler.js";
import { getIdByReference, getReferenceById, g_history, g_gamearea } from "../../lib/AGEngine.js";


import { Event } from "../../lib/Event.js";


export class IAudiCom {
	

    set position(value) {
        this._scale = value;
    }
    get position() {
        return this._scale;
    }
	
    set room_canvas(value) {
        this._room_canvas = value;
    }
    get room_canvas() {
        return this._room_canvas;
    }
	
    /**
     * Bla
     */
    constructor() {
		this._scale = 55;
		this._vision_mode = 0;
		
		this._interval = '';
		
		this._room_canvas = new fabric.Canvas('c',{
		    selection: false, 
		});
		
		this._colors = [
		  	['#e2e2e2', '#000060'], //0 canvas
		  	['#ebebeb', '#cccccc'],	//1 grid
		  	['#A06FEB', '#FFFACD'],	//2 player
		  	['#d47070', '#F7CA18'],	//3 enemy
		  	['#FDA038', '#DDA0DD'],	//4 wall, portal, exit
			['#60cd4b', '#38fd4f'],	//5 colors for highlighted objects
			['#000000', '#ffffff'],	//6 colors for path-points
			['#000000', '#f02727'],	//7 colors for path-lines
		];
		
		this.renderScene();

    }
	
    /**
     * Returns the color value of an interface element for the vision mode
     * @param index of interface element
     */
	toggleVisionMode(){
		
		this._vision_mode = +!this._vision_mode;

		this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];
		this._room_canvas.getObjects().forEach(object=>{
			switch(object.type){
			
				case 'grid_line':
					object.set("stroke", this._colors[1][this._vision_mode]);
					break;

				case 'player':
					object.set("fill", this._colors[2][this._vision_mode]);
					object.set("fill", this._colors[2][this._vision_mode]);
					break;

				case 'enemy':
					object.set("fill", this._colors[3][this._vision_mode]);

					break;
				case 'portal':

					object.set("fill", this._colors[4][this._vision_mode]);
					
					break;
				case 'wall':
					object.set("fill", this._colors[4][this._vision_mode]);
					break;
				case 'path_dot':
					
					object.set("fill", this._colors[6][this._vision_mode]);
					break;
				case 'path_line':
					object.set("fill", this._colors[7][this._vision_mode]);
					object.set("stroke", this._colors[7][this._vision_mode]);
					break;
			}
		});
		
		
		
		this._room_canvas.renderAll();

		//toggle contrast class for css
		$( "h1,h2,h3,h4,h5,h6,body,#sb_object_enemy,.sb_object_structure,.btn,#canvas_container,label" ).toggleClass("contrast");

	}
	
	startArea(){
		let room_buffer = this._room_canvas;
		let scale_buffer = this._scale;
		let canvas_objects = room_buffer.getObjects();
		
		play(getReferenceById(g_gamearea.ID), true);
		
		this._interval = setInterval(function(){				
			canvas_objects.forEach(function(item, i) {
				if(item.isObject){
	 				// item.left = item.AGObject.position.x*scale_buffer + item.AGObject.size.x*scale_buffer/2;
					// item.top = item.AGObject.position.z*scale_buffer + item.AGObject.size.z*scale_buffer/2;
					// item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);
					
					//remove "dead" objects
					if(getReferenceById(item.AGObjectID).destructible && getReferenceById(item.AGObjectID).health <= 0){
					//remove path of dead enemies	
						if(item.type == 'enemy'){
							item.PathArray.forEach(function(ele) {
								room_buffer.remove(ele);
							});
						}
						room_buffer.remove(item);
					}
					if(item.type == 'exit'){	
						if(getReferenceById(item.AGObjectID).reached){
							$('#win_screen').fadeIn(100);
						}						
					}
	 			   	item.left = getReferenceById(item.AGObjectID).position.x*scale_buffer;
	  			   	item.top = getReferenceById(item.AGObjectID).position.z*scale_buffer;
	  			   	item.set('angle', Math.atan2(getReferenceById(item.AGObjectID).direction.z, getReferenceById(item.AGObjectID).direction.x) * 180 / Math.PI);  
				}
			});	
			room_buffer.renderAll();
		}, 33);	
	}
	stopArea(){
		play(getReferenceById(g_gamearea.ID), false);
		this._interval = false;	
		
		this._room_canvas.clear();		
		g_history.rebuild();

 		this.renderScene();
		
		//let canvas_objects = canvas_buffer.getObjects();
		//canvas_buffer.dispose();
		//$('#c').empty();
		
		
		
		//console.log(g_gamearea.AGRooms);
		
		//let rooms_buffer = g_gamearea.AGRooms;
		
		//TODO HIER GEHTS WEITER :)
		// console.log(rooms_buffer[0].AGobjects);
// 		this.renderAGRoom(rooms_buffer[0]);
// 		if(rooms_buffer[0].AGobjects.length > 0){
// 			rooms_buffer[0].AGobjects.forEach(function(element) {
//  				this.renderAGObject(element);
// 			});
// 		}

		
	}
  	
	
	renderScene(){
		//console.log(getReferenceById(g_gamearea.ID));
		let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
		
		this._AGroomID = rooms_buffer[0].ID;
		this.renderAGRoom(this._AGroomID);
		
		let this_buffer = this;
		if(rooms_buffer[0].AGobjects.length > 0){
			rooms_buffer[0].AGobjects.forEach(function(element) {
 				this_buffer.renderAGObject(element.ID);
				//console.log(element.tag + ": " + element.position.x)
				//console.log(element.position.x);
			});
		}
	}
	
	
	zoomCanvas(zoom_factor){
		//min : 0.5
		//max : 1.5
		
		
		
		let room_buffer = this._room_canvas;
		room_buffer.setZoom(room_buffer.getZoom()*zoom_factor);
		//set stroke-width to 1 again
		let canvas_objects = room_buffer.getObjects();
		canvas_objects.forEach(function(item, i) {
			if(item.type == 'grid_line'){
				item.strokeWidth = (1/room_buffer.getZoom())*1;
			}
		});
		
		//console.log(room_buffer.width*room_buffer.getZoom());
		let width_buffer = room_buffer.width*room_buffer.getZoom();
		let height_buffer = room_buffer.height*room_buffer.getZoom();
		let middle_width_buffer = $('#ui_part_middle').width();
		
		
		// $('.canvas-container').height(room_buffer.height*room_buffer.getZoom());
		// $('.canvas_room').height(room_buffer.height*room_buffer.getZoom());
		//
		// $('.canvas-container').width(room_buffer.width*room_buffer.getZoom());
		// $('.canvas_room').width(room_buffer.width*room_buffer.getZoom());
		
		if(width_buffer < middle_width_buffer){
			$('#canvas_container').width(room_buffer.width*room_buffer.getZoom());
			$('#canvas_container').addClass('canvas_no_overflow_x');
		}else{
			$('#canvas_container').removeClass('canvas_no_overflow_x');
		}
		
		if(height_buffer < 600){
			
			$('#canvas_container').addClass('canvas_no_overflow_y');
			
			$('#canvas_container').height(room_buffer.height*room_buffer.getZoom());
			$('#canvas_container').height(room_buffer.height*room_buffer.getZoom());
			
		}else{
			$('#canvas_container').height(600);
			$('#canvas_container').removeClass('canvas_no_overflow_y');
		}
		
		
		
		room_buffer.renderAll();
	}
	
	
	addSoundSource(ss_name){
		console.log(ss_name);
		switch(ss_name){
			case 'steps':
				
				break;
			case 'waterfall':
				
				break;
			case 'magic':
				
				break;
			case 'none':
				
				break;
			
		}
		
	}
	
	renderAGRoom(ag_roomID){
		
	
		
		this._room_canvas.setWidth(getReferenceById(ag_roomID).size.x * this._scale);
		this._room_canvas.setHeight(getReferenceById(ag_roomID).size.z * this._scale);

		let options = {
		   distance: this._scale,
		   width: this._room_canvas.width,
		   height: this._room_canvas.height,
		   param: {
		   		stroke: this._colors[1][this._vision_mode],
		   		strokeWidth: 1,
		   		selectable: false,
			  	type:'grid_line'
		   }
		};

		
		
		//grid for the canvas
		let gridHeight = options.height / options.distance;
		let gridLen = options.width / options.distance;
		
		for (var i = 0; i < gridLen; i++) {
			var distance   = i * options.distance,
			vertical = new fabric.Line([ distance, 0, distance, options.height], options.param);
			 
			this._room_canvas.add(vertical);
		 
		};
		
		for (var i = 0; i < gridHeight; i++) {
		  	var distance   = i * options.distance,
		 	horizontal   = new fabric.Line([ 0, distance, options.width, distance], options.param);
		 	this._room_canvas.add(horizontal);
		};
		
		
		this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];
		this._room_canvas.renderAll();

		//snapping-Stuff (Quelle: https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize)
		this._room_canvas.on('object:moving', options => {
			//Change wally to wall to reactivate scaling
			if(options.target.type == 'wally'){
	 			options.target.set({
	 			   left: Math.round((options.target.left) / this._scale) * this._scale,
	 			   top: Math.round((options.target.top) / this._scale) * this._scale 
	 			});
			}
			
			
			if(options.target.type == 'portal' && options.target.line){

				options.target.line.set({ 'x1': options.target.left, 'y1': options.target.top });
				options.target.line.dot.set({ 'left': options.target.left-4, 'top': options.target.top-4 });
				this.getFabricObject(options.target.secDoor).line.set({ 'x2': options.target.left, 'y2': options.target.top });
		

			}
			
			//options.target.AGObject.position = new Vector3((options.target.left - options.target.AGObject.size.x*this._scale/2)/this._scale, 1, (options.target.top - options.target.AGObject.size.z*this._scale/2)/this._scale);
			
			
			getReferenceById(options.target.AGObjectID).position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
			
		});
		
		let w = 0;
		this._room_canvas.on('object:scaling', options => {	
			let target = options.target;
	
			//console.log("Size: " + options.target.width*target.scaleX/this._scale + " " + options.target.height*target.scaleY/this._scale);
			//console.log("Position: " + options.target.left/this._scale + " " + options.target.top/this._scale);
			
			getReferenceById(options.target.AGObjectID).size = new Vector3(options.target.width*target.scaleX/this._scale, 1, options.target.height*target.scaleY/this._scale);
			getReferenceById(options.target.AGObjectID).position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
			
			
			if(!target.strokeWidthUnscaled && target.strokeWidth){
				target.strokeWidthUnscaled = target.strokeWidth;
			}
			if(target.strokeWidthUnscaled){
				var scale_buffer = target.scaleX > target.scaleY ? target.scaleX : target.scaleY;
				target.strokeWidth = target.strokeWidthUnscaled / scale_buffer;
			}
			
	
			
		});
	}

	//
	makeThenRenderAGObject(obj_type, obj_left, obj_top){

		let obj_buffer;
		let obj_buffer_ID;
		switch(obj_type){
			
			case 'enemy':
				
				obj_buffer = new AGObject("AGgegner", new Vector3((obj_left/this._scale), 1, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				
				obj_buffer_ID = getIdByReference(obj_buffer);
				
				
				getReferenceById(obj_buffer_ID).tag = "ENEMY";
				
				let gegner_ss = new AGSoundSource("urbiurbiurbi", "sounds/car.mp3", true, 1, this._AGroomID);
				let gegner_ss_ID = getIdByReference(gegner_ss);
				
				getReferenceById(obj_buffer_ID).addSoundSource(gegner_ss_ID);
				getReferenceById(obj_buffer_ID).setSpeedSkalar(0);
				
				break;

			case 'wall':
				
				//calculate snapping points for wall
	  	    	// let snap_buffer = { // Closest snapping points
// 	  	        	top: Math.round((obj_top) / this._scale) * this._scale,
// 	  	        	left: Math.round((obj_left) / this._scale) * this._scale,
// 	  	        	bottom: Math.round((obj_top + this._scale) / this._scale) * this._scale,
// 	  	        	right: Math.round((obj_left+ this._scale) / this._scale) * this._scale
// 	  	     	};
//
// 				let snap_top_buffer = snap_buffer.top < snap_buffer.bottom ? snap_buffer.top : snap_buffer.bottom;
// 				let snap_left_buffer = snap_buffer.left < snap_buffer.right ? snap_buffer.left : snap_buffer.right;
				
				obj_buffer = new AGObject("Structure", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer_ID = getIdByReference(obj_buffer);
				getReferenceById(obj_buffer_ID).tag = "WALL";
				
				break;
			case 'portal':
				obj_buffer = new AGPortal("Portal", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer_ID = getIdByReference(obj_buffer);
				
				break;
			case 'exit':

				obj_buffer = new AGRoomExit("Exit", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer_ID = getIdByReference(obj_buffer);
				break;
			
		}
		
		
		
		
		getReferenceById(this._AGroomID).add(obj_buffer_ID);
		this.renderAGObject(obj_buffer_ID);
	}
	
	
	getFabricObject(ag_objectID){
		let canvas_objects = this._room_canvas.getObjects();
		let fab_buffer;
		canvas_objects.forEach(function(item, i) {
			if(item.isObject && item.AGObjectID == ag_objectID){
				fab_buffer = item;
			}
		});	
		return fab_buffer;
	}
	
	
	

	//AGObjects
	renderAGObject(ag_objectID){
		
		let _scalebuffer = this._scale
		let colors_buffer = this._colors;
		let vision_mode_buffer = this._vision_mode;
		let room_canvas_buffer = this._room_canvas;
		
		if(getReferenceById(ag_objectID).tag){
			
			switch(getReferenceById(ag_objectID).tag){
				case 'ENEMY':
					fabric.loadSVGFromURL('ui/img/enemy.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(getReferenceById(ag_objectID).size.x*_scalebuffer);
					  	obj.scaleToHeight(getReferenceById(ag_objectID).size.z*_scalebuffer);
					  	// obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer + getReferenceById(ag_objectID).size.x*_scalebuffer/2;
// 					    obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer + getReferenceById(ag_objectID).size.z*_scalebuffer/2;

						obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
						obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;
						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[3][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
					 	obj.PathArray = [];
						obj.LineArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'enemy';
						obj.originX = 'center';
						obj.originY = 'center';

						obj.hasRotatingPoint = false; 
						obj.lockScalingX = true;
						obj.lockScalingY = true;
						obj.setControlsVisibility({
						    mt: false, // middle top disable
						    mb: false, // midle bottom
						    ml: false, // middle left
						    mr: false, // I think you get it
							tr: false,
							tl: false,
							br: false,
							bl: false,
						});
						
						if(getReferenceById(ag_objectID).route.length > 0){
							getReferenceById(ag_objectID).route.forEach(function (item, index) {
								let dot = new fabric.Circle({
								    left:   (item.x*_scalebuffer)-4,
								    top:    (item.z*_scalebuffer)-4,
								    radius: 4,
								   	fill:   colors_buffer[6][vision_mode_buffer],
								    objectCaching: false,
									selectable: false,
									opacity: 0,
									type: 'path_dot'
								});
								
								if(obj.PathArray.length >= 1){
									
									let last_dot_buffer = obj.PathArray[obj.PathArray.length-1];
									let line = new fabric.Line([dot.left + 4, dot.top + 4,last_dot_buffer.left + 4, last_dot_buffer.top + 4],{
										fill: colors_buffer[7][vision_mode_buffer],
										stroke: colors_buffer[7][vision_mode_buffer],
										strokeWidth: 2,
										selectable: false,
										evented: false,
										opacity: 0,
										type: 'path_line'
									});
									obj.LineArray.push(line);
									room_canvas_buffer.add(line);
								}

								obj.PathArray.push(dot);
								room_canvas_buffer.add(dot);
								
							});
						}
					  	room_canvas_buffer.add(obj).renderAll();
					});
					break;
			
				case 'WALL':
					var obj = new fabric.Rect({
						width: getReferenceById(ag_objectID).size.x*_scalebuffer,
						height: getReferenceById(ag_objectID).size.z*_scalebuffer,
						fill: colors_buffer[4][vision_mode_buffer],
					
						left: getReferenceById(ag_objectID).position.x*_scalebuffer,
						top: getReferenceById(ag_objectID).position.z*_scalebuffer,
						
						AGObjectID: ag_objectID,
						isObject: true,	
						name: getReferenceById(ag_objectID).name,
						type: 'wall',
						strokeWidth: 1,
						originX: 'center',
						originY: 'center',
					});
					obj.hasRotatingPoint = false; 
					room_canvas_buffer.add(obj).renderAll();
					break;
			}
		
		}else if(getReferenceById(ag_objectID).type){
			switch(getReferenceById(ag_objectID).type){
				case 'PORTAL':	
					fabric.loadSVGFromURL('ui/img/portal.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(getReferenceById(ag_objectID).size.x*_scalebuffer);
					  	obj.scaleToHeight(getReferenceById(ag_objectID).size.z*_scalebuffer);
					
					  	obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
					    obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;
						
						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
					 	
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'portal';
						if(getReferenceById(ag_objectID).exit){
							let secDoorAGObject =  getReferenceById(ag_objectID).exit
							
							obj.secDoor = getIdByReference(secDoorAGObject);
							
							let dot = new fabric.Circle({
							    left:   obj.left-4,
							    top:    obj.top-4,
							    radius: 4,
							    fill:   colors_buffer[6][vision_mode_buffer],
							    objectCaching: false,
								selectable: false,
								type: 'portal_dot',
								opacity:0,
							});
							//draw line between portals
							let line = new fabric.Line([obj.left, obj.top, secDoorAGObject.position.x*_scalebuffer, secDoorAGObject.position.z*_scalebuffer],{
								fill: colors_buffer[7][vision_mode_buffer],
								stroke: colors_buffer[7][vision_mode_buffer],
								strokeWidth: 2,
								selectable: false,
								evented: false,
								type: 'portal_line',
								dot: dot,
								opacity:0,
							});
							

							obj.line = line;
							obj.line.dot = dot;
							room_canvas_buffer.add(dot);
							room_canvas_buffer.add(line);
	
							
						}else{
							obj.secDoor = false;
							obj.line = false;
						}
						
						obj.originX = 'center';
						obj.originY = 'center';
						
						obj.hasRotatingPoint = false; 
						obj.lockScalingX = true;
						obj.lockScalingY = true;
						obj.setControlsVisibility({
						    mt: false, // middle top disable
						    mb: false, // midle bottom
						    ml: false, // middle left
						    mr: false, // I think you get it
							tr: false,
							tl: false,
							br: false,
							bl: false,
						});
					  	room_canvas_buffer.add(obj).renderAll();
					});
					break;
					
				case 'EXIT':	
					fabric.loadSVGFromURL('ui/img/exit.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(getReferenceById(ag_objectID).size.x*_scalebuffer);
					  	obj.scaleToHeight(getReferenceById(ag_objectID).size.z*_scalebuffer);
					  	// obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer + getReferenceById(ag_objectID).size.x*_scalebuffer/2;
// 					    obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer + getReferenceById(ag_objectID).size.z*_scalebuffer/2;
						
					  	obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
					    obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;
						
						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'exit';
						obj.secDoor = false;
						obj.originX = 'center';
						obj.originY = 'center';
						obj.hasRotatingPoint = false; 
						obj.lockScalingX = true;
						obj.lockScalingY = true;
						obj.setControlsVisibility({
						    mt: false, // middle top disable
						    mb: false, // midle bottom
						    ml: false, // middle left
						    mr: false, // I think you get it
							tr: false,
							tl: false,
							br: false,
							bl: false,
						});
						room_canvas_buffer.add(obj).renderAll();
						
					});
					break;
					
				case 'PLAYER':
					//TODO change size of player
					fabric.loadSVGFromURL('ui/img/player.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(1*_scalebuffer);
					  	obj.scaleToHeight(1*_scalebuffer);
					  		
						obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
						obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;

						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[2][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
						obj.isObject = true;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'player';
					  	room_canvas_buffer.add(obj).renderAll();
						obj.originX = 'center';
						obj.originY = 'center';
						obj.hasRotatingPoint = false; 
						obj.lockScalingX = true;
						obj.lockScalingY = true;
						obj.setControlsVisibility({
						    mt: false, // middle top disable
						    mb: false, // midle bottom
						    ml: false, // middle left
						    mr: false, // I think you get it
							tr: false,
							tl: false,
							br: false,
							bl: false,
						});
						room_canvas_buffer.add(obj).renderAll();
					
					});
					break;
			}	
		}
	}

   
}