import React, { Component } from 'react';
import './css/Map.css';

// Constants + Helpers
import { hanaData, localData, hanaEventData } from 'constants/Links';
import Immutable from 'immutable';
import _ from 'lodash';
import axios from 'axios';

// Custom React components
import LayerControls from 'components/LayerControls/LayerControls';
import MapKey from './MapKey';
import Loading from 'components/Map/Loading';
import Editor from './Editor';
import ScenarioInfoWindow from './ScenarioInfoWindow';

// Leaflet
// import L from '../js/leaflet-dev';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.markercluster';
import 'js/leaflet-heat';
import './css/LeafletCluster.css';

// Third-party React components
import { Input, Button } from 'react-bootstrap';

export default class Map extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dataExists: false,
			timer: 0
		}
	}

	componentDidMount() {
		// Initializes map
		this.drawMap({ type: 'default' });

		setInterval(() => {
			this.setState({ timer: this.state.timer+1 })
		}, 30000)
	}

	componentDidUpdate(prevProps, prevState) {
		let prevFields, newFields, prevEvents, newEvents, center = [6,12];

		const { data, backend, map } = this.props;

		const pastConfig = {
			clustering: {
				past: prevProps.map.get('past').get('clustering'),
				future: prevProps.map.get('future').get('clustering')
			},
			draw: prevProps.map.get('drawGrids'),
			data: {
				fields: prevProps.data.get('current').fields,
				events: prevProps.data.get('current').events
			}
		}

		const newConfig = {
			clustering: {
				past: map.get('past').get('clustering'),
				future: map.get('future').get('clustering')
			},
			draw: map.get('drawGrids'),
			data: {
				fields: data.get('current').fields,
				events: data.get('current').events
			}
		}

		const pastPreviewConfig = {
			data: {
				events: {
					...prevProps.data.get('preview').PAST,
					...prevProps.data.get('preview').FUTURE
				}
			},
			clustering: {
				past: prevProps.map.get('pastPreview').get('clustering'),
				future: prevProps.map.get('futurePreview').get('clustering')
			}
		}

		const newPreviewConfig = {
			data: {
				events: {
					...data.get('preview').PAST,
					...data.get('preview').FUTURE
				}
			},
			clustering: {
				past: map.get('pastPreview').get('clustering'),
				future: map.get('futurePreview').get('clustering')
			}
		}

		let previewDataExists = false, currentDataExists = this.state.dataExists;

		if(newConfig.data.fields !== undefined || newConfig.data.events !== undefined) {
			if(currentDataExists === false) {
				currentDataExists = true;
				this.setState({ dataExists: true});
			}
		}

		if(newPreviewConfig.data.events !== undefined && Object.keys(newPreviewConfig.data.events).length > 0) previewDataExists = true;

		// Only draw map when config changes AND data is available for drawing
		if(!_.isEqual(pastConfig, newConfig) && currentDataExists) {
			console.log(`AXONSPA: Map re-drawn. [${new Date()}]`);
			center = this.drawMap({
				type: 'update',
				subtype: 'default'
			});
		}

		// Only draw map when preview config changes AND preview data is available for drawing
		if(!_.isEqual(pastPreviewConfig, newPreviewConfig) && previewDataExists) {
			console.log(`AXONSPA: Map re-drawn (event preview). [${new Date()}]`);
			center = this.drawMap({
				type: 'update',
				subtype: 'eventPreview'
			});
		}

		// only center map if new events enter scenario
		if(!_.isEqual(pastConfig.data.events, newConfig.data.events) ||
			!_.isEqual(pastPreviewConfig.data.events, newPreviewConfig.data.events)) {
			window.map.setView(center);
		}

		// if tileServer URL changes, re-draw map completely
		if(prevProps.map.get('tileServer') !== map.get('tileServer')) {
			console.log(`AXONSPA: Map re-drawn due tile server change. [${new Date()}]`);
			this.drawMap({ type: 'default' });

			// If currentData exists before, re-draw on map
			if(currentDataExists) this.drawMap({
				type: 'update',
				subtype: 'default'
			});

			// If previewData exists before, re-draw on map
			if(previewDataExists) this.drawMap({
				type: 'update',
				subtype: 'eventPreview'
			});
		}

		// Fetch data once upon toggling streaming to true
		if(!prevProps.data.get('streaming') && data.get('streaming')) {
			this._fetchData();
		}

		// if streaming, fetch data every 30s
		if(data.get('streaming')) {
			if(prevState.timer < this.state.timer) {
				this._fetchData();
			}
		}
	}

	render() {
		const { children, routing, notifications, map, data, scenario, backend } = this.props;
		return (
			<div className="map-container">
				<div className="map-plus-scenario">
					<Loading loaded={map.get('loaded')} />
					<Editor
						drawMap={this.drawMap}
						notifications={this.props.notifications} />
					{/*<ScenarioInfoWindow
						map={map}
						backend={backend}
						editorActive={scenario.get('step') > 0}
						currentDataExists={this.state.dataExists} />*/}
					<div className="leaflet" id="leaflet" />
					{/*  <NewMap /> */}
					{/*<Timeline data={data.get('current').events} />*/}
				</div>
				<MapKey />
				<LayerControls
					toggle={this.toggle}
					withinFields={this.showOnlyWithinFields}
					showAll={this.showAll}
					hideAll={this.hideAll}
					data={map}
					drawMap={this.drawMap}
					notifications={notifications}
				/>
			</div>
		);
	}

	_fetchData = () => {
		let url = '', method = '';

		if(this.props.data.get('rootUrl') === localData) {
			url = localData;
			method = 'get';
		} else {
			url = `${this.props.data.get('rootUrl')}/clientRequest`,
			method = 'post';
		}

		const config = {
			url,
			method,
			auth: { username:'AXON', password:'Swarm4it!' },
			data: {
				...this.props.data.get('currentRequest').toJS()
			}
		}

		this.props.fetchCurrentData(config);
	}

	toggle = (nodeType) => {
		const data = this.props.map.get(nodeType);

		if(data.get('visible')) {
			this.hideAll(nodeType);
		} else if(!data.get('visible')) {
			this.showAll(nodeType);
		}
	}

	hideAll = (nodeType) => {
		const map = window.map;
		const group = this.props.map.get(nodeType).get('layers');
		map.removeLayer(group);

		console.log('AXONSPA: Hidden -', nodeType);
		this.props.hideMapData(nodeType);
	}

	showAll = (nodeType) => {
		const map = window.map;
		const group = this.props.map.get(nodeType).get('layers');
		map.addLayer(group); // ah, what if already there???

		console.log('AXONSPA: Shown -', nodeType);
		this.props.showMapData(nodeType);
	}

	showOnlyWithinFields = (nodeObj, field) => {
		const map = window.map;
		const group = this.props.map.get(nodeObj).get('layers');
		const length = group.getLayers().length;
		let matching = 0;
		const fieldData = this.props.data.get('current').fields[field].data;
		const clustering = this.props.map.get(nodeObj).get('clustering');

		map.removeLayer(group);
		let filtered;

		if(clustering) {
			filtered = L.markerClusterGroup({
				iconCreateFunction: function(cluster) {
					return L.divIcon({ html: '<span class="cluster-text">' + cluster.getChildCount() + '</span>',
					className: `cluster ${nodeObj}-marker`});
				}
			});
		} else {
			filtered = L.layerGroup();
		}

		group.eachLayer(function (layer) {
			if (layer.options.CELL_ID in fieldData) {
				matching++;
				///layer.options.visible = true;
				filtered.addLayer(layer);
			}
		});
		map.addLayer(filtered);
		const pct = matching/length;

		this.props.setMatchingPct(nodeObj, pct, field);

		// Pass to ControlContent to be removed at a later time
		return filtered;
	}

	drawMap = (options) => {
		let map; map = window.map;

		if(options.type === 'update') {
			// Used to check if empty, don't draw on map
			const fields = this.props.data.get('current').fields;
			const events = this.props.data.get('current').events;
			const preview = this.props.data.get('preview');

			let pastBounds, futureBounds, allBounds, sumOfLat = 0, sumOfLon = 0, centerLat = 0, centerLon = 0;

			if(options.subtype === 'default') {
				for(let field in fields) this.drawRectangles(field);
				if('past' in events) pastBounds = this.drawCircles('past', map);
				if('future' in events) futureBounds = this.drawCircles('future', map);
			} else if(options.subtype === 'eventPreview') {
				pastBounds = this.drawCircles('pastPreview', map);
				futureBounds = this.drawCircles('futurePreview', map);
			}

			allBounds = [...pastBounds, ...futureBounds];

			for(let i = 0; i < allBounds.length; i++) {
				sumOfLat += allBounds[i][0];
				sumOfLon += allBounds[i][1];
			}

			centerLat = sumOfLat/allBounds.length;
			centerLon = sumOfLon/allBounds.length;

			this.props.mapLoaded();

			return [ centerLat, centerLon ];
		} else if(!options.type || options.type !== null ) {
			if(map) map.remove();
			// Creates map in app load and stores within reduxStore.map.map
			// zoomControl is set to false and re-added to bottom right via L.control.zoom

			map = L.map('leaflet', {
				zoomControl: false
			});

			map.once('load', () => {
				this.props.mapLoaded();
			});

			map.setView([10, 20], 4);

			L.tileLayer(this.props.map.get('tileServer'), {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'lizdownsaxonai.pi5glfpn',
				accessToken: 'pk.eyJ1IjoibGl6ZG93bnNheG9uYWkiLCJhIjoiY2ltZmpzajlhMDFweHZnbTZsbjFxYWE5dCJ9.9v-Z1-18gwAwxAzCHCBn9g'
			}).addTo(map);

			L.control.zoom({
				position: 'bottomright'
			}).addTo(map);

			// const drawnItems = new L.FeatureGroup();
			// map.addLayer(drawnItems);
			//
			// const drawOptions = {
			// 	position: 'bottomright',
			// 	draw: {
			// 		marker: false,
			// 		polyline: false,
			// 		polygon: {
			// 			showArea: true,
			// 			allowIntersection: false,
			// 			drawError: {
			// 				 color: '#e1e100', // Color the shape will turn when intersects
			// 				 message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
			// 			 },
			// 			 shapeOptions: {
			// 				 color: '#bada55'
			// 			 }
			// 		},
			// 		rectangle: {
			// 			shapeOptions: {
			// 				color: '#bada55'
			// 			}
			// 		},
			// 		circle: false
			// 	},
			// 	edit: {
			// 		featureGroup: drawnItems,
			// 		edit: {
			// 			selectedPathOptions: {
			// 				maintainColor: true,
			// 				opacity: 0.3
			// 			}
			// 		},
			// 		poly: {
			// 			allowIntersection: false
			// 		}
			// 	}
			// };
			//
			// const drawControl = new L.Control.Draw(drawOptions);
			// map.addControl(drawControl);
			//
			// // Save shape on creation
			// map.on('draw:created', (e) => {
			// 	const type = e.layerType,
			// 		layer = e.layer;
			//
			// 	let drawnLayer;
			//
			// 	if (type === 'circle') {
			// 		drawnLayer = {
			// 			boundType: 'circle',
			// 			center: layer._latlng,
			// 			radius: layer._mRadius
			// 		}
			// 	} else if (type === 'polygon' || type === 'rectangle') {
			// 		drawnLayer = {
			// 			boundType: 'polygon',
			// 			bounds: layer._latlngs
			// 		}
			// 	}
			//
			// 	// Remove all drawn layers before adding new, only show 1 shape on map at a time
			// 	drawnItems.clearLayers();
			//
			// 	// Do whatever else you need to. (save to db, add to map etc)
			// 	drawnItems.addLayer(layer);
			//
			// 	// Update previewRequest with new bound layer
			// 	this.props.updateRequest('previewRequest', 'withinGeometry', drawnLayer);
			// });
			//
			// map.on('draw:deleted', (e) => {
			// 	// Empty withinGeometry upon bound layer deletion
			// 	this.props.updateRequest('previewRequest', 'withinGeometry', {});
			// });

			// Add map to redux store
			// this.props.addMap(map);

			window.map = map;
		}
	}

	drawRectangles = (type) => {
		console.log(`AXONSPA: drawRectangles - ${type}`);
		let fields = {}, area = 0, rectangle, color = '',
			stroke = 0, minOpacity = 0.05, maxOpacity = 1,
			layerType = '', popup, heatmapKey = '';
		const width = 0.05;

		if (type === 'Origin') {
			fields = this.props.data.get('current').fields.Origin.data;
			area = this.props.data.get('current').fields.Origin.areaCovered;
			layerType = 'origin';
			color = '#218380';
			heatmapKey = 'origin_heatmap';
		} else if (type === 'AdvancedRisk') {
			fields = this.props.data.get('current').fields.AdvancedRisk.data;
			area = this.props.data.get('current').fields.AdvancedRisk.areaCovered;
			layerType = 'advanced';
			color = '#D81159';
			heatmapKey = 'erf_heatmap';
		} else if (type === 'NaiveRisk') {
			fields = this.props.data.get('current').fields.NaiveRisk.data;
			area = this.props.data.get('current').fields.NaiveRisk.areaCovered;
			layerType = 'naive';
			color = '#FFBC42';
			heatmapKey = 'sota_heatmap';
		} else if (type === 'GeoData') {
			fields = this.props.data.get('current').fields.GeoData.Roads.data;
			layerType = 'roads';
			color = 'black';
			stroke = 0.3;
		}

		if(typeof fields !== "object") {
			return;
		}

		area = (area*100).toFixed(2);

		// Opacity calculations
		// y = ((b-a)*x + a*d - b*c)/(d-c)
		const arrOfStrengths = Object.keys(fields).map(function(key) { return fields[key].strength });
		const minStrength = Math.min.apply(null, arrOfStrengths); //c
		const maxStrength = Math.max.apply(null, arrOfStrengths); //d

		let visible = true; visible = this.props.map.get(layerType).get('visible');
		//console.log('    vis:', visible);

		let group = L.layerGroup(), heatmapCoords = [];
		for(let key in fields) {
			if(fields.hasOwnProperty(key)) {
				const coordObj = fields[key];
				const lat = coordObj.coordinates[0];
				const lon = coordObj.coordinates[1];
				const strength = parseFloat(coordObj.strength.toFixed(4)); //x

				let opacity = ((((maxOpacity-minOpacity)*strength) + (minOpacity*maxStrength) - (maxOpacity*minStrength))/(maxStrength-minStrength));
				const bounds = [
					[lat+width, lon-width],
					[lat+width, lon+width],
					[lat-width, lon+width],
					[lat-width, lon-width]
				];

				popup = L.popup().setContent(`${strength}`);

				if(layerType === 'roads') {
					rectangle = L.rectangle(bounds, {
						stroke: true,
						weight: stroke,
						opacity: opacity,
						color: color,
						fill: false
					}); //.addTo(map);

					// Add new rectangle to layer group
					group.addLayer(rectangle);
				} else {
					heatmapCoords = [...heatmapCoords, [lat, lon, strength]];

					// Only draw rectangles when draw = true
					if(this.props.map.get('drawGrids')) {
						rectangle = L.rectangle(bounds, {
							stroke: false,
							fillColor: color,
							fillOpacity: opacity
						}).bindPopup(popup);

						// Add new rectangle to layer group
						group.addLayer(rectangle);
					}
				}
			}
		}

		if(layerType !== 'roads') {
			const heatLayer = L.heatLayer(heatmapCoords, {
				radius: 10
			}).addTo(window.map);

			// Hide heatmap if visibility is false
			if(!this.props.map.get(heatmapKey).get('visible')) {
				window.map.removeLayer(heatLayer);
			}

			// Try to remove old, stored heatmap
			const storedHeatmap = this.props.map.get(heatmapKey).get('layers');
			if(storedHeatmap) window.map.removeLayer(storedHeatmap);

			// Add heatmap to store
			this.props.addMapData(heatmapKey, {
				layers: heatLayer
			});
		}

		if(this.props.map.get('drawGrids') || layerType === 'roads') {
			// Remove old layer from map
			const storedGroup = this.props.map.get(layerType).get('layers');
			window.map.removeLayer(storedGroup); // try to remove old, stored layerGroup

			// Add new layer to map
			window.map.addLayer(group);

			// Hide layer if visibility is false
			if(!visible) {
				window.map.removeLayer(group);
			}

			// Add layer to store
			this.props.addMapData(layerType, {
				layers: group
			});
		} else {
			// Remove layer from map
			const storedGroup = this.props.map.get(layerType).get('layers');
			window.map.removeLayer(storedGroup); // try to remove old, stored layerGroup

			// Remove layer from store
			this.props.addMapData(layerType, {
				layers: {}
			});
		}
	}

	drawCircles = (type, map) => {
		console.log(`AXONSPA: drawCircles - ${type}`);
		let eventData = {}, group, bounds = [];
		const visible = this.props.map.get(type).get('visible'),
			clustering = this.props.map.get(type).get('clustering');
		const { data } = this.props;

		if (type === 'past') {
			eventData = data.get('current').events.past.data;
		} else if (type === 'future') {
			eventData = data.get('current').events.future.data;
		} else if (type === 'pastPreview') {
			eventData = data.get('preview').PAST;
		} else if (type === 'futurePreview') {
			eventData = data.get('preview').FUTURE;
		}

		if(clustering) {
			group = L.markerClusterGroup({
				iconCreateFunction: function(cluster) {
					return L.divIcon({ html: '<span class="cluster-text">' + cluster.getChildCount() + '</span>',
					className: `cluster ${type}-marker`});
				}
			});
		} else {
			group = L.layerGroup();
		}

		for (let key in eventData) {
			if(eventData.hasOwnProperty(key)) {
				let eventObj = eventData[key];
				let lat = eventObj.coordinates[0];
				let lon = eventObj.coordinates[1];

				const popup = L.popup().setContent(`${eventObj.fatalities} fatalities on ${eventObj.date}`);

				// const circle = L.circle([lat, lon], 5000, {
				// 	stroke: false,
				// 	fillColor: color,
				// 	fillOpacity: 0.5,
				// 	CELL_ID: eventObj.CELL_ID
				// }).bindPopup(popup);

				const marker = L.marker([lat, lon], {
					riseOnHover: true,
					title: `${eventObj.fatalities} fatalities on ${eventObj.date}`,
					CELL_ID: eventObj.CELL_ID,
					icon: L.divIcon({ className: `single-marker ${type}-marker` })
				}).bindPopup(popup);

				group.addLayer(marker);
				bounds = [...bounds, [lat, lon]];
			}
		}

		const storedGroup = this.props.map.get(type).get('layers');
		map.removeLayer(storedGroup); // try to remove old, stored layerGroup
		map.addLayer(group);

		if(!visible) {
			map.removeLayer(group);
		}

		// Add layer group to redux store
		this.props.addMapData(type, {
			layers: group
		});

		return bounds;
	}
}
//
//
// function mapStateToProps({ backend, map, data, scenario }) {
// 	return { backend, map, data, scenario };
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(Map);
