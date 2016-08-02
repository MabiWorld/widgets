// convenience split function
function split(x, at, limit) {
	x = x.split(at);
	if (x.length > limit) x[limit - 1] = x.splice(limit - 1).join(at);
	return x;
}

// Convenience parsing function
function parseSettings(settings, opts) {
	var text = (settings + " ").match(/ +|[=,]|\{[^}]*\}|[^ ,=]+/g), cases = [];

	// opts
	opts = opts || [];
	var supportsCases = opts.indexOf("cases") != -1,
	    csv = opts.indexOf("csv") != -1,
	    h2c = opts.indexOf("hyphen2camel") != -1;

	// This is a pretty simple syntax
	// It works on one object until there's an else case then pushes that
	// An entry is like key=value
	// Entries are space-separated
	// Values can include spaces if they're quoted with {}
	// Extra data can be encoded into the quoted section with /
	// Values can be comma separated OUTSIDE OF the quotes
	var currentObject = {}, currentKey = "", currentString = "", concat = false;

	function parseString() {
		var ret;
		if (currentString.charAt(0) == "{") {
			var tmp = currentString.substring(1, currentString.length - 1).split("/");
			if (tmp.length == 1) ret = tmp[0];
			else ret = { "string": tmp[0], "extra": tmp.slice(1) };
		} else {
			ret = currentString;
		}
		currentString = "";
		return ret;
	}

	function parseWarning(warning) {
		console.warn("parseSettings: " + warning + " (settings: '" + settings + "')");
	}

	function h2cf(all, c) {
		return c.toUpperCase();
	}

	for (var i = 0; i < text.length; ++i) {
		var token = text[i];
		if (token.trim() == "") {
			if (currentKey && currentString) {
				if (csv) {
					if (currentObject[currentKey]) {
						currentObject[currentKey].push(parseString());
					} else {
						currentObject[currentKey] = [parseString()];
					}
				} else {
					if (currentObject[currentKey]) {
						parseWarning("Overriding old value for " + currentKey);
					}
					currentObject[currentKey] = parseString();
				}
				currentKey = "";
			}
		} else if (token == "=") {
			if (!currentString) parseWarning("= without key");
			currentKey = h2c ? currentString.replace(/-(.)/g, h2cf).replace(/-$/, "_") : currentString;
			currentString = "";
		} else if (token == ",") {
			if (currentKey && currentString) {
				if (csv) {
					if (currentKey in currentObject) {
						currentObject[currentKey].push(parseString());
					} else {
						currentObject[currentKey] = [parseString()];
					}
					currentString = "";
				} else {
					currentString += ",";
					concat = true;
				}
			} else {
				parseWarning("unusual comma");
			}
		} else {
			if (currentString) {
				if (supportsCases && currentString.toLowerCase() == "else") {
					cases.push(currentObject);
					currentObject = {};
				} else if (!concat) {
					parseWarning("ignoring random literal '" + currentString + "'");
				}
			}
			if (concat) {
				currentString += token;
				concat = false;
			} else {
				currentString = token;
			}
		}
	}

	if (supportsCases) {
		cases.push(currentObject);
		return cases;
	}
	else return currentObject;
}

// Scroll box functionality
function Scroller(list) {
	var idx = 0, interval, pub, time, auto;

	function prestage(newIdx, right) {
		newIdx = newIdx < 0 ? list.length + newIdx : newIdx % list.length;
		var $old = $(list[idx].id), $new = $(list[newIdx].id);

		// Animate the old one out
		var oldLeft = $old.position().left;
		$old.animate({
			"left": right ? -$old.outerWidth() : $old.outerWidth()
		}, {
			"done": function () { $(this).hide(); }
		});

		// Cancel and reset old interval, so that manual changes aren't quickly moved
		if (time) {
			clearInterval(interval);
			interval = setInterval(pub.right, time);
		}

		idx = newIdx;
		return [$new, oldLeft];
	}

	function stage(newIdx, right) {
		var ret = prestage(newIdx, right);
		var $new = ret[0], oldLeft = ret[1];

		// Animate the new one in
		$new.css("left", right ? $new.outerWidth() : -$new.outerWidth()).show().animate({
			"left": oldLeft
		}, {
			"done": function () { $(this).css("left", ""); }
		});
	}

	function marquee(dir, func) {
		// Marquee should pause any automation
		pub.pause();

		$new = prestage(newIdx, right);

		// Animate quickly into the stage to start
		$new.css("left", right ? $new.outerWidth() : -$new.outerWidth()).show().animate({
			"left": Math.round($new.outerWidth() * 7 / 8)
		});
	}

	pub = {
		show: function() { $(list[idx].id).show(); return this; },

		left:  function() { stage(idx - 1, false); return this; },
		right: function() { stage(idx + 1, true); return this; },

		autoLeft: function(t) {
			if (time != t || auto != pub.left) {
				time = t;
				auto = pub.left;
				pub.resume();
			}
			return this;
		},
		autoRight: function(t) {
			if (time != t || auto != pub.right) {
				time = t;
				auto = pub.right;
				pub.resume();
			}
			return this;
		},

		marqueeLeft: function() { marquee(idx - 1, false); return this; },
		marqueeRight: function() { marquee(idx + 1, true); return this; },

		pause: function() {
			clearInterval(interval);
			interval = undefined;
			return this;
		},
		resume: function() {
			if (typeof(interval) === "undefined") {
				clearInterval(interval);
			}
			interval = setInterval(auto, time);
			return this;
		},

		shift: function(item) { list.shift(item); return this; },
		unshift: function(item) { return list.unshift(item); },
		push: function (item) { list.push(item); return this; },
		pop: function (item) { return list.pop(item); },
		peek: function () { return list[list.length - 1]; },
		len: function () { return list.length; }
	};

	return pub;
}