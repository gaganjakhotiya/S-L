import Game from './models/Game'
import Board from './models/Board'
import Player from './models/Player'

const BOARD = new Board(10, 10)
BOARD
    .addWormhole(6, 30)
    .addWormhole(32, 14)
    .addWormhole(56, 23)
    .addWormhole(98, 42)
    .addWormhole(27, 90)
    .addWormhole(50, 78)
    .lock()

export default function createNewGame(playerNames: string[]) {
    return new Game(BOARD, playerNames.map(name => new Player(name)))
}
