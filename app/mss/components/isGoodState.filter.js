(function () {
	angular.module('serverStat')
		.filter('isGoodState', function () { return isGoodState; })
		.filter('isBadState', function () { return isBadState; });
	
	var goodStates = ['online', 'busy', 'full', 'bursting'];

	function isGoodState(state) {
		return goodStates.indexOf(state) != -1;
	}

	function isBadState(state) {
		return !isGoodState(state);
	}
})();