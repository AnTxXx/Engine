import { i_audicom } from "../../lib/main.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";
import { getIdByReference, getReferenceById, g_gamearea } from "../../lib/AGEngine.js";

jQuery(function($){

	let interval;
	
	//the active fabric-object
	let actFabObj = '';
	
	let key_assign_rec = false;
	
    /**
     * Prepares the Select-Menu for portals
     */
	function portalSelect(){
		$('.other_portal').remove();	
		i_audicom._room_canvas.getObjects().forEach(function(e) {
			if(e.type == "portal") {
				  if(i_audicom._room_canvas.getActiveObject().AGObjectID != e.AGObjectID){
					  $('#portal_dropdown').append('<option class = "other_portal" value="'+ e.AGObjectID +'">'+ e.name +'</option>');
				  }  
			}
		});
		$("#portal_dropdown option[value="+ i_audicom._room_canvas.getActiveObject().secDoor +"]").prop('selected', 'selected');
	}
	
    /**
     * Removes a portal link
     */
	function deletePortal(){
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
	}
	
    /**
     * Prepares UI for a selected fabric-object
     */
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
				if(type =='player'){
					let nav_buffer = getReferenceById(i_audicom._controlsID);
					loadNavigationForUI($('#btn_key_up'), nav_buffer.forward);
					loadNavigationForUI($('#btn_key_down'), nav_buffer.backward);
					loadNavigationForUI($('#btn_key_left'), nav_buffer.left);
					loadNavigationForUI($('#btn_key_right'), nav_buffer.right);
					loadNavigationForUI($('#btn_key_interact'), nav_buffer.interact);
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
	
    /**
     * Prepares UI-elements for navigation
     */
	function loadNavigationForUI(jq_obj_, keycode_){
		switch(keycode_){
			case 37:
				jq_obj_.text('←');
				jq_obj_.attr('keycode', keycode_);
				break;
			case 38:
				jq_obj_.text('↑');
				jq_obj_.attr('keycode', keycode_);
				break;
			case 39:
				jq_obj_.text('→');
				jq_obj_.attr('keycode', keycode_);
				break;
			case 40:
				jq_obj_.text('↓');
				jq_obj_.attr('keycode', keycode_);
				break;
			case -1:
				jq_obj_.text("-");
				jq_obj_.attr('keycode', -1);
				break;
			default:
				jq_obj_.text(String.fromCharCode(keycode_));
		}	
	}
	
    /**
     * adds a path point to the path array of fabric-object (enemies)
     * @param the x-coord of the point
	 * @param the y-coord of the point
     */
	function addPathPoint(left_, top_){
		if(actFabObj.PathArray.length == 0){
			let first_dot = new fabric.Circle({
				left:   actFabObj.left,
				top:    actFabObj.top,
				radius: 4,
			    fill:   i_audicom._colors[6][i_audicom._vision_mode],
			    objectCaching: false,
				selectable: false,
				type: 'path_dot'
			});
			actFabObj.PathArray.unshift(first_dot);
			i_audicom._room_canvas.add(first_dot);
		}
		
		let dot = new fabric.Circle({
		    left:   left_-4,
		    top:    top_-4,
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
		
		//clear old route and save path to AGObject and set movable true
		getReferenceById(actFabObj.AGObjectID).clearRoute();
		actFabObj.PathArray.forEach(function(ele){	
			getReferenceById(actFabObj.AGObjectID).addRouteNode(new Vector3(ele.left/i_audicom._scale, 1, ele.top/i_audicom._scale));
		});
		getReferenceById(actFabObj.AGObjectID).movable = true;	
	}
	
    /**
     * Get the mouse coordinates within the canvas
	 * @param the mouse event
	 * @return array with the mouse coordinates (x,y)
     */
	function getMouseCoords(event){
		var pointer = i_audicom._room_canvas.getPointer(event.e);
		var posX = pointer.x;
		var posY = pointer.y;
		return [posX, posY]
	}
	
    /**
     * Links a portal to a selected portal, marks the portals and draws a line between them
	 * @param: The fabric-object of the portal
     */
	function linkPortalsUI(fabObj_){
		let obj_buffer = fabObj_;
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
				$('.misc_ctrls').removeClass('no_click lower_opacity');
				$('#ui_controls').removeClass('no_click lower_opacity');
				$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
				i_audicom.room_canvas.renderAll();
			}
		}else{
			i_audicom._room_canvas.setActiveObject(actFabObj);
		}
	}
	
    /**
     * Adds the position of a fabric-object to the UI-elements for the position
     */
	function outputFabPos(){
		
		let buff1 = Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.x * 10) / 10;
		let buff2 = Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.z * 10) / 10;
		
		let buff3 = Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).size.x * 10) / 10;
		let buff4 = Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).size.z * 10) / 10;
		
		$('#coord_x span').text(Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.x * 10) / 10);
		$('#coord_y span').text(Math.round(getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position.z * 10) / 10);

		$('#input_obj_x').val(buff1);
		$('#input_obj_y').val(buff2);
		
		
		$('#input_obj_w').val(buff3);
		$('#input_obj_h').val(buff4);
		
	}
	
	/*************************/
	/***jQuery Events Start***/
	/*************************/
	
	$(document).on('keydown',function(e) {
		if (event.keyCode == 13 && event.shiftKey) {
			if($(document.activeElement).hasClass('faboject_')){
				$('#ui_controls div').first().focus();
				loadObject('room');
			}else{
				
				$('.faboject_:first').focus();
			} 	
		}else if(e.which == 13) {
			if($(document.activeElement).hasClass('faboject_')){
				$('#input_obj_name').focus();
			}
			if($(document.activeElement).hasClass('sb_object')){
				var type_buffer = $(document.activeElement).attr('type');
				i_audicom.makeThenRenderAGObject(type_buffer, i_audicom._scale/2, i_audicom._scale/2, true);	
			}	
			if($(document.activeElement).hasClass('input_position')){
				addPathPoint(actFabObj.left, actFabObj.top);
			}
	    }
		if(event.key == "Escape"){
			if($('#overlay').is(":visible")){
				if(!$(e.target).is('a')){
					$('#overlay').fadeOut(200);
				}	
			}
		}
	});
	
	$(document).on("focusout", ".faboject_", function(){	
		setTimeout(function(){
			if(!$(document.activeElement).hasClass('faboject_') && !$(document.activeElement).attr('id') == 'input_obj_name'){
				loadObject('room');
				i_audicom._room_canvas.discardActiveObject().renderAll();
			}
		}, 10);	
	});
	
	i_audicom._room_canvas.on('mouse:down', function(e){
		//add path-point if an enemy is selected and it is recording
		if(actFabObj.type=='enemy' && actFabObj.isRecording){
			addPathPoint(getMouseCoords(e)[0], getMouseCoords(e)[1]);	
		}else if(actFabObj.type=='portal' && actFabObj.isRecording){	
			linkPortalsUI(i_audicom._room_canvas.getActiveObject());
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
						portalSelect();
						i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[5][i_audicom._vision_mode]);			
						if(actFabObj.line){
							actFabObj.line.set("opacity", 1);
							actFabObj.line.dot.set("opacity", 1);
							i_audicom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 1);
						}
					}else if (actFabObj.type = 'portal'){
						portalSelect();
					}	
				}
			}else{	
				loadObject(actFabObj.type);
			}
	    },
	    'selection:updated': function(e){
			portalSelect();
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
						portalSelect();
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
					portalSelect();
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
		},
		'object:scaling': function(e){
			outputFabPos();
			//console.log("Size: " + options.target.width*target.scaleX/this._scale + " " + options.target.height*target.scaleY/this._scale);
			//console.log("Position: " + options.target.left/this._scale + " " + options.target.top/this._scale);
			
			getReferenceById(e.target.AGObjectID).size = new Vector3(e.target.width*e.target.scaleX/i_audicom._scale, 1, e.target.height*e.target.scaleY/i_audicom._scale);
			getReferenceById(e.target.AGObjectID).position = new Vector3(e.target.left/i_audicom._scale, 1, e.target.top/i_audicom._scale);
			
			if(!e.target.strokeWidthUnscaled && e.target.strokeWidth){
				e.target.strokeWidthUnscaled = e.target.strokeWidth;
			}
			if(e.target.strokeWidthUnscaled){
				var scale_buffer = e.target.scaleX > e.target.scaleY ? e.target.scaleX : e.target.scaleY;
				e.target.strokeWidth = e.target.strokeWidthUnscaled / scale_buffer;
			}
		},
	});
	
	//Drag&Drop
	$('.sb_object').draggable({
		appendTo: 'body',
		containment: 'window',
		scroll: false,
		helper: 'clone',
		start: function(e, ui){
			i_audicom._room_canvas.discardActiveObject().renderAll();
			loadObject('room');
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
		}
	});
	
	//change name of object
	$('#input_obj_name').on('input', function() {
	    let buffer = $(this).val();
		i_audicom._room_canvas.getActiveObject().name = buffer;
		_room_canvas.getActiveObject().AGObjectID.name = buffer;
	});
	
	//change x-position of object
	$('#input_obj_x').on('input', function() {
	    let buffer_x = $(this).val();
		let buffer_y = $('#input_obj_y').val();
		i_audicom._room_canvas.getActiveObject().left = buffer_x*i_audicom._scale;
		i_audicom._room_canvas.getActiveObject().setCoords();
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(buffer_x, 1, buffer_y);
		$('#coord_x span').text(buffer_x);
		i_audicom._room_canvas.renderAll();
	});
	
	//change y-position of object
	$('#input_obj_y').on('input', function() {
		let buffer_x = $('#input_obj_x').val();
		let buffer_y = $(this).val();
		i_audicom._room_canvas.getActiveObject().top = buffer_y*i_audicom._scale;
		i_audicom._room_canvas.getActiveObject().setCoords();
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(buffer_x, 1, buffer_y);
		$('#coord_y span').text(buffer_y);
		i_audicom._room_canvas.renderAll();
	});

	//change width of object
	$('#input_obj_w').on('input', function() {
		let new_size = $('#input_obj_w').val();
		let old_size = i_audicom._room_canvas.getActiveObject().width/i_audicom._scale;
		let new_scale = new_size/old_size;
		i_audicom._room_canvas.getActiveObject().scaleX = new_scale;
		i_audicom._room_canvas.getActiveObject().setCoords();
		i_audicom._room_canvas.renderAll();
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).size = new Vector3(i_audicom._room_canvas.getActiveObject().width*i_audicom._room_canvas.getActiveObject().scaleX/i_audicom._scale, 1, i_audicom._room_canvas.getActiveObject().height*i_audicom._room_canvas.getActiveObject().scaleY/i_audicom._scale);
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(i_audicom._room_canvas.getActiveObject().left/i_audicom._scale, 1, i_audicom._room_canvas.getActiveObject().top/i_audicom._scale);
		if(!i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled && i_audicom._room_canvas.getActiveObject().strokeWidth){
			i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled = i_audicom._room_canvas.getActiveObject().strokeWidth;
		}
		if(i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled){
			var scale_buffer = i_audicom._room_canvas.getActiveObject().scaleX > i_audicom._room_canvas.getActiveObject().scaleY ? i_audicom._room_canvas.getActiveObject().scaleX : i_audicom._room_canvas.getActiveObject().scaleY;
			i_audicom._room_canvas.getActiveObject().strokeWidth = i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled / scale_buffer;
		}
	});
	
	//change height of object
	$('#input_obj_h').on('input', function() {
		let new_size = $('#input_obj_h').val();
		let old_size = i_audicom._room_canvas.getActiveObject().height/i_audicom._scale;
		let new_scale = new_size/old_size;
		i_audicom._room_canvas.getActiveObject().scaleY = new_scale;
		i_audicom._room_canvas.getActiveObject().setCoords();
		i_audicom._room_canvas.renderAll();
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).size = new Vector3(i_audicom._room_canvas.getActiveObject().width*i_audicom._room_canvas.getActiveObject().scaleX/i_audicom._scale, 1, i_audicom._room_canvas.getActiveObject().height*i_audicom._room_canvas.getActiveObject().scaleY/i_audicom._scale);
		getReferenceById(i_audicom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(i_audicom._room_canvas.getActiveObject().left/i_audicom._scale, 1, i_audicom._room_canvas.getActiveObject().top/i_audicom._scale);
		if(!i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled && i_audicom._room_canvas.getActiveObject().strokeWidth){
			i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled = i_audicom._room_canvas.getActiveObject().strokeWidth;
		}
		if(i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled){
			var scale_buffer = i_audicom._room_canvas.getActiveObject().scaleX > i_audicom._room_canvas.getActiveObject().scaleY ? i_audicom._room_canvas.getActiveObject().scaleX : i_audicom._room_canvas.getActiveObject().scaleY;
			i_audicom._room_canvas.getActiveObject().strokeWidth = i_audicom._room_canvas.getActiveObject().strokeWidthUnscaled / scale_buffer;
		}
	});
	
	//change room name
	$('#input_room_name').on('input', function() {
	    let buffer = $(this).val();
		getReferenceById(i_audicom._AGroomID).name = buffer;
	});
	
	//select fabric-objects on focus
	$("#fabric_objects_container").on( "focus",'.faboject_',function(e){
		let this_buffer = $(e.target);
		i_audicom._room_canvas.getObjects().forEach(function(e){
			if(e.AGObjectID == this_buffer.attr('obj_id')){
				i_audicom._room_canvas.setActiveObject(e);
				i_audicom._room_canvas.trigger('selection:created', {target: e});
				i_audicom._room_canvas.renderAll();
			}
		});
	});
	
	//assign key to movement
	$('.btn_key_assign').bind("keyup",function(e){
		let keycode_buffer = e.which;
		
		//numpad to number:
		if(keycode_buffer >= 96 && keycode_buffer <= 105){
			keycode_buffer = keycode_buffer - 48;
		}

		//Esc-Taste -> Clear key-assignment
		if(keycode_buffer == 27 || (keycode_buffer >= 37 && keycode_buffer <= 40) || (keycode_buffer >= 65 && keycode_buffer <= 90) || (keycode_buffer >= 48 && keycode_buffer <= 57)){
			
			let nav_buffer = getReferenceById(i_audicom._controlsID);
			//erase double assignments
			$('.btn_key_assign').each(function( index ) {
				if($(this).attr('keycode') == keycode_buffer){					
					switch($(this).attr('id')){
						case 'btn_key_up':
							$(this).text("-");
							$(this).attr('keycode', -1);
							nav_buffer.forward = -1;
							break;
						case 'btn_key_down':
							$(this).text("-");
							$(this).attr('keycode', -1);
							nav_buffer.backward = -1;
							break;
						case 'btn_key_left':
							$(this).text("-");
							$(this).attr('keycode', -1);
							nav_buffer.left = -1;
							break;
						case 'btn_key_right':
							$(this).text("-");
							$(this).attr('keycode', -1);
							nav_buffer.right = -1;
							break;
						case 'btn_key_interact':
							$(this).text("-");
							$(this).attr('keycode', -1);
							nav_buffer.interact = -1;
							break;	
					}	
				}
			});
			
			//arrow-keys
			switch(keycode_buffer){
				case 37:
					$(this).text('←');
					break;
				case 38:
					$(this).text('↑');
					break;
				case 39:
					$(this).text('→');
					break;
				case 40:
					$(this).text('↓');
					break;
				case 27:
					keycode_buffer = -1;
					$(this).text("-");
					break;
				default:
					$(this).text(String.fromCharCode(keycode_buffer));
			}	
			
			$(this).attr('keycode', keycode_buffer);
			
			//hier abfragen welche richtung geändert wurde
			switch($(this).attr('id')){
				case 'btn_key_up':
					nav_buffer.forward = keycode_buffer;
					break;
				case 'btn_key_down':
					nav_buffer.backward = keycode_buffer;
					break;
				case 'btn_key_left':
					nav_buffer.left = keycode_buffer;
					break;
				case 'btn_key_right':
					nav_buffer.right = keycode_buffer;
					break;
				case 'btn_key_interact':
					nav_buffer.interact = keycode_buffer;
					break;	
			}
		}
	});
		
	//fade in mouse coordinates within canvas
	$('.canvas-container').mousemove(function(e) {
		$('#mouse_coords').fadeIn(100);
		$('#mouse_coords_x span').text(Math.round((getMouseCoords(e)[0]*2/110) * 10) / 10);
		$('#mouse_coords_y span').text(Math.round((getMouseCoords(e)[1]*2/110) * 10) / 10);
	});
	
	//fade out mouse coordinates within canvas
	$('.canvas-container').mouseleave(function(){
		$('#mouse_coords').fadeOut(100);
	});
	
	//toggle vision mode
	$('#btn_change_vision_mode').click(function(){
		i_audicom.toggleVisionMode();
	});
	
	//lower zoom factor
	$('#btn_zoom_out').click(function(){
		i_audicom.zoomCanvas(0.9);
	});
	
	//raise zoom factor
	$('#btn_zoom_in').click(function(){
		i_audicom.zoomCanvas(1.1);
	});
	
	//start the scene
	$('#btn_start_scene').click(function(){
		g_gamearea.audioContext.resume();
		i_audicom.startArea();
	});
	
	//stop/reset the scene
	$('#btn_stop_scene').click(function(){
		i_audicom.stopArea();
		$('#btn_new_scene').prop('tabIndex', 0);	
	});
	
	//clear canvas for new scene
	$('#btn_new_scene').click(function(){
		i_audicom.newScene();
	});
	
	//change dimensions of canvas
	$('#btn_set_dim').click(function(){
		i_audicom.setAGRoomDimensions($('#tb_canvas_dim_width').val(), $('#tb_canvas_dim_height').val())
	});
	
	//change speed of object
	$('.bnt_speed').click(function() {
		$('.bnt_speed').removeClass('gegner_speed_active');
		$(this).addClass('gegner_speed_active');
		getReferenceById(actFabObj.AGObjectID).setSpeedSkalar($(this).attr('speed'));
	});
	
	//add soundsource
	$('.btn_ss').click(function(){	
		$('.btn_ss').removeClass('ss_active');
		$(this).addClass('ss_active');
		i_audicom.addSoundSource(actFabObj.AGObjectID, $(this).attr('ss'));
	});
	
	//add position of object to path
	$('#btn_add_to_path').click(function(){
		addPathPoint(actFabObj.left, actFabObj.top);
	});
	
	//record path for object
	$('#btn_path_rec').click(function(){
		if(actFabObj.isRecording){
			let first_dot_buffer = actFabObj.PathArray[0];
			let last_dot_buffer = actFabObj.PathArray[actFabObj.PathArray.length-1];
			let line = new fabric.Line([first_dot_buffer.left + 4, first_dot_buffer.top + 4,last_dot_buffer.left + 4, last_dot_buffer.top + 4],{
				fill: i_audicom._colors[7][i_audicom._vision_mode],
				stroke: i_audicom._colors[7][i_audicom._vision_mode],
				strokeWidth: 2,
				selectable: false,
				evented: false,
				type: 'path_line'
			});

			actFabObj.LineArray.push(line);
			i_audicom._room_canvas.add(line);
			getReferenceById(actFabObj.AGObjectID).clearRoute();
			actFabObj.PathArray.forEach(function(ele){
				getReferenceById(actFabObj.AGObjectID).addRouteNode(new Vector3(ele.left/i_audicom._scale, 1, ele.top/i_audicom._scale));
			});
			getReferenceById(actFabObj.AGObjectID).movable = true;
			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
			$('#ui_controls').removeClass('no_click lower_opacity');
			$('.misc_ctrls').removeClass('no_click lower_opacity');
			$('#ui_part_left').removeClass('no_click lower_opacity');
			$('#btn_add_to_path').removeClass('no_click lower_opacity');
			$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
			$('#ui_controls').addClass('no_click lower_opacity');
			$('.misc_ctrls').addClass('no_click lower_opacity');
			$('#ui_part_left').addClass('no_click lower_opacity');
			$('#btn_add_to_path').addClass('no_click lower_opacity');
			$('.ui_box_special:visible').not('#ui_box_enemy_path').addClass('no_click').addClass('lower_opacity');	
		}
	});
	
	//delete path of object
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
	
	//toggle collidable for object
	$('#cb_colli').click(function(){
		if($('#cb_colli').is(":checked")){
			getReferenceById(actFabObj.AGObjectID).collidable = true;
		}else{
			getReferenceById(actFabObj.AGObjectID).collidable = false;
		}
	});
	
	//toggle recording for portal linking
	$('#btn_path_linkdoors').click(function(){
		if(actFabObj.isRecording){
			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
			
			$('#ui_part_left').removeClass('no_click lower_opacity');
			$('.misc_ctrls').removeClass('no_click lower_opacity');
			$('#ui_controls').removeClass('no_click lower_opacity');
			$('.ui_box_special:visible').removeClass('no_click').not('#ui_box_link_portals').removeClass('lower_opacity');
			
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
			
			$('#ui_part_left').addClass('no_click lower_opacity');
			$('.misc_ctrls').addClass('no_click lower_opacity');
			$('#ui_controls').addClass('no_click lower_opacity');
			$('.ui_box_special:visible').not('#ui_box_link_portals').addClass('no_click').addClass('lower_opacity');
			
		}
	});
	
	//delete link to portal of object
	$('#btn_path_deletedoors').click(function(){
		deletePortal();
	});
	
	//delete object
	$('#btn_delete_object').click(function(){
		i_audicom.deleteItem(actFabObj);
		$('#ui_part_right_inner').fadeOut(100, function(){});
	});
	
	//close overlay
	$('#overlay').click(function(e){
		if(!$(e.target).is('a')){
			$('#overlay').fadeOut(200);
		}		
	});
	
	//close win screen
	$('#win_screen').click(function(){
		$(this).fadeOut(200);
	});
	
	//open help
	$('#btn_help').click(function(){
		$('#overlay').fadeIn(200);
	});
	
	//select level
	$("#level_dropdown").change(function() {		
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
	});
		
	//link portal
	$("#portal_dropdown").change(function(){	
		let portal_buffer = '';
		let value_buffer = $(this).val();
		
		if(value_buffer == ''){
			deletePortal();
		}else{
			i_audicom._room_canvas.getObjects().forEach(function(e) {
				if(e.AGObjectID == value_buffer) {
					  portal_buffer = e;
				}
			});
			linkPortalsUI(portal_buffer);
		}		
	});
	
	/***********************/
	/***jQuery Events End***/
	/***********************/
});
