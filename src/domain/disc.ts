export const Disc = {
	Empty: 0,
	Dark: 1,
	Light: 2,
	Wall: 3,
} as const;
// as const : readonly

// type Disc = 0 | 1 | 2
export type Disc = typeof Disc[keyof typeof Disc];

export function toDisc(value: number) {
	return value as Disc;
}

export function isOppositeDisc(disc1: Disc, disc2: Disc): boolean {
	return (
		(disc1 === Disc.Dark && disc2 === Disc.Light) ||
		(disc1 === Disc.Light && disc2 === Disc.Dark)
	);
}
