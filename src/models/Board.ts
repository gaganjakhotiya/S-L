import { rolldice } from '../utils'

type IWormhole = {
    to: number
    from: number
    type: WormholeType
}

export type IMove = 'skip' | 'draw' | 'snake' | 'ladder'

const MAX_DRAW_VALUE = 6

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

    public draw(standingPosition: number) {
        const drawnValue = rolldice(MAX_DRAW_VALUE)

        let newPosition = standingPosition + drawnValue
        if (newPosition > this.size)
            newPosition = standingPosition
        else
            newPosition = this.wormholes[newPosition] || newPosition

        const distanceCovered = newPosition - standingPosition
        const move: IMove = distanceCovered === drawnValue
            ? 'draw'
            : distanceCovered === 0
                ? 'skip'
                : distanceCovered > 0
                    ? 'ladder'
                    : 'snake'

        return {
            move,
            drawnValue,
            newPosition,
        }
    }

    public getNextBestMove(standingPosition: number) {
        const nextBestLadderPosition = this.getNextBestLadder(standingPosition)
        const distanceFromNextBestLadder = nextBestLadderPosition - standingPosition
        if (distanceFromNextBestLadder <= MAX_DRAW_VALUE && distanceFromNextBestLadder > 0)
            return distanceFromNextBestLadder
        return this.getNextSafePosition(standingPosition)
    }

    private getNextSafePosition(standingPosition: number) {
        const potentialSnakeBitePositions = this.getAllWormholes().filter(
            node => node.type === WormholeType.SNAKE
                && node.from > standingPosition
                && node.from - standingPosition <= MAX_DRAW_VALUE
        ).map(
            node => node.from
        ).sort(
            (a, b) => a < b ? 1 : -1
        )

        let longestDistance = MAX_DRAW_VALUE
        for (const threatfulPosition of potentialSnakeBitePositions) {
            if (longestDistance !== threatfulPosition - standingPosition)
                return longestDistance
            longestDistance--
        }
        return longestDistance
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
