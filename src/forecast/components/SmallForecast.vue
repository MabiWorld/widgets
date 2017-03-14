<template>
	<div>
		<div class="forecast-small-weather" :class="classes"></div>
	</div>
</template>

<script>
	export default {
		name: 'small-forecast',
		props: ['forecast'],
		computed: {
			classes() {
				return ['forecast-intensity_' + this.intensity, this.currentlyNight ? 'night' : 'day'].join(' ');
			},
			currentlyNight() {
				return this.forecast.startTime.isNight();
			},
			intensity() {
				return this.forecast.intensity;
			}
		}
	};
</script>
