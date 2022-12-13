import { connectMySQL } from "../dataaccess/connection";
import { DARK, INITIAL_BOARD, LIGHT } from "./../application/constants";
import { SquareGateway } from "./../dataaccess/squareGateway";
import { MoveGateway } from "./../dataaccess/moveGateway";
import { TurnGateway } from "./../dataaccess/turnGateway";
import { Gamegateway } from "./../dataaccess/gameGateway";

const gameGeteway = new Gamegateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class GameService {
	async startNewGame() {
		const now = new Date();
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			// gatewayを使用してinsert
			const gameRecord = await gameGeteway.insert(conn, now);
			const turnRecord = await turnGateway.insert(
				conn,
				gameRecord.id,
				0,
				DARK,
				now
			);

			if (!turnRecord) {
				throw new Error("");
			}
			// mapで各列の合計マス目を入れた配列を作成 [8,8,8,8,...8]
			// 続くmapでその配列の要素を合計していく
			const squareCount = INITIAL_BOARD.map((line) => line.length).reduce(
				(value, total) => value + total,
				0
			);
			// (?,?,?,?),(?,?,?,?),..を64個
			const squaresInsertSql =
				"insert into squares (turn_id, x, y, disc) value " +
				Array.from(Array(squareCount))
					.map(() => "(?,?,?,?)")
					.join(",");

			// (?,?,?,?),の64個分のqueryに入れるvalue
			const squaresInsertValues: any[] = [];
			INITIAL_BOARD.forEach((line, y) => {
				line.forEach((disc, x) => {
					squaresInsertValues.push(turnRecord.id);
					squaresInsertValues.push(x);
					squaresInsertValues.push(y);
					squaresInsertValues.push(disc);
				});
			});
			await conn.execute(squaresInsertSql, squaresInsertValues);
			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
