import React, { Component } from 'react';
import { FaRotateLeft, FaMapO, FaCheck } from 'react-icons/lib/fa';

export default class EditorToolbar extends Component {
	render() {
		return (
			<div className={this.props.active ? "editor-toolbar" : "editor-toolbar hide-off-screen"}>
				<div className="toolbar-icon" onClick={this.props.resetScenario}>
					<FaRotateLeft />
				</div>
				<div className="toolbar-icon" onClick={this.props.previewScenario}>
					<FaMapO />
				</div>
				<div className="toolbar-icon" onClick={this.props.setScenario}>
					<FaCheck />
				</div>
			</div>
		);
	}
}
