// @flow

const values = Object.freeze({
    PLAYER: "PLAYER",
    SOUNDSOURCE: 'SOUNDSOURCE',
    GAMEAREA: "GAMEAREA",
    OBJECT: "OBJECT",
    PORTAL: "PORTAL"
});

export type Type = $Values<typeof values>;
