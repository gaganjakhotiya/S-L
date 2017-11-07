import * as React from 'react'

import { IDrawData } from '../types.d'
import GameModel from '../models/Game'
import createNewGame from '../GameFactory'

import Board from './Board'
import Players from './Players'
import Dice from './Dice'
import { DrawMessage, PlayersSummary } from './Utils'

interface IState {
    game: GameModel
    players: string[]
    lastDrawData: IDrawData
    status: 'init' | 'playing' | 'finished'
}

export default class Game extends React.Component<any, IState> {

    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    getInitialState(): IState {
        return {
            status: 'init',
            game: null,
            players: null,
            lastDrawData: {} as any,
        }
    }

    handleStartNewGame = () => {
        this.setState(this.getInitialState)
    }

    handleRestart = () => {
        this.setState({
            status: 'playing',
            game: createNewGame(this.state.players),
            lastDrawData: {} as any,
        })
    }

    handleDraw = () => {
        const lastDrawData = this.state.game.playNextTurn()
        const status = this.state.game.getActivePlayer() === undefined ? 'finished' : 'playing'
        this.setState({ lastDrawData, status })
    }

    setupPlayers = (players: string[]) => {
        this.setState({
            players,
            status: 'playing',
            game: createNewGame(players),
        })
    }

    render() {
        const { game, status, lastDrawData } = this.state
        const getPlayerNames = status === 'init'
        const isGameActive = status === 'playing'

        return (
            <div>
                <h2>Snake and Ladder</h2>

                {getPlayerNames ? (
                    <Players onFinish={this.setupPlayers} />
                ) : (
                    <div className="game-pad">
                        <div className="fly-left controls">
                            <PlayersSummary game={game} />
                            {isGameActive && (
                                <Dice onClick={this.handleDraw} value={lastDrawData.drawnValue} />
                            )}
                            <DrawMessage drawData={lastDrawData} />
                            <div className="button-group">
                                <button onClick={this.handleRestart}>Restart Game</button>
                                <button onClick={this.handleStartNewGame}>Start New Game</button>
                            </div>
                        </div>
                        <div className="fly-right">
                            <Board board={game.board} playersMap={game.playersMap} />
                        </div>
                    </div>
                )}

            </div>
        )
    }
}
