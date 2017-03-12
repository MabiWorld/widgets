<template>
	<div class="mss-game-servers">
		<slot v-for="server of servers" :server="server"></slot>
	</div>
</template>

<script>
	export default {
		name: 'display-servers',
		props: ['servers'],
		components: {
		}
	};

</script>
