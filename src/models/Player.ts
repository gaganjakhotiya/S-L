import { IMoveType, IDrawData } from '../types.d'
import { MAX_DRAW_VALUE } from '../constants'

export default class Player {
    private _history: IDrawData[] = []
    private _position: number = 0
    private _intermediatePosition: number = 0
    constructor(public readonly name: string) { }

    private setPosition(value = this._position) {
        this._position = this._intermediatePosition = value
    }

    private getHistory(indexFromTail: number) {
        return this._history[this._history.length - 1 - indexFromTail] || {} as IDrawData
    }

    getPosition() {
        return this._position
    }

    getIntermediatePosition() {
        return this._intermediatePosition
    }

    update(data: { drawnValue: number, newPosition: number, moveType: IMoveType }) {
        const isOnStrike = this.isOnStrike()
        this._history.push({ ...data })
        if (data.moveType === 'roll-again') {
            if (isOnStrike) {
                this.setPosition()
                return true
            } else {
                this._intermediatePosition += data.drawnValue
                return false
            }
        } else {
            this.setPosition(data.newPosition)
            return true
        }
    }

    isOnStrike() {
        let count = 0
        for (let indexFromTail = 0; indexFromTail < this._history.length; indexFromTail++) {
            if (this.getHistory(indexFromTail).drawnValue !== MAX_DRAW_VALUE)
                break
            else
                count++
        }
        return count % 3 === 2
    }

    getLastDistanceCovered() {
        let total = this.getHistory(0).drawnValue
        if (total === MAX_DRAW_VALUE || typeof total === 'undefined') {
            // Is intermediate or triple-6 or first-turn. Either ways, zero.
            return 0
        } else {
            if (this.getHistory(1).drawnValue === MAX_DRAW_VALUE) {
                total += MAX_DRAW_VALUE
                if (this.getHistory(2).drawnValue === MAX_DRAW_VALUE) {
                    total += MAX_DRAW_VALUE
                }
            }
        }
        return total
    }

}