import fetch from 'isomorphic-fetch'

export const UPDATE_STATUS = 'UPDATE_STATUS';
function updateStatus(status) {
    return {
        type: UPDATE_STATUS,
        status
    };
};

export const REQUEST_STATUS = 'REQUEST_STATUS';
function requestStatus() {
    return {
        type: REQUEST_STATUS
    };
};

export function fetchStatus() {
    return function (dispatch) {
        dispatch(requestStatus());

        return fetch('http://mabi.world/mss/status.json')
            .then(response => response.json())
            .then(fixupStatus)
            .then(status => {
                dispatch(updateStatus())
            })
            .catch(err => {
                dispatch(updateStatus(null))
            });
    }

    const stateNames = {
        '-1': 'offline',
        0: 'maintenance',
        1: 'online',
        2: 'busy',
        3: 'full',
        4: 'bursting',
        5: 'booting',
        6: 'error',
        7: 'ping'
    }

    /**
     * Munges the status json from the server to be a bit nicer to work with
     * @param {*} status 
     */
    function fixupStatus(status) {
        const isPing = status.type == 'ping';

        // Massage some things around.
        status.updated = new Date(status.updated);

        status.login.state = pingToState(status.login.ping);
        status.chat.state = pingToState(status.chat.ping);
        status.website.state = pingToState(status.website.ping);

        if (isPing) {
            var anyOnline = false;
            for (var server of status.game.servers) {
                for (var channel of server.channels) {
                    if (channel.ping) {
                        anyOnline = true;
                        server.state = 'online';
                        channel.state = 'ping';
                    }
                    channel.stress = -1;
                }
                server.stress = -1;
            }
            if (status.login.state == 'online' && anyOnline) {
                status.game.state = 'online';
            } else {
                status.game.state = 'offline';
            }
            status.game.stress = -1;
        } else {
            status.game.state = stateNames[status.game.state];
            for (var server of status.game.servers) {
                server.state = stateNames[server.state];
                for (var channel of server.channels) {
                    channel.state = stateNames[channel.state];
                }
            }
        }

        return status;
    }
}