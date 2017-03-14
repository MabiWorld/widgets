<template>
	<div>
		<div class="forecast-big-bg" :class="{day: !currentlyNight, night: currentlyNight}"></div>
		<div class="forecast-big-weather" :class="'forecast-intensity_' + intensity"></div>
	</div>
</template>

<script>
	import {Clock} from 'time';

	export default {
		name: 'large-forecast',
		props: ['forecast'],
		computed: {
			currentlyNight() {
				return Clock.now.erinn.isNight();
			},
			intensity() {
				return this.forecast.intensity;
			}
		}
	};
</script>
