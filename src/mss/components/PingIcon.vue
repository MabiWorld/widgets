<template>
	<span class="mss-ping-icon" :class="iconClasses"></span>
</template>

<script>
	export default {
		name: 'ping-icon',
		props: ['ratedPing'],
		computed: {
			iconClasses() {
				return 'mss-ping-icon-' + this.ratedPing;
			}
		}
	};

</script>
