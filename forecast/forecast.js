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
		 20 : "Thunder storm (110% success bonus)",
		"custom": { "physis": {} }
	},
}

for (var i = 0; i < 20; ++i) {
	var bonus = Math.floor(i / 2);
	var iio = "intensity index of " + i.toString() + " (" + (bonus ? (100 + bonus).toString() + "%" : "no") + " success bonus)";
	l18n.intensity[i] = "Raining, " + iio;
	l18n.intensity.custom.physis[i] = "Snowing, " + iio;
}

var l18n_short = {
	"type1": "N.Uladh",
	"type2": "Dun.",
	"type3": "Bangor",
	"type4": "Emain",
	"type5": "Sen Mag",
	"type6": "S.Uladh",
	"type7": "Rano",
	"type8": "Connous",
	"type9": "Courcle",
	"type10": "N.Iria",
	"zardine": "Zardine",
	"physis": "Physis",
	"type11": "Shadows",
	"type12": "W.Uladh",
	"type13": "DokiDoki??",
}

var weather2gfx = {
	//      Large,           Day small,          Night small 
	"-9": ["unknown.png",   "unknown-sm.png",   "unknown-sm.png"],
	"-8": ["none.png",      "palala-sm.png",    "eweca-sm.png"],
	"-7": ["cloudy1.png",   "palala-sm.png",    "eweca-sm.png"],
	"-6": ["cloudy2.png",   "cloudy1-sm.png",   "cloudy1-sm-n.png"],
	"-5": ["cloudy2.png",   "cloudy1-sm.png",   "cloudy1-sm-n.png"],
	"-4": ["cloudy3.png",   "cloudy2-sm.png",   "cloudy1-sm-n.png"],
	"-3": ["cloudy3.png",   "cloudy2-sm.png",   "cloudy2-sm-n.png"],
	"-2": ["cloudy4.png",   "cloudy3-sm.png",   "cloudy2-sm-n.png"],
	"-1": ["cloudy4.png",   "cloudy3-sm.png",   "cloudy3-sm.png"],
	  0 : ["cloudy5.png",   "cloudy4-sm.png",   "cloudy4-sm.png"],
	  1 : ["rain1-5.png",   "rain1-5-sm.png",   "rain1-5-sm.png"],
	  2 : ["rain1-5.png",   "rain1-5-sm.png",   "rain1-5-sm.png"],
	  3 : ["rain1-5.png",   "rain1-5-sm.png",   "rain1-5-sm.png"],
	  4 : ["rain1-5.png",   "rain1-5-sm.png",   "rain1-5-sm.png"],
	  5 : ["rain1-5.png",   "rain1-5-sm.png",   "rain1-5-sm.png"],
	  6 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	  7 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	  8 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	  9 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 10 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 11 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 12 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 13 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 14 : ["rain6-14.png",  "rain6-14-sm.png",  "rain6-14-sm.png"],
	 15 : ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
	 16 : ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
	 17 : ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
	 18 : ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
	 19 : ["rain15-19.png", "rain15-19-sm.png", "rain15-19-sm.png"],
	 20 : ["rain20.png",    "rain20-sm.png",    "rain20-sm.png"],
	"body":["palala.png", "eweca.png"]
}

var customgfx = {
	"physis": {
		  1 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  2 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  3 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  4 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  5 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  6 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  7 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  8 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		  9 : ["snow1-9.png",   "snow1-9-sm.png",   "snow1-9-sm.png"],
		 10 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 11 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 12 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 13 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 14 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 15 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 16 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 17 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 18 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
		 19 : ["snow10-19.png", "snow10-19-sm.png", "snow10-19-sm.png"],
	}
}

// Convenience functions
function intensity(v, id) {
	var ww = l18n.intensity, lic = l18n.intensity.custom;
	if (id in lic && v in lic[id]) {
		ww = lic[id];
	}
	return ww[v];
}

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

function getgfx(fc, idx, id) {
	var gfx = weather2gfx[fc][idx];
	if (id in customgfx) {
		var cgi = customgfx[id];
		if (fc in cgi) gfx = cgi[fc][idx];
	}

	if (gfx.substr(0, 4) == "http" || gfx.charAt(0) == "/") return gfx;
	return "http://mabi.world/gfx/" + gfx;
}

// Load everything
$(function(){
	// Intensity graphics/text settings
	var $wgs = $(".weather.settings .weather-intensity");
	if ($wgs.length > 0) {
		// Table is of the form:
		// Intensity Location LargeGfx SmallGfx-Day SmallGfx-Night Commentary
		$wgs.find("tr").each(function () {
			var arr = [];
			$(this).find("td").each(function () { arr.push($(this)); });
			if (arr.length == 0) return;

			arr[0] = arr[0].text().trim();
			arr[1] = arr[1].text().trim();

			var wwg, wwc;
			if (arr[1] == "all") {
				wwg = weather2gfx;
				wwc = l18n.intensity;
			} else {
				if (arr[1] in customgfx) wwg = customgfx[arr[1]];
				else wwg = customgfx[arr[1]] = {};

				if (arr[1] in l18n.intensity.custom) wwc = l18n.intensity.custom[arr[1]];
				else wwc = l18n.intensity.custom[arr[1]] = {};
			}

			function imgsrc($x) {
				return $x.find("img").addBack("img").attr("src");
			}

			wwg[arr[0]] = [imgsrc(arr[2]), imgsrc(arr[3]), imgsrc(arr[4])];
			wwc[arr[0]] = arr[5].text();
		});
	}

	var $wbs = $(".weather.settings .weather-bodies");
	if ($wbs.length > 0) {
		weather2gfx.body[0] = $wbs.find("img.palala").attr("src");
		weather2gfx.body[1] = $wbs.find("img.eweca").attr("src");
	}

	$(".weather.settings").remove();

	loadHourWidget();
	loadBestRainWidgets();
});

// Hour forecast widget functions
function loadHourWidget() {
	var $wwh = $(".weather-widget-hour");

	if ($wwh.length == 0) return;

	// Remove MediaWiki forced sizes...
	$wwh.find("a.image > img").removeAttr("width").removeAttr("height").unwrap();

	// Template out each area, hide them, and add them to the scroll list
	var scrolList = new Array();
	var $settings = $wwh.find(".settings");
	var settings = $settings.text().split(" ");
	$settings.remove();

	var $template = $wwh.find(".template.area-hour"), highestForecast = 0;

	// Find all minis, store highest number.
	$template.find("[class^='area-forecast-']:not([class^='area-forecast-time-'])").each(function () {
		highestForecast = Math.max(highestForecast, parseInt($(this).attr("class").split(" ")[0].substr(14)));
	})
	$wwh.data("highestForecast", highestForecast);

	for (var i = 0; i < settings.length; ++i) {
		var id = settings[i]

		// Skip type10, we've split that into Zardine and Physis
		//if (id == "type10") continue;

		var name = l18n[id], $new;
		$new = $template.clone().removeClass("template").attr("id", "weather-hour-" + id);
		$new.find(".area-title").text(name);
		$new.find(".area-today-body").attr("src", getgfx("body", erinnDay, "body")).data({"forecast": "body", "table": id});
		$wwh.append($new.hide());

		scrolList.push({"id": "#weather-hour-" + id, "name": l18n[id]});
	}

	// Set some tickers...
	onErinnSunshift(updateGametime);
	onWeatherChange(updateAreas);

	// Set up the scroll list
	scrolList.sort(function(a, b){
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});
	var scroller = Scroller(scrolList);

	// Hook up arrows
	$(".area-left").click(scroller.left);
	$(".area-right").click(scroller.right);

	// Update everything
	updateAreas(function() {
		scroller.show().autoRight(60 * 1000);
	});
}

function updateAreas(handler) {
	var highestForecast = $(".weather-widget-hour").data("highestForecast");
	$.ajax({
		url: "http://mabi.world/forecast.php",
		data: {
			duration: highestForecast + 1,
		},
		dataType: "json",
		success: function (data) {
			// TODO: data.errors
			var casted = moment(data.from);

			// Separate Physis and Zardine
			data.forecast.physis = data.forecast.type10;
			data.forecast.zardine = data.forecast.type10;
			//delete data.forecast.type10;

			for (var id in data.forecast) {
				var $widget = $("#weather-hour-" + id),
				    $body = $widget.find(".area-today-body"),
				    forecast = data.forecast[id];
				fcgfxani($widget.find(".area-today-coverage"), forecast[0], false, id, !!handler);

				var time = boundDown(moment(casted).add(20, "minutes"));
				for (var i = 1; i <= highestForecast; ++i) {
					fcgfxani($widget.find(".area-forecast-" + i.toString()), forecast[i], true, id, !!handler);
					$widget.find(".area-forecast-time-" + i.toString()).text(time.format("H:mm"));
					time.add(20, "minutes");
				}
			}

			if (typeof(handler) === "function") handler();
		}
	});
}

function fcgfxani($elem, fc, sm, id, skip) {
	if (sm) $elem.css("position", "relative");
	else $elem.data("pos", $elem.position());

	function fcgfx() {
		return $elem.attr({
			"src": getgfx(fc, sm ? erinnDay + 1 : 0, id),
			"title": intensity(fc, id)
		}).data("forecast", fc)
	}

	if (skip) return fcgfx();

	$elem.animate({
		"left": -$elem.width()
	}, {
		"complete": function() {
			fcgfx()
			.css("left", $elem.parent().width())
			.animate({
				"left": sm ? 0 : $elem.data("pos").left
			}, {
				"complete": function() {
					$elem.removeAttr("style");
				}
			});
		}
	});
}

function updateGametime(e, daynight) {
	$(".area-hour:not(.template)").each(function() {
		var $this = $(this), $body = $this.find(".area-today-body"), id = $body.data("table");
		$body.data({"pos": $body.position()})
		// Go out to the left
		.animate({
			"left": [-$body.width(), 'easeOutSine'],
			"top": [$body.height() * 2 / 3, 'easeInSine']
		}, {
			"complete": function() {
				// Change image, and come in from the right
				var fc = $body.data("forecast");
				$body.attr({
					"src": getgfx(fc, daynight, id),
					"title": intensity(fc)
				})
				.css("left", $body.parent().width())
				.animate({
					"left": [$body.data("pos").left, 'easeInSine'],
					"top": [$body.data("pos").top, 'easeOutSine']
				});
			}
		});

		// Shift little forecasts down
		var highestForecast = $this.parent(".weather-widget-hour").data("highestForecast");
		for (var i = 1; i <= highestForecast; ++i) {
			var $e = $this.find(".area-forecast-" + i.toString());
			if($e.length == 0) continue;

			var fc = $e.data("forecast");
			$e.css("position", "relative")
			.animate({
				"top": $e.parent().height()
			}, {
				"complete": function() {
					// Change image and then come back up!
					$e.attr({
						"src": getgfx(fc, daynight + 1, id),
						"title": intensity(fc)
					})
					.animate({
						"top": 0
					}, {
						"complete": function() {
							$e.removeAttr("style");
						}
					});
				}
			});
		}
	});
}


// Make best rain widget
function loadBestRainWidgets() {
	var $template = $(".weather-widget-rain-summary .template");

	// Remove MediaWiki forced sizes...
	$template.find("a.image > img").removeAttr("width").removeAttr("height").unwrap();

	$(".weather-widget-rain-summary .make-rain-area").each(function() {
		var $this = $(this),
		    $action = $this.find(".action").detach(),
		    $with = $this.find(".with").detach(),
		    $prepend = $this.find(".prepend").detach(),
		    $append = $this.find(".append").detach();

		// Template into this object
		$this.attr("class", $template.attr("class")).removeClass("template");
		$this.append($prepend.removeClass("prepend"))
		.append($template.children().clone())
		.append($append.removeClass("append"));

		// Create the appropriate update information for this
		var cases = parseSettings($action.text(), ["cases"]);

		// Parse custom names sent by with. Use {} to quote and use / to optionally supply a short variant
		var custom = parseSettings($with.text()), local = {}, local_short = {};
		for (var x in custom) {
			if (custom[x].string) {
				local[x] = custom[x].string;
				local_short[x] = custom[x].extra[0];
			} else {
				local[x] = custom[x];
				local_short[x] = custom[x];
			}
		}

		$this.data({
			"cases": cases,
			"custom": local,
			"custom_short": local_short
		});
	});

	// Then we need to remove any whitespace that's screwing things up...
	var childs = $(".weather-widget-rain-summary").children().detach();
	$(".weather-widget-rain-summary").empty().append(childs);

	// Change images according to the day
	onErinnSunshift(function(e, daynight) {
		$(".weather-widget-rain-summary .rain-area:not(.template) .rain-image").each(function() {
			var $this = $(this);
			$this.css("position", "relative")
			.animate({
				"top": $this.parent().height()
			}, {
				"complete": function() {
					$this.attr("src", getgfx($this.data("forecast"), daynight + 1, $this.data("table")))
					.animate({
						"top": 0
					}, {
						"complete": function() {
							$this.removeAttr("style");
						}
					})
				}
			})
			
		});
	});

	updateRain();
}

// Rain widget functions.
function updateRain($time) {
	var updates = {
		"best": function($elem, elseCase) {
			return function(data) {
				var id = "type1";

				function getname(n, l18n, custom) {
					if (custom && n in custom) return custom[n];
					return l18n[n];
				}

				if (data.best.rain.in.length > 1) {
					var names = "", custom = $elem.data("custom");
					for (var i = 0; i < data.best.rain.in.length; ++i) {
						names += ", " + getname(data.best.rain.in[i], l18n, custom);
					};
					$("<abbr>").appendTo($elem.find(".rain-name").empty())
					.attr("title", names.substr(2))
					.text(data.best.rain.in.length.toString() + " regions");
				} else {
					id = data.best.rain.in[0];
					$elem.find(".rain-name").text(getname(data.best.rain.in[0], l18n_short, $elem.data("custom_short")));
				}
				
				$elem.find(".rain-image").attr({
					"src": getgfx(data.best.rain.is, erinnDay + 1, id),
					"title": intensity(data.best.rain.is)
				}).data({
					"table": data.best.rain.in[0],
					"forecast": data.best.rain.is
				});

				// We need to countdown from now until til rounded up to the nearest 20.
				countDown($elem.find(".rain-time"), boundUp(data.from), "For ", updateRain);
			}
		},

		"next": function($elem, elseCase) {
			return function(data) {
				var custom = $elem.data("custom_short");
				$elem.find(".rain-name").text(custom && data.next.for in custom ? custom[data.next.for] : l18n_short[data.next.for]);
				$elem.find(".rain-image").attr({
					"src": getgfx(data.next.weather, erinnDay + 1, data.next.for),
					"title": intensity(data.next.weather)
				}).data({
					"table": data.next.for,
					"forecast": data.next.weather
				});
				
				// We need to countdown from now until thunder time!
				countDown($elem.find(".rain-time"), moment(data.from).add(data.next.in, "minutes"), "In ", updateRain);
			}
		}
	}

	$(".weather-widget-rain-summary .rain-area:not(.template)").each(function() {
		// We want to grab the data and handle else cases appropriately
		var $this = $(this),
		    cases = $this.data("cases");

		var i = 0;
		function runUpdate() {
			// In order to call the right function and deal with else properly we need to know what we're doing
			var queryType;
			if ("best" in cases[i]) queryType = "best";
			else if ("next" in cases[i]) queryType = "next";
			else {
				console.log("Warning: unknown query type for " + $this.attr("id"));
				return;
			}

			$.ajax({
				url: "http://mabi.world/forecast.php",
				data: cases[i++],
				dataType: "json",
				success: updates[queryType]($this, runUpdate)
			});
		}
		runUpdate();
	});
}
