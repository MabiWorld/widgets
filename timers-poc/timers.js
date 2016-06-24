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


// Selects based on time of day
generators.select_erinn = function(args, list) {
	var self = {};
	// Parses a datetime into an hour/minute
	function parse(time) {
		var hhmm = time.split(":");
		return {'hour' : parseInt(hhmm[0]), 'minute': parseInt(hhmm[1])};
	}

	self.entries = [];

	for (var i = 0; i < list.length; i++) {
		var set = parseSettings(list[i]);
		set.at = parse(set.at);
		self.entries.push(set);
	}

	// sort times
	self.entries.sort(function (a, b) { return (a.at.hour*60 + a.at.minute) - (b.at.hour*60 + b.at.minute); });

	// Sets initial generator state
	self.seed = function(seed) {
		erinnSeed = realToErinn(seed);

		self._current = -1; 
		self._date = erinnSeed.day;
		for (var i = 0; i < self.entries.length; i++) {
			if (self.entries[i].at.hour <= erinnSeed.hour && self.entries[i].at.minute <= erinnSeed.minute) {
				self._current = i;
			}
		}

		// If we didn't find one for today, we're still running under yesterday's last
		if (self._current == -1) {
			self._current = self.entries.length - 1;
			self._date -= 1;
		}
	}

	self.seed(getServerTime());

	self.time = function() { var at = self.entries[self._current].at; return erinnToReal(self._date, at.hour, at.minute); }
	self.value = function() { return self.entries[self._current].label; }

	self.next = function() {
		if (++self._current == self.entries.length) {
			self._current = 0;
			self._date += 1;
		}

		return true;
	}

	return self;
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

function Display($elem, args, timer) {
	var skip = args.skip ? args.skip[0] : 0;
	var show = args.show ? args.show[0] : 2;

	// Create display widget...
	var $container = $("<div>").addClass("display-time-").style(args.displayStyle).appendTo($elem);
	if (args.label) {
		var $head = $("<span>").addClass("timer-label").style(args.labelStyle).html(args.label[0])
		$head.appendTo($container);
	}
	var $display = $("<div>").style(args.listStyle).appendTo($container);

	this.update = function() {
		// Clear it out
		$display.empty();

		// Add new items
		for (var i = skip; i < show+skip; i++) {
			var label = timer.value(i), time = timer.time(i);

			$display.append($("<div>").addClass("display-entry").style(args.entryStyle)
				.append($("<span>").addClass("display-time").style(args.timeStyle).text(time.local().format("h:mm:ss a")))
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
			setTimeout(self._tocker, next.diff(moment()));
		}		
	}

	this._tocker = function() {
		// TODO: Maybe check that the time actually *has* passed?
		// Pop 'current (expired)' off, makes index 1 new current.
		ticks.shift();
		// Trigger update
		for (var i = 0; i < listeners.length; i++) {
			listeners[i](this);
		}

		registerNextChange();
	}

	// Initialize
	ticks.push([generator.time(), generator.value()]);

	registerNextChange();
}