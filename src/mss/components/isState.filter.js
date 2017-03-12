const goodStates = ['online', 'busy', 'full', 'bursting'];

export function isGoodState(state) {
	return goodStates.indexOf(state) !== -1;
}

export function isBadState(state) {
	return !isGoodState(state);
}
