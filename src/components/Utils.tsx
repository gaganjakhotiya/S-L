import * as React from 'react'
import GameModel from '../models/Game'
import PlayerModel from '../models/Player'
import { IDrawData } from '../types.d'
import { MAX_DRAW_VALUE } from '../constants'

export function DrawMessage({ drawData }: { drawData: IDrawData }) {
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

export function PlayersSummary({ game }: {game: GameModel}) {
    return (
        <div>
            <p>Players Summary</p>
            <ul>
                {game.getPlayers().map(
                    ({ player, active }, index) => (
                        <li key={index} className={active ? 'active' : ''}>
                            <span>{player.name} : {player.getPosition()}</span>
                            {game.getActivePlayer() === player && (
                                <span> (Perfect Draw: {game.board.getBestMovesList(player).map(
                                    (draws, index) => <span key={index} className="draws-border">{draws.toString()}</span>
                                )})</span>
                            )}
                        </li>
                    )
                )}
            </ul>
        </div>
    )
}

export function PlayerSticker({ player }: { player: PlayerModel }) {
    return <div className="player">{player.name.substr(0, 2)}</div>
}
