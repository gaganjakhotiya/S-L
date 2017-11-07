import Player from './Player'

import { rolldice } from '../utils'
import { MAX_DRAW_VALUE } from '../constants'
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

    public getNextBestMove(player: Player) {
        const fromPosition = player.getIntermediatePosition()
        const isPlayerOnStrike = player.isOnStrike()
        const nextBestLadderPosition = this.getNextBestLadder(fromPosition)
        const distanceFromNextBestLadder = nextBestLadderPosition - fromPosition

        if (distanceFromNextBestLadder > 0 && (
            distanceFromNextBestLadder < MAX_DRAW_VALUE ||
            (distanceFromNextBestLadder === MAX_DRAW_VALUE && !isPlayerOnStrike))
        ) {
            return distanceFromNextBestLadder
        }

        return this.getNextBestSafePosition(fromPosition, isPlayerOnStrike)
    }

    private getNextBestSafePosition(fromPosition: number, isPlayerOnStrike: boolean) {
        const potentialSnakeBitePositions = this.getPotentialSnakeBitePositions(fromPosition)

        if (isPlayerOnStrike && potentialSnakeBitePositions[0] !== MAX_DRAW_VALUE) {
            potentialSnakeBitePositions.unshift(fromPosition + MAX_DRAW_VALUE)
        }

        let longestDistance = MAX_DRAW_VALUE
        for (const threatfulPosition of potentialSnakeBitePositions) {
            if (longestDistance !== threatfulPosition - fromPosition)
                return longestDistance
            longestDistance--
        }
        return longestDistance
    }

    private getPotentialSnakeBitePositions(fromPosition: number) {
        return this.getAllWormholes().filter(
            node => node.type === WormholeType.SNAKE
                && node.from > fromPosition
                && node.from - fromPosition <= MAX_DRAW_VALUE
        ).map(
            node => node.from
        ).sort(
            (a, b) => a < b ? 1 : -1
        )
    }

    private getNextBestLadder(fromPosition: number) {
        return this.getAllWormholes().filter(
            node => node.from > fromPosition && node.type === WormholeType.LADDER
        ).sort(
            (a, b) => (a.to - a.from) < (b.to - b.from) ? 1 : -1
        ).reduce(
            (lastPosition, node, index) => node.from < lastPosition ? node.from : lastPosition,
            this.size
        )
    }
}
