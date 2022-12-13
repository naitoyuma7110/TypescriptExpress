const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
console.log(numbers);

numbers.forEach((num, i) => {
	const double = num * 2;
	console.log(`${i} : ${double}`);
});

const names = ["naito", "sato", "tanaka", "ando"];

const users = names.map((name, i) => {
	return {
		id: i,
		name: name,
	};
});
console.log(users);

const evenIdUsers = users.filter((user) => {
	return user.id % 2 === 0;
});

const oddIdUsers = users.filter((user) => user.id % 2 === 1);
console.log(evenIdUsers, oddIdUsers);

// 配列[0]から順に値をpreviosで受け取り共通の値currentに対する処理を行う
const sum = numbers.reduce((previos, current) => previos + current, 0);
console.log(sum);
