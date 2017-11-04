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

    public getActivePlayerData() {
        const activePlayer = this.unfinishedPlayers[this.activePlayerIndex]
        return activePlayer ? activePlayer.getJSON() : null
    }

    public getPlayers() {
        const activePlayer = this.unfinishedPlayers[this.activePlayerIndex]
        return [...this.finishedPlayers, ...this.unfinishedPlayers].map(
            player => ({...player.getJSON(), active: activePlayer === player})
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
        const { drawnValue, newPosition, move } = this.board.draw(activePlayer.position)
        this.updatePlayerPosition(activePlayer, newPosition)

        if (this.activePlayerIndex + 1 >= this.unfinishedPlayers.length) {
            this.activePlayerIndex = 0
        } else {
            this.activePlayerIndex += 1
        }

        return {
            move,
            drawnValue,
            newPosition,
            playerData: activePlayer.getJSON(),
            rank: this.finishedPlayers.length,
            completed: this.unfinishedPlayers.length === 0,
        }
    }

    public getWinner(position: number) {
        return this.finishedPlayers[position - 1]
    }
}
