/* This file defines the public api for the AG Library and the Entrypoint */

// fix polyfill problems
// import "core-js/stable";
import "regenerator-runtime/runtime";

/* Now we define the public API by exporting what we want */

// Classes
//---------------------------------
export { AGCondition } from "./AGCondition.js";
export { AGEventHandler } from "./AGEventHandler.js";
export { AGGameArea } from "./AGGameArea.js";
export { AGInventory } from "./AGInventory.js";
export { AGItem } from "./AGItem.js";
export { AGNavigation } from "./AGNavigation.js";
export { AGObject } from "./AGObject.js";
export { AGPlayer } from "./AGPlayer.js";
export { AGPortal } from "./AGPortal.js";
export { AGRoom } from "./AGRoom.js";
export { AGRoomExit } from "./AGRoomExit.js";
export { AGSoundSource } from "./AGSoundSource.js";
export { Collision } from "./Collision.js";
export { Event } from "./Event.js";
export { GlobalEvent } from "./GlobalEvent.js";
export { AGSaLo, SaLoCommand } from "./AGEngine.js";

// Functions
//---------------------------------
export {evaluateAll} from "./AGCondition.js";
export {setIAudiCom,
    startAGEngine,
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
export {move} from "./AGNavigation.js";
export {
    colliding,
    isPointInsideAABB,
    isAABBInsideAABB,
    isAABBInsideRoom,
    frbIntersectionPoint,
    hitBoundingBox
} from "./AGPhysics";
export {collisionIsInArray, objectPartOfCollisions} from "./Collision.js";

// Types
//---------------------------------
//import type {Type} from "./AGType.js";
export type {Trigger, Action, ConditionObject} from "./EventType.js";
export type {ConditionType} from "./ConditionType.js";
export type {IAGObject} from "./IAGObject.js";

// Constants
//---------------------------------
export { IncrementOneCounter } from "./IDGenerator.js"

// Variables
//---------------------------------
export {
    g_loading,
    g_playing,
    g_references,
    g_eventHandler,
    g_gamearea,
    g_controls,
    g_history,
    g_IAudiCom
} from "./AGEngine.js"