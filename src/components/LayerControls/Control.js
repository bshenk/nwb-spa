import React, { Component } from 'react';
import './css/Control.css';

// Third-party React components
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class Control extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { tooltip, style, toggleActive, icon, active, children } = this.props;
		const tooltipElement = (
			<Tooltip id={tooltip}>{tooltip}</Tooltip>
		);
		return (
			<div className={active ? "control active" : "control"} style={style}>
				<OverlayTrigger placement="left" overlay={tooltipElement}>
					<div className="icon" onClick={toggleActive}>
							{icon}
					</div>
				</OverlayTrigger>

				{active ?
					<div className="popout">
						{children}
					</div>
				: null }
			</div>
		);
	}
}
