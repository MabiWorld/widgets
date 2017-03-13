<template>
	<div>
		<slot :id="channel.name" :stress="channel.stress" :state="channel.state" :event="channel.event" :ratedPing="ratedPing" :localName="localName"
			:fullDesc="fullDesc" :pingDesc="pingDesc" :stressMsg="stressMsg" :stateMsg="stateMsg" :intPing="intPing"></slot>
	</div>
</template>

<script>
	import { ratePing } from './ratePing.filter';

	export default {
		name: 'channel',
		props: ['channel'],
		computed: {
			ratedPing() {
				return ratePing(this.channel.ping);
			},
			intPing() {
				return this.channel.ping.toFixed(0);
			},
			fullDesc() {
				const event = this.channel.event ? this.$t('channel.event') : '';
				return this.$t('channel.desc.full', { name: this.localName, state: this.stateMsg, stress: this.stressMsg, ping: this.intPing, event: event });
			},
			pingDesc() {
				return this.$t('channel.desc.ping', { name: this.localName, ping: this.intPing });
			},
			stressMsg() {
				return this.$t('channel.stress', { stress: this.channel.stress });
			},
			stateMsg() {
				return this.$t('state.' + this.channel.state);
			},
			localName() {
				return this.$t('channel.name.' + this.channel.name);
			}
		}
	};

</script>
