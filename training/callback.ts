function add(v1: number, v2: number) {
	return v1 + v2;
}

// コールバックの返り値型の宣言： => return値
function calculate(
	v1: number,
	v2: number,
	callback: (a: number, b: number) => number
): number {
	return callback(v1, v2);
}

const addResult = calculate(1, 2, add);
console.log(addResult);

const hello = () => {
	console.log("HELLO");
};

setTimeout(function () {
	console.log("HELLO");
}, 5000);
