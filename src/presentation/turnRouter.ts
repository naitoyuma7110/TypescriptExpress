import { TurnService } from "./../application/turnService";
import express from "express";

export const turnRouter = express.Router();

const turnService = new TurnService();

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

		// FindLatestGameTurnByCTurnCountOutput型
		const output = await turnService.findLatestGameTurnCount(turnCount);

		// FindLatestGameTurnByCTurnCountOutputからTurnGetResponseBody型へ変換
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

turnRouter.post(
	"/api/games/latest/turns",
	// requestの型指定、
	async (req: express.Request<{}, {}, TurnPostRequestBody>, res) => {
		const turnCount = req.body.turnCount;
		const disc = req.body.move.disc;
		const x = req.body.move.x;
		const y = req.body.move.y;

		await turnService.registerTurn(turnCount, disc, x, y);

		res.status(201).end();
	}
);
