// Constants
var SERVER_TIMEZONE = "America/Los_Angeles";

var MS_PER_ERINN_MINUTE = 1500;
var MS_PER_ERINN_HOUR = MS_PER_ERINN_MINUTE * 60;
var MS_PER_ERINN_DAY = MS_PER_ERINN_HOUR * 24;

var TIME_PER_ERINN_MINUTE = MS_PER_ERINN_MINUTE; // Backwards compat
var TIME_PER_ERINN_HOUR = MS_PER_ERINN_HOUR; // Backwards compat
var TIME_PER_ERINN_DAY = MS_PER_ERINN_DAY; // Backwards compat

var MS_SCALE_FACTOR = 40;

var ERINN_EPOCH = moment.utc('0001-01-01');

// Patch moment with some useful methods

moment.fn.isNight = function () {
	return this.hour() < 6 || this.hour() >= 18
};

/**
 * @function toErinn
 * @description Converts a time from realtime to Erinn time
 * 
 * @returns moment
 */
moment.fn.toErinn = function () {
	// convert realTime to UTC equiv to avoid DST issues
	var realTime = this.clone().utc().add(this.utcOffset(), 'minutes');
	var elapsed = (realTime - ERINN_EPOCH);
	return ERINN_EPOCH.clone().millisecond(elapsed * MS_SCALE_FACTOR);
};

/**
 * @function toReal
 * @description Converts Erinn time to real time
 * 
 * @returns moment
 */
moment.fn.toReal = function () {
	var elapsed = (this - ERINN_EPOCH);
	var rt = ERINN_EPOCH.clone().add(elapsed / MS_SCALE_FACTOR, 'milliseconds').tz(SERVER_TIMEZONE);
	return rt.subtract(rt.utcOffset(), 'minutes');
};

/**
 * @function realToErinn
 * @description Converts a realtime duration to its Erinn equiv
 * 
 * @returns moment.duration
 */
moment.duration.fn.toErinn = function () {
	return moment.duration(this.asMilliseconds() * MS_SCALE_FACTOR);
};

/**
 * @function erinnToReal
 * @description Converts an erinn duration to is realtime equiv
 * 
 * @returns moment.duration
 */
moment.duration.fn.toReal = function () {
	return moment.duration(duration.asMilliseconds() / MS_SCALE_FACTOR);
}

/**
 * @module time
 */
angular.module('time', ['angularMoment'])
	.factory('hhmmService', function () {
		var service = {
			parse: parse,
			diff: diff
		};

		/**
		 * @function parse
		 * @description Parses a string formatted as "HH:MM" to an object
		 * 
		 * @returns {hour, minute}
		 */
		function parse(time) {
			var hhmm = time.split(":");
			return { 'hour': parseInt(hhmm[0]), 'minute': parseInt(hhmm[1]) };
		}

		/**
		 * @function diff
		 * @description Calculates the difference between two HHMM times
		 * 
		 * @return number of minutes
		 */
		function diff(a, b) {
			return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
		}

		return service;
	})
	.factory('clockService', ['$timeout', 'moment', function ($timeout, moment) {
		var now = {
			real: getServerTime(),
			erinn: getErinnTime()
		};

		var service = {
			getServerTime: getServerTime,
			getErinnTime: getErinnTime,
			now: function () { return now; }
		};

		// Convenience Functions
		/**
		 * @function getServerTime
		 * 
		 * @returns moment
		 */
		function getServerTime() {
			return moment().tz(SERVER_TIMEZONE)
		}

		/**
		 * @function getErinnTime
		 * 
		 * @returns moment
		 */
		function getErinnTime() {
			return getServerTime().toErinn();
		}

		function updateErinnTime() {
			now.erinn = getErinnTime();
			var next = getErinnTime().add(1, 'minute').second(0).millisecond(0); // Get it again since we wasted time in handlers

			// set up next round
			$timeout(updateErinnTime, next.toReal().diff(getServerTime()));
		}
		updateErinnTime();

		function updateRealTime() {
			now.real = getServerTime();

			$timeout(updateRealTime, 1000 - moment().milliseconds());
		}
		updateRealTime();

		// Make the service
		return service;
	}])
	.filter('isNight', function() {
		return function (erinnTime) {
			return erinnTime.isNight();
		};
	})
	.filter('isDay', function() {
		return function (erinnTime) {
			return !erinnTime.isNight();
		};
	})
	.directive('serverClock', function () {
		return {
			restrict: 'AEC',
			template: "{{ clock.now().real | amDateFormat:'h:mm a' }}"
		};
	})
	.directive('erinnClock', function () {
		return {
			restrict: 'AEC',			
			template: "{{ clock.now().erinn | amDateFormat:'HH:mm' }}"
		};
	})
	.directive('isNight', function () {
		return {
			restrict: 'AEC',
			template: "{{ clock.now().erinn | isNight }}"
		};
	})
	.directive('isDay', function () {
		return {
			restrict: 'AEC',
			template: "{{ clock.now().erinn | isDay }}"
		};
	})
	.controller('clockCtrl', ['clockService', function (clockService) {
		var self = this;
		self.now = clockService.now;
	}]);