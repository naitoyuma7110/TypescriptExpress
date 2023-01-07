import { GameRepository } from "../../domain/model/game/gameRepository";
import { TurnRepository } from "../../domain/model/turn/turnRepository";
// import { GameMySQLRepository } from "./../../infrastructure/repository/game/gameMySQLRepository";
// import { TurnMySQLRepository } from "./../../infrastructure/repository/turn/turnMySQLRepository";
import { firstTurn } from "../../domain/model/turn/turn";
import { connectMySQL } from "../../infrastructure/connection";
import { Game } from "../../domain/model/game/game";

// 実装はせずinfrastructureへの依存を解消
// const turnRepository = new TurnMySQLRepository();
// const gameRepository = new GameMySQLRepository();

// 代わりにinterfaceを受け取る事で骨組みだけを扱う
export class StartNewGameUseCase {
	constructor(
		private _gameRepository: GameRepository,
		private _turnRepository: TurnRepository
	) {}
	async run() {
		const now = new Date();
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			// gatewayを使用してinsert
			const game = await this._gameRepository.save(conn, new Game(undefined, now));
			if (!game.id) {
				throw new Error("game.id not exist");
			}
			const turn = firstTurn(game.id, now);

			await this._turnRepository.save(conn, turn);
			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
