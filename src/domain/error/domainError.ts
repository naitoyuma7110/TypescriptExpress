type DomainErrorType =
	| "SelectedPointIsNotEmpty"
	| "FlipPointsIsEmpty"
	| "SelectedDiscIsNotNextDisc"
	| "SpecifiedTurnNotFound"
	| "FlipPointIsEmpty";

export class DomainError extends Error {
	constructor(private _type: DomainErrorType, message: string) {
		// 親クラスのconstractorにmessageを渡す
		super(message);
	}

	get type() {
		return this._type;
	}
}
