import { ApplicationError } from "./application/applicationError";
import { DomainError } from "./domain/error/domainError";
import express from "express";
import morgan from "morgan";
import "express-async-errors";
import { gameRouter } from "./presentation/gameRouter";
import { turnRouter } from "./presentation/turnRouter";

const PORT = 3000;
const app = express();
app.use(morgan("dev"));
// ルートのstaticフォルダのHTMLを静的ファイルに設定
app.use(express.static("static", { extensions: ["html"] }));
// Json形式のレスポンス/リクエストを扱う
app.use(express.json());

app.get("/api/error", async (req, res) => {
	throw new Error("Error endpoint");
});

// routerはpresentation層
app.use(gameRouter);
app.use(turnRouter);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Reversi app staerted: http://localhost:${PORT}`);
});

function errorHandler(
	err: any,
	_req: express.Request,
	res: express.Response,
	_next: express.NextFunction
) {
	if (err instanceof DomainError) {
		res.status(400).json({
			type: err.type,
			message: err.message,
		});
		return;
	}

	if (err instanceof ApplicationError) {
		switch (err.type) {
			case "LatestGameNotFound":
				res.status(404).json({
					type: err.type,
					message: err.type,
				});
				return;
		}
	}

	console.error("Unexpected error occurred", err);
	res.status(500).send({
		type: "UnecpectedError",
		message: "Unexpected error occurred",
	});
}
