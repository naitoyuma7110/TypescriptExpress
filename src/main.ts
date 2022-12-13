import { DARK, LIGHT, PORT } from "./application/constants";
import express from "express";
import morgan from "morgan";
import "express-async-errors";
import { gameRouter } from "./presentation/gameRouter";
import { turnRouter } from "./presentation/turnRouter";

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
	console.error("Unexpected error occurred", err);
	res.status(500).send({
		message: "Unexpected error occurred",
	});
}
