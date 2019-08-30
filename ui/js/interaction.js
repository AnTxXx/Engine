import { i_audicom } from "../../lib/main.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";
import { getIdByReference, getReferenceById, g_gamearea } from "../../lib/AGEngine.js";

jQuery(function($){
	
	//Play-Button
	let interval;
	
	//the active Fabric-Object
	let actFabObj = '';
	
	$('#btn_start_scene').click(function(){
		g_gamearea.audioContext.resume();
		i_audicom.startArea();
	});
	$('#btn_stop_scene').click(function(){
		i_audicom.stopArea();
	});
	$('#btn_new_scene').click(function(){
		i_audicom.newScene();
	});

	$('#btn_change_vision_mode').click(function(){
		i_audicom.toggleVisionMode();
	});
	
	$('#btn_zoom_out').click(function(){
		i_audicom.zoomCanvas(0.9);
	});
	$('#btn_zoom_in').click(function(){
		i_audicom.zoomCanvas(1.1);
	});
	
	
	$('#input_obj_name').on('input', function() {
	    let buffer = $(this).val();
		i_audicom._room_canvas.getActiveObject().name = buffer;
		_room_canvas.getActiveObject().AGObjectID.name = buffer;
	});
	
	$('#input_room_name').on('input', function() {
	    let buffer = $(this).val();
		getReferenceById(i_audicom._AGroomID).name = buffer;
	});
	
	
	$('#input_obj_pos_x').on('input', function() {	
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
		i_audicom._room_canvas.getActiveObject().set({
			left: $('#input_obj_pos_x').val()*i_audicom._scale,
			top: $('#input_obj_pos_y').val()*i_audicom._scale,
		});
		i_audicom._room_canvas.renderAll();
	});
	$('#input_obj_pos_y').on('input', function() {
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
		i_audicom._room_canvas.getActiveObject().set({
			left: $('#input_obj_pos_x').val()*i_audicom._scale,
			top: $('#input_obj_pos_y').val()*i_audicom._scale,
		});
		i_audicom._room_canvas.renderAll();
	});
	
	
	
	//jq dnd-stuff
	$('.sb_object').draggable({
		appendTo: 'body',
		containment: 'window',
		scroll: false,
		helper: 'clone',
		drag: function(e, ui){
			
			$('#ui_part_right').addClass('lower_opacity');
			$('#ui_part_left').addClass('lower_opacity');
			$('#ui_controls').addClass('lower_opacity');
			
			switch($(this).attr('obj_type')){
			case 'enemy':
				ui.helper.addClass('enemy_dd');
				break;
			case 'portal':
				ui.helper.addClass('portal_dd');
				break;
			case 'exit':
				ui.helper.addClass('exit_dd');
				break;
			case 'generic':
				ui.helper.addClass('generic_dd');
				break;
			}
			
			ui.helper.animate({
 				width: i_audicom._scale,
 				height: i_audicom._scale,
				opacity: 1,
 			}, 200, function() {
 			 	
 			});
			ui.helper.empty();
		},
		stop: function(e, ui){
			
			$('#ui_part_right').removeClass('lower_opacity');
 			$('#ui_part_left').removeClass('lower_opacity');
			$('#ui_controls').removeClass('lower_opacity');
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
			let left_buff = (((ui.position.left)-$(this).offset().left + i_audicom._scale/2)/i_audicom._room_canvas.getZoom())+5;
			let top_buff = (((ui.position.top)-$(this).offset().top + i_audicom._scale/2)/i_audicom._room_canvas.getZoom())+5;
			
			
			//if placed partially outside place it inside at the border
			if(left_buff - i_audicom._scale/2 <= 0){
				left_buff = i_audicom._scale/2;
			}
			if(top_buff - i_audicom._scale/2 <= 0){
				top_buff = i_audicom._scale/2;
			}
			if(left_buff + i_audicom._scale/2 >= i_audicom._room_canvas.width){
				left_buff = i_audicom._room_canvas.width - i_audicom._scale/2;
			}
			
			if(top_buff + i_audicom._scale/2 >= i_audicom._room_canvas.height){
				top_buff = i_audicom._room_canvas.height - i_audicom._scale/2;
			}
			
			
			let agobject_buffer;
			
			
			i_audicom.makeThenRenderAGObject(obj_type, left_buff, top_buff);
			
			//render the thing
			
			//move to a function
			// switch(obj_type){
// 				case 'soundsource':
// 					//the fabric.js object
// 					obj = new fabric.Rect({
// 						width: $(ui.draggable).outerWidth(),
// 						height: $(ui.draggable).outerHeight(),
// 						fill: $(ui.draggable).css('background-color'),
// 						left: (ui.position.left)-$(this).offset().left,
// 						top: (ui.position.top)-$(this).offset().top,
// 						name: 'soundsource'
// 					});
// 					break;
// 		    		room_canvas.add(obj);
// 			}
		}
	});
	
	
	
	$('.canvas-container').mousemove(function(e) {
		$('#mouse_coords').fadeIn(100);
		$('#mouse_coords_x span').text(Math.round((getMouseCoords(e)[0]*2/110) * 10) / 10);
		$('#mouse_coords_y span').text(Math.round((getMouseCoords(e)[1]*2/110) * 10) / 10);
	});
	$('.canvas-container').mouseleave(function(){
		$('#mouse_coords').fadeOut(100);
	});
	
	
	
	
	
	
	
	
	
	
	function loadObject(type){
		
		//all: position, SoSo, Namen, Löschenbutton
		//gegner: Pfad, HP
		//Mauer: Gräße, Form
		//Portale: Verlinkung
		//Spieler: HP, Reichweite, Schaden
		//Raumziel

		$('#ui_part_right_inner').fadeOut(100, function(){
			
			
			if(type =='room'){
				$('#input_room_name').val(getReferenceById(i_audicom._AGroomID).name);
				
				$('#tb_canvas_dim_width').val(getReferenceById(i_audicom._AGroomID).size.x);
				$('#tb_canvas_dim_height').val(getReferenceById(i_audicom._AGroomID).size.z);
				
				$('.ui_box_special').hide();
				$('.ui_box_general').hide();
				$('.ui_box_room').show();
				
			}else{
				$('#input_obj_name').val(actFabObj.name);
				$('#input_obj_width').val(Math.round(actFabObj.width/i_audicom._scale));
				$('#input_obj_height').val(Math.round(actFabObj.height/i_audicom._scale));

				$('#input_obj_pos_x').val(actFabObj.left/i_audicom._scale);
				$('#input_obj_pos_y').val(actFabObj.top/i_audicom._scale);
			
				$('.ui_box_special').hide();
			
				$('.ui_box_' + type).show();
				$('.ui_box_general').show();
			
			
				$('#id_ span').text(actFabObj.AGObjectID);
			
				if(type=='enemy'){
					$('.bnt_speed').removeClass('gegner_speed_active');
					$('#btn_speed_' + getReferenceById(actFabObj.AGObjectID).getSpeedSkalar()).addClass('gegner_speed_active');
				}
			
				if(type!='player'){
					$('#ui_delete_box').show();
				}
			
			
				if(getReferenceById(actFabObj.AGObjectID).collidable){
					$('#cb_colli').prop('checked', true);
				}else{
				
					$('#cb_colli').prop('checked', false);
				}
			
			
				$('.btn_ss').removeClass('ss_active');
				//ICI
				let ss_buffer = getReferenceById(actFabObj.AGObjectID).getSoundSources();
				if(ss_buffer.length==0){
					$('.btn_ss').removeClass('ss_active');
					$('#btn_sound_none').addClass('ss_active');
				}else{
					for (var i = 0; i < ss_buffer.length; i++) {
						if(ss_buffer[i].tag){
						
							$('#btn_sound_' + ss_buffer[i].tag.toLowerCase()).addClass('ss_active');
						}
				  	
					};
				}
			}
			
			
			
			setTimeout(function(){
				$('#ui_part_right_inner').fadeIn(100);
			}, 100);
			
			
		});
	}
	
	
	//change dimensionsroom
	$('#btn_set_dim').click(function(){
		i_audicom.setAGRoomDimensions($('#tb_canvas_dim_width').val(), $('#tb_canvas_dim_height').val())
	});
	
	
	//change speed of enemy
	$('.bnt_speed').click(function() {
		$('.bnt_speed').removeClass('gegner_speed_active');
		$(this).addClass('gegner_speed_active');
		getReferenceById(actFabObj.AGObjectID).setSpeedSkalar($(this).attr('speed'));
	});
	
	
	$('.btn_ss').click(function(){	
			$('.btn_ss').removeClass('ss_active');
			$(this).addClass('ss_active');
			i_audicom.addSoundSource(actFabObj.AGObjectID, $(this).attr('ss'));
	});
	
	
	
	
	
	//button for path recording
	$('#btn_path_rec').click(function(){
		
		if(actFabObj.isRecording){
			let first_dot = new fabric.Circle({
				left:   actFabObj.left,
				top:    actFabObj.top,
				radius: 4,
			    fill:   i_audicom._colors[6][i_audicom._vision_mode],
			    objectCaching: false,
				selectable: false,
				type: 'path_dot'
			});
			
			//i_audicom._room_canvas.add(first_dot);
			//actFabObj.PathArray.unshift(first_dot);
			
			//clear old route and save path to AGObject and set movable true
			getReferenceById(actFabObj.AGObjectID).clearRoute();
			actFabObj.PathArray.forEach(function(ele){
				getReferenceById(actFabObj.AGObjectID).addRouteNode(new Vector3(ele.left/i_audicom._scale, 1, ele.top/i_audicom._scale));
			});
			getReferenceById(actFabObj.AGObjectID).movable = true;

			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
			
			$('#ui_controls').removeClass('no_click lower_opacity');
			$('#ui_part_left').removeClass('no_click lower_opacity');
			$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
			
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
			
			$('#ui_controls').addClass('no_click lower_opacity');
			$('#ui_part_left').addClass('no_click lower_opacity');
			$('.ui_box_special:visible').not('#ui_box_enemy_path').addClass('no_click').addClass('lower_opacity');
			
		}
	});
	
	//button for path deleting
	$('#btn_path_delete').click(function(){
		
		
		actFabObj.PathArray.forEach(function(ele) {
			i_audicom._room_canvas.remove(ele);
		});
		
		actFabObj.LineArray.forEach(function(ele) {
			i_audicom._room_canvas.remove(ele);
		});
		
		
		actFabObj.LineArray = [];	
		actFabObj.PathArray = [];	
		getReferenceById(actFabObj.AGObjectID).clearRoute();
		getReferenceById(actFabObj.AGObjectID).movable = false;
		
	});
	
	
	
	

	$('#cb_colli').click(function(){
		if($('#cb_colli').is(":checked")){
			getReferenceById(actFabObj.AGObjectID).collidable = true;
		}else{
			getReferenceById(actFabObj.AGObjectID).collidable = false;
		}
	});
	
	
	//button for portal-linking
	$('#btn_path_linkdoors').click(function(){
		if(actFabObj.isRecording){
			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
			
			$('#ui_part_left').removeClass('no_click lower_opacity');
			$('#ui_controls').removeClass('no_click lower_opacity');
			$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_link_portals').removeClass('lower_opacity');
			
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
			
			$('#ui_part_left').addClass('no_click lower_opacity');
			$('#ui_controls').addClass('no_click lower_opacity');
			$('.ui_box_special:visible').not('#ui_box_link_portals').addClass('no_click').addClass('lower_opacity');
			
		}
	});
	
	//delete linked portal
	$('#btn_path_deletedoors').click(function(){
		
		//ICI
		//actFabObj.secDoor.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
		let sec_door_buffer = i_audicom.getFabricObject(actFabObj.secDoor);
		
		i_audicom._room_canvas.remove(actFabObj.line.dot);
		i_audicom._room_canvas.remove(sec_door_buffer.line.dot);
		i_audicom._room_canvas.remove(actFabObj.line);
		i_audicom._room_canvas.remove(sec_door_buffer.line);
		actFabObj.line = false;
		sec_door_buffer.line = false;
		
		
		sec_door_buffer.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
		sec_door_buffer.secDoor = false;
		actFabObj.secDoor = false;
		i_audicom._room_canvas.renderAll();
		
		getReferenceById(actFabObj.AGObjectID).unlink();
		
		//getReferenceById(actFabObj.AGObjectID).clearRoute();
	});

	$('#btn_delete_object').click(function(){

		getReferenceById(actFabObj.AGObjectID).kill();
		
		//check if removed element was linked to portal or has path points and remove that stuff
		//TODO wait for portal remove function in AGPortal
		
		if(actFabObj.type == 'enemy'){
			actFabObj.PathArray.forEach(function(ele) {
				i_audicom._room_canvas.remove(ele);
			});
			actFabObj.LineArray.forEach(function(ele) {
				i_audicom._room_canvas.remove(ele);
			});
		}
		
		if(actFabObj.type == 'portal'){
			//actFabObj.secDoor
			let fab_buffer = i_audicom.getFabricObject(actFabObj.secDoor);
			
			if(fab_buffer){
				fab_buffer.secDoor = false;
				fab_buffer.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);	
			}
			
			if(actFabObj.line){
				i_audicom._room_canvas.remove(i_audicom.getFabricObject(actFabObj.secDoor).line.dot);
				i_audicom._room_canvas.remove(i_audicom.getFabricObject(actFabObj.secDoor).line);
				i_audicom.getFabricObject(actFabObj.secDoor).line = false;
				
				i_audicom._room_canvas.remove(actFabObj.line.dot);
				i_audicom._room_canvas.remove(actFabObj.line);
				actFabObj.line.line = false;
			}
			
		}
		
		i_audicom._room_canvas.remove(actFabObj);
		i_audicom._room_canvas.renderAll();
		
		$('#ui_part_right_inner').fadeOut(100, function(){});
		
	});
	
	
	
	//overlay box
	
	$('#overlay').click(function(e){
		if(!$(e.target).is('a')){
			$('#overlay').fadeOut(200);
		}	
		
	
		
	});
	
	$('#win_screen').click(function(){
		$(this).fadeOut(200);
	});
	
	$('#btn_help').click(function(){
		$('#overlay').fadeIn(200);
	});
	
	
	
	$("#level_dropdown").change(function() {
	    // Pure JS
	    
		
		
		switch(this.value){
			case 'Level 1':
				i_audicom.loadLevel(1);
				break;
			case 'Level 2':
				i_audicom.loadLevel(2);
				break;
			case 'Level 3':
				i_audicom.loadLevel(3);
				break;
		}
		
		
	   	//var selectedText = this.options[this.selectedIndex].text;

	    // jQuery
	    //var selectedVal = $(this).find(':selected').val();
	    //var selectedText = $(this).find(':selected').text();
	});
		
	
	
	
	// //snapping-Stuff (Quelle: https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize)
// 	i_audicom._room_canvas.on('object:moving', options => {
//
// 		getReferenceById(options.target.AGObjectID).position = new Vector3(options.target.left/this._scale, 1, options.target.top/this._scale);
//
//
//
//
// 		//Change wally to wall to reactivate scaling
// 		if(options.target.type == 'wally'){
//  			options.target.set({
//  			   left: Math.round((options.target.left) / this._scale) * this._scale,
//  			   top: Math.round((options.target.top) / this._scale) * this._scale
//  			});
// 		}
// 		//options.target.AGObject.position = new Vector3((options.target.left - options.target.AGObject.size.x*this._scale/2)/this._scale, 1, (options.target.top - options.target.AGObject.size.z*this._scale/2)/this._scale);
//
// 		if(options.target.type == 'portal' && options.target.line){
//
// 			options.target.line.set({ 'x1': options.target.left, 'y1': options.target.top });
// 			options.target.line.dot.set({ 'left': options.target.left-4, 'top': options.target.top-4 });
// 			i_audicom.getFabricObject(options.target.secDoor).line.set({ 'x2': options.target.left, 'y2': options.target.top });
// 			//i_audicom.getFabricObject(options.target.secDoor).line.dots[0].set({ 'left': options.target.left-4, 'top': options.target.top-4 });
//
// 		}
//
//
// 	});
	
	
	$( "#fabric_objects_container details").focus(function() {
		let this_buffer = $(this);
		i_audicom._room_canvas.getObjects().forEach(function(e) {
		          if(e.AGObjectID == this_buffer.attr('obj_id')) {
		              i_audicom._room_canvas.setActiveObject(e);
					  i_audicom._room_canvas.trigger('selection:created', {target: e});
					  i_audicom._room_canvas.renderAll();
		          }
		 });
	});
	
	
	
	
	i_audicom._room_canvas.on('mouse:down', function(e){
		
		//add path-point if an enemy is selected and it is recording
		if(actFabObj.type=='enemy' && actFabObj.isRecording){

			let dot = new fabric.Circle({
			    left:   getMouseCoords(e)[0]-4,
			    top:    getMouseCoords(e)[1]-4,
			    radius: 4,
			    fill:   i_audicom._colors[6][i_audicom._vision_mode],
			    objectCaching: false,
				selectable: false,
				type: 'path_dot'
			});
			
			if(actFabObj.PathArray.length >= 1){
				let last_dot_buffer = actFabObj.PathArray[actFabObj.PathArray.length-1];
				let line = new fabric.Line([dot.left + 4, dot.top + 4,last_dot_buffer.left + 4, last_dot_buffer.top + 4],{
					fill: i_audicom._colors[7][i_audicom._vision_mode],
					stroke: i_audicom._colors[7][i_audicom._vision_mode],
					strokeWidth: 2,
					selectable: false,
					evented: false,
					type: 'path_line'
				});
				
				actFabObj.LineArray.push(line);
				i_audicom._room_canvas.add(line);
			}
			
			actFabObj.PathArray.push(dot);
			i_audicom._room_canvas.setActiveObject(actFabObj);
			i_audicom._room_canvas.add(dot);
			
		}else if(actFabObj.type=='portal' && actFabObj.isRecording){
			
			let obj_buffer = i_audicom._room_canvas.getActiveObject();

			if(obj_buffer){
				if(getReferenceById(obj_buffer.AGObjectID).type == 'PORTAL'){
					//link the portal
					//mark the portal in canvas
					
					i_audicom._room_canvas.setActiveObject(actFabObj);
					
					getReferenceById(actFabObj.AGObjectID).linkPortals(obj_buffer.AGObjectID);
					actFabObj.isRecording = false;
					$('#btn_path_linkdoors').find('i').removeClass('btn_path_rec_blink');
					
					//if there is a door, reset color and remove portal from second door
					if(actFabObj.secDoor){
						i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
						i_audicom.getFabricObject(actFabObj.secDoor).secDoor = false;
					}
					
					if(actFabObj.line){
						
						i_audicom._room_canvas.remove(i_audicom.getFabricObject(actFabObj.secDoor).line.dot);
						i_audicom._room_canvas.remove(i_audicom.getFabricObject(actFabObj.secDoor).line);
						i_audicom.getFabricObject(actFabObj.secDoor).line = false;
						
						i_audicom._room_canvas.remove(actFabObj.line.dot);
						i_audicom._room_canvas.remove(actFabObj.line);
						actFabObj.line.line = false;
							
					}
					
					//obj_buffer.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
					
					//link fabric objects
					actFabObj.secDoor = obj_buffer.AGObjectID;
					obj_buffer.secDoor = actFabObj.AGObjectID;
									
					let dot_1 = new fabric.Circle({
					    left:   actFabObj.left-4,
					    top:    actFabObj.top-4,
					    radius: 4,
					    fill:   i_audicom._colors[6][i_audicom._vision_mode],
					    objectCaching: false,
						selectable: false,
						type: 'portal_dot'
					});
					let dot_2 = new fabric.Circle({
					    left:   obj_buffer.left-4,
					    top:    obj_buffer.top-4,
					    radius: 4,
					    fill:   i_audicom._colors[6][i_audicom._vision_mode],
					    objectCaching: false,
						selectable: false,
						type: 'portal_dot'
					});
					//draw line between portals
					let line_1 = new fabric.Line([actFabObj.left, actFabObj.top,obj_buffer.left, obj_buffer.top],{
						fill: i_audicom._colors[7][i_audicom._vision_mode],
						stroke: i_audicom._colors[7][i_audicom._vision_mode],
						strokeWidth: 2,
						selectable: false,
						evented: false,
						type: 'portal_line',
						dot: dot_1,
					});
					let line_2 = new fabric.Line([obj_buffer.left, obj_buffer.top,actFabObj.left, actFabObj.top],{
						fill: i_audicom._colors[7][i_audicom._vision_mode],
						stroke: i_audicom._colors[7][i_audicom._vision_mode],
						strokeWidth: 2,
						selectable: false,
						evented: false,
						type: 'portal_line',
						dot: dot_2,
						opacity: 0,
					});
					i_audicom._room_canvas.add(dot_1);
					i_audicom._room_canvas.add(dot_2);
					i_audicom._room_canvas.add(line_1);
					i_audicom._room_canvas.add(line_2);
					actFabObj.line = line_1;
					obj_buffer.line = line_2;
					
					//colorize
					//console.log(i_audicom._colors[5][i_audicom._vision_mode]);
					obj_buffer.set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
					
					$('#ui_part_left').removeClass('no_click lower_opacity');
					$('#ui_controls').removeClass('no_click lower_opacity');
					$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
					
					i_audicom.room_canvas.renderAll();
				}
			}else{
				i_audicom._room_canvas.setActiveObject(actFabObj);
			}
			
			
			
		//deselect Object and hide Path-Points	
		}else if(!i_audicom._room_canvas.getActiveObject()){
			
			//TODO stop recording
			
			if(actFabObj.PathArray){
				actFabObj.PathArray.forEach(function(ele) {
					ele.opacity = 0;
				});
				
				actFabObj.LineArray.forEach(function(ele) {
					ele.opacity = 0;
				});
				
				
			}else if(actFabObj.secDoor){
				i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
				
				if(actFabObj.line){
					actFabObj.line.set("opacity", 0);
					actFabObj.line.dot.set("opacity", 0);
					i_audicom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 0);
					
				}
			}
			
			
			loadObject('room');
			
			
			//TODO check if recording; if yes -> stop recording	
		}else{
			i_audicom._room_canvas.setActiveObject(actFabObj);
		}
		
		
	});
	
	//fabric listeners
	i_audicom._room_canvas.on({
	    'selection:created': function(e){
			outputFabPos();
			
			actFabObj = i_audicom._room_canvas.getActiveObject();
			if(actFabObj.type=='portal' || actFabObj.type=='enemy'){
				if(!actFabObj.isRecording){
					loadObject(actFabObj.type);
					if(i_audicom._room_canvas.getActiveObject().PathArray){
						actFabObj = i_audicom._room_canvas.getActiveObject();
						actFabObj.PathArray.forEach(function(ele) {
							ele.opacity = 1;
						});
						actFabObj.LineArray.forEach(function(ele) {
							ele.opacity = 1;
						});
					}else if(actFabObj.secDoor){
						
						i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
					
						if(actFabObj.line){
							actFabObj.line.set("opacity", 1);
							actFabObj.line.dot.set("opacity", 1);
							i_audicom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 1);
						}
					}	
				}
			}else{
				loadObject(actFabObj.type);
			}
	    },
	    'selection:updated': function(e){
			
			outputFabPos();
			//TODO when direkt ein anderes objekt angeklickt wird, ebenfalls die pfade verstecken
			if(actFabObj.isRecording && actFabObj.type=='portal' || actFabObj.isRecording && actFabObj.type=='enemy' ){
				// let actObj_buffer = room_canvas.getActiveObject();
	//
	// 			if(actObj_buffer.type=='portal'){
	// 				actFabObj.secDoor = room_canvas.getActiveObject();
	// 				actObj_buffer.secDoor = actObj;
	// 				getReferenceById(actFabObj.AGObjectID).linkPortals(actObj_buffer.AGObjectID);
	//
	// 			}
				//canvas.setActiveObject(actObj);
	
			}else{
			
				//if another element is selected reset highlights and hide paths
				if(actFabObj != i_audicom._room_canvas.getActiveObject()){	
					if(actFabObj.PathArray){
						actFabObj.PathArray.forEach(function(ele) {
							ele.opacity = 0;
						});
						actFabObj.LineArray.forEach(function(ele) {
							ele.opacity = 0;
						});
					}else if(actFabObj.secDoor){
						i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
						if(actFabObj.line){
						
							actFabObj.line.set("opacity", 0);
							actFabObj.line.dot.set("opacity", 0);
							i_audicom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 0);
						}
					}
				}
			
				//show highlights or paths of new active fab object
				if(i_audicom._room_canvas.getActiveObject().PathArray){
					
					i_audicom._room_canvas.getActiveObject().PathArray.forEach(function(ele) {
						
						ele.opacity = 1;
					});
					i_audicom._room_canvas.getActiveObject().LineArray.forEach(function(ele) {
						ele.opacity = 1;
					});
				
				//if another object is selected hide highlight-color of portal
				}else if(i_audicom._room_canvas.getActiveObject().secDoor){
					i_audicom.getFabricObject(i_audicom._room_canvas.getActiveObject().secDoor).set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
				
				
					if(i_audicom._room_canvas.getActiveObject().line){
				
					
						i_audicom._room_canvas.getActiveObject().line.set("opacity", 1);
						i_audicom._room_canvas.getActiveObject().line.dot.set("opacity", 1);
						i_audicom.getFabricObject(i_audicom._room_canvas.getActiveObject().secDoor).line.dot.set("opacity", 1);
					}
				
				}
				actFabObj = i_audicom._room_canvas.getActiveObject();
				loadObject(actFabObj.type);
			}
		
	    },
		'object:moving': function(e) {
			
			outputFabPos();
			
			
			//if moved outside, slide object along border of canvas
			if(actFabObj.left - actFabObj.getScaledWidth()/2 <= 0){
				actFabObj.left = actFabObj.getScaledWidth()/2;
			}
			if(actFabObj.top - actFabObj.getScaledHeight()/2 <= 0){
				actFabObj.top = actFabObj.getScaledHeight()/2;
			}
			if(actFabObj.top + actFabObj.getScaledHeight()/2 >= i_audicom._room_canvas.height){
				actFabObj.top = i_audicom._room_canvas.height - actFabObj.getScaledHeight()/2;
			}
			if(actFabObj.left + actFabObj.getScaledWidth()/2 >= i_audicom._room_canvas.width){
				actFabObj.left = i_audicom._room_canvas.width - actFabObj.getScaledWidth()/2;
			}
			if(e.target.type == 'portal' && e.target.line){
				e.target.line.set({ 'x1': e.target.left, 'y1': e.target.top });
				e.target.line.dot.set({ 'left': e.target.left-4, 'top': e.target.top-4 });
				i_audicom.getFabricObject(e.target.secDoor).line.set({ 'x2': e.target.left, 'y2': e.target.top });
			}
			getReferenceById(e.target.AGObjectID).position = new Vector3(e.target.left/i_audicom._scale, 1, e.target.top/i_audicom._scale);
		}
	});
	
	
	//misc
	function getMouseCoords(event){
		var pointer = i_audicom._room_canvas.getPointer(event.e);
		var posX = pointer.x;
		var posY = pointer.y;
		return [posX, posY]
	}

	function outputFabPos(){
		$('#coord_x span').text(Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.x * 10) / 10);
		$('#coord_y span').text(Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.z * 10) / 10);
	}

	function drawObjects(obj_type, obj_left, obj_top){

	}

});
