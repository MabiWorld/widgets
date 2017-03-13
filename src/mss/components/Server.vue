<template>
	<div>
		<slot :id="server.name" :localName="localName" :stress="server.stress" :state="server.state" :event="server.event" :channels="sortedChannels"
			:fullDesc="fullDesc" :pingDesc="pingDesc" :stressMsg="stressMsg" :stateMsg="stateMsg"></slot>
	</div>
</template>

<script>
	import { isBadState } from './isState.filter';

	export default {
		name: 'server',
		props: ['server'],
		computed: {
			fullDesc() {
				return this.$t('server.desc.full', { name: this.localName, state: this.stateMsg, stress: this.stressMsg });
			},
			pingDesc() {
				return this.$t('server.desc.ping', { name: this.localName, state: this.stateMsg });
			},
			stressMsg() {
				return this.$t('server.stress', { stress: this.server.stress });
			},
			stateMsg() {
				return this.$t('state.' + this.server.state);
			},
			localName() {
				return this.$t('server.name.' + this.server.name);
			},
			isBadState() {
				return isBadState(this.server.state);
			},
			sortedChannels() {
				function compare(a, b) {
					if (a.name === 'HCh') {
						return 1;
					} else if (b.name === 'HCh') {
						return -1;
					} else {
						return (a.name < b.name) ? -1 : 1;
					}
				}

				return this.server.channels.concat().sort(compare);
			}
		}
	};

</script>
