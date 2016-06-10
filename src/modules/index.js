import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import data from './data';
import map from './map';
import scenario from './scenario';
import config from './config';

const rootReducer = combineReducers({
    data,
    routing: routerReducer,
    map,
    scenario,
	config
});

export default rootReducer;
