import React, { Component } from 'react';

// React/Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateRequest } from 'modules/data';
import { updateScenario } from 'modules/scenario';
import { updateConfigStore } from 'modules/config';
import FaPlus from 'react-icons/lib/fa/plus';

// Helpers
import axios from 'axios';
import _ from 'lodash';

class NewScenario extends Component {
	constructor(props) {
		super(props);

		this.state = {
			active: this.props.config.get('editorActive'),
			countriesLayer: null
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if(!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
			return true;
		} else {
			return false;
		}
	}

	render() {
		const { expanded } = this.props;
		const { active } = this.state;
		const iconStyle = {
			'margin': '0 10px 0 5px'
		}
		return (
			<div className={this.props.data.get('categories').size === 0 ? 'LgLink disabled' : 'LgLink'}>
				{this.props.scenario.get('step') > 0 ? <div className="active-bar" /> : null}
				<a onClick={this._handleClick} className={this.props.scenario.get('step') > 0 ? 'active' : ''}>
					<FaPlus style={iconStyle} size={15}/> {expanded ? 'New Scenario' : ''}
				</a>
			</div>
		);
	}

	_handleClick = () => {
		if(this.props.scenario.get('step') === 0) {
			this.props.updateScenario('step', 1);
			window.map.addLayer(this.props.map.get('countriesLayer'));
			this.props.updateConfigStore(true, 'editorActive');
		} else {
			this.props.updateScenario('step', 0);
			window.map.removeLayer(this.props.map.get('countriesLayer'));
			this.props.updateConfigStore(false, 'editorActive');
		}
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ updateRequest, updateScenario, updateConfigStore }, dispatch);
}

function mapStateToProps({ data, scenario, map, config }) {
	return { data, scenario, map, config };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewScenario);
