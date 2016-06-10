import React, { Component } from 'react';

export default class ControlPopout extends Component {
	render() {
		const { children } = this.props;
		return (
			<div className="control-options">
				{children}
			</div>
		);
	}
}
