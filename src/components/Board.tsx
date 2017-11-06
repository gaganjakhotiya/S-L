import * as React from 'react'
import PlayerModel from '../models/Player'
import BoardModel from '../models/Board'


type IBoardBlock = {
    row: number
    col: number
    players: PlayerModel[]
    currentBlockNumber: number
    wormholeEndPosition: number
    wormholeStartPosition: number
}

interface IProps {
    board: BoardModel
    playersMap: {
        [position: number]: PlayerModel[]
    }
}


export default function Board(props: IProps) {
    const { board, playersMap } = props
    const wormholesFromMap = board.getWormholesFromMap()
    const wormholesToMap = board.getWormholesToMap()

    let blockRows = []
    let currentBlockNumber = board.length * board.breadth

    for (let row = 0; row < board.length; row++) {
        let blockCols = []
        for (let col = 0; col < board.breadth; col++) {
            const key = col
            const players = playersMap[currentBlockNumber]
            const wormholeEndPosition = wormholesFromMap[currentBlockNumber]
            const wormholeStartPosition = wormholesToMap[currentBlockNumber]
            const props = {
                key, row, col, players, currentBlockNumber, wormholeEndPosition, wormholeStartPosition
            }
            blockCols.push(<BoardBlock {...props} />)
            currentBlockNumber--
        }
        blockRows.push(
            <div key={row} className="block_row">
                {row % 2 === 0 ? blockCols : blockCols.reverse()}
            </div>
        )
    }

    return <div className="blocks">{blockRows}</div>
}

function BoardBlock(props: IBoardBlock) {
    const { row, col, players, currentBlockNumber, wormholeEndPosition, wormholeStartPosition } = props

    const className = wormholeStartPosition
        ? 'yellow'
        : wormholeEndPosition
            ? wormholeEndPosition - currentBlockNumber > 0 ? 'green' : 'red'
            : ''

    return (
        <div className={className}>
            <p>{currentBlockNumber}</p>
            {!!wormholeEndPosition && (
                <span>To {wormholeEndPosition}</span>
            )}
            {!!wormholeStartPosition && (
                <span>From {wormholeStartPosition}</span>
            )}
            {players && players.map(
                (player, i) => <PlayerSticker key={i} player={player} />
            )}
        </div>
    )
}

function PlayerSticker({ player }: { player: PlayerModel }) {
    return <div className="player">{player.name.substr(0, 2)}</div>
}
