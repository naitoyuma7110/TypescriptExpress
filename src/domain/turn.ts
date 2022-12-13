import { Point } from "./point";
import { Board } from "./board";
import { Move } from "./move";
import { Disc } from "./disc";

export class Turn {
	constructor(
		private _gameId: number,
		private _turnCount: number,
		private _nextDisc: Disc,
		private _move: Move,
		private _board: Board,
		private _endAt: Date
	) {}

	placeNext(disc: Disc, point: Point): Turn {
		// 打とうとした石が次の石ではない場合、置くことはできない
		if (disc !== this._nextDisc) {
			throw new Error("Invalid Disc");
		}

		const move = new Move(disc, point);

		const nextBoard = this._board.place(move);

		// 次の石が置けない場合はスキップ
		const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark;

		return new Turn(
			this._gameId,
			this._turnCount,
			nextDisc,
			move,
			nextBoard,
			new Date()
		);
	}
}
