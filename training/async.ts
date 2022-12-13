import fs from "fs";
import util from "util";

// readFileメソッドを同期的に処理する関数を定義
// 処理の結果をPromiseオブジェクトで受け取る
const promisifyReadfile = util.promisify(fs.readFile);

async function main() {
	const readFilePromise = promisifyReadfile("package.json");
	let fileContent: string = "Not loaded";

	// then:Promiseで解決済みを確認してからcallbackが実行される
	readFilePromise.then((data) => {
		fileContent = data.toString();
		console.log(fileContent);
	});

	// await:async関数内ではawait部分は解決済みを確認してから次の処理へ
	const data = await promisifyReadfile("package.json");
	fileContent = data.toString();
	console.log(fileContent);
}

main();
