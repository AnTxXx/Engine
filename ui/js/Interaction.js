import { i_audicom } from "../../lib/main.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";

jQuery(function($){
	
	//Play-Button
	let interval;
	
	//the active Fabric-Object
	let actFabObj = '';
	
	$('#btn_start_scene').click(function(){
		i_audicom.startArea();
	});
	$('#btn_stop_scene').click(function(){
		i_audicom.stopArea();
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
		_room_canvas.getActiveObject().AGObject.name = buffer;
	});
	
	
	$('#input_obj_pos_x').on('input', function() {	
		i_audicom._room_canvas.getActiveObject().AGObject.position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
		i_audicom._room_canvas.getActiveObject().set({
			left: $('#input_obj_pos_x').val()*i_audicom._scale,
			top: $('#input_obj_pos_y').val()*i_audicom._scale,
		});
		i_audicom._room_canvas.renderAll();
	});
	$('#input_obj_pos_y').on('input', function() {
		i_audicom._room_canvas.getActiveObject().AGObject.position = new Vector3($('#input_obj_pos_x').val(), 1, $('#input_obj_pos_y').val());
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
			ui.helper.animate({
 				width: i_audicom._scale,
 				height: i_audicom._scale,
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
			let left_buff = (ui.position.left)-$(this).offset().left + i_audicom._scale/2;
			let top_buff = (ui.position.top)-$(this).offset().top + i_audicom._scale/2;	
			let agobject_buffer;
			
			i_audicom.makeThenRenderAGObject(obj_type, left_buff, top_buff);
			//render the thing
			
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
			}
		}
	});
	
	
	function loadObject(type){
		
		//all: position, SoSo, Namen, Löschenbutton
		//gegner: Pfad, HP
		//Mauer: Gräße, Form
		//Portale: Verlinkung
		//Spieler: HP, Reichweite, Schaden
		//Raumziel
		
		$('#ui_part_right_inner').fadeOut(100, function(){
			$('#input_obj_name').val(actFabObj.name);
			$('#input_obj_width').val(Math.round(actFabObj.width/i_audicom._scale));
			$('#input_obj_height').val(Math.round(actFabObj.height/i_audicom._scale));

			$('#input_obj_pos_x').val(actFabObj.left/i_audicom._scale);
			$('#input_obj_pos_y').val(actFabObj.top/i_audicom._scale);
			
			$('.ui_box_special').hide();
			
			$('.ui_box_' + type).show();
			$('.ui_box_general').show();
			
			if(type!='player'){
				$('#ui_delete_box').show();
			}
			setTimeout(function(){
				$('#ui_part_right_inner').fadeIn(100);
			}, 100);
		});
	}
	
	
	
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
			actFabObj.AGObject.clearRoute();
			actFabObj.PathArray.forEach(function(ele){
				actFabObj.AGObject.addRouteNode(new Vector3(ele.left/i_audicom._scale, 1, ele.top/i_audicom._scale));
			});
			actFabObj.AGObject.movable = true;
			actFabObj.AGObject.setSpeedSkalar(1);
			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
			
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
		}
	});
	
	//button for path deleting
	$('#btn_path_delete').click(function(){
		actFabObj.PathArray.forEach(function(ele) {
			i_audicom._room_canvas.remove(ele);
		});
		actFabObj.PathArray = [];	
		actFabObj.AGObject.clearRoute();
		actFabObj.AGObject.movable = false;
	});
	
	
	
	//button for portal-linking
	$('#btn_path_linkdoors').click(function(){
		if(actFabObj.isRecording){
			actFabObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
		}else{
			actFabObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
		}
	});
	
	//delete linked portal
	$('#btn_path_deletedoors').click(function(){	
		//TODO wait for urbi too unlink portal function in AGPortal
		// actFabObj.secDoor.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
		//
		// actFabObj.secDoor = false;
		// actFabObj.AGObject.clearRoute();
	});
	
	
	$('#btn_delete_object').click(function(){

		actFabObj.AGObject.kill();
		
		//check if removed element was linked to portal or has path points and remove that stuff
		//TODO wait for portal remove function in AGPortal
		
		if(actFabObj.type == 'enemy'){
			actFabObj.PathArray.forEach(function(ele) {
				i_audicom._room_canvas.remove(ele);
			});
		}
		
		if(actFabObj.type == 'portal'){
			//actFabObj.secDoor
			let fab_buffer = i_audicom.getFabricObject(actFabObj.secDoor);
			fab_buffer.secDoor = false;
			fab_buffer.set("fill", i_audicom._colors[4][i_audicom._vision_mode]);	
		}
		
		i_audicom._room_canvas.remove(actFabObj);
		i_audicom._room_canvas.renderAll();
		
		$('#ui_part_right_inner').fadeOut(100, function(){});
		
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
			i_audicom._room_canvas.add(dot);
			actFabObj.PathArray.push(dot);
			i_audicom._room_canvas.setActiveObject(actFabObj);
		
		
		}else if(actFabObj.type=='portal' && actFabObj.isRecording){
			
			
			let obj_buffer = i_audicom._room_canvas.getActiveObject();

			if(obj_buffer){
				if(obj_buffer.AGObject.type == 'PORTAL'){
					//link the portal
					//mark the portal in canvas
					actFabObj.AGObject.linkPortals(obj_buffer.AGObject);
					actFabObj.isRecording = false;
					$('#btn_path_linkdoors').find('i').removeClass('btn_path_rec_blink');
					
					//link fabric objects
					actFabObj.secDoor = i_audicom.room_canvas.getActiveObject().AGObject;
					obj_buffer.secDoor = actFabObj.AGObject;
					
					//colorize
					//console.log(i_audicom._colors[5][i_audicom._vision_mode]);
					obj_buffer.set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
					
					i_audicom.room_canvas.renderAll();
				}
			}
			i_audicom._room_canvas.setActiveObject(actFabObj);
			
			
		//deselect Object and hide Path-Points	
		}else if(!i_audicom._room_canvas.getActiveObject()){
			
			//TODO stop recording
			
			if(actFabObj.PathArray){
				actFabObj.PathArray.forEach(function(ele) {
					ele.opacity = 0;
				});
			}else if(actFabObj.secDoor){
				i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
			}
			
			$('#ui_part_right_inner').fadeOut(100, function(){});
			
			//TODO check if recording; if yes -> stop recording	
		}
		
		
	});
	
	
	//fabric listeners
	i_audicom._room_canvas.on('selection:created', function(e){
		
		//only load properties if another element is selected
		if(actFabObj != i_audicom._room_canvas.getActiveObject()){
			actFabObj = i_audicom._room_canvas.getActiveObject();
			loadObject(actFabObj.type);
		}
		
		//if element has path array -> show path points
		if(i_audicom._room_canvas.getActiveObject().PathArray){
			actFabObj = i_audicom._room_canvas.getActiveObject();
			actFabObj.PathArray.forEach(function(ele) {
				ele.opacity = 1;
			});
		}else if(actFabObj.secDoor){
			i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
		}
		
	});
	
	
	i_audicom._room_canvas.on('selection:updated', function(e){
		
		//TODO when direkt ein anderes objekt angeklickt wird, ebenfalls die pfade verstecken
		
		if(actFabObj.isRecording && actFabObj.type=='portal'){
	
			// let actObj_buffer = room_canvas.getActiveObject();
//
// 			if(actObj_buffer.type=='portal'){
// 				actFabObj.secDoor = room_canvas.getActiveObject();
// 				actObj_buffer.secDoor = actObj;
// 				actFabObj.AGObject.linkPortals(actObj_buffer.AGObject);
//
// 			}
			//canvas.setActiveObject(actObj);
	
		}else{
			if(actFabObj != i_audicom._room_canvas.getActiveObject() && actFabObj.PathArray){
				//if another object is selected hide path of current object
				actFabObj.PathArray.forEach(function(ele) {
					ele.opacity = 0;
				});
				
				
			//show path-points if object has a path array
			}else if(i_audicom._room_canvas.getActiveObject().PathArray){
				
				i_audicom._room_canvas.getActiveObject().PathArray.forEach(function(ele) {
					ele.opacity = 1;
				});
			//if another object is selected hide highlight-color of portal
			}else if(actFabObj != i_audicom._room_canvas.getActiveObject() && actFabObj.secDoor){
				i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[4][i_audicom._vision_mode]);
			}else{
				
				if(i_audicom._room_canvas.getActiveObject().secDoor){
					i_audicom.getFabricObject(actFabObj.secDoor).set("fill", i_audicom._colors[5][i_audicom._vision_mode]);
				}	
			}
			actFabObj = i_audicom._room_canvas.getActiveObject();
		}
		loadObject(actFabObj.type);
	});
	
	
	
	function getMouseCoords(event){
		var pointer = i_audicom._room_canvas.getPointer(event.e);
		var posX = pointer.x;
		var posY = pointer.y;
		return [posX, posY]
	}

	function setCanvasDimensions(width, height){
		i_audicom._room_canvas.setHeight(width);
		i_audicom._room_canvas.setWidth(height);
		i_audicom._room_canvas.renderAll();
	}

	function drawObjects(obj_type, obj_left, obj_top){

	}
	
	

});