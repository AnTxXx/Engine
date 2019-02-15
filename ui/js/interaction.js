import {g_gamearea, g_IAudiCom, getOwnerIdOfItemById, getReferenceById, startAGEngine} from "../../lib/audicom.js";
import {Vector3} from "../../lib/js/three/Vector3.js";

jQuery(function ($) {

    // initialize audicom
    startAGEngine();
    console.debug("initialised? ", g_gamearea);

    let interval;
    //the active fabric-object
    let actFabObj = '';

    let key_assign_rec = false;

    /**
     * Prepares the Select-Menu for portals
     */
    function portalSelect() {
        $('.other_portal').remove();
        g_IAudiCom._room_canvas.getObjects().forEach(function (e) {
            if (e.type == "portal") {
                if (g_IAudiCom._room_canvas.getActiveObject().AGObjectID != e.AGObjectID) {
                    $('#portal_dropdown').append('<option class = "other_portal" value="' + e.AGObjectID + '">' + e.name + '</option>');
                }
            }
        });
        $("#portal_dropdown option[value=" + g_IAudiCom._room_canvas.getActiveObject().secDoor + "]").prop('selected', 'selected');
    }

    /**
     * Removes a portal link of active Fabric Object
     */
    function deletePortal() {
        //actFabObj.secDoor.set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
        let sec_door_buffer = g_IAudiCom.getFabricObject(actFabObj.secDoor);

        g_IAudiCom._room_canvas.remove(actFabObj.line.dot);
        g_IAudiCom._room_canvas.remove(sec_door_buffer.line.dot);
        g_IAudiCom._room_canvas.remove(actFabObj.line);
        g_IAudiCom._room_canvas.remove(sec_door_buffer.line);
        actFabObj.line = false;
        sec_door_buffer.line = false;

        sec_door_buffer.set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
        sec_door_buffer.secDoor = false;
        actFabObj.secDoor = false;
        g_IAudiCom._room_canvas.renderAll();

        getReferenceById(actFabObj.AGObjectID).unlink();
        //getReferenceById(actFabObj.AGObjectID).clearRoute();
    }

    /**
     * Prepares UI for active Fabric Object
     */
    function loadObject(type) {
        //all: position, SoSo, Namen, Löschenbutton
        //gegner: Pfad, HP
        //Mauer: Gräße, Form
        //Portale: Verlinkung
        //Spieler: HP, Reichweite, Schaden
        //Raumziel
        $('#ui_part_right_inner').fadeOut(100, function () {
            if (type == 'room') {
                $('#input_room_name').val(getReferenceById(g_IAudiCom._AGroomID).name);
                $('#tb_canvas_dim_width').val(getReferenceById(g_IAudiCom._AGroomID).size.x);
                $('#tb_canvas_dim_height').val(getReferenceById(g_IAudiCom._AGroomID).size.z);
                $('.ui_box_special').hide();
                $('.ui_box_general').hide();
                $('.ui_box_room').show();
            } else {
                $('#input_obj_name').val(actFabObj.name);
                $('#input_obj_width').val(Math.round(actFabObj.width / g_IAudiCom._scale));
                $('#input_obj_height').val(Math.round(actFabObj.height / g_IAudiCom._scale));
                $('#input_obj_pos_x').val(actFabObj.left / g_IAudiCom._scale);
                $('#input_obj_pos_y').val(actFabObj.top / g_IAudiCom._scale);
                $('.ui_box_special').hide();
                $('.ui_box_' + type).show();
                $('.ui_box_general').show();
                $('#id_ span').text(actFabObj.AGObjectID);

                if (type == 'enemy') {
                    $('#btn_speed_' + getReferenceById(actFabObj.AGObjectID).getSpeedSkalar()).addClass('gegner_speed_active');
                    $("#object_speed_dropdown").val(getReferenceById(actFabObj.AGObjectID).getSpeedSkalar());

                    $('#input_enemy_health').val(getReferenceById(actFabObj.AGObjectID).health);
                    if (getReferenceById(actFabObj.AGObjectID).runaway) {
                        $('#cb_runaway').prop('checked', true);
                    } else {
                        $('#cb_runaway').prop('checked', false);
                    }
                    if (getReferenceById(actFabObj.AGObjectID).circle) {
                        $('#cb_circle').prop('checked', true);
                    } else {
                        $('#cb_circle').prop('checked', false);
                    }
                }
                if (type != 'player') {
                    $('#ui_delete_box').show();
                }
                if (type == 'player') {

                    let nav_buffer = getReferenceById(g_IAudiCom._controlsID);
                    loadNavigationForUI($('#btn_key_up'), nav_buffer.forward);
                    loadNavigationForUI($('#btn_key_down'), nav_buffer.backward);
                    loadNavigationForUI($('#btn_key_left'), nav_buffer.left);
                    loadNavigationForUI($('#btn_key_right'), nav_buffer.right);
                    loadNavigationForUI($('#btn_key_interact'), nav_buffer.interact);

                    if (getReferenceById(actFabObj.AGObjectID).movable) {
                        $('.show_on_railed').show();
                        $('.hide_on_railed').hide();
                        $("#rb_ctrl_railed").prop("checked", true);
                    } else {
                        $('.show_on_railed').hide();
                        $('.hide_on_railed').show();
                        $("#rb_ctrl_classic").prop("checked", true);
                    }


                    $('#atk_range_dropdown').val(getReferenceById(actFabObj.AGObjectID).range);

                    let ss_action_buffer = getReferenceById(actFabObj.AGObjectID).interactionSound;
                    if (ss_action_buffer) {
                        //console.log(ss_action_buffer);
                        $("#sound_action_dropdown").val(ss_action_buffer.tag.toLowerCase());
                        $('#slider_action_volume').val(ss_action_buffer.volume);
                        $('#slider_value_action').text(Math.floor(ss_action_buffer.volume * 100));
                    }

                }

                if (getReferenceById(actFabObj.AGObjectID).collidable) {
                    $('#cb_colli').prop('checked', true);
                } else {
                    $('#cb_colli').prop('checked', false);
                }

                //$('.btn_ss').removeClass('ss_active');

                let ss_death_buffer = getReferenceById(actFabObj.AGObjectID).deathSound;
                if (ss_death_buffer) {
                    $("#sound_destruction_dropdown").val(ss_death_buffer.tag.toLowerCase());
                    $('#slider_death_volume').val(ss_death_buffer.volume);
                    $('#slider_value_death').text(Math.floor(ss_death_buffer.volume * 100));
                    $('#slider_box_death').show();
                } else {
                    $("#sound_destruction_dropdown").val('none');
                    $('#slider_box_death').hide();
                }

                let ss_interaction_buffer = getReferenceById(actFabObj.AGObjectID).interactionSound;
                if (ss_interaction_buffer) {
                    $("#sound_action_dropdown").val(ss_interaction_buffer.tag.toLowerCase());
                    $('#slider_action_volume').val(ss_interaction_buffer.volume);
                    $('#slider_value_action').text(Math.floor(ss_interaction_buffer.volume * 100));
                    $('#slider_box_action').show();
                } else {
                    $("#sound_action_dropdown").val('none');
                    $('#slider_box_action').hide();
                }

                let ss_alive_buffer = getReferenceById(actFabObj.AGObjectID).aliveSound;
                if (ss_alive_buffer) {
                    $("#sound_dropdown").val(ss_alive_buffer.tag.toLowerCase());
                    $('#slider_general_volume').val(ss_alive_buffer.volume);

                    $('#slider_value_general').text(Math.floor(ss_alive_buffer.volume * 100));

                    $('#slider_box_general').show();
                } else {
                    $("#sound_dropdown").val('none');
                    $('#slider_box_general').hide();
                }


                // let ss_buffer = getReferenceById(actFabObj.AGObjectID).getSoundSources();
// 				if(ss_buffer.length==0){
// 					$('.btn_ss').removeClass('ss_active');
// 					$('#btn_sound_none').addClass('ss_active');
// 				}else{
// 					for (var i = 0; i < ss_buffer.length; i++) {
// 						if(ss_buffer[i].tag){
// 							$('#btn_sound_' + ss_buffer[i].tag.toLowerCase()).addClass('ss_active');
// 						}
// 					};
// 				}
            }
            setTimeout(function () {
                $('#ui_part_right_inner').fadeIn(100);
            }, 100);
        });
    }

    /**
     * Prepares UI-elements for navigation
     */
    function loadNavigationForUI(jq_obj_, keycode_) {
        switch (keycode_) {
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
    function addPathPoint(left_, top_, on_rec_) {

        if (on_rec_) {
            if (actFabObj.PathArray.length == 0) {
                let first_dot = new fabric.Circle({
                    left: actFabObj.left,
                    top: actFabObj.top,
                    radius: 4,
                    fill: g_IAudiCom._colors[6][g_IAudiCom._vision_mode],
                    objectCaching: false,
                    selectable: false,
                    type: 'path_dot'
                });
                actFabObj.PathArray.unshift(first_dot);
                g_IAudiCom._room_canvas.add(first_dot);
            }
        }
        let dot = new fabric.Circle({
            left: left_ - 4,
            top: top_ - 4,
            radius: 4,
            fill: g_IAudiCom._colors[6][g_IAudiCom._vision_mode],
            objectCaching: false,
            selectable: false,
            type: 'path_dot'
        });

        if (actFabObj.PathArray.length >= 1) {
            let last_dot_buffer = actFabObj.PathArray[actFabObj.PathArray.length - 1];
            let line = new fabric.Line([dot.left + 4, dot.top + 4, last_dot_buffer.left + 4, last_dot_buffer.top + 4], {
                fill: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                stroke: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                strokeWidth: 2,
                selectable: false,
                evented: false,
                type: 'path_line'
            });
            actFabObj.LineArray.push(line);
            g_IAudiCom._room_canvas.add(line);
        }

        actFabObj.PathArray.push(dot);
        g_IAudiCom._room_canvas.setActiveObject(actFabObj);
        g_IAudiCom._room_canvas.add(dot);

        //clear old route and save path to AGObject and set movable true
        getReferenceById(actFabObj.AGObjectID).clearRoute();
        actFabObj.PathArray.forEach(function (ele) {
            getReferenceById(actFabObj.AGObjectID).addRouteNode(new Vector3(ele.left / g_IAudiCom._scale, 1, ele.top / g_IAudiCom._scale));
        });
        getReferenceById(actFabObj.AGObjectID).movable = true;
    }

    /**
     * Get the mouse coordinates within the canvas
     * @param the mouse event
     * @return array with the mouse coordinates (x,y)
     */
    function getMouseCoords(event) {
        var pointer = g_IAudiCom._room_canvas.getPointer(event.e);
        var posX = pointer.x;
        var posY = pointer.y;
        return [posX, posY]
    }

    /**
     * Links a portal to a selected portal, marks the portals and draws a line between them
     * @param: The fabric-object of the portal
     */
    function linkPortalsUI(fabObj_) {
        let obj_buffer = fabObj_;
        if (obj_buffer) {
            if (getReferenceById(obj_buffer.AGObjectID).type == 'PORTAL') {
                //link the portal
                //mark the portal in canvas

                g_IAudiCom._room_canvas.setActiveObject(actFabObj);
                getReferenceById(actFabObj.AGObjectID).linkPortals(obj_buffer.AGObjectID);
                actFabObj.isRecording = false;
                $('#btn_path_linkdoors').find('i').removeClass('btn_path_rec_blink');

                //if there is a door, reset color and remove portal from second door
                if (actFabObj.secDoor) {
                    g_IAudiCom.getFabricObject(actFabObj.secDoor).set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
                    g_IAudiCom.getFabricObject(actFabObj.secDoor).secDoor = false;
                }

                if (actFabObj.line) {
                    g_IAudiCom._room_canvas.remove(g_IAudiCom.getFabricObject(actFabObj.secDoor).line.dot);
                    g_IAudiCom._room_canvas.remove(g_IAudiCom.getFabricObject(actFabObj.secDoor).line);
                    g_IAudiCom.getFabricObject(actFabObj.secDoor).line = false;
                    g_IAudiCom._room_canvas.remove(actFabObj.line.dot);
                    g_IAudiCom._room_canvas.remove(actFabObj.line);
                    actFabObj.line.line = false;

                }

                //obj_buffer.set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
                //link fabric objects
                actFabObj.secDoor = obj_buffer.AGObjectID;
                obj_buffer.secDoor = actFabObj.AGObjectID;

                let dot_1 = new fabric.Circle({
                    left: actFabObj.left - 4,
                    top: actFabObj.top - 4,
                    radius: 4,
                    fill: g_IAudiCom._colors[6][g_IAudiCom._vision_mode],
                    objectCaching: false,
                    selectable: false,
                    type: 'portal_dot'
                });
                let dot_2 = new fabric.Circle({
                    left: obj_buffer.left - 4,
                    top: obj_buffer.top - 4,
                    radius: 4,
                    fill: g_IAudiCom._colors[6][g_IAudiCom._vision_mode],
                    objectCaching: false,
                    selectable: false,
                    type: 'portal_dot'
                });
                //draw line between portals
                let line_1 = new fabric.Line([actFabObj.left, actFabObj.top, obj_buffer.left, obj_buffer.top], {
                    fill: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                    stroke: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                    type: 'portal_line',
                    dot: dot_1,
                });
                let line_2 = new fabric.Line([obj_buffer.left, obj_buffer.top, actFabObj.left, actFabObj.top], {
                    fill: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                    stroke: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                    type: 'portal_line',
                    dot: dot_2,
                    opacity: 0,
                });
                g_IAudiCom._room_canvas.add(dot_1);
                g_IAudiCom._room_canvas.add(dot_2);
                g_IAudiCom._room_canvas.add(line_1);
                g_IAudiCom._room_canvas.add(line_2);
                actFabObj.line = line_1;
                obj_buffer.line = line_2;

                //colorize
                //console.log(g_IAudiCom._colors[5][g_IAudiCom._vision_mode]);
                obj_buffer.set("fill", g_IAudiCom._colors[5][g_IAudiCom._vision_mode]);
                $('#ui_part_left').removeClass('no_click lower_opacity');
                $('.misc_ctrls').removeClass('no_click lower_opacity');
                $('#ui_controls').removeClass('no_click lower_opacity');
                $('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
                g_IAudiCom.room_canvas.renderAll();
            }
        } else {
            g_IAudiCom._room_canvas.setActiveObject(actFabObj);
        }
    }

    /**
     * Adds the position of a fabric-object to the UI-elements for the position
     */
    function outputFabPos() {

        let buff1 = Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position.x * 10) / 10;
        let buff2 = Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position.z * 10) / 10;

        let buff3 = Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).size.x * 10) / 10;
        let buff4 = Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).size.z * 10) / 10;

        $('#coord_x span').text(Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position.x * 10) / 10);
        $('#coord_y span').text(Math.round(getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position.z * 10) / 10);

        $('#input_obj_x').val(buff1);
        $('#input_obj_y').val(buff2);


        $('#input_obj_w').val(buff3);
        $('#input_obj_h').val(buff4);

    }

    /*************************/
    /***Fabric Events***/
    /*************************/
    g_IAudiCom._room_canvas.on('mouse:down', function (e) {
        //add path-point if an enemy is selected and it is recording
        if (actFabObj.type == 'enemy' && actFabObj.isRecording || actFabObj.type == 'player' && actFabObj.isRecording) {
            addPathPoint(getMouseCoords(e)[0], getMouseCoords(e)[1], true);
        } else if (actFabObj.type == 'portal' && actFabObj.isRecording) {
            if (!(g_IAudiCom._room_canvas.getActiveObject() == actFabObj)) {
                linkPortalsUI(g_IAudiCom._room_canvas.getActiveObject());
            }
            ;

            //deselect Object and hide Path-Points
        } else if (!g_IAudiCom._room_canvas.getActiveObject()) {
            //TODO stop recording

            if (actFabObj.PathArray) {
                actFabObj.PathArray.forEach(function (ele) {
                    ele.opacity = 0;
                });
                actFabObj.LineArray.forEach(function (ele) {
                    ele.opacity = 0;
                });
            } else if (actFabObj.secDoor) {
                g_IAudiCom.getFabricObject(actFabObj.secDoor).set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
                if (actFabObj.line) {
                    actFabObj.line.set("opacity", 0);
                    actFabObj.line.dot.set("opacity", 0);
                    g_IAudiCom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 0);
                }
            }
            loadObject('room');
            //TODO check if recording; if yes -> stop recording
        } else {
            g_IAudiCom._room_canvas.setActiveObject(actFabObj);
        }
    });
    g_IAudiCom._room_canvas.on({
        'selection:created': function (e) {
            outputFabPos();
            actFabObj = g_IAudiCom._room_canvas.getActiveObject();

            //ICI
            // if(!(document.activeElement === document.getElementById('fabobject_'+actFabObj.AGObjectID))){
//
// 				$('#fabobject_' + actFabObj.AGObjectID).focus();
// 				console.log((document.activeElement === document.getElementById('fabobject_'+actFabObj.AGObjectID)));
// 			}

            if (actFabObj.type == 'portal' || actFabObj.type == 'enemy' || actFabObj.type == 'player') {
                if (!actFabObj.isRecording) {
                    loadObject(actFabObj.type);
                    if (g_IAudiCom._room_canvas.getActiveObject().PathArray) {
                        actFabObj = g_IAudiCom._room_canvas.getActiveObject();
                        actFabObj.PathArray.forEach(function (ele) {
                            ele.opacity = 1;
                        });
                        actFabObj.LineArray.forEach(function (ele) {

                            ele.opacity = 1;
                        });
                    } else if (actFabObj.secDoor) {
                        portalSelect();
                        g_IAudiCom.getFabricObject(actFabObj.secDoor).set("fill", g_IAudiCom._colors[5][g_IAudiCom._vision_mode]);
                        if (actFabObj.line) {
                            actFabObj.line.set("opacity", 1);
                            actFabObj.line.dot.set("opacity", 1);
                            g_IAudiCom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 1);
                        }
                    } else if (actFabObj.type = 'portal') {
                        portalSelect();
                    }
                }
            } else {
                loadObject(actFabObj.type);
            }
        },
        'selection:updated': function (e) {

            portalSelect();
            outputFabPos();
            //TODO when direkt ein anderes objekt angeklickt wird, ebenfalls die pfade verstecken
            if (actFabObj.isRecording && actFabObj.type == 'portal' || actFabObj.isRecording && actFabObj.type == 'enemy') {
                // let actObj_buffer = room_canvas.getActiveObject();
                //
                // 			if(actObj_buffer.type=='portal'){
                // 				actFabObj.secDoor = room_canvas.getActiveObject();
                // 				actObj_buffer.secDoor = actObj;
                // 				getReferenceById(actFabObj.AGObjectID).linkPortals(actObj_buffer.AGObjectID);
                //
                // 			}
                //canvas.setActiveObject(actObj);
            } else {
                //if another element is selected reset highlights and hide paths
                if (actFabObj != g_IAudiCom._room_canvas.getActiveObject()) {
                    if (actFabObj.PathArray) {
                        actFabObj.PathArray.forEach(function (ele) {
                            ele.opacity = 0;
                        });
                        actFabObj.LineArray.forEach(function (ele) {
                            ele.opacity = 0;
                        });
                    } else if (actFabObj.secDoor) {
                        portalSelect();
                        g_IAudiCom.getFabricObject(actFabObj.secDoor).set("fill", g_IAudiCom._colors[4][g_IAudiCom._vision_mode]);
                        if (actFabObj.line) {
                            actFabObj.line.set("opacity", 0);
                            actFabObj.line.dot.set("opacity", 0);
                            g_IAudiCom.getFabricObject(actFabObj.secDoor).line.dot.set("opacity", 0);
                        }
                    }
                }

                //show highlights or paths of new active fab object
                if (g_IAudiCom._room_canvas.getActiveObject().PathArray) {
                    g_IAudiCom._room_canvas.getActiveObject().PathArray.forEach(function (ele) {
                        ele.opacity = 1;
                    });
                    g_IAudiCom._room_canvas.getActiveObject().LineArray.forEach(function (ele) {
                        ele.opacity = 1;
                    });

                    //if another object is selected hide highlight-color of portal
                } else if (g_IAudiCom._room_canvas.getActiveObject().secDoor) {
                    portalSelect();
                    g_IAudiCom.getFabricObject(g_IAudiCom._room_canvas.getActiveObject().secDoor).set("fill", g_IAudiCom._colors[5][g_IAudiCom._vision_mode]);
                    if (g_IAudiCom._room_canvas.getActiveObject().line) {
                        g_IAudiCom._room_canvas.getActiveObject().line.set("opacity", 1);
                        g_IAudiCom._room_canvas.getActiveObject().line.dot.set("opacity", 1);
                        g_IAudiCom.getFabricObject(g_IAudiCom._room_canvas.getActiveObject().secDoor).line.dot.set("opacity", 1);
                    }
                }
                actFabObj = g_IAudiCom._room_canvas.getActiveObject();

                if (!(document.activeElement === document.getElementById('fabobject_' + actFabObj.AGObjectID))) {
                    $('#fabobject_' + actFabObj.AGObjectID).focus();
                }

                loadObject(actFabObj.type);
            }
        },
        'object:moving': function (e) {
            outputFabPos();
            //if moved outside, slide object along border of canvas
            if (actFabObj.left - actFabObj.getScaledWidth() / 2 <= 0) {
                actFabObj.left = actFabObj.getScaledWidth() / 2;
            }
            if (actFabObj.top - actFabObj.getScaledHeight() / 2 <= 0) {
                actFabObj.top = actFabObj.getScaledHeight() / 2;
            }
            if (actFabObj.top + actFabObj.getScaledHeight() / 2 >= g_IAudiCom._room_canvas.height) {
                actFabObj.top = g_IAudiCom._room_canvas.height - actFabObj.getScaledHeight() / 2;
            }
            if (actFabObj.left + actFabObj.getScaledWidth() / 2 >= g_IAudiCom._room_canvas.width) {
                actFabObj.left = g_IAudiCom._room_canvas.width - actFabObj.getScaledWidth() / 2;
            }
            if (e.target.type == 'portal' && e.target.line) {
                e.target.line.set({'x1': e.target.left, 'y1': e.target.top});
                e.target.line.dot.set({'left': e.target.left - 4, 'top': e.target.top - 4});
                g_IAudiCom.getFabricObject(e.target.secDoor).line.set({'x2': e.target.left, 'y2': e.target.top});
            }
            getReferenceById(e.target.AGObjectID).position = new Vector3(e.target.left / g_IAudiCom._scale, 1, e.target.top / g_IAudiCom._scale);
        },
        'object:scaling': function (e) {
            outputFabPos();
            //console.log("Size: " + options.target.width*target.scaleX/this._scale + " " + options.target.height*target.scaleY/this._scale);
            //console.log("Position: " + options.target.left/this._scale + " " + options.target.top/this._scale);

            getReferenceById(e.target.AGObjectID).size = new Vector3(e.target.width * e.target.scaleX / g_IAudiCom._scale, 1, e.target.height * e.target.scaleY / g_IAudiCom._scale);
            getReferenceById(e.target.AGObjectID).position = new Vector3(e.target.left / g_IAudiCom._scale, 1, e.target.top / g_IAudiCom._scale);

            if (!e.target.strokeWidthUnscaled && e.target.strokeWidth) {
                e.target.strokeWidthUnscaled = e.target.strokeWidth;
            }
            if (e.target.strokeWidthUnscaled) {
                var scale_buffer = e.target.scaleX > e.target.scaleY ? e.target.scaleX : e.target.scaleY;
                e.target.strokeWidth = e.target.strokeWidthUnscaled / scale_buffer;
            }
        },
    });

    /*************************/
    /***jQuery Events***/
    /*************************/

    //key-detection
    $(document).on('keydown', function (e) {
        if (event.keyCode == 13 && event.shiftKey) {
            if ($(document.activeElement).hasClass('faboject_')) {
                $('#ui_controls div').first().focus();
                loadObject('room');
            } else {

                $('.faboject_:first').focus();
            }
        } else if (e.which == 13) {
            if ($(document.activeElement).hasClass('faboject_')) {
                $('#input_obj_name').focus();
            }
            if ($(document.activeElement).hasClass('sb_object')) {
                var type_buffer = $(document.activeElement).attr('type');
                g_IAudiCom.makeThenRenderAGObject(type_buffer, g_IAudiCom._scale / 2, g_IAudiCom._scale / 2, true);
            }
            if ($(document.activeElement).hasClass('input_position')) {
                addPathPoint(actFabObj.left, actFabObj.top);
            }
        }
        if (event.key == "Escape") {
            if ($('#overlay').is(":visible")) {
                if (!$(e.target).is('a')) {
                    $('#overlay').fadeOut(200);
                }
            }
            if ($('#win_screen').is(":visible")) {
                $('#win_screen').fadeOut(200);
            }
            if ($('#ff_popup').is(":visible")) {
                $('#ff_popup').fadeOut(200);
                $('#ff_ta').val('');
            }
        }
        if (e.keyCode == 46) {
            if (g_IAudiCom._room_canvas.getActiveObject().type != 'player') {
                $('#fabobject_' + g_IAudiCom._room_canvas.getActiveObject().AGObjectID).remove();
                g_IAudiCom.deleteObject(g_IAudiCom._room_canvas.getActiveObject());
            }
        }
    });

    //focus
    $(document).on("focusout", ".faboject_", function (e) {
        setTimeout(function () {
            if (!$(document.activeElement).hasClass('faboject_') && !$(document.activeElement).attr('id') == 'input_obj_name') {
                loadObject('room');
                g_IAudiCom._room_canvas.discardActiveObject().renderAll();
            }
        }, 10);
    });
    $("#fabric_objects_container").on("focus", '.faboject_', function (e) {
        let that = $(e.target);
        g_IAudiCom._room_canvas.getObjects().forEach(function (e) {
            if (e.AGObjectID == that.attr('obj_id')) {
                g_IAudiCom._room_canvas.setActiveObject(e);
                g_IAudiCom._room_canvas.trigger('selection:created', {target: e});
                g_IAudiCom._room_canvas.renderAll();
            }
        });
    });

    //Drag&Drop
    $('.sb_object').draggable({
        appendTo: 'body',
        containment: 'window',
        scroll: false,
        helper: 'clone',
        start: function (e, ui) {
            g_IAudiCom._room_canvas.discardActiveObject().renderAll();
            loadObject('room');
            $('#ui_part_right').addClass('lower_opacity');
            $('#ui_part_left').addClass('lower_opacity');
            $('#ui_controls').addClass('lower_opacity');

            switch ($(this).attr('obj_type')) {
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
                width: g_IAudiCom._scale,
                height: g_IAudiCom._scale,
                opacity: 1,
            }, 200, function () {

            });
            ui.helper.empty();
        },
        stop: function (e, ui) {

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
        drop: function (event, ui) {
            let obj_type = $(ui.draggable).attr('obj_type');
            let obj;
            let left_buff = (((ui.position.left) - $(this).offset().left + g_IAudiCom._scale / 2) / g_IAudiCom._room_canvas.getZoom()) + 5;
            let top_buff = (((ui.position.top) - $(this).offset().top + g_IAudiCom._scale / 2) / g_IAudiCom._room_canvas.getZoom()) + 5;

            //if placed partially outside place it inside at the border
            if (left_buff - g_IAudiCom._scale / 2 <= 0) {
                left_buff = g_IAudiCom._scale / 2;
            }
            if (top_buff - g_IAudiCom._scale / 2 <= 0) {
                top_buff = g_IAudiCom._scale / 2;
            }
            if (left_buff + g_IAudiCom._scale / 2 >= g_IAudiCom._room_canvas.width) {
                left_buff = g_IAudiCom._room_canvas.width - g_IAudiCom._scale / 2;
            }
            if (top_buff + g_IAudiCom._scale / 2 >= g_IAudiCom._room_canvas.height) {
                top_buff = g_IAudiCom._room_canvas.height - g_IAudiCom._scale / 2;
            }
            let agobject_buffer;
            g_IAudiCom.makeThenRenderAGObject(obj_type, left_buff, top_buff);
        }
    });

    //change name of object
    $('#input_obj_name').on('input', function () {
        let buffer = $(this).val();
        g_IAudiCom._room_canvas.getActiveObject().name = buffer;
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).name = buffer;

        g_IAudiCom.refreshObjectSelect();
    });

    //change x-position of object
    $('#input_obj_x').on('input', function () {
        let buffer_x = $(this).val();
        let buffer_y = $('#input_obj_y').val();
        g_IAudiCom._room_canvas.getActiveObject().left = buffer_x * g_IAudiCom._scale;
        g_IAudiCom._room_canvas.getActiveObject().setCoords();
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(buffer_x, 1, buffer_y);
        $('#coord_x span').text(buffer_x);
        g_IAudiCom._room_canvas.renderAll();
    });

    //change y-position of object
    $('#input_obj_y').on('input', function () {
        let buffer_x = $('#input_obj_x').val();
        let buffer_y = $(this).val();
        g_IAudiCom._room_canvas.getActiveObject().top = buffer_y * g_IAudiCom._scale;
        g_IAudiCom._room_canvas.getActiveObject().setCoords();
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(buffer_x, 1, buffer_y);
        $('#coord_y span').text(buffer_y);
        g_IAudiCom._room_canvas.renderAll();
    });


    //change enemy health
    $('#input_enemy_health').on('input', function () {
        let buffer_health = $('#input_enemy_health').val();
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).health = buffer_health;
    });


    //change width of object
    $('#input_obj_w').on('input', function () {
        let new_size = $('#input_obj_w').val();
        let old_size = g_IAudiCom._room_canvas.getActiveObject().width / g_IAudiCom._scale;
        let new_scale = new_size / old_size;
        g_IAudiCom._room_canvas.getActiveObject().scaleX = new_scale;
        g_IAudiCom._room_canvas.getActiveObject().setCoords();
        g_IAudiCom._room_canvas.renderAll();
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).size = new Vector3(g_IAudiCom._room_canvas.getActiveObject().width * g_IAudiCom._room_canvas.getActiveObject().scaleX / g_IAudiCom._scale, 1, g_IAudiCom._room_canvas.getActiveObject().height * g_IAudiCom._room_canvas.getActiveObject().scaleY / g_IAudiCom._scale);
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(g_IAudiCom._room_canvas.getActiveObject().left / g_IAudiCom._scale, 1, g_IAudiCom._room_canvas.getActiveObject().top / g_IAudiCom._scale);
        if (!g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled && g_IAudiCom._room_canvas.getActiveObject().strokeWidth) {
            g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled = g_IAudiCom._room_canvas.getActiveObject().strokeWidth;
        }
        if (g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled) {
            var scale_buffer = g_IAudiCom._room_canvas.getActiveObject().scaleX > g_IAudiCom._room_canvas.getActiveObject().scaleY ? g_IAudiCom._room_canvas.getActiveObject().scaleX : g_IAudiCom._room_canvas.getActiveObject().scaleY;
            g_IAudiCom._room_canvas.getActiveObject().strokeWidth = g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled / scale_buffer;
        }
    });

    //change height of object
    $('#input_obj_h').on('input', function () {
        let new_size = $('#input_obj_h').val();
        let old_size = g_IAudiCom._room_canvas.getActiveObject().height / g_IAudiCom._scale;
        let new_scale = new_size / old_size;
        g_IAudiCom._room_canvas.getActiveObject().scaleY = new_scale;
        g_IAudiCom._room_canvas.getActiveObject().setCoords();
        g_IAudiCom._room_canvas.renderAll();
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).size = new Vector3(g_IAudiCom._room_canvas.getActiveObject().width * g_IAudiCom._room_canvas.getActiveObject().scaleX / g_IAudiCom._scale, 1, g_IAudiCom._room_canvas.getActiveObject().height * g_IAudiCom._room_canvas.getActiveObject().scaleY / g_IAudiCom._scale);
        getReferenceById(g_IAudiCom._room_canvas.getActiveObject().AGObjectID).position = new Vector3(g_IAudiCom._room_canvas.getActiveObject().left / g_IAudiCom._scale, 1, g_IAudiCom._room_canvas.getActiveObject().top / g_IAudiCom._scale);
        if (!g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled && g_IAudiCom._room_canvas.getActiveObject().strokeWidth) {
            g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled = g_IAudiCom._room_canvas.getActiveObject().strokeWidth;
        }
        if (g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled) {
            var scale_buffer = g_IAudiCom._room_canvas.getActiveObject().scaleX > g_IAudiCom._room_canvas.getActiveObject().scaleY ? g_IAudiCom._room_canvas.getActiveObject().scaleX : g_IAudiCom._room_canvas.getActiveObject().scaleY;
            g_IAudiCom._room_canvas.getActiveObject().strokeWidth = g_IAudiCom._room_canvas.getActiveObject().strokeWidthUnscaled / scale_buffer;
        }
    });

    //change room name
    $('#input_room_name').on('input', function () {
        let buffer = $(this).val();
        getReferenceById(g_IAudiCom._AGroomID).name = buffer;
    });


    //assign key to movement
    $('.btn_key_assign').bind("keyup", function (e) {
        let keycode_buffer = e.which;

        //numpad to number:
        if (keycode_buffer >= 96 && keycode_buffer <= 105) {
            keycode_buffer = keycode_buffer - 48;
        }

        //Esc-Taste -> Clear key-assignment
        if (keycode_buffer == 27 || (keycode_buffer >= 37 && keycode_buffer <= 40) || (keycode_buffer >= 65 && keycode_buffer <= 90) || (keycode_buffer >= 48 && keycode_buffer <= 57)) {

            let nav_buffer = getReferenceById(g_IAudiCom._controlsID);
            //erase double assignments
            $('.btn_key_assign').each(function (index) {
                if ($(this).attr('keycode') == keycode_buffer) {
                    switch ($(this).attr('id')) {
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
            switch (keycode_buffer) {
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
            switch ($(this).attr('id')) {
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
    $('.canvas-container').mousemove(function (e) {
        $('#mouse_coords').fadeIn(100);
        $('#mouse_coords_x span').text(Math.round((getMouseCoords(e)[0] * 2 / 110) * 10) / 10);
        $('#mouse_coords_y span').text(Math.round((getMouseCoords(e)[1] * 2 / 110) * 10) / 10);
    });

    //fade out mouse coordinates within canvas
    $('.canvas-container').mouseleave(function () {
        $('#mouse_coords').fadeOut(100);
    });

    //toggle vision mode
    $('#btn_change_vision_mode').click(function () {
        g_IAudiCom.toggleVisionMode();
    });

    //lower zoom factor
    $('#btn_zoom_out').click(function () {
        g_IAudiCom.zoomCanvas(0.9);
    });

    //raise zoom factor
    $('#btn_zoom_in').click(function () {
        g_IAudiCom.zoomCanvas(1.1);
    });

    //start the scene
    $('#btn_start_scene').click(function () {
        g_gamearea.audioContext.resume();
        g_IAudiCom.startArea();
    });

    //stop/reset the scene
    $('#btn_stop_scene').click(function () {
        g_IAudiCom.stopArea();
        $('#btn_new_scene').prop('tabIndex', 0);
    });

    //clear canvas for new scene
    $('#btn_new_scene').click(function () {
        g_IAudiCom.newScene();
    });

    //change dimensions of canvas
    $('#btn_set_dim').click(function () {
        g_IAudiCom.setAGRoomDimensions($('#tb_canvas_dim_width').val(), $('#tb_canvas_dim_height').val())
    });

    //change speed of object
    $('.bnt_speed').click(function () {
        $('.bnt_speed').removeClass('gegner_speed_active');
        $(this).addClass('gegner_speed_active');
        getReferenceById(actFabObj.AGObjectID).setSpeedSkalar($(this).attr('speed'));
    });

    //speed Select
    $('#object_speed_dropdown').change(function () {
        getReferenceById(actFabObj.AGObjectID).setSpeedSkalar($(this).val());
    });

    //volume sliders
    $('#slider_general_volume').on('input', function () {
        getReferenceById(actFabObj.AGObjectID).aliveSound.volume = $(this).val();
        $('#slider_value_general').text(Math.floor($(this).val() * 100));
    });
    $('#slider_death_volume').on('input', function () {
        getReferenceById(actFabObj.AGObjectID).deathSound.volume = $(this).val();
        $('#slider_value_death').text(Math.floor($(this).val() * 100));
    });
    $('#slider_action_volume').on('input', function () {
        getReferenceById(actFabObj.AGObjectID).interactionSound.volume = $(this).val();
        $('#slider_value_action').text(Math.floor($(this).val() * 100));
    });

    //general sound select
    $('#sound_dropdown').change(function () {
        g_IAudiCom.addSoundSource(actFabObj.AGObjectID, $(this).val(), 'on_alive');
        if ($(this).val() == 'none') {
            $('#slider_box_general').fadeOut(100);
        } else {
            $('#slider_general_volume').val(1);
            $('#slider_general_volume .slider_value').text(100);
            $('#slider_value_general').text(100);
            $('#slider_box_general').fadeIn(100);
        }
    });

    //destruction sound Select
    $('#sound_destruction_dropdown').change(function () {
        g_IAudiCom.addSoundSource(actFabObj.AGObjectID, $(this).val(), 'on_death');
        if ($(this).val() == 'none') {
            $('#slider_box_death').fadeOut(100);
        } else {
            $('#slider_death_volume').val(1);
            $('#slider_value_death').text(100);
            $('#slider_box_death').fadeIn(100);
        }
    });

    //action sound Select
    $('#sound_action_dropdown').change(function () {
        g_IAudiCom.addSoundSource(actFabObj.AGObjectID, $(this).val(), 'on_action');
        if ($(this).val() == 'none') {
            $('#slider_box_action').fadeOut(100);
        } else {
            $('#slider_action_volume').val(1);
            $('#slider_value_action').text(100);
            $('#slider_box_action').fadeIn(100);
        }
    });

    //attack range Select
    $("#atk_range_dropdown").change(function () {
        let range_buffer = $("#atk_range_dropdown").val();
        if (range_buffer == 0) {
            getReferenceById(g_IAudiCom._AGroomID).dangerous = false;
        } else {
            getReferenceById(g_IAudiCom._AGroomID).dangerous = true;
        }
        getReferenceById(actFabObj.AGObjectID).range = range_buffer;
    });


    //add position of object to path
    $('.btn_add_to_path').click(function () {
        addPathPoint(actFabObj.left, actFabObj.top);
    });

    //record path for object
    $('.btn_path_rec').click(function () {
        if (actFabObj.isRecording) {
            let first_dot_buffer = actFabObj.PathArray[0];
            let last_dot_buffer = actFabObj.PathArray[actFabObj.PathArray.length - 1];
            // let line = new fabric.Line([first_dot_buffer.left + 4, first_dot_buffer.top + 4,last_dot_buffer.left + 4, last_dot_buffer.top + 4],{
// 				fill: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
// 				stroke: g_IAudiCom._colors[7][g_IAudiCom._vision_mode],
// 				strokeWidth: 2,
// 				selectable: false,
// 				evented: false,
// 				type: 'path_line'
// 			});
//
// 			actFabObj.LineArray.push(line);
// 			g_IAudiCom._room_canvas.add(line);
            getReferenceById(actFabObj.AGObjectID).clearRoute();
            actFabObj.PathArray.forEach(function (ele) {
                getReferenceById(actFabObj.AGObjectID).addRouteNode(new Vector3(ele.left / g_IAudiCom._scale, 1, ele.top / g_IAudiCom._scale));
            });
            getReferenceById(actFabObj.AGObjectID).movable = true;
            actFabObj.isRecording = false;
            $(this).find('i').removeClass('btn_path_rec_blink');
            $('#ui_controls').removeClass('no_click lower_opacity');
            $('.misc_ctrls').removeClass('no_click lower_opacity');
            $('#ui_part_left').removeClass('no_click lower_opacity');
            $('.btn_add_to_path').removeClass('no_click lower_opacity');
            $('.rb_ctrls').removeClass('no_click lower_opacity');
            $('.btn_path_delete').removeClass('no_click lower_opacity');
            $('.ui_box_special:visible').removeClass('no_click').not('#ui_box_enemy_path').removeClass('lower_opacity');
        } else {
            actFabObj.isRecording = true;
            $(this).find('i').addClass('btn_path_rec_blink');
            $('#ui_controls').addClass('no_click lower_opacity');
            $('.misc_ctrls').addClass('no_click lower_opacity');
            $('#ui_part_left').addClass('no_click lower_opacity');
            $('.btn_add_to_path').addClass('no_click lower_opacity');
            $('.rb_ctrls').addClass('no_click lower_opacity');
            $('.btn_path_delete').addClass('no_click lower_opacity');
            $('.ui_box_special:visible').not('#ui_box_enemy_path').not('#ui_box_player_railed').addClass('no_click').addClass('lower_opacity');
        }
    });

    //delete path of object
    $('.btn_path_delete').click(function () {
        actFabObj.PathArray.forEach(function (ele) {
            g_IAudiCom._room_canvas.remove(ele);
        });
        actFabObj.LineArray.forEach(function (ele) {
            g_IAudiCom._room_canvas.remove(ele);
        });
        actFabObj.LineArray = [];
        actFabObj.PathArray = [];
        getReferenceById(actFabObj.AGObjectID).clearRoute();
        getReferenceById(actFabObj.AGObjectID).movable = false;

    });

    //toggle collidable for object
    $('#cb_colli').click(function () {
        if ($('#cb_colli').is(":checked")) {
            getReferenceById(actFabObj.AGObjectID).collidable = true;
        } else {
            getReferenceById(actFabObj.AGObjectID).collidable = false;
        }
    });

    //toggle running in circles
    $('#cb_circle').click(function () {
        if ($('#cb_circle').is(":checked")) {
            getReferenceById(actFabObj.AGObjectID).circle = true;
        } else {
            getReferenceById(actFabObj.AGObjectID).circle = false;
        }
    });

    //toggle runaway
    $('#cb_runaway').click(function () {
        if ($('#cb_runaway').is(":checked")) {
            getReferenceById(actFabObj.AGObjectID).runaway = true;
        } else {
            getReferenceById(actFabObj.AGObjectID).runaway = false;
        }
    });

    //toggle recording for portal linking
    $('#btn_path_linkdoors').click(function () {
        if (actFabObj.isRecording) {
            actFabObj.isRecording = false;
            $(this).find('i').removeClass('btn_path_rec_blink');

            $('#ui_part_left').removeClass('no_click lower_opacity');
            $('.misc_ctrls').removeClass('no_click lower_opacity');
            $('#ui_controls').removeClass('no_click lower_opacity');
            $('.ui_box_special:visible').removeClass('no_click').not('#ui_box_link_portals').removeClass('lower_opacity');

        } else {
            actFabObj.isRecording = true;
            $(this).find('i').addClass('btn_path_rec_blink');

            $('#ui_part_left').addClass('no_click lower_opacity');
            $('.misc_ctrls').addClass('no_click lower_opacity');
            $('#ui_controls').addClass('no_click lower_opacity');
            $('.ui_box_special:visible').not('#ui_box_link_portals').addClass('no_click').addClass('lower_opacity');

        }
    });

    //delete link to portal of object
    $('.btn_path_deletedoors').click(function () {
        deletePortal();
    });

    //delete object
    $('#btn_delete_object').click(function () {
        g_IAudiCom.deleteObject(actFabObj);
        $('#ui_part_right_inner').fadeOut(100, function () {
        });
    });

    //close overlay
    $('#overlay').click(function (e) {
        if (!$(e.target).is('a')) {
            $('#overlay').fadeOut(200);
        }
    });


    //close win screen
    $('#win_screen').click(function () {
        $(this).fadeOut(200);
    });

    //open help
    $('#btn_help').click(function () {
        $('#overlay').fadeIn(200);
    });

    //copy level
    $('#btn_save').click(function () {
        g_IAudiCom.saveLevelSALO();
    });

    //paste level
    $('#btn_load').click(function () {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            //if firefox -> manual input
            $('#ff_popup').fadeIn(200);
        } else {
            g_IAudiCom.loadLevelSALO();
        }
    });

    //load for Firefox
    $('#ff_load').click(function () {
        let ff_lvl_code = $('#ff_ta').val();
        g_IAudiCom.loadFFLevel(ff_lvl_code);
        $('#ff_popup').fadeOut(200);
        $('#ff_ta').val('');
    });
    //close Firefox-Popup
    $('#ff_popup').click(function (e) {
        if (!$(e.target).is('textarea') && !$(e.target).is('#ff_load')) {
            $('#ff_popup').fadeOut(200);
            $('#ff_ta').val('');
        }
    });

    //level select
    $("#level_dropdown").change(function () {
        switch (this.value) {
            case 'Railed Shooter':
                g_IAudiCom.loadLevel(1);
                break;
            case 'Frogger':
                g_IAudiCom.loadLevel(2);
                break;
            case 'Labyrinth':
                g_IAudiCom.loadLevel(3);
                break;
            case 'Pointer':
                g_IAudiCom.loadLevel(4);
                break;
        }
    });

    //portal select
    $("#portal_dropdown").change(function () {
        let portal_buffer = '';
        let value_buffer = $(this).val();

        if (value_buffer == '') {
            deletePortal();
        } else {
            g_IAudiCom._room_canvas.getObjects().forEach(function (e) {
                if (e.AGObjectID == value_buffer) {
                    portal_buffer = e;
                }
            });
            linkPortalsUI(portal_buffer);
        }
    });

    //movement type
    $("input[name='controls']").change(function () {
        let controls_value = $("input[name='controls']:checked").val();

        switch (controls_value) {
            case 'classic':
                //hier controls aktivieren wieder
                //console.log(actFabObj);
                getReferenceById(actFabObj.AGObjectID).movable = false;
                $('.show_on_railed').fadeOut(100, function () {
                    $('.hide_on_railed').fadeIn(100);
                });

                break;
            case 'railed':
                getReferenceById(actFabObj.AGObjectID).movable = true;
                getReferenceById(g_IAudiCom._controlsID).forward = -1;
                getReferenceById(g_IAudiCom._controlsID).backward = -1;
                $('.hide_on_railed').fadeOut(100, function () {
                    $('.show_on_railed').fadeIn(100);
                });

                break;
        }
    });


    //add element to events, items etc
    $('table').on('click', '.table_add', function () {
        //console.log($(this).parents("table").attr('id'));
        let table_id = $(this).parents("table").attr('id');

        switch (table_id) {
            case 'item_table':
                let item_name = $('#item_name').val() ? $('#item_name').val() : "New Item";
                let item_desc = $('#item_desc').val() ? $('#item_desc').val() : "This…";
                let item_type = $('#item_type').val() ? $('#item_type').val() : "generic";
                let item_charges = $('#item_charges').val() ? $('#item_charges').val() : 1;
                let item_carriedby = $('#item_carrier').val() ? $('#item_carrier').val() : null;
                g_IAudiCom.generateItem(item_name, item_desc, item_type, item_charges, item_carriedby);
                break;

            case 'condition_table':
                let condition_portal = $('#condition_portal').val();
                let condition_primary = $('#condition_primary').val();
                let condition_func = $('#condition_trigger').val();
                let condition_func_arg1 = '';
                let condition_func_arg2 = '';
                if (condition_func == 'countByType') {
                    condition_func_arg1 = $('#condition_type').val();
                    condition_func_arg2 = $('#condition_count').val() ? $('#condition_count').val() : 1;
                } else if (condition_func == 'hasItemById') {
                    condition_func_arg1 = $('#condition_item').val();
                    condition_func_arg2 = $('#condition_tf').val();
                }
                g_IAudiCom.generateCondition(parseInt(condition_portal), parseInt(condition_primary), condition_func, condition_func_arg1, condition_func_arg2);
                break;

            case 'event_table':
                let event_primary = $('#event_primary').val();
                let event_trigger = $('#event_trigger').val();
                let event_action = $('#event_action').val();
                let event_item = $('#event_item').val();
                let event_secondary = $('#event_secondary').val();
                let event_repeat = $('#events_repeat').val() ? $('#events_repeat').val() : 1;
                g_IAudiCom.generateEvent(parseInt(event_primary), event_trigger, event_action, parseInt(event_item), parseInt(event_secondary), parseInt(event_repeat));
                break;

            case 'glevent_table':
                let glevent_primary = $('#glevent_primary').val();
                let glevent_conobject = $('#glevent_conobject').val();
                let glevent_func = $('#glevent_func').val();
                let glevent_type = $('#glevent_type').val();
                let glevent_count = $('#glevent_count').val() ? $('#glevent_count').val() : 1;
                let glevent_action = $('#glevent_action').val();
                let glevent_repeat = $('#glevent_repeat').val() ? $('#glevent_repeat').val() : 1;

                g_IAudiCom.generateGlobalEvent(parseInt(glevent_primary), glevent_conobject, glevent_func, glevent_type, glevent_count, glevent_action, glevent_repeat);

                break;
        }
    });

    //delete for events, items etc
    $('table').on('click', '.btn_delete_row', function () {
        //console.log($(this).parents("table").attr('id'));
        let table_id = $(this).parents("table").attr('id');
        switch (table_id) {
            case 'item_table':
                g_IAudiCom.deleteItemfromList($(this).parents('tr').attr('item_id'));
                $(this).parents('tr').detach();
                g_IAudiCom.refreshItemSelect();
                g_IAudiCom.listGlobalEvents();
                break;

            case 'condition_table':
                g_IAudiCom.deleteConditionFromList(parseInt($(this).parents('tr').attr('condition_id')));
                $(this).parents('tr').detach();
                break;

            case 'event_table':
                g_IAudiCom.deleteEvent($(this).parents('tr').attr('event_id'));
                $(this).parents('tr').detach();
                break;

            case 'glevent_table':
                g_IAudiCom.deleteGlobalEvent($(this).parents('tr').attr('glevent_id'));
                $(this).parents('tr').detach();
                break;
        }
    });

    //quelle: https://mdbootstrap.com/docs/jquery/tables/editable/#!
    //items
    const $tableID_items = $('#item_table');
    $tableID_items.on('input', '.input_item_name', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('item_id'))).name = buffer;
        g_IAudiCom.refreshItemSelect();
        g_IAudiCom.listConditions();
    });
    $tableID_items.on('input', '.input_item_desc', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('item_id'))).description = buffer;

    });
    $tableID_items.on('input', '.input_item_type', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('item_id'))).type = buffer;
        g_IAudiCom.listGlobalEvents();
        g_IAudiCom.listConditions();
    });
    $tableID_items.on('change', '.select_item_carrier', function () {
        let object_id_buffer = parseInt($(this).val());
        let item_id_buffer = parseInt($(this).parents('tr').attr('item_id'))
        let prev_owner_id = getOwnerIdOfItemById(item_id_buffer);
        getReferenceById(prev_owner_id).inventory.removeItemById(item_id_buffer);
        getReferenceById(object_id_buffer).inventory.addItemById(item_id_buffer);
    });
    $tableID_items.on('input', '.input_item_charges', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('item_id'))).charges = buffer;
    });

    //events
    const $tableID_events = $('#event_table');
    $tableID_events.on('change', '.select_event_primary', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).origin = buffer;

    });
    $tableID_events.on('change', '.select_event_trigger', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).trigger = buffer;

    });
    $tableID_events.on('change', '.select_event_action', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).action = buffer;

    });
    $tableID_events.on('change', '.select_event_item', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).addObject = buffer;

    });
    $tableID_events.on('change', '.select_event_secondary', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).object = buffer;

    });
    $tableID_events.on('input', '.input_events_repeat', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('event_id'))).repeat = buffer;

    });

    //global events
    const $tableID_glevents = $('#glevent_table');
    $tableID_glevents.on('change', '.select_glevent_primary', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).object = parseInt(buffer);
    });
    $tableID_glevents.on('change', '.select_glevent_type', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).funcArgs = [buffer];

    });
    $tableID_glevents.on('input', '.input_glevent_repeat', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).repeat = buffer;

    });
    $tableID_glevents.on('input', '.input_glevent_count', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).value = buffer;

    });

    //conditions
    const $tableID_conditions = $('#condition_table');
    $tableID_conditions.on('change', '.select_condition_portal', function () {
        let condition_id_buffer = parseInt($(this).parents('tr').attr('condition_id'));
        let old_portal = g_IAudiCom.getIdOfPortal(condition_id_buffer);
        let new_portal = parseInt($(this).val());
        getReferenceById(old_portal).deleteConditionById(condition_id_buffer);
        getReferenceById(new_portal).addConditionById(condition_id_buffer);
        //getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).funcArgs = [buffer];
        //getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).funcArgs = [buffer];
    });
    $tableID_conditions.on('change', '.select_condition_primary', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).object = parseInt(buffer);
    });
    $tableID_conditions.on('change', '.select_condition_trigger', function () {
        let buffer = $(this).val();
        let that = $(this);
        if (buffer == 'countByType') {
            that.parent().parent().find(".condition_has").fadeOut(100, function () {
                that.parent().parent().find('.condition_cnt').fadeIn(100);
            });
            if (that.parent().parent().attr('id') == 'condition_input_row') {
                $('#condition_head').find(".condition_has").fadeOut(100, function () {
                    $('#condition_head').find('.condition_cnt').fadeIn(100);
                });
            }
        } else if (buffer == 'hasItemById') {
            //console.log(that.parent().parent());
            that.parent().parent().find('.condition_cnt').fadeOut(100, function () {
                that.parent().parent().find('.condition_has').fadeIn(100);
            });
            if (that.parent().parent().attr('id') == 'condition_input_row') {
                $('#condition_head').find(".condition_cnt").fadeOut(100, function () {
                    $('#condition_head').find('.condition_has').fadeIn(100);
                });
            }
        }
        if (that.parent().parent().attr('id') != 'condition_input_row') {
            getReferenceById(parseInt(that.parents('tr').attr('condition_id'))).funcOfConditionObject = buffer;
        }
        //getReferenceById(parseInt($(this).parents('tr').attr('glevent_id'))).funcArgs = [buffer];
    });
    $tableID_conditions.on('input', '.select_condition_item', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).funcArgs = [buffer];
    });
    $tableID_conditions.on('input', '.select_condition_tf', function () {
        var buffer = ($(this).val() == "true");
        getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).value = buffer;
    });
    $tableID_conditions.on('input', '.input_condition_type', function () {
        let buffer = $(this).val();
        //console.log(getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).funcArgs);
        getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).funcArgs = [buffer];
    });
    $tableID_conditions.on('input', '.input_condition_count', function () {
        let buffer = $(this).val();
        getReferenceById(parseInt($(this).parents('tr').attr('condition_id'))).value = buffer;
    });

    //hide & display events, items etc
    $('.item_event_tab').click(function () {
        let table_buffer = $(this).attr('table_');
        $('.item_event_tab').removeClass('item_event_tab_active');
        $(this).addClass('item_event_tab_active');
        $('.event_item_table:visible').fadeOut(200, function () {
            $('#' + table_buffer + '_container').fadeIn(200);
        });
    });


    /***********************/
    /***jQuery Events End***/
    /***********************/
});
