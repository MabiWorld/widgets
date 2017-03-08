import 'babel-polyfill';

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import { fetchStatus } from './actions';

const loggerMiddleware = createLogger();

// Create redux data model
const store = createStore(
	rootReducer,
	applyMiddleware(
		thunkMiddleware,
		loggerMiddleware
	)
);

import { ServerStatComponent } from './components';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

class ServerStatModule { }

ServerStatModule.annotations = [
	new NgModule({
		imports: [BrowserModule],
		declarations: [ServerStatComponent],
		bootstrap: [ServerStatComponent]
	})
];

export { ServerStatModule };

store.dispatch(fetchStatus()).then(() => {
	console.log(store.getState());
})