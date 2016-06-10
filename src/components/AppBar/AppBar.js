import React, { Component } from 'react';
import './css/AppBar.css';

// React/Redux connection
import connect from 'react-redux';

// Custom React components
import LinkGroup from './LinkGroup';
import IconRouteLink from './IconRouteLink';
import Copyright from './Copyright';
import NewScenario from './NewScenario';
import ScenarioInfo from './ScenarioInfo';

// Third-party React components
import { Link } from 'react-router';

// DONE:0 testing

export default class AppBar extends Component {
	render() {
		const expanded = this.props.expanded,
			breakStyle = { marginLeft: '-100px' };

		let logo;

		if(expanded) {
			logo = <h3><div className="logo-bold">AXON</div>SPA</h3>;
		} else {
			logo = <h3><div className="logo-bold">A</div>S</h3>;
		}

		return (
			<div className={expanded ? "appBar" : "appBar mini"}>
				<div className="logo">
					<Link to="/">{logo}</Link>
				</div>
				<div className="line-break" style={!expanded ? breakStyle : null}/>
				<div className="appbar-content">
					<LinkGroup name="Scenario" expanded={expanded}>
						<NewScenario expanded={expanded} />
					</LinkGroup>
				</div>
				<Copyright expanded={expanded} toggleExpand={this.props.toggleExpand} />
			</div>
		);
	}
}
