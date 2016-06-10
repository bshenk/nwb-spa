import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { Router, Route, IndexRoute, browserHistory, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import thunk from 'redux-thunk';

import reducers from './modules';

import App from './components/App/App';


const createStoreWithMiddleware = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f)(createStore);

export const store = createStoreWithMiddleware(reducers);

const history = syncHistoryWithStore(browserHistory, store);

export default function routes() {
	return (
		<Provider store={store}>
			<Router history={history}>
				<Route path="/" component={App}>
				</Route>
			</Router>
		</Provider>
	);
}
