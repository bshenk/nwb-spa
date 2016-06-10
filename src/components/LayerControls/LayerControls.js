import React, { Component } from 'react';
import './css/LayerControls.css';

// Constants
import { hanaData } from 'constants/Links';

// React/Redux connection
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchCurrentData, updateRequest } from 'modules/data';

// Custom React components
import Control from './Control';
import ControlPopout from './ControlPopout';
import ControlContent from './ControlContent';
import SourceOptions from './SourceOptions';
import AdvancedOptions from './AdvancedOptions';
import StreamData from './StreamData';

// Third-party React components
import { Input, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Select from 'react-select';
import { ContextMenu, MenuItem, ContextMenuLayer } from 'react-contextmenu';
import { FaDotCircleO, FaTh, FaGlobe, FaSliders, FaUser } from 'react-icons/lib/fa';

class StreamContextMenu extends Component {
	render() {
		return (
			<ContextMenu identifier="StreamData">
				<MenuItem onClick={this._handleClick}>
					Display Current Scenario
				</MenuItem>
			</ContextMenu>
		);
	}

	_handleClick = (e, data) => {
		let config = {
			url: `${this.props.rootUrl}/clientRequest`,
			method: 'POST',
			auth: { username:'AXON', password:'Swarm4it!' },
			data: {
				...this.props.currentRequest
			}
		}

		if(this.props.rootUrl === './data/tempData.json') {
			config = {
				...config,
				url: `${this.props.rootUrl}`,
				method: 'GET'
			}
		}

		this.props.fetchCurrentData(config, () => {
			this.props.notifications.addNotification({
				title: 'Data Fetch Error',
				message: 'No data was received from the server. Make sure you have the right source in your config options.',
				level: 'error',
				position: 'tr',
				autoDismiss: '5'
			});
		});
	}
}

const StreamContext = ContextMenuLayer("StreamData")(StreamData);

class LayerControls extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: false,
			fields: false,
			geo: false,
			advanced: false,
			sources: false
		};
	}

	render() {
		const { data, notifications, fetchCurrentData,
			toggle, showAll, withinFields, map } = this.props;
		return (
			<div className="layer-controls">
				<div className="control">
					<StreamContext />
					<StreamContextMenu
						fetchCurrentData={fetchCurrentData}
						currentRequest={data.get('currentRequest').toJS()}
						rootUrl={data.get('rootUrl')}
						notifications={notifications}
					/>
				</div>
				<Control
					icon={<FaDotCircleO />}
					active={this.state.events}
					toggleActive={() => this.toggleActive('events')}
					tooltip="Events">

					<ControlPopout>
						<ControlContent
							type='Events'
							name='Past Events'
							objTitle='past'
							toggle={toggle}
							showAll={showAll}
							withinFields={withinFields}
							clustering={true}
						/>

						<ControlContent
							type='Events'
							name='Future Events'
							objTitle='future'
							toggle={toggle}
							showAll={showAll}
							withinFields={withinFields}
							clustering={true}
						/>

						<ControlContent
							type='Events'
							name='Past Events (Preview)'
							objTitle='pastPreview'
							toggle={toggle}
							showAll={showAll}
							clustering={true}
						/>

						<ControlContent
							type='Events'
							name='Future Events (Preview)'
							objTitle='futurePreview'
							toggle={toggle}
							showAll={showAll}
							clustering={true}
						/>
					</ControlPopout>
				</Control>

				<Control
					icon={<FaTh />}
					active={this.state.fields}
					toggleActive={() => this.toggleActive('fields')}
					tooltip="Fields">

					<ControlPopout>
						<ControlContent
							type='Grid'
							name='Origin'
							objTitle='origin'
							toggle={toggle}
							heatmap={map.get('origin_heatmap').get('layers')}
							heatmapKey='origin_heatmap'
						/>

						<ControlContent
							type='Grid'
							name='Risk (SotA)'
							objTitle='naive'
							toggle={toggle}
							heatmap={map.get('sota_heatmap').get('layers')}
							heatmapKey='sota_heatmap'
						/>

						<ControlContent
							type='Grid'
							name='Risk (ERF)'
							objTitle='advanced'
							toggle={toggle}
							heatmap={map.get('erf_heatmap').get('layers')}
							heatmapKey='erf_heatmap'
						/>
					</ControlPopout>
				</Control>

				<Control
					icon={<FaGlobe />}
					active={this.state.geo}
					toggleActive={() => this.toggleActive('geo')}
					tooltip="Geo">

					<ControlPopout>
						<ControlContent
							type='Grid'
							name='Roads'
							objTitle='roads'
							toggle={toggle}
							showAll={showAll}
						/>
					</ControlPopout>
				</Control>

				{/*<div className="middle-fill"></div>*/}

				<Control
					icon={<FaSliders />}
					active={this.state.advanced}
					toggleActive={() => this.toggleActive('advanced')}
					tooltip="Advanced">

					<ControlPopout>
						<AdvancedOptions />
					</ControlPopout>
				</Control>

				<Control
					icon={<FaUser />}
					active={this.state.sources}
					toggleActive={() => this.toggleActive('sources')}
					tooltip="Sources">

					<ControlPopout>
						<SourceOptions />
					</ControlPopout>
				</Control>
				<div className="fill" onClick={() => this.clearActive()}/>
			</div>
		);
	}

	clearActive = () => {
		this.setState({
			events: false,
			fields: false,
			geo: false,
			advanced: false,
			sources: false
		});
	}

	toggleActive = (name) => {
		const isActive = this.state[name];

		if(isActive) {
			this.setState({
				[name]: false
			});
		} else {
			this.clearActive();
			this.setState({
				[name]: true
			});
		}
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchCurrentData, updateRequest }, dispatch);
}

function mapStateToProps({ data, map }) {
	return { data, map };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerControls);
