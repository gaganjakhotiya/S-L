import * as React from 'react'

import { IMoveType, IDrawData } from '../types.d'
import GameModel from '../models/Game'
import createNewGame from '../GameFactory'

import { MAX_DRAW_VALUE } from '../constants'

import Board from './Board'
import Players from './Players'
import Dice from './Dice'

interface IProps {

}

interface IState {
    status: 'init' | 'playing'
    game: GameModel
    lastDrawData: IDrawData
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
            lastDrawData: {} as any,
        }
    }

    handleStartNewGame = () => {
        this.setState(this.getInitialState)
    }

    handleRestart = () => {
        this.setState({
            game: createNewGame(this.state.players),
            lastDrawData: {} as any,
        })
    }

    handleDraw = () => {
        this.setState({
            lastDrawData: this.state.game.playNextTurn()
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
        const { game, status, lastDrawData } = this.state
        const getPlayersName = status === 'init'
        const activePlayer = game && game.getActivePlayer()
        const players = game && game.getPlayers()
        const playersMap = game && game.playersMap

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
                                        ({ player, active }, index) => (
                                            <li key={index} className={active ? 'active' : ''}>
                                                <span>{player.name} : {player.getPosition()}</span>
                                                {player.getPosition() !== game.board.size && (
                                                    <span> (Perfect Draw: {game.board.getNextBestMove(player)})</span>
                                                )}
                                            </li>
                                        )
                                    )}
                                </ul>

                                <Dice onClick={this.handleDraw} value={lastDrawData.drawnValue} />

                                <MoveMessage drawData={lastDrawData} />

                                <div className="button-group">
                                    <button onClick={this.handleRestart}>Restart Game</button>
                                    <button onClick={this.handleStartNewGame}>Start New Game</button>
                                </div>
                            </div>
                            <div className="fly-right">
                                <Board
                                    board={game.board}
                                    playersMap={playersMap}
                                />
                            </div>
                        </div>
                    )}

            </div>
        )
    }
}

function MoveMessage({ drawData }: { drawData: IDrawData }) {
    const distanceCovered = (drawData.newPosition || 0) - (drawData.standingPosition || 0)
    const message = (function () {
        if (distanceCovered === 0 && drawData.moveType !== 'skip')
            return null
        switch (drawData.moveType) {
            case 'draw': return `Moved by ${distanceCovered} step(s).`
            case 'skip': return `Didn't move.`
            case 'roll-again': return `Scored a ${MAX_DRAW_VALUE}. Roll again!`
            case 'snake': return `Got bitten by a snake. Down by ${-distanceCovered}.`
            case 'ladder': return `Took a ladder. Up by ${distanceCovered}.`
            default: return null
        }
    }())
    return <div className="message">{message}</div>
}
