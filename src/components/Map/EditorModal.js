import React, { Component } from 'react';
import './css/EditorModal.css';

// React/Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateRequest } from '../../modules/data';
import { updateScenario } from '../../modules/scenario';

// Custom React components
import EditorSection from './EditorSection';

// Third-party React components
import DatePicker from 'react-toolbox/lib/date_picker';
import Dropdown from 'react-toolbox/lib/dropdown';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import MdClose from 'react-icons/lib/md/close';

export default class EditorModal extends Component {
	render() {
		const { activeSection, data, scenario } = this.props;
		let content, title = '';

		if(activeSection === 'dateRange') {
			return (
				<div className="editor-modal-container">
					<div className="editor-modal">
						<div className="title-bg">
							<h2>Date Range</h2>
							<span style={{"float":"right"}}><MdClose onClick={this.props.resetActiveSection}/></span>
						</div>
						<div className="content">
							<h5 className="sub">Start</h5>
							<DatePicker
								onChange={(value) => this.handleDateChange(value, 'startDate')}
								value={data.get('previewRequest').get('startEndNowDates')[0]}
								/>
							<h5 className="sub">End</h5>
							<DatePicker
								onChange={(value) => this.handleDateChange(value, 'endDate')}
								value={data.get('previewRequest').get('startEndNowDates')[1]}
								/>
							<h5 className="sub">"Now"</h5>
							<DatePicker
								onChange={(value) => this.handleDateChange(value, 'nowDate')}
								value={data.get('previewRequest').get('startEndNowDates')[2]}
								minDate={data.get('previewRequest').get('startEndNowDates')[0]}
								maxDate={data.get('previewRequest').get('startEndNowDates')[1]}
								/>
						</div>
					</div>
				</div>
			);
		} else if(activeSection === 'fatalityRange') {
			const lowerLimitOptions = [0, 1, 5, 10, 20].map(function(number) {
				return { label: number, value: number }
			});

			const upperLimitOptions = [50, 100, 175, 250, 500].map(function(number) {
				return { label: number, value: number }
			});

			return (
				<div className="editor-modal-container">
					<div className="editor-modal">
						<div className="title-bg">
							<h2>Fatality Range</h2>
							<span style={{"float":"right"}}><MdClose onClick={this.props.resetActiveSection}/></span>
						</div>
						<div className="content">
							<h5 className="sub">Lower Limit</h5>
							<Dropdown
								onChange={(value) => this._handleLimitChange('lower', value)}
								source={lowerLimitOptions}
								value={data.get('previewRequest').get('fatalities')[0]}
							/>
							<h5 className="sub">Upper Limit</h5>
							<Dropdown
								onChange={(value) => this._handleLimitChange('upper', value)}
								source={upperLimitOptions}
								value={data.get('previewRequest').get('fatalities')[1]}
							/>
						</div>
					</div>
				</div>
			);
		} else if(activeSection === 'types') {
			return (
				<div className="editor-modal-container">
					<div className="editor-modal">
						<div className="title-bg">
							<h2>Types</h2>
							<span style={{"float":"right"}}><MdClose onClick={this.props.resetActiveSection}/></span>
						</div>
						<div className="content">
							<h5 className="sub">Actor 1</h5>
							<Autocomplete
								onChange={(value) => this._handleSelect('actor1', value)}
								source={this.props.scenario.get('actor1Options')}
								selectedPosition="below"
								value={this.props.data.get('previewRequest').get('allowedActor1TypeCodes')}
							/>
							<h5 className="sub">Actor 2</h5>
							<Autocomplete
								onChange={(value) => this._handleSelect('actor2', value)}
								source={this.props.scenario.get('actor2Options')}
								selectedPosition="below"
								value={this.props.data.get('previewRequest').get('allowedActor2TypeCodes')}
							/>
							<h5 className="sub">Event</h5>
							<Autocomplete
								onChange={(value) => this._handleSelect('event', value)}
								source={this.props.scenario.get('eventOptions')}
								selectedPosition="below"
								value={this.props.data.get('previewRequest').get('allowedEventTypeCodes')}
							/>
							<h5 className="sub">Interaction</h5>
							<Autocomplete
								onChange={(value) => this._handleSelect('interaction', value)}
								source={this.props.scenario.get('interactionOptions')}
								selectedPosition="below"
								value={this.props.data.get('previewRequest').get('allowedInteractionTypeCodes')}
							/>
						</div>
					</div>
				</div>
			);
		} else {
			return null;
		}
	}

	handleDateChange = (value, type) => {
		let selected;
		const arr = this.props.data.get('previewRequest').get('startEndNowDates');

		if(type === 'startDate') {
			selected = [value, arr[1], arr[2]];
		} else if(type === 'endDate' && arr[2] === undefined) {
			selected = [arr[0], value, value];
		} else if(type === 'endDate') {
			selected = [arr[0], value, arr[2]];
		} else if(type === 'nowDate') {
			selected = [arr[0], arr[1], value];
		}

		this.props.updateRequest('previewRequest', 'startEndNowDates', selected);
	}

	_handleLimitChange = (type, selected) => {
		let value;
		if(type === 'lower') {
			value = [selected, this.props.data.get('previewRequest').get('fatalities')[1]];
		} else if(type === 'upper') {
			value = [this.props.data.get('previewRequest').get('fatalities')[0], selected];
		}

		this.props.updateRequest('previewRequest', 'fatalities', value);
	}

	_handleSelect = (type, value) => {
		let stateKey, requestKey;

		if(type === 'country') {
			stateKey = 'selectedCountryObjs';
			requestKey = 'allowedCountryCodes';
		} else if(type === 'actor1') {
			stateKey = 'selectedActor1Objs';
			requestKey = 'allowedActor1TypeCodes';
		} else if(type === 'actor2') {
			stateKey = 'selectedActor2Objs';
			requestKey = 'allowedActor2TypeCodes';
		} else if(type === 'event') {
			stateKey = 'selectedEventObjs';
			requestKey = 'allowedEventTypeCodes';
		} else if(type === 'interaction') {
			stateKey = 'selectedInteractionObjs';
			requestKey = 'allowedInteractionTypeCodes';
		}

		this.props.updateScenario(stateKey, value);

		this.props.updateRequest('previewRequest', requestKey, value);
	}
}

// function mapStateToProps({ data, scenario }) {
// 	return { data, scenario };
// }
//
// function mapDispatchToProps(dispatch) {
// 	return bindActionCreators({ updateRequest, updateScenario }, dispatch);
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(EditorModal);
