import React, { Component } from 'react';

// Constants
import { localWS, axonWS, tridentWS, hanaRoot, tridentRoot,
	localData, positron, sg7Root, sg7WS, sg1Root } from 'constants/Links';

// React/redux connection
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateRequest, updateRoot } from 'modules/data';
import { updateMapStore } from 'modules/map';

// Custom React Components
import ControlContent from './ControlContent';

// Third-party React Components
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class SourceOptions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedUri: '',
			selectedSource: '',
			selectedTileServer: '',
			tileOptions: [
				{ value: positron, label: 'CartoDB: Positron' },
				{ value: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', label: 'CartoDB: Dark Matter'}
			],
			sourceOptions: [
				{ value: hanaRoot, label: hanaRoot },
				{ value: tridentRoot, label: tridentRoot },
				{ value: localData, label: 'Local Data' },
				{ value: sg7Root, label: sg7Root },
				{ value: sg1Root, label: sg1Root }
			]
		}
	}

	render() {
		const { selectedSource, sourceOptions, selectedUri,
			selectedTileServer, tileOptions } = this.state;

		const { data, backend, map } = this.props;
		return (
			<div>
				<ControlContent name="Data Source URL">
					<Select
						name="select-data-url"
						value={data.get('rootUrl')}
						options={sourceOptions}
						clearable={false}
						onChange={this._handleSourceChange}
						allowCreate={true}
					/>
				</ControlContent>
				<ControlContent name="Tile Server URL">
					<Select
						name="select-tile-url"
						value={map.get('tileServer')}
						options={tileOptions}
						onChange={this._handleTileServerChange}
						clearable={false}
						allowCreate={true}
					/>
				</ControlContent>
			</div>
		);
	}

	_handleUriChange = (option) => {
		this.props.changeWsUri(option);
	}

	_handleSourceChange = (option) => {
		this.props.updateRoot(option);
	}

	_handleTileServerChange = (option) => {
		this.props.updateMapStore('tileServer', null, option);
	}
}

function mapStateToProps({ backend, data, map }) {
	return { backend, data, map };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ updateRequest, updateRoot, updateMapStore }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SourceOptions);
