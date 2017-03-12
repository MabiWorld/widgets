// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

import ServerStatus from './ServerStatus';
import DisplayServers from './components/DisplayServers';
import DisplayChannels from './components/DisplayChannels';
import Game from './components/Game';
import Server from './components/Server';
import Channel from './components/Channel';
import StatusService from './services/status';

Vue.config.productionTip = false;

/* eslint-disable no-new */
const vm = new Vue({
	el: '#server-stat',
	components: { ServerStatus, DisplayServers, DisplayChannels, Game, Server, Channel },
	data: function () {
		return {
			status: undefined
		};
	}
});

updateStatus();

function updateStatus() {
	StatusService.get().then((status) => {
		Vue.set(vm, 'status', status);
	}).catch((err) => {
		console.warn(err);
		vm.status = undefined;
	});
}
