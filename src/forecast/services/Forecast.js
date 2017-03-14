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

import moment from 'moment';
import axios from 'axios';

const ForecastService = {
	next
};

export default ForecastService;

function next(number) {
	return axios.get('http://mabi.world/forecast.php', {
		params: {
			duration: number
		}
	}).then((response) => {
		const data = response.data;
		var areas = {};

		// Separate physis and zardine
		data.forecast.physis = data.forecast.type10;
		data.forecast.zardine = data.forecast.type10;
		delete data.forecast.type10;

		const from = moment(data.from);

		for (var id in data.forecast) {
			const forecast = data.forecast[id];

			var newArea = {
				id: id,
				now: undefined,
				next: []
			};

			var startTime = boundDown(from);
			for (var i = 0; i < forecast.length; ++i) {
				newArea.next.push({
					startTime: startTime.clone(),
					intensity: forecast[i]
				});
				startTime.add(20, 'minutes');
			}

			newArea.now = newArea.next.shift();

			areas[id] = newArea;
		}

		return areas;
	});
}

/* eslint-disable no-unused-vars */
function boundUp(date) {
	date = moment(date);
	var mn = date.minutes();
	if (mn < 20) {
		date.minutes(20);
	} else if (mn < 40) {
		date.minutes(40);
	} else {
		date.add(1, "hour").minutes(0);
	}
	return date.seconds(0);
}

function boundDown(date) {
	date = moment(date);
	var mn = date.minutes();
	if (mn < 20) {
		date.minutes(0);
	} else if (mn < 40) {
		date.minutes(20);
	} else {
		date.minutes(40);
	}
	return date.seconds(0);
}
