/*
Timing functionality is provided by three classes of objects:
- Generators
	Generators are responsible for taking a list of events and other args
	and creating an iterator-style interface for them. They have three main
	methods: next(), time(), value(). Time returns a moment() object that
	represents the absolute time the event should be triggered.

- Timer
	The timer takes the output of a generator and uses it to schedule events.
	It maintains a list of future events, which can be queried. They can notify
	other objects when they tick.

- Displays
	Displays take Timers and retrieve information from them, which they then
	format for... uh... display. Displays hook the timer's tick event.

Most of the ugly work is done in generators, in an effort to have a clear and
extensible APi at the level of timers and displays.
*/

// Time-tick generator types:
// 	Rotate: Interval Based
//	Select: Specific time ranges

// Show: How many into the future to display
// Skip: How many to skip before displaying
// 	0: show current
// 	1: skip current, show next

function argumentError(warning) {
	console.warn("Argument Error: " + warning);
	return null;
}


generators = {}

generators.rotate = function(args, list) {
	if (!args.epoch)
		return argumentError("Rotate must have an epoch");
	var epoch = args.epoch[0];
	if (epoch[epoch.length-1] == 'S')
		epoch = moment.tz(epoch.substring(0, epoch.length-1), SERVER_TIMEZONE);
	else
		epoch = moment(epoch);

	if (args.changeAt) {
		// Change-at type timer
		if ((args.mode && args.mode=='erinn') || args.changeAt.some(function (x) { return x[x.length -1] == 'E'; }))
		{
			// Erinn mode
			return rotate_at_erinn(args, list, epoch);
		}
	} else {
		// Rotate every needs to use UTC to avoid DST issues.
	}
}

function rotate_at_erinn(args, list, epoch) {
	var times = [];

	for (var i = 0; i < args.changeAt.length; ++i) {
		var time = args.changeAt[i];
		if (time == "sunshift") {
			times.push('06:00');
			times.push('18:00');
		} else {
			if (time[time.length - 1] == 'E') // Legacy times
				time = time.substring(0, time.length - 1);
			times.push(parseHHMM(time));
		}
	}

	times.sort(diffHHMM);

	var entries = [];

	// Join each entry with its duration
	var timeIdx = 0;
	for (var i = 0; i < list.length; i++) {
		var diff = diffHHMM(times[(timeIdx + 1) % times.length], times[timeIdx % times.length]); // In minutes
		if (diff <= 0)
			diff += 24 * 60; // [6:00 - 18:00] + 24 == 12 hours
		entries.push([list[i], erinnToRealDuration(moment.duration(diff, 'minutes'))]);
	}

	// The Erinn time at the epoch may not match
	// the first change-at time, so change the
	// epoch to align with the first time entry
	var erinnAtEpoch = realToErinn(epoch);
	var addHours = times[0].hour - erinnAtEpoch.hour;
	var addMinutes = times[0].minute - erinnAtEpoch.minute;
	epoch = erinnToReal(erinnAtEpoch.day, erinnAtEpoch.hour + addHours, erinnAtEpoch.minute + addMinutes);

	return new Rotate(args, epoch, entries);
}

// Generic rotate generator
// Takes an epoch and a list of [entry, duration-in-realtime]
//  
function Rotate(args, epoch, entries) {
	// Calculate total cycle duration by summing all durations
	var totalDuration = 0;
	for (var i = 0; i < entries.length; i++)
		totalDuration += entries[i][1].asMilliseconds();

	var currentIdx, currentTime;

	this.time = function() { return currentTime.clone();}
	this.value = function() { return entries[currentIdx][0]; }

	this.next = function() {
		currentTime.add(entries[currentIdx][1]);
		currentIdx = (currentIdx + 1) % entries.length;

		return true;
	}

	// Seed with time
	this.seed = function(seed) {
		currentTime = epoch.clone().add(
			Math.floor(seed.diff(epoch) / totalDuration) * totalDuration,
			'Milliseconds');

		// Calculate progress through most recent cycle
		var cycleProgress = seed.diff(epoch) % totalDuration;
		// find corresponding entry
		currentIdx = 0;
		while (cycleProgress > entries[currentIdx][1].asMilliseconds()) {
			currentTime.add(entries[currentIdx][1]);
			cycleProgress -= entries[currentIdx][1].asMilliseconds();
			++currentIdx;
		}
	}

	this.seed(getServerTime());
}

// Query generator takes a timer and searches its future
// for events. It then generates 'bounding' events, aka
// one event for the start time and another for the end time
//
// Example:
//   18:00 - Ceo Starts
//   (next day) 18:00 - Ceo Ends
generators.query = function(args, list) {
	var self = this;
	if (!args.timer && !args.id)
		return argumentError('ID or timer must be given');
	var timer = args.timer[0] || $('#' + args.id[0]).data('timer');
	if (!timer)
		return argumentError('Timer not found');

	var entries = {}
	for (var i = 0; i < list.length; i++) {
		var set = parseSettings(list[i]);
		var lookFor = set.lookFor;
		var callIt = set.callIt || lookFor;
		entries[lookFor] = callIt;
	}
}

generators.select = function(args, list) {
	var parsed = [];
	var erinn = args.mode && args.mode[0] == 'erinn';
	for (var i = 0; i < list.length; i++) {
		var set = parseSettings(list[i]);
		if (set.at[set.at.length - 1] == 'E') {
			set.at = set.at.substring(0, set.at.length - 1);
			erinn = true;
		}

		parsed.push(set);
	}

	if (erinn)
		return new Select_Erinn(args, parsed);
	else
		return new Select_Real(args, parsed);
}

// Selects based on time of day
function Select_Erinn(args, entries) {
	for (var i = 0; i < entries.length; i++) {
		entries[i].at = parseHHMM(entries[i].at);
	}

	// sort times
	entries.sort(function(a, b) { return diffHHMM(a.at, b.at);});

	var current, date

	this.time = function() { var at = entries[current].at; return erinnToReal(date, at.hour, at.minute); }
	this.value = function() { return entries[current].label; }

	this.next = function() {
		if (++current == entries.length) {
			current = 0;
			date += 1;
		}

		return true;
	}

	// Sets initial generator state
	this.seed = function(seed) {
		erinnSeed = realToErinn(seed);

		current = -1; 
		date = erinnSeed.day;
		for (var i = 0; i < entries.length; i++) {
			if (entries[i].at.hour <= erinnSeed.hour && entries[i].at.minute <= erinnSeed.minute) {
				current = i;
			}
		}

		// If we didn't find one for today, we're still running under yesterday's last
		if (current == -1) {
			current = entries.length - 1;
			date -= 1;
		}
	}

	this.seed(getServerTime());
}

function Select_Real(args, entries) {
	function parse(at) {
		if (at[at.length - 1] == 'S')
			return parseHHMM(at.substring(0, at.length-1));
		else {
			var m = moment(at, "HH:mmZZ").tz(SERVER_TIMEZONE);
			return {'hour' : m.hour(), 'minute' : m.minute()};
		}
	}

	for (var i = 0; i < entries.length; i++) {
		entries[i].at = parse(entries[i].at);
	}

	// sort times
	entries.sort(function(a, b) { return diffHHMM(a.at, b.at);});

	var current, date;

	this.time = function() { var at = entries[current].at; return date.clone().hour(at.hour).minute(at.minute); }
	this.value = function() { return entries[current].label; }

	this.next = function() {
		if (++current == entries.length) {
			current = 0;
			date.add(1, 'days');
		}

		return true;
	}

	this.seed = function(seed) {
		date = seed.clone().startOf('day');
		current = -1;

		for (var i = 0; i < entries.length; i++) {
			if (entries[i].at.hour <= seed.hour() && entries[i].at.minute <= seed.minute()) {
				current = i;
			}
		}

		// If we didn't find one for today, we're still running under yesterday's last
		if (current == -1) {
			current = entries.length - 1;
			date.subtract(1, 'days');
		}
	}

	this.seed(getServerTime());
}

// Wraps a generator in a compressing function
// Compressing just eats consecutive generator results
// that have the same text
function Compressor(generator) {
	// Retrieves the next compressed entry
	this.next = function() {
		var currentValue = this.value();
		while (this.value() == currentValue) {
			if (!generator.next())
				return false;
		}

		return true;
	}

	this.time = function() { return generator.time(); }
	this.value = function() { return generator.value(); }
}

// --------------- Display classes --------------------------
jQuery.fn.style = function(x) {
	if(typeof(x) !== "undefined") this.attr("style", x);
	return this;
}

// Predefined display formats
displays = {}

displays.list = function($elem, args, timer) {
	args.show = args.show || [2]; // list defaults to 2 shown
	args.output = args.output || ['&nbsp;%v'];

	function displayer($elem, idx, formatter) {
		return $elem.append($("<span>").style(args.timeStyle).text(timer.time(idx).local().format("h:mm a")))
		.append($("<span>").style(args.valueStyle).html(formatter(args.output[0], idx)));
	}

	return new Display($elem, args, timer, displayer);
}

displays.countdown = function($elem, args, timer) {
	args.output = args.output || ['%v: %c1'];

	function displayer($elem, idx, formatter) {
		return $elem.html(formatter(args.output[0], idx));
	}

	return new Display($elem, args, timer, displayer);
}

displays.status = function($elem, args, timer) {
	args.output = args.output || ['%v'];

	function displayer($elem, idx, formatter) {
		return $elem.html(formatter(args.output[0], idx));
	}

	return new Display($elem, args, timer, displayer);
}

function Display($elem, args, timer, displayer) {
	var self = this;
	var show = args.show ? args.show[0] : 1;
	var skip = args.skip ? args.skip[0] : 0;

	// Create display widget...
	var $container = $("<div>").addClass("display-time").style(args.displayStyle).appendTo($elem);
	if (args.label) {
		var $head = $("<span>").addClass("timer-label").style(args.labelStyle).html(args.label[0])
		$head.appendTo($container);
	}
	var $display = $("<div>").style(args.listStyle).appendTo($container);

	// formatter function to replace % options
	function formatter(output, relative) {
		// We process the following tokens:
		//   %v[n]     replaced with the value of the event
		//   %t[n][{f}]  replaced with the time of the event
		//   %c[n]     replaced with a countdown to the event
		// Options:
		//    n: relative index of the event to retrieve. Defaults to 0 if omitted.
		//    f: format string passed to moment's format() method
		var final = '';
		var last = 0;

		while (last != output.length) {
			var next = output.indexOf('%', last); // Find next %
			final += output.substring(last, next < 0 ? undefined : next); // Copy all chars up to it to the output
			if (next == -1) // Not found? We're done.
				break;
			++next; // Skip over %

			var token = output.substring(next); // Cut off everything before this token
			var m;

			if ((m = token.match(/v(-?\d*)/))) { // Value of the entry
				final += timer.value(relative + (parseInt(m[1]) || 0));
			} else if ((m = token.match(/t(-?\d*)((?:{[^}]+})?)/))) { // Time of the entry
				var format = m[2] || '{h:mm a}';
				format = format.substring(1, format.length-1).trim(); // cut braces
				final += timer.time(relative + (parseInt(m[1]) || 0)).local().format(format);
			} else if ((m = token.match(/c(-?\d*)/))) { // countdown till entry
				final += '<span class="timer-countdown timer-n' + (relative + (parseInt(m[1]) || 0)) + '"></span>';
			}

			if (m) {
				next += m[0].length; // Don't output token
			}
			last = next;
		}

		return final;
	}

	this.update = function() {
		// Clear it out
		$display.empty();

		// Add new items
		for (var i = 0; i < show; i++) {
			$entry = $("<div>").addClass("display-entry").style(args.entryStyle);
			$display.append(displayer($entry, i+skip, formatter));
		}

		// Process any countdowns
		$display.find('.timer-countdown').each(function() {
			var $this = $(this);
			var time = timer.time(parseInt($this.attr('class').match(/timer-n(\d+)/)[1]));
			$this.style(args.timeStyle);
			countDown($this, time, undefined, function(x) {x.text("passed")});
		});
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

	// Register tick handler
	timer.onTick(this.update);

	// Initialize
	this.update();
}

// ----------------------------- Timer class -----------------------------------
// Contains logic for triggering on changes
function Timer(generator) {
	var ticks = [];
	var listeners = [];
	var self = this;

	this.onTick = function(handler) {
		if (typeof(handler) !== "function") return;

		listeners.push(handler);
	}

	this.get = function(idx) {
		while (ticks.length <= idx) {
			if (!generator.next()) {
				console.warn('No more time entries to retrieve');
				return [undefined, undefined];
			}
			ticks.push([generator.time(), generator.value()]);
		}

		return ticks[idx];
	}

	this.time = function(idx) { return this.get(idx)[0]; }
	this.value = function(idx) { return this.get(idx)[1]; }

	function registerNextChange() {
		var next = self.time(1); // Next time change
		if (next) {
			setTimeout(tocker, next.diff(moment()));
		}		
	}

	function tocker() {
		// TODO: Maybe check that the time actually *has* passed?
		// Pop 'current (expired)' off, makes index 1 new current.
		ticks.shift();
		// Trigger update
		for (var i = 0; i < listeners.length; i++) {
			listeners[i](self);
		}

		registerNextChange();
	}

	// Initialize
	ticks.push([generator.time(), generator.value()]);

	registerNextChange();
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
		    args = parseSettings($this.children(".settings").html(), ["csv", "hyphen2camel"]);

		// Extract list
		var list = [];
		$this.children("ul, ol").children("li").each(function () {
			list.push($(this).html().trim());
		});

		// Empty the list and change the class.
		$this.empty().removeClass("make-timer").addClass("timer");

		var generator = generators[args.type[0]](args, list);

		if (args.compress && args.compress[0][0] == 't')
			generator = new Compressor(generator);

		var timer = new Timer(generator);
		var display = displays[args.display ? args.display[0] : "list"]($this, args, timer);

		// Create timer object
		$this.data("timer", timer).data("display", display);
	})
});