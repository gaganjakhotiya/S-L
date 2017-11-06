import Board from './Board'
import Player from './Player'
import { IDrawData } from '../types.d'

export default class Game {
    private activePlayerIndex = 0
    private finishedPlayers: Player[] = []
    private unfinishedPlayers: Player[]
    public playersMap: {[position: number]: Player[]} = {}

    constructor(
        public readonly board: Board,
        players: Player[],
    ) {
        this.unfinishedPlayers = players.slice()
        board.lock()
    }

    public getStatus(): 'finished' | 'in_progess' {
        return this.unfinishedPlayers.length === 0 ? 'finished' : 'in_progess'
    }

    public getActivePlayer() {
        return this.unfinishedPlayers[this.activePlayerIndex]
    }

    public getPlayers() {
        const activePlayer = this.getActivePlayer()
        return [...this.finishedPlayers, ...this.unfinishedPlayers].map(
            player => ({ player, active: activePlayer === player })
        )
    }

    private updatePlayer(player: Player, drawData: IDrawData) {
        const rotateStrike = player.update(drawData)
        if (rotateStrike && player.getPosition() === this.board.size) {
            this.finishedPlayers.push(player)
            this.unfinishedPlayers.splice(this.activePlayerIndex, 1)
        }
        return rotateStrike
    }

    private rotateStrike() {
        if (this.activePlayerIndex + 1 >= this.unfinishedPlayers.length) {
            this.activePlayerIndex = 0
        } else {
            this.activePlayerIndex += 1
        }
    }

    private updatePlayerMap(player: Player, drawData: IDrawData) {
        if (drawData.standingPosition !== 0) {
            const players = this.playersMap[drawData.standingPosition]
            players.splice(players.indexOf(player), 1)
        }
        ;(this.playersMap[drawData.newPosition] =
            this.playersMap[drawData.newPosition] || []).push(player)
    }

    public playNextTurn() {
        const player = this.getActivePlayer()
        const drawData = this.board.draw(player)
        const rotateStrike = this.updatePlayer(player, drawData)

        if (rotateStrike) {
            this.rotateStrike()
            this.updatePlayerMap(player, drawData)
        }

        return drawData
    }

    public getWinner(position: number) {
        return this.finishedPlayers[position - 1]
    }
}
