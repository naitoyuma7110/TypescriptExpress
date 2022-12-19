type DomainErrorType =
	| "SelectedPointIsNotEmpty"
	| "FlipPointsIsEmpty"
	| "SelectedDiscIsNotNextDisc"
	| "SpecifiedTurnNotFound"
	| "FlipPointIsEmpty"
	| "InvalidPoint"
	| "InvalidDiscValue"
	| "InvalidWinnerDiscValue";

export class DomainError extends Error {
	constructor(private _type: DomainErrorType, message: string) {
		// 親Errorクラスのconstractorにmessageを渡す
		super(message);
	}

	get type() {
		return this._type;
	}
}
