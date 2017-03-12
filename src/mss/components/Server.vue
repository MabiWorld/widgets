<template>
	<div class="mss-server">
		<slot :id="server.name" :localName="localName" :stress="server.stress" :state="server.state" :event="server.event" :channels="server.channels"></slot>
	</div>
</template>

<script>
	import { isBadState } from './isState.filter';

	export default {
		name: 'server',
		props: ['server'],
		computed: {
			localName: function () {
				return this.server.name;
			},
			isBadState: function () {
				return isBadState(this.server.state);
			}
		}
	};

</script>
