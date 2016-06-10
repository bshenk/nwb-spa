import React, { Component } from 'react';
import './css/Editor.css';

// Constants + Helpers
import axios from 'axios';
import _ from 'lodash';
import { localEventData, localData } from '../../constants/Links';

// Data
// import countryData from 'data/countries.geo.json';
// import countryData from 'CountriesGeo';

// React/Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateRequest, fetchEventPreview, resetPreview } from '../../modules/data';
import { updateScenario, resetScenario } from '../../modules/scenario';
import { updateMapStore } from '../../modules/map';
import { updateConfigStore } from '../../modules/config';

// Custom React components
import EditorSection from './EditorSection';
import EditorToolbar from './EditorToolbar';
import EditorModal from './EditorModal';

export class Editor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			countriesLayer: null,
			districtsLayer: null,
			countriesActive: false,
			districtsActive: false,
			editing: '',
			step: 0
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
	}

	componentWillReceiveProps(nextProps) {
		const that = this;
		// if new category data, create country geoJSON layer for scenario editor
		if(!_.isEqual(this.props.data.get('categories'), nextProps.data.get('categories'))) {
			let filteredCountryData = [], countryData = {};
			axios.get('./data/countries.geo.json').then(function(response) {
				_.forIn(nextProps.data.get('categories').COUNTRY, function(country) {
					let filteredCountry = _.find(response.data.features, function(o) {
						return o.id === country.code;
					});

					// Add event count to property list
					filteredCountry.properties.events = country.events;

					// Add to filtered list
					filteredCountryData = [...filteredCountryData, filteredCountry];
				});

				const countriesLayer = L.geoJson(filteredCountryData, {
					style: { "color": "#FEC131" },
					onEachFeature: function(feature, layer) {
						const popup = L.popup({
							id: feature.id,
							name: feature.properties.name
						});

						if(feature.properties && feature.properties.name) {
							layer.bindPopup(popup);
							layer.id = feature.id;
							layer.name = feature.properties.name;
							layer.events = feature.properties.events;
						}
					}
				});

				that.setState({ countriesLayer });
				that.props.updateMapStore('countriesLayer', null, countriesLayer);
			});
		}
	}

	componentDidUpdate() {
		const that = this;
		if(!window.map.hasEventListeners('popupopen')) {
			window.map.on('popupopen', function(e) {
				// console.log(e.popup);
				const showDistrictsButton = e.popup._contentNode.childNodes[4].childNodes[1];
				const addCountryButton = e.popup._contentNode.childNodes[4].childNodes[3];
				const addDistrictButton = e.popup._contentNode.childNodes[4].childNodes[5];

				showDistrictsButton.addEventListener('click', function() {
					that.showDistricts(e.popup.options);
				});

				addCountryButton.addEventListener('click', function() {
					that.addCountry(e.popup.options, e);
				});

				if(addDistrictButton) {
					addDistrictButton.addEventListener('click', function() {
						that.addDistrict(e.popup.options);
					});
				}
			});
		}
	}

	render() {
		const { scenario, data } = this.props;
		let prevReq = this.props.data.get('previewRequest');
		let countriesAdded = prevReq.get('allowedCountryCodes');
		let countries = [], countryNames;
		const that = this;

		if(this.state.countriesLayer) {
			this.state.countriesLayer.eachLayer(function(layer) {
				if(countriesAdded.indexOf(layer.id) > -1) {
					layer._popup.setContent(`<div class="leaflet-popup-title"><h5>${layer.name}</h5></div>
						<div class="leaflet-popup-expanded-content">
							<h5 class="sub">Events since ${that.props.scenario.get('minYear')}</h5>
							${layer.events}
						</div>
						<div class="leaflet-popup-actions">
							<div></div>
							<div class="action"><i class="fa fa-minus fa-1x"></i></div>
						</div>`);
					layer.setStyle({
						fillOpacity: 0.5
					});
				} else {
					layer._popup.setContent(`<div class="leaflet-popup-title"><h5>${layer.name}</h5></div>
						<div class="leaflet-popup-expanded-content">
							<h5 class="sub">Events since ${that.props.scenario.get('minYear')}</h5>
							${layer.events}
						</div>
						<div class="leaflet-popup-actions">
							<div></div>
							<div class="action"><i class="fa fa-plus fa-1x"></i></div>
						</div>`);
					layer.setStyle({
						fillOpacity: 0.2
					});
				}
			});
		}

		if(this.state.districtsLayer) {
			this.state.districtsLayer.eachLayer(function(layer) {
				if(countriesAdded.hasOwnProperty(layer.countryID)) {
					const countryForDistricts = countriesAdded[layer.countryID];
					if(_.contains(countryForDistricts.allowedDistricts, layer.id)) {
						layer._popup.setContent(`<div class="leaflet-popup-title"><h5>${layer.id}</h5></div>
							<div class="leaflet-popup-expanded-content">
								<h5 class="sub">Actor Type</h5>
								Primary: Rebel Forces<br />
								Secondary: State Forces
							</div>
							<div class="leaflet-popup-actions">
								<div></div>
								<div></div>
								<div class="action"><i class="fa fa-minus fa-1x"></i></div>
							</div>`);
						layer.setStyle({
							fillOpacity: 0.5
						});
					} else {
						layer._popup.setContent(`<div class="leaflet-popup-title"><h5>${layer.id}</h5></div>
							<div class="leaflet-popup-expanded-content">
								<h5 class="sub">Actor Type</h5>
								Primary: Rebel Forces<br />
								Secondary: State Forces
							</div>
							<div class="leaflet-popup-actions">
								<div></div>
								<div></div>
								<div class="action"><i class="fa fa-plus fa-1x"></i></div>
							</div>`);
						layer.setStyle({
							fillOpacity: 0.2
						});
					}
				}
			});
		}

		// ONLY USE IF COUNTRIES ADDED IS OBJECT - FOR DISTRICTS
		// if(Object.keys(countriesAdded).length > 0) {
		// 	for(let key in countriesAdded) {
		// 		if(countriesAdded.hasOwnProperty(key)) {
		// 			countries = [...countries, countriesAdded[key].name];
		// 		}
		// 	}
		// 	countryNames = countries.join(", ");
		// }

		if(countriesAdded.length > 0) {
			countryNames = countriesAdded.join(", ");
		}

		const startDate = prevReq.get('startEndNowDates')[0];
		const nowDate = prevReq.get('startEndNowDates')[2];
		const endDate = prevReq.get('startEndNowDates')[1];
		const lowerFatal = prevReq.get('fatalities')[0];
		const upperFatal = prevReq.get('fatalities')[1];

		const actor1 = prevReq.get('allowedActor1TypeCodes');
		const actor2 = prevReq.get('allowedActor2TypeCodes');
		const event = prevReq.get('allowedEventTypeCodes');
		const interaction = prevReq.get('allowedInteractionTypeCodes');

		return (
			<div className="editor-container">
				<div className="editor-overlay">
					<EditorSection
						className="countries"
						title="Countries"
						number="1"
						active={scenario.get('step') > 0}
						nextStep={() => this.nextStep()}
						step={1}
						currentStep={scenario.get('step')}
						countries={prevReq.get('allowedCountryCodes')}>
						Add up to five countries to your scenario by clicking on them on the map below.<br />
						<h5 className="sub">Added</h5>
						<p>
							{countriesAdded.length > 0 ? countryNames : <span>You must add at least one country in order to continue.</span>}
						</p>

					</EditorSection>
					<EditorSection
						className="date-range"
						title="Date Range"
						number="2"
						editOnClick={() => this.setActiveEditing('dateRange')}
						active={scenario.get('step') > 1}
						nextStep={() => this.nextStep()}
						step={2}
						currentStep={scenario.get('step')}
						countries={prevReq.get('allowedCountryCodes')}>

						Constrain the date range of your scenario.<br />
						<h5 className="sub">Start</h5>
						{startDate ? `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}` : 'No start date set.'}<br />
						<h5 className="sub">End</h5>
						{endDate ? `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}` : 'No end date set.'}<br />
						<h5 className="sub">"Now"</h5>
						{nowDate ? `${nowDate.getMonth() + 1}/${nowDate.getDate()}/${nowDate.getFullYear()}` : 'No now date set.'}

					</EditorSection>
					<EditorSection
						className="fatality-range"
						title="Fatality Range"
						number="3"
						numberStyle={{"fontSize": "210px", "marginBottom": "35px"}}
						editOnClick={() => this.setActiveEditing('fatalityRange')}
						active={scenario.get('step') > 2}
						nextStep={() => this.nextStep()}
						step={3}
						currentStep={scenario.get('step')}
						countries={prevReq.get('allowedCountryCodes')}>

						Constrain the fatality range of your scenario.<br />
						<h5 className="sub">Lower Limit</h5>
						{lowerFatal ? lowerFatal : 'No lower limit set.'}<br />
						<h5 className="sub">Upper Limit</h5>
						{upperFatal ? upperFatal : 'No upper limit set.'}


					</EditorSection>
					<EditorSection
						className="types"
						title="Types"
						number="4"
						numberStyle={{"fontSize": "210px", "marginBottom": "15px"}}
						editOnClick={() => this.setActiveEditing('types')}
						active={scenario.get('step') > 3}
						step={4}
						currentStep={scenario.get('step')}
						countries={prevReq.get('allowedCountryCodes')}>

						Constrain the types of events in your scenario.<br />
						<h5 className="sub">Actor 1</h5>
						{actor1.length > 0 ? actor1.join(", ") : 'No actor types set.'}<br />

						<h5 className="sub">Actor 2</h5>
						{actor2.length > 0 ? actor2.join(", ") : 'No actor types set.'}<br />

						<h5 className="sub">Event</h5>
						{event.length > 0 ? event.join(", ") : 'No event types set.'}<br />

						<h5 className="sub">Interaction</h5>
						{interaction.length > 0 ? interaction.join(", ") : 'No interaction types set.'}

					</EditorSection>
				</div>
				<EditorToolbar
					exitShowDistricts={this.exitShowDistricts}
					addAllDistricts={this.addAllDistricts}
					removeAllDistricts={this.removeAllDistricts}
					districtsActive={this.state.districtsActive}
					active={this.props.scenario.get('step') > 0}
					previewScenario={this.previewScenario}
					resetScenario={this.resetScenario}
					setScenario={this.setScenario}
					/>
				<EditorModal
					activeSection={this.state.editing}
					resetActiveSection={this.resetActiveEditing}
					data={data}
					scenario={scenario}
					/>
			</div>
		);
	}

	editCountries = () => {
		this.setState({
			countriesActive: !this.state.countriesActive
		});

		const active = !this.state.countriesActive;

		if(active) {
			window.map.addLayer(this.state.countriesLayer);
		} else {
			window.map.removeLayer(this.state.countriesLayer);
			if(this.state.districtsLayer) window.map.removeLayer(this.state.districtsLayer);
		}
	}

	showDistricts = (options) => {
		const countryID = options.id;
		const countryName = options.name;
		console.log(`show districts for ${countryID}`);
		// hide popup
		window.map.closePopup();
		// ask for admin districts with ID
		const districts = {
			url: '../data/districts.geo.json',
			method: 'GET',
			params: {
				id: countryID
			}
		}

		axios(districts).then(response => {
			window.map.removeLayer(this.state.countriesLayer);
			// show admin districts geoJSON
			const districtsLayer = L.geoJSON(response.data, {
				style: { "color": "#FEC131" },
				onEachFeature: function(feature, layer) {
					const rng = Math.random();
					const popup = L.popup({ id: rng, countryID, countryName }).setContent(`<div class="leaflet-popup-title"><h5>${rng}</h5></div>
						<div class="leaflet-popup-expanded-content">
							<h5 class="sub">Actor Type</h5>
							Primary: Rebel Forces<br />
							Secondary: State Forces
						</div>
						<div class="leaflet-popup-actions">
							<div></div>
							<div></div>
							<div class="action"><i class="fa fa-plus fa-1x"></i></div>
						</div>`);

					layer.bindPopup(popup);
					layer.countryID = countryID;
					layer.countryName = countryName;
					layer.id = rng;
				}
			});

			this.setState({ ...this.state, districtsLayer, districtsActive: true });

			window.map.addLayer(districtsLayer);
		});
	}

	addCountry = (options, e) => {
		// console.log(e);
		const { id, name } = options;
		let newCountries = [];
		const countries = this.props.data.get('previewRequest').get('allowedCountryCodes');
		window.map.closePopup();
		// const country = {
		// 	code: id,
		// 	name: name,
		// 	allowedDistricts: []
		// }

		// if(countries.hasOwnProperty(id)) {
		// 	console.log(`${id} exists already, removed`);
		// 	newCountries = _.omit(countries, id);
		// } else {
		// 	console.log(`${id} added`);
		// 	newCountries = { ...countries, [id]: country};
		// }

		newCountries = [...countries, id];

		this.props.updateRequest('previewRequest', 'allowedCountryCodes', newCountries);
		console.log(this.props.data.get('previewRequest').get('allowedCountryCodes'));
	}

	addDistrict = (options) => {
		const { countryID, countryName, id } = options;
		const countries = this.props.data.get('previewRequest').get('allowedCountryCodes');
		let newCountries = {}, update = {};
		window.map.closePopup();
		console.log(`${id} district added.`);

		if(countries.hasOwnProperty(countryID)) {
			console.log('country already added, updated allowedDistricts');
			const allowedDistricts = countries[countryID].allowedDistricts;
			let districtsAdded = [];

			if(_.contains(allowedDistricts, id)) {
				console.log('district already added, removed');
				districtsAdded = _.without(allowedDistricts, id);
			} else {
				districtsAdded = [...countries[countryID].allowedDistricts, id];
			}

			update = {
				code: countryID,
				name: countryName,
				allowedDistricts: districtsAdded
			}

			newCountries = { ...countries, [countryID]: update };
		} else {
			console.log('country not added, adding now');
			update = {
				code: countryID,
				name: countryName,
				allowedDistricts: [id]
			}
			newCountries = { ...countries, [countryID]: update };
		}

		this.props.updateRequest('previewRequest', 'allowedCountryCodes', newCountries);
	}

	exitShowDistricts = () => {
		window.map.removeLayer(this.state.districtsLayer);
		window.map.addLayer(this.state.countriesLayer);

		this.setState({
			...this.state,
			countriesActive: true,
			districtsActive: false
		});
	}

	addAllDistricts = () => {
		let districtsToAdd = [], update = {}, countryID = '', countryName = '', newCountries = {};
		const countries = this.props.data.get('previewRequest').get('allowedCountryCodes');
		this.state.districtsLayer.eachLayer(function(layer) {
			districtsToAdd = [...districtsToAdd, layer.id];
			countryID = layer.countryID;
			countryName = layer.countryName;
		});

		update = {
			code: countryID,
			name: countryName,
			allowedDistricts: districtsToAdd
		}

		newCountries = { ...countries, [countryID]: update };
		this.props.updateRequest('previewRequest', 'allowedCountryCodes', newCountries);
		console.log(this.props.data.get('previewRequest').get('allowedCountryCodes'));
	}

	removeAllDistricts = () => {
		const countries = this.props.data.get('previewRequest').get('allowedCountryCodes');
		let update = {}, countryID = '', countryName = '', newCountries = {};

		this.state.districtsLayer.eachLayer(function(layer) {
			countryID = layer.countryID;
			countryName = layer.countryName;
		});

		update = {
			code: countryID,
			name: countryName,
			allowedDistricts: []
		}

		newCountries = _.omit(countries, countryID);
		this.props.updateRequest('previewRequest', 'allowedCountryCodes', newCountries);
		console.log(this.props.data.get('previewRequest').get('allowedCountryCodes'));
	}

	setActiveEditing = (section) => {
		this.setState({
			...this.state,
			editing: section
		});
	}

	resetActiveEditing = () => {
		this.setState({
			...this.state,
			editing: ''
		});
	}

	resetScenario = () => {
		this.props.resetScenario();
		this.props.updateScenario('step', 1);
	}

	nextStep = () => {
		this.props.updateScenario('step', this.props.scenario.get('step')+1);
	}

	previewScenario = () => {
		let method = '', url = '';

		if(this.props.data.get('rootUrl') === localData) {
			method = 'get';
			url = localEventData;
		} else {
			url = `${this.props.data.get('rootUrl')}/events`;
			method = 'post';
		}

		const getScenarioCount = {
			url,
			method,
			data: {
				...this.props.data.get('previewRequest').toJS(),
				countOnly: true
			}
		}

		const getScenarioPreview = {
			url,
			method,
			data: {
				...this.props.data.get('previewRequest').toJS(),
				countOnly: false
			}
		}

		// Second argument is a callback to fire after eventPreview data has been received
		this.props.fetchEventPreview(getScenarioCount,() => {
			const previewData = this.props.data.get('preview');

			this.props.notifications.addNotification({
				title: 'Event Preview',
				message: `You have created a scenario with ${previewData.pastCount} past events and ${previewData.futureCount}
						 future events. Are you ready to preview the new events?`,
				level: 'info',
				autoDismiss: 0,
				position: 'bc',
				action: {
					label: 'Continue',
					callback: () => {
						// Draw event preview
						this.props.fetchEventPreview(getScenarioPreview, () => this.props.drawMap({
							type: 'update',
							subtype: 'eventPreview'
						}));

						// Ask to finalize new scenario
						// this.props.notifications.addNotification({
						// 	title: 'Event Preview',
						// 	message: `Past Events: ${previewData.pastCount}
						// 	Future Events: ${previewData.futureCount}
						//
						// 	Would you like to make this your new scenario?`,
						// 	level: 'info',
						// 	autoDismiss: 0,
						// 	position: 'tr',
						// 	action: {
						// 		label: 'Set Scenario',
						// 		callback: () => {
						// 			this.props.fetchEventPreview(setScenarioConfig);
						// 			this.props.resetScenario();
						// 			this.props.updateRequest('streaming', null, true);
						// 		}
						// 	}
						// });
					}
				}
			});
		});
	}

	setScenario = () => {
		let method = '', url = '';
		if(this.props.data.get('rootUrl') === localData) {
			method = 'get';
			url = localEventData;
		} else {
			url = `${this.props.data.get('rootUrl')}/makeScenario`;
			method = 'post';
		}

		const setScenario = {
			url,
			method,
			data: {
				...this.props.data.get('previewRequest').toJS(),
				countOnly: false,
				scenarioConfig: {
					modelWsServer: [this.props.backend.get('uri'), 8090, "reInit"],
					preview: {
						onlyClearDb : true,
						agentsPerEvent : 10,
						agentsPerFatality : 3,
						candidatesPerEvent : 25,
						previewDbName : 'ERFV3Preview',
					}
				}
			}
		}

		this.props.notifications.addNotification({
			title: 'Set Scenario',
			message: 'This will erase the current scenario and start a new scenario using the settings you chose within the editor. This cannot be undone. Continue?',
			level: 'info',
			autoDismiss: 0,
			position: 'bc',
			action: {
				label: 'Continue',
				callback: () => {
					// Sends POST with countOnly to false, telling backend to reInit using new events
					this.props.fetchEventPreview(setScenario, () => {
						this.props.resetScenario();
						this.props.updateScenario('step', 0);
						this.props.updateRequest('streaming', null, true);
						window.map.removeLayer(this.props.map.get('countriesLayer'));
						// this.props.resetPreview();
					}, (response) => {
							this.props.notifications.addNotification({
							title: 'Data Fetch Error',
							message: 'No data was received from the server. Make sure you have the right source in your config options.',
							level: 'error',
							position: 'bc',
							autoDismiss: '5'
						});
					});
				}
			},
			uid: 'setScenario'
		});
	}
}

function mapStateToProps({ scenario, data, backend, config, map }) {
	return { scenario, data, backend, config, map };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ updateRequest, updateScenario, resetScenario, updateMapStore,
		fetchEventPreview, updateConfigStore, resetPreview }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
