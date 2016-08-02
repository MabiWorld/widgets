// JS Library with useful stuff for working with Erinn times
// Written by Xcelled
// 2016
// Requires moment.js, moment timezone data

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

// Time events

// Event tickers
erinnDay = 0;
function triggerErinnSunshift() {
	var time = getErinnTime();
	erinnDay = isNight = (time.hour < 6 || time.hour >= 18) ? 1 : 0;
	$(document).trigger("ErinnSunshift", [isNight]);

	// Set up next tick
	if (!isNight) {
		// Currently daytime, so trigger when night
		setTimeout(triggerErinnSunshift, erinnToReal(time.day, 18, 00).diff(getServerTime()));
	} else {
		// Currently night. We need to trigger at 6am. This could be later today, or it could be tomorrow
		var day = time.day;
		if (time.hour >= 6) {
			day += 1;
		}
		setTimeout(triggerErinnSunshift, erinnToReal(day, 6, 00).diff(getServerTime()));
	}
}

function triggerErinnMinute() {
	var time = getErinnTime();

	// Call general trigger
	$(document).trigger("ErinnMinute", [time.hour * 60 + time.minute]);

	// Format time and call trigger
	var time = moment("00:00", "HH:mm").hours(time.hour).minutes(time.minute).format("HH:mm");
	$(document).trigger("ErinnTime-" + time);

	// Set up the next round
	setTimeout(triggerErinnMinute, erinnToReal(time.day, time.hour, time.minute + 1).diff(getServerTime()));
}

var lastMinute = -1;
function triggerSecond() {
	var now = getServerTime();
	if (now.minutes() != lastMinute) {
		lastMinute = now.minutes();

		// If it's been a minute, trigger minute handlers
		$(document).trigger("TickMinute", [now]);

		// Trigger server time handlers
		$(document).trigger("RealTime-" + now.format("HH:mm"))
	}

	// Trigger second handlers
	$(document).trigger("TickSecond", [now]);

	setTimeout(triggerSecond, 1000 - now.milliseconds());
}

function triggerWeather() {
	var now = getServerTime();
	$(document).trigger("WeatherChange", [now]);

	// Trigger next
	min = (Math.floor(now.minutes() / 20) + 1) * 20; // Divide by 20 to current third, add 1 to get next third, multiply by 20 to get start of next third
	now = now.startOf('hour').add(min, 'minutes');
	setTimeout(triggerWeather, now.diff(getServerTime()))
}

// Start all timers on ready
$(function() {
	triggerErinnSunshift();
	triggerErinnMinute();
	triggerSecond();
	triggerWeather();
});

// Subscription logic
function onErinnSunshift(handler) {
	if (typeof(handler) !== "function") return;
	$(document).on("ErinnSunshift", handler);
}

function onErinnMinute(handler) {
	if (typeof(handler) !== "function") return;
	$(document).on("ErinnMinute", handler);
}

function onErinnTime(time, handler) {
	if (typeof(handler) !== "function") return;

	// Validate the time given.
	var rtime = time.match(/^([0-9]{1,2}):([0-9]{2})E?$/);
	if (!rtime) return console.warn("Bad time for onErinnTime: " + time);
	time = (rtime[1].length == 1 ? "0" + rtime[1] : rtime[1]) + ":" + rtime[2]

	// Register the time.
	$(document).on("ErinnTime-" + time, handler);
}

function onTickSecond(handler) {
	if (typeof(handler) !== "function") return;
	$(document).on("TickSecond", handler);
}

function offTickSecond(handler) {
	if (typeof(handler) !== "function") return;
	$(document).off("TickSecond", handler);
}

function onTickMinute(handler) {
	if (typeof(handler) !== "function") return;
	$(document).on("TickMinute", handler);
}

function onWeatherChange(handler) {
	if (typeof(handler) !== "function") return;
	$(document).on("WeatherChange", handler);
}

function onRealTime(time, handler, off) {
	if (typeof(handler) !== "function") return;

	// Validate the time given.
	var rtime = time.match(/^([0-9]{1,2}):([0-9]{2})S?$/);
	if (!rtime) return console.warn("Bad time for onRealTime: " + time);
	time = (rtime[1].length == 1 ? "0" + rtime[1] : rtime[1]) + ":" + rtime[2]

	// Register the time.
	$(document)[off ? "off" : "on"]("RealTime-" + time, handler);
}

function offRealTime(time, handler) { onRealTime(time, handler, true); }

// Countdown functionality
function countDown($time, til, pfx, callback, natural) {
	var til = moment(til);

	if (pfx) pfx += " ";
	else pfx = "";

	var handler = function() {
		var diff = til.diff(moment());
		if (diff <= 0) {
			offTickSecond(handler);
			if (callback) callback($time);
		} else {
			$time.text(pfx + diff2str(diff, natural))
		}
	}
	onTickSecond(handler);

	return $time;
}

function diff2str(ms, natural) {
	var s = Math.floor(ms / 1000) % 60,
	    m = Math.floor(ms / (60 * 1000)) % 60,
	    h = Math.floor(ms / (60 * 60 * 1000));

	m = m.toString();
	if (m < 10) m = "0" + m;
	s = s.toString()
	if (s < 10) s = "0" + s;

	var text;
	if (natural) {
		var d = Math.floor(h / 24);
		if (d > 0) {
			text = d.toString() + " days";
		} else if (h > 0) {
			text = h.toString() + " hours";
		} else {
			text = m + ":" + s;
		}
	} else {
		if (h > 0) {
			h = h.toString()
			if (h < 10) h = "0" + h;
			text = h + ":" + m;
		} else {
			text = m + ":" + s;
		}
	}

	return text;
}