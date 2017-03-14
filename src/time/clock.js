import './patch';
import moment from 'moment';
import 'moment-timezone';
import { SERVER_TIMEZONE } from './constants';

const Clock = {
	now: {
		erinn: getErinnTime(),
		real: getServerTime()
	},
	getServerTime,
	getErinnTime,
	onRealTimeTicked,
	offRealTimeTicked,
	onErinnTimeTicked,
	offErinnTimeTicked
};

export default Clock;

let handlers = {
	real: new Set(),
	erinn: new Set()
};

// Start the tickers
updateErinnTime();
updateRealTime();

/**
 * @function getServerTime
 * 
 * @returns moment
 */
function getServerTime() {
	return moment().tz(SERVER_TIMEZONE);
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
	const time = getErinnTime();
	Clock.now.erinn = time;
	trigger(handlers.erinn, time);
	var next = getErinnTime().add(1, 'minute').second(0).millisecond(0); // Get it again since we wasted time in handlers

	// set up next round
	setTimeout(updateErinnTime, next.toReal().diff(getServerTime()));
}

function updateRealTime() {
	const time = getServerTime();
	Clock.now.real = time;
	trigger(handlers.real, time);

	setTimeout(updateRealTime, 1000 - moment().milliseconds());
}

/**
 * @description invokes handlers for an event
 * @param {*} handlers 
 * @param {*} time 
 */
function trigger(handlers, time) {
	for (let handler of handlers) {
		handler(time);
	}
}

function on(handlers, newHandler) {
	handlers.add(newHandler);
}

function off(handlers, oldHandler) {
	handlers.delete(oldHandler);
}

function onRealTimeTicked(handler) { on(handlers.real, handler); }
function offRealTimeTicked(handler) { off(handlers.real, handler); }
function onErinnTimeTicked(handler) { on(handlers.erinn, handler); }
function offErinnTimeTicked(handler) { off(handlers.erinn, handler); }
