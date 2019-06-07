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
    constructor(AGarea, AGroom) {
		this._AGroom = AGroom;
		this._AGarea = AGarea;
		this._scale = 55;
		this._vision_mode = 0;
		
		this._interval = '';
		this._room_canvas;
		
		this._colors = [
		  	['#e2e2e2', '#000060'], //0 canvas
		  	['#ebebeb', '#cccccc'],	//1 grid
		  	['#A06FEB', '#FFFACD'],	//2 player
		  	['#d47070', '#F7CA18'],	//3 enemy
		  	['#FDA038', '#DDA0DD'],	//4 wall, portal, exit
			['#60cd4b', '#38fd4f'],	//5 colors for highlighted objects
			['#000000', '#ffffff'],	//6 colors for path-points
		];
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
		play(this._AGarea, true);
		this._interval = setInterval(function(){				
			canvas_objects.forEach(function(item, i) {
				if(item.isObject){
	 				// item.left = item.AGObject.position.x*scale_buffer + item.AGObject.size.x*scale_buffer/2;
					// item.top = item.AGObject.position.z*scale_buffer + item.AGObject.size.z*scale_buffer/2;
					// item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);
					
					//remove "dead" objects
					if(item.AGObject.destructible && item.AGObject.health <= 0){
					//remove path of dead enemies	
						if(item.type == 'enemy'){
							item.PathArray.forEach(function(ele) {
								room_buffer.remove(ele);
							});
						}
						room_buffer.remove(item);
					}
					
					
					if(item.type == 'exit'){	
						
						
						if(item.AGObject.reached){
							$('#win_screen').fadeIn(100);
						}						
					}
					
					
	 			   	item.left = item.AGObject.position.x*scale_buffer;
	  			   	item.top = item.AGObject.position.z*scale_buffer;
	  			   	item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);  
				}
			});	
			room_buffer.renderAll();
		}, 33);	
	}
	stopArea(){
		play(this._AGarea, false);
		this._interval = 0;
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
		console.log(room_buffer.getZoom());
		room_buffer.renderAll();
	}
	
	renderAGRoom(ag_room){
		this._room_canvas = new fabric.Canvas('c',{
		    selection: false, 
		    height: ag_room.size.x * this._scale, 
		    width: ag_room.size.z * this._scale,
		});

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
		let gridLen = options.width / options.distance;
		
		for (var i = 0; i < gridLen; i++) {
		  var distance   = i * options.distance,
		      horizontal = new fabric.Line([ distance, 0, distance, options.width], options.param),
		      vertical   = new fabric.Line([ 0, distance, options.width, distance], options.param);
		  this._room_canvas.add(horizontal);
		  this._room_canvas.add(vertical);
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
			//options.target.AGObject.position = new Vector3((options.target.left - options.target.AGObject.size.x*this._scale/2)/this._scale, 1, (options.target.top - options.target.AGObject.size.z*this._scale/2)/this._scale);
			
			
			options.target.AGObject.position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
			
		});
		
		let w = 0;
		this._room_canvas.on('object:scaling', options => {	
			let target = options.target;
			
			//update position and size
			
			
			console.log("Size: " + options.target.width*target.scaleX/this._scale + " " + options.target.height*target.scaleY/this._scale);
			
			console.log("Position: " + options.target.left/this._scale + " " + options.target.top/this._scale);
			
			options.target.AGObject.size = new Vector3(options.target.width*target.scaleX/this._scale, 1, options.target.height*target.scaleY/this._scale);
			options.target.AGObject.position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
			//target.set(attrs);
			
			if(!target.strokeWidthUnscaled && target.strokeWidth){
				target.strokeWidthUnscaled = target.strokeWidth;
			}
			if(target.strokeWidthUnscaled){
				var scale_buffer = target.scaleX > target.scaleY ? target.scaleX : target.scaleY;
				target.strokeWidth = target.strokeWidthUnscaled / scale_buffer;
			}
			//target.set(attrs);
			
			
			
			//Change wally to wall to reactivate scaling
			// if(options.target.type == 'wally'){
// 				var target = options.target,
// 					w = target.width * target.scaleX,
// 					offset = w/2,
// 					h = target.height * target.scaleY,
// 					snap = { // Closest snapping points
// 						top: Math.round(target.top  / this._scale) * this._scale,
// 						left: Math.round(target.left / this._scale) * this._scale,
// 						bottom: Math.round((target.top + h) / this._scale) * this._scale,
// 						right: Math.round((target.left + w) / this._scale) * this._scale
// 					},
// 					threshold = this._scale,
// 					dist = { // Distance from snapping points
// 						top: Math.abs(snap.top - target.top),
// 						left: Math.abs(snap.left - target.left),
// 						bottom: Math.abs(snap.bottom - target.top - h),
// 						right: Math.abs(snap.right - target.left - w)
// 					},
// 					attrs = {
// 						scaleX: target.scaleX,
// 						scaleY: target.scaleY,
// 						top: target.top,
// 						left: target.left
// 					};
//
// 				switch (target.__corner) {
// 					case 'tl':
// 						if (dist.left < dist.top && dist.left < threshold) {
// 							attrs.scaleX = (w - (snap.left - target.left)) / target.width;
// 							attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
// 							attrs.top = target.top + (h - target.height * attrs.scaleY);
// 							attrs.left = snap.left;
// 						} else if (dist.top < threshold) {
// 							attrs.scaleY = (h - (snap.top - target.top)) / target.height;
// 							attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
// 							attrs.left = attrs.left + (w - target.width * attrs.scaleX);
// 							attrs.top = snap.top;
// 						}
// 						break;
// 					case 'mt':
// 						if (dist.top < threshold) {
// 							attrs.scaleY = (h - (snap.top - target.top)) / target.height;
// 							attrs.top = snap.top;
// 						}
// 						break;
// 					case 'tr':
// 						if (dist.right < dist.top && dist.right < threshold) {
// 							attrs.scaleX = (snap.right - target.left) / target.width;
// 							attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
// 							attrs.top = target.top + (h - target.height * attrs.scaleY);
// 						} else if (dist.top < threshold) {
// 							attrs.scaleY = (h - (snap.top - target.top)) / target.height;
// 							attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
// 							attrs.top = snap.top;
// 						}
// 						break;
// 					case 'ml':
// 						if (dist.left < threshold) {
// 							attrs.scaleX = (w - (snap.left - target.left)) / target.width;
// 							attrs.left = snap.left;
// 						}
// 						break;
// 					case 'mr':
// 						if (dist.right < threshold) attrs.scaleX = (snap.right - target.left) / target.width;
// 						break;
// 					case 'bl':
// 						if (dist.left < dist.bottom && dist.left < threshold) {
// 							attrs.scaleX = (w - (snap.left - target.left)) / target.width;
// 							attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
// 							attrs.left = snap.left;
// 						} else if (dist.bottom < threshold) {
// 							attrs.scaleY = (snap.bottom - target.top) / target.height;
// 							attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
// 							attrs.left = attrs.left + (w - target.width * attrs.scaleX);
// 						}
// 						break;
// 					case 'mb':
// 						if (dist.bottom < threshold) attrs.scaleY = (snap.bottom - target.top) / target.height;
// 						break;
// 					case 'br':
// 						if (dist.right < dist.bottom && dist.right < threshold) {
// 							attrs.scaleX = (snap.right - target.left) / target.width;
// 							attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
// 						} else if (dist.bottom < threshold) {
// 							attrs.scaleY = (snap.bottom - target.top) / target.height;
// 							attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
// 						}
// 						break;
// 				}
//
//
// 			}
//
			//update Size of objects
			
			
		});
	}

	//
	makeThenRenderAGObject(obj_type, obj_left, obj_top){

		let obj_buffer;
		switch(obj_type){
			
			case 'enemy':
				
				obj_buffer = new AGObject("AGgegner", new Vector3((obj_left/this._scale), 1, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer.tag = "ENEMY";
				let gegner_ss = new AGSoundSource("urbiurbiurbi", "sounds/urbi.mp3", true, 1, this._AGroom);
				obj_buffer.addSoundSource(gegner_ss);
				
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
				
				obj_buffer = new AGObject("Wall", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				obj_buffer.tag = "WALL";
				
				break;
			case 'portal':
				obj_buffer = new AGPortal("Portal", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
	
				break;
			case 'exit':

				obj_buffer = new AGRoomExit("Exit", new Vector3((obj_left/this._scale), 1.0, (obj_top/this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
				
				break;
			
		}
		this._AGroom.add(obj_buffer);
		this.renderAGObject(obj_buffer);
	}
	
	
	getFabricObject(ag_object){
		let canvas_objects = this._room_canvas.getObjects();
		let fab_buffer;
		canvas_objects.forEach(function(item, i) {
			if(item.isObject && item.AGObject == ag_object){
				fab_buffer = item;
			}
		});	
		return fab_buffer;
	}
	

	//AGObjects
	renderAGObject(ag_object){
		
		let _scalebuffer = this._scale
		let colors_buffer = this._colors;
		let vision_mode_buffer = this._vision_mode;
		let room_canvas_buffer = this._room_canvas;
		
		if(ag_object.tag){
			
			switch(ag_object.tag){
				case 'ENEMY':
					fabric.loadSVGFromURL('ui/img/enemy.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(ag_object.size.x*_scalebuffer);
					  	obj.scaleToHeight(ag_object.size.z*_scalebuffer);
					  	// obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
// 					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;

						obj.left = ag_object.position.x*_scalebuffer;
						obj.top = ag_object.position.z*_scalebuffer;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[3][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = ag_object.name;
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
						
						if(ag_object.route.length > 0){
							ag_object.route.forEach(function (item, index) {
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
								obj.PathArray.push(dot);
								room_canvas_buffer.add(dot);
							});
						}
					  	room_canvas_buffer.add(obj).renderAll();
					});
					break;
			
				case 'WALL':
					var obj = new fabric.Rect({
						width: ag_object.size.x*_scalebuffer,
						height: ag_object.size.z*_scalebuffer,
						fill: colors_buffer[4][vision_mode_buffer],
						// left: ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2,
// 						top: ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2,
						
						left: ag_object.position.x*_scalebuffer,
						top: ag_object.position.z*_scalebuffer,
						
						AGObject: ag_object,
						isObject: true,	
						name: ag_object.name,
						type: 'wall',
						strokeWidth: 1,
						originX: 'center',
						originY: 'center',
					});
					obj.hasRotatingPoint = false; 
					room_canvas_buffer.add(obj).renderAll();
					break;
			}
		
		}else if(ag_object.type){
			switch(ag_object.type){
				case 'PORTAL':	
					fabric.loadSVGFromURL('ui/img/portal.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(ag_object.size.x*_scalebuffer);
					  	obj.scaleToHeight(ag_object.size.z*_scalebuffer);
					  	// obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
// 					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
						
					  	obj.left = ag_object.position.x*_scalebuffer;
					    obj.top = ag_object.position.z*_scalebuffer;
						
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = ag_object.name;
						obj.type = 'portal';
						if(ag_object.exit){
							obj.secDoor = ag_object.exit;
						}else{
							obj.secDoor = false;
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
					 	obj.scaleToWidth(ag_object.size.x*_scalebuffer);
					  	obj.scaleToHeight(ag_object.size.z*_scalebuffer);
					  	// obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
// 					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
						
					  	obj.left = ag_object.position.x*_scalebuffer;
					    obj.top = ag_object.position.z*_scalebuffer;
						
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObject = ag_object;
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = ag_object.name;
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
					  	// obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
// 					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
							
						obj.left = ag_object.position.x*_scalebuffer;
						obj.top = ag_object.position.z*_scalebuffer;

						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[2][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.name = ag_object.name;
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