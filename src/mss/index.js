// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import ServerStatus from './ServerStatus';
import DisplayServers from './components/DisplayServers';
import DisplayChannels from './components/DisplayChannels';
import Game from './components/Game';
import Server from './components/Server';
import Channel from './components/Channel';
import StatusService from './services/status';

import RoundProgress from './components/RoundProgress';

Vue.config.productionTip = false;

Vue.use(VueI18n);

Vue.config.lang = 'en';

var locales = {
	en: {
		state: {
			offline: 'Offline',
			maintenance: 'Maintenance',
			online: 'Online',
			busy: 'Busy',
			full: 'Full',
			bursting: 'Bursting',
			booting: 'Starting',
			error: 'Error',
			ping: 'Ping Only'
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
				stress: '{stress}% full',
				na: 'Load not available'
			}
		},
		server: {
			desc: {
				state: "{name} - { stress }% full\r\n{state}",
				ping: "{name}\r\n{state} (load not available)"
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
			event: '| Event',
			desc: {
				state: "{name} - {stress}% full\r\nPing: {ping}ms\r\n{state} {event}",
				ping: "{name}\r\nPing: {ping}ms\r\nOnline (load not available)"
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
				HCh: 'Housing Channel'
			}
		},
		website: {
			name: 'Website',
			desc: "Ping: {ping}ms"
		},
		login: {
			name: 'Login',
			desc: "Ping: {ping}ms"
		},
		chat: {
			name: 'Chat',
			desc: "Ping: {ping}ms"
		},
		updated: "Updated on {updated}",
		byline: '<div><small>Created by <a href="http://wiki.mabinogiworld.com/view/User:Xcelled194">Xcelled</a> and <a href="http://wiki.mabinogiworld.com/view/User:Kadalyn">Kadalyn</a></small></div><div><small>Design by <a href="http://wiki.mabinogiworld.com/view/User:Yai">Yai</a></small></div>'
	}
};

Object.keys(locales).forEach(function (lang) {
	Vue.locale(lang, locales[lang]);
});

/* eslint-disable no-new */
const vm = new Vue({
	el: '#server-stat',
	components: { ServerStatus, DisplayServers, DisplayChannels, Game, Server, Channel, RoundProgress },
	data: function () {
		return {
			status: undefined,
			timer: undefined
		};
	},
	methods: {
		updateStatus() {
			StatusService.get().then((status) => {
				Vue.set(vm, 'status', status);
			}).catch((err) => {
				console.warn(err);
				vm.status = undefined;
			});
		}
	},

	created() {
		setTimeout(this.updateStatus);
		this.timer = setInterval(this.updateStatus, 30 * 1000);
	},

	beforeDestroy() {
		clearInterval(this.timer);
	}
});
