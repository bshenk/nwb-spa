import React, { Component } from 'react';

import { IndexLink, Link } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import './css/LgLink.css';

export default class IconRouteLink extends Component {
	render() {
		const { tooltip, icon, currentPath, to, expanded } = this.props;

		let iconClass = '';

		if(expanded) {
			iconClass = `fa ${icon} fa-1x`;
		} else {
			iconClass = `fa ${icon} fa-lg`
		}

		// if active, change Link to link back to root
		if(currentPath === to) {
			return (
				<div className="LgLink">
					<div className="active-bar" />
					<Link to="/" activeClassName="active">
							<i className={iconClass}></i> {expanded ? tooltip : ''}
					</Link>
				</div>
			);
		} else {
			return (
				<div className="LgLink">
					<Link to={to}>
							<i className={iconClass}></i> {expanded ? tooltip : ''}
					</Link>
				</div>
			);
		}
	}
}
