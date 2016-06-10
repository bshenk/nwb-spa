import Immutable from 'immutable';

export const UPDATE_CONFIG = 'spa/config/UPDATE_CONFIG';

const initialState = Immutable.Map({
	expanded: true,
	editorActive: false
});

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case UPDATE_CONFIG:
			let nextState0 = state;
			if(!action.subkey) {
				nextState0 = nextState0.set(action.key, action.payload);
			} else if(action.subkey) {
				nextState0 = nextState0.setIn([action.key, action.subkey], action.payload);
			} else if(action.subsubkey) {
				nextState0 = nextState0.setIn([action.key, action.subkey, action.subsubkey], action.payload);
			}
		return nextState0;
		default:
			return state;
	}
}

export function updateConfigStore(payload, key, subkey, subsubkey) {
	return { type: UPDATE_CONFIG, payload, key, subkey, subsubkey };
}
