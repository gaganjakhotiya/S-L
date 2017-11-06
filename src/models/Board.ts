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
    private wormholes: { [from: number]: number } = {}

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

    public getWormholesMap() {
        return { ...this.wormholes }
    }

    public getAllWormholes(): IWormhole[] {
        return Object.keys(this.wormholes).map(
            (from, index) => ({
                from: Number(from),
                to: this.wormholes[from],
                type: from < this.wormholes[from]
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
        if (typeof this.wormholes[from] !== 'undefined')
            throw `Multiple wormholes from position: ${from}`
        if (typeof this.wormholes[to] !== 'undefined')
            throw `Wormholes overlapping at end position: ${to}`

        this.wormholes[from] = to

        return this
    }

    public draw(player: Player): IDrawData {
        const standingPosition = player.getIntermediatePosition()
        const drawnValue = rolldice(MAX_DRAW_VALUE)

        let newPosition = standingPosition + drawnValue
        newPosition = newPosition > this.size
            ? standingPosition
            : this.wormholes[newPosition] || newPosition

        const distanceCovered = newPosition - standingPosition
        const moveType: IMoveType = drawnValue === MAX_DRAW_VALUE
            ? 'roll-again'
            : distanceCovered === drawnValue
                ? 'draw'
                : distanceCovered === 0
                    ? 'skip'
                    : distanceCovered > 0
                        ? 'ladder'
                        : 'snake'

        return {
            moveType,
            drawnValue,
            newPosition,
        }
    }

    public getNextBestMove(player: Player) {
        const standingPosition = player.getIntermediatePosition()
        const isPlayerOnStrike = player.isOnStrike()
        const nextBestLadderPosition = this.getNextBestLadder(standingPosition)
        const distanceFromNextBestLadder = nextBestLadderPosition - standingPosition

        if (distanceFromNextBestLadder > 0 && (
            distanceFromNextBestLadder < MAX_DRAW_VALUE ||
            (distanceFromNextBestLadder === MAX_DRAW_VALUE && !isPlayerOnStrike))
        ) {
            return distanceFromNextBestLadder
        }

        return this.getNextBestSafePosition(standingPosition, isPlayerOnStrike)
    }

    private getNextBestSafePosition(standingPosition: number, isPlayerOnStrike: boolean) {
        const potentialSnakeBitePositions = this.getPotentialSnakeBitePositions(standingPosition)

        if (isPlayerOnStrike && potentialSnakeBitePositions[0] !== MAX_DRAW_VALUE) {
            potentialSnakeBitePositions.unshift(standingPosition + MAX_DRAW_VALUE)
        }

        let longestDistance = MAX_DRAW_VALUE
        for (const threatfulPosition of potentialSnakeBitePositions) {
            if (longestDistance !== threatfulPosition - standingPosition)
                return longestDistance
            longestDistance--
        }
        return longestDistance
    }

    private getPotentialSnakeBitePositions(standingPosition: number) {
        return this.getAllWormholes().filter(
            node => node.type === WormholeType.SNAKE
                && node.from > standingPosition
                && node.from - standingPosition <= MAX_DRAW_VALUE
        ).map(
            node => node.from
            ).sort(
            (a, b) => a < b ? 1 : -1
            )
    }

    private getNextBestLadder(standingPosition: number) {
        return this.getAllWormholes().filter(
            node => node.from > standingPosition && node.type === WormholeType.LADDER
        ).sort(
            (a, b) => (a.to - a.from) < (b.to - b.from) ? 1 : -1
            ).reduce(
            (lastPosition, node, index) => node.from < lastPosition ? node.from : lastPosition,
            this.size
            )
    }
}
