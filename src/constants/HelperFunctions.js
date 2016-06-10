import { store } from '../routes';

export function doSend(message) {
	const state = store.getState();
	const ws = state.backend.get('ws');
	ws.send(message);
	console.log(message);
}

export function monthNumToString(monthNum) {
	switch(monthNum) {
		case 1:
			return 'Jan';
		case 2:
			return 'Feb';
		case 3:
			return 'Mar';
		case 4:
			return 'Apr';
		case 5:
			return 'May';
		case 6:
			return 'Jun';
		case 7:
			return 'Jul';
		case 8:
			return 'Aug';
		case 9:
			return 'Sep';
		case 10:
			return 'Oct';
		case 11:
			return 'Nov';
		case 12:
			return 'Dec';
	}
}

export function convToDouble(num) {
	return ('0' + num).slice(-2);
}
