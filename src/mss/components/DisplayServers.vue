<template>
	<div class="mss-game-servers">
		<Server v-for="server in servers" :key="server.name" :server="server">
			<slot></slot>
		</Server>
	</div>
</template>

<script>
	import Server from './Server';

	export default {
		name: 'display-servers',
		props: ['servers'],
		components: {
			Server
		}
	};

</script>
