import { DomainError } from "./../../error/domainError";
export const WinnerDisc = {
	Draw: 0,
	Dark: 1,
	Light: 2,
} as const;

// WinnerDiscオブジェクトからvalueのみ抜粋したtypeを作成
export type WinnerDisc = typeof WinnerDisc[keyof typeof WinnerDisc];

export function toWinnerDisc(value: any): WinnerDisc {
	if (!Object.values(WinnerDisc).includes(value)) {
		throw new DomainError(
			"InvalidWinnerDiscValue",
			"Invalid Winner disc value"
		);
	}
	return value as WinnerDisc;
}
