import { DARK, INITIAL_BOARD, LIGHT } from "./../application/constants";
import { SquareGateway } from "./../dataaccess/squareGateway";
import { MoveGateway } from "./../dataaccess/moveGateway";
import { TurnGateway } from "./../dataaccess/turnGateway";
import { Gamegateway } from "./../dataaccess/gameGateway";
import { connectMySQL } from "../dataaccess/connection";

const gameGeteway = new Gamegateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

// 返り値クラスでリターン内容を明示する
class FindLatestGameTurnByCTurnCountOutput {
	constructor(
		private _turnCount: number,
		private _board: number[][],
		private _nextDisc: number | undefined,
		private _winnerDisc: number | undefined
	) {}
	get turnCount() {
		return this._turnCount;
	}
	get bord() {
		return this._board;
	}
	get nextDisc() {
		return this._nextDisc;
	}
	get winnerDisc() {
		return this._winnerDisc;
	}
}

export class TurnService {
	async findLatestGameTurnCount(
		turnCount: number
	): Promise<FindLatestGameTurnByCTurnCountOutput> {
		const conn = await connectMySQL();
		try {
			const gameRecord = await gameGeteway.findLatest(conn);
			if (!gameRecord) {
				throw new Error("Latest game not found");
			}
			// game_id,turnCountを指定してturn情報(Next)を取得
			const turnRecord = await turnGateway.findForGameIdAndTurnCount(
				conn,
				gameRecord.id,
				turnCount
			);
			if (!turnRecord) {
				throw new Error("Specified turn not found");
			}
			const record = await squareGateway.findForTurnId(conn, turnRecord.id);

			if (!record) {
				throw new Error("Square not found");
			}

			// 取得したSquareRecord型配列からbord配列を作成
			const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
			record.forEach((s) => {
				board[s.y][s.x] = s.disc;
			});

			return new FindLatestGameTurnByCTurnCountOutput(
				turnCount,
				board,
				turnRecord.nextDisc,
				undefined
			);
		} finally {
			await conn.end();
		}
	}

	async registerTurn(turnCount: number, disc: number, x: number, y: number) {
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			const gameRecord = await gameGeteway.findLatest(conn);
			if (!gameRecord) {
				throw new Error("Latest game not found");
			}
			// 1つ前のターン取得
			const previoustTurnCount = turnCount - 1;
			const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
				conn,
				gameRecord.id,
				previoustTurnCount
			);

			if (!previousTurnRecord) {
				throw new Error("Specified previousTurn not found");
			}

			const squareRecord = await squareGateway.findForTurnId(
				conn,
				previousTurnRecord.id
			);

			if (!squareRecord) {
				throw new Error("Square not found");
			}

			// 取得したSquareRecord型配列からbord配列を作成
			const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
			squareRecord.forEach((s) => {
				board[s.y][s.x] = s.disc;
			});

			// 1つ前の盤面情報を使って石を置けるかチェック

			// ひっくり返す

			// 石を置く
			board[y][x] = disc;

			// 石を置いた新しいターンの保存
			const nextDisc = disc === DARK ? LIGHT : DARK;
			const now = new Date();
			const turnRecord = await turnGateway.insert(
				conn,
				gameRecord.id,
				turnCount,
				nextDisc,
				now
			);
			if (!turnRecord) {
				throw new Error("Cannot insert turn");
			}
			// moveの保存
			await moveGateway.insert(conn, turnRecord.id, disc, x, y);
			// 石を置いた盤面を登録
			await squareGateway.insertAll(conn, turnRecord.id, board);
			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
