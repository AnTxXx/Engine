import { i_audicom } from "../../lib/main.js";
import { Vector3 } from "../../lib/js/three/Vector3.js";

jQuery(function($){
	
	//Play-Button
	let interval;
	
	//the active Fabric-Object
	let actFabObj;
	
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
			let left_buff = (ui.position.left)-$(this).offset().left;
			let top_buff = (ui.position.top)-$(this).offset().top;	
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
	
	
	function loadObject(){
		
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

			setTimeout(function(){
				$('#ui_part_right_inner').fadeIn(100);
			}, 100);
		});
	}
	
	
	//fabric listeners
	i_audicom._room_canvas.on('selection:created', function(e){
		if(actFabObj != i_audicom._room_canvas.getActiveObject()){
			actFabObj = i_audicom._room_canvas.getActiveObject();
			loadObject();
		}
	});
	i_audicom._room_canvas.on('selection:updated', function(e){
		//if another object is selected hide path of current object
	
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
				actFabObj.PathArray.forEach(function(ele) {
					ele.opacity = 0;
				});
				actFabObj = i_audicom._room_canvas.getActiveObject();
			}else if(actFabObj.PathArray){
				actFabObj = i_audicom._room_canvas.getActiveObject();
				actFabObj.PathArray.forEach(function(ele) {
					ele.opacity = 1;
				});
			}else{
				actObj = i_audicom._room_canvas.getActiveObject();
			}
		}
		loadObject();
	});
	

});