module.exports = ratePing;

function ratePing(ping) {
	if (ping <= 0) return 'off';
	if (ping <= 50) return 'low';
	if (ping <= 500) return 'medium';
	return 'high';
}