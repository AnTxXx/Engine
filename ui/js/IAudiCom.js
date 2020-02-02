import {
	deleteCondition,
	deleteItem,
	g_eventHandler,
	g_gamearea,
	g_history,
	g_references,
	getIdByReference,
	getOwnerIdOfItemById,
	getReferenceById,
	getReferencesOfType,
	play,
	rebuildHandlerGameArea,
	setControl
} from '../../src/AGEngine.js';
import {AGItem} from "../../src/AGItem.js";
import {AGNavigation} from "../../src/AGNavigation.js";
import {AGObject} from "../../src/AGObject.js";
import {AGCondition} from "../../src/AGCondition.js";
import {AGPlayer} from "../../src/AGPlayer.js";
import {AGPortal} from "../../src/AGPortal.js";
import {AGRoom} from "../../src/AGRoom.js";
import {AGRoomExit} from "../../src/AGRoomExit.js";
import {AGSoundSource} from "../../src/AGSoundSource.js";
import {Event} from "../../src/Event.js";
import {GlobalEvent} from "../../src/GlobalEvent.js";
import {Vector3} from "../../lib/js/three/Vector3.js";

/**
 * Handles communication between UI and Engine
 */
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
     *
     */
    constructor() {
        this._scale = 55;
        this._vision_mode = 0;
        this._interval = '';
        this._room_canvas = new fabric.Canvas('c', {
            selection: false,
        });
        this._controlsID = 3;
        this._colors = [
            ['#e2e2e2', '#000060'], //0 canvas
            ['#ebebeb', '#cccccc'],	//1 grid
            ['#6fafeb', '#FFFACD'],	//2 player
            ['#d47070', '#F7CA18'],	//3 enemy
            ['#FDA038', '#DDA0DD'],	//4 wall, portal, exit
            ['#60cd4b', '#38fd4f'],	//5 colors for highlighted objects
            ['#000000', '#ffffff'],	//6 colors for path-points
            ['#000000', '#f02727'],	//7 colors for path-lines
            ['#7079d4', '#39adff'],	//8 colors for generic objects
        ];
        this.renderScene();
        //this.renderPathDot();


    }

    /**
     * Clears all objects of the current room and sets up an empty canvas with a player-object
     */
    newScene() {
        if (confirm("Clear all objects of current room?")) {
            let room_buffer = this._room_canvas;
            let scale_buffer = this._scale;
            let canvas_objects = room_buffer.getObjects();

            canvas_objects.forEach(function (item, i) {

                if (item.type == 'player') {

                    item.LineArray = [];
                    item.PathArray = [];
                    getReferenceById(item.AGObjectID).clearRoute();
                    getReferenceById(item.AGObjectID).movable = false;

                }
                if (item.isObject && item.type != 'player') {


                    getReferenceById(item.AGObjectID).kill();
                }
                if (item.type != 'grid_line' && item.type != 'player') {
                    room_buffer.remove(item);
                }
            });


            this.deleteItemsEventsEtc();
            room_buffer.renderAll();
        }
    }

    /**
     * Starts the scene and enables the player to control the player-object
     */
    startArea() {

        this.disableKeyScrolling();
        let that = this;
        /*lower opacity and disable click for elements*/
        $('#ui_part_right').addClass('no_click lower_opacity');
        $('select').addClass('no_click lower_opacity');
        $('#ui_controls').addClass('no_click lower_opacity');
        $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').addClass('no_click lower_opacity');

        /*remove tab-index after play was clicked*/
        $('.faboject_').prop('tabIndex', -1);
        $('input').prop('tabIndex', -1);
        $('select').prop('tabIndex', -1);
        $('.sb_object').prop('tabIndex', -1);
        $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').prop('tabIndex', -1);

        let room_buffer = this._room_canvas;
        let scale_buffer = this._scale;
        let canvas_objects = room_buffer.getObjects();

        play(getReferenceById(g_gamearea.ID), true);
        this._interval = setInterval(function () {


            canvas_objects = room_buffer.getObjects();
            if (getReferenceById(that._AGroomID).solved) {
                that.stopArea();
                $('#win_screen').fadeIn(100);
            }
            canvas_objects.forEach(function (item, i) {
                if (item.isObject) {
                    if (item.type == 'player') {
                        if (item.left + 200 > $('#canvas_container').width() + $('#canvas_container').scrollLeft()) {
                            $('#canvas_container').scrollLeft($('#canvas_container').scrollLeft() + 1);
                        } else if (item.left - 200 < $('#canvas_container').scrollLeft()) {
                            $('#canvas_container').scrollLeft($('#canvas_container').scrollLeft() - 1);
                        }

                        if (item.top + 200 > $('#canvas_container').height() + $('#canvas_container').scrollTop()) {
                            $('#canvas_container').scrollTop($('#canvas_container').scrollTop() + 1);
                        } else if (item.top - 200 < $('#canvas_container').scrollTop()) {
                            $('#canvas_container').scrollTop($('#canvas_container').scrollTop() - 1);
                        }
                    }

                    // item.left = item.AGObject.position.x*scale_buffer + item.AGObject.size.x*scale_buffer/2;
                    // item.top = item.AGObject.position.z*scale_buffer + item.AGObject.size.z*scale_buffer/2;
                    // item.set('angle', Math.atan2(item.AGObject.direction.z, item.AGObject.direction.x) * 180 / Math.PI);

                    // check if not null or undefined
                    if (getReferenceById(item.AGObjectID)) {
                        //remove "dead" objects [URB WZ HERE]
                        if (getReferenceById(item.AGObjectID).destructible && getReferenceById(item.AGObjectID).health <= 0) {
                            //remove path of dead enemies
                            if (item.type == 'enemy') {
                                item.PathArray.forEach(function (ele) {
                                    room_buffer.remove(ele);
                                });
                            }
                            room_buffer.remove(item);
                        }

                        item.left = getReferenceById(item.AGObjectID).position.x * scale_buffer;
                        item.top = getReferenceById(item.AGObjectID).position.z * scale_buffer;

                        if (item == room_buffer.getActiveObject()) {
                            $('#coord_x span').text(getReferenceById(item.AGObjectID).position.x);
                            $('#coord_y span').text(getReferenceById(item.AGObjectID).position.z);
                        }
                        item.set('angle', Math.atan2(getReferenceById(item.AGObjectID).direction.z, getReferenceById(item.AGObjectID).direction.x) * 180 / Math.PI);
                    } else {
                        room_buffer.remove(item);
                    }
                }
            });
            room_buffer.renderAll();
        }, 33);
    }

    /**
     * Stops and rebuilds the scene
     */
    stopArea() {

        //this.enableKeyScrolling();

        /*make clickable again*/
        $('#ui_part_right').removeClass('no_click lower_opacity');
        $('select').removeClass('no_click lower_opacity');
        $('#ui_controls').removeClass('no_click lower_opacity');
        $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').removeClass('no_click lower_opacity');
        $('#fabric_objects_container').empty();

        /*add tab-index after play was clicked*/
        $('.faboject_').prop('tabIndex', 0);
        $('input').prop('tabIndex', 0);
        $('select').prop('tabIndex', 0);
        $('.sb_object').prop('tabIndex', 0);
        $('.btn').not('#btn_stop_scene').not('#btn_change_vision_mode').not('#btn_help').prop('tabIndex', 0);

        play(getReferenceById(g_gamearea.ID), false);
        clearInterval(this._interval);
        this._room_canvas.clear();
        g_references.clear();
        g_history.rebuild();
        this.renderScene();
    }

    /**
     * Renders the canvas
     * @param ID of the AGRoom
     */
    renderAGRoom(ag_roomID) {
        this._room_canvas.setWidth(getReferenceById(ag_roomID).size.x * this._scale);
        this._room_canvas.setHeight(getReferenceById(ag_roomID).size.z * this._scale);
        let options = {
            distance: this._scale,
            width: this._room_canvas.width,
            height: this._room_canvas.height,
            param: {
                stroke: this._colors[1][this._vision_mode],
                strokeWidth: 1,
                selectable: false,
                type: 'grid_line'
            }
        };

        //grid for the canvas
        let gridHeight = options.height / options.distance;
        let gridLen = options.width / options.distance;

        for (var i = 0; i < gridLen; i++) {
            var distance = i * options.distance,
                vertical = new fabric.Line([distance, 0, distance, options.height], options.param);
            this._room_canvas.add(vertical);
        }
        ;

        for (var i = 0; i < gridHeight; i++) {
            var distance = i * options.distance,
                horizontal = new fabric.Line([0, distance, options.width, distance], options.param);
            this._room_canvas.add(horizontal);
        }
        ;

        this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];
        this._room_canvas.renderAll();
    }

    /**
     * Changes the dimensions of the canvas
     * @param Width of the new canvas
     * @param Height of the new canvas
     */
    setAGRoomDimensions(width, height) {
        let room_buffer = this._room_canvas;
        let old_width = room_buffer.getWidth();
        let old_height = room_buffer.getHeight();
        let new_width = width * this._scale;
        let new_height = height * this._scale;
        let that = this;

        //delete objects which lie outside boundaries after resize
        if (new_width < old_width || new_height < old_height) {
            //Check if objects lie outside
            let scale_buffer = this._scale;
            let canvas_objects = room_buffer.getObjects();
            canvas_objects.forEach(function (item, i) {

                if (item.type != 'grid_line') {
                    let item_right_buffer = item.left + Math.round(item.width * item.scaleX) / 2;
                    let item_top_buffer = item.top + Math.round(item.height * item.scaleY) / 2;
                    if (item_right_buffer > new_width || item_top_buffer > new_height) {
                        if (item.type == 'path_line' || item.type == 'path_dot') {
                            //Hierher
                            item.parentFab.PathArray.forEach(function (ele) {
                                room_buffer.remove(ele);
                            });
                            item.parentFab.LineArray.forEach(function (ele) {
                                room_buffer.remove(ele);
                            });
                            room_buffer.remove(item);
                            item.parentFab.PathArray = [];
                            getReferenceById(item.parentFab.AGObjectID).clearRoute();
                            getReferenceById(item.parentFab.AGObjectID).movable = false;
                        } else if (item.type == 'player') {
                            item.left = 0.5 * that._scale;
                            item.top = 0.5 * that._scale;
                            item.setCoords();
                            getReferenceById(item.AGObjectID).position = new Vector3(0.5, 1, 0.5);
                        } else {
                            that.deleteObject(item);
                        }
                    }
                }
            });
        }
        this._room_canvas.setWidth(width * this._scale);
        this._room_canvas.setHeight(height * this._scale);
        this._room_canvas.renderAll();
        //set room size of AGRoom (what happens with objects, which "fall out")
        getReferenceById(this._AGroomID).size = new Vector3(width, 2.5, height);
    }

    /**
     * Creates an AGObject and calls renderAGObject with its ID
     * @param The type of the AGObject
     * @param The x-position of the AGObject
     * @param The y-position of the AGObject
     */
    makeThenRenderAGObject(obj_type, obj_left, obj_top) {
        let obj_buffer;
        let obj_buffer_ID;
        switch (obj_type) {
            case 'enemy':
                obj_buffer = new AGObject("AGgegner", new Vector3((obj_left / this._scale), 1, (obj_top / this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                obj_buffer_ID = getIdByReference(obj_buffer);
                getReferenceById(obj_buffer_ID).tag = "ENEMY";
                getReferenceById(obj_buffer_ID).setSpeedSkalar(0);
                break;
            case 'wall':
                obj_buffer = new AGObject("Structure", new Vector3((obj_left / this._scale), 1.0, (obj_top / this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                obj_buffer_ID = getIdByReference(obj_buffer);
                getReferenceById(obj_buffer_ID).tag = "WALL";
                break;
            case 'portal':
                obj_buffer = new AGPortal("Portal", new Vector3((obj_left / this._scale), 1.0, (obj_top / this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                obj_buffer_ID = getIdByReference(obj_buffer);
                break;
            case 'exit':
                obj_buffer = new AGRoomExit("Exit", new Vector3((obj_left / this._scale), 1.0, (obj_top / this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                obj_buffer_ID = getIdByReference(obj_buffer);
                break;
            case 'generic':
                obj_buffer = new AGObject("Generic", new Vector3((obj_left / this._scale), 1.0, (obj_top / this._scale)), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                obj_buffer_ID = getIdByReference(obj_buffer);
                getReferenceById(obj_buffer_ID).collidable = false;
                getReferenceById(obj_buffer_ID).tag = "GENERIC";
        }
        getReferenceById(this._AGroomID).add(obj_buffer_ID);
        this.renderAGObject(obj_buffer_ID);

        this.refreshObjectSelect();
        this.listItems();
        this.listConditions();

        return obj_buffer_ID;
    }

    /**
     * Creates a fabric-Object and renders it
     * @param The ID of the AGOBject
     */
    renderAGObject(ag_objectID) {

        let _scalebuffer = this._scale
        let colors_buffer = this._colors;
        let vision_mode_buffer = this._vision_mode;
        let room_canvas_buffer = this._room_canvas;

        //add details for tapping
        $('<div tabindex = "0" id = "fabobject_' + ag_objectID + '" obj_id = "' + ag_objectID + '" class = "faboject_">test</div>').prependTo('#fabric_objects_container');

        if (getReferenceById(ag_objectID).tag) {
            switch (getReferenceById(ag_objectID).tag) {
                case 'ENEMY':
                    fabric.loadSVGFromURL('ui/img/enemy.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
                        obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[3][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.PathArray = [];
                        obj.LineArray = [];
                        obj.isObject = true;
                        obj.isRecording = false;
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'enemy';
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        if (getReferenceById(ag_objectID).route.length > 0) {
                            getReferenceById(ag_objectID).route.forEach(function (item, index) {
                                let dot = new fabric.Circle({
                                    left: (item.x * _scalebuffer) - 4,
                                    top: (item.z * _scalebuffer) - 4,
                                    radius: 4,
                                    fill: colors_buffer[6][vision_mode_buffer],
                                    objectCaching: false,
                                    selectable: false,
                                    opacity: 0,
                                    type: 'path_dot',
                                    parentFab: obj
                                });
                                if (obj.PathArray.length >= 1) {
                                    let last_dot_buffer = obj.PathArray[obj.PathArray.length - 1];
                                    let line = new fabric.Line([dot.left + 4, dot.top + 4, last_dot_buffer.left + 4, last_dot_buffer.top + 4], {
                                        fill: colors_buffer[7][vision_mode_buffer],
                                        stroke: colors_buffer[7][vision_mode_buffer],
                                        strokeWidth: 2,
                                        selectable: false,
                                        evented: false,
                                        opacity: 0,
                                        type: 'path_line',
                                        parentFab: obj
                                    });
                                    obj.LineArray.push(line);
                                    room_canvas_buffer.add(line);
                                }
                                obj.PathArray.push(dot);
                                room_canvas_buffer.add(dot);
                            });
                        }
                        room_canvas_buffer.add(obj).renderAll();
                    });
                    break;

                case 'WALL':
                    var obj = new fabric.Rect({
                        width: getReferenceById(ag_objectID).size.x * _scalebuffer,
                        height: getReferenceById(ag_objectID).size.z * _scalebuffer,
                        fill: colors_buffer[4][vision_mode_buffer],
                        left: getReferenceById(ag_objectID).position.x * _scalebuffer,
                        top: getReferenceById(ag_objectID).position.z * _scalebuffer,
                        AGObjectID: ag_objectID,
                        isObject: true,
                        name: getReferenceById(ag_objectID).name,
                        type: 'wall',
                        strokeWidth: 1,
                        originX: 'center',
                        originY: 'center',
                    });
                    obj.hasRotatingPoint = false;
                    room_canvas_buffer.add(obj).renderAll();
                    break;

                default:
                    fabric.loadSVGFromURL('ui/img/generic.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
                        obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[8][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.PathArray = [];
                        obj.LineArray = [];
                        obj.isObject = true;
                        obj.isRecording = false;
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'generic';
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        room_canvas_buffer.add(obj).renderAll();
                    });
            }

        } else if (getReferenceById(ag_objectID).type) {
            switch (getReferenceById(ag_objectID).type) {
                case 'PORTAL':
                    fabric.loadSVGFromURL('ui/img/portal.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
                        obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[4][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.isObject = true;
                        obj.isRecording = false;
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'portal';
                        if (getReferenceById(ag_objectID).exit) {
                            let secDoorAGObject = getReferenceById(ag_objectID).exit
                            obj.secDoor = getIdByReference(secDoorAGObject);
                            let dot = new fabric.Circle({
                                left: obj.left - 4,
                                top: obj.top - 4,
                                radius: 4,
                                fill: colors_buffer[6][vision_mode_buffer],
                                objectCaching: false,
                                selectable: false,
                                type: 'portal_dot',
                                opacity: 0,
                            });
                            //draw line between portals
                            let line = new fabric.Line([obj.left, obj.top, secDoorAGObject.position.x * _scalebuffer, secDoorAGObject.position.z * _scalebuffer], {
                                fill: colors_buffer[7][vision_mode_buffer],
                                stroke: colors_buffer[7][vision_mode_buffer],
                                strokeWidth: 2,
                                selectable: false,
                                evented: false,
                                type: 'portal_line',
                                dot: dot,
                                opacity: 0,
                            });
                            obj.line = line;
                            obj.line.dot = dot;
                            room_canvas_buffer.add(dot);
                            room_canvas_buffer.add(line);
                        } else {
                            obj.secDoor = false;
                            obj.line = false;
                        }
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        room_canvas_buffer.add(obj).renderAll();
                    });
                    break;

                case 'EXIT':
                    fabric.loadSVGFromURL('ui/img/exit.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(getReferenceById(ag_objectID).size.x * _scalebuffer);
                        obj.scaleToHeight(getReferenceById(ag_objectID).size.z * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[4][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.isObject = true;
                        obj.isRecording = false;
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'exit';
                        obj.secDoor = false;
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        room_canvas_buffer.add(obj).renderAll();
                    });
                    break;

                case 'PLAYER':
                    //TODO change size of player
                    fabric.loadSVGFromURL('ui/img/player.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(1 * _scalebuffer);
                        obj.scaleToHeight(1 * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[2][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.isObject = true;
                        obj.PathArray = [];
                        obj.LineArray = [];
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'player';
                        room_canvas_buffer.add(obj).renderAll();
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        if (getReferenceById(ag_objectID).route.length > 0) {
                            getReferenceById(ag_objectID).route.forEach(function (item, index) {
                                let dot = new fabric.Circle({
                                    left: (item.x * _scalebuffer) - 4,
                                    top: (item.z * _scalebuffer) - 4,
                                    radius: 4,
                                    fill: colors_buffer[6][vision_mode_buffer],
                                    objectCaching: false,
                                    selectable: false,
                                    opacity: 0,
                                    type: 'path_dot',
                                    parentFab: obj
                                });
                                if (obj.PathArray.length >= 1) {
                                    let last_dot_buffer = obj.PathArray[obj.PathArray.length - 1];
                                    let line = new fabric.Line([dot.left + 4, dot.top + 4, last_dot_buffer.left + 4, last_dot_buffer.top + 4], {
                                        fill: colors_buffer[7][vision_mode_buffer],
                                        stroke: colors_buffer[7][vision_mode_buffer],
                                        strokeWidth: 2,
                                        selectable: false,
                                        evented: false,
                                        opacity: 0,
                                        type: 'path_line',
                                        parentFab: obj
                                    });
                                    obj.LineArray.push(line);
                                    room_canvas_buffer.add(line);
                                }
                                obj.PathArray.push(dot);
                                room_canvas_buffer.add(dot);
                            });
                        }
                        room_canvas_buffer.add(obj).renderAll();
                    });
                    break;

                default:
                    fabric.loadSVGFromURL('ui/img/generic.svg', function (objects) {
                        var obj = fabric.util.groupSVGElements(objects);
                        obj.scaleToWidth(1 * _scalebuffer);
                        obj.scaleToHeight(1 * _scalebuffer);
                        obj.left = getReferenceById(ag_objectID).position.x * _scalebuffer;
                        obj.top = getReferenceById(ag_objectID).position.z * _scalebuffer;
                        obj.angle = Math.atan2(getReferenceById(ag_objectID).direction.z, getReferenceById(ag_objectID).direction.x) * 180 / Math.PI;
                        obj.fill = colors_buffer[4][vision_mode_buffer];
                        obj.AGObjectID = ag_objectID;
                        obj.isObject = true;
                        obj.name = getReferenceById(ag_objectID).name;
                        obj.type = 'generic';
                        room_canvas_buffer.add(obj).renderAll();
                        obj.originX = 'center';
                        obj.originY = 'center';
                        obj.hasRotatingPoint = false;
                        obj.lockScalingX = true;
                        obj.lockScalingY = true;
                        obj.setControlsVisibility({
                            mt: false, // middle top disable
                            mb: false, // midle bottom
                            ml: false, // middle left
                            mr: false, // I think you get it
                            tr: false,
                            tl: false,
                            br: false,
                            bl: false,
                        });
                        room_canvas_buffer.add(obj).renderAll();
                    });
            }
        }
    }

    /**
     * Deletes Items, Conditions, Global Events & Events
     */
    deleteItemsEventsEtc() {
        let items_buffer = getReferencesOfType('AGItem');
        items_buffer.forEach(function (buffer) {
            deleteItem(buffer);
        });
        let conditions_buffer = getReferencesOfType('AGCondition');
        conditions_buffer.forEach(function (buffer) {
            deleteCondition(buffer);
        });
        let glevents_buffer = getReferencesOfType('GlobalEvent');
        glevents_buffer.forEach(function (buffer) {
            getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeGlobalEventByID(parseInt(buffer));
        });
        let events_buffer = getReferencesOfType('Event');
        events_buffer.forEach(function (buffer) {
            getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeEventByID(parseInt(buffer));
        });

        this.listItems();
        this.listEvents();
        this.refreshItemSelect();
        this.listGlobalEvents();
        this.listConditions();
    }


    /**
     * Lists all Items
     */
    listItems() {
        let select_obj_buffer = '<option value = ""></option>' + this.prepareSelectObjects();
        $('#item_carrier').empty().append(select_obj_buffer);
        $('#item_table tbody tr').not('#item_input_row').empty();
        let items_buffer = getReferencesOfType('AGItem');
        let that = this;
        if (items_buffer.length > 0) {
            items_buffer.forEach(function (element) {
                let item_buffer = getReferenceById(element);
                $('#item_table tbody').append('<tr id = "item_' + element + '" item_id = "' + element + '"><td><input class = "input_item_name" placeholder="New Item" maxlength="100" type="text" name="item_name" value="' + item_buffer.name + '"></td><td><input class = "input_item_desc" placeholder="This item..." maxlength="100" type="text" name="item_description" value="' + item_buffer.description + '"></td><td><input class = "input_item_type" placeholder="Generic" maxlength="100" type="text" name="item_type" value="' + item_buffer.type + '"></td><td><input class = "input_item_charges" placeholder="1" maxlength="10" type="number" step="1" min="1" name="item_charges" value="' + item_buffer.charges + '"></td><td><select class = "select_item_carrier">' + select_obj_buffer + '</select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
                $('#item_' + element + ' .select_item_carrier').val(getOwnerIdOfItemById(element));
            });
        }
    }

    /**
     * Updates the Item Lists
     */
    refreshItemSelect() {
        let select_item_buffer = this.prepareSelectItems();
        $('.select_event_item').empty().append(select_item_buffer);
        $('#event_item').empty().append(select_item_buffer);

        $('.select_event_item').each(function (index) {
            let id_buffer = parseInt($(this).parents('tr').attr('event_id'));
            let event_buffer = getReferenceById(id_buffer);
            $('#event_' + id_buffer + ' .select_event_item').val(event_buffer.addObject.ID);
        });
    }

    /**
     * Lists all Conditions
     */
    listConditions() {
        $('#condition_table tbody tr').not('#condition_input_row').remove();
        let select_obj_buffer = this.prepareSelectObjects();
        let select_item_buffer = this.prepareSelectItems();
        let select_portals_buffer = this.prepareSelectPortals();
        let select_type_buffer = this.prepareSelectTypes();
        let conditions_buffer = getReferencesOfType('AGCondition');
        $('#condition_primary').empty().append(select_obj_buffer);
        $('#condition_item').empty().append(select_item_buffer);
        $('#condition_portal').empty().append(select_portals_buffer);
        $('#condition_type').empty().append(select_type_buffer);
        let that = this;
        if (conditions_buffer.length > 0) {
            conditions_buffer.forEach(function (element) {
                let condition_buffer = getReferenceById(element);
                $('#condition_table tbody').append('<tr id="condition_' + element + '" condition_id = "' + element + '"><td><select class = "select_condition_portal">' + select_portals_buffer + '</select></td><td><select class = "select_condition_primary">' + select_obj_buffer + '</select></td><td><select class="select_condition_trigger"><option value="countByType">Count By Type</option><option value="hasItemById">Has Item</option></select></td><td class = "condition_cnt"><select class = "input_condition_type"  class = "input_row">' + select_type_buffer + '</select></td><td class = "condition_cnt"><input class = " input_condition_count" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_count" style = "width:auto;" value = "' + 4 + '"></td><td class = "condition_has"><select class = "select_condition_item">' + select_item_buffer + '</select></td><td class = "condition_has"><select class = "select_condition_tf"  class = "input_row"><option value = "true">True</option><option value = "false">False</option></select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
                let portal_id_buffer = that.getIdOfPortal(element);
                if (portal_id_buffer) {
                    $('#condition_' + element + ' .select_condition_portal').val(portal_id_buffer);
                }
                $('#condition_' + element + ' .select_condition_primary').val(condition_buffer.object.ID);
                $('#condition_' + element + ' .select_condition_trigger').val(condition_buffer.funcOfConditionObject.name);
                let condition_func_buffer = condition_buffer.funcOfConditionObject.name;
                if (condition_func_buffer == 'countByType') {
                    $('#condition_' + element).find(".condition_has").hide();
                    $('#condition_' + element).find('.condition_cnt').show();
                    $('#condition_' + element + ' .input_condition_type').val(condition_buffer.funcArgs[0]);
                    $('#condition_' + element + ' .input_condition_count').val(condition_buffer.value);

                } else if (condition_func_buffer == 'hasItemById') {
                    $('#condition_' + element).find('.condition_cnt').hide();
                    $('#condition_' + element).find(".condition_has").show();
                    $('#condition_' + element + ' .select_condition_item').val(condition_buffer.funcArgs[0]);
                    if (condition_buffer.value) {
                        $('#condition_' + element + ' .select_condition_tf').val("true");
                    } else {
                        $('#condition_' + element + ' .select_condition_tf').val("false");
                    }
                }
            });
        }
    }

    /**
     * Generates a new Item with the given properties
     * @param The name of the item
     * @param The description of the item
     * @param The type of the item
     * @param The charges count of the item
     * @param The carrier object of the item
     */
    generateItem(_item_name, _item_desc, _item_type, _item_charges, _item_carriedby) {
        let item_buffer = new AGItem(_item_name, _item_desc, _item_type, _item_charges);
        let id_buffer = getIdByReference(item_buffer);
        let select_obj_buffer = '<option value = ""></option>' + this.prepareSelectObjects();
        $('#item_table tbody').append('<tr id = "item_' + id_buffer + '" item_id = "' + id_buffer + '"><td><input class = "input_item_name" placeholder="New Item" maxlength="100" type="text" name="item_name" value="' + item_buffer.name + '"></td><td><input class = "input_item_desc" placeholder="This item..." maxlength="100" type="text" name="item_description" value="' + item_buffer.description + '"></td><td><input class = "input_item_type" placeholder="Generic" maxlength="100" type="text" name="item_type" value="' + item_buffer.type + '"></td><td><input class = "input_item_charges" placeholder="1" maxlength="10" type="number" step="1" min="1" name="item_charges" value="' + item_buffer.charges + '"></td><td><select class = "select_item_carrier">' + select_obj_buffer + '</select></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
        if (_item_carriedby) {
            getReferenceById(parseInt(_item_carriedby)).inventory.addItemById(id_buffer);
            $('#item_' + id_buffer + ' .select_item_carrier').val(_item_carriedby);
        }
        this.refreshItemSelect();
        this.listGlobalEvents();
        this.listConditions();
    }

    /**
     * Generates a new Condition with the given properties
     * @param The portal the condition applies to
     * @param The object interacting with the portal
     * @param The trigger function
     * @param The type of the item
     * @param The count of the item
     */
    generateCondition(_cond_portal, _cond_primary, _cond_func, _cond_arg1, _cond_arg2) {
        let cond_buffer = new AGCondition(_cond_primary, "INVENTORY", _cond_func, [_cond_arg1], _cond_arg2);
        getReferenceById(_cond_portal).addConditionById(getIdByReference(cond_buffer));
        this.listConditions();
    }

    /**
     * Prepares the content of the Dropdown for the portals
     * @returns The String with the Dropdown-Options
     */
    prepareSelectPortals() {
        let that = this;
        let select_obj_buffer = '';
        //prepare the select for the objects
        let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
        this._AGroomID = rooms_buffer[0].ID;
        if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
            getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
                if (element.type == 'PORTAL') {
                    select_obj_buffer = select_obj_buffer + '<option value = "' + element.ID + '">' + element.name + '</option>';
                }
            });
        }
        return select_obj_buffer;
    }

    /**
     * Returns all Portal Objects
     * @returns The array of portals
     */
    getPortals() {
        let portals_buffer = [];
        let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
        this._AGroomID = rooms_buffer[0].ID;
        if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
            getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
                if (element.type == 'PORTAL') {
                    portals_buffer.push(element);
                    //select_obj_buffer = select_obj_buffer + '<option value = "'+ element.ID + '">' + element.name + '</option>';
                }
            });
        }
        return portals_buffer;
    }

    /**
     * Returns the ID of a Portal linked to a Condition ID
     * @param The Condition ID
     * @returns The Portal ID
     */
    getIdOfPortal(_condition_id) {
        let portals_buffer = this.getPortals();
        let portal_id_buffer = null;
        portals_buffer.forEach(function (portal_buffer) {
            let conditions_buffer = portal_buffer.conditions;
            conditions_buffer.forEach(function (condition_buffer) {
                if (condition_buffer.ID == _condition_id) {

                    portal_id_buffer = getIdByReference(portal_buffer);
                }
            });
        });
        return portal_id_buffer;
    }


    /**
     * Prepares the content of the Dropdown for the Item Types
     * @returns The String with the Dropdown-Options
     */
    prepareSelectTypes() {
        let items_buffer = getReferencesOfType('AGItem');
        let that = this;
        let types_buffer = [];
        let append_buffer = "<option item_type = ''></option>";
        if (items_buffer.length > 0) {
            items_buffer.forEach(function (element) {
                let type_buffer = getReferenceById(element).type;
                if (!types_buffer.includes(type_buffer)) {
                    types_buffer.push(type_buffer);
                    append_buffer += "<option item_type = " + type_buffer + ">" + type_buffer + "</option>";
                }
            });
        }
        return append_buffer;
    }

    /**
     * Deletes a Condition by ID
     * @param The Condition ID
     */
    deleteConditionFromList(_cond_id) {
        deleteCondition(_cond_id);
        this.listConditions();
    }

    /**
     * Generates a new Event with the given properties
     * @param The primary object of the Event
     * @param The trigger
     * @param The resulting action
     * @param The item name
     * @param The secondary object
     * @param The repeat count
     */
    generateEvent(_event_primary, _event_trigger, _event_action, _event_item, _event_secondary, _event_repeat) {
        let event_buffer = new Event(_event_primary, _event_trigger, _event_action, _event_secondary, _event_item, _event_repeat);
        let id_buffer = getIdByReference(event_buffer);
        let select_obj_buffer = this.prepareSelectObjects();
        let select_item_buffer = this.prepareSelectItems();

        $('#event_table tbody').append('<tr id = "event_' + id_buffer + '" event_id = "' + id_buffer + '"><td><select class = "select_event_primary">' + select_obj_buffer + '</select></td><td><select class = "select_event_trigger"><option value = "null">None</option><option value = "ONDEATH">ONDEATH</option><option value = "ONCONTACT">ONCONTACT</option><option value = "ONSIGHT">ONSIGHT</option></select></td><td><select class = "select_event_action"><option value = "null">None</option><option value = "ADD">ADD</option><option value = "REMOVE">REMOVE</option><option value = "MOVE">MOVE</option><option value = "ACTIVATE">ACTIVATE</option><option value = "DEACTIVATE">DEACTIVATE</option><option value = "WINGAME">WINGAME</option></select></td><td><select class = "select_event_item">' + select_item_buffer + '</select></td><td><select class = "select_event_secondary">' + select_obj_buffer + '</select></td><td><input class = "input_events_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="events_repeat" value="' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
        $('#event_' + id_buffer + ' .select_event_trigger').val(_event_trigger);
        $('#event_' + id_buffer + ' .select_event_action').val(_event_action);
        $('#event_' + id_buffer + ' .input_events_repeat').val(_event_repeat);

        this.refreshObjectSelect();
        this.refreshItemSelect();
    }

    /**
     * Deletes an Item by ID
     * @param The Item ID
     */
    deleteItemfromList(_item_id) {
        deleteItem(parseInt(_item_id));
        this.listEvents();
        this.refreshItemSelect();
        this.listGlobalEvents();
        this.listConditions();
    }

    /**
     * Generates a new Global Event with the given properties
     * @param The primary object of the event
     * @param The condition object
     * @param The called function
     * @param The item type
     * @param The item count
     * @param The resulting action
     * @param The repeat count
     */
    generateGlobalEvent(_glevent_primary, _glevent_conobject, _glevent_func, _glevent_type, _glevent_count, _glevent_action, _glevent_repeat) {
        let glevent_buffer = new GlobalEvent(_glevent_primary, _glevent_conobject, _glevent_func, [_glevent_type], _glevent_count, _glevent_action, _glevent_repeat);
        this.refreshObjectSelect();
        this.listGlobalEvents();
    }

    /**
     * Refreshes the Object Selects for Events and Global Events
     */
    refreshObjectSelect() {
        let select_obj_buffer = this.prepareSelectObjects();
        $('.select_event_primary').empty().append(select_obj_buffer);
        $('#event_primary').empty().append(select_obj_buffer);
        $('#glevent_primary').empty().append(select_obj_buffer);
        //globalevent

        $('.select_glevent_primary').each(function (index) {
            let id_buffer = parseInt($(this).parents('tr').attr('glevent_id'));
            let event_buffer = getReferenceById(id_buffer);
            $('#glevent_' + id_buffer + ' .select_glevent_primary').val(event_buffer.object.ID);
        });
        //event
        $('.select_event_primary').each(function (index) {
            let id_buffer = parseInt($(this).parents('tr').attr('event_id'));
            let event_buffer = getReferenceById(id_buffer);
            $('#event_' + id_buffer + ' .select_event_primary').val(event_buffer.origin.ID);
        });

        $('.select_event_secondary').empty().append(select_obj_buffer);
        $('#event_secondary').append(select_obj_buffer);
        $('.select_event_secondary').each(function (index) {
            let id_buffer = parseInt($(this).parents('tr').attr('event_id'));
            let event_buffer = getReferenceById(id_buffer);

            $('#event_' + id_buffer + ' .select_event_primary').val(event_buffer.origin.ID);
        });
    }

    /**
     * Lists the Global Events
     */
    listGlobalEvents() {
        //fill the global events
        $('#glevent_table tbody tr').not('#glevent_input_row').remove();
        let glevents_buffer = getReferencesOfType('GlobalEvent');
        let select_obj_buffer = this.prepareSelectObjects();
        $('#glevent_primary').empty().append(select_obj_buffer);
        $('#glevent_type').empty();
        $('.select_glevent_type').empty();
        //get all types from items

        if (glevents_buffer.length > 0) {
            glevents_buffer.forEach(function (element) {
                let event_buffer = getReferenceById(element);
                $('#glevent_table tbody').append('<tr id="glevent_' + element + '" glevent_id = "' + element + '"><td><select class = "select_glevent_primary">' + select_obj_buffer + '</select></td><td><select class = "select_glevent_conobject"><option value="INVENTORY">Inventory</option></select></td><td><select class = "select_glevent_func"><option value="countByType">Count by Type</option></select></td><td><select class = "select_glevent_type"></select></td><td><input class = " input_glevent_count" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_count" style = "width:auto;" value = "' + event_buffer.value + '"></td><td><select class = "select_glevent_action"><option value="WINGAME">Win Game</option></select></td><td><input class = "input_glevent_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="glevent_repeat" style = "width:auto;" value = "' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
                $('#glevent_' + element + ' .select_glevent_primary').val(event_buffer.object.ID);
                $('#glevent_' + element + ' .select_glevent_conobject').val(event_buffer.conditionObject);
                //$('#glevent_' + element + ' .select_glevent_func').val(event_buffer.funcOfConditionObject);
                $('#glevent_' + element + ' .select_glevent_type').val(event_buffer.funcArgs[0]);
                $('#glevent_' + element + ' .input_glevent_count').val(event_buffer.value);
                $('#glevent_' + element + ' .select_glevent_action').val(event_buffer.action);
                $('#glevent_' + element + ' .input_glevent_repeat').val(event_buffer.repeat);
            });
        }

        let items_buffer = getReferencesOfType('AGItem');
        let that = this;
        let append_buffer = "<option item_type = ''><i></i></option>";
        $('#glevent_type').append(append_buffer);
        $('.select_glevent_type').append(append_buffer);
        if (items_buffer.length > 0) {
            items_buffer.forEach(function (element) {
                let type_buffer = getReferenceById(element).type;
                let bool_buffer = false;
                //console.log(type_buffer);
                //check if already there
                $('#glevent_type option').each(function (ele) {
                    if (!bool_buffer) {
                        bool_buffer = $(this).attr('item_type') == type_buffer;
                    }
                });
                if (!bool_buffer) {
                    append_buffer = "<option item_type = " + type_buffer + ">" + type_buffer + "</option>";
                    $('#glevent_type').append(append_buffer);
                    $('.select_glevent_type').append(append_buffer);
                }
            });
        }
        $('.select_glevent_type').each(function (ele) {
            let id_buffer = parseInt($(this).parents('tr').attr('glevent_id'));
            let event_buffer = getReferenceById(id_buffer);
            $(this).val(event_buffer.funcArgs[0]);
        });
    }

    /**
     * Lists the Events
     */
    listEvents() {
        $('#event_table tbody tr').not('#event_input_row').empty();
        let events_buffer = getReferencesOfType('Event');
        let that = this;
        let select_obj_buffer = this.prepareSelectObjects();
        let select_item_buffer = this.prepareSelectItems();

        //fill the generation-inputs
        $('#event_primary').empty().append(select_obj_buffer);
        $('#event_item').empty().append(select_item_buffer);
        $('#event_secondary').empty().append(select_obj_buffer);

        if (events_buffer.length > 0) {
            events_buffer.forEach(function (element) {
                let event_buffer = getReferenceById(element);

                $('#event_table tbody').append('<tr id = "event_' + element + '" event_id = "' + element + '"><td><select class = "select_event_primary">' + select_obj_buffer + '</select></td><td><select class = "select_event_trigger"><option value = "null">None</option><option value = "ONDEATH">ONDEATH</option><option value = "ONCONTACT">ONCONTACT</option><option value = "ONSIGHT">ONSIGHT</option></select></td><td><select class = "select_event_action"><option value = "null">None</option><option value = "ADD">ADD</option><option value = "REMOVE">REMOVE</option><option value = "MOVE">MOVE</option><option value = "ACTIVATE">ACTIVATE</option><option value = "DEACTIVATE">DEACTIVATE</option><option value = "WINGAME">WINGAME</option></select></td><td><select class = "select_event_item">' + select_item_buffer + '</select></td><td><select class = "select_event_secondary">' + select_obj_buffer + '</select></td><td><input class = "input_events_repeat" placeholder="1" maxlength="10" type="number" step="1" min="1" name="events_repeat" value="' + event_buffer.repeat + '"></td><td><button type="button" class="btn btn_delete_row"><i class="fas fa-trash-alt"></i></button></td></tr>');
                $('#event_' + element + ' .select_event_primary').val(event_buffer.origin.ID);
                $('#event_' + element + ' .select_event_trigger').val(event_buffer.trigger);
                $('#event_' + element + ' .select_event_action').val(event_buffer.action);
                $('#event_' + element + ' .select_event_item').val(event_buffer.addObject.ID);
                $('#event_' + element + ' .select_event_secondary').val(event_buffer.object.ID);

            });
        }
    }

    /**
     * Deletes an Event by ID
     * @param The Event ID
     */
    deleteEvent(_event_id) {
        //console.log(getReferenceById(getReferencesOfType("AGEventHandler")[0]))
        getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeEventByID(parseInt(_event_id));
    }

    /**
     * Deletes a Global Event by ID
     * @param The Global Event ID
     */
    deleteGlobalEvent(_event_id) {
        getReferenceById(getReferencesOfType("AGEventHandler")[0]).removeGlobalEventByID(parseInt(_event_id));
    }

    /**
     * Prepares the content of the Dropdown for the Items (by Name)
     * @returns The String with the Dropdown-Options
     */
    prepareSelectItems() {
        let that = this;
        let items_buffer = getReferencesOfType('AGItem');
        let select_item_buffer = '';
        if (items_buffer.length > 0) {
            items_buffer.forEach(function (element) {
                select_item_buffer = select_item_buffer + '<option value = "' + getReferenceById(element).ID + '">' + getReferenceById(element).name + '</option>';
            });
        }
        return select_item_buffer;
    }

    /**
     * Prepares the content of the Dropdown for the Objects
     * @returns The String with the Dropdown-Options
     */
    prepareSelectObjects() {
        let that = this;
        let select_obj_buffer = '';
        //prepare the select for the objects
        let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
        this._AGroomID = rooms_buffer[0].ID;
        if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
            getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
                select_obj_buffer = select_obj_buffer + '<option value = "' + element.ID + '">' + element.name + '</option>';
            });
        }
        return select_obj_buffer;
    }


    /**
     * Removes a fabric-object from the canvas (in case of enemy deletes the path/in case of portal deletes the link)
     * @param The fabric-object
     */
    deleteObject(_fabobject) {
        let room_buffer = this._room_canvas;
        //console.log("hallo");
        getReferenceById(_fabobject.AGObjectID).kill();

        //check if removed element was linked to portal or has path points and remove that stuff
        //TODO wait for portal remove function in AGPortal

        if (_fabobject.type == 'enemy') {
            _fabobject.PathArray.forEach(function (ele) {
                room_buffer.remove(ele);
            });
            _fabobject.LineArray.forEach(function (ele) {
                room_buffer.remove(ele);
            });
        }

        if (_fabobject.type == 'portal') {
            //_fabobject.secDoor
            let fab_buffer = this.getFabricObject(_fabobject.secDoor);
            if (fab_buffer) {
                fab_buffer.secDoor = false;
                fab_buffer.set("fill", this._colors[4][this._vision_mode]);
            }
            if (_fabobject.line) {
                this._room_canvas.remove(this.getFabricObject(_fabobject.secDoor).line.dot);
                this._room_canvas.remove(this.getFabricObject(_fabobject.secDoor).line);
                this.getFabricObject(_fabobject.secDoor).line = false;
                this._room_canvas.remove(_fabobject.line.dot);
                this._room_canvas.remove(_fabobject.line);
                _fabobject.line.line = false;
            }
        }
        this._room_canvas.remove(_fabobject);
        this._room_canvas.renderAll();
        this.listEvents();
        this.listConditions();
        this.listItems();
        this.listGlobalEvents();
    }

    /**
     * Calls renderAGObject for all AGObjects of a n AGRoom
     */
    renderScene() {
        //console.log(getReferenceById(g_gamearea.ID));
        let rooms_buffer = getReferenceById(g_gamearea.ID).AGRooms;
        this._AGroomID = rooms_buffer[0].ID;

        //prefill the inputs with Room name and Dimensions
        $('#input_room_name').val(getReferenceById(this._AGroomID).name);
        $('#tb_canvas_dim_width').val(getReferenceById(this._AGroomID).size.x);
        $('#tb_canvas_dim_height').val(getReferenceById(this._AGroomID).size.z);

        this.renderAGRoom(this._AGroomID);

        let that = this;
        if (getReferenceById(this._AGroomID).AGobjects.length > 0) {
            getReferenceById(this._AGroomID).AGobjects.forEach(function (element) {
                that.renderAGObject(element.ID);
            });
        }
        this.listItems();
        this.listEvents();
        this.listConditions();
        this.listGlobalEvents();
    }

    /**
     * Adds a soundsource to an AGobject
     * @param The ID of the AGOBject
     * @param The name of the soundsource
     */
    addSoundSource(ag_object_id, ss_name, state_) {
        let ag_object_buffer = getReferenceById(ag_object_id);
        let roomID_buffer = getReferenceById(g_gamearea.ID).AGRooms[0].ID;
        let ss_buffer;
        let loop = false;

        if (state_ == 'on_death') {
            loop = false;
            ag_object_buffer.clearDeathSound();
        } else if (state_ == 'on_action') {
            loop = false;
            ag_object_buffer.clearInteractionSound();
        } else if (state_ == 'on_alive') {
            ag_object_buffer.clearAliveSound();
        }

        switch (ss_name) {
            case 'steps':
                ss_buffer = new AGSoundSource("Steps", "sounds/steps.wav", loop, 1, roomID_buffer);

                ss_buffer.tag = "STEPS";
                break;
            case 'waterfall':
                ss_buffer = new AGSoundSource("Waterfall", "sounds/waterfall.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "WATERFALL";
                break;
            case 'magic':
                ss_buffer = new AGSoundSource("Magic", "sounds/magic.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "MAGIC";
                break;
            case 'ouch':
                ss_buffer = new AGSoundSource("Ouch", "sounds/ouch.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "OUCH";
                break;
            case 'car':
                ss_buffer = new AGSoundSource("Car", "sounds/car.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "CAR";
                break;
            case 'monster':
                ss_buffer = new AGSoundSource("Monster", "sounds/monster.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "MONSTER";
                break;
            case 'truck':
                ss_buffer = new AGSoundSource("Truck", "sounds/truck.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "TRUCK";
                break;
            case 'motorcycle':
                ss_buffer = new AGSoundSource("Motorcycle", "sounds/motorcycle.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "MOTORCYCLE";

                break;
            case 'fainting':
                ss_buffer = new AGSoundSource("Fainting", "sounds/monsterpain.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "FAINTING";
                break;
            case 'arrow':
                ss_buffer = new AGSoundSource("Arrow", "sounds/arrow.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "ARROW";
                break;
            case 'bats':
                ss_buffer = new AGSoundSource("Bats", "sounds/bats.wav", loop, 1, roomID_buffer);
                ss_buffer.tag = "BATS";
                break;
            case 'none':
                //
                break;
        }

        ss_buffer.playOnceAtPosition(g_gamearea.listener.position);
        ss_buffer.looping = true;

        if (ss_name != 'none') {
            if (state_ == 'on_death') {
                ag_object_buffer.deathSound = getIdByReference(ss_buffer);
            } else if (state_ == 'on_action') {
                ag_object_buffer.interactionSound = getIdByReference(ss_buffer);
            } else if (state_ == 'on_alive') {
                ag_object_buffer.aliveSound = getIdByReference(ss_buffer);
            }
        }
    }

    /**
     * Draws a small dot for debugging
     * @param The x-position of the Dot
     * @param The y-position of the Dot
     */
    drawDot(x_, y_) {
        let dot = new fabric.Circle({
            left: x_ * this._scale - 1,
            top: y_ * this._scale - 1,
            radius: 2,
            fill: '#f51a1a',
            type: 'debug',
            selectable: false,
        });
        this._room_canvas.add(dot);
        this._room_canvas.renderAll();
    }

    /**
     * Deletes all debugging dots
     */
    deleteDots() {
        let room_buffer = this._room_canvas;
        let canvas_objects = room_buffer.getObjects();
        canvas_objects.forEach(function (item, i) {
            if (item.type == 'debug') {
                room_buffer.remove(item);
            }
        });
        room_buffer.renderAll();
    }

    /**
     * Returns the fabric-object linked to an AGObject-ID
     * @param The ID of the AGOBject
     * @return The fabric-object
     */
    getFabricObject(ag_objectID) {
        let canvas_objects = this._room_canvas.getObjects();
        let fab_buffer;
        canvas_objects.forEach(function (item, i) {
            if (item.isObject && item.AGObjectID == ag_objectID) {
                fab_buffer = item;
            }
        });
        return fab_buffer;
    }

    /**
     * Toggles the visual representation of the editor for higher contrasts
     */
    toggleVisionMode() {
        this._vision_mode = +!this._vision_mode;
        this._room_canvas.backgroundColor = this._colors[0][this._vision_mode];
        this._room_canvas.getObjects().forEach(object => {
            switch (object.type) {
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
                case 'exit':
                    object.set("fill", this._colors[4][this._vision_mode]);
                    break;
                case 'path_dot':

                    object.set("fill", this._colors[6][this._vision_mode]);
                    break;
                case 'path_line':
                    object.set("fill", this._colors[7][this._vision_mode]);
                    object.set("stroke", this._colors[7][this._vision_mode]);
                    break;
                default:
                    object.set("fill", this._colors[8][this._vision_mode]);
            }
        });
        this._room_canvas.renderAll();
        //toggle contrast class for css
        $(".item_event_tab_active,.item_event_tab,h1,h2,h3,h4,h5,h6,body,#sb_object_enemy,.sb_object_structure,#sb_object_generic,.btn,#canvas_container,label,.gegner_speed_active,.ss_active,#btn_help,#overlay_text_box").toggleClass("contrast");


    }

    /**
     * Zooms the scenes in or out
     * @param the zoom factor
     */
    zoomCanvas(zoom_factor) {
        //min : 0.5
        //max : 1.5

        let room_buffer = this._room_canvas;
        room_buffer.setZoom(room_buffer.getZoom() * zoom_factor);
        //set stroke-width to 1 again
        let canvas_objects = room_buffer.getObjects();
        canvas_objects.forEach(function (item, i) {
            if (item.type == 'grid_line') {
                item.strokeWidth = (1 / room_buffer.getZoom()) * 1;
            }
        });

        //console.log(room_buffer.width*room_buffer.getZoom());
        let width_buffer = room_buffer.width * room_buffer.getZoom();
        let height_buffer = room_buffer.height * room_buffer.getZoom();
        let middle_width_buffer = $('#ui_part_middle').width();

        if (width_buffer < middle_width_buffer) {
            $('#canvas_container').width(room_buffer.width * room_buffer.getZoom());
            $('#canvas_container').addClass('canvas_no_overflow_x');
        } else {
            $('#canvas_container').removeClass('canvas_no_overflow_x');
        }

        if (height_buffer < 600) {
            $('#canvas_container').addClass('canvas_no_overflow_y');
            $('#canvas_container').height(room_buffer.height * room_buffer.getZoom());
            $('#canvas_container').height(room_buffer.height * room_buffer.getZoom());
        } else {
            $('#canvas_container').height(600);
            $('#canvas_container').removeClass('canvas_no_overflow_y');
        }
        room_buffer.renderAll();
    }

    /**
     * Disables key scrolling
     */
    disableKeyScrolling() {
        window.addEventListener("keydown", function (e) {
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
    }

    /**
     * Enables key scrolling
     */
    enableKeyScrolling() {
        //window.removeEventListener("keydown");
    }

    /**
     * save Level from Clipboard
     */
    saveLevelSALO() {
        g_history.saveLevelToClipboard();
    }

    /**
     * load Level from Clipboard
     */
    loadLevelSALO() {
        g_references.clear();
        g_history.loadLevelFromClipboard().then(function () {
            this.deleteItemsEventsEtc();
            let that = this;
            this._room_canvas.clear();
            that.renderScene();
        }).catch(() => {
            alert("Something went wrong while loading your Level Code. Please check your Level Code and try again!");
        });
    }

    /**
     * gets called by the UI in case of loading a level in Firefox
     * @param the level code to load
     */
    loadFFLevel(_ff_lvl_code) {
        try {
            g_references.clear();
            g_history.rebuild(_ff_lvl_code);
            this.renderScene();
        } catch (err) {
            alert("Something went wrong while loading your Level Code. - Please check your Level Code and try again!");
        }

    }

    /**
     * Loads a level
     * @param the level ID
     */
    loadLevel(lvl_) {
        let that = this;
        //restore default view
        $('#ui_part_right_inner').hide();
        $('#input_room_name').val(getReferenceById(that._AGroomID).name);
        $('#tb_canvas_dim_width').val(getReferenceById(that._AGroomID).size.x);
        $('#tb_canvas_dim_height').val(getReferenceById(that._AGroomID).size.z);
        $('.ui_box_special').hide();
        $('.ui_box_general').hide();
        $('.ui_box_room').show();
        $('#ui_part_right_inner').show();
        $('#fabric_objects_container').empty();

        play(getReferenceById(g_gamearea.ID), false);
        this._room_canvas.clear();
        g_references.clear();
        rebuildHandlerGameArea();
        //stop level clear everything

        switch (lvl_) {
            case 1:
                var controls = new AGNavigation(-1, -1, 37, 39, 67);
                var controlsID = getIdByReference(controls);
                that._controlsID = controlsID;
                setControl(getReferenceById(controlsID));

                var room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
                var room_1ID = getIdByReference(room_1);
                g_gamearea.addRoom(room_1ID);

                var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

                var wall1 = new AGObject("Wand unten", new Vector3(14, 1.0, 6.7), new Vector3(1, 0, 0), new Vector3(12, 1, 0.5));
                var wall2 = new AGObject("Wand links", new Vector3(4.5, 1.0, 6.4), new Vector3(1, 0, 0), new Vector3(0.5, 1, 5));
                var wall3 = new AGObject("Wand oben", new Vector3(10.66, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(12.8, 1, 0.5));
                var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var enemy1 = new AGObject("Gegner 1", new Vector3(6.3, 1.0, 2.4), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var enemy2 = new AGObject("Gegner 2", new Vector3(12.9, 1.0, 0.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var enemy3 = new AGObject("Gegner 3", new Vector3(12.3, 1.0, 4.6), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var enemy4 = new AGObject("Gegner 4", new Vector3(12.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var enemy1_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
                var enemy2_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
                var enemy3_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
                var enemy4_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);

                var arrow = new AGSoundSource("Pfeil", "sounds/arrow.wav", false, 1, room_1ID);
                var monsterDeath_enemy1 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
                var monsterDeath_enemy2 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
                var monsterDeath_enemy3 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);
                var monsterDeath_enemy4 = new AGSoundSource("Todesgeraeusch", "sounds/monsterpain.wav", false, 1, room_1ID);

                var steps = new AGSoundSource("Schritte", "sounds/steps.wav", true, 1, room_1ID);

                var environmental1 = new AGObject("Wasserfall", new Vector3(19.3, 1.0, 2.1), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var environmental1SS = new AGSoundSource("Wasserfall Sound", "sounds/waterfall.wav", true, 1, room_1ID);

                var environmental2 = new AGObject("Fledermaus", new Vector3(7.9, 1.0, 8.8), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var environmental2SS = new AGSoundSource("Fledermaus Sound", "sounds/bats.wav", true, 1, room_1ID);

                var wall1_ID = wall1.ID;
                var wall2_ID = wall2.ID;
                var wall3_ID = wall3.ID;
                var waterfall1_ID = waterfall_1.ID;
                var waterfall2_ID = waterfall_2.ID;
                var enemy1_ID = enemy1.ID;
                var enemy2_ID = enemy2.ID;
                var enemy3_ID = enemy3.ID;
                var enemy4_ID = enemy4.ID;

                var enemy1_ss_ID = enemy1_ss.ID;
                var enemy2_ss_ID = enemy2_ss.ID;
                var enemy3_ss_ID = enemy3_ss.ID;
                var enemy4_ss_ID = enemy4_ss.ID;

                var monsterDeathEnemy1SS_ID = monsterDeath_enemy1.ID;
                var monsterDeathEnemy2SS_ID = monsterDeath_enemy2.ID;
                var monsterDeathEnemy3SS_ID = monsterDeath_enemy3.ID;
                var monsterDeathEnemy4SS_ID = monsterDeath_enemy4.ID;

                var stepsID = steps.ID;

                var arrow_ID = arrow.ID;

                var environmental1_ID = environmental1.ID;
                var environmental1SS_ID = environmental1SS.ID;
                var environmental2_ID = environmental2.ID;
                var environmental2SS_ID = environmental2SS.ID;

                var ouchID = getIdByReference(ouch);
                var playerID = getIdByReference(player);

                g_gamearea.listener = playerID;
                getReferenceById(room_1ID).listener = playerID;

                //Add ObjectsToRoom
                getReferenceById(room_1ID).add(playerID);
                getReferenceById(room_1ID).add(wall1_ID);
                getReferenceById(room_1ID).add(wall2_ID);
                getReferenceById(room_1ID).add(wall3_ID);

                getReferenceById(room_1ID).add(enemy1_ID);
                getReferenceById(room_1ID).add(enemy2_ID);
                getReferenceById(room_1ID).add(enemy3_ID);
                getReferenceById(room_1ID).add(enemy4_ID);

                getReferenceById(room_1ID).add(environmental1_ID);
                getReferenceById(room_1ID).add(environmental2_ID);

                getReferenceById(wall1_ID).tag = "WALL";
                getReferenceById(wall2_ID).tag = "WALL";
                getReferenceById(wall3_ID).tag = "WALL";

                getReferenceById(environmental1_ID).tag = "WATERFALL";
                getReferenceById(environmental2_ID).tag = "FLEDERMAUS";

                getReferenceById(enemy1_ID).tag = "ENEMY";
                getReferenceById(enemy2_ID).tag = "ENEMY";
                getReferenceById(enemy3_ID).tag = "ENEMY";
                getReferenceById(enemy4_ID).tag = "ENEMY";

                getReferenceById(monsterDeathEnemy1SS_ID).tag = 'FAINTING';
                getReferenceById(monsterDeathEnemy2SS_ID).tag = 'FAINTING';
                getReferenceById(monsterDeathEnemy3SS_ID).tag = 'FAINTING';
                getReferenceById(monsterDeathEnemy4SS_ID).tag = 'FAINTING';

                getReferenceById(stepsID).tag = 'STEPS';
                getReferenceById(arrow_ID).tag = 'FAINTING';

                //getReferenceById(playerID).tag = "ENEMY";

                //Player Settings
                getReferenceById(playerID).setSpeedSkalar(2);
                getReferenceById(playerID).hitSound = ouchID;
                getReferenceById(playerID).movable = true;

                getReferenceById(playerID).dangerous = true;
                getReferenceById(playerID).damage = 1;
                getReferenceById(playerID).range = 7;

                //getReferenceById(playerID).addSoundSource(stepsID);
                getReferenceById(playerID).interactionSound = arrow_ID;
                getReferenceById(playerID).interactionCooldown = 500;

                //getReferenceById(playerID).movementSound = stepsID;


                getReferenceById(playerID).addRoute(new Vector3(2.16, 1, 6.07), new Vector3(2.22, 1, 1.28), new Vector3(6.33, 1, 0.73), new Vector3(12.89, 1, 2.82), new Vector3(17.67, 1, 0.84), new Vector3(18.38, 1, 4.8), new Vector3(13.02, 1, 5.93), new Vector3(7.29, 1, 5.15), new Vector3(5.87, 1, 6.78), new Vector3(8.89, 1, 8.53), new Vector3(12.42, 1, 7.42), new Vector3(18.8, 1, 8.49), new Vector3(18.84, 1, 10.02), new Vector3(1.96, 1, 9.95));

                //Enemy Settings
                getReferenceById(enemy1_ID).destructible = true;
                getReferenceById(enemy1_ID).health = 1;
                getReferenceById(enemy1_ID).movable = false;
                getReferenceById(enemy1_ID).collidable = true;
                getReferenceById(enemy1_ID).setAliveSound = enemy1_ss_ID;
                getReferenceById(enemy1_ID).deathSound = monsterDeathEnemy1SS_ID;

                //Enemy Settings
                getReferenceById(enemy2_ID).destructible = true;
                getReferenceById(enemy2_ID).health = 1;
                getReferenceById(enemy2_ID).movable = false;
                getReferenceById(enemy2_ID).collidable = true;
                getReferenceById(enemy2_ID).setAliveSound = enemy2_ss_ID;
                getReferenceById(enemy2_ID).deathSound = monsterDeathEnemy2SS_ID;

                //Enemy Settings
                getReferenceById(enemy3_ID).destructible = true;
                getReferenceById(enemy3_ID).health = 1;
                getReferenceById(enemy3_ID).movable = false;
                getReferenceById(enemy3_ID).collidable = true;
                getReferenceById(enemy3_ID).setAliveSound = enemy3_ss_ID;
                getReferenceById(enemy3_ID).deathSound = monsterDeathEnemy3SS_ID;

                //Enemy Settings
                getReferenceById(enemy4_ID).destructible = true;
                getReferenceById(enemy4_ID).health = 1;
                getReferenceById(enemy4_ID).movable = false;
                getReferenceById(enemy4_ID).collidable = true;
                getReferenceById(enemy4_ID).setAliveSound = enemy4_ss_ID;
                getReferenceById(enemy4_ID).deathSound = monsterDeathEnemy4SS_ID;

                //Environmental Settings
                getReferenceById(environmental1_ID).addSoundSource(environmental1SS_ID);
                getReferenceById(environmental1_ID).collidable = false;

                getReferenceById(environmental2SS_ID).maxDistance = 4;
                getReferenceById(environmental2_ID).addSoundSource(environmental2SS_ID);
                getReferenceById(environmental2_ID).collidable = false;

                //Coins
                let coin_1 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
                let coin_2 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
                let coin_3 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);
                let coin_4 = new AGItem("Muenze", "Eine goldene, glitzernde Muenze", "coin", 1);

                let coin1_ID = coin_1.ID;
                let coin2_ID = coin_2.ID;
                let coin3_ID = coin_3.ID;
                let coin4_ID = coin_4.ID;

                //Events
                let eventEnemy1 = new Event(enemy1_ID, "ONDEATH", "MOVE", playerID, coin1_ID, 1);
                let eventEnemy2 = new Event(enemy2_ID, "ONDEATH", "MOVE", playerID, coin2_ID, 1);
                let eventEnemy3 = new Event(enemy3_ID, "ONDEATH", "MOVE", playerID, coin3_ID, 1);
                let eventEnemy4 = new Event(enemy4_ID, "ONDEATH", "MOVE", playerID, coin4_ID, 1);

                let eventEnemy1_ID = eventEnemy1.ID;
                let eventEnemy2_ID = eventEnemy2.ID;
                let eventEnemy3_ID = eventEnemy3.ID;
                let eventEnemy4_ID = eventEnemy4.ID;

                getReferenceById(enemy1_ID).inventory.addItemById(coin1_ID);
                g_eventHandler.addEvent(eventEnemy1_ID);
                getReferenceById(enemy2_ID).inventory.addItemById(coin2_ID);
                g_eventHandler.addEvent(eventEnemy2_ID);
                getReferenceById(enemy3_ID).inventory.addItemById(coin3_ID);
                g_eventHandler.addEvent(eventEnemy3_ID);
                getReferenceById(enemy4_ID).inventory.addItemById(coin4_ID);
                g_eventHandler.addEvent(eventEnemy4_ID);

                let globalEventFinish = new GlobalEvent(playerID, "INVENTORY", "countByType", ["coin"], 4, "WINGAME", 1);
                g_eventHandler.addGlobalEvent(globalEventFinish.ID);
                getReferenceById(room_1ID).live = true;
                break;

            case 2:
                var controls = new AGNavigation(38, 40, -1, -1, 67);
                var controlsID = getIdByReference(controls);
                that._controlsID = controlsID;
                setControl(getReferenceById(controlsID));
                var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
                var room_1ID = getIdByReference(room_1);
                g_gamearea.addRoom(room_1ID);
                var player = new AGPlayer("Player", new Vector3(1, 1.0, 5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var skeleton_1 = new AGObject("Skeleton", new Vector3(3.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
                var skeleton_2 = new AGObject("Skeleton", new Vector3(11, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
                var skeleton_3 = new AGObject("Skeleton", new Vector3(14.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
                var skeleton_4 = new AGObject("Skeleton", new Vector3(16, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
                var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
                var car_1 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
                var car_2 = new AGSoundSource("Car", "sounds/truck.wav", true, 1, room_1ID);
                var car_3 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
                var car_4 = new AGSoundSource("Car", "sounds/motorcycle.wav", true, 1, room_1ID);
                var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
                var magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
                var playerID = getIdByReference(player);
                var exitID = getIdByReference(exit);
                var skeleton_1ID = getIdByReference(skeleton_1);
                var skeleton_2ID = getIdByReference(skeleton_2);
                var skeleton_3ID = getIdByReference(skeleton_3);
                var skeleton_4ID = getIdByReference(skeleton_4);
                var ouchID = getIdByReference(ouch);
                var car_1ID = getIdByReference(car_1);
                var car_2ID = getIdByReference(car_2);
                var car_3ID = getIdByReference(car_3);
                var car_4ID = getIdByReference(car_4);
                var magic_exit_ID = getIdByReference(magic_exit);
                g_gamearea.listener = getIdByReference(player);
                getReferenceById(room_1ID).listener = getIdByReference(player);

                //Add ObjectsToRoom
                getReferenceById(room_1ID).add(playerID);
                getReferenceById(room_1ID).add(exitID);
                getReferenceById(room_1ID).add(skeleton_1ID);
                getReferenceById(room_1ID).add(skeleton_2ID);
                getReferenceById(room_1ID).add(skeleton_3ID);
                getReferenceById(room_1ID).add(skeleton_4ID);

                //Soundtags
                getReferenceById(car_1ID).tag = "CAR";
                getReferenceById(car_2ID).tag = "CAR";
                getReferenceById(car_3ID).tag = "CAR";
                getReferenceById(car_4ID).tag = "CAR";
                getReferenceById(ouchID).tag = "OUCH";
                getReferenceById(magic_exit_ID).tag = "MAGIC";

                //Car 1
                getReferenceById(skeleton_1ID).setSpeedSkalar(1);
                getReferenceById(skeleton_1ID).movable = true;
                getReferenceById(skeleton_1ID).destructible = true;
                getReferenceById(skeleton_1ID).health = 4;
                getReferenceById(skeleton_1ID).addRoute(new Vector3(3.5, 1, 9), new Vector3(3.5, 1, 1));
                getReferenceById(skeleton_1ID).addSoundSource(car_1ID);
                getReferenceById(skeleton_1ID).tag = "ENEMY";

                //Car 2
                getReferenceById(skeleton_2ID).setSpeedSkalar(3);
                getReferenceById(skeleton_2ID).movable = true;
                getReferenceById(skeleton_2ID).destructible = true;
                getReferenceById(skeleton_2ID).health = 4;
                getReferenceById(skeleton_2ID).addRoute(new Vector3(7, 1, 1), new Vector3(11, 1, 2), new Vector3(7, 1, 3), new Vector3(11, 1, 4),
                    new Vector3(7, 1, 5), new Vector3(11, 1, 6), new Vector3(7, 1, 7), new Vector3(11, 1, 8),
                    new Vector3(7, 1, 9), new Vector3(11, 1, 9),
                    new Vector3(7, 1, 8), new Vector3(11, 1, 7), new Vector3(7, 1, 6), new Vector3(11, 1, 5),
                    new Vector3(7, 1, 4), new Vector3(11, 1, 3), new Vector3(7, 1, 2), new Vector3(11, 1, 1),
                );
                getReferenceById(skeleton_2ID).addSoundSource(car_2ID);
                getReferenceById(skeleton_2ID).tag = "ENEMY";

                //Car 3
                getReferenceById(skeleton_3ID).setSpeedSkalar(1);
                getReferenceById(skeleton_3ID).movable = true;
                getReferenceById(skeleton_3ID).destructible = true;
                getReferenceById(skeleton_3ID).health = 4;
                getReferenceById(skeleton_3ID).addRoute(new Vector3(14.5, 1, 9), new Vector3(14.5, 1, 1));

                getReferenceById(skeleton_3ID).addSoundSource(car_3ID);
                getReferenceById(skeleton_3ID).tag = "ENEMY";

                //Car 4
                getReferenceById(skeleton_4ID).setSpeedSkalar(2);
                getReferenceById(skeleton_4ID).movable = true;
                getReferenceById(skeleton_4ID).destructible = true;
                getReferenceById(skeleton_4ID).health = 4;
                getReferenceById(skeleton_4ID).addRoute(new Vector3(16, 1, 9), new Vector3(16, 1, 1));

                getReferenceById(skeleton_4ID).addSoundSource(car_4ID);
                getReferenceById(skeleton_4ID).tag = "ENEMY";

                //Player Settings
                getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
                getReferenceById(playerID).hitSound = ouchID;

                getReferenceById(playerID).dangerous = true;
                getReferenceById(playerID).damage = 1;
                getReferenceById(playerID).range = 2;

                //Exit Sound
                getReferenceById(exitID).addSoundSource(magic_exit_ID);
                getReferenceById(room_1ID).live = true;
                break;

            case 3:
                var controls = new AGNavigation(38, 40, 37, 39, 67);
                var controlsID = getIdByReference(controls);
                that._controlsID = controlsID;
                setControl(getReferenceById(controlsID));
                var room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
                var room_1ID = getIdByReference(room_1);
                g_gamearea.addRoom(room_1ID);
                var player = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var exit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var wallWestSmallRoom = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
                var wallNorthSmallRoom = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(5, 1, 1));
                var portalSmallRoom = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var wallSouthCorridor = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1, 0, 0), new Vector3(19, 1, 1));
                var wallLeftCorridor = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
                var wallRightCorridor = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
                var portalCorridorRoomFromSmallRoom = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var skeleton = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
                var portalCorridorToFinal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var portalFinalFromCorridor = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var wallFirstFinalRoom = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
                var wallSecondFinalRoom = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.6), new Vector3(1, 0, 0), new Vector3(1, 1, 3.34));
                var waterFall_1 = new AGObject("Waterfall1", new Vector3(8.7, 1, 0.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var waterFall_2 = new AGObject("Waterfall2", new Vector3(4.5, 1, 4.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var waterFall_3 = new AGObject("Waterfall3", new Vector3(8, 1, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var waterFall_4 = new AGObject("Waterfall4", new Vector3(11, 1, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
                var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
                var magic_1 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
                var magic_2 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
                var magic_3 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
                var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var waterfall_3 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var waterfall_4 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var playerID = getIdByReference(player);
                var exitID = getIdByReference(exit);
                var wallWestSmallRoomID = getIdByReference(wallWestSmallRoom);
                var wallNorthSmallRoomID = getIdByReference(wallNorthSmallRoom);
                var portalSmallRoomID = getIdByReference(portalSmallRoom);
                var wallSouthCorridorID = getIdByReference(wallSouthCorridor);
                var wallLeftCorridorID = getIdByReference(wallLeftCorridor);
                var wallRightCorridorID = getIdByReference(wallRightCorridor);
                var portalCorridorRoomFromSmallRoomID = getIdByReference(portalCorridorRoomFromSmallRoom);
                var skeletonID = getIdByReference(skeleton);
                var portalCorridorToFinalID = getIdByReference(portalCorridorToFinal);
                var portalFinalFromCorridorID = getIdByReference(portalFinalFromCorridor);
                var wallFirstFinalRoomID = getIdByReference(wallFirstFinalRoom);
                var wallSecondFinalRoomID = getIdByReference(wallSecondFinalRoom);
                var stepsID = getIdByReference(steps);
                var ouchID = getIdByReference(ouch);
                var magic_1ID = getIdByReference(magic_1);
                var magic_2ID = getIdByReference(magic_2);
                var magic_3ID = getIdByReference(magic_3);
                var waterfall_1ID = getIdByReference(waterfall_1);
                var waterfall_2ID = getIdByReference(waterfall_2);
                var waterfall_3ID = getIdByReference(waterfall_3);
                var waterfall_4ID = getIdByReference(waterfall_4);
                var waterFall_1ID = getIdByReference(waterFall_1);
                var waterFall_2ID = getIdByReference(waterFall_2);
                var waterFall_3ID = getIdByReference(waterFall_3);
                var waterFall_4ID = getIdByReference(waterFall_4);
                g_gamearea.listener = getIdByReference(player);
                getReferenceById(room_1ID).listener = getIdByReference(player);

                //Add ObjectsToRoom
                getReferenceById(room_1ID).add(playerID);
                getReferenceById(room_1ID).add(exitID);
                getReferenceById(room_1ID).add(wallWestSmallRoomID);
                getReferenceById(room_1ID).add(wallNorthSmallRoomID);
                getReferenceById(room_1ID).add(portalSmallRoomID);
                getReferenceById(room_1ID).add(wallSouthCorridorID);
                getReferenceById(room_1ID).add(wallLeftCorridorID);
                getReferenceById(room_1ID).add(wallRightCorridorID);
                getReferenceById(room_1ID).add(portalCorridorRoomFromSmallRoomID);
                getReferenceById(room_1ID).add(skeletonID);
                getReferenceById(room_1ID).add(portalCorridorToFinalID);
                getReferenceById(room_1ID).add(portalFinalFromCorridorID);
                getReferenceById(room_1ID).add(wallFirstFinalRoomID);
                getReferenceById(room_1ID).add(wallSecondFinalRoomID);
                getReferenceById(room_1ID).add(waterFall_1ID);
                getReferenceById(room_1ID).add(waterFall_2ID);
                getReferenceById(room_1ID).add(waterFall_3ID);
                getReferenceById(room_1ID).add(waterFall_4ID);
                getReferenceById(wallWestSmallRoomID).tag = "WALL";
                getReferenceById(wallNorthSmallRoomID).tag = "WALL";
                getReferenceById(wallSouthCorridorID).tag = "WALL";
                getReferenceById(wallLeftCorridorID).tag = "WALL";
                getReferenceById(wallRightCorridorID).tag = "WALL";
                getReferenceById(wallFirstFinalRoomID).tag = "WALL";
                getReferenceById(wallSecondFinalRoomID).tag = "WALL";
                getReferenceById(waterFall_1ID).tag = "BLA";
                getReferenceById(waterFall_2ID).tag = "BLA";
                getReferenceById(waterFall_3ID).tag = "BLA";
                getReferenceById(waterFall_4ID).tag = "BLA";

                //Soundtags
                getReferenceById(stepsID).tag = "STEPS";
                getReferenceById(ouchID).tag = "OUCH";
                getReferenceById(magic_1ID).tag = "MAGIC";
                getReferenceById(magic_2ID).tag = "MAGIC";
                getReferenceById(magic_3ID).tag = "MAGIC";
                getReferenceById(waterfall_1ID).tag = "WATERFALL";
                getReferenceById(waterfall_2ID).tag = "WATERFALL";
                getReferenceById(waterfall_3ID).tag = "WATERFALL";
                getReferenceById(waterfall_4ID).tag = "WATERFALL";

                //Skeleton
                getReferenceById(skeletonID).setSpeedSkalar(1);
                getReferenceById(skeletonID).movable = true;
                getReferenceById(skeletonID).destructible = true;
                getReferenceById(skeletonID).health = 4;
                getReferenceById(skeletonID).addRoute(new Vector3(12, 1, 0.5), new Vector3(12, 1, 2.5));

                getReferenceById(skeletonID).addSoundSource(stepsID);
                getReferenceById(skeletonID).tag = "ENEMY";

                //Link Portals
                getReferenceById(portalSmallRoomID).linkPortals(portalCorridorRoomFromSmallRoomID);
                getReferenceById(portalCorridorToFinalID).linkPortals(portalFinalFromCorridorID);

                //Player Settings
                getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
                getReferenceById(playerID).hitSound = ouchID;

                getReferenceById(playerID).dangerous = true;
                getReferenceById(playerID).damage = 1;
                getReferenceById(playerID).range = 2;

                //Portal Sounds
                getReferenceById(portalSmallRoomID).addSoundSource(magic_1ID);
                getReferenceById(portalCorridorToFinalID).addSoundSource(magic_2ID);

                //Exit Sound
                getReferenceById(exitID).addSoundSource(magic_3ID);

                //Waterfall
                getReferenceById(waterFall_1ID).collidable = false;
                getReferenceById(waterFall_2ID).collidable = false;
                getReferenceById(waterFall_3ID).collidable = false;
                getReferenceById(waterFall_4ID).collidable = false;
                getReferenceById(waterFall_1ID).addSoundSource(waterfall_1ID);
                getReferenceById(waterFall_2ID).addSoundSource(waterfall_2ID);
                getReferenceById(waterFall_3ID).addSoundSource(waterfall_3ID);
                getReferenceById(waterFall_4ID).addSoundSource(waterfall_4ID);
                getReferenceById(room_1ID).live = true;
                break;

            case 4:
                var controls = new AGNavigation(38, 40, 37, 39, 67);
                var controlsID = getIdByReference(controls);
                that._controlsID = controlsID;
                setControl(getReferenceById(controlsID));

                var room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
                var room_1ID = getIdByReference(room_1);
                g_gamearea.addRoom(room_1ID);

                var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
                var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);

                var wall1 = new AGObject("Wand oben 1", new Vector3(6.3, 1.0, 0.6), new Vector3(1, 0, 0), new Vector3(4.8, 1, 1.3));
                var wall2 = new AGObject("Wand oben 2", new Vector3(8.2, 1.0, 2.5), new Vector3(1, 0, 0), new Vector3(1, 1, 2.6));
                var wall3 = new AGPortal("Wand oben 3", new Vector3(12.8, 1.0, 0.3), new Vector3(1, 0, 0), new Vector3(8.2, 1, 0.5));
                var wall4 = new AGObject("Wand seitlich rechts", new Vector3(16.4, 1.0, 3.6), new Vector3(1, 0, 0), new Vector3(1, 1, 6.2));
                var wall5 = new AGObject("Wand unten 3", new Vector3(14.4, 1.0, 6.4), new Vector3(1, 0, 0), new Vector3(3, 1, 0.5));
                var wall6 = new AGObject("Wand unten 2", new Vector3(12.4, 1.0, 3.7), new Vector3(1, 0, 0), new Vector3(1, 1, 4.1));
                var wall7 = new AGObject("Wand unten 1", new Vector3(8.5, 1.0, 6.2), new Vector3(1, 0, 0), new Vector3(8.9, 1, 1.0));
                var waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
                var fee = new AGObject("Fee", new Vector3(5.0, 1, 3.0), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

                var wall1_ID = wall1.ID;
                var wall2_ID = wall2.ID;
                var wall3_ID = wall3.ID;
                var wall4_ID = wall4.ID;
                var wall5_ID = wall5.ID;
                var wall6_ID = wall6.ID;
                var wall7_ID = wall7.ID;
                var waterfall1_ID = waterfall_1.ID;
                var fee_ID = fee.ID;

                var ouchID = getIdByReference(ouch);
                var playerID = getIdByReference(player);

                g_gamearea.listener = playerID;
                getReferenceById(room_1ID).listener = playerID;

                //Add ObjectsToRoom
                getReferenceById(room_1ID).add(playerID);
                getReferenceById(room_1ID).add(wall1_ID);
                getReferenceById(room_1ID).add(wall2_ID);
                getReferenceById(room_1ID).add(wall3_ID);
                getReferenceById(room_1ID).add(wall4_ID);
                getReferenceById(room_1ID).add(wall5_ID);
                getReferenceById(room_1ID).add(wall6_ID);
                getReferenceById(room_1ID).add(wall7_ID);
                getReferenceById(room_1ID).add(fee_ID);

                getReferenceById(waterfall1_ID).tag = "WATERFALL";
                getReferenceById(wall1_ID).tag = "WALL";
                getReferenceById(wall2_ID).tag = "WALL";
                getReferenceById(wall3_ID).tag = "WALL";
                getReferenceById(wall4_ID).tag = "WALL";
                getReferenceById(wall5_ID).tag = "WALL";
                getReferenceById(wall6_ID).tag = "WALL";
                getReferenceById(wall7_ID).tag = "WALL";
                getReferenceById(fee_ID).tag = "ENEMY";

                //Player Settings
                getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
                getReferenceById(playerID).hitSound = ouchID;

                getReferenceById(playerID).dangerous = true;
                getReferenceById(playerID).damage = 1;
                getReferenceById(playerID).range = 2;

                //Fee
                getReferenceById(fee_ID).setSpeedSkalar(3);
                getReferenceById(fee_ID).movable = true;
                getReferenceById(fee_ID).runaway = true;
                getReferenceById(fee_ID).circle = false;
                getReferenceById(fee_ID).destructible = false;
                getReferenceById(fee_ID).collidable = false;
                getReferenceById(fee_ID).health = 4;
                getReferenceById(fee_ID).addRoute(new Vector3(5, 1, 3), new Vector3(6.7, 1, 4.8), new Vector3(11.42, 1, 4.84), new Vector3(9.33, 1, 2.71), new Vector3(11.17, 1, 0.95), new Vector3(15.4, 1, 0.93), new Vector3(13.55, 1, 3.11), new Vector3(15.27, 1, 4.78), new Vector3(14.38, 1, 5.51));

                getReferenceById(fee_ID).addSoundSource(waterfall1_ID);
                getReferenceById(fee_ID).tag = "ENEMY";

                getReferenceById(room_1ID).live = true;
                break;
        }
        this.renderScene();
    }
}