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
	
	
	//TODO next time
	//UI durchdesignen!!!!
	//AG-Objects beim D&D
	//Audicom.js -> fabric-handler?
	//IAudiCom.js -> 
	//Interaction -> jQuery-Stuff?
	//center problem beim scaling
	//warum überhaupt snapping???
	//WALLS

	//the active Object on the canvas
	let actObj;
	let room_width = 20;
	let room_depth = 20;

	//**************//
	//**ROOM START**//
	//**************//
	
	//jq dnd-stuff
	
	//*******************//
	//*******TEST********//
	//*******************//


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



	//******canvas stuff end*********//


	$('#btn_path_linkdoors').click(function(){
		if(actObj.isRecording){
			actObj.isRecording = false;
			$(this).find('i').removeClass('btn_path_rec_blink');
		}else{
			actObj.isRecording = true;
			$(this).find('i').addClass('btn_path_rec_blink');
		}
	});


	$('.btn_path_delete').click(function(){
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

	
	$('#btn_set_dim').click(function(){
		setCanvasDimensions($('#tb_canvas_dim_width').val(), $('#tb_canvas_dim_height').val())
	});
	
	$('#btn_set_file').click(function(){	
		let ss_buffer = new AGSoundSource("blabla", "sounds/car.wav", true, 1, room.audioContext, room.resonanceAudioScene);
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

	
	
	//***********************//
	//*******functions********//
	//***********************//


	
	
	
	
	
	

	
	
		
});
