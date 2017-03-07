// Infomational only. Represents state structure

state = {

	// From ajax JSON
	status: {
		chat: {
			ping: 0
		},
		login: {
			ping: 0
		},
		website: {
			ping: 0
		},

		game: {
			event: false,
			state: 0,
			servers: {
				mabius1: {
					event: false,
					state: 0,
					stress: 0,
					channels: {
						Ch1: {
							state: 0,
							ping: 0,
							stress: 0,
							event: false
						}
					}
				}
			}
		}
	}
}