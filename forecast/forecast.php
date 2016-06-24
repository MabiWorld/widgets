<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET");

if (isset($argv)) {
	parse_str(implode('&', array_slice($argv, 1)), $_GET);
}

function get($name) {
	if (isset($_GET[$name])) {
		return $_GET[$name];
	} else {
		return "";
	}
}

// We must always select the appropriate weather chart(s) and current time
$of = get("of");
$of_all_except = get("of-all-except");
$from = get("from");
if (!$from) {
	$from = get("at");
}

// We can also always select if we want float or int values
$floats = in_array(strtolower(get("type")), array("f", "float", "floats"));
if ($floats) {
	$basedir = dirname(__FILE__) . "/weather_f";
} else {
	$basedir = dirname(__FILE__) . "/weather";
}

// We can return a forecast either by duration or within a sequence of time
$duration = get("duration");
$to = get("to");
$tz = get("tz"); // GMT offset of supplied datetimes in either O format or minutes
$forecast = $to != "" || $duration != "";

// We can return when the next weather of type $next is and whether we want that for
// each chart or for all charts.
$next = get("next");
$for = get("for");
$in = get("in");

// We can return where the best rain is right now
$best = get("best");

// Default timezone (ie. server time) and base directory
$dtz = new DateTimeZone("America/Los_Angeles");

// Data sanity
if ($of_all_except) {
	$of_all_except = explode(",", $of_all_except);
} else {
	$of_all_except = [];
}

if ($of) {
	$of = explode(",", $of);
} else {
	$of = array();
	opendir($basedir);
	while (($fn = readdir()) !== false) {
		if ($fn[0] != ".") {
			$basename = substr($fn, 0, -5);
			if (!in_array($basename, $of_all_except)) array_push($of, $basename);
		}
	}
	closedir();
}

if ($tz) {
	$ttz = DateTime::createFromFormat("O", $tz)->getTimezone();
	if ($ttz) {
		$tz = $ttz;
	} else {
		$tz = intval($tz, 10);
		$hours = floor($tz / 60);
		$minutes = abs($tz - $hours * 60);
		if ($hours < -9) {
			$hours = "$hours";
		} elseif ($hours < 0) {
			$hours = "-0" . abs($hours);
		} elseif ($hours < 10) {
			$hours = "0$hours";
		}

		if ($minutes < 10) {
			$minutes = "0$minutes";
		}

		$tz = DateTime::createFromFormat("O", "$hours:$minutes")->getTimezone();
	}
} else {
	$tz = $dtz;
}

if (!$from) {
	$from = "now";
}
$from = new DateTimeImmutable($from, $tz);

if ($forecast) {
	if ($to) {
		$to = new DateTimeImmutable($to, $tz);
	} elseif ($duration) {
		// Takes formats:
		//  H:i
		//  # of 20m cycles
		$split = explode(":", $duration);
		if (count($split) == 1) {
			$minutes = 20 * intval($split[0]);
		} else {
			$minutes = 60 * intval($split[0]) + intval($split[1]);
		}

		$to = $from->add(new DateInterval("PT${minutes}M"));
	}
}

if ($next) {
	switch (strtolower($next)) {
		case "cloud":
		case "clouds":
		case "cloudy":
			if ($floats) {
				$next_l = 1.000;
				$next_u = 1.949;
			} else {
				$next_l = -5;
				$next_u = -1;
			}
			break;
		case "sun":
		case "clear":
		case "sunny":
		case "sunshine":
			if ($floats) {
				$next_l = 0.000;
				$next_u = 0.999;
			} else {
				$next_l = -8;
				$next_u = -6;
			}
			break;
		case "unk":
		case "unknown":
			if ($floats) {
				$next_l = -1;
				$next_u = -1;
			} else {
				$next_l = -9;
				$next_u = -9;
			}
			break;
		case "lightning":
		case "thunder":
		case "thunderstorm":
			if ($floats) {
				$next_l = 2.000;
				$next_u = 2.000;
			} else {
				$next_l = 20;
				$next_u = 20;
			}
			break;
		case "rain":
			if ($floats) {
				$next_l = 1.950;
				$next_u = 1.999;
			} else {
				$next_l = 0;
				$next_u = 19;
			}
			break;
		default:
			$next = intval($next);
			$next_l = $next;
			$next_u = $next;
			break;
	}

	switch (strtolower($in)) {
		case "h":
		case "hr":
		case "hrs":
		case "hour":
		case "hours":
			$in = "h";
			break;

		default:
			$in = "m";
			break;
	}

	if (!$for) {
		$for = "each";
	} elseif ($for != "each" and $for != "all") {
		echo '{"error":"for must be either \\"each\\" or \\"all\\""}\n';
		exit();
	}
}

if ($best && $best != "rain") {
	echo '{"error":"Unknown best ' . $best . '."}\n';
	exit();
}

// Limit how much a request can return
$limit = 100;
$errors = array();
$weathers = array();
$nexts = array();
$bestest = array();

function diff_minutes($from, $to) {
	$diff = $from->diff($to);
	$days = intval($diff->format("%a"));
	$hours = intval($diff->format("%h"));
	$minutes = intval($diff->format("%i"));
	return $days * 24 * 60 + $hours * 60 + $minutes;
}

foreach ($of as $name) {
	// Load up appropriate type
	$wf = @fopen("$basedir/$name.json", "r");
	if ($wf === false) {
		array_push($errors, "Table $name not found.");
	} else {
		// Decode the weather information: {rows:[#s], unit_time:#, base_time:"YmdHi"}
		$weather = json_decode(fread($wf, filesize("$basedir/$name.json")));
		fclose($wf);

		// Base time is such that the weather value at the 0th index in rows occurred at this time.
		$base = DateTimeImmutable::createFromFormat("YmdHi", $weather->base_time, $dtz);
		$wrap = count($weather->rows);
		$from_diff = diff_minutes($base, $from);
		$from_idx = floor($from_diff / 20) + 1; // TODO: Off by 1 dunno why!!
		$from_change = $from_diff - ($from_idx - 1) * 20;

		if ($forecast) {
			// Figure out the index for $from and $to
			$to_idx = floor(diff_minutes($base, $to) / 20) + 1; // TODO: Off by 1 dunno why!!
			$diff_idx = $to_idx - $from_idx;

			if ($diff_idx > $limit) {
				array_push($errors, "Too many results, truncating.");
				$to_idx = $from_idx + $limit;
				$diff_idx = $to_idx - $from_idx;
			}

			$loops = floor($diff_idx / $wrap);
			$from_idx %= $wrap;
			$to_idx %= $wrap;

			$ret = array_slice($weather->rows, $from_idx, $loops || $to_idx < $from_idx ? $wrap - $from_idx : $diff_idx);
			if ($loops) {
				for ($i = 0; $i < $loops; $i++) {
					$ret = array_merge($ret, $weather->rows);
				}
			} elseif ($to_idx < $from_idx) {
				$ret = array_merge($ret, array_slice($weather->rows, 0, $to_idx));
			}

			$weathers[$name] = $ret;
		} elseif ($next) {
			$from_idx %= $wrap;
			$found = false;
			for ($i = $from_idx; $i < $wrap; $i++) {
				$w = $weather->rows[$i];
				if ($next_l <= $w && $next_u >= $w) {
					$next = $w;
					$nexts[$name] = ($i - $from_idx) * 20 - $from_change;
					$found = true;
					break;
				}
			}
			if ($from_idx != 0 && !$found) {
				for ($i = 0; $i < $from_idx; $i++) {
					$w = $weather->rows[$i];
					if ($next_l <= $w && $next_u >= $w) {
						$next = $w;
						$nexts[$name] = ($wrap - $from_idx + $i) * 20 - $from_change;
						break;
					}
				}
			}
		} elseif ($best) {
			$cur_weather = $weather->rows[$from_idx %= $wrap];
			if (isset($bestest[$best])) {
				if ($cur_weather > $bestest[$best]["is"]) {
					$bestest[$best]["is"] = $cur_weather;
					$bestest[$best]["in"] = array($name);
				} elseif ($cur_weather == $bestest[$best]["is"]) {
					array_push($bestest[$best]["in"], $name);
				}
			} else {
				$bestest[$best] = array(
					"is" => $cur_weather,
					"in" => array($name),
				);
			}
		}
	}
}

$out = array("from" => $from->format(DateTime::W3C));

if ($weathers) {
	$out["forecast"] = $weathers;
}

function output_time($minutes) {
	global $in;
	switch ($in) {
		case "h":
			$hours = floor($minutes / 60);
			$minutes = $minutes - $hours * 60;
			return "$hours:" . ($minutes < 10 ? "0$minutes" : $minutes);

		case "m":
			return $minutes;
	}
}

if ($nexts) {
	switch ($for) {
		case "each":
			foreach ($nexts as $key => $value) {
				$nexts[$key] = output_time($value);
			}
			$out["next"] = array(
				"weather" => $next,
				"for" => $nexts,
			);
			break;

		case "all":
			// Find the soonest!
			$last_time = 999999;
			$soonest = "";
			foreach ($nexts as $name => $time) {
				if ($time < $last_time) {
					$last_time = $time;
					$soonest = $name;
				}
			}
			$out["next"] = array(
				"weather" => $next,
				"for" => $soonest,
				"in" => output_time($last_time),
			);

			break;
	}
}

if ($bestest) {
	$out["best"] = $bestest;
}

if ($errors) {
	$out["errors"] = $errors;
}

echo json_encode($out, JSON_NUMERIC_CHECK) . "\n";
