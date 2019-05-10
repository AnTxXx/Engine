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

jQuery(function($){
	//0...default, 1...contrast
	var vision_mode = 0;
	
	var colors = [
	  ['#e2e2e2', '#000060'], 	//canvas
	  ['#ebebeb', '#cccccc'],	//grid
	  ['#A06FEB', '#FFFACD'],	//player
	  ['#d47070', '#F7CA18'],	//enemy
	  ['#FDA038', '#DDA0DD'],	//wall
	];
	
	//the active Object on the canvas
	let actObj;
	let scale_ = 55;
	let grid = scale_;
	let room_width = 20;
	let room_depth = 20;
	
	//audio//	
	
	//**************//
	//**ROOM START**//
	//**************//
	
	
	//let room = area.newRoom("Erster Raum", new Vector3(room_width, 2.5, room_depth), new Vector3(0.0, 0.0, 0.0));

	
	let room_canvas;
	
	
	
	
	//**************//
	//***ROOM END***//
	//**************//
	
	//snapping-stuff end
	
	
	
	//jq dnd-stuff
	$('.sb_object').draggable({
		appendTo: 'body',
		containment: 'window',
		scroll: false,
		helper: 'clone',
		drag: function(e, ui){
			ui.helper.animate({
 				width: scale_,
 				height: scale_,
				opacity: 1,
 			}, 200, function() {
 			 	
 			});
			ui.helper.empty();
		}
	});
	$('#c').droppable({
		tolerance: "touch",
		classes: {
		  "ui-droppable-active": "ui-state-highlight"
		},
		drop: function( event, ui ) {  
			let obj_type = $(ui.draggable).attr('obj_type');
			let obj;
			let left_buff = (ui.position.left)-$(this).offset().left;
			let top_buff = (ui.position.top)-$(this).offset().top;	
			let agobject_buffer;
			
  	    	var snap_buffer = { // Closest snapping points
  	        	top: Math.round((top_buff) / grid) * grid,
  	        	left: Math.round((left_buff) / grid) * grid,
  	        	bottom: Math.round((top_buff + scale_) / grid) * grid,
  	        	right: Math.round((left_buff+ scale_) / grid) * grid
  	     	};
			
			let snap_top_buffer = snap_buffer.top < snap_buffer.bottom ? snap_buffer.top : snap_buffer.bottom;
			let snap_left_buffer = snap_buffer.left < snap_buffer.right ? snap_buffer.left : snap_buffer.right;
			
			//move to a function
			switch(obj_type){
				case 'soundsource':
					
					//the fabric.js object
					obj = new fabric.Rect({
						width: $(ui.draggable).outerWidth(),
						height: $(ui.draggable).outerHeight(),
						fill: $(ui.draggable).css('background-color'),
						left: (ui.position.left)-$(this).offset().left,
						top: (ui.position.top)-$(this).offset().top,
						name: 'soundsource'
					});
					break;
		    		room_canvas.add(obj);	
				case 'enemy':
					
					//the AGObject	
					agobject_buffer = new AGObject("AGgegner", new Vector3((snap_left_buffer/scale_), 1, (snap_top_buffer/scale_)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
					let agobject_buffer_ss = new AGSoundSource("schritte", "sounds/urbi.mp3", true, 1, room);
					agobject_buffer.addSoundSource(agobject_buffer_ss);
					agobject_buffer.setSpeedSkalar(0.1);
					room.add(agobject_buffer);
					
					fabric.loadSVGFromURL('ui/img/enemy.svg', function(objects) {
					  	obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(scale_);
					  	obj.scaleToHeight(scale_);
					  	obj.left = snap_left_buffer;
					    obj.top = snap_top_buffer;
						obj.fill = colors[3][vision_mode];
						obj.AGObject = agobject_buffer;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Gegner';
						obj.type = 'enemy';
					  	room_canvas.add(obj).renderAll();
					});
	
					break;
				case 'portal':
					
					//the AGObject	
					agobject_buffer = new AGPortal("Portal_" + Math.floor(Math.random() * Math.floor(9999)), new Vector3((snap_left_buffer/scale_), 1.0, (snap_top_buffer/scale_)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
					room.add(agobject_buffer);
					
					fabric.loadSVGFromURL('ui/img/portal.svg', function(objects) {
					  	obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(scale_);
					  	obj.scaleToHeight(scale_);
					  	obj.left = snap_left_buffer;
					    obj.top = snap_top_buffer;
						obj.fill = colors[4][vision_mode];
						obj.AGObject = agobject_buffer;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Portal';
						obj.type = 'portal';
						obj.secDoor = false;
					  	room_canvas.add(obj).renderAll();
					});
					
					break;
				case 'wall':
						
					//the AGObject	
					agobject_buffer = new AGPortal("Wall_" + Math.floor(Math.random() * Math.floor(9999)), new Vector3((snap_left_buffer/scale_), 1.0, (snap_top_buffer/scale_)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
					room.add(agobject_buffer);
					
					//the fabric.js object
					obj = new fabric.Rect({
						width: scale_,
						height: scale_,
						fill: colors[4][vision_mode],
						left: snap_left_buffer,
						top: snap_top_buffer,
						AGObject: agobject_buffer,
						isObject: true,
						name:'Mauer',
						type: 'wall',
						strokeWidth: 1,
					});
					room_canvas.add(obj);	
					break;
			}
			
		}
	});
	
	

	
	//*******************//
	//*******TEST********//
	//*******************//

	
	function loadObject(){
			$('#ui_part_right_inner').fadeOut(100, function(){
				$('#input_obj_name').val(actObj.name);
				$('#input_obj_width').val(Math.round(actObj.width/scale_));
				$('#input_obj_height').val(Math.round(actObj.height/scale_));
				
				
				$('#input_obj_pos_x').val(actObj.left/scale_);
				$('#input_obj_pos_y').val(actObj.top/scale_);
				
				
				setTimeout(function(){
						$('#ui_part_right_inner').fadeIn(100);
	  			}, 100);	
			});
	}
	
	
	
	//*FABRIC Listeners*//
	
	//keep object active for path recording
	// room_canvas.on('selection:cleared', function(e){
// 		//if path is recording keep the object active
// 		if(actObj.isRecording){
// 			room_canvas.setActiveObject(actObj);
// 		}
// 	});
//
// 	room_canvas.on('selection:created', function(e){
// 		if(actObj != room_canvas.getActiveObject()){
// 			actObj = room_canvas.getActiveObject();
// 			loadObject();
// 		}
// 	});
//
// 	room_canvas.on('selection:updated', function(e){
// 		//if another object is selected hide path of current object
//
// 		if(actObj.isRecording && actObj.type=='portal'){
//
// 			let actObj_buffer = room_canvas.getActiveObject();
//
// 			if(actObj_buffer.type=='portal'){
// 				actObj.secDoor = room_canvas.getActiveObject();
// 				actObj_buffer.secDoor = actObj;
// 				actObj.AGObject.linkPortals(actObj_buffer.AGObject);
//
// 			}
// 			//canvas.setActiveObject(actObj);
//
// 		}else{
// 			if(actObj != room_canvas.getActiveObject() && actObj.PathArray){
// 				actObj.PathArray.forEach(function(ele) {
// 					ele.opacity = 0;
// 				});
// 				actObj = room_canvas.getActiveObject();
// 			}else if(actObj.PathArray){
// 				actObj = room_canvas.getActiveObject();
// 				actObj.PathArray.forEach(function(ele) {
// 					ele.opacity = 1;
// 				});
// 			}else{
// 				actObj = room_canvas.getActiveObject();
// 			}
// 		}
// 		loadObject();
// 	});
//
//
// 	room_canvas.on('object:scaling', function(e){
// 		$('#input_obj_width').val(room_canvas.getActiveObject().width/scale_);
// 		$('#input_obj_height').val(room_canvas.getActiveObject().height/scale_);
// 	});
//
// 	room_canvas.on('object:moving', function (e){
// 		$('#input_obj_pos_x').val(room_canvas.getActiveObject().left/scale_);
// 		$('#input_obj_pos_y').val(room_canvas.getActiveObject().top/scale_);
// 		room_canvas.getActiveObject().AGObject.position = new Vector3(room_canvas.getActiveObject().left/scale_, 1, room_canvas.getActiveObject().top/scale_);
// 	});
//
// 	//coords for path
// 	room_canvas.on('mouse:down', function(e){
// 		if(actObj.type=='enemy' && actObj.isRecording){
// 			let dot = new fabric.Circle({
// 			    left:   getMouseCoords(e)[0]-4,
// 			    top:    getMouseCoords(e)[1]-4,
// 			    radius: 4,
// 			    fill:   'black',
// 			    objectCaching: false,
// 				selectable: false,
// 			});
// 			room_canvas.add(dot);
// 			actObj.PathArray.push(dot);
// 		}else{
//
// 		}
//
//
// 	});


	//******canvas stuff end*********//

	//button for path recording
	$('#btn_path_rec').click(function(){
		if(actObj.isRecording){
			//Hier wird noch ein Fehler produziert
			let first_dot = new fabric.Circle({
			    left:   actObj.left,
			    top:    actObj.top,
			    radius: 4,
			    fill:   'black',
			    objectCaching: false,
				selectable: false,
			});
			room_canvas.add(first_dot);
			actObj.PathArray.unshift(first_dot);
			//save path to AGObject and set movable true
			actObj.PathArray.forEach(function(ele) {
				actObj.AGObject.movable = true;
				actObj.AGObject.addRouteNode(new Vector3(ele.left/scale_, 1, ele.top/scale_));	
			});
			actObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
		}else{	
			actObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
		}
	});
	
	
	
	$('#btn_path_linkdoors').click(function(){
		if(actObj.isRecording){
			actObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
		}else{
			actObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
		}
	});
	
	$('#btn_path_delete').click(function(){
		actObj.PathArray.forEach(function(ele) {
			room_canvas.remove(ele);
		});
		actObj.PathArray = [];	
		actObj.AGObject.clearRoute();
		actObj.AGObject.movable = false;
	});
	
	//***********************//
	//*******TEST-END********//
	//***********************//
	
	
	//***********************//
	//*******jq-clickers and others********//
	//***********************//
	
	$('#btn_change_vision_mode').click(function(){
		
		if(vision_mode==0){
			vision_mode = 1;
		}else{
			vision_mode = 0;
		}
		
		changeVisionMode();
	});
	
	$('#btn_set_dim').click(function(){
		setCanvasDimensions($('#tb_canvas_dim_width').val(), $('#tb_canvas_dim_height').val())
	});
	
	$('#btn_set_file').click(function(){	
		let ss_buffer = new AGSoundSource("blabla", "sounds/urbi.mp3", true, 1, room.audioContext, room.resonanceAudioScene);
		room_canvas.getActiveObject().AGObject.addSoundSource(ss_buffer);
	});

	$('#input_obj_name').on('input', function() {
	    let buffer = $(this).val();
		room_canvas.getActiveObject().name = buffer;
		room_canvas.getActiveObject().AGObject.name = buffer;
	});
		
	$('#input_obj_width').on('input', function() {
		room_canvas.getActiveObject().AGObject.width = new Vector3($('#input_obj_width').val(), 1, $('#input_obj_height').val());
		room_canvas.getActiveObject().set({
			width: $('#input_obj_width').val()*scale_,
			height: $('#input_obj_height').val()*scale_,
		});
		room_canvas.renderAll();
	});
	
	$('#input_obj_height').on('input', function() {
		room_canvas.getActiveObject().AGObject.size = new Vector3($('#input_obj_width').val(), 1, $('#input_obj_height').val());
		room_canvas.getActiveObject().set({
			width: $('#input_obj_width').val()*scale_,
			height: $('#input_obj_height').val()*scale_,
		});
		room_canvas.renderAll();
	});
	
	$('#input_obj_pos_x').on('input', function() {	
		room_canvas.getActiveObject().AGObject.position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
		room_canvas.getActiveObject().set({
			left: $('#input_obj_pos_x').val()*scale_,
			top: $('#input_obj_pos_y').val()*scale_,
		});
		room_canvas.renderAll();
	});
	$('#input_obj_pos_y').on('input', function() {
		room_canvas.getActiveObject().AGObject.position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
		room_canvas.getActiveObject().set({
			left: $('#input_obj_pos_x').val()*scale_,
			top: $('#input_obj_pos_y').val()*scale_,	
		});
		room_canvas.renderAll();
	});

	$('#input_obj_rot').on('input', function() {
	    let buffer = $(this).val();
		actObj.name = buffer;
		room_canvas.getActiveObject().AGObject.name = buffer;
	});
	
	$('#btn_collapse').click(function(){
		if($('#ui_part_right').hasClass('ui_part_right_expanded')){	
			$('#ui_part_right_inner').fadeOut(100, function(){
				$('#ui_part_right').toggleClass('ui_part_right_expanded');
				$('#ui_part_middle').toggleClass('ui_part_middle_expanded');
			});
		}else{	
			$('#ui_part_middle').toggleClass('ui_part_middle_expanded');
			$('#ui_part_right').toggleClass('ui_part_right_expanded');
			setTimeout(function(){
					$('#ui_part_right_inner').fadeIn(100);
  			}, 300);	
		}
	});

	//the ui main loop
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
		play(room, false);
		interval = 0;
	});
	
	
	//***********************//
	//*******functions********//
	//***********************//
	
	
	// let gegner_test = new AGObject("gegner", new Vector3(2,1,8), new Vector3(1,0,0), new Vector3(1,1,1));
	// gegner_test.tag = 'enemy';
	// renderAGObject(gegner_test);
	//
	//
	// let wall_test = new AGObject("Wall_", new Vector3(5, 1, 4), new Vector3(1, 0, 0), new Vector3(3, 1, 1));
	// wall_test.tag = "wall";
	//
	// renderAGObject(wall_test);
	//
	//
	// //the AGObject
	// let portal_test = new AGPortal("Portal_", new Vector3(1, 1, 3), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
	// renderAGObject(portal_test);
	//
	//
	// //let player_test = new AGPlayer("spieler", new Vector3(5, 1, 5), new Vector3(1, 0, 0), new Vector3(0, 1, -1), controls);
	// renderAGObject(player);
	//
	//

	
	
	function renderAGRoom(ag_room){
		
		room_canvas = new fabric.Canvas('c',{
		    selection: false, 
		    height: room_depth * scale_, 
		    width: room_width * scale_,
		});
	
		let options = {
		   distance: scale_,
		   width: room_canvas.width,
		   height: room_canvas.height,
		   param: {
		   		stroke: colors[1][vision_mode],
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
		  room_canvas.add(horizontal);
		  room_canvas.add(vertical);
		};
		room_canvas.backgroundColor = colors[0][vision_mode];
		room_canvas.renderAll();



	
		//snapping-Stuff (Quelle: https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize)
		room_canvas.on('object:moving', options => {
		   options.target.set({
		      left: Math.round(options.target.left / scale_) * scale_,
		      top: Math.round(options.target.top / scale_) * scale_ 
		   });
		});
	
		var w = 0;
		room_canvas.on('object:scaling', options => {
			var target = options.target,
		   	w = target.width * target.scaleX,
		   	h = target.height * target.scaleY,
		   	snap = { // Closest snapping points
		   	   top: Math.round(target.top / grid) * grid,
		   	   left: Math.round(target.left / grid) * grid,
		   	   bottom: Math.round((target.top + h) / grid) * grid,
		   	   right: Math.round((target.left + w) / grid) * grid
		   	},
		   	threshold = grid,
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
	function renderAGObject(ag_object){
		
		if(ag_object.tag){
			
			switch(ag_object.tag){
				case 'ENEMY':
					fabric.loadSVGFromURL('ui/img/enemy.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(ag_object.size.x*scale_,);
					  	obj.scaleToHeight(ag_object.size.z*scale_,);
					  	obj.left = ag_object.position.x*scale_;
					    obj.top = ag_object.position.z*scale_;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors[3][vision_mode];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Gegner';
						obj.type = 'enemy';
					  	room_canvas.add(obj).renderAll();
					});
					
					break;
				
				case 'WALL':
					var obj = new fabric.Rect({
						width: ag_object.size.x*scale_,
						height: ag_object.size.z*scale_,
						fill: colors[4][vision_mode],
						left: ag_object.position.x*scale_,
						top: ag_object.position.z*scale_,
						AGObject: ag_object,
						isObject: true,	
						name:'Mauer',
						type: 'wall',
						strokeWidth: 1,
					});
					room_canvas.add(obj).renderAll();
					break;
			}
			
		}else if(ag_object.type){
			switch(ag_object.type){
				case 'PORTAL':	
					fabric.loadSVGFromURL('ui/img/portal.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(ag_object.size.x*scale_,);
					  	obj.scaleToHeight(ag_object.size.z*scale_,);
					  	obj.left = ag_object.position.x*scale_;
					    obj.top = ag_object.position.z*scale_;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors[4][vision_mode];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.isRecording = false;
						obj.name = 'Portal';
						obj.type = 'portal';
						obj.secDoor = false;
					  	room_canvas.add(obj).renderAll();
					});
					break;
					
				case 'PLAYER':
					//TODO change size of player
					fabric.loadSVGFromURL('ui/img/player.svg', function(objects) {
					  	var obj = fabric.util.groupSVGElements(objects);
					 	obj.scaleToWidth(1*scale_);
					  	obj.scaleToHeight(1*scale_);
					  	obj.left = ag_object.position.x*scale_;
					    obj.top = ag_object.position.z*scale_;
						obj.angle = Math.atan2(ag_object.direction.z, ag_object.direction.x) * 180 / Math.PI;
						obj.fill = colors[2][vision_mode];
						obj.AGObject = ag_object;
					 	obj.PathArray = [];
						obj.isObject = true;
						obj.name = 'Spieler';
						obj.type = 'player';
					  	room_canvas.add(obj).renderAll();
					});
					break;
			}	
		}
	}
	
	
	
	function getMouseCoords(event){
		var pointer = room_canvas.getPointer(event.e);
		var posX = pointer.x;
		var posY = pointer.y;
		return [posX, posY]
	}

	function setCanvasDimensions(width, height){
		room_canvas.setHeight(width);
		room_canvas.setWidth(height);
		room_canvas.renderAll();
	}

	function drawObjects(obj_type, obj_left, obj_top){
	}
	
	function changeVisionMode(){
		
		// 0...default
		// 1...high contrast
		room_canvas.backgroundColor = colors[0][vision_mode];
		room_canvas.getObjects().forEach(object=>{
			switch(object.type){
				case 'grid_line':
					object.set("stroke", colors[1][vision_mode]);
					break;
			
				case 'player':
					object.set("fill", colors[2][vision_mode]);		
					object.set("fill", colors[2][vision_mode]);
					break;
				
				case 'enemy':
					object.set("fill", colors[3][vision_mode]);
					
					break;
				case 'portal':
				case 'wall':	
					object.set("fill", colors[4][vision_mode]);
					break;
			}
		});
		room_canvas.renderAll();
		
		//toggle contrast class for css
		$( "h1,h2,h3,h4,h5,h6,body,#sb_object_enemy,.sb_object_structure,.btn,#canvas_container,label" ).toggleClass("contrast");
		
	}	
});




