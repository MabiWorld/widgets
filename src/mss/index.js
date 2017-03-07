import 'babel-polyfill'

import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware } from 'redux';
import serverStatApp from './reducers';
import { fetchStatus } from './actions';

const loggerMiddleware = createLogger();

// Create redux data model
const store = createStore(
	serverStatApp,
	applyMiddleware(
		thunkMiddleware,
		loggerMiddleware
	)
);

store.dispatch(fetchStatus).then(() => {
	console.log(store.getState());
})