

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
		return {'hour' : parseInt(hhmm[0]), 'minute': parseInt(hhmm[0])};
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
function compressor(generator) {
	var self = {};

	// Retrives the next compressed entry
	self.next = function() {
		var currentValue = self.value();
		while (self.value() == currentValue) {
			if (!generator.next())
				return false;
		}

		return true;
	}

	self.time = function() { return generator.time(); }
	self.value = function() { return generator.value(); }

	return self;
}