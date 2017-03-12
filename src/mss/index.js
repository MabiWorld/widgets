// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

import ServerStatus from './ServerStatus';
import DisplayServers from './components/DisplayServers';
import DisplayChannels from './components/DisplayChannels';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	el: '#server-stat',
	components: { ServerStatus, DisplayServers, DisplayChannels },
	data: function () {
		return {
			status: { "login": { "ping": 18.100976943969727 }, "game": { "state": -1, "servers": [{ "state": -1, "name": "mabius2", "channels": [{ "state": -1, "name": "HCh", "ping": 16.861677169799805, "stress": 0, "event": false }, { "state": -1, "name": "Ch4", "ping": 18.57161521911621, "stress": 0, "event": false }, { "state": -1, "name": "Ch2", "ping": 18.084049224853516, "stress": 0, "event": false }, { "state": -1, "name": "Ch7", "ping": 16.770362854003906, "stress": 0, "event": false }, { "state": -1, "name": "Ch6", "ping": 18.608570098876953, "stress": 0, "event": false }, { "state": -1, "name": "Ch3", "ping": 18.0203914642334, "stress": 0, "event": false }, { "state": -1, "name": "Ch1", "ping": 18.07999610900879, "stress": 0, "event": false }, { "state": -1, "name": "Ch5", "ping": 18.614530563354492, "stress": 0, "event": false }], "stress": 0, "event": false }, { "state": -1, "name": "mabius4", "channels": [{ "state": -1, "name": "HCh", "ping": 17.453670501708984, "stress": 0, "event": false }, { "state": -1, "name": "Ch4", "ping": 17.20881462097168, "stress": 0, "event": false }, { "state": -1, "name": "Ch2", "ping": 19.05226707458496, "stress": 0, "event": false }, { "state": -1, "name": "Ch7", "ping": 17.453670501708984, "stress": 0, "event": false }, { "state": -1, "name": "Ch6", "ping": 17.296791076660156, "stress": 0, "event": false }, { "state": -1, "name": "Ch1", "ping": 17.470359802246094, "stress": 0, "event": false }, { "state": -1, "name": "Ch3", "ping": 18.022537231445312, "stress": 0, "event": false }, { "state": -1, "name": "Ch5", "ping": 16.648054122924805, "stress": 0, "event": false }], "stress": 0, "event": false }, { "state": -1, "name": "mabius1", "channels": [{ "state": -1, "name": "HCh", "ping": 17.310380935668945, "stress": 0, "event": false }, { "state": -1, "name": "Ch4", "ping": 18.685102462768555, "stress": 0, "event": false }, { "state": -1, "name": "Ch2", "ping": 18.216371536254883, "stress": 0, "event": false }, { "state": -1, "name": "Ch7", "ping": 18.185138702392578, "stress": 0, "event": false }, { "state": -1, "name": "Ch6", "ping": 18.478870391845703, "stress": 0, "event": false }, { "state": -1, "name": "Ch1", "ping": 17.696857452392578, "stress": 0, "event": false }, { "state": -1, "name": "Ch3", "ping": 17.3337459564209, "stress": 0, "event": false }, { "state": -1, "name": "Ch5", "ping": 18.340587615966797, "stress": 0, "event": false }], "stress": 0, "event": false }, { "state": -1, "name": "mabius3", "channels": [{ "state": -1, "name": "HCh", "ping": 18.64933967590332, "stress": 0, "event": false }, { "state": -1, "name": "Ch4", "ping": 16.756772994995117, "stress": 0, "event": false }, { "state": -1, "name": "Ch2", "ping": 16.84713363647461, "stress": 0, "event": false }, { "state": -1, "name": "Ch7", "ping": 18.08452606201172, "stress": 0, "event": false }, { "state": -1, "name": "Ch6", "ping": 16.93129539489746, "stress": 0, "event": false }, { "state": -1, "name": "Ch3", "ping": 16.797542572021484, "stress": 0, "event": false }, { "state": -1, "name": "Ch1", "ping": 18.813371658325195, "stress": 0, "event": false }, { "state": -1, "name": "Ch5", "ping": 17.01974868774414, "stress": 0, "event": false }], "stress": 0, "event": false }], "stress": 0, "event": false }, "chat": { "ping": 17.219066619873047 }, "updated": "2017-03-12T03:41:51.274467", "type": "ping", "website": { "ping": 16.610145568847656 } }
		};
	}
});
