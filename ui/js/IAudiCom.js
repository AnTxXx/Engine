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
import { getIdByReference, getReferenceById, g_history, g_gamearea, g_references, rebuildHandlerGameArea, setControl } from "../../lib/AGEngine.js";


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
		  	['#6fafeb', '#FFFACD'],	//2 player
		  	['#d47070', '#F7CA18'],	//3 enemy
		  	['#FDA038', '#DDA0DD'],	//4 wall, portal, exit
			['#60cd4b', '#38fd4f'],	//5 colors for highlighted objects
			['#000000', '#ffffff'],	//6 colors for path-points
			['#000000', '#f02727'],	//7 colors for path-lines
			['#7079d4', '#39adff'],	//8 colors for generic objects
		];
		
		//fixed interim roomID 
		
		
		
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
				case 'wall':
				case 'exit':
					object.set("fill", this._colors[4][this._vision_mode]);			
					break;
				case 'path_dot':
					
					object.set("fill", this._colors[6][this._vision_mode]);
					break;
				case 'path_line':
					object.set("fill", this._colors[7][this._vision_mode]);
					object.set("stroke", this._colors[7][this._vision_mode]);
					break;
				default:
					object.set("fill", this._colors[8][this._vision_mode]);
			}
		});
		
		this._room_canvas.renderAll();

		//toggle contrast class for css
		$( "h1,h2,h3,h4,h5,h6,body,#sb_object_enemy,.sb_object_structure,#sb_object_generic,.btn,#canvas_container,label,.gegner_speed_active,.ss_active,#btn_help,#overlay_text_box" ).toggleClass("contrast");

	}
	
	startArea(){
		
		this.disableKeyScrolling();
		
		$('#ui_part_right').addClass('no_click lower_opacity');
		
		$('.misc_ctrls').addClass('no_click lower_opacity');
		$('#ui_controls').addClass('no_click lower_opacity');
		$('.control_box .btn').not('#btn_stop_scene').addClass('no_click lower_opacity');
		
		let room_buffer = this._room_canvas;
		let scale_buffer = this._scale;
		let canvas_objects = room_buffer.getObjects();
		
		play(getReferenceById(g_gamearea.ID), true);
		
		this._interval = setInterval(function(){				
			canvas_objects.forEach(function(item, i) {
				
				
				
				
				
				if(item.isObject){
					
					
					if(item.type == 'player'){
						
						if(item.left + 200 > $('#canvas_container').width() + $('#canvas_container').scrollLeft()){
							$('#canvas_container').scrollLeft( $('#canvas_container').scrollLeft() + 1 );
						}else if(item.left - 200 < $('#canvas_container').scrollLeft()){
							$('#canvas_container').scrollLeft( $('#canvas_container').scrollLeft() - 1 );
						}
						
						if(item.top + 200 > $('#canvas_container').height() + $('#canvas_container').scrollTop()){
							$('#canvas_container').scrollTop( $('#canvas_container').scrollTop() + 1 );
						}else if(item.top - 200 < $('#canvas_container').scrollTop()){
							$('#canvas_container').scrollTop( $('#canvas_container').scrollTop() - 1 );
						}
					}
					
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
					
					
					if(item==room_buffer.getActiveObject()){
						$('#coord_x span').text(getReferenceById(item.AGObjectID).position.x);
						$('#coord_y span').text(getReferenceById(item.AGObjectID).position.z);
						
					}
					
	  			   	item.set('angle', Math.atan2(getReferenceById(item.AGObjectID).direction.z, getReferenceById(item.AGObjectID).direction.x) * 180 / Math.PI);  
				}
			});	
			room_buffer.renderAll();
		}, 33);	
	}
	stopArea(){
		
		this.disableKeyScrolling();
		
		
		$('#ui_part_right').removeClass('no_click lower_opacity');
		$('.misc_ctrls').removeClass('no_click lower_opacity');
		$('#ui_controls').removeClass('no_click lower_opacity');
		$('.control_box .btn').not('#btn_stop_scene').removeClass('no_click lower_opacity');
		$('#fabric_objects_container').empty();
		
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
  	
	newScene(){	
		if(confirm("Clear all objects of current room?")){
			let room_buffer = this._room_canvas;
			let scale_buffer = this._scale;
			let canvas_objects = room_buffer.getObjects();
				
			canvas_objects.forEach(function(item, i){
				if(item.isObject && item.type != 'player'){
					getReferenceById(item.AGObjectID).kill();
		 		}
				if(item.type !='grid_line' && item.type != 'player'){
					room_buffer.remove(item);
				}
			});
		
			room_buffer.renderAll();	
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
	
	
	addSoundSource(ag_object_id, ss_name){
		
		let ag_object_buffer = getReferenceById(ag_object_id)
		
		//console.log(getReferenceById(ag_object_id));
		ag_object_buffer.clearSoundSources();
		
		//ICI
		
		let roomID_buffer = getReferenceById(g_gamearea.ID).AGRooms[0].ID;
		
		let ss_buffer;
		
		switch(ss_name){
			case 'steps':
				ss_buffer = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "STEPS"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
			case 'waterfall':
				ss_buffer = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "WATERFALL"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
			case 'magic':
				ss_buffer = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "MAGIC"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
			case 'ouch':
				ss_buffer = new AGSoundSource("Ouch", "sounds/ouch.mp3", true, 1, roomID_buffer);
				ss_buffer.tag = "OUCH"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
			case 'car':
				ss_buffer = new AGSoundSource("Car", "sounds/car.mp3", true, 1, roomID_buffer);
				ss_buffer.tag = "CAR"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
			case 'monster':
				ss_buffer = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "MONSTER"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
				
				
			case 'truck':
				ss_buffer = new AGSoundSource("Monster", "sounds/truck.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "TRUCK"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;	
			case 'motorcycle':
				ss_buffer = new AGSoundSource("Monster", "sounds/motorcycle.wav", true, 1, roomID_buffer);
				ss_buffer.tag = "MOTORCYCLE"; 
				ag_object_buffer.addSoundSource(getIdByReference(ss_buffer));
				break;
				
				
				
				
			case 'none':
				
				
				break;
		}
		
	}
	
	
	setAGRoomDimensions(width, height){
		this._room_canvas.setWidth(width * this._scale);
		this._room_canvas.setHeight(height * this._scale);
		this._room_canvas.renderAll();

		//set room size of AGRoom (what happens with objects, which "fall out")
		getReferenceById(this._AGroomID).size = new Vector3(width, 2.5, height);
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
			
			
			//getReferenceById(options.target.AGObjectID).position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
			
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

	//obj_focus -> setfocus after rendering it
	makeThenRenderAGObject(obj_type, obj_left, obj_top, obj_focus){

		let obj_buffer;
		let obj_buffer_ID;
		switch(obj_type){
			
			case 'enemy':
				
				obj_buffer = new AGObject("AGgegner", new Vector3((obj_left/this._scale), 1, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				
				obj_buffer_ID = getIdByReference(obj_buffer);
				
				
				getReferenceById(obj_buffer_ID).tag = "ENEMY";
				
				
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
			case 'generic':
				obj_buffer = new AGObject("Generic", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer_ID = getIdByReference(obj_buffer);
				getReferenceById(obj_buffer_ID).tag = "GENERIC";
			
		}
		
		
		
		
		getReferenceById(this._AGroomID).add(obj_buffer_ID);
		this.renderAGObject(obj_buffer_ID, obj_focus);
		return obj_buffer_ID;
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
	renderAGObject(ag_objectID, obj_focus){
		
		let _scalebuffer = this._scale
		let colors_buffer = this._colors;
		let vision_mode_buffer = this._vision_mode;
		let room_canvas_buffer = this._room_canvas;
		
		//add details for tapping
		$('#fabric_objects_container').append('<details id = "fabobject_'+ ag_objectID + '" obj_id = "'+ ag_objectID +'"></details>');
		
		//$('#fabobject_'+ag_objectID).attr('autofocus' , 'true');
		
		
		
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
				default:
					fabric.loadSVGFromURL('ui/img/generic.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(getReferenceById(ag_objectID).size.x*_scalebuffer);
					  	obj.scaleToHeight(getReferenceById(ag_objectID).size.z*_scalebuffer);
					  	// obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer + getReferenceById(ag_objectID).size.x*_scalebuffer/2;
// 					    obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer + getReferenceById(ag_objectID).size.z*_scalebuffer/2;

						obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
						obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;
						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[8][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
					 	obj.PathArray = [];
						obj.LineArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'generic';
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
				default:
					fabric.loadSVGFromURL('ui/img/generic.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(1*_scalebuffer);
					  	obj.scaleToHeight(1*_scalebuffer);
					  		
						obj.left = getReferenceById(ag_objectID).position.x*_scalebuffer;
						obj.top = getReferenceById(ag_objectID).position.z*_scalebuffer;

						obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObjectID = ag_objectID;
						obj.isObject = true;
						obj.name = getReferenceById(ag_objectID).name;
						obj.type = 'generic';
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
			}	
		}
		
		// $('#fabobject_'+ag_objectID).focus();
// 		console.log('#fabobject_'+ag_objectID);
		// $('#input_obj_name').focus()
//
// 		$('#fabric_objects_container').append('<details id = "fabobject_"'+ ag_objectID + '" obj_id = "'+ ag_objectID +'"></details>');
//
		
	}
	
	
	drawDot(x_, y_){
		let dot = new fabric.Circle({
			left:   x_*this._scale - 1,
			top:    y_*this._scale - 1,
			radius: 2,
		    fill:   '#f51a1a',
			type: 'debug',
			selectable: false,
		});
		this._room_canvas.add(dot);
		this._room_canvas.renderAll();
	}
	
	deleteDots(){
		let room_buffer = this._room_canvas;
		let canvas_objects = room_buffer.getObjects();
		canvas_objects.forEach(function(item, i){
			if(item.type == 'debug'){
					room_buffer.remove(item);
			}
		});	
		room_buffer.renderAll();
	}
	
	
	
	renderScene(){
		//console.log(getReferenceById(g_gamearea.ID));
		
		console.log(g_gamearea.ID);
	
		
		
		let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
		this._AGroomID = rooms_buffer[0].ID;
		
		
		//prefill the inputs with Room name and Dimensions
		$('#input_room_name').val(getReferenceById(this._AGroomID).name);
		$('#tb_canvas_dim_width').val(getReferenceById(this._AGroomID).size.x);
		$('#tb_canvas_dim_height').val(getReferenceById(this._AGroomID).size.z);
		
		
		this.renderAGRoom(this._AGroomID);

		let this_buffer = this;
		if(getReferenceById(this._AGroomID).AGobjects.length > 0){
			getReferenceById(this._AGroomID).AGobjects.forEach(function(element) {
 				this_buffer.renderAGObject(element.ID);
				//console.log(element.tag + ": " + element.position.x)
				//console.log(element.position.x);
			});
		}
	}
	
	disableKeyScrolling(){
		window.addEventListener("keydown", function(e) {
		    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		        e.preventDefault();
		    }
		}, false);
	}
	enableKeyScrolling(){
		window.removeEventListener("keydown");
	}
	
	
	
	
	loadLevel(lvl_){
		
		$('#fabric_objects_container').empty();
		play(getReferenceById(g_gamearea.ID), false);
		
		
		this._room_canvas.clear();		
		g_references.clear();
		rebuildHandlerGameArea();
		//stop level clear everything
		
		switch(lvl_){
			
			case 1:
				
				var controls = new AGNavigation(38, 40, 37, 39, 32);
				var controlsID = getIdByReference(controls);
				setControl(getReferenceById(controlsID));
				
				
				var room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
				var room_1ID = getIdByReference(room_1);
				g_gamearea.addRoom(room_1ID);

				var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var exit = new AGRoomExit("Exit", new Vector3(15.5, 1.0, 6.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var skeleton_1 = new AGObject("Skeleton", new Vector3(5.5, 1, 1.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var skeleton_2 = new AGObject("Skeleton", new Vector3(10, 1, 3), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var skeleton_3 = new AGObject("Skeleton", new Vector3(13.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

				var wallHorizontal = new AGObject("WallHorizontal", new Vector3(7, 1.0, 4.5), new Vector3(1, 0, 0), new Vector3(14, 1, 1));
				var wallVertical = new AGObject("WallVertical", new Vector3(13.5, 1.0, 6), new Vector3(1, 0, 0), new Vector3(1, 1, 2));


				var waterfall = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
				var ouch = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
				var monster_1 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
				var monster_2 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
				var monster_3 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);


				var playerID = getIdByReference(player);
				var exitID = getIdByReference(exit);
				var skeleton_1ID = getIdByReference(skeleton_1);
				var skeleton_2ID = getIdByReference(skeleton_2);
				var skeleton_3ID = getIdByReference(skeleton_3);
				var waterfallID = getIdByReference(waterfall);
				var ouchID = getIdByReference(ouch);
				var monster_1ID = getIdByReference(monster_1);
				var monster_2ID = getIdByReference(monster_2);
				var monster_3ID = getIdByReference(monster_3);

				var wallHorizontalID = getIdByReference(wallHorizontal);
				var wallVerticalID = getIdByReference(wallVertical);

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
				
				
				getReferenceById(room_1ID).live = true;
				
				
				break;
				
			case 2:
				
				
				var controls = new AGNavigation(38, 40, 37, 39, 32);
				var controlsID = getIdByReference(controls);
				setControl(getReferenceById(controlsID));
				
				var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
				var room_1ID = getIdByReference(room_1);
				g_gamearea.addRoom(room_1ID);

				var player = new AGPlayer("Player", new Vector3(1, 1.0, 5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

				var skeleton_1 = new AGObject("Skeleton", new Vector3(3.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var skeleton_2 = new AGObject("Skeleton", new Vector3(11, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var skeleton_3 = new AGObject("Skeleton", new Vector3(14.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var skeleton_4 = new AGObject("Skeleton", new Vector3(16, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

				var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
				var car_1 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
				var car_2 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
				var car_3 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
				var car_4 = new AGSoundSource("Car", "sounds/car.mp3", true, 1, room_1ID);
				var ouch = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
				var magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);

				var playerID = getIdByReference(player);
				var exitID = getIdByReference(exit);

				var skeleton_1ID = getIdByReference(skeleton_1);
				var skeleton_2ID = getIdByReference(skeleton_2);
				var skeleton_3ID = getIdByReference(skeleton_3);
				var skeleton_4ID = getIdByReference(skeleton_4);

				var ouchID = getIdByReference(ouch);
				var car_1ID = getIdByReference(car_1);
				var car_2ID = getIdByReference(car_2);
				var car_3ID = getIdByReference(car_3);
				var car_4ID = getIdByReference(car_4);
				var magic_exit_ID = getIdByReference(magic_exit);

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
				getReferenceById(car_2ID).tag = "CAR";
				getReferenceById(car_3ID).tag = "CAR";
				getReferenceById(car_4ID).tag = "CAR";
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
				getReferenceById(room_1ID).live = true;
				
				
				
				break;
				
			case 3:
				
				var controls = new AGNavigation(38, 40, 37, 39, 32);
				var controlsID = getIdByReference(controls);
				setControl(getReferenceById(controlsID));
				
				var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
				var room_1ID = getIdByReference(room_1);
				g_gamearea.addRoom(room_1ID);

				var player = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var exit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var wallWestSmallRoom = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
				var wallNorthSmallRoom = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(5, 1, 1));
				var portalSmallRoom = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var wallSouthCorridor = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1, 0, 0), new Vector3(19, 1, 1));
				var wallLeftCorridor = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
				var wallRightCorridor = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
				var portalCorridorRoomFromSmallRoom = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var skeleton = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
				var portalCorridorToFinal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var portalFinalFromCorridor = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var wallFirstFinalRoom = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
				var wallSecondFinalRoom = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.6), new Vector3(1, 0, 0), new Vector3(1, 1, 3.34));
				var waterFall_1 = new AGObject("Waterfall1", new Vector3(8.7, 1, 0.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var waterFall_2 = new AGObject("Waterfall2", new Vector3(4.5, 1, 4.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var waterFall_3 = new AGObject("Waterfall3", new Vector3(8, 1, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var waterFall_4 = new AGObject("Waterfall4", new Vector3(11, 1, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
				var ouch = new AGSoundSource("Ouch", "sounds/ouch.mp3", false, 1, room_1ID);
				var magic_1 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
				var magic_2 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
				var magic_3 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
				var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
				var waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
				var waterfall_3 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
				var waterfall_4 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);

				var playerID = getIdByReference(player);
				var exitID = getIdByReference(exit);
				var wallWestSmallRoomID = getIdByReference(wallWestSmallRoom);
				var wallNorthSmallRoomID = getIdByReference(wallNorthSmallRoom);
				var portalSmallRoomID = getIdByReference(portalSmallRoom);
				var wallSouthCorridorID = getIdByReference(wallSouthCorridor);
				var wallLeftCorridorID = getIdByReference(wallLeftCorridor);
				var wallRightCorridorID = getIdByReference(wallRightCorridor);
				var portalCorridorRoomFromSmallRoomID = getIdByReference(portalCorridorRoomFromSmallRoom);
				var skeletonID = getIdByReference(skeleton);
				var portalCorridorToFinalID = getIdByReference(portalCorridorToFinal);
				var portalFinalFromCorridorID = getIdByReference(portalFinalFromCorridor);
				var wallFirstFinalRoomID = getIdByReference(wallFirstFinalRoom);
				var wallSecondFinalRoomID = getIdByReference(wallSecondFinalRoom);
				var stepsID = getIdByReference(steps);
				var ouchID = getIdByReference(ouch);
				var magic_1ID = getIdByReference(magic_1);
				var magic_2ID = getIdByReference(magic_2);
				var magic_3ID = getIdByReference(magic_3);
				var waterfall_1ID = getIdByReference(waterfall_1);
				var waterfall_2ID = getIdByReference(waterfall_2);
				var waterfall_3ID = getIdByReference(waterfall_3);
				var waterfall_4ID = getIdByReference(waterfall_4);

				var waterFall_1ID = getIdByReference(waterFall_1);
				var waterFall_2ID = getIdByReference(waterFall_2);
				var waterFall_3ID = getIdByReference(waterFall_3);
				var waterFall_4ID = getIdByReference(waterFall_4);

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
				getReferenceById(waterFall_1ID).tag = "BLA";
				getReferenceById(waterFall_2ID).tag = "BLA";
				getReferenceById(waterFall_3ID).tag = "BLA";
				getReferenceById(waterFall_4ID).tag = "BLA";

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
				getReferenceById(skeletonID).addRoute(new Vector3(12, 1, 0.5), new Vector3(12, 1, 2.5));

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
				getReferenceById(room_1ID).live = true;
				
				break;
			
			
			
		}
		
		
 		this.renderScene();
		
		
		
	}
	
	

   
}