import Immutable from 'immutable';

export const MAP_LOADING = 'spa/map/MAP_LOADING';
export const MAP_LOADED = 'spa/map/MAP_LOADED';
export const ADD_MAP = 'spa/map/ADD_MAP';
export const ADD_MAPDATA = 'spa/map/ADD_MAPDATA';
export const SHOW_MAPDATA = 'spa/map/SHOW_MAPDATA';
export const HIDE_MAPDATA = 'spa/map/HIDE_MAPDATA';
export const SET_ADV_MATCHING = 'spa/map/SET_ADV_MATCHING';
export const SET_NAIVE_MATCHING = 'spa/map/SET_NAIVE_MATCHING';
export const UPDATE_STATUS = 'spa/map/UPDATE_STATUS';
export const UPDATE_MAP_STORE = 'spa/map/UPDATE_MAP_STORE';

const initialState = Immutable.Map({
	loaded: true,
	map: null,
	tileServer: 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	drawGrids: false,
	countriesLayer: {},
	districtsLayer: {},
	infoActive: false,
	origin: Immutable.Map({
		layers: {},
		visible: true
	}),
	advanced: Immutable.Map({
		layers: {},
		visible: true
	}),
	naive: Immutable.Map({
		layers: {},
		visible: true
	}),
	past: Immutable.Map({
		layers: {},
		visible: true,
		naiveMatching: 0,
		advMatching: 0,
		clustering: true
	}),
	future: Immutable.Map({
		layers: {},
		visible: true,
		naiveMatching: 0,
		advMatching: 0,
		clustering: true
	}),
	roads: Immutable.Map({
		layers: {},
		visible: false
	}),
	erf_heatmap: Immutable.Map({
		layers: {},
		visible: true
	}),
	sota_heatmap: Immutable.Map({
		layers: {},
		visible: false
	}),
	origin_heatmap: Immutable.Map({
		layers: {},
		visible: false
	}),
	pastPreview: Immutable.Map({
		layers: {},
		visible: true,
		clustering: true
	}),
	futurePreview: Immutable.Map({
		layers: {},
		visible: true,
		clustering: true
	})
});

export default function reducer(state = initialState, action) {
	//console.log('action.type', action.type);
	switch(action.type) {
		case ADD_MAP:
			return state.set('map', action.payload);
		case MAP_LOADED:
			return state.set('loaded', true);
		case MAP_LOADING:
			return state.set('loaded', false);
		case ADD_MAPDATA:
			//console.log('add mapdata...');
			let nextState = state;
			nextState = nextState.setIn([action.nodeType, 'layers'], action.payload.layers);
			//console.log(action.payload.layers);
			if(action.payload.area) {
				nextState = nextState.setIn([action.nodeType, 'area'], action.payload.area);
			} else if(action.payload.layerGroup) {
				nextState = nextState.setIn([action.nodeType, 'layerGroup'], action.payload.layerGroup);
			}
			// nextState = nextState.setIn([action.nodeType, 'visible'], true);
			return nextState;
		case HIDE_MAPDATA:
			let nextState0 = state;
			nextState0 = nextState0.setIn([action.nodeType, 'visible'], false);
			return nextState0;
		case SHOW_MAPDATA:
			let nextState1 = state;
			nextState1 = nextState1.setIn([action.nodeType, 'visible'], true);
			return nextState1;
		case SET_ADV_MATCHING:
			let nextState2 = state;
			nextState2 = nextState2.setIn([action.nodeType, 'advMatching'], action.payload);
			return nextState2;
		case SET_NAIVE_MATCHING:
			let nextState3 = state;
			nextState3 = nextState3.setIn([action.nodeType, 'naiveMatching'], action.payload);
			return nextState3;
		case UPDATE_STATUS:
			let nextState4 = state;
			nextState4 = nextState4.set('status', action.payload);
			return nextState4;
		case UPDATE_MAP_STORE:
			let nextState5 = state;
			if(action.subkey === null) {
				nextState5 = nextState5.set(action.key, action.payload);
			} else {
				nextState5 = nextState5.setIn([action.key, action.subkey], action.payload);
			}
			return nextState5;
		default:
			return state;
	}
}

export function addMap(payload) {
	return {
		type: ADD_MAP,
		payload: payload
	}
}

export function mapLoaded() {
	return dispatch => {
		dispatch({
			type: MAP_LOADED
		});
	}
}

export function addMapData(nodeType, payload) {
	return {
		type: ADD_MAPDATA,
		nodeType: nodeType,
		payload: payload
	}
}

export function showMapData(nodeType) {
	return {
		type: SHOW_MAPDATA,
		nodeType: nodeType
	}
}

export function hideMapData(nodeType) {
	return {
		type: HIDE_MAPDATA,
		nodeType: nodeType
	}
}

export function updateStatus(payload) {
	return { type: UPDATE_STATUS, payload };
}

export function updateMapStore(key, subkey, payload) {
	return { type: UPDATE_MAP_STORE, key, subkey, payload };
}

export function setMatchingPct(nodeType, matchingPct, field) {
	if(field === 'NaiveRisk') {
		return {
			type: SET_NAIVE_MATCHING,
			nodeType: nodeType,
			payload: matchingPct
		}
	} else if (field === 'AdvancedRisk') {
		return {
			type: SET_ADV_MATCHING,
			nodeType: nodeType,
			payload: matchingPct
		}
	}
}
