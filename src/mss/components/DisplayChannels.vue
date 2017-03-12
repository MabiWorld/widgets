<template>
	<div class="mss-server-channels">
		<slot v-for="channel of channels" :channel="channel"></slot>
	</div>
</template>

<script>
	export default {
		name: 'display-channels',
		props: ['channels'],
		components: {
		}
	};

</script>
