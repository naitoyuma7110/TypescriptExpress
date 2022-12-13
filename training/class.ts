class Fraction {
	// private _numerator: number;
	// private _denominator: number;

	// フィールド宣言の省略
	constructor(private _numerator: number, private _denominator: number) {}

	add(other: Fraction): Fraction {
		const resultNumerator =
			this._numerator * other._numerator +
			this._denominator * other._denominator;
		const resulDeminator = this._denominator * this._denominator;

		return new Fraction(resultNumerator, resulDeminator);
	}

	toString(): string {
		return `${this._numerator}/${this._denominator}`;
	}

	get numerator() {
		return this._numerator;
	}

	get denominator() {
		return this._denominator;
	}
}

const f1 = new Fraction(1, 2);
// getterの呼び出し
console.log(f1.toString());

const f2 = new Fraction(1, 3);

const result = f1.add(f2);
console.log(`${result.denominator}/${result.numerator}`);
