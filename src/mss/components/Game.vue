<template>
	<div class="mss-game-status">
		<slot :state="game.state" :event="game.event" :stress="game.stress"></slot>
	</div>
</template>

<script>
	export default {
		name: 'game',
		props: ['game'],
		computed: {

		}
	};

</script>
