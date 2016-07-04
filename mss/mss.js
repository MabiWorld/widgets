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

	channelPingClasses: {
		'off': 'offline',
		'low': 'good',
		'med': 'moderate',
		'hi' : 'bad'
	}
}

function Mss($container) {
	
}

// Onload
$(function() {
	$('.make-mss').each(function() {
		$this = $(this);
		$this.removeClass('make-mss').addClass('mss');
		$this.data('mss', new Mss($this));
	});
});