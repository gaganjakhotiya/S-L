export type IMoveType = 'skip' | 'draw' | 'snake' | 'ladder' | 'roll-again'

export interface IDrawData {
    moveType: IMoveType
    drawnValue: number
    newPosition: number
}
