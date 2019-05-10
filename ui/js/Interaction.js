import { i_audicom } from "./main.js";

jQuery(function($){
	
	//Play-Button
	let interval;
	$('#btn_start_scene').click(function(){
		
		i_audicom.startArea();

	});
	$('#btn_stop_scene').click(function(){
		i_audicom.stopArea();
	});
	
	
	
	
	$('#btn_change_vision_mode').click(function(){
		
		
		i_audicom.toggleVisionMode();
	});
	
	
	
	
	
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

});