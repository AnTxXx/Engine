// ******************* //
// ****LEVEL 1******** //
// Schleiche aus der Höhle an den schlafenden Monster vorbei
// ******************* //

let room_1 = new AGRoom("First Room", new Vector3(17.0, 2.5, 7.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(15.5, 1.0, 6.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let skeleton_1 = new AGObject("Skeleton", new Vector3(5.5, 1, 1.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_2 = new AGObject("Skeleton", new Vector3(10, 1, 3), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_3 = new AGObject("Skeleton", new Vector3(13.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

let wallHorizontal = new AGObject("WallHorizontal", new Vector3(7, 1.0, 4.5), new Vector3(1, 0, 0), new Vector3(14, 1, 1));
let wallVertical = new AGObject("WallVertical", new Vector3(13.5, 1.0, 6), new Vector3(1, 0, 0), new Vector3(1, 1, 2));


let waterfall = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
let monster_1 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let monster_2 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
let monster_3 = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);


let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);
let skeleton_1ID = getIdByReference(skeleton_1);
let skeleton_2ID = getIdByReference(skeleton_2);
let skeleton_3ID = getIdByReference(skeleton_3);
let waterfallID = getIdByReference(waterfall);
let ouchID = getIdByReference(ouch);
let monster_1ID = getIdByReference(monster_1);
let monster_2ID = getIdByReference(monster_2);
let monster_3ID = getIdByReference(monster_3);

let wallHorizontalID = getIdByReference(wallHorizontal);
let wallVerticalID = getIdByReference(wallVertical);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

//Add ObjectsToRoom
getReferenceById(room_1ID).add(playerID);
getReferenceById(room_1ID).add(exitID);

getReferenceById(room_1ID).add(skeleton_1ID);
getReferenceById(room_1ID).add(skeleton_2ID);
getReferenceById(room_1ID).add(skeleton_3ID);

getReferenceById(room_1ID).add(wallHorizontalID);
getReferenceById(room_1ID).add(wallVerticalID);
getReferenceById(wallHorizontalID).tag = "WALL";
getReferenceById(wallVerticalID).tag = "WALL";

//Soundtags
getReferenceById(waterfallID).tag = "WATERFALL";
getReferenceById(ouchID).tag = "OUCH";
getReferenceById(monster_1ID).tag = "MONSTER";
getReferenceById(monster_2ID).tag = "MONSTER";
getReferenceById(monster_3ID).tag = "MONSTER";

//Monster 1
getReferenceById(skeleton_1ID).setSpeedSkalar(0);

getReferenceById(skeleton_1ID).destructible = true;
getReferenceById(skeleton_1ID).health = 4;

getReferenceById(skeleton_1ID).addSoundSource(monster_1ID);
getReferenceById(skeleton_1ID).tag = "ENEMY";

//Monster 2
getReferenceById(skeleton_2ID).setSpeedSkalar(0);

getReferenceById(skeleton_2ID).destructible = true;
getReferenceById(skeleton_2ID).health = 4;

getReferenceById(skeleton_2ID).addSoundSource(monster_2ID);
getReferenceById(skeleton_2ID).tag = "ENEMY";


//Monster 3
getReferenceById(skeleton_3ID).setSpeedSkalar(0);

getReferenceById(skeleton_3ID).destructible = true;
getReferenceById(skeleton_3ID).health = 4;

getReferenceById(skeleton_3ID).addSoundSource(monster_3ID);
getReferenceById(skeleton_3ID).tag = "ENEMY";


//Player Settings
getReferenceById(playerID).speed = new Vector3(0.1, 0.0, 0.1);
getReferenceById(playerID).hitSound = ouchID;

getReferenceById(playerID).dangerous = true;
getReferenceById(playerID).damage = 1;
getReferenceById(playerID).range = 2;


//Exit Sound
getReferenceById(exitID).addSoundSource(waterfallID);



// ******************* //
// ****LEVEL 2******** //
// Frogger-Verschnitt
// ******************* //

let room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(1, 1.0, 5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));

let skeleton_1 = new AGObject("Skeleton", new Vector3(3.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_2 = new AGObject("Skeleton", new Vector3(11, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_3 = new AGObject("Skeleton", new Vector3(14.5, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let skeleton_4 = new AGObject("Skeleton", new Vector3(16, 1, 1), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));

let steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
let car_1 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
let car_2 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
let car_3 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
let car_4 = new AGSoundSource("Car", "sounds/car.wav", true, 1, room_1ID);
let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
let magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);

let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);

let skeleton_1ID = getIdByReference(skeleton_1);
let skeleton_2ID = getIdByReference(skeleton_2);
let skeleton_3ID = getIdByReference(skeleton_3);
let skeleton_4ID = getIdByReference(skeleton_4);

let ouchID = getIdByReference(ouch);
let car_1ID = getIdByReference(car_1);
let car_2ID = getIdByReference(car_2);
let car_3ID = getIdByReference(car_3);
let car_4ID = getIdByReference(car_4);
let magic_exit_ID = getIdByReference(magic_exit);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

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


// ******************* //
// ****LEVEL 3******** //
// Der Klassiker
// ******************* //

let room_1 = new AGRoom("First Room", new Vector3(19.0, 2.5, 10.0), new Vector3(10.0, 0.0, 10.0));
let room_1ID = getIdByReference(room_1);
g_gamearea.addRoom(room_1ID);

let player = new AGPlayer("Player", new Vector3(18.2, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let exit = new AGRoomExit("Exit", new Vector3(18.0, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallWestSmallRoom = new AGObject("WallSmallRoomWest", new Vector3(13.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
let wallNorthSmallRoom = new AGObject("WallSmallRoomNorth", new Vector3(16.5, 1.0, 6.5), new Vector3(1, 0, 0), new Vector3(5, 1, 1));
let portalSmallRoom = new AGPortal("PortalSmallRoom", new Vector3(14.5, 1.0, 8.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallSouthCorridor = new AGObject("WallCorridorSouth", new Vector3(9.5, 1.0, 3.5), new Vector3(1, 0, 0), new Vector3(19, 1, 1));
let wallLeftCorridor = new AGObject("WallCorridorLeft", new Vector3(4.0, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
let wallRightCorridor = new AGObject("WallCorridorRight", new Vector3(7.5, 1.0, 2.2), new Vector3(1, 0, 0), new Vector3(1, 1, 1.65));
let portalCorridorRoomFromSmallRoom = new AGPortal("PortalCorridorRoomFromSmallRoom", new Vector3(1.0, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let skeleton = new AGObject("Skeleton", new Vector3(11.5, 1, 2.5), new Vector3(1.0, 0.0, 0.0), new Vector3(1.0, 1.0, 1.0));
let portalCorridorToFinal = new AGPortal("PortalCorridorToFinal", new Vector3(17.5, 1.0, 1.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let portalFinalFromCorridor = new AGPortal("PortalFinalFromCorridor", new Vector3(1.0, 1.0, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let wallFirstFinalRoom = new AGObject("WallFinalRoomFirst", new Vector3(4.5, 1.0, 8.0), new Vector3(1, 0, 0), new Vector3(1, 1, 4));
let wallSecondFinalRoom = new AGObject("WallFinalRoomSecond", new Vector3(8.1, 1.0, 5.6), new Vector3(1, 0, 0), new Vector3(1, 1, 3.34));
let waterFall_1 = new AGObject("Waterfall1", new Vector3(8.7, 1, 0.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let waterFall_2 = new AGObject("Waterfall2", new Vector3(4.5, 1, 4.5), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let waterFall_3 = new AGObject("Waterfall3", new Vector3(8, 1, 9.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let waterFall_4 = new AGObject("Waterfall4", new Vector3(11, 1, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
let steps = new AGSoundSource("Steps", "sounds/steps.wav", true, 1, room_1ID);
let ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
let magic_1 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let magic_2 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let magic_3 = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
let waterfall_1 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_2 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_3 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);
let waterfall_4 = new AGSoundSource("Waterfall", "sounds/waterfall.wav", true, 1, room_1ID);

let playerID = getIdByReference(player);
let exitID = getIdByReference(exit);
let wallWestSmallRoomID = getIdByReference(wallWestSmallRoom);
let wallNorthSmallRoomID = getIdByReference(wallNorthSmallRoom);
let portalSmallRoomID = getIdByReference(portalSmallRoom);
let wallSouthCorridorID = getIdByReference(wallSouthCorridor);
let wallLeftCorridorID = getIdByReference(wallLeftCorridor);
let wallRightCorridorID = getIdByReference(wallRightCorridor);
let portalCorridorRoomFromSmallRoomID = getIdByReference(portalCorridorRoomFromSmallRoom);
let skeletonID = getIdByReference(skeleton);
let portalCorridorToFinalID = getIdByReference(portalCorridorToFinal);
let portalFinalFromCorridorID = getIdByReference(portalFinalFromCorridor);
let wallFirstFinalRoomID = getIdByReference(wallFirstFinalRoom);
let wallSecondFinalRoomID = getIdByReference(wallSecondFinalRoom);
let stepsID = getIdByReference(steps);
let ouchID = getIdByReference(ouch);
let magic_1ID = getIdByReference(magic_1);
let magic_2ID = getIdByReference(magic_2);
let magic_3ID = getIdByReference(magic_3);
let waterfall_1ID = getIdByReference(waterfall_1);
let waterfall_2ID = getIdByReference(waterfall_2);
let waterfall_3ID = getIdByReference(waterfall_3);
let waterfall_4ID = getIdByReference(waterfall_4);

let waterFall_1ID = getIdByReference(waterFall_1);
let waterFall_2ID = getIdByReference(waterFall_2);
let waterFall_3ID = getIdByReference(waterFall_3);
let waterFall_4ID = getIdByReference(waterFall_4);

g_gamearea.listener = getIdByReference(player);
getReferenceById(room_1ID).listener = g_gamearea.listener;

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