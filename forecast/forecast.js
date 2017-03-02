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
	return date.seconds(0);
}

function boundDown(date) {
	date = moment(date);
	var mn = date.minutes();
	if (mn < 20) date.minutes(0);
	else if (mn < 40) date.minutes(20);
	else date.minutes(40);
	return date.seconds(0);
}

angular.module('forecast', ['time', 'angularMoment', 'ngAnimate'])
	.factory('forecastl10n', function () {
		var service = {
			get: get,
			intensity: intensity
		};

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

		/**
		 * @function get
		 * @description Looks up the given key in the localization
		 */
		function get(id) {
			if (id in l18n) {
				return l18n[id];
			}

			console.warn("id not found in localization!", id);
			return id;
		}

		/**
		 * @function intensity
		 * @description Returns the localized description for this region
		 */
		function intensity(v, id) {
			var ww = l18n.intensity, lic = l18n.intensity.custom;
			if (id in lic && v in lic[id]) {
				ww = lic[id];
			}
			return ww[v];
		}

		return service;
	})
	.factory('forecastService', ['$http', 'moment', 'forecastl10n', function ($http, moment, l10n) {
		var service = {
			get: get
		};

		/**
		 * @name get
		 * @description Returns a promise of the number of specified next forecast datapoints. Includes "now".
		 */
		function get(number) {
			return $http.get('http://mabi.world/forecast.php', { params: { duration: number } }).then(function (response) {
				var data = response.data;
				var areas = {}
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
						name: l10n.get(id),
						now: undefined,
						next: []
					}

					var time = boundDown(moment(from));
					for (var i = 0; i < forecast.length; ++i) {
						area.next.push({ time: time.clone(), intensity: forecast[i], desc: l10n.intensity(forecast[i], id) });
						time.add(20, 'minutes');
					}

					area.now = area.next.shift();

					areas[id] = area;
				}

				return areas;
			});
		}

		return service;
	}])
	.factory('gfxService', function () {
		var service = {
			getGfxUrlLarge: getGfxUrlLarge,
			getGfxUrlSmallDay: getGfxUrlSmallDay,
			getGfxUrlSmallNight: getGfxUrlSmallNight
		};

		var weather2gfx = {
			//      Large,           Day small,          Night small 
			"-9": ["unknown.png", "unknown-sm.png", "unknown-sm.png"],
			"-8": ["none.png", "palala-sm.png", "eweca-sm.png"],
			"-7": ["cloudy1.png", "palala-sm.png", "eweca-sm.png"],
			"-6": ["cloudy2.png", "cloudy1-sm.png", "cloudy1-sm-n.png"],
			"-5": ["cloudy2.png", "cloudy1-sm.png", "cloudy1-sm-n.png"],
			"-4": ["cloudy3.png", "cloudy2-sm.png", "cloudy1-sm-n.png"],
			"-3": ["cloudy3.png", "cloudy2-sm.png", "cloudy2-sm-n.png"],
			"-2": ["cloudy4.png", "cloudy3-sm.png", "cloudy2-sm-n.png"],
			"-1": ["cloudy4.png", "cloudy3-sm.png", "cloudy3-sm.png"],
			0: ["cloudy5.png", "cloudy4-sm.png", "cloudy4-sm.png"],
			1: ["rain1-5.png", "rain1-5-sm.png", "rain1-5-sm.png"],
			2: ["rain1-5.png", "rain1-5-sm.png", "rain1-5-sm.png"],
			3: ["rain1-5.png", "rain1-5-sm.png", "rain1-5-sm.png"],
			4: ["rain1-5.png", "rain1-5-sm.png", "rain1-5-sm.png"],
			5: ["rain1-5.png", "rain1-5-sm.png", "rain1-5-sm.png"],
			6: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			7: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			8: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			9: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			10: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			11: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			12: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			13: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			14: ["rain6-14.png", "rain6-14-sm.png", "rain6-14-sm.png"],
			15: ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
			16: ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
			17: ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
			18: ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
			19: ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
			20: ["rain20.png", "rain20-sm.png", "rain20-sm.png"],
			"body": ["palala.png", "eweca.png"]
		};

		var customgfx = {
			"physis": {
				1: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				2: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				3: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				4: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				5: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				6: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				7: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				8: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				9: ["snow1-9.png", "snow1-9-sm.png", "snow1-9-sm.png"],
				10: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				11: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				12: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				13: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				14: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				15: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				16: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				17: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				18: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
				19: ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
			}
		};

		function getGfxUrlLarge(intensity, id) {
			return getGfxUrl(intensity, 0, id);
		}

		function getGfxUrlSmallDay(intensity, id) {
			return getGfxUrl(intensity, 1, id);
		}

		function getGfxUrlSmallNight(intensity, id) {
			return getGfxUrl(intensity, 2, id);
		}

		function getGfxUrl(intensity, idx, id) {
			var gfx = weather2gfx[intensity][idx];
			if (id in customgfx) {
				var cgi = customgfx[id];
				if (intensity in cgi) gfx = cgi[intensity][idx];
			}

			if (gfx.substr(0, 4) == "http" || gfx.charAt(0) == "/") return gfx;
			return "http://mabi.world/gfx/" + gfx;
		}

		return service;
	})
	.controller('forecastCtrl', ['forecastService', 'gfxService', 'clockService', '$timeout', function (forecastService, gfxService, clockService, $timeout) {
		var self = this;
		self.now = clockService.now;
		self.getGfxUrlLarge = gfxService.getGfxUrlLarge;
		self.getGfxUrlSmallDay = gfxService.getGfxUrlSmallDay;
		self.getGfxUrlSmallNight = gfxService.getGfxUrlSmallNight;

		areaOrder = ['type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7', 'type8', 'type9', 'zardine', 'physis', 'type11', 'type12', 'type13'];
		areaIndex = 0;

		self.nextArea = function () {
			areaIndex = (areaIndex + 1) % areaOrder.length;
			self.displayedArea = areaOrder[areaIndex];
		};

		self.prevArea = function () {
			if (areaIndex == 0) {
				areaIndex = areaOrder.length;
			}
			areaIndex -= 1;
			self.displayedArea = areaOrder[areaIndex];
		};

		self.updateAreas = function () {
			return forecastService.get(4).then(function (areas) {
				console.log(areas);
				self.areas = areas;
				return areas;
			});
		};

		self.updateAreas().then(function () {
			self.displayedArea = areaOrder[areaIndex];
		});

		function refreshData() {
			next = boundUp(moment()) - moment();
			$timeout(refreshData, next);
			self.updateAreas();
		}

		refreshData();

		return self;
	}]);