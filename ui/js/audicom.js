var room_canvas;
var scale_ = 55;
var grid = scale_;
var colors = [
  ['#e2e2e2', '#000060'], 	//canvas
  ['#ebebeb', '#cccccc'],	//grid
  ['#A06FEB', '#FFFACD'],	//player
  ['#d47070', '#F7CA18'],	//enemy
  ['#FDA038', '#DDA0DD'],	//wall
];

var vision_mode = 0;

function renderAGRoom(ag_room){
	
	room_canvas = new fabric.Canvas('c',{
	    selection: false, 
	    height: ag_room.size.x * scale_, 
	    width: ag_room.size.z * scale_,
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