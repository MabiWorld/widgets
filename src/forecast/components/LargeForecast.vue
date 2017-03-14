<template>
	<div>
		<transition name="forecast-big-daychange">
			<div key="night" v-if="currentlyNight" class="forecast-big-bg night"></div>
			<div key="day" v-else class="forecast-big-bg day"></div>
		</transition>
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
				return Math.floor(this.clock.real.seconds() / 6) % 2;
			},
			intensity() {
				return this.forecast.intensity;
			}
		}
	};
</script>
