// recordはdatabaseから取得した値を入れておくクラス

// gamesテーブルに対応するrecord
export class GameRecord {
	constructor(private _id: number, private _startedAt: Date) {}

	get id() {
		return this._id;
	}
}
