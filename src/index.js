/* This file defines the public api for the AG Library */

// Classes
//---------------------------------
import { AGCondition } from "./AGCondition.js";
import { AGEventHandler } from "./AGEventHandler.js";
import { AGGameArea } from "./AGGameArea.js";
import { AGInventory } from "./AGInventory.js";
import { AGItem } from "./AGItem.js";
import { AGNavigation } from "./AGNavigation.js";
import { AGObject } from "./AGObject.js";
import { AGPlayer } from "./AGPlayer.js";
import { AGPortal } from "./AGPortal.js";
import { AGRoom } from "./AGRoom.js";
import { AGRoomExit } from "./AGRoomExit.js";
import { AGSaLo, SaLoCommand } from "./AGSaLo.js";
import { AGSoundSource } from "./AGSoundSource.js";
import { Collision } from "./Collision.js";
import { Event } from "./Event.js";
import { GlobalEvent } from "./GlobalEvent.js";

// Functions
//---------------------------------
import {evaluateAll} from "./AGCondition.js";
import {setIAudiCom,
    setGameArea,
    setEventHandler,
    deleteItem,
    deleteCondition,
    getOwnerIdOfItemById,
    rebuildHandlerGameArea,
    setControl,
    getReferenceById,
    getIdByReference,
    getReferencesOfType,
    setLoading,
    play} from "./AGEngine.js";
import {move} from "./AGNavigation.js";
import {
    colliding,
    isPointInsideAABB,
    isAABBInsideAABB,
    isAABBInsideRoom,
    frbIntersectionPoint,
    hitBoundingBox
} from "./AGPhysics";
import {collisionIsInArray, objectPartOfCollisions} from "./Collision.js";

// Types
//---------------------------------
//import type {Type} from "./AGType.js";
import type {Trigger, Action, ConditionObject} from "./EventType.js";
import type {ConditionType} from "./ConditionType.js";

// Constants
//---------------------------------
import { IncrementOneCounter } from "./IDGenerator.js"

// Variables
//---------------------------------
import {
    g_loading,
    g_playing,
    g_references,
    g_history,
    g_eventHandler,
    g_gamearea,
    g_controls,
} from "./AGEngine.js"



/* Now we define the public API by exporting what we want */

export {
    // Classes
    //---------------------------------
    AGCondition,
    AGEventHandler,
    AGGameArea,
    AGInventory,
    AGItem,
    AGNavigation,
    AGObject,
    AGPlayer,
    AGPortal,
    AGRoom,
    AGRoomExit,
    AGSaLo,
    SaLoCommand,
    AGSoundSource,
    Collision,
    Event,
    GlobalEvent,

    // Functions
    //---------------------------------

    // AGCondition
    evaluateAll,

    // AGEngine
    setIAudiCom,
    setGameArea,
    setEventHandler,
    deleteItem,
    deleteCondition,
    getOwnerIdOfItemById,
    rebuildHandlerGameArea,
    setControl,
    getReferenceById,
    getIdByReference,
    getReferencesOfType,
    setLoading,
    play,

    // AGNavigation
    move,

    // AGPhysics
    colliding,
    isPointInsideAABB,
    isAABBInsideAABB,
    isAABBInsideRoom,
    frbIntersectionPoint,
    hitBoundingBox,

    // Collision
    collisionIsInArray,
    objectPartOfCollisions,

    // Types
    //---------------------------------

    // AGType
//    Type,

    // EventType
//    Trigger,
//    Action,
//    ConditionObject,

    // ConditionType
//    ConditionType,

    // Constants
    //---------------------------------
    IncrementOneCounter,

    // Variables
    //---------------------------------
    g_loading,
    g_playing,
    g_references,
    g_history,
    g_eventHandler,
    g_gamearea,
    g_controls
}