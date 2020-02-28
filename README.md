# [AudiCom](https://audicom.at/) - Create, Share, and Play Audio Games

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FAnTxXx%2FEngine.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FAnTxXx%2FEngine?ref=badge_shield)

## User Guides

Read more about what [AudiCom](https://audicom.at/) is on https://audicom.at/.

To *play* or *create* audio games, use the [Editor](https://www.audicom.at/Engine/interface_test.html) which is
available on https://www.audicom.at/Engine/interface_test.html.

To *get started* or *discuss* and *share* audio games, use the [Forum](https://www.audicom.at/forum/) which is
available on https://www.audicom.at/forum/

## Contributing

We're always looking for help identifying bugs and improving documentation. Our small team will
not be able to implement your new feature requests, however, we appreciate them to learn, what
people playing, creating and sharing audio games are caring about.

Please create issues for our comments, bug reports, recommendations, or feature requests on
https://github.com/AnTxXx/Engine/issues

At the moment we do not provide templates for these issue-types.

Please take a look at [CONTRIBUTING.md](https://github.com/AnTxXx/Engine/tree/cleanup/CONTRIBUTING.md) for further
information.

## Developer Guides

### Introduction

The transpiled library can be found in: [lib/audicom.js](https://github.com/AnTxXx/Engine/tree/cleanup/lib/audicom.js).

It contains - as an ES6 module - the AudiCom-Engine. So if you want to use it, it helps being familiar with the
[EcmaScript 6.0 Standard](https://ecma-international.org/ecma-262/6.0). A possible starting point is
[An introduction to ES6](https://medium.com/sons-of-javascript/javascript-an-introduction-to-es6-1819d0d89a0f) by
Gerard Sans. You can also try playing with ES6 on [ES6Fiddle](http://www.es6fiddle.net/)

### Creating a game

Before coding a game a sketch where all game elements are uniquely named is helpful.
To learn about the game elements, you can read the
[UI documentation](https://www.audicom.at/public/documentation_UI.pdf).
The basic html/javascript template is available in
[index.html](https://github.com/AnTxXx/Engine/tree/cleanup/index.html)
Copy this template to e.g. `newgame.html`. Find the last `<script>`-tag in this file.
It contains the game code.

To learn coding a game, you can look at examples in
[ui/js/IAudiCom.js](https://github.com/AnTxXx/Engine/blob/cleanup/ui/js/IAudiCom.js#L1533)
in the lines below 1533.

Generally it works like that:

1. Create a room, save its ID, and add it to the *global game area*. The vectors for creating an
[src/AGRoom.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGRoom.js#L140)
are: `size` of the room and `position` of the room in the overall grid (the game 'map'):

        var room_1 = new AGRoom("First Room", new Vector3(20.0, 2.5, 12.0), new Vector3(10.0, 0.0, 10.0));
        var room_1ID = getIdByReference(room_1);
        g_gamearea.addRoom(room_1ID);

2. Create a player and save the players ID. The player has to be added to the room using the add method. The player
additionally has to be assigned to the `game area listener` and the `room listener`. The three vectors for creating
an [src/AGPlayer.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGPlayer.js#L25)
are: `position`, `direction`, and `size`. It automatically uses the following sprite:
[ui/img/player.svg](https://github.com/AnTxXx/Engine/blob/cleanup/ui/img/player.svg)

        var player = new AGPlayer("Player", new Vector3(1, 1.0, 2), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
        var playerID = getIdByReference(player);
        g_gamearea.listener = playerID;
        getReferenceById(room_1ID).listener = playerID;
        getReferenceById(room_1ID).add(playerID);

3. Create the goal object and save its ID. The three vectors for creating
an [src/AGRoomExit.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGRoomExit.js#L16)
are: `position`, `direction`, and `size`. It automatically uses the following sprite:
[ui/img/player.svg](https://github.com/AnTxXx/Engine/blob/cleanup/ui/img/exit.svg)

        var exit = new AGRoomExit("Exit", new Vector3(18.5, 1.0, 5.0), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
        var exitID = getIdByReference(exit);

4. Create [src/AGObject.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGObject.js#L25)
, save their IDs and place them in the *game area* by setting the vectors: `position`, `direction`, `size`. By
assigning the tag `"WALL"`, `"ENEMY"` and `"WATERFAL""` automatically uses the assets in the folder
[ui/img](https://github.com/AnTxXx/Engine/blob/cleanup/ui/img).

        var wall1 = new AGObject("Wand unten", new Vector3(14, 1.0, 6.7), new Vector3(1, 0, 0), new Vector3(12, 1, 0.5));
        var wall1_ID = wall1.ID;
        getReferenceById(wall1_ID).tag = "WALL";

        var enemy1 = new AGObject("Gegner 1", new Vector3(6.3, 1.0, 2.4), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
        var enemy1_ID = enemy1.ID;
        getReferenceById(environmental1_ID).tag = "WATERFALL";

        var environmental1 = new AGObject("Wasserfall", new Vector3(19.3, 1.0, 2.1), new Vector3(1, 0, 0), new Vector3(1, 1, 1));
        var environmental1_ID = environmental1.ID;
        getReferenceById(enemy1_ID).tag = "ENEMY";

        getReferenceById(room_1ID).add(wall1_ID);
        getReferenceById(room_1ID).add(enemy1_ID);
        getReferenceById(room_1ID).add(environmental1_ID);

5. Create [src/AGSoundSource.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGSoundSource.js#L159),
save their IDs. For the `ouch` and the `magic_exit` we additionally add tags, and have to add the exit sound
source to the exit object.

        var ouch = new AGSoundSource("Ouch", "sounds/ouch.wav", false, 1, room_1ID);
        var ouchID = getIdByReference(ouch);
        getReferenceById(ouchID).tag = "OUCH";

        var enemy1_ss = new AGSoundSource("Monster", "sounds/monster.wav", true, 1, room_1ID);
        var enemy1_ss_ID = enemy1_ss.ID;

        var environmental1SS = new AGSoundSource("Wasserfall Sound", "sounds/waterfall.wav", true, 1, room_1ID);
        var environmental1SS_ID = environmental1SS.ID;

        var magic_exit = new AGSoundSource("Magic", "sounds/magic.wav", true, 1, room_1ID);
        var magic_exit_ID = getIdByReference(magic_exit);
        getReferenceById(magic_exit_ID).tag = "MAGIC";
        getReferenceById(exitID).addSoundSource(magic_exit_ID);

6. Now set the player settings. By setting the `hitSound` the sound source is linked to the player.
It is `dangerous` to enemies and `movable`. To learn about other settings like `damage` and `range`
read about in [src/AGPlayer.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGPlayer.js).
`dangerous` objects can not pass `collidable` objects.

        //Player Settings
        getReferenceById(playerID).setSpeedSkalar(2);
        getReferenceById(playerID).hitSound = ouchID;
        getReferenceById(playerID).movable = true;

        getReferenceById(playerID).dangerous = true;
        getReferenceById(playerID).damage = 1;
        getReferenceById(playerID).range = 7;

7. Now set the enemy settings. By setting the `setAliveSound` the sound source is linked to the enemy.
It is `destructible` by a player, `movable` and `collidable` with the walls. To learn about other
settings like `health` or `deathSound` read about it in
[src/AGObject.js](https://github.com/AnTxXx/Engine/blob/cleanup/src/AGObject.js).

        getReferenceById(enemy1_ID).destructible = true;
        getReferenceById(enemy1_ID).health = 1;
        getReferenceById(enemy1_ID).movable = false;
        getReferenceById(enemy1_ID).collidable = true;
        getReferenceById(enemy1_ID).setAliveSound = enemy1_ss_ID;

8. Now set the environmental settings. By calling `addSoundSource()` alternatively to setting `soundSource`
the sound source is linked to the environmental object. It is `collidable` with the enemies and the
player cannot pass through it:

        getReferenceById(environmental1_ID).addSoundSource(environmental1SS_ID);
        getReferenceById(environmental1_ID).collidable = false;

        getReferenceById(environmental2SS_ID).maxDistance = 4;
        getReferenceById(environmental2_ID).addSoundSource(environmental2SS_ID);
        getReferenceById(environmental2_ID).collidable = false;

9. Finally, start the room :)

        getReferenceById(room_1ID).live = true;

We did not explain events and tags in detail, you can learn about them in the examples in
[ui/js/IAudiCom.js](https://github.com/AnTxXx/Engine/blob/cleanup/ui/js/IAudiCom.js#L1533)
in the lines below 1533.