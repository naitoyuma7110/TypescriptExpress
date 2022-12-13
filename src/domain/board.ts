import { Move } from "./move";
import { Disc } from "./disc";
export class Board {
	constructor(private _disc: Disc[][]) {}

	place(move: Move): Board {
		// fieldは緒直接操作せずコピーを操作
		const newDiscs = this._disc.map((line) => {
			return line.map((disc) => {
				return disc;
			});
		});

		// 石を置く
		newDiscs[move.point.y][move.point.x] = move.disc;

		return new Board(newDiscs);
	}
}
