// JS Library with useful stuff for working with Erinn times
// Written by Xcelled
// 2016
// Requires moment.js, moment timezone data

// Constants
var SERVER_TIMEZONE = "America/Los_Angeles";

var MS_PER_ERINN_MINUTE = 1500;
var MS_PER_ERINN_HOUR = MS_PER_ERINN_MINUTE * 60;
var MS_PER_ERINN_DAY = MS_PER_ERINN_HOUR * 24;

var MS_SCALE_FACTOR = 40;

var ERINN_EPOCH = moment.utc('0001-01-01');

// Functions for converting datetimes

// Converts a time from realtime to Erinn time
// Returns { day, hour, minute }
function realToErinn(realTime) {
	// convert realTime to UTC equiv to avoid DST issues
	realTime = realTime.clone().utc().add(realTime.utcOffset(), 'minutes');
	var elapsed = (realTime - ERINN_EPOCH);

	return {
		'day' : Math.floor(elapsed / MS_PER_ERINN_DAY),
		'hour' : Math.floor(elapsed / MS_PER_ERINN_HOUR) % 24,
		'minute' : Math.floor(elapsed / MS_PER_ERINN_MINUTE) % 60
	}
}

// Converts Erinn time to real time
// Returns: moment
function erinnToReal(day, hour, minute) {
	var elapsed = day * MS_PER_ERINN_DAY + hour * MS_PER_ERINN_HOUR + minute * MS_PER_ERINN_MINUTE;

	var rt = ERINN_EPOCH.clone().add(elapsed, 'milliseconds').tz(SERVER_TIMEZONE);
	return rt.subtract(rt.utcOffset(), 'minutes');
}

// Functions for dealing with durations

function realToErinnDuration(duration) {
	return moment.duration(duration.asMilliseconds() * MS_SCALE_FACTOR);
}

function erinnToRealDuration(duration) {
	return moment.duration(duration.asMilliseconds() / MS_SCALE_FACTOR);
}

// HH:MM style times
function parseHHMM(time) {
	var hhmm = time.split(":");
	return {'hour' : parseInt(hhmm[0]), 'minute': parseInt(hhmm[1])};
}

function diffHHMM(a, b) {
	return (a.hour*60 + a.minute) - (b.hour*60 + b.minute);
}

// Convenience functions
function getServerTime() {
	return moment().tz(SERVER_TIMEZONE)
}

function getErinnTime() {
	return realToErinn(getServerTime());
}