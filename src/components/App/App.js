import React, { Component } from 'react';
import './css/app.css';
import './css/ContextMenu.css';
import './css/react-toolbox.css';

// Constants + Helpers
import { notificationStyle } from 'constants/Styles';
import { categoryData, localData } from 'constants/Links';

// React/redux connection
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateConfigStore } from 'modules/config';
import { fetchCategoryData } from 'modules/data';
import { updateScenario } from 'modules/scenario';
import { mapLoaded, addMap, addMapData, hideMapData,
	showMapData, setMatchingPct, updateStatus } from 'modules/map';
import { fetchEventPreview, updateRequest, fetchCurrentData } from 'modules/data';

// Custom React Components
import AppBar from 'components/AppBar/AppBar';
import Map from 'components/Map/Map';
import Loading from 'components/Map/Loading';

// Third-party React Components
import NotificationSystem from 'react-notification-system';

class App extends Component {
	componentDidMount() {
		this._notificationSystem = this.refs.notificationSystem;

		let config
		const rootUrl = this.props.data.get('rootUrl');

		if(rootUrl === localData) config = { url: categoryData, method: 'get' }
			else config = { url: `${rootUrl}/categories`, method: 'get' }

		// Get scenario editor data and store within store.scenario.data
		this.props.fetchCategoryData(config, err => {
			console.log(err);
		});
	}

	componentDidUpdate(prevProps, prevState) {
		// if initial mounting did not properly receive category data, wait for data to be put into data.categories first
		setTimeout(() => {
			const prevRoot = prevProps.data.get('rootUrl');
			const rootUrl = this.props.data.get('rootUrl');
			if(prevRoot !== rootUrl && this.props.data.get('categories').size === 0) {
				let config

				if(rootUrl === localData) config = { url: categoryData, method: 'get' }
					else config = { url: `${rootUrl}/categories`, method: 'get' }

				// Get scenario editor data and store within store.scenario.data
				this.props.fetchCategoryData(config, err => {
					console.log(err);
				});
			}
		}, 2000);
	}

	render() {
		const { map, routing, data, config, children } = this.props;
		return (
			<div className="app-container">
				<NotificationSystem ref="notificationSystem" style={notificationStyle} />
				<AppBar {...routing} expanded={this.props.config.get('expanded')} toggleExpand={this.toggleExpand}/>
				<Map {...this.props} notifications={this._notificationSystem} />
			</div>
		);
	}

	toggleExpand = () => {
		if(this.props.config.get('expanded')) {
			this.props.updateConfigStore(false, 'expanded');
		} else {
			this.props.updateConfigStore(true, 'expanded');
		}
	}
}

function mapStateToProps({ map, config, routing, data }) {
	return { map, config, routing, data };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ updateConfigStore, updateScenario, fetchCategoryData,
		mapLoaded, addMapData, hideMapData, showMapData, setMatchingPct, addMap,
		fetchEventPreview, updateRequest, fetchCurrentData, updateStatus }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
