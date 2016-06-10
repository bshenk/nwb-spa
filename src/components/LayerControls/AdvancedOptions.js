import React, { Component } from 'react';

// Constants
import { localData, hanaData } from 'constants/Links';

// React/redux connection
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchCurrentData, updateRequest, updateParam } from 'modules/data';
import { updateMapStore } from 'modules/map';

// Custom React components
import ControlContent from './ControlContent';

// Third-party React components
import { Input, Button } from 'react-bootstrap';
import Select from 'react-select';
import Checkbox from 'react-toolbox/lib/checkbox';
import Slider from 'react-toolbox/lib/slider';

class AdvancedOptions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sendOnly: this.props.data.get('currentRequest').get('sendOnly')
		}

		this._toggle = ::this._toggle;
		this._handleInputRangeChange = ::this._handleInputRangeChange;
	}

	render() {
		return (
			<div>
				<ControlContent name="Layers Included">
					<Checkbox
						label="Past Events"
						checked={'past' in this.state.sendOnly.events}
						onChange={() => this._toggle('events', 'past')} />

					<Checkbox
						label="Future Events"
						checked={'future' in this.state.sendOnly.events}
						onChange={() => this._toggle('events', 'future')} />

					<Checkbox
						label="Origin Field"
						checked={'Origin' in this.state.sendOnly.fields}
						onChange={() => this._toggle('fields', 'Origin')} />

					<Checkbox
						label="Risk (SotA) Field"
						checked={'NaiveRisk' in this.state.sendOnly.fields}
						onChange={() => this._toggle('fields', 'NaiveRisk')} />

					<Checkbox
						label="Risk (ERF) Field"
						checked={'AdvancedRisk' in this.state.sendOnly.fields}
						onChange={() => this._toggle('fields', 'AdvancedRisk')} />

					<Checkbox
						label="GeoData: Road Field"
						checked={'GeoData' in this.state.sendOnly.fields}
						onChange={() => this._toggle('fields', 'GeoData')} />
				</ControlContent>
				<ControlContent name="Draw Grids">
					<Checkbox
						label="Draw Grids for Risk/Origin Fields"
						checked={this.props.map.get('drawGrids')}
						onChange={() => this.toggleDrawGrids()}
					/>
				</ControlContent>
				<ControlContent name="Field Coverage (%)">
					<Slider
						max={0.2}
						min={0.01}
						step={0.01}
						editable
						value={this.props.data.get('currentRequest').get('fieldCoverage')}
						onChange={(value) => this._handleInputRangeChange(value)} />
				</ControlContent>
			</div>
		);
	}

	_toggle = (type, subtype) => {
		if(subtype in this.state.sendOnly[type]) {
			this._remove(type, subtype);
		} else {
			this._add(type, subtype);
		}

		this.setState({
			sendOnly: this.props.data.get('currentRequest').get('sendOnly')
		});
	}

	_add(type, subtype) {
		let payload = this.state.sendOnly;

		if(type === 'events') {
			payload[type] = {
				...payload[type],
				[subtype]: null
			}
		} else if(type === 'fields' && subtype === 'GeoData') {
			payload[type] = {
				...payload[type],
				[subtype]: 'Roads'
			}
		} else if (type === 'fields') {
			payload[type] = {
				...payload[type],
				[subtype]: 'AllEvents'
			}
		}

		this.props.updateRequest('currentRequest', 'sendOnly', payload);
	}

	_remove(type, subtype) {
		let payload = this.state.sendOnly;
		delete payload[type][subtype];
		this.props.updateRequest('currentRequest', 'sendOnly', payload);
	}

	_handleInputRangeChange = (value) => {
		this.props.updateRequest('currentRequest', 'fieldCoverage', value);
	}

	toggleDrawGrids = () => {
		const drawGrids = this.props.map.get('drawGrids');

		if(drawGrids) {
			this.props.updateMapStore('drawGrids', null, false);
		} else {
			this.props.updateMapStore('drawGrids', null, true);
		}
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchCurrentData, updateRequest, updateParam, updateMapStore }, dispatch);
}

function mapStateToProps({ data, map }) {
	return { data, map };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedOptions);
