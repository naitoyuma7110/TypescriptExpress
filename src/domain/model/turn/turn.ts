import { DomainError } from "./../../error/domainError";
import { Point } from "../../point";
import { Board } from "../../board";
import { Move } from "../../move";
import { Disc } from "../../disc";
import { initialBoard } from "../../board";

export class Turn {
	constructor(
		private _gameId: number,
		private _turnCount: number,
		private _nextDisc: Disc,
		private _move: Move | undefined,
		private _board: Board,
		private _endAt: Date
	) {}

	placeNext(disc: Disc, point: Point): Turn {
		// 打とうとした石が次の石ではない場合、置くことはできない
		if (disc !== this._nextDisc) {
			throw new DomainError(
				"SelectedDiscIsNotNextDisc",
				"Selected disc is not next disc"
			);
		}

		const move = new Move(disc, point);

		const nextBoard = this._board.place(move);

		// 次の石が置けない場合はスキップ

		const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark;

		return new Turn(
			this._gameId,
			this._turnCount + 1,
			nextDisc,
			move,
			nextBoard,
			new Date()
		);
	}
	get gameId() {
		return this._gameId;
	}
	get turnCount() {
		return this._turnCount;
	}
	get nextDisc() {
		return this._nextDisc;
	}
	get endAt() {
		return this._endAt;
	}
	get board() {
		return this._board;
	}
	get move() {
		return this._move;
	}
}

export function firstTurn(gameId: number, endAt: Date): Turn {
	return new Turn(gameId, 0, Disc.Dark, undefined, initialBoard, endAt);
}