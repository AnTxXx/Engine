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
    constructor(area, room_canvas) {
		this._room_canvas = room_canvas;
		this._scale = 55;
		this._vision_mode = 0;
		this._area = area;
		this._interval = '';
		
		this._colors = [
		  ['#e2e2e2', '#000060'], 	//canvas
		  ['#ebebeb', '#cccccc'],	//grid
		  ['#A06FEB', '#FFFACD'],	//player
		  ['#d47070', '#F7CA18'],	//enemy
		  ['#FDA038', '#DDA0DD'],	//wall
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
				case 'wall':
					object.set("fill", this._colors[4][this._vision_mode]);
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
		
		play(this._area, true);
		this._interval = setInterval(function(){			
			let canvas_objects = room_buffer.getObjects();
			canvas_objects.forEach(function(item, i) {
				if(item.isObject){
	 			   item.left = item.AGObject.position.x*scale_buffer + item.AGObject.size.x*scale_buffer/2;
	  			   item.top = item.AGObject.position.z*scale_buffer + item.AGObject.size.z*scale_buffer/2;
	  			   item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);
				   room_buffer.renderAll();
				}
			});	
		}, 30);	
	}
	stopArea(){
		play(this._area, false);
		this._interval = 0;
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
		   options.target.set({
		      left: Math.round((options.target.left) / this._scale) * this._scale,
		      top: Math.round((options.target.top) / this._scale) * this._scale 
		   });
		});
		
		var w = 0;
		this._room_canvas.on('object:scaling', options => {
			
			
			var target = options.target,
				w = target.width * target.scaleX,
				offset = w/2,
				h = target.height * target.scaleY,
				snap = { // Closest snapping points
					top: Math.round(target.top  / this._scale) * this._scale,
					left: Math.round(target.left / this._scale) * this._scale,
					bottom: Math.round((target.top + h) / this._scale) * this._scale,
					right: Math.round((target.left + w) / this._scale) * this._scale
				},
				threshold = this._scale,
				dist = { // Distance from snapping points
					top: Math.abs(snap.top - target.top),
					left: Math.abs(snap.left - target.left),
					bottom: Math.abs(snap.bottom - target.top - h),
					right: Math.abs(snap.right - target.left - w)
				},
				attrs = {
					scaleX: target.scaleX,
					scaleY: target.scaleY,
					top: target.top,
					left: target.left
				};

			switch (target.__corner) {
				case 'tl':
					if (dist.left < dist.top && dist.left < threshold) {
						attrs.scaleX = (w - (snap.left - target.left)) / target.width;
						attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
						attrs.top = target.top + (h - target.height * attrs.scaleY);
						attrs.left = snap.left;
					} else if (dist.top < threshold) {
						attrs.scaleY = (h - (snap.top - target.top)) / target.height;
						attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
						attrs.left = attrs.left + (w - target.width * attrs.scaleX);
						attrs.top = snap.top;
					}
					break;
				case 'mt':
					if (dist.top < threshold) {
						attrs.scaleY = (h - (snap.top - target.top)) / target.height;
						attrs.top = snap.top;
					}
					break;
				case 'tr':
					if (dist.right < dist.top && dist.right < threshold) {
						attrs.scaleX = (snap.right - target.left) / target.width;
						attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
						attrs.top = target.top + (h - target.height * attrs.scaleY);
					} else if (dist.top < threshold) {
						attrs.scaleY = (h - (snap.top - target.top)) / target.height;
						attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
						attrs.top = snap.top;
					}
					break;
				case 'ml':
					if (dist.left < threshold) {
						attrs.scaleX = (w - (snap.left - target.left)) / target.width;
						attrs.left = snap.left;
					}
					break;
				case 'mr':
					if (dist.right < threshold) attrs.scaleX = (snap.right - target.left) / target.width;
					break;
				case 'bl':
					if (dist.left < dist.bottom && dist.left < threshold) {
						attrs.scaleX = (w - (snap.left - target.left)) / target.width;
						attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
						attrs.left = snap.left;
					} else if (dist.bottom < threshold) {
						attrs.scaleY = (snap.bottom - target.top) / target.height;
						attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
						attrs.left = attrs.left + (w - target.width * attrs.scaleX);
					}
					break;
				case 'mb':
					if (dist.bottom < threshold) attrs.scaleY = (snap.bottom - target.top) / target.height;
					break;
				case 'br':
					if (dist.right < dist.bottom && dist.right < threshold) {
						attrs.scaleX = (snap.right - target.left) / target.width;
						attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY;
					} else if (dist.bottom < threshold) {
						attrs.scaleY = (snap.bottom - target.top) / target.height;
						attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX;
					}
					break;
			}

			if(!target.strokeWidthUnscaled && target.strokeWidth){
				target.strokeWidthUnscaled = target.strokeWidth;
			}
			if(target.strokeWidthUnscaled){
				var scale_buffer = target.scaleX > target.scaleY ? target.scaleX : target.scaleY;
				target.strokeWidth = target.strokeWidthUnscaled / scale_buffer;
			}

			target.set(attrs);
		});
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
					  	obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[3][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Gegner';
						obj.type = 'enemy';
						obj.originX = 'center';
						obj.originY = 'center';
					  	room_canvas_buffer.add(obj).renderAll();
					});
				
					break;
			
				case 'WALL':
					var obj = new fabric.Rect({
						width: ag_object.size.x*_scalebuffer,
						height: ag_object.size.z*_scalebuffer,
						fill: colors_buffer[4][vision_mode_buffer],
						left: ag_object.position.x*_scalebuffer,
						top: ag_object.position.z*_scalebuffer,
						AGObject: ag_object,
						isObject: true,	
						name:'Mauer',
						type: 'wall',
						strokeWidth: 1,
					});
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
					  	obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[4][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Portal';
						obj.type = 'portal';
						obj.secDoor = false;
						obj.originX = 'center';
						obj.originY = 'center';
					  	room_canvas_buffer.add(obj).renderAll();
					});
					break;
				
				case 'PLAYER':
					//TODO change size of player
					fabric.loadSVGFromURL('ui/img/player.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(1*_scalebuffer);
					  	obj.scaleToHeight(1*_scalebuffer);
					  	obj.left = ag_object.position.x*_scalebuffer + ag_object.size.x*_scalebuffer/2;
					    obj.top = ag_object.position.z*_scalebuffer + ag_object.size.z*_scalebuffer/2;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors_buffer[2][vision_mode_buffer];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.name = 'Spieler';
						obj.type = 'player';
					  	room_canvas_buffer.add(obj).renderAll();
						obj.originX = 'center';
						obj.originY = 'center';

					
					
					});
					break;
			}	
		}
	}

   
}