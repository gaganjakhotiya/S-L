import Board from './Board'
import Player, { IPlayerData } from './Player'

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
            player => ({player, active: activePlayer === player})
        )
    }

    private updatePlayerPosition(player: Player, position: number) {
        player.position = position
        if (player.position === this.board.size) {
            this.finishedPlayers.push(player)
            this.unfinishedPlayers.splice(this.activePlayerIndex, 1)
        }
    }

    public playNextTurn() {
        const activePlayer = this.unfinishedPlayers[this.activePlayerIndex]
        const { drawnValue, newPosition, moveType } = this.board.draw(activePlayer)
        this.updatePlayerPosition(activePlayer, newPosition)

        if (this.activePlayerIndex + 1 >= this.unfinishedPlayers.length) {
            this.activePlayerIndex = 0
        } else {
            this.activePlayerIndex += 1
        }

        return {
            moveType,
            drawnValue,
        }
    }

    public getWinner(position: number) {
        return this.finishedPlayers[position - 1]
    }
}
