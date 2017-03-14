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
		data: function() {
			return {
				clock: Clock.now
			};
		},
		computed: {
			until() {
				return this.forecast.startTime - this.clock.real;	
			},
			currentlyNight() {
				if (this.until > 0) {
					return this.forecast.startTime.toErinn().isNight();
				}
				return this.clock.erinn.isNight();
			},
			intensity() {
				return this.forecast.intensity;
			}
		}
	};
</script>
