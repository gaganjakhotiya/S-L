import * as React from 'react'
import { rolldice } from '../utils'

interface IProps {
    value?: number
    maxValue?: number
    onClick?: () => void
}

interface IState {
    rollInterval?: number
}

function getUpdatedInterval(lastInterval = 0) {
    return lastInterval + (100 / ((lastInterval || 100) / 100))
}

export default class Dice extends React.Component<IProps, IState> {

    private timer: number

    static defaultProps = {
        maxValue: 6,
    }

    constructor() {
        super()
        this.state = {}
    }

    componentWillReceiveProps(nextProps: IProps) {
        // On restart, clear the last rolling dice
        nextProps.value === null && window.clearTimeout(this.timer)
        // On receiving drawn value, stop rolling dice
        this.setState({
            rollInterval: null
        })
    }

    handleClick = () => {
        const { rollInterval } = this.state
        const updatedRollInterval = getUpdatedInterval(rollInterval)
        const newRollInterval = updatedRollInterval < 350 ? updatedRollInterval : null

        if (newRollInterval) {
            this.timer = window.setTimeout(this.handleClick, newRollInterval)
            this.setState({
                rollInterval: newRollInterval
            })
        } else {
            this.props.onClick()
        }
    }

    render() {
        const { value, maxValue } = this.props
        const { rollInterval } = this.state
        const faceValue = rollInterval ? rolldice(maxValue) : value || 0

        return (
            <svg
                onClick={rollInterval ? null : this.handleClick}
                className="icon"
                dangerouslySetInnerHTML={{ __html: `<use xlink:href="#dice-${faceValue}" />` }}
            />
        )
    }
}