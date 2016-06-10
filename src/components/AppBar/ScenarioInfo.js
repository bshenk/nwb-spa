import React, { Component } from 'react';

// React/Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateMapStore } from 'modules/map';

class ScenarioInfo extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { expanded, map } = this.props;

		return (
			<div className="LgLink">
				{map.get('infoActive') ? <div className="active-bar" /> : null}
				<a onClick={this._handleClick} className={map.get('infoActive') ? 'active' : ''}>
					<i className='fa fa-info fa-1x'></i> {expanded ? 'Scenario Info' : ''}
				</a>
			</div>
		)
	}

	_handleClick = () => {
		this.props.updateMapStore('infoActive', null, !this.props.map.get('infoActive'));
	}
}

function mapStateToProps({ map }) {
	return { map };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ updateMapStore }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioInfo);
