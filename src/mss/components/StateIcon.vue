<template>
	<span class="mss-state-icon" :class="iconClasses"></span>
</template>

<script>
	export default {
		name: 'state-icon',
		props: ['state', 'event'],
		computed: {
			iconClasses() {
				// Put the event first so it gets overridden if we have a more explicit state
				return [this.eventClass, this.iconClass].join(' ');
			},
			eventClass() {
				return this.event ? 'mss-state-icon-event' : '';
			},
			iconClass() {
				return 'mss-icon-' + this.state;
			}
		}
	};

</script>
