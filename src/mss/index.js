import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware } from 'redux';
import serverStatApp from './reducers';
import { fetchStatus } from './actions';
import ServerStatContainer from './containers/ServerStatContainer';

var nodes = document.getElementsByClassName('make-mss');

for (var i = 0; i < nodes.length; ++i) {
	const loggerMiddleware = createLogger();

	// Create redux data model
	const store = createStore(
		serverStatApp,
		applyMiddleware(
			thunkMiddleware,
			loggerMiddleware
		)
	);

	render(
		<Provider store={store}>
			<ServerStatContainer />
		</Provider>,
		nodes[i]
	);

	store.dispatch(fetchStatus()).then(() => {
		console.log(store.getState());
	});
}