import { DomainError } from "./error/domainError";
import { Point } from "./point";
import { Move } from "./move";
import { Disc, isOppositeDisc } from "./disc";
export class Board {
	private _walledDiscs: Disc[][];

	constructor(private _discs: Disc[][]) {
		this._walledDiscs = this.wallDiscs();
	}

	place(move: Move): Board {
		// 空のマス目ではない場合、置くことができない
		if (this._discs[move.point.y][move.point.x] !== Disc.Empty) {
			throw new DomainError(
				"SelectedPointIsNotEmpty",
				"Selected point is not empty"
			);
		}
		// moveによってひっくり返せる点をPoint型の配列で取得
		const flipPoints: Point[] = this.listFlipPoints(move);

		// ひっくり返せる点がない場合、置くことができない
		if (flipPoints.length === 0) {
			throw new DomainError("FlipPointIsEmpty", "Flip point is empty");
		}
		// fieldは直接操作せずコピーを操作
		const newDiscs = this._discs.map((line) => {
			return line.map((disc) => {
				return disc;
			});
		});

		// moveに応じて石を置く
		newDiscs[move.point.y][move.point.x] = move.disc;

		// flipPointsの石の色を変える、ひっくり返す
		flipPoints.forEach((p) => {
			newDiscs[p.y][p.x] = move.disc;
		});

		return new Board(newDiscs);
	}

	// moveに応じて、ひっくり返せる座標をPointオブジェクトで返す
	private listFlipPoints(move: Move): Point[] {
		const flipPoints: Point[] = [];

		// wall:番兵と呼ばれる走査アルゴリズムの定型
		// 			四隅に白、黒、空以外の値を持たせる事で走査終了の目印にしている

		// walled配列のtop,sideに3が入るから一個ずれる
		const walledX = move.point.x + 1;
		const walledY = move.point.y + 1;

		const checkFlipPoints = (xMove: number, yMove: number) => {
			// ひっくり返せる座標の配列
			const flipCandidate: Point[] = [];

			// 石を置いた場所から走査方向に1マスずらし最初にチェックする座標を決める
			let cursorX = walledX + xMove;
			let cursorY = walledY + yMove;

			// 手と逆の色の石がある間、1つずつ見ていく
			// isOppositeDiscは石の色情報に関する処理なのでDiscの担当
			while (isOppositeDisc(move.disc, this._walledDiscs[cursorY][cursorX])) {
				// ひっくり返せる条件を満たした座標
				flipCandidate.push(new Point(cursorX - 1, cursorY - 1));
				// 走査方向は引数によって決まる
				cursorX += xMove;
				cursorY += yMove;

				// 次の手が同色の石なら、ひっくり返す石が確定
				if (move.disc === this._walledDiscs[cursorY][cursorX]) {
					flipPoints.push(...flipCandidate);
					break;
				}
			}
		};

		checkFlipPoints(0, -1); // 上
		checkFlipPoints(1, -1); // 右上
		checkFlipPoints(1, 0); // 右
		checkFlipPoints(1, 1); // 右下
		checkFlipPoints(0, 1); // 下
		checkFlipPoints(-1, -1); // 左下
		checkFlipPoints(-1, 0); // 左
		checkFlipPoints(-1, 1); // 左上

		return flipPoints;
	}

	private wallDiscs(): Disc[][] {
		const walled: Disc[][] = [];

		//	[3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
		const topAndBottomWall = Array(this._discs[0].length + 2).fill(Disc.Wall);

		walled.push(topAndBottomWall);

		this._discs.forEach((line) => {
			// _discsの長さを問わず(lineの数を問わず)、配列の最初と最後を3に置き換える
			const walledLine = [Disc.Wall, ...line, Disc.Wall];
			walled.push(walledLine);
		});

		walled.push(topAndBottomWall);

		return walled;
	}

	get discs() {
		return this._discs;
	}
}

const E = Disc.Empty;
const D = Disc.Dark;
const L = Disc.Light;

const INITIAL_DISCS = [
	[E, E, E, E, E, E, E, E],
	[E, E, E, E, E, E, E, E],
	[E, E, E, E, E, E, E, E],
	[E, E, E, D, L, E, E, E],
	[E, E, E, L, D, E, E, E],
	[E, E, E, E, E, E, E, E],
	[E, E, E, E, E, E, E, E],
	[E, E, E, E, E, E, E, E],
];

export const initialBoard = new Board(INITIAL_DISCS);
