mss = angular.module('serverStat', ['angular-svg-round-progressbar', 'pascalprecht.translate']);

mss.config(function ($translateProvider) {
	var translations = {
		state: {
			offline: 'Offline',
			maintenance: 'Maintenance',
			online: 'Online',
			busy: 'Busy',
			full: 'Full',
			bursting: 'Bursting',
			booting: 'Starting',
			error: 'Error'
		},
		game: {
			state: {
				offline: 'Mabinogi is currently offline',
				maintenance: 'Mabinogi is undergoing maintenance',
				online: 'Mabinogi is online',
				busy: 'Mabinogi is busy',
				full: 'Mabinogi is almost full',
				bursting: 'Mabinogi is at maximum capacity',
				booting: 'Mabinogi servers are booting up...',
				error: 'There is an error with the servers'
			},
			stress: {
				stress: '{{ stress }}% full',
				na: 'Load not available'
			}
		},
		server: {
			desc: {
				full: "{{ ('server.name.' + name) | translate }} - {{ stress }}% full\r\n{{ ('server.state.' + state) | translate }}",
				ping: "{{ ('server.name.' + name) | translate }}\r\n{{ ('server.state.' + state) | translate }} (load not available)"
			},
			state: {
				offline: 'This server is offline',
				maintenance: 'This server is currently undergoing maintenance',
				online: 'Online',
				busy: 'Busy',
				full: 'Full',
				bursting: 'Bursting',
				booting: 'This server is currently starting, please wait a little',
				error: 'This server currently has an error'
			},
			name: {
				mabius1: 'Mari',
				mabius2: 'Ruairi',
				mabius3: 'Tarlach',
				mabius4: 'Alexina'
			}
		},
		channel: {
			desc: {
				full: "{{ ('channel.name.' + name) | translate }} - {{ stress }}% full\r\nPing: {{ ping | number:0 }}ms\r\n{{ ('channel.state' + state) | translate }}",
				ping: "{{ ('channel.name.' + name) | translate }}\r\nPing: {{ ping | number:0 }}ms\r\nOnline (load not available)"
			},
			state: {
				offline: 'This channel is offline',
				maintenance: 'This channel is currently undergoing maintenance',
				online: 'Online',
				busy: 'Busy',
				full: 'Full',
				bursting: 'Bursting',
				booting: 'This channel is currently starting, please wait a little',
				error: 'This channel currently has an error'
			},
			name: {
				Ch1: 'Channel 1',
				Ch2: 'Channel 2',
				Ch3: 'Channel 3',
				Ch4: 'Channel 4',
				Ch5: 'Channel 5',
				Ch6: 'Channel 6',
				Ch7: 'Channel 7',
				HCh: 'Housing Channel',
			}
		},
		website: {
			name: 'Website',
			desc: "Ping: {{ping | number:0 }}ms"
		},
		login: {
			name: 'Login',
			desc: "Ping: {{ping | number:0 }}ms"
		},
		chat: {
			name: 'Chat',
			desc: "Ping: {{ping | number:0 }}ms"
		},
		updated: "Updated on {{updated | date:'short'}}",
		byline: '<div><small>Created by <a href="http://wiki.mabinogiworld.com/view/User:Xcelled194">Xcelled</a> and <a href="http://wiki.mabinogiworld.com/view/User:Kadalyn">Kadalyn</a></small></div><div><small>Design by <a href="http://wiki.mabinogiworld.com/view/User:Yai">Yai</a></small></div>'
	};

	$translateProvider
		.translations('en', translations)
		.preferredLanguage('en');
});

mss.factory('statusService', ['$http', function ($http) {
	var service = {
		get: get
	}

	var stateNames = {
		'-1': 'offline',
		0: 'maintenance',
		1: 'online',
		2: 'busy',
		3: 'full',
		4: 'bursting',
		5: 'booting',
		6: 'error',
		7: 'ping'
	}

	return service;

	/**
	 * @function get
	 * @description Retrieves server status data
	 * 
	 * @returns promise
	 */
	function get() {
		return $http.get('http://mabi.world/mss/status.json').then(function (response) {
			var status = response.data;

			var isPing = status.type == 'ping';

			// Massage some things around.
			status.updated = new Date(status.updated);

			status.login.state = pingToState(status.login.ping);
			status.chat.state = pingToState(status.chat.ping);
			status.website.state = pingToState(status.website.ping);

			if (isPing) {
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
				if (status.login.state == 'online' && anyOnline) {
					status.game.state = 'online';
				} else {
					status.game.state = 'offline';
				}
				status.game.stress = -1;
			}

			return status;
		});
	}

	function pingToState(ping) {
		return ping ? stateNames[1] : stateNames[-1];
	}
}]);

mss.controller('serverStatCtrl', ['statusService', '$translate', '$interval', function (statusService, $translate, $interval) {
	var vm = this;

	vm.status = undefined;
	vm.updates = 0;
	vm.updateStatus = updateStatus;
	vm.channelComparator = channelComparator;
	vm.serverComparator = serverComparator;

	updateStatus();
	$interval(updateStatus, 30 * 1000);

	function updateStatus() {
		statusService.get().then(function (status) {
			vm.updates += 1;
			vm.status = status;
		}).catch(function (err) {
			console.error("Failed to load status", err);
			vm.status = undefined;
		});
	}

	function channelComparator(a, b) {
		if (a.value === 'HCh')
			return 1;
		else if (b.value === 'HCh')
			return -1;
		else
			return (a.value < b.value) ? -1 : 1;
	};

	function serverComparator(a, b) {
		var aTrans = $translate.instant('server.name.' + a.value);
		var bTrans = $translate.instant('server.name.' + b.value);

		return (aTrans < bTrans) ? -1 : 1;
	}
}]);

mss.filter('stateColor', function () {
	var colors = {
		online: 'green',
		busy: '#FFBB00',
		full: '#FF9900',
		bursting: '#CC0000',
		booting: '#BBBBBB',
		ping: '#6699FF'
	};

	return function (state) {
		if (state in colors) {
			return colors[state];
		}
		return '#999999';
	};
});

mss.filter('ratePing', function () {
	return function (ping) {
		if (ping <= 0) return 'off';
		if (ping <= 50) return 'low';
		if (ping <= 500) return 'medium';
		return 'high';
	}
});

mss.filter('isBadState', function () {
	var goodStates = ['online', 'busy', 'full', 'bursting']
	return function (state) {
		return goodStates.indexOf(state) == -1;
	}
});