import { combineReducers } from 'redux';
import Immutable from 'seamless-immutable';
import {
	UPDATE_STATUS, REQUEST_STATUS
} from '../actions';

/**
 * @description updates the state's status value
 * @param {*} status 
 * @param {*} action 
 */
function status(status = null, action) {
	switch (action.type) {
		case UPDATE_STATUS:
			if (action.status === undefined) {
				return null;
			}

			const newStatus = Immutable(action.status);

			return status ? Immutable.replace(status, newStatus) : newStatus;
		default:
			return status;	
	}
}

const serverStatApp = combineReducers({
	status
});

export default serverStatApp;