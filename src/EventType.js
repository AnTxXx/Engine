// @flow
const triggerVals = Object.freeze({
    ONDEATH: 'ONDEATH',
    ONCONTACT: 'ONCONTACT',
    ONSIGHT: 'ONSIGHT',
})

const actionVals = Object.freeze({
    ADD: 'ADD',
    REMOVE: 'REMOVE',
    MOVE: 'MOVE',
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    WINGAME: 'WINGAME',
})

//TODO Create Trigger for WINGAME
//TODO Create "Trigger" for Amount of Items reached

export type Trigger = $Values<typeof triggerVals>;
export type Action = $Values<typeof actionVals>;