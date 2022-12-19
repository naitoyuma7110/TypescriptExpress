import { WinnerDisc } from "./../gameResult/winnerDisc";
import { DomainError } from "./../../error/domainError";
import { Point } from "./point";
import { Board } from "./board";
import { Move } from "./move";
import { Disc } from "./disc";
import { initialBoard } from "./board";

export class Turn {
	constructor(
		private _gameId: number,
		private _turnCount: number,
		private _nextDisc: Disc | undefined,
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

		// 次の石が置けない場合はスキップして次の石は同じ色
		const nextDisc = this.decideNextDisc(nextBoard, disc);

		return new Turn(
			this._gameId,
			this._turnCount + 1,
			nextDisc,
			move,
			nextBoard,
			new Date()
		);
	}

	// publicメソッドからTurnモデルにアクセス
	gameEnded(): boolean {
		return this._nextDisc === undefined;
	}

	WinnerDisc(): WinnerDisc {
		const darkCount = this._board.count(Disc.Dark);
		const lightCount = this._board.count(Disc.Light);

		if (darkCount === lightCount) {
			return WinnerDisc.Draw;
		} else if (darkCount > lightCount) {
			return WinnerDisc.Dark;
		} else {
			return WinnerDisc.Light;
		}
	}

	private decideNextDisc(board: Board, previousDisc: Disc): Disc | undefined {
		// boardから次に白または黒が打てるか判定
		const existDarkValidMove = board.existValidMove(Disc.Dark);
		const existLightValidMove = board.existValidMove(Disc.Light);

		if (existDarkValidMove && existLightValidMove) {
			// 両方置ける場合
			return previousDisc === Disc.Dark ? Disc.Light : Disc.Dark;
		} else if (!existDarkValidMove && !existLightValidMove) {
			// 両方置けない場合
			return undefined;
		} else if (existDarkValidMove) {
			// 片方(黒)しか置けない場合
			return Disc.Dark;
		} else {
			// 片方(白)しか置けない場合
			return Disc.Light;
		}
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
