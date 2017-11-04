export type IPlayerData = {
    name: string
    position: number
}

export default class Player {
    public position: number = 0
    constructor(public readonly name: string) { }

    getJSON(): IPlayerData {
        const { name, position } = this
        return { name, position }
    }
}