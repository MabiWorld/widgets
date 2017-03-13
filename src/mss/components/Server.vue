<template>
	<div>
		<slot :id="server.name" :localName="localName" :stress="server.stress" :state="server.state" :event="server.event" :channels="sortedChannels"></slot>
	</div>
</template>

<script>
	import { isBadState } from './isState.filter';

	export default {
		name: 'server',
		props: ['server'],
		computed: {
			localName: function () {
				return this.$t('server.name.' + this.server.name);
			},
			isBadState: function () {
				return isBadState(this.server.state);
			},
			sortedChannels: function () {
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
