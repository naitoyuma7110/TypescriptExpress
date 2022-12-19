import { GameResultRepository } from "./../../domain/model/gameResult/gameResultRepository";
import { WinnerDisc } from "./../../domain/model/gameResult/winnerDisc";
import { Disc } from "./../../domain/model/turn/disc";
import { ApplicationError } from "./../applicationError";
import { GameRepository } from "../../domain/model/game/gameRepository";
import { TurnRepository } from "../../domain/model/turn/turnRepository";
import { connectMySQL } from "../../infrastructure/connection";
import { Point } from "../../domain/model/turn/point";
import { GameResult } from "../../domain/model/gameResult/gameResult";

const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();
const gameResultRepository = new GameResultRepository();
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

export class TurnService {
	async findLatestGameTurnCount(
		turnCount: number
	): Promise<FindLatestGameTurnByTurnCountOutput> {
		const conn = await connectMySQL();
		try {
			const game = await gameRepository.findLatest(conn);
			if (!game) {
				throw new ApplicationError(
					"LatestGameNotFound",
					"Latest game not found"
				);
			}

			if (!game.id) {
				throw new Error("Latest game.id not found");
			}

			const turn = await turnRepository.findForGameIdAndTurnCount(
				conn,
				game.id,
				turnCount
			);

			let gameResult: GameResult | undefined;
			if (turn.gameEnded()) {
				gameResult = await gameResultRepository.findForGameId(conn, game.id);
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

	async registerTurn(turnCount: number, disc: Disc, point: Point) {
		const conn = await connectMySQL();
		try {
			await conn.beginTransaction();
			const game = await gameRepository.findLatest(conn);
			if (!game) {
				throw new ApplicationError(
					"LatestGameNotFound",
					"Latest game not found"
				);
			}

			if (!game.id) {
				throw new Error("Latest game.id not found");
			}
			// 1つ前のターン取得(現在のturncountは新しく石を置こうとしているターン)
			// service層がrecordを意識するとdb操作の処理が含まれ煩雑になる
			const previoustTurnCount = turnCount - 1;
			const previousTurn = await turnRepository.findForGameIdAndTurnCount(
				conn,
				game.id,
				previoustTurnCount
			);

			// 石を置く
			// board[y][x] = disc;
			const newTurn = previousTurn.placeNext(disc, point);

			await turnRepository.save(conn, newTurn);

			// 勝敗が決した場合、対戦結果を保存
			if (newTurn.gameEnded()) {
				const winnerDisc = newTurn.WinnerDisc();
				const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt);
				await gameResultRepository.save(conn, gameResult);
			}

			await conn.commit();
		} finally {
			await conn.end();
		}
	}
}
