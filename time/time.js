/**
 * @module time
 */
angular.module('time', [])
	.factory('timeSvc', ['$timeout', function ($timeout) {
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

		/**
		 * @function erinnTime
		 * @description makes a new Erinn Time
		 */
		function erinnTime(day, hour, minute) {
			return {
				day: day,
				hour: hour,
				minute: minute,
				isNight: hour < 6 || hour >= 18
			};
		}

		var convert = {
			/**
			 * @function realToErinn
			 * @description Converts a time from realtime to Erinn time
			 * 
			 * @returns {day, hour, minute}
			 */
			realToErinn: function (realTime) {
				// convert realTime to UTC equiv to avoid DST issues
				realTime = realTime.clone().utc().add(realTime.utcOffset(), 'minutes');
				var elapsed = (realTime - ERINN_EPOCH);

				return erinnTime(
					Math.floor(elapsed / MS_PER_ERINN_DAY),
					Math.floor(elapsed / MS_PER_ERINN_HOUR) % 24,
					Math.floor(elapsed / MS_PER_ERINN_MINUTE) % 60
				);
			},

			/**
			 * @function erinnToReal
			 * @description Converts Erinn time to real time
			 * 
			 * @returns moment
			 */
			erinnToReal: function (erinn) {
				var elapsed = erinn.day * MS_PER_ERINN_DAY + erinn.hour * MS_PER_ERINN_HOUR + erinn.minute * MS_PER_ERINN_MINUTE;

				var rt = ERINN_EPOCH.clone().add(elapsed, 'milliseconds').tz(SERVER_TIMEZONE);
				return rt.subtract(rt.utcOffset(), 'minutes');
			}
		};

		var duration = {
			/**
			 * @function realToErinn
			 * @description Converts a realtime duration to its Erinn equiv
			 * 
			 * @returns moment.duration
			 */
			realToErinn: function (duration) {
				return moment.duration(duration.asMilliseconds() * MS_SCALE_FACTOR);
			},

			/**
			 * @function erinnToReal
			 * @description Converts an erinn duration to is realtime equiv
			 * 
			 * @returns moment.duration
			 */
			erinnToReal: function (duration) {
				return moment.duration(duration.asMilliseconds() / MS_SCALE_FACTOR);
			}
		};

		hhmm = {
			/**
			 * @function parse
			 * @description Parses a string formatted as "HH:MM" to an object
			 * 
			 * @returns {hour, minute}
			 */
			parse: function (time) {
				var hhmm = time.split(":");
				return { 'hour': parseInt(hhmm[0]), 'minute': parseInt(hhmm[1]) };
			},

			/**
			 * @function diffHHMM
			 * @description Calculates the difference between two HHMM times
			 * 
			 * @return number of minutes
			 */
			diff: function (a, b) {
				return (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute);
			}
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
		 * @returns {}
		 */
		function getErinnTime() {
			return convert.realToErinn(getServerTime());
		}

		var now = {
			real: getServerTime(),
			erinn: getErinnTime()
		};

		function updateErinnTime() {
			now.erinn = getErinnTime();
			var time = getErinnTime(); // Get it again since we wasted time in handlers

			// set up next round
			$timeout(updateErinnTime, convert.erinnToReal(erinnTime(time.day, time.hour, time.minute + 1)).diff(getServerTime()));
		}
		updateErinnTime();

		function updateRealTime() {
			now.real = getServerTime();

			$timeout(updateRealTime, 1000 - moment().milliseconds());
		}
		updateRealTime();

		// Make the service
		return {
			/**
			 * @property convert
			 * @description Functions for converting datetimes
			 */
			convert: convert,

			/**
			 * @property duration
			 * @description Functions for dealing with durations
			 */
			duration: duration,

			/**
			 * @property hhmm
			 * @description Helpers for dealing with hhmm times
			 */
			hhmm: hhmm,

			getServerTime: getServerTime,
			getErinnTime: getErinnTime,
			now: function () { return now; }
		}
	}])
	.directive('timeServerCurrent', ['timeSvc', function(timeSvc) {

	}])
	.controller('timeCtrl', ['timeSvc', function(timeSvc) {
		var self = this;
		self.now = timeSvc.now;
	}]);