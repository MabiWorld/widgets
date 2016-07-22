goodStates = [1, 2, 3, 4]; // For easy testing of if we're in a good state or not
fullAniDuration = 2000; // How long it should take an animation to go from 0% to 100%. Used to make animations run at a constant speed

localization = {
	states: {
		'-1': 'Offline',
		0: 'Maintenance',
		1: 'Online',
		2: 'Busy',
		3: 'Full',
		4: 'Bursting',
		5: 'Starting',
		6: 'Error'
	}
};

translations = {
	serverNames: {
		'mabius1': 'Mari',
		'mabius2': 'Ruairi',
		'mabius3': 'Tarlach',
		'mabius4': 'Alexina'
	},

	channelNames: {
		'Ch#': 'Channel %i',
		'HCh': 'Housing Channel'
	},

	stateNames: {
		'-1': 'offline',
		0: 'maintenance',
		1: 'online',
		2: 'busy',
		3: 'full',
		4: 'bursting',
		5: 'booting',
		6: 'error',
	},
}

function Mss($container) {

}

function TextOutput(type) {
	this.query = function (data) {
		if (type == 'ping') {
			return data.ping;
		} else if (type == 'status') {
			var status = translations.stateNames[data.state];
			if (!status) {
				console.warn('Unexpected state: ' + data.state);
			}
			return status;
		} else if (type == 'name') {

		}
	}
}

function makeTexts($container) {
	$container.find('.make-text').each(function() {
		var $ele = $(this);
		var args = parseSettingsDom($ele);

		var text;
		if (args.type == 'ping')
	});
}

function StatusSelector(cases) {
	var entries = {};
	for (var i = cases.length - 1; i >= 0; --i) {
		entries[cases[i].case] = cases[i].value;
	}

	this.select = function(data) {
		var status = translations.stateNames[data.state];
		if (status) {
			return entries[status] || entries['else'];
		} else {
			console.warn('Unexpected state: ' + data.state);
		}
	}
}

function PingSelector(cases) {
	cases.sort(function(a, b) {
		if (a.case == 'else') return -1;
		if (b.case == 'else') return 1;
		return parseInt(a.case) - parseInt(b.case);
	});

	this.select = function(data) {
		var ping = data.ping;
		for (var i = cases.length-1; i >= 0; --i) {
			var _case = cases[i];
			if (_case.case == 'else' || ping >= _case.case)
				return _case.value;
		}
	}
}

function makeSelects($container) {
	$container.find('.make-select').each(function() {
		var $select = $(this);
		var args = parseSettingsDom($select.children('.settings'));
		var cases = [];
		$select.children('ul, ol').children().each(function() {
			cases.push(parseSettingsDom($(this)));
		});

		$select.empty().removeClass('make-select').addClass('mss-select');

		var selector;
		if (args.type == 'ping') {
			selector = new PingSelector(cases);
		} else if (args.type == 'status') {
			selector = new StatusSelector(cases);
		} else {
			console.warn('Unknown select type: ' + args.type);
		}
		$select.data('selector', selector);
	});
}

// Onload
$(function() {
	$('.make-mss').each(function() {
		var $this = $(this);
		makeSelects($this);
		$this.removeClass('make-mss').addClass('mss');
		$this.data('mss', new Mss($this));
	});
});