(function () {
	angular.module('serverStat').controller('serverStatCtrl', ServerStatController);

	ServerStatController.$inject = ['statusService', '$translate', '$interval'];
	function ServerStatController(statusService, $translate, $interval) {
		var vm = this;

		vm.status = undefined;
		vm.updates = 0;
		vm.updateStatus = updateStatus;
		vm.channelComparator = channelComparator;
		vm.serverComparator = serverComparator;

		updateStatus();
		$interval(updateStatus, 30 * 1000);

		function updateStatus() {
			statusService.get().then(function (status) {
				vm.updates += 1;
				vm.status = status;
			}).catch(function (err) {
				console.error("Failed to load status", err);
				vm.status = undefined;
			});
		}

		function channelComparator(a, b) {
			if (a.value === 'HCh')
				return 1;
			else if (b.value === 'HCh')
				return -1;
			else
				return (a.value < b.value) ? -1 : 1;
		};

		function serverComparator(a, b) {
			var aTrans = $translate.instant('server.name.' + a.value);
			var bTrans = $translate.instant('server.name.' + b.value);

			return (aTrans < bTrans) ? -1 : 1;
		}
	}
})();