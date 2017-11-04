import * as React from 'react'

import GameModel from '../models/Game'
import createNewGame from '../GameFactory'

import Board from './Board'
import Players from './Players'

interface IProps {

}

interface IState {
    status: 'init' | 'playing'
    game: GameModel
    lastDraw: string
    players: string[]
}

export default class Game extends React.Component<IProps, IState> {

    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    getInitialState(): IState {
        return {
            status: 'init',
            game: null,
            players: null,
            lastDraw: null,
        }
    }

    handleStartNewGame = () => {
        this.setState(this.getInitialState)
    }

    handleRestart = () => {
        const { players } = this.state

        this.setState({
            game: createNewGame(players),
            lastDraw: null,
        })
    }

    handleDraw = () => {
        const { game } = this.state
        const { drawnValue, move } = game.playNextTurn()

        this.setState({
            lastDraw: `${drawnValue} (${move})`
        })
    }

    setupPlayers = (players: string[]) => {
        this.setState({
            players,
            status: 'playing',
            game: createNewGame(players),
        })
    }

    render() {
        const { game, status, lastDraw } = this.state
        const getPlayersName = status === 'init'
        const players = game && game.getPlayers()
        const activePlayer = game && game.getActivePlayerData()

        return (
            <div>
                <h2>Snake and Ladder</h2>

                {getPlayersName ? (
                    <Players onFinish={this.setupPlayers} />
                ) : (
                    <div>
                        <ul>
                            {players.map(
                                (player, index) => (
                                    <li key={index} className={player.active ? 'active' : ''}>
                                        <span>{player.name} : {player.position}</span>
                                        {player.position !== game.board.size && (
                                            <span> (Perfect Draw: {game.board.getNextBestMove(player.position)})</span>
                                        )}
                                    </li>
                                )
                            )}
                        </ul>

                        {lastDraw && (
                            <p>Last Draw: {lastDraw}</p>
                        )}

                        {activePlayer && (
                            <button onClick={this.handleDraw}>
                                Rolldice: {activePlayer.name}
                            </button>
                        )}

                        <button onClick={this.handleRestart}>Restart Game</button>
                        <button onClick={this.handleStartNewGame}>Start New Game</button>
                        <Board
                            length={game.board.length}
                            breadth={game.board.breadth}
                            wormholes={game.board.getWormholesMap()}
                        />
                    </div>
                )}

            </div>
        )
    }
}