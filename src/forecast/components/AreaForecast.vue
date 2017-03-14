<template>
	<div>
		<div class="forecast-area-title">{{ area.id }}</div>
		<large-forecast class="forecast-area-today" :title="area.now.intensity" :forecast="area.now"></large-forecast>
		<div class="area-forecast" :class="'forecast-area-' + area.id">
			<table v-if="area.next">
				<tr>
					<td v-for="next in area.next" :title="next.intensity">
						<small-forecast :forecast="next"></small-forecast>
					</td>
				</tr>
				<tr>
					<td v-for="next in area.next">{{next.startTime.format('H:mm')}}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	import LargeForecast from './LargeForecast';
	import SmallForecast from './SmallForecast';

	export default {
		name: 'area-forecast',
		props: ['area'],
		components: {
			LargeForecast,
			SmallForecast
		}
	};
</script>
