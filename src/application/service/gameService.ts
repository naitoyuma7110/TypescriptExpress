import { GameMySQLRepository } from "./../../infrastructure/repository/game/gameMySQLRepository";
import { TurnMySQLRepository } from "./../../infrastructure/repository/turn/turnMySQLRepository";
import { firstTurn } from "../../domain/model/turn/turn";
import { connectMySQL } from "../../infrastructure/connection";
import { Game } from "../../domain/model/game/game";

const turnRepository = new TurnMySQLRepository();
const gameRepository = new GameMySQLRepository();

export class GameService {
	async startNewGame() {
		const now = new Date();
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			// gatewayを使用してinsert
			const game = await gameRepository.save(conn, new Game(undefined, now));
			if (!game.id) {
				throw new Error("game.id not exist");
			}
			const turn = firstTurn(game.id, now);

			await turnRepository.save(conn, turn);
			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
