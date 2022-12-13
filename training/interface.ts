const STONE = 0;
const PAPER = 1;
const SCISSORS = 2;

interface HandGenarator {
	genarate(): number;
}

class RandomHandGenarator implements HandGenarator {
	genarate(): number {
		return Math.floor(Math.random() * 3);
	}

	generateArray(): number[] {
		return [];
	}
}

// グーしか返さないクラス
class StoneHandGenarator implements HandGenarator {
	genarate(): number {
		return STONE;
	}

	generateArray(): number[] {
		return [];
	}
}

class Janken {
	play(handGenarator: HandGenarator) {
		const computerHand: number = handGenarator.genarate();

		console.log(`computedHand = ${computerHand}`);
	}
}

const j1 = new Janken();
j1.play(new StoneHandGenarator());
