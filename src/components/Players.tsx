import * as React from 'react'

const MINIMUM_PLAYERS = 2

interface IProps {
    onFinish: (players: string[]) => void
}

interface IState {
    players: string[]
    error?: string
}

export default class PlayersList extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = {
            players: new Array(MINIMUM_PLAYERS).fill('')
        }
    }

    isValid(showError = false) {
        const isValid = this.state.players.every(
            name => /^[a-zA-Z ]{2,30}$/.test(name)
        )

        showError && !isValid && this.setState({
            error: 'Please enter at least 2 letters name'
        })

        return isValid
    }

    handleChange(index: number, event) {
        const players = this.state.players.slice()
        players[index] = event.target.value
        this.setState({
            players,
            error: null
        })
    }

    handleAdd = () => {
        const { players } = this.state
        this.setState({
            players: [...players, '']
        })
    }

    handleDelete = () => {
        const players = this.state.players.slice()
        players.splice(-1)
        this.setState({ players })
    }

    handleFinish = () => {
        if (!this.isValid(true)) return

        this.props.onFinish(this.state.players)
    }

    render() {
        const { players, error } = this.state
        const showDeleteButton = players.length > MINIMUM_PLAYERS

        return (
            <div>
                <h3>Add Players</h3>
                {players.map(
                    (name, index) => (
                        <input
                            key={index}
                            value={name}
                            onChange={this.handleChange.bind(this, index)}
                        />
                    )
                )}
                {!!error && (
                    <p>{error}</p>
                )}
                <button onClick={this.handleAdd}>Add A Player</button>
                {showDeleteButton && (
                    <button onClick={this.handleDelete}>Delete A Player</button>
                )}
                <button onClick={this.handleFinish}>Start Game</button>
            </div>
        )
    }
}