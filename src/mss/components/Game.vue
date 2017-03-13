<template>
	<div>
		<slot :state="game.state" :event="game.event" :stress="game.stress" :orderedServers="sortedServers"></slot>
	</div>
</template>

<script>
	export default {
		name: 'game',
		props: ['game'],
		computed: {
			sortedServers() {
				var self = this;
				function sort(a, b) {
					var aTrans = self.$t('server.name.' + a.name);
					var bTrans = self.$t('server.name.' + b.name);

					return (aTrans < bTrans) ? -1 : 1;
				}

				return self.game.servers.concat().sort(sort);
			}
		}
	};

</script>
