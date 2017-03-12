<template>
	<div class="mss-channel">
		<slot :id="channel.name" :stress="channel.stress" :state="channel.state" :event="channel.event" :ratedPing="ratedPing"></slot>
	</div>
</template>

<script>
	import { ratePing } from './ratePing.filter';

	export default {
		name: 'channel',
		props: ['channel'],
		computed: {
			ratedPing: function () {
				return ratePing(this.channel.ping);
			}
		}
	};

</script>
