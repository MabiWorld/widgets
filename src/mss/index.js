import 'babel-polyfill'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware } from 'redux';
import serverStatApp from './reducers';
import { fetchStatus } from './actions';
import ServerStat from './components/ServerStat';

function attach(node) {
	const loggerMiddleware = createLogger();

	// Create redux data model
	const store = createStore(
		serverStatApp,
		applyMiddleware(
			thunkMiddleware,
			loggerMiddleware
		)
	);

	const r = (Component) => {
		render(
			<Provider store={store}>
				<Component />
			</Provider>,
			node
		);
	}

	r(ServerStat);

	store.dispatch(fetchStatus()).then(() => {
		console.log(store.getState());
	});

	if (module.hot) {
		module.hot.accept('./components/ServerStat', () => {
			store.replaceReducer(serverStatApp);
			r(ServerStat);
		});
	}
}

var nodes = document.getElementsByClassName('make-mss');
for (var i = 0; i < nodes.length; ++i) {
	attach(nodes[i]);
}