(function () {
	angular.module('serverStat').config(configure);

	configure.$inject = ['$translateProvider'];
	function configure($translateProvider) {
		var translations = {
			state: {
				offline: 'Offline',
				maintenance: 'Maintenance',
				online: 'Online',
				busy: 'Busy',
				full: 'Full',
				bursting: 'Bursting',
				booting: 'Starting',
				error: 'Error'
			},
			game: {
				state: {
					offline: 'Mabinogi is currently offline',
					maintenance: 'Mabinogi is undergoing maintenance',
					online: 'Mabinogi is online',
					busy: 'Mabinogi is busy',
					full: 'Mabinogi is almost full',
					bursting: 'Mabinogi is at maximum capacity',
					booting: 'Mabinogi servers are booting up...',
					error: 'There is an error with the servers'
				},
				stress: {
					stress: '{{ stress }}% full',
					na: 'Load not available'
				}
			},
			server: {
				desc: {
					full: "{{ ('server.name.' + name) | translate }} - {{ stress }}% full\r\n{{ ('server.state.' + state) | translate }}",
					ping: "{{ ('server.name.' + name) | translate }}\r\n{{ ('server.state.' + state) | translate }} (load not available)"
				},
				state: {
					offline: 'This server is offline',
					maintenance: 'This server is currently undergoing maintenance',
					online: 'Online',
					busy: 'Busy',
					full: 'Full',
					bursting: 'Bursting',
					booting: 'This server is currently starting, please wait a little',
					error: 'This server currently has an error'
				},
				name: {
					mabius1: 'Mari',
					mabius2: 'Ruairi',
					mabius3: 'Tarlach',
					mabius4: 'Alexina'
				}
			},
			channel: {
				desc: {
					full: "{{ ('channel.name.' + name) | translate }} - {{ stress }}% full\r\nPing: {{ ping | number:0 }}ms\r\n{{ ('channel.state' + state) | translate }}",
					ping: "{{ ('channel.name.' + name) | translate }}\r\nPing: {{ ping | number:0 }}ms\r\nOnline (load not available)"
				},
				state: {
					offline: 'This channel is offline',
					maintenance: 'This channel is currently undergoing maintenance',
					online: 'Online',
					busy: 'Busy',
					full: 'Full',
					bursting: 'Bursting',
					booting: 'This channel is currently starting, please wait a little',
					error: 'This channel currently has an error'
				},
				name: {
					Ch1: 'Channel 1',
					Ch2: 'Channel 2',
					Ch3: 'Channel 3',
					Ch4: 'Channel 4',
					Ch5: 'Channel 5',
					Ch6: 'Channel 6',
					Ch7: 'Channel 7',
					HCh: 'Housing Channel',
				}
			},
			website: {
				name: 'Website',
				desc: "Ping: {{ping | number:0 }}ms"
			},
			login: {
				name: 'Login',
				desc: "Ping: {{ping | number:0 }}ms"
			},
			chat: {
				name: 'Chat',
				desc: "Ping: {{ping | number:0 }}ms"
			},
			updated: "Updated on {{updated | date:'short'}}",
			byline: '<div><small>Created by <a href="http://wiki.mabinogiworld.com/view/User:Xcelled194">Xcelled</a> and <a href="http://wiki.mabinogiworld.com/view/User:Kadalyn">Kadalyn</a></small></div><div><small>Design by <a href="http://wiki.mabinogiworld.com/view/User:Yai">Yai</a></small></div>'
		};

		$translateProvider
			.translations('en', translations)
			.preferredLanguage('en');
	}
})();