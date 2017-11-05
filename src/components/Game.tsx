import * as React from 'react'

import { IMove } from '../models/Board'
import GameModel from '../models/Game'
import createNewGame from '../GameFactory'

import Board from './Board'
import Players from './Players'
import Dice from './Dice'

interface IProps {

}

interface IState {
    status: 'init' | 'playing'
    game: GameModel
    lastDraw: number
    players: string[]
    move?: IMove
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
            move,
            lastDraw: drawnValue,
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
        const { game, status, lastDraw, move } = this.state
        const getPlayersName = status === 'init'
        const players = game && game.getPlayers()
        const activePlayer = game && game.getActivePlayerData()

        return (
            <div>
                <h2>Snake and Ladder</h2>

                {getPlayersName ? (
                    <Players onFinish={this.setupPlayers} />
                ) : (
                    <div className="game-pad">
                        <div className="fly-left controls">
                            <p>Players</p>
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

                            <Dice onClick={this.handleDraw} value={lastDraw}/>

                            <MoveMessage move={move} drawnValue={lastDraw} />

                            <div className="button-group">
                                <button onClick={this.handleRestart}>Restart Game</button>
                                <button onClick={this.handleStartNewGame}>Start New Game</button>
                            </div>
                        </div>
                        <div className="fly-right">
                            <Board
                                length={game.board.length}
                                breadth={game.board.breadth}
                                wormholes={game.board.getWormholesMap()}
                            />
                        </div>
                    </div>
                )}

            </div>
        )
    }
}

function MoveMessage({move, drawnValue}: {move: IMove, drawnValue: number}) {
    const message = (function(){
        if (!drawnValue)
            return null
        switch (move) {
            case 'draw': return `Moved by ${drawnValue} step(s).`
            case 'skip': return `Didn't move.`
            case 'snake': return `Got bitten by snake`
            case 'ladder': return `Took a ladder`
            default: return null
        }
    }())
    return <div className="message">{message}</div>
}