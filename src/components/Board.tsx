import * as React from 'react'
import Player from '../models/Player'


interface IProps {
    length: number
    breadth: number
    playersMap: { [position: number]: Player[] }
    wormholes: { [from: number]: number }
}

export default function Board(props: IProps) {
    const { length, breadth, wormholes, playersMap } = props
    const wormholesReverseMap = Object.keys(props.wormholes).reduce(
        (reverseMap, from, index) => ((reverseMap[props.wormholes[from]] = from), reverseMap), {}
    )

    let currentBlockNumber = length * breadth
    let blockRows = []

    for (let row = 0; row < length; row++) {
        let blockCols = []
        for (let col = 0; col < breadth; col++) {
            const key = col
            const players = playersMap[currentBlockNumber]
            const wormholeEndPosition = wormholes[currentBlockNumber]
            const wormholeStartPosition = wormholesReverseMap[currentBlockNumber]

            blockCols.push(
                <BoardBlock {...{
                    key,
                    row,
                    col,
                    players,
                    currentBlockNumber,
                    wormholeEndPosition,
                    wormholeStartPosition,
                }} />
            )

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


type IBoardBlock = {
    row: number
    col: number
    players: Player[]
    currentBlockNumber: number
    wormholeEndPosition: number
    wormholeStartPosition: number
}

function BoardBlock(props: IBoardBlock) {
    const {
        row,
        col,
        players,
        currentBlockNumber,
        wormholeEndPosition,
        wormholeStartPosition
    } = props

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


function PlayerSticker({ player }: { player: Player }) {
    return <div className="player">{player.name.substr(0, 2)}</div>
}
