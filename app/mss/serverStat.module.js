const angular = require('angular');
require('angular-svg-round-progressbar')
require('angular-translate');

module.exports = ServerStat();

function ServerStat() {
	const serverStat = angular.module('serverStat',
		['angular-svg-round-progressbar', 'pascalprecht.translate']
	);
	serverStat.config(require('./serverStat.config.js'));

	// Controllers
	serverStat.controller('serverStatCtrl', require('./serverStat.controller.js'));


	// Filters
	const stateFilter = require('./components/isState.filter.js');

	serverStat.filter('isGoodState', function () { return stateFilter.good; });
	serverStat.filter('isBadState', function () { return stateFilter.bad; });

	const ratePing = require('./components/ratePing.filter.js');
	serverStat.filter('ratePing', function () { return ratePing; });

	const stateColor = require('./components/stateColor.filter.js');
	serverStat.filter('stateColor', function () { return stateColor; });

	// Services
	serverStat.factory('statusService', require('./components/status.service.js'));


	return serverStat;
}