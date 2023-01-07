import { GameResultRepository } from "../../domain/model/gameResult/gameResultRepository";
import { GameRepository } from "../../domain/model/game/gameRepository";
import { TurnRepository } from "../../domain/model/turn/turnRepository";
import { Disc } from "../../domain/model/turn/disc";
import { ApplicationError } from "../applicationError";
import { connectMySQL } from "../../infrastructure/connection";
import { Point } from "../../domain/model/turn/point";
import { GameResult } from "../../domain/model/gameResult/gameResult";

export class RegisterTurnUseCase {
	constructor(
		private _gameRepository: GameRepository,
		private _turnRepository: TurnRepository,
		private _gameResultRepository: GameResultRepository
	) {}
	async run(turnCount: number, disc: Disc, point: Point) {
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			const game = await this._gameRepository.findLatest(conn);
			if (!game) {
				throw new ApplicationError("LatestGameNotFound", "Latest game not found");
			}

			if (!game.id) {
				throw new Error("Latest game.id not found");
			}
			// 1つ前のターン取得(現在のturncountは新しく石を置こうとしているターン)
			// service層がrecordを意識するとdb操作の処理が含まれ煩雑になる
			const previoustTurnCount = turnCount - 1;
			const previousTurn = await this._turnRepository.findForGameIdAndTurnCount(
				conn,
				game.id,
				previoustTurnCount
			);

			// 石を置く
			// board[y][x] = disc;
			const newTurn = previousTurn.placeNext(disc, point);

			await this._turnRepository.save(conn, newTurn);

			// 勝敗が決した場合、対戦結果を保存
			if (newTurn.gameEnded()) {
				const winnerDisc = newTurn.WinnerDisc();
				const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt);
				await this._gameResultRepository.save(conn, gameResult);
			}

			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
