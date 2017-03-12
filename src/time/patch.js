import moment from 'moment';
import 'moment-timezone';

import { MS_SCALE_FACTOR, ERINN_EPOCH, SERVER_TIMEZONE } from './constants';

// Patch moment with some useful methods

moment.fn.isNight = function () {
	return this.hour() < 6 || this.hour() >= 18;
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
	return moment.duration(this.asMilliseconds() / MS_SCALE_FACTOR);
};
