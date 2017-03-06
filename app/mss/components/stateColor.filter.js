module.exports = stateColor;

const colors = {
	online: 'green',
	busy: '#FFBB00',
	full: '#FF9900',
	bursting: '#CC0000',
	booting: '#BBBBBB',
	ping: '#6699FF'
};

function stateColor(state) {
	if (state in colors) {
		return colors[state];
	}
	return '#999999';
}