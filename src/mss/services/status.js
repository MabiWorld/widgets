import axios from 'axios';

const stateNames = {
	'-1': 'offline',
	0: 'maintenance',
	1: 'online',
	2: 'busy',
	3: 'full',
	4: 'bursting',
	5: 'booting',
	6: 'error',
	7: 'ping'
};

const StatusService = {
	get
};

export default StatusService;

/**
 * @function get
 * @description Retrieves server status data
 * 
 * @returns promise
 */
function get() {
	return axios.get('http://mabi.world/mss/status.json').then(function (response) {
		var status = response.data;

		var isPing = status.type === 'ping';

		// Massage some things around.
		status.updated = new Date(status.updated);

		status.login.state = pingToState(status.login.ping);
		status.chat.state = pingToState(status.chat.ping);
		status.website.state = pingToState(status.website.ping);

		if (isPing) {
			return fixupPing(status);
		} else {
			return fixupFull(status);
		}
	});
}

function fixupFull(status) {
	status.game.state = stateNames[status.game.state];
	for (var server of status.game.servers) {
		server.state = stateNames[server.state];
		for (var channel of server.channels) {
			channel.state = stateNames[channel.state];
		}
	}

	return status;
}

function fixupPing(status) {
	var anyOnline = false;
	for (var server of status.game.servers) {
		for (var channel of server.channels) {
			if (channel.ping) {
				anyOnline = true;
				server.state = 'online';
				channel.state = 'ping';
			}
			channel.stress = -1;
		}
		server.stress = -1;
	}
	if (status.login.state === 'online' && anyOnline) {
		status.game.state = 'online';
	} else {
		status.game.state = 'offline';
	}
	status.game.stress = -1;

	return status;
}

function pingToState(ping) {
	return ping > 0 ? 'online' : 'offline';
}
