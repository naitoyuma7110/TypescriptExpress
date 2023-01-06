import { Game } from "./game";
import mysql from "mysql2/promise";

export interface GameRepository {
	findLatest(conn: mysql.Connection): Promise<Game | undefined>;
	save(conn: mysql.Connection, game: Game): Promise<Game>;
}
