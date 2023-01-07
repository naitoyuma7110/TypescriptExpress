import { FindLatestGameTurnCountUseCase } from "./../application/useCase/findLatestGameTurnCountUseCase";
import { RegisterTurnUseCase } from "./../application/useCase/registerTurnUseCase";
import { GameResultMySQLRepository } from "./../infrastructure/repository/gameResult/gameResultMySQLRepository";
import { GameMySQLRepository } from "./../infrastructure/repository/game/gameMySQLRepository";
import { TurnMySQLRepository } from "./../infrastructure/repository/turn/turnMySQLRepository";
import { Point } from "./../domain/model/turn/point";

import express from "express";
import { toDisc } from "../domain/model/turn/disc";

export const turnRouter = express.Router();

const registerTurnUseCase = new RegisterTurnUseCase(
	new GameMySQLRepository(),
	new TurnMySQLRepository(),
	new GameResultMySQLRepository()
);

const findLatestGameTurnCountUseCase = new FindLatestGameTurnCountUseCase(
	new GameMySQLRepository(),
	new TurnMySQLRepository(),
	new GameResultMySQLRepository()
);

// DTO：データをクラスに格納してやり取りする

// 型チェック用interface
interface TurnGetResponseBody {
	turnCount: number;
	board: number[][];
	nextDisc: number | null;
	winnerDisc: number | null;
}

turnRouter.get(
	"/api/games/latest/turns/:turnCount",
	async (req, res: express.Response<TurnGetResponseBody>) => {
		const turnCount = parseInt(req.params.turnCount);

		const output = await findLatestGameTurnCountUseCase.run(turnCount);

		const responseBody = {
			turnCount: output.turnCount,
			board: output.bord,
			nextDisc: output.nextDisc ?? null,
			winnerDisc: output.winnerDisc ?? null,
		};

		res.json(responseBody);
	}
);

interface TurnPostRequestBody {
	turnCount: number;
	move: {
		disc: number;
		x: number;
		y: number;
	};
}

// フロントからのreq-paramのバリデーションは各modelに実装
turnRouter.post(
	"/api/games/latest/turns",
	// requestの型指定、{}はexpressの仕様
	async (req: express.Request<{}, {}, TurnPostRequestBody>, res) => {
		const turnCount = req.body.turnCount;

		// DiscモデルのtoDiscメソッドでバリデーションエラーを投げる
		const disc = toDisc(req.body.move.disc);
		// Pointモデルのconstructorでバリデーションエラーを投げる
		const point = new Point(req.body.move.x, req.body.move.y);

		await registerTurnUseCase.run(turnCount, disc, point);

		res.status(201).end();
	}
);
