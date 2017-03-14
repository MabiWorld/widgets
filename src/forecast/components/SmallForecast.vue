<template>
	<div>
		<div class="forecast-small-weather" :class="classes"></div>
	</div>
</template>

<script>
	import {Clock} from 'time';
	export default {
		name: 'small-forecast',
		props: ['forecast'],
		data: function() {
			return {
				clock: Clock.now
			};
		},
		computed: {
			classes() {
				return ['forecast-intensity_' + this.intensity, this.currentlyNight ? 'night' : 'day'].join(' ');
			},
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
