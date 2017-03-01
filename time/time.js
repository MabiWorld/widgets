angular.module('time', [])
	.factory('timeSvc', function () {
		return {
			boundUp: function (date) {
				date = moment(date);
				var mn = date.minutes();
				if (mn < 20) date.minutes(20);
				else if (mn < 40) date.minutes(40);
				else date.add(1, "hour").minutes(0);
				return date;
			},
			
			boundDown: function (date) {
				date = moment(date);
				var mn = date.minutes();
				if (mn < 20) date.minutes(0);
				else if (mn < 40) date.minutes(20);
				else date.minutes(40);
				return date;
			}
		}
	});