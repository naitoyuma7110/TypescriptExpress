import mysql from "mysql2/promise";
import { SquareRecord } from "./squareRecord";
export class SquareGateway {
	async findForTurnId(
		conn: mysql.Connection,
		turnId: number
		// SquareRecord型の配列が返される事に注意
	): Promise<SquareRecord[] | undefined> {
		const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
			"select id, turn_id, x, y, disc from squares where turn_id = ?",
			[turnId]
		);

		if (!squaresSelectResult) undefined;

		// 配列[0]内に64のマス目データを持つ：[id, turn_id, x, y, disc]×64
		const records = squaresSelectResult[0];

		return records.map((r) => {
			return new SquareRecord(r.id, r.turn_id, r.x, r.y, r.disc);
		});
	}

	async insertAll(
		conn: mysql.Connection,
		turnId: number,
		board: number[][]
	): Promise<void> {
		const squareCount = board
			.map((line) => line.length)
			.reduce((v1, v2) => v1 + v2, 0);

		const squaresInsertSql =
			"insert into squares (turn_id, x, y, disc) values " +
			Array.from(Array(squareCount))
				.map(() => "(?, ?, ?, ?)")
				.join(", ");

		// ?query部分,[turn_id, x, y, disc]×64
		const squaresInsertValues: any[] = [];
		board.forEach((line, y) => {
			line.forEach((disc, x) => {
				squaresInsertValues.push(turnId);
				squaresInsertValues.push(x);
				squaresInsertValues.push(y);
				squaresInsertValues.push(disc);
			});
		});

		await conn.execute(squaresInsertSql, squaresInsertValues);
	}
}
