import React, { Component } from 'react';

// React/Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchCurrentData, updateRequest } from 'modules/data';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import FaWifi from 'react-icons/lib/fa/wifi';

class StreamData extends Component {
	render() {
		const { data } = this.props;
		return (
			<OverlayTrigger placement="left" overlay={<Tooltip id="refresh">Stream Current Scenario</Tooltip>}>
				<div className={data.get('streaming') ? "icon streaming" : "icon"} onClick={this._toggleStreaming}>
						<FaWifi />
				</div>
			</OverlayTrigger>
		);
	}

	_toggleStreaming = () => {
		if(this.props.data.get('streaming') === false) {
			this.props.fetchCurrentData(this.props.data.get('currentRequest').toJS());
			this.props.updateRequest('streaming', null, true);
		} else {
			this.props.updateRequest('streaming', null, false);
		}
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchCurrentData, updateRequest }, dispatch);
}

function mapStateToProps({ data }) {
	return { data };
}

export default connect(mapStateToProps, mapDispatchToProps)(StreamData);
