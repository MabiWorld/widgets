// Defaults:
//  display: list
//  show: 2

// times that end in E are erinn time
// times that end in S are server time

// Options
//  type: rotate
//    epoch: start time from when changeover is determined
//    change-at: takes a time for when to rotate, can also be "sunshift"
//      this can also take a list
//    change-every: takes an interval for how often to rotate
//  type: query
//    id: id of the timer element to query
//    entry: search for this entry and get the countdown until then
//    current: value to display when the query is active now
//    future: value to display otherwise. Note that %s is the display name for both
//  type: select
//    all li elements have these:
//      at: time to select this entry
//      label: result to show until next entry
//  type: compress
//    Compresses the entries such that it only displays unique ones and adjusts timing accordingly.
//    subtype: type from above to use, see its requirements
//  display: list
//    lists the next X entries with their times like TIME: ENTRY
//    show: how many times to list
//  display: countdown
//    shows the time until the next rotation
//    for query this is two-fold; it counts the on and off times of the result of the query as the rotation points
//    output: text to display. Has the following replacements:
//     %v: value
//     %t: time widget
//  display: status
//    shows only the text, not the time

var timer_type = {}, display_type = {};

function argumentError(warning) {
	console.warn("Argument Error: " + warning);
	return null;
}

function parseTime(time, asMoment, serverTime) {
	if (time.match(/E$/)) {
		// Is Erinn time, returns in minutes
		var mo = time.match(/^([0-9]{1,2}):([0-9]{2})E?$/);
		if (!mo) return console.warn("Bad Erinn time: " + time);
		return parseInt(mo[1]) * 60 + parseInt(mo[2]);
	} else if (time.match(/S$/)) {
		// Parse Server time of day
		serverTime = moment(serverTime) || getServerTime();

		var hhmm = time.substr(0, time.length - 1).split(":");
		serverTime.hour(parseInt(hhmm[0])).minute(parseInt(hhmm[0]));

		if (asMoment) return serverTime;
		return serverTime.hour() * 60 + serverTime.minute();
	} else {
		// Parse time of day w/ TZ
		var t = moment(time, "HH:mmZZ");
		if (asMoment) return t;
		return t.hour() * 60 + t.minute();
	}
}

function getServerMinutes(st) {
	var st = st || getServerTime();
	return st.hour() * 60 + st.minute();
}

function compareTime(time, serverTime, erinnTime) {
	var parsedTime = parseTime(time, true, serverTime);

	if (time.match(/E$/)) return (parsedTime - (erinnTime || getErinnTime())) * TIME_PER_ERINN_MINUTE;
	else {
		serverTime = serverTime || getServerTime();
		return parsedTime.diff(serverTime);
	}
}

//// TIMER TYPES ////

timer_type.rotate = function (display, args, list) {
	if(!("epoch" in args)) return argumentError("Rotate type requires an epoch.");
	else if(args.epoch.length > 1) argumentError("Rotate type requires one epoch. Using the first.");
	if(!("changeAt" in args) && !("changeEvery" in args)) {
		return argumentError("Rotate type requires either change-at or change-every.");
	} else if("changeAt" in args && "changeEvery" in args) {
		return argumentError("Rotate type cannot take both change-at and change-every.");
	} else if(args.changeEvery && args.changeEvery.length > 1) {
		argumentError("Rotate type can only have one change-every. Using the first.");
	}

	// Parse list entries...
	var self = this, erinnEntries = [], realEntries = [], curEI, curRI, curIsErinn;

	var epoch = args.epoch[0], every = undefined, nextEvery, rotation = 0;
	var lastUpdate, self = this;

	if (epoch[epoch.length - 1] == "S") {
		epoch = moment.tz(epoch.substr(0, epoch.length - 1), SERVER_TIMEZONE)
	} else {
		epoch = moment(epoch)
	}

	if (args.changeEvery) every = moment.duration(args.changeEvery);

	// Register rotation with timing system
	if(args.changeAt) {
		var startTime = 0, startIdx = undefined;

		// Filter args into appropriate lists.
		for (var i = 0; i < args.changeAt.length; ++i) {
			var time = args.changeAt[i];

			if (time == "sunshift") {
				erinnEntries.push("06:00E"); // Sunrise
				erinnEntries.push("18:00E"); // Sunset
				onErinnSunshift(update);
			} else if (time.match(/E$/)) {
				// Is Erinn time
				erinnEntries.push(time);
				onErinnTime(time, update);
			} else {
				// Is real time
				realEntries.push(time);
				onRealTime(time, update);
			}
		}

		// Sort times.
		function sortTime(a, b) { return parseTime(a) - parseTime(b); }
		erinnEntries.sort(sortTime);
		realEntries.sort(sortTime);

		var stn = getServerTime();
		if (realEntries.length) {
			// Find next midnight in real time from epoch.
			var midnightAfterEpoch = moment(epoch).hour(0).minute(0).second(0).millisecond(0);
			if (epoch.format("HH:mm:ss.SSS") != "00:00:00.000") {
				midnightAfterEpoch.add(1, "day");
			}

			// Find midnight today.
			var midnight = moment(stn).hour(0).minute(0).second(0).millisecond(0);

			// Find all real-time changes between the epoch and midnight.
			for (var i = 0; i < realEntries.length; ++i) {
				if (compareTime(realEntries[i], epoch) > 0) ++rotation;
			}

			// Find all real-time changes between the midnight and now.
			for (var i = 0; i < realEntries.length; ++i) {
				if (compareTime(realEntries[i], stn) <= 0) ++rotation;
			}

			// Add rotation for every day passed wrt the number of changes per day.
			rotation += realEntries.length * (midnight.diff(midnightAfterEpoch, "days") - 1);
		}

		if (args.label == "Test") {
			1;
		}

		if (erinnEntries.length) {
			var ete = getErinnTime(epoch), etn = getErinnTime(stn);

			// Find all Erinn-time changes between the epoch and Erinn's midnight.
			for (var i = 0; i < erinnEntries.length; ++i) {
				if (compareTime(erinnEntries[i], null, ete) > 0) ++rotation;
			}

			// Find all Erinn-time changes between the Erinn's midnight and now.
			for (var i = 0; i < erinnEntries.length; ++i) {
				if (compareTime(erinnEntries[i], null, etn) <= 0) ++rotation;
			}

			// Add rotation for every Erinn day passed wrt the number of changes per day.
			var midnightAfterEpoch = moment(epoch).add(((1440 - ete) % 1440) * TIME_PER_ERINN_MINUTE, "ms"),
			    midnight = moment(stn).subtract(etn * TIME_PER_ERINN_MINUTE, "ms");

			var offset = midnight.diff(midnightAfterEpoch, "minutes") - 36;
			rotation += Math.floor(offset / 36) * erinnEntries.length;
		}

		// Bound rotation.
		rotation %= list.length

		// Find current time.
		var st = getServerTime(), et = getErinnTime();
		curEI = erinnEntries.length - 1;
		curRI = realEntries.length - 1;
		for (var i = 0; i < erinnEntries.length; ++i) {
			if (compareTime(erinnEntries[i], st, et) < 0) curEI = i;
		}
		for (var i = 0; i < realEntries.length; ++i) {
			if (compareTime(realEntries[i], st, et) < 0) curRI = i;
		}
		curIsErinn = isErinn(curEI, curRI, st, et);
	} else {
		function rotateAndReschedule() {
			update();
			nextEvery = getServerTime().add(every);
			setTimeout(rotateAndReschedule, every.valueOf());
		}

		// Remaining time left from now til the next point of "every"
		var st = getServerTime();
		rotation = Math.floor(st.diff(epoch) / every);
		var nextEvery = moment(epoch).add((rotation + 1) * every);
		rotation %= list.length;
		setTimeout(rotateAndReschedule, nextEvery.diff(st));
	}

	function isErinn(EI, RI, st, et) {
		if (!erinnEntries.length) return false;
		return !realEntries.length || compareTime(erinnEntries[EI], st, et) >= compareTime(realEntries[RI], st, et);
	}

	this.rnd = Math.floor(Math.random() * 1000);
	function update(e) {
		rotation = (rotation + 1) % list.length;

		if (e) {
			if (e.type.substr(0, 10) == "ErinnTime-") curEI = (curEI + 1) % erinnEntries.length;
			else if (e.type.substr(0, 9) == "RealTime-") curRI = (curRI + 1) % realEntries.length;
			curIsErinn = isErinn(curEI, curRI);
		}

		display.update(self);
	}

	this.value = function (idx) {
		return list[(rotation + idx) % list.length];
	}

	this.time = function (idx) {
		if (args.changeEvery) {
			return moment(nextEvery).add(every.valueOf() * idx, "ms")
		}

		var tmpEI = curEI, tmpRI = curRI, tmpCIE = curIsErinn, etl = 0, rtl = 0;
		var st = getServerTime(), et = getErinnTime();
		for (var i = 0; i < idx; ++i) {
			if (tmpCIE) {
				if((tmpEI = (tmpEI + 1) % erinnEntries.length) == curEI) ++etl;
			}
			else {
				if((tmpRI = (tmpRI + 1) % realEntries.length) == curRI) ++rtl;
			}
			tmpCIE = isErinn(tmpEI, tmpRI, st, et);
		}

		if (tmpCIE) {
			var diff = parseTime(erinnEntries[tmpEI]) - getErinnTime();
			if (diff > 0) --etl;
			return moment(st).add((diff + 24 * 60 * etl) * TIME_PER_ERINN_MINUTE);
		} else {
			return parseTime(realEntries[tmpRI], true, st).add(rtl, "day");
		}
	}

	display.update(this);
	return this;
}

timer_type.query = function (display, args, list) {
	if (!("id" in args)) return argumentError("Rotate type requires an epoch.");
	if (args.id.length > 1) argumentError("Query type requires one id. Using the first.");

	// Select what we're querying. TODO: make lazy
	var timer = $("#" + args.id[0]).data("timer");

	// Get the query value.
	var lookFor, callIt;
	if ("string" in args.entry[0]) {
		lookFor = args.entry[0].string;
		callIt = args.entry[0].extra[0];
	} else {
		lookFor = callIt = args.entry[0];
	}

	// Get the current and future values. Countdown display has its own defaults.
	var current = args.current && args.current[0], future = args.future && args.future[0];
	if (args.display == "countdown") {
		current = current || "%s for";
		future = future || "%s in";
	} else {
		current = current || "%s";
		future = future || "Not %s";
	}

	current = current.replace("%s", callIt);
	future = future.replace("%s", callIt);

	function query(needed) {
		var i, hits;
		for (i = 0, hits = 0; hits < needed; ++i) {
			if (timer.value(i) == lookFor) ++hits;
		}
		return i - 1;
	}

	function update() { display.update(this); }

	// In the following functions, idx are bounds of starting and ending.

	// Return current/future based on whether or not the query is current.
	this.value = function (idx) {
		// If the current value is what we're looking for,
		// then idx of 0 and evens are current and odds are future
		if (timer.value(0) == lookFor) return idx & 1 ? future : current;
		// Otherwise, idx of 0 and evens are future and odds are current
		else return idx & 1 ? current : future;
		//return idx & 1 ? future : current;
	}

	// Return start time of index.
	var curReg = undefined;
	this.time = function (idx) {
		var on = timer.value(0) == lookFor, odd = idx & 1,
		    nxor = on && odd || !on && !odd,
		    res = query(Math.floor(idx / 2) + !nxor);

		if (nxor) {
		//if (idx & 1) {
			// We want the start time of the next "off" position.
			// Therefore we must loop through values until the query is unsatisfied.
			// TODO: a 1 value list (or a list of all the same value) will cause an infinite loop 
			for (var i = ++res; timer.value(i) == lookFor; ++i) ++res;
		}

		var time = timer.time(res);

		// Register the time to update.
		if (idx == 0) {
			if (curReg) offRealTime(curReg, update)
			curReg = time.format("HH:mm");
			onRealTime(curReg, update)
		}

		return time;
	}

	display.update(this);
	return this;
}

// TODO: Non-matching as first entry shows "now" instead of correct start time.
timer_type.compress = function (display, args, list) {
	// TODO: validate args
	var self = this, timer;

	function query(idx) {
		var i, li = 0, passed, lookFor = timer.value(0), v;
		for (i = 1, passed = 0; passed < idx; ++i) {
			// TODO: Infinite loop if all the same value 
			if ((v = timer.value(i)) != lookFor) {
				++passed;
				lookFor = v;
				li = i;
			}
		}
		return li;
	}

	this.value = function (idx) {
		return timer.value(query(idx));
	}

	this.time = function (idx) {
		return timer.time(query(idx));
	}

	this.update = function () { if (timer) display.update(self); }

	timer = timer_type[args.subtype[0]](this, args, list);
	display.update(this);
	return this;
}

timer_type.select = function (display, args, list) {
	// Parse list entries...
	var self = this, erinnEntries = [], realEntries = [], curEI, curRI, curIsErinn;

	// Separate times.
	for (var i = 0; i < list.length; ++i) {
		var set = parseSettings(list[i]), add = [set.at, set.label];

		if (set.at.match(/E$/)) {
			erinnEntries.push(add);
		} else {
			realEntries.push(add);
		}
	}
	
	// Sort times.
	function sortTime(a, b) { return parseTime(a[0]) - parseTime(b[0]); }
	erinnEntries.sort(sortTime);
	realEntries.sort(sortTime);

	function isErinn(EI, RI, st, et) {
		if (!erinnEntries.length) return false;
		return !realEntries.length || compareTime(erinnEntries[EI][0], st, et) >= compareTime(realEntries[RI][0], st, et);
	}

	function update(e) {
		if (e) {
			if (e.type.substr(0, 10) == "ErinnTime-") curEI = (curEI + 1) % erinnEntries.length;
			else if (e.type.substr(0, 9) == "RealTime-") curRI = (curRI + 1) % realEntries.length;
			curIsErinn = isErinn(curEI, curRI);
		}

		display.update(self);
	}

	// Find current time.
	var st = getServerTime(), et = getErinnTime();
	curEI = erinnEntries.length - 1;
	curRI = realEntries.length - 1;
	for (var i = 0; i < erinnEntries.length; ++i) {
		if (compareTime(erinnEntries[i][0], st, et) < 0) curEI = i;
		onErinnTime(erinnEntries[i][0], update);
	}
	for (var i = 0; i < realEntries.length; ++i) {
		if (compareTime(realEntries[i][0], st, et) < 0) curRI = i;
		onRealTime(realEntries[i][0], update);
	}
	curIsErinn = isErinn(curEI, curRI, st, et);

	function query(idx) {
		var tmpEI = curEI, tmpRI = curRI, tmpCIE = curIsErinn, etl = 0, rtl = 0;
		var st = getServerTime(), et = getErinnTime();
		for (var i = 0; i < idx; ++i) {
			if (tmpCIE) {
				if((tmpEI = (tmpEI + 1) % erinnEntries.length) == curEI) ++etl;
			}
			else {
				if((tmpRI = (tmpRI + 1) % realEntries.length) == curRI) ++rtl;
			}
			tmpCIE = isErinn(tmpEI, tmpRI, st, et);
		}
		return tmpCIE ? [erinnEntries[tmpEI], etl] : [realEntries[tmpRI], rtl]
	}

	this.value = function (idx) {
		return query(idx)[0][1];
	}

	this.time = function (idx) {
		var q = query(idx);
		if (q[0][0].match(/E$/)) {
			var diff = parseTime(q[0][0]) - getErinnTime();
			return moment(getServerTime()).add((diff + 24 * 60 * ((diff < 0 ? 1 : 0) + q[1] - (idx == 0))) * TIME_PER_ERINN_MINUTE);
		} else {
			return parseTime(q[0][0], true).add(q[1] - 1, "day");
		}
	}

	display.update(this);
	return this;
}

//// DISPLAY TYPES ////
jQuery.fn.style = function(x) {
	if(typeof(x) !== "undefined") this.attr("style", x);
	return this;
}

function createHeader($elem, args, type) {
	// Create display widget...
	var $container = $("<div>").addClass("display-time-" + type).style(args.displayStyle).appendTo($elem);
	if (args.label) {
		var $head = $("<span>").addClass("timer-label").style(args.labelStyle);
		//if (args.labelLink) $("<a>").attr("href", args.labelLink[0]).text(args.label[0]).appendTo($head)
		/*else*/ $head.html(args.label[0])
		$head.appendTo($container);
	}

	return $("<div>").style(args.listStyle).appendTo($container);
}

display_type.list = function ($elem, args) {
	var show = args.show ? args.show[0] : 2, self = this;

	var $display = createHeader($elem, args, "list");

	this.update = function (timer) {
		// Clear it out.
		$display.empty();

		// Add new list items.
		for (var i = 0; i < show; ++i) {
			var label = timer.value(i), time = timer.time(i);

			$display.append($("<div>").addClass("display-entry").style(args.entryStyle)
				.append($("<span>").addClass("display-time").style(args.timeStyle).text(time.local().format("h:mm a")))
				.append($("<span>").addClass("display-label").style(args.valueStyle).html(label))
			);
		}
	}

	this.increase = function () {
		++show;
		self.update();
	}

	this.decrease = function () {
		if (show > 1) {
			--show;
			self.update();
		}
	}

	return this;
}

display_type.countdown = function($elem, args) {
	var output = args.output ? args.output[0] : "%v: %t";

	var $display = createHeader($elem, args, "countdown");

	this.update = function (timer) {
		var time = timer.time(1), value = timer.value(0);
		var html = output
			.replace("%v", value)
			.replace("%t", '<span class="timer-countdown"></span>');

		$display.html(html);
		var $timer = $elem.find(".timer-countdown");
		$timer.style(args.timeStyle);
		countDown($timer, time);
	}

	return this;
}

display_type.status = function($elem, args) {
	var $display = createHeader($elem, args, "status");

	this.update = function (timer) {
		$display.html(timer.value(0));
	}

	return this;
}

//// ONLOAD ////

$(function() {
	// Connect updaters for regular clocks
	onTickSecond(function() {
		// Update all server time clocks
		$(".time-server-current").text(getServerTime().format("h:mm a"));
	});

	onErinnMinute(function(e, minutes) {
		// Update all Erinn time clocks
		$(".time-erinn-current").text(moment("00:00", "HH:mm").minutes(minutes).format("h:mm a"));
	});

	// Create timers
	$(".make-timer").each(function () {
		var $this = $(this),
		    args = parseSettings($this.children(".settings").html(), ["csv", "hyphen2camel"]),
		    display;

		// Extract list
		var list = [];
		$this.children("ul, ol").children("li").each(function () {
			list.push($(this).html().trim());
		});

		// Empty the list and change the class.
		$this.empty().removeClass("make-timer").addClass("timer");

		display = new display_type[args.display ? args.display[0] : "list"]($this, args);

		// Create timer object
		$this.data("timer", new timer_type[args.type[0]](display, args, list));
	})
});
