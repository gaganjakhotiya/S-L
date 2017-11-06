import Board from './Board'
import Player from './Player'
import { IDrawData } from '../types.d'

export default class Game {
    private activePlayerIndex = 0
    private finishedPlayers: Player[] = []
    private unfinishedPlayers: Player[]

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

    public playNextTurn() {
        const player = this.getActivePlayer()
        const drawData = this.board.draw(player)

        this.updatePlayer(player, drawData) && this.rotateStrike()

        return {
            ...drawData,
            distanceCovered: player.getLastDistanceCovered(),
        }
    }

    public getWinner(position: number) {
        return this.finishedPlayers[position - 1]
    }
}
