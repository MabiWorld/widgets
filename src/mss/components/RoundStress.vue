<template>
	<round-progress :class="stateClass" :radius="radius" :stroke="strokeWidth" :duration="duration" :max="100" :current="stress < 0 ? 100 : stress"
	 :color="null"></round-progress>
</template>

<script>
	import RoundProgress from './RoundProgress';

	export default {
		name: 'round-stress',
		props: {
			stress: {
				type: Number,
				required: true
			},
			radius: {
				type: Number,
				required: true
			},
			state: {
				type: String,
				required: false,
				default: null
			},
			strokeWidth: {
				type: Number,
				required: false,
				default: 4
			},
			duration: {
				type: Number,
				required: false,
				default: 2000
			}
		},
		computed: {
			stateClass() {
				return this.state ? 'mss-stroke-' + this.state : '';
			}
		},
		components: { RoundProgress }
	};

</script>
