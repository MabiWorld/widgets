mss = angular.module('serverStat', []);

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
		return $http.get('status.json').then(function (response) {
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
						}
						channel.stress = 100;
					}
					server.stress = 100;
				}
				if (status.login.state == 'online' && anyOnline) {
					status.game.state = 'online';
				} else {
					status.game.state = 'offline';
				}
				status.game.stress = 100;
			}

			return status;
		});
	}

	function pingToState(ping) {
		return ping ? stateNames[1] : stateNames[-1];
	}
}]);

mss.controller('serverStatCtrl', ['statusService', function (statusService) {
	var vm = this;

	vm.status = undefined;
	statusService.get().then(function (status) {
		vm.status = status;
	});
}]);