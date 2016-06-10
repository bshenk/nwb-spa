import Immutable from 'immutable';
import * as constants from '../constants/Links';
import axios from 'axios';

export const FETCH_CURRENT_DATA = 'spa/data/FETCH_CURRENT_DATA';
export const FETCH_CATEGORY_DATA = 'spa/data/FETCH_CATEGORY_DATA';
export const FETCH_EVENT_PREVIEW = 'spa/data/FETCH_EVENT_PREVIEW';
export const SET_DEFAULT_SCENARIO = 'spa/data/SET_DEFAULT_SCENARIO';
export const UPDATE_REQUEST = 'spa/data/UPDATE_REQUEST';
export const UPDATE_ROOT = 'spa/data/UPDATE_ROOT';
export const RESET_EVENT_PREVIEW = 'spa/data/RESET_EVENT_PREVIEW';
import { MAP_LOADED, MAP_LOADING } from './map';
import { RESET_SCENARIO, UPDATE_SCENARIO } from './scenario';

const initialState = Immutable.Map({
	streaming: false,
	rootUrl: constants.sg1Root,
	current: Immutable.Map({}),
	preview: Immutable.Map({}), // data received from /events
	categories: Immutable.Map({}), // data received from /categories
	currentRequest: Immutable.Map({
		fieldCoverage: 0.1,
		sendOnly: {
            events: { past:null, future:null },
            fields: { Origin:'AllEvents', NaiveRisk:'AllEvents', AdvancedRisk:'AllEvents' }
        }
	}),
	previewRequest: Immutable.Map({
		ignoreDate: false,
		startEndNowDates: [undefined, undefined, undefined],
		ignoreFatalities: false,
		fatalities: [],
		allowedCountryCodes: [],
		allowedEventTypeCodes: [],
		allowedActor1TypeCodes: [],
		allowedActor2TypeCodes: [],
		allowedInteractionTypeCodes: [],
		withinGeometry: {}
	})
});

export default function reducer(state = initialState, action) {
	switch(action.type) {
		case FETCH_CURRENT_DATA:
			return state.set('current', action.payload);
		case FETCH_CATEGORY_DATA:
			return state.set('categories', action.payload);
		case FETCH_EVENT_PREVIEW:
			return state.set('preview', action.payload);
		case RESET_EVENT_PREVIEW:
			return state.set('preview', initialState.get('preview'));
		case UPDATE_REQUEST:
			let nextState0 = state;
			if(action.key === null) {
				nextState0 = nextState0.set(action.requestType, action.payload);
			} else {
				nextState0 = nextState0.setIn([action.requestType, action.key], action.payload);
			}
			return nextState0;
		case SET_DEFAULT_SCENARIO:
			let nextState1 = state;
			nextState1 = nextState1.setIn(['previewRequest', 'dateRange'], action.payload.dateRange);
			return nextState1;
		case UPDATE_ROOT:
			let nextState2 = state;
			nextState2 = nextState2.set('rootUrl', action.payload);
			return nextState2;
		case RESET_SCENARIO:
			let nextState3 = state;
			nextState3 = nextState3.set('previewRequest', initialState.get('previewRequest'));
			return nextState3;
		default:
			return state;
	}
}

export function mapLoading() {
	return { type: MAP_LOADING };
}

export function mapLoaded() {
	return { type: MAP_LOADED };
}

export function fetchCurrentData(config, errCallback) {
	return dispatch => {
		dispatch({ type: MAP_LOADING });
		function getData() {
			axios(config).then(response => {
				console.log(response.data);
				dispatch({
					type: FETCH_CURRENT_DATA,
					payload: response.data
				});
				dispatch({ type: MAP_LOADED });
			}).catch(response => {
				dispatch({ type: MAP_LOADED });
				if(errCallback) errCallback(response);
			});
		}

		setTimeout(getData, 500);
	}
}

export function fetchCategoryData(config, callback) {
	return dispatch => {
		axios(config).then(response => {
			console.log(response.data);

			let data = response.data;

			const countries = data.COUNTRY;

			const yearsAvailable = data.DATE.map(function(date) {
				return date.yr;
			});

			const minYear = Math.min.apply(null, yearsAvailable);
			const maxYear = Math.max.apply(null, yearsAvailable);

			const monthsInMinYear = data.DATE.filter(function(date) {
				return date.yr === minYear;
			}).map(function(date) {
				return date.mn;
			});

			const monthsInMaxYear = data.DATE.filter(function(date) {
				return date.yr === maxYear;
			}).map(function(date) {
				return date.mn;
			});

			const minMonthInMinYear = Math.min.apply(null, monthsInMinYear);
			const maxMonthInMaxYear = Math.max.apply(null, monthsInMaxYear);

			dispatch({
				type: SET_DEFAULT_SCENARIO,
				payload: {
					dateRange: [[minYear, minMonthInMinYear], [maxYear, maxMonthInMaxYear]],
					minYear,
					maxYear
				}
			});

			dispatch({
				type: FETCH_CATEGORY_DATA,
				payload: response.data
			});

			const catData = response.data;

			let countryOptions = {}, actor1Options = {}, actor2Options = {}, eventOptions = {}, interactionOptions = {};

			catData.COUNTRY.forEach((country) => {
				countryOptions[country.code] = country.name;
			});

			catData.ACTOR1.forEach((actor) => {
				actor1Options[actor.code] = actor.type;
			});

			catData.ACTOR2.forEach((actor) => {
				actor2Options[actor.code] = actor.type;
			});

			catData.EVENTTYPE.forEach((event) => {
				eventOptions[event.code] = event.type;
			});

			catData.INTERACTION.forEach((interaction) => {
				interactionOptions[interaction.code] = interaction.type;
			});

			dispatch({ type: UPDATE_SCENARIO, key: 'countryOptions', payload: countryOptions });
			dispatch({ type: UPDATE_SCENARIO, key: 'actor1Options', payload: actor1Options });
			dispatch({ type: UPDATE_SCENARIO, key: 'actor2Options', payload: actor2Options });
			dispatch({ type: UPDATE_SCENARIO, key: 'eventOptions', payload: eventOptions });
			dispatch({ type: UPDATE_SCENARIO, key: 'interactionOptions', payload: interactionOptions });
		}).catch(response => {
			callback(response);
		});
	}
}

export function fetchEventPreview(config, callback, errCallback) {
	console.log(config.data);
	return dispatch => {
		axios(config).then(response => {
			console.log(response.data);
			dispatch({
				type: FETCH_EVENT_PREVIEW,
				payload: response.data
			});

			if(callback) callback();
		}).catch(response => {
			if(errCallback) errCallback(response);
		});
	}
}

export function updateRoot(payload) {
	return { type: UPDATE_ROOT, payload };
}

export function updateRequest(requestType, key, payload) {
	return { type: UPDATE_REQUEST, requestType, key, payload };
}

export function updateParam(param, payload) {
	return { type: UPDATE_PARAM, param, payload };
}

export function resetPreview() {
	return { type: RESET_EVENT_PREVIEW };
}
