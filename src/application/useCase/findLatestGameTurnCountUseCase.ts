import { GameResultRepository } from "../../domain/model/gameResult/gameResultRepository";
import { GameRepository } from "../../domain/model/game/gameRepository";
import { TurnRepository } from "../../domain/model/turn/turnRepository";
import { ApplicationError } from "../applicationError";
import { connectMySQL } from "../../infrastructure/connection";
import { GameResult } from "../../domain/model/gameResult/gameResult";

// 実装せずインフラ層への依存を解消
// const turnRepository = new TurnMySQLRepository();
// const gameRepository = new GameMySQLRepository();
// const gameResultRepository = new GameResultMySQLRepository();

// 返り値クラスでリターン内容を明示する
class FindLatestGameTurnByTurnCountOutput {
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

export class FindLatestGameTurnCountUseCase {
	constructor(
		private _gameRepository: GameRepository,
		private _turnRepository: TurnRepository,
		private _gameResultRepository: GameResultRepository
	) {}
	async run(turnCount: number): Promise<FindLatestGameTurnByTurnCountOutput> {
		const conn = await connectMySQL();
		try {
			const game = await this._gameRepository.findLatest(conn);
			if (!game) {
				throw new ApplicationError("LatestGameNotFound", "Latest game not found");
			}

			if (!game.id) {
				throw new Error("Latest game.id not found");
			}

			const turn = await this._turnRepository.findForGameIdAndTurnCount(
				conn,
				game.id,
				turnCount
			);

			let gameResult: GameResult | undefined;
			if (turn.gameEnded()) {
				gameResult = await this._gameResultRepository.findForGameId(conn, game.id);
			}

			return new FindLatestGameTurnByTurnCountOutput(
				turnCount,
				turn.board.discs,
				turn.nextDisc,
				gameResult?.winnerDisc
			);
		} finally {
			await conn.end();
		}
	}
}
