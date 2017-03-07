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
function status(status, action) {
	switch (action.type) {
		case UPDATE_STATUS:
			if (action.payload === undefined) {
				return undefined;
			}

			newStatus = Immutable(action.payload);

			return Immutable.replace(status, newStatus);
		default:
			return status;	
	}
}

const serverStatApp = combineReducers({
	status
});

export default serverStatApp;