import Player from './Player'

import { rolldice } from '../utils'
import { MAX_DRAW_VALUE, MAX_SIMPLE_MOVE } from '../constants'
import { IMoveType, IDrawData } from '../types.d'

type IWormhole = {
    to: number
    from: number
    type: WormholeType
}

export enum WormholeType {
    SNAKE,
    LADDER,
}

export default class Board {
    public readonly size
    private _lock = false
    private wormholesFromMap: { [from: number]: number } = {}
    private wormholesToMap: { [to: number]: number } = {}

    constructor(
        public readonly length: number,
        public readonly breadth: number
    ) {
        if (length < 1 || breadth < 1)
            throw "Invalid board dimension"
        this.size = length * breadth
    }

    public lock() {
        this._lock = true
    }

    public getWormholesFromMap() {
        return { ...this.wormholesFromMap }
    }

    public getWormholesToMap() {
        return { ...this.wormholesToMap }
    }

    public getAllWormholes(): IWormhole[] {
        return Object.keys(this.wormholesFromMap).map(
            (from, index) => ({
                from: Number(from),
                to: this.wormholesFromMap[from],
                type: from < this.wormholesFromMap[from]
                    ? WormholeType.LADDER
                    : WormholeType.SNAKE
            })
        )
    }

    public addWormhole(from: number, to: number) {
        if (this._lock)
            throw `Cannot add wormholes anymore, board is locked.`
        if (from < 1 || from > this.size)
            throw `Wormhole start position out of bound: ${from}`
        if (to < 1 || to > this.size)
            throw `Wormhole end position out of bound: ${to}`
        if (typeof this.wormholesFromMap[from] !== 'undefined')
            throw `Multiple wormholes from position: ${from}`
        if (typeof this.wormholesFromMap[to] !== 'undefined')
            throw `Wormholes overlapping at end position: ${to}`

        this.wormholesFromMap[from] = to
        this.wormholesToMap[to] = from

        return this
    }

    private getMoveType(drawnValue: number, fromPosition: number, newPosition: number): IMoveType {
        const distanceCovered = newPosition - fromPosition
        return distanceCovered === 0
            ? 'skip'
            : newPosition === this.size
                ? 'draw'
                : drawnValue === MAX_DRAW_VALUE
                    ? 'roll-again'
                    : distanceCovered === drawnValue
                        ? 'draw'
                        : distanceCovered > 0
                            ? 'ladder'
                            : 'snake'
    }

    private getNewPosition(drawnValue: number, fromPosition: number) {
        const newStep = fromPosition + drawnValue
        return newStep > this.size
            ? fromPosition
            : newStep === this.size
                ? newStep
                : drawnValue === MAX_DRAW_VALUE
                    ? newStep
                    : this.wormholesFromMap[newStep] || newStep
    }

    public draw(player: Player): IDrawData {
        const standingPosition = player.getPosition()
        const fromPosition = player.getIntermediatePosition()
        const drawnValue = rolldice(MAX_DRAW_VALUE)
        const newPosition = this.getNewPosition(drawnValue, fromPosition)
        const moveType = this.getMoveType(drawnValue, fromPosition, newPosition)

        return {
            moveType,
            drawnValue,
            newPosition,
            standingPosition,
        }
    }

    private getBestPath(from: number, maxMove: number, visitedNodes: { [from: number]: number } = {}, draws = []) {
        if (this.size - from <= maxMove) {
            return [...draws, this.size - from]
        }

        let maxDrawnSteps = Number.POSITIVE_INFINITY
        return this.getPotentialForksInPath(from, maxMove, visitedNodes).reduce((bestDraws, diff) => {
            const positionInFocus = from + diff
            const newPosition = this.wormholesFromMap[positionInFocus] || positionInFocus
            const newMaxMove = diff === MAX_DRAW_VALUE ? maxMove - MAX_DRAW_VALUE : MAX_SIMPLE_MOVE
            const newDrawsList = this.getBestPath(
                newPosition, newMaxMove, { ...visitedNodes, [positionInFocus]: newPosition }, [...draws, diff]
            )

            if (maxDrawnSteps > newDrawsList.length) {
                maxDrawnSteps = newDrawsList.length
                return newDrawsList
            } else {
                return bestDraws
            }
        }, draws)
    }

    private getPotentialForksInPath(from: number, maxMove: number, visitedNodes: { [from: number]: number }) {
        const potentialForks = []

        let positionDifference = 1
        while (positionDifference <= maxMove && positionDifference + from <= this.size) {
            const positionInFocus = from + positionDifference
            if (!visitedNodes[positionInFocus] &&
                (positionDifference === maxMove ||
                    (positionDifference !== MAX_DRAW_VALUE &&
                        this.wormholesFromMap[positionInFocus] !== undefined))) {
                potentialForks.push(positionDifference)
            }
            positionDifference++
        }

        return potentialForks
    }

    public getBestMovesList(player: Player) {
        const from = player.getIntermediatePosition()
        const maxMove = MAX_SIMPLE_MOVE - (player.getPreviousScoresInARowCount() * MAX_DRAW_VALUE)
        return this.getBestPath(from, maxMove).map(number => {
            const draws = []
            while (number > 6) {
                draws.push(6)
                number -= 6
            }
            number && draws.push(number)
            return draws
        })
    }
}
