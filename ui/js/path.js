function Path(){
	var coords_left = [];
	var coords_top = [];
	
	var is_recording = false;
	
	
	this.getCoords=getCoords;
	function getCoords(index){
		return [coords_left[index], coords_top[index]];
	}
	
	this.addCoords=addCoords;
	function addCoords(p_left, p_top){
		coords_top.push(p_top);
		coords_left.push(p_left);
	}	
	
	this.getLength=getLength;
	function getLength(){
		return coords_left.length;
	}
	
	this.getCoordsAsString=getCoordsAsString;
	function getCoordsAsString(){
			
		var buffer = '';
		for(var i = 0; i<coords_left.length; i++){
			
			buffer = coords_left[i] + ' ' + coords_top[i];
			
		}
		console.log(buffer);
		return buffer;
	}
	
	this.setRecording=setRecording;
	function setRecording(p_rec){
		is_recording = p_rec;
	}
	
	this.isRecording=isRecording;
	function isRecording(){
		return is_recording;
	}
	
	
}