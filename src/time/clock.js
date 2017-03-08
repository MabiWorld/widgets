import './patch';
import 'moment';
import 'moment-timezone';
import { SERVER_TIMEZONE } from './constants'

export default clock = {
    getServerTime,
    getErinnTime,
    onRealTimeTicked,
    offRealTimeTicked,
    onErinnTimeTicked,
    offErinnTimeTicked
};

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
    trigger(handlers.erinn, getErinnTime());
    var next = getErinnTime().add(1, 'minute').second(0).millisecond(0); // Get it again since we wasted time in handlers

    // set up next round
    timeout(updateErinnTime, next.toReal().diff(getServerTime()));
}

function updateRealTime() {
    trigger(handlers.real, getServerTime());

    timeout(updateRealTime, 1000 - moment().milliseconds());
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
    handers.delete(oldHandler);
}

function onRealTimeTicked(handler) { on(handlers.real, handler); }
function offRealTimeTicked(handler) { off(handlers.real, handler); }
function onErinnTimeTicked(handler) { on(handlers.erinn, handler); }
function offErinnTimeTicked(handler) { off(handlers.erinn, handler); }