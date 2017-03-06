var goodStates = ['online', 'busy', 'full', 'bursting'];

module.exports = {
	good: isGoodState,
	bad: isBadState
}

function isGoodState(state) {
	return goodStates.indexOf(state) != -1;
}

function isBadState(state) {
	return !isGoodState(state);
}