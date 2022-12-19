import mysql from "mysql2/promise";
import { GameRecord } from "./gameRecord";
// recordとdatabase間のデータのやり取り(sql)

export class GameGateway {
	// 最新のgameを取得する
	async findLatest(conn: mysql.Connection): Promise<GameRecord | undefined> {
		const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
			"select id, started_at from games order by id desc limit 1"
		);
		const record = gameSelectResult[0][0];

		if (!record) return undefined;

		return new GameRecord(record.id, record.started_at);
	}

	// connectionとtransactionは呼び出し元で管理:
	// 一連のsqlの実行をセットにする
	async insert(conn: mysql.Connection, startedAt: Date): Promise<GameRecord> {
		const gameInsertResult = await conn.execute<mysql.ResultSetHeader>(
			"insert into games (started_at) value (?)",
			[startedAt]
		);
		const gameId = gameInsertResult[0].insertId;

		// Gameテーブルにinsertした情報
		return new GameRecord(gameId, startedAt);
	}
}
