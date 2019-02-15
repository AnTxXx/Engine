declare module "resonance-audio" {
    // The export of this module is an object with a "concatPath" method
    //declare module.exports: {
    //    ResonanceAudio(context: AudioContext): Object;
    //}

    declare function ResonanceAudio(context:AudioContext): Object;
    declare module.exports: typeof ResonanceAudio;
}

