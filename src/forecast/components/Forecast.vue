<template>
	<div>
		<area-forecast v-for="(area, id) in areas" :key="id" :area="area" class="forecast-area"></area-forecast>
	</div>
</template>

<script>
	import Vue from 'vue';
	import AreaForecast from './AreaForecast';
	import ForecastService from '../services/Forecast';

	export default {
		name: 'forecast',
		props: {
			future: {
				type: Number,
				required: false,
				default: 3
			}
		},
		data: function () {
			return {
				areas: undefined
			};
		},
		components: { AreaForecast },
		methods: {
			getNextForecast() {
				const self = this;
				ForecastService.next(this.future + 1).then((areas) => {
					Vue.set(self, 'areas', areas);
				});
			}
		},
		created() {
			this.getNextForecast();
		}
	};

</script>
