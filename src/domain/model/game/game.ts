export class Game {
	constructor(private _id: number | undefined, private _startedAt: Date) {}
	get startedAt() {
		return this._startedAt;
	}
	get id() {
		return this._id;
	}
}
