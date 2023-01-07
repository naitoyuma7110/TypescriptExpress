import { TurnMySQLRepository } from "./../infrastructure/repository/turn/turnMySQLRepository";
import { GameMySQLRepository } from "./../infrastructure/repository/game/gameMySQLRepository";
import { StartNewGameUseCase } from "../application/useCase/startNewGameUseCase";
import express from "express";

export const gameRouter = express.Router();

const gameService = new StartNewGameUseCase(
	new GameMySQLRepository(),
	new TurnMySQLRepository()
);

gameRouter.post("/api/games", async (req, res) => {
	await gameService.run();
	res.status(201).end();
});
