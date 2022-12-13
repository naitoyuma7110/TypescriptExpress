export const Disc = {
	Empty: 0,
	Dark: 1,
	Light: 2,
} as const;
// as const : readonly

// type Disc = 0 | 1 | 2
export type Disc = typeof Disc[keyof typeof Disc];
