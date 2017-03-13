<template>
	<div>
		<slot :state="server.state" :stateMsg="stateMsg" :localName="localName"></slot>
	</div>
</template>

<script>
	export default {
		name: 'other-server',
		props: ['server', 'id'],
		computed: {
			stateMsg() {
				return this.$t('state.' + this.server.state);
			},
			localName() {
				return this.$t(this.id + '.name');
			}
		}
	};

</script>
