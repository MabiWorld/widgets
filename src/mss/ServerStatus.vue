<template>
	<div class="mss-box">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		name: 'server-status',
		props: ['status']
	};

</script>

<style>

</style>
