import Immutable from 'immutable';

import { SET_DEFAULT_SCENARIO } from './data';
export const UPDATE_SCENARIO = 'spa/scenario/UPDATE_SCENARIO';
export const RESET_SCENARIO = 'spa/scenario/RESET_SCENARIO';

const initialState = Immutable.Map({
	minYear: 1997,
	maxYear: 2016,
	active: false,
	step: 0,
	selectedCountryObjs: [],
	selectedEventObjs: [],
	selectedActor1Objs: [],
	selectedActor2Objs: [],
	selectedInteractionObjs: [],
	countryOptions: [],
	actor1Options: [],
	actor2Options: [],
	eventOptions: [],
	interactionOptions: []
});

export default function reducer(state = initialState, action) {
	switch(action.type) {
		case SET_DEFAULT_SCENARIO:
			let nextState0 = state;
			// Set lower/upper date limit - do not change once received
			nextState0 = nextState0.set('minYear', action.payload.minYear);
			nextState0 = nextState0.set('maxYear', action.payload.maxYear);
			return nextState0;
		case UPDATE_SCENARIO:
			let nextState1 = state;
			nextState1 = nextState1.set(action.key, action.payload);
			return nextState1;
		case RESET_SCENARIO:
			let nextState2 = state;
			nextState2 = nextState2.set('selectedCountryObjs', []);
			nextState2 = nextState2.set('selectedEventObjs', []);
			nextState2 = nextState2.set('selectedActor1Objs', []);
			nextState2 = nextState2.set('selectedActor2Objs', []);
			nextState2 = nextState2.set('selectedInteractionObjs', []);
			return nextState2;
		default:
			return state;
	}
}

export function updateScenario(key, payload) {
	return { type: UPDATE_SCENARIO, key, payload };
}

export function resetScenario() {
	return { type: RESET_SCENARIO };
}
