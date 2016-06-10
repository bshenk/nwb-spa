import React, { Component } from 'react';
import './css/FieldOptions.css';

// Redux store connection
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMatchingPct, updateMapStore } from 'modules/map';

import { Input } from 'react-bootstrap';
import _ from 'lodash';

import Checkbox from 'react-toolbox/lib/checkbox';

class ControlContent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			NaiveRisk: false,
			AdvancedRisk: false,
			past: null,
			future: null
		};
	}

	render() {
		const { objTitle, withinFields, map, drawOption, type,
			toggle, name, data, heatmap, children, heatmapKey, clustering } = this.props;
		let naivePct = 0, advPct = 0, isEmpty = false, isHeatmapEmpty = false;

		if(typeof withinFields == 'function') {
			naivePct = (map.get(objTitle).get('naiveMatching')*100).toFixed(0);
			advPct = (map.get(objTitle).get('advMatching')*100).toFixed(0);
		}

		if(objTitle) {
			isEmpty = _.isEmpty(map.get(objTitle).get('layers'));
		}

		if(heatmapKey) {
			isHeatmapEmpty = _.isEmpty(map.get(heatmapKey).get('layers'));
		}

		return (
			<div className="field-options">
				<div className="field-options-header"><h5>{name}</h5></div>
				<div className={"field-options-content"}>
					{objTitle ?
						<Checkbox
							label={`Hide ${type}`}
							checked={!map.get(objTitle).get('visible')}
							onChange={() => toggle(objTitle)}
							className={isEmpty ? "disabled" : null}
						/>
					: null }

					{heatmap ?
						<Checkbox
							label="Hide Heatmap"
							checked={!map.get(heatmapKey).get('visible')}
							onChange={() => toggle(heatmapKey)}
							className={isHeatmapEmpty ? "disabled" : null}
						/>
					: null}

					{clustering ?
						<Checkbox
							label="Disable Clustering"
							checked={!map.get(objTitle).get('clustering')}
							onChange={() => this.toggleClustering(objTitle)}
						/>
					: null}

					{typeof withinFields == 'function' ?
						<div>
							<Checkbox
								label={"Show Within SotA Risk (" + naivePct + "%)"}
								checked={this.state.NaiveRisk}
								onChange={() => this.handleWithinFieldChange(objTitle, 'NaiveRisk')}
								className={isEmpty ? "disabled" : null}
							/>

							<Checkbox
								label={"Show Within ERF Risk (" + advPct + "%)"}
								checked={this.state.AdvancedRisk}
								onChange={() => this.handleWithinFieldChange(objTitle, 'AdvancedRisk')}
								className={isEmpty ? "disabled" : null}
							/>
						</div>
					: null}

					{children}
				</div>
			</div>
		);
	}

	handleWithinFieldChange = (objTitle, field) => {
		const data = this.props.map.get(objTitle);
		const layers = data.get('layers');

		if(this.state[field]) {
			// Remove filtered markers from map
			window.map.removeLayer(this.state[objTitle]);

			// Show all events
			this.props.showAll(objTitle);

			// Set matchingPct back to zero
			this.props.setMatchingPct(objTitle, 0, field);

			this.setState({
				[field]: false
			});
		} else {
			let filtered = this.props.withinFields(objTitle, field);

			// Add filtered map layer to local state to remove at a later time
			this.setState({
				[field]: true,
				[objTitle]: filtered
			});
		}
	}

	toggleClustering = (key) => {
		const clustering = this.props.map.get(key).get('clustering');

		if(clustering) {
			this.props.updateMapStore(key, 'clustering', false);
		} else {
			this.props.updateMapStore(key, 'clustering', true);
		}
	}
}

function mapStateToProps({ map }) {
	return { map };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ setMatchingPct, updateMapStore }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlContent);
