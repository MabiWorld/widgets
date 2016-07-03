localization = {}; // Localization container
translations = {}; // Translation container
goodStates = [1, 2, 3, 4]; // For easy testing of if we're in a good state or not
fullAniDuration = 2000; // How long it should take an animation to go from 0% to 100%. Used to make animations run at a constant speed

// =================================
// Localization table setup
//
// Here, we set up a bunch of localization lookup tables
// and store them in the localization object for easy use.
// This way, all the messages are collected in one place.
// Think of it like namespacing.
// =================================

// Set up a lookup in the localizations object, so we can localize
// the status codes to their names. `localization.states[1]` prints 'Online'
localization.states = {
	'-1': 'Offline',
	0: 'Maintenance',
	1: 'Online',
	2: 'Busy',
	3: 'Full',
	4: 'Bursting',
	5: 'Starting',
	6: 'Error'
};

// Set up another localization lookup for states -> game messages
localization.gameStateMessages = {
	'-1': 'Mabinogi is currently offline',
	0: 'Mabinogi is undergoing maintenance',
	1: 'Mabinogi is online',
	2: 'Mabinogi is busy',
	3: 'Mabinogi is almost full',
	4: 'Mabinogi is at maximum capacity',
	5: 'Mabinogi servers are booting up...',
	6: 'There is an error with the servers'
};

// Localize states -> server messages
localization.serverStateMessages = {
	'-1': 'This server is offline',
	0: 'This server is currently undergoing maintenance',
	1: 'Online',
	2: 'Busy',
	3: 'Full',
	4: 'Bursting',
	5: 'This server is currently starting, please wait a little',
	6: 'This server currently has an error'
};

// states -> channel messages
localization.channelStateMessages = {
	'-1': 'This channel is offline',
	0: 'This channel is currently undergoing maintenance',
	1: 'Online',
	2: 'Busy',
	3: 'Full',
	4: 'Bursting',
	5: 'This channel is currently starting, please wait a little',
	6: 'This channel currently has an error'
};

// =================================
// Translation table setup
//
// Now set up a translation object. Unlike the localization
// object, this one is solely for us. It maps between codes
// and a non-localized string. We use this to build things like
// the css class `background_online`, which would otherwise be
// `background_1`, much less clear.
// =================================

translations.serverNames = {
	'mabius1': 'Mari',
	'mabius2': 'Ruairi',
	'mabius3': 'Tarlach',
	'mabius4': 'Alexina'
};

translations.channelNames = {
	'Ch#': 'Channel %i',
	'HCh': 'Housing Channel'
};

translations.stateNames = {
	'-1': 'offline',
	0: 'maintenance',
	1: 'online',
	2: 'busy',
	3: 'full',
	4: 'bursting',
	5: 'booting',
	6: 'error',
	7: 'ping'
}

// this lookup is for the ping class names in CSS
translations.channelPingClasses = {
	'off': 'offline',
	'low': 'good',
	'med': 'moderate',
	'hi' : 'bad'
};

// =================================
// CSS helper functions
//
// Build an object to store some helper functions in.
// This one has a bunch of helpers that make it easy to
// manage "group" css classes that are based off of states. For example,
// they're used to change the class on the ring based on what status
// the ring should be communicating.
//
// They do this by first removing any existing classes, then by adding
// the appropriate class for the given state. For example:
// 
// var e = $'<div class="foo ring_error">')
// .ring(e, 1)
//
// will first remove the `ring_error` (while leaving the `foo`)
// and will then look up code 1 in the translations table, to get `online`.
// Finally, it adds `ring_online` to the class attribute. Final result:
// <div class="foo ring_online">
// =================================

function setStateClass(elements, state, prefix, lookup) {
	// Remove existing classes with this prefix
	elements.attr('class', function (i, c) {
		if (c !== undefined)
			return c.replace(new RegExp("(^|\\s)" + prefix + "\\S+", 'g'), ''); // Regex looks for anything starting with the prefix, plus at least one letter after, and replaces it with an empty string
	});

	// add new class based on prefix + lookup'd name
	if (state !== null)
		elements.addClass(prefix + (lookup[state] || state));
}

setStateClasses = {}

// Now we'll create some helpers that have the proper prefixes and loop tables pre-specified.
// We'll store these in the setStateClasses object, so we can later use `setStateClasses.whatever` to invoke them.
setStateClasses.ring = function (rings, state) { setStateClass(rings, state, 'mss_ring_', translations.stateNames) };
setStateClasses.text = function (text, state) { setStateClass(text, state, 'mss_text_', translations.stateNames) };
setStateClasses.background = function (ele, state) { setStateClass(ele, state, 'mss_background_', translations.stateNames) };
setStateClasses.icon = function (ele, state) { setStateClass(ele, state, 'mss_icon_', {}) }; // This one just uses the state directly, ie, no translation. See usage.
setStateClasses.ping = function (ele, ping) { setStateClass(ele, getPingClass(ping), 'mss_ping_icon_', translations.channelPingClasses) };

// =================================
// Update functions
//
// These functions direct the update process.
// They retrieve the new status json and then process it.
// They create/reset servers/channels in DOM if needed.
// They take care of delegating to the appropriate display code.
// =================================

function refreshStatus() {
	$.getJSON('status.json', null, updateStatus);
}

function updateStatus(status) {
	var displayMode = status.type === 'ping' ? display.ping : display.full;

	displayMode.game(status); // Update display of game status

	// Sort the servers alphabetically
	// Falls back to their short names if we don't have a long name for them
	status.game.servers.sort(function (a, b) {
		var aName = translations.serverNames[a.name] || a.name;
		var bName = translations.serverNames[b.name] || b.name;

		return (aName >= bName) - (aName <= bName);
	});

	var serversContainer = $('#mss_gameServers');

	if (serversContainer.data('serverCount') !== status.game.servers.length) { // rebuild servers if the count is different
		serversContainer.find('.mss_server').remove(); // Remove all elements with the mss_server class
	}

	$.each(status.game.servers, function (i, server) { // jQuery gives us a foreach loop. Too bad there's no language support for it :c
		updateServerStatus(server, displayMode);
	});

	serversContainer.data('serverCount', status.game.servers.length); // Only set this after we added all the channels, in case of errors

	// Login server status
	var login = $('#mss_loginStatusText');
	setStateClasses.text(login, pingToStatus(status.login.ping));
	login.text(localization.states[pingToStatus(status.login.ping)]);
	$('#mss_loginStatus').attr('title', 'Ping: ' + Math.floor(status.login.ping) + "ms");

	// Chat server status
	var chat = $('#mss_chatStatusText');
	setStateClasses.text(chat, pingToStatus(status.chat.ping));
	chat.text(localization.states[pingToStatus(status.chat.ping)]);
	$('#mss_chatStatus').attr('title', 'Ping: ' + Math.floor(status.chat.ping) + "ms");

	// Website status
	var site = $('#mss_siteStatusText');
	setStateClasses.text(site, pingToStatus(status.website.ping));
	site.text(localization.states[pingToStatus(status.website.ping)]);
	$('#mss_siteStatus').attr('title', 'Ping: ' + Math.floor(status.website.ping) + "ms");

	$("#mss_updatedOn").text('Updated on ' + new Date(status.updated).toLocaleString());
	$('#mss_loading').hide();
	$('#mss_data').show();
}

function updateServerStatus(server, displayMode) {
	var dom = getOrCreate.server(server); // We get a dictionary of relevant DOM references here. See implementation.

	displayMode.server(dom, server); // Update the display for this server

	// Handle channels. First step is to sort them
	server.channels.sort(function (a, b) {
		if (a.name === 'HCh')
			return 1;
		else if (b.name === 'HCh')
			return -1;
		else
			return parseInt(a.name.substr(2)) - parseInt(b.name.substr(2));
	});

	if (dom.serverContainer.data('channelCount') !== server.channels.length) { // rebuild channels if the count is different
		dom.serverContainer.find('.mss_serverChannel').remove();
	}

	$.each(server.channels, function (i, channel) { // Just like above!
		updateChannelStatus(server, channel, dom.serverContainer, displayMode);
	});

	dom.serverContainer.data('channelCount', server.channels.length);
}

function updateChannelStatus(server, channel, serverContainer, displayMode) {
	// Man, there's really nothing in this method...
	var dom = getOrCreate.channel(channel, server, serverContainer);

	displayMode.channel(dom, channel);
}

// =================================
// Display code
//
// Because we have to support two different display levels
// (full and ping-only), we need two sets of code we can switch between
// easily. If both paths were contained in a single method,
// it would get really had to maintain. So, we're going to use JS's
// ducktyping in a way that's essentially C++'s polymorphism.
// We're going to create two JS objects. We'll put the same methods on
// body, but each object will have a different implementation.
//
// Example:
// a.speak = function() { alert('moo'); }
// b.speak = function() { alert('baa'); }
//
// var aOrB = chooseAOrB(); // replace with `a` or `b`;
// aOrB.speak(); // shows 'moo' or 'baa' depending on if a or b was chosen
// =================================
display = {}
display.full = {}
display.ping = {}

function pingToStatus(ping) {
	if (ping === 0)
		return -1;
	return 1;
}

// return the css class based on the current ping value in ms
function getPingClass(ping) {
	if (ping === 0) return 'off';
	if (ping < 50) return 'low';
	if (ping < 500) return 'med';
	return 'hi';
}

// --- First up is the full code: ---

// Display code for updating the game status section
display.full.game = function (status) {
	var gameStatusBar = $('#mss_gameBar'); // Cache ref to this element

	// Resize progress bar. If we're in a bad state, make it full
	var newWidth = goodStates.indexOf(status.game.state) === -1 ? 100 : status.game.stress;
	var oldWidth = gameStatusBar.data('widthValue') || 0;

	setStateClasses.background(gameStatusBar, status.game.state); // Color the bar
	gameStatusBar
		.attr('title', 'Mabinogi is ' + status.game.stress + '% full') // Set title
		.data('widthValue', newWidth) // Store new width
		.animate({ width: newWidth + '%' }, fullAniDuration * Math.abs(newWidth - oldWidth) / 100); // Animate it to the new width at a constant speed

	$('#mss_gameStatus').attr('title', 'Mabinogi is ' + status.game.stress + '% full');
	$('#mss_gameStatusText').text(localization.gameStateMessages[status.game.state]);
}

// Display code for updating a server status section
display.full.server = function (dom, server) {
	// updating server icon and load ring
	dom.serverIconWarning.hide(); // Hide warning element
	dom.serverIcon.removeClass('mss_grayscale'); // Remove the grayscaling if it's present
	dom.serverIcon.attr('title', (translations.serverNames[server.name] || server.name) + ' - ' + server.stress + '% full' + '\r\n' + localization.states[server.state]);
	setStateClasses.ring(dom.serverIcon.find('.mss_arc_q'), server.state); // Set the color of the ring

	if (goodStates.indexOf(server.state) !== -1) { // If the state is in the list of good states..
		// All good, so animate the new bar
		animateCircle(dom.serverIcon, server.stress);
	} else {
		// if there is an error, or the server is down, do some extra actions.
		dom.serverIcon.addClass('mss_grayscale'); // Add grayscale class
		dom.serverIconWarning.text(server.state === 5 ? 'Starting...' : ''); // Set warning text

		dom.serverIconWarning.show().attr('title', translations.serverNames[server.name] + '\r\n' + localization.serverStateMessages[server.state]);
		animateCircle(dom.serverIcon, 100); // Animate directly to 100% instead of to the stress value
	}
}

// builds the channel title text for each channel
display.getChannelName = function (channel) {
	if (channel.name in translations.channelNames) {
		return translations.channelNames[channel.name]; // If we have a direct translation, use it
	} else if (channel.name.match(/^Ch[0-9]+$/)) {
		var num = channel.name.substr(2); // If we have a channel name with a number, strip the number and expand the name
		return translations.channelNames["Ch#"].replace("%i", num); // Reintroduce number
	} else {
		return channel.name; // Fall back to whatever the short name of the channel is
	}
}

// Display code for updating a channel section
display.full.channel = function (dom, channel) {
	setStateClasses.ring(dom.channelCircle.find('.mss_arc_q'), channel.state); // Set ring color

	var titleString = display.getChannelName(channel); // Build up the title text
	setStateClasses.icon(dom.channelIcon, null); // Clears old icon
	setStateClasses.ping(dom.pingIcon, channel.ping); // sets the ping bar
	if (goodStates.indexOf(channel.state) !== -1) { // Good state?
		titleString += ' - ' + channel.stress + '% full\r\nPing: ' + Math.floor(channel.ping) + 'ms\r\n' + localization.states[channel.state];
		if (channel.event) { // If there's an event, modify title text and add event state
			titleString += ' | Event';
			setStateClasses.icon(dom.channelIcon, 'event');
		}

		animateCircle(dom.channelCircle, channel.stress); // Animate to the new value
	} else {
		setStateClasses.icon(dom.channelIcon, translations.stateNames[channel.state]); // Set the icon whatever bad state we're in

		titleString += '\r\n' + localization.channelStateMessages[channel.state];
		animateCircle(dom.channelCircle, 100); // Animate directly to 100% instead of stress value
	}

	dom.channelContainer.attr('title', titleString);
}

// --- now set up ping mode ---

// Make sure to set all rotations etc to 100 in here!

display.ping.game = function(status) {
	var gameStatusBar = $('#mss_gameBar'); // Cache ref to this element
	var serverIsOnline = false;
	for (var server of status.game.servers) {
		for (var channel of server.channels) {
			if (channel.ping > 0) {
				serverIsOnline = true;
				server.state = 1;
				break;
			}
		}
	}

	if (status.login.ping !== 0 && serverIsOnline)
		status.game.state = 1;

	// Resize progress bar. It is always full in ping mode
	var newWidth = 100;
	var oldWidth = gameStatusBar.data('widthValue') || 0;
	setStateClasses.background(gameStatusBar, status.game.state); // Color the bar
	gameStatusBar
		.attr('title', 'Load not available') // Set title
		.data('widthValue', newWidth) // Store new width
		.animate({ width: newWidth + '%' }, fullAniDuration * Math.abs(newWidth - oldWidth) / 100); // Animate it to the new width at a constant speed
	$('#mss_gameStatus').attr('title', 'Load not available');
	$('#mss_gameStatusText').text(localization.gameStateMessages[status.game.state]);	
}

display.ping.server = function(dom, server) {
	// updating server icon and load ring
	dom.serverIconWarning.hide(); // Hide warning element
	dom.serverIcon.removeClass('mss_grayscale'); // Remove the grayscaling if it's present
	dom.serverIcon.attr('title', (translations.serverNames[server.name] || server.name) + '\r\n' + localization.states[server.state] + " (load not available)");
	setStateClasses.ring(dom.serverIcon.find('.mss_arc_q'), server.state); // Set the color of the ring
	animateCircle(dom.serverIcon, 100); // Animate directly to 100% instead of to the stress value
	if (server.state != 1) { // if the server is not online
		// if there is an error, or the server is down, do some extra actions.
		dom.serverIcon.addClass('mss_grayscale'); // Add grayscale class
		dom.serverIconWarning.text(server.state === 5 ? 'Starting...' : ''); // Set warning text
		dom.serverIconWarning.show().attr('title', translations.serverNames[server.name] + '\r\n' + localization.serverStateMessages[server.state]);
	}	
}

display.ping.channel = function(dom, channel) {
	var titleString = display.getChannelName(channel); // Build up the title text
	
	setStateClasses.icon(dom.channelIcon, null); // Clears old icon
	setStateClasses.ping(dom.pingIcon, channel.ping); // sets the ping bar

	if (channel.ping > 0) {
		setStateClasses.ring(dom.channelCircle.find('.mss_arc_q'), 7); // Set ring color to ping status
		titleString += '\r\nPing: ' + Math.floor(channel.ping) + 'ms\r\nOnline (ping only)';
	} else {
		setStateClasses.ring(dom.channelCircle.find('.mss_arc_q'), channel.state); // Set ring color
		setStateClasses.icon(dom.channelIcon, translations.stateNames[channel.state]); // Set the icon whatever bad state we're in
		titleString += '\r\n' + localization.channelStateMessages[channel.state];
	}
	animateCircle(dom.channelCircle, 100); // rings are full in ping mode

	dom.channelContainer.attr('title', titleString);
}

// =================================
// Get or Create functions
//
// These functions check if the DOM structure for an item
// needs to be built. If so, they'll create it. Finally,
// they'll return a dictionary of whatever they create/find.
// Grouped into an object for ease of use/namespacing.
// =================================
getOrCreate = {}

getOrCreate.server = function (server) {
	var serverId = server.name;
	var serverContainer = $('#mss_server-' + serverId);
	var serverIcon, serverIconWarning;

	if (!serverContainer.length) {
		// server channel container
		serverContainer = $('<div>')
			.attr('id', 'mss_server-' + serverId)
			.attr('class', 'mss_server')
			.appendTo('#mss_gameServers');

		// server icon
		serverIconWarning = $('<span>')
			.attr('class', 'mss_serverIconWarning')
			.attr('id', 'mss_serverIconWarning-' + serverId)
			.appendTo(serverContainer);

		serverIcon = $('<div>')
			.attr('class', 'mss_iconBox mss_serverIcon-' + serverId)
			.attr('id', 'mss_serverIcon-' + serverId)
			.appendTo(serverContainer);

		for (var i = 0; i < 4; i++) {
			$('<div>').attr('class', 'mss_arc_q mss_arc_q_server').appendTo(serverIcon);
		}

		var arcCover = $('<div>').attr('class', 'mss_arc_cover mss_arc_cover_server').appendTo(serverIcon);
		$('<div>').attr('class', 'mss_arc_cover2 mss_serverIcon-' + serverId).appendTo(arcCover);
	} else {
		serverIcon = serverContainer.find('#mss_serverIcon-' + serverId);
		serverIconWarning = serverContainer.find('#mss_serverIconWarning-' + serverId);
	}

	return { 'serverContainer': serverContainer, 'serverIconWarning': serverIconWarning, 'serverIcon': serverIcon };
};

getOrCreate.channel = function (channel, server, serverContainer) {
	var fullName = server.name + '-' + channel.name;
	var channelContainer = serverContainer.find('#mss_serverChannel-' + fullName);
	var channelCircle, channelIcon, pingIcon;

	if (!channelContainer.length) { // create if it doesn't exist
		channelContainer = $('<div>').attr('id', 'mss_serverChannel-' + fullName)
			.attr('class', 'mss_channel')
			.appendTo(serverContainer);

		channelIcon = $('<span>')
			.attr('id', 'mss_channelIcon-' + fullName)
			.attr('class', 'mss_channelIcon')
			.appendTo(channelContainer);

		pingIcon = $('<span>')
			.attr('id', 'mss_pingIcon-' + fullName)
			.attr('class', 'mss_pingIcon')
			.appendTo(channelIcon);

		channelCircle = $('<div>')
			.attr('id', 'mss_channelCircle-' + fullName)
			.attr('class', 'mss_channelCircle')
			.appendTo(channelContainer);

		for (var i = 0; i < 4; i++) {
			$('<div>').attr('class', 'mss_arc_q mss_arc_q_channel').appendTo(channelCircle);
		}

		$('<div>').attr('class', 'mss_arc_cover mss_arc_cover_channel').appendTo(channelCircle);

		var name = $('<div>').attr('class', 'mss_channelName').appendTo(channelCircle);

		if (channel.name === 'HCh') {
			name.addClass('mss_housingChannel');
		} else {
			name.text(channel.name);
		}
	} else {
		channelCircle = channelContainer.find('#mss_channelCircle-' + fullName);
		pingIcon = channelContainer.find('#mss_pingIcon-' + fullName);
		channelIcon = channelContainer.find('#mss_channelIcon-' + fullName);
	}

	return { 'channelContainer': channelContainer, 'channelCircle': channelCircle, 'channelIcon': channelIcon, 'pingIcon': pingIcon };
};

// =================================
// ---- Stress circle animations ----
//
// Code for animating the circles
// =================================

function animateCircle(circleContainer, nextValue) {
	var current = circleContainer.data('currentRotation') || 0; // Get current rotation of the ring
	nextValue = 360 * nextValue / 100; // Convert nextvalue from percent to degrees
	var duration = (Math.abs(nextValue - current) / 360) * fullAniDuration; // Ensure a constant rotational velocity

	// Animate it using jQuery. We create an 'anonymous' (unnamed) object
	// with a member 'deg' set to the current value. Then we instruct
	// jQuery to animate this value to `nextValue`, using the duration we calculated above.
	// jQuery will call the `step` function with incremental numbers until we get to nextValue.
	// For example, animating from 1~4 would result in the step function being called
	// with 1, 2, 3, 4. jQuery times the calls so the animation takes exactly as long as we asked for.
	// Our step function sets the ring rotations. On completion of the animation, store the new rotation.
	//
	// See also: http://api.jquery.com/animate/
	$({ deg: current }).animate({ deg: nextValue }, {
		duration: duration,
		step: function (now) { setCircleRotation(circleContainer, now); },
		complete: function () { circleContainer.data('currentRotation', nextValue); } // Store the current rotation
	});
}

function setCircleRotation(circleContainer, rotation) {
	// Circles are 4 square elements with a border on one side.
	// Border radius makes them curve. The elements are arranged
	// so that they "telescope" out as they're rotated. Eg, first
	// only rotates up to 90, second up to 180, etc. A side effect
	// of this is that angles less than 90 degrees 'reverse rotate'
	// around the top of the circle. To combat this, we put a cover
	// element over the 270~360 portion of the circle, which we
	// activate if there would be reverse-overhang.

	var quadrant = 1;
	circleContainer.find('.mss_arc_q').each(function () {
		var rotateAmount = Math.min(quadrant * 90, rotation) - 90; // 0 degrees is pointing to the right, so subtract 90 to make it point up
		rotateAmount -= 45; // This aligns the midpoint of the square, so we get the proper curve

		var val = 'rotate(' + rotateAmount + 'deg)';
		$(this).css(
			'-webkit-transform', val,
			'-moz-transform', val,
			'-ms-transform', val,
			'-o-transform', val,
			'transform', val
		);

		quadrant++;
	});

	var cover = circleContainer.find('.mss_arc_cover');

	if (rotation > 90)
		cover.hide();
	else
		cover.show();
}