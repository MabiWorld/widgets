// type
//  1: Tir Chonaill, Dugald Aisle, Dugald Residential + Castle
//  2: Dunbarton, Gairech, Port Cobh, Fiodh
//  3: Bangor
//  4: Emain Macha
//  5: Sen Mag, Sen Mag Residential + Castle
//  6: Port Cean, Morva Aisle
//  7: Rano, Nubes
//  8: Connous
//  9: Courcle, Iria Falls
//  10: Physis, Zardine
//  11: Shadow Realm
//  12: Tailleann, Tara, Corrib Valley, Blago Prarie, Sliab Cuilin, Abb Neagh
//  13: ?? Probably Nekojima/Doki Doki Island
// Default (visibly): Belvast, scath, shyllien, avon, tnn, Solea, Sidhe (but always snowing), Osna, Coill, Ceo
//     Abb Neagh Residential, Sliab Cuilin Residential + Castle
// Unchecked: Doki Doki, Beginner zones, AW, Falias

function boundUp(date) {
	date = moment(date);
	var mn = date.minutes();
	if (mn < 20) date.minutes(20);
	else if (mn < 40) date.minutes(40);
	else date.add(1, "hour").minutes(0);
	return date;
}

function boundDown(date) {
	date = moment(date);
	var mn = date.minutes();
	if (mn < 20) date.minutes(0);
	else if (mn < 40) date.minutes(20);
	else date.minutes(40);
	return date;
}

angular.module('forecast', [])
	.factory('forecastSvc', ['$http', function ($http) {
		// TODO: Make i18n a service?
		var l18n = {
			"type1": "Northern Uladh",
			"type2": "Dunbarton area",
			"type3": "Bangor",
			"type4": "Emain Macha",
			"type5": "Sen Mag Plateau",
			"type6": "Southern Uladh",
			"type7": "Rano",
			"type8": "Connous",
			"type9": "Courcle",
			"type10": "Northern Iria",
			"zardine": "Zardine",
			"physis": "Physis",
			"type11": "The Shadow Realm",
			"type12": "Western Uladh",
			"type13": "Doki Doki Island??",

			"intensity": {
				"-9": "Random weather!",
				"-8": "Clear skies",
				"-7": "Partly cloudy",
				"-6": "Partly cloudy",
				"-5": "Cloudy",
				"-4": "Cloudy",
				"-3": "Very cloudy",
				"-2": "Very cloudy",
				"-1": "Very cloudy",
				20: "Thunder storm (110% success bonus)",
				"custom": { "physis": {} }
			},
		};

		for (var i = 0; i < 20; ++i) {
			var bonus = Math.floor(i / 2);
			var iio = "intensity index of " + i.toString() + " (" + (bonus ? (100 + bonus).toString() + "%" : "no") + " success bonus)";
			l18n.intensity[i] = "Raining, " + iio;
			l18n.intensity.custom.physis[i] = "Snowing, " + iio;
		}

		function intensity(v, id) {
			var ww = l18n.intensity, lic = l18n.intensity.custom;
			if (id in lic && v in lic[id]) {
				ww = lic[id];
			}
			return ww[v];
		}

		return {
			/**
			 * @name get
			 * @description Returns a promise of the number of specified next forecast datapoints. Includes "now".
			 */
			get: function (number) {
				return $http.get('http://mabi.world/forecast.php', { params: { duration: number } }).then(function (response) {
					var data = response.data;
					var ret = {}
					// TODO: data.errors

					// Separate Physis and Zardine
					data.forecast.physis = data.forecast.type10;
					data.forecast.zardine = data.forecast.type10;

					var from = moment(data.from);

					for (var id in data.forecast) {
						var forecast = data.forecast[id]
						var now = data.forecast[id][0]; 
						var area = {
							id: id,
							name: l18n[id],
							now: { time: from, intensity: forecast[0], desc: intensity(forecast[0], id) },
							next: []
						}

						var time = boundDown(moment(from).add(20, 'minutes'));
						for (var i = 1; i < forecast.length; ++i) {
							area.next.push({ time: time, intensity: forecast[i], desc: intensity(forecast[i], id) });
							time.add(20, 'minutes');
						}

						ret[id] = area;
					}

					return ret;
				});
			}
		}
	}])	
	.controller('forecastCtrl', ['forecastSvc', function (forecastSvc) {
		self.updateAreas = function () {
			forecastSvc.get(4).then(function (areas) {
				console.log(areas);
				self.areas = areas;
			});
		};

		self.updateAreas();

		return self;
	}]);