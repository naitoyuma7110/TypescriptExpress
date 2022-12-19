import { DomainError } from "./../../error/domainError";
import { Board } from "./board";
import { Move } from "./move";
import { Turn } from "./turn";
import { toDisc } from "./disc";
import { Point } from "./point";
import { MoveGateway } from "../../../infrastructure/moveGateway";
import { SquareGateway } from "../../../infrastructure/squareGateway";
import { TurnGateway } from "../../../infrastructure/turnGateway";
import mysql from "mysql2/promise";

const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
const moveGateway = new MoveGateway();

export class TurnRepository {
	async findForGameIdAndTurnCount(
		conn: mysql.Connection,
		gameId: number,
		turnCount: number
	): Promise<Turn> {
		// game_id,turnCountを指定してturn情報(Next)を取得
		const turnRecord = await turnGateway.findForGameIdAndTurnCount(
			conn,
			gameId,
			turnCount
		);
		if (!turnRecord) {
			throw new DomainError(
				"SpecifiedTurnNotFound",
				"Specified turn not found"
			);
		}
		const squarRrecord = await squareGateway.findForTurnId(conn, turnRecord.id);

		// 取得したSquareRecord型配列からbord配列を作成
		const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
		squarRrecord.forEach((s) => {
			board[s.y][s.x] = s.disc;
		});

		const moveRecord = await moveGateway.findForTurnId(conn, turnRecord.id);
		let move: Move | undefined;
		if (moveRecord) {
			move = new Move(
				toDisc(moveRecord.disc),
				new Point(moveRecord.x, moveRecord.y)
			);
		}

		// 互いの石が置けない＝勝敗が付いた場合、turnテーブルのnext_discにはnullを入れる
		// insert結果としてturnRecord.nextDiscもnullが入るためここで整合させる
		const nextDisc =
			turnRecord.nextDisc === null ? undefined : toDisc(turnRecord.nextDisc);

		return new Turn(
			gameId,
			turnCount,
			nextDisc,
			move,
			new Board(board),
			turnRecord.endAt
		);
	}

	async save(conn: mysql.Connection, turn: Turn) {
		// 石を置いた新しいターンの保存
		const turnRecord = await turnGateway.insert(
			conn,
			turn.gameId,
			turn.turnCount,
			turn.nextDisc,
			turn.endAt
		);
		if (!turnRecord) {
			throw new DomainError(
				"SpecifiedTurnNotFound",
				"Specified turn not found"
			);
		}
		// 石を置いた盤面を登録
		await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs);
		if (turn.move) {
			// moveの保存
			await moveGateway.insert(
				conn,
				turnRecord.id,
				turn.move.disc,
				turn.move.point.x,
				turn.move.point.y
			);
		}
	}
}
