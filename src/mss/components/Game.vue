<template>
	<div>
		<slot :state="game.state" :event="game.event" :stress="game.stress" :orderedServers="sortedServers"
			:stressMsg="stressMsg" :stateMsg="stateMsg"></slot>
	</div>
</template>

<script>
	export default {
		name: 'game',
		props: ['game'],
		computed: {
			stressMsg() {
				return this.game.stress < 0 
					? this.$t('game.stress.na') 
					: this.$t('game.stress.stress', { stress: this.game.stress });
			},
			stateMsg() {
				return this.$t('game.state.' + this.game.state);
			},
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
