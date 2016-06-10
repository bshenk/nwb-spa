import React, { Component } from 'react';
import './css/ScenarioInfoWindow.css';

// Helpers
import { monthNumToString } from 'constants/HelperFunctions';
import _ from 'lodash';

export default class ScenarioInfoWindow extends Component {
	render() {
		const { map, backend, editorActive, currentDataExists } = this.props;
		let nowDate = new Date(), offset = '', dataExists = false, startDate = new Date(), endDate = new Date();
		const message = backend.get('message');

		if(!_.isEmpty(message)) {
			dataExists = true;
			nowDate = new Date(message.nowDate.$date);
			startDate = new Date(message.startTime.$date);
			endDate = new Date(message.endTime.$date);
		}

		if(editorActive) {
			offset = '80px';
		} else {
			offset = '20px';
		}

		if(!currentDataExists) {
			offset = '-300px';
		}

		return (
			<div style={{"bottom": `${offset}`}} className={currentDataExists ? `scenario-info-window` : `scenario-info-window hide-off-screen`}>
				<h4>Current Scenario</h4>
				<div className="line-break" />
				<div className="content">
					{dataExists ?
						<div>
							<h5 className="sub">Date Range</h5>{monthNumToString(startDate.getMonth()+1)} {startDate.getDate()}<br />
							<h5 className="sub">Now Date</h5>{monthNumToString(nowDate.getMonth()+1)} {nowDate.getDate()}
						</div> : 'No connection to WebSocket server.'}

				</div>
			</div>
		)
	}
}
