import React, { Component } from 'react';

import './css/Loading.css';

export default class Loading extends Component {
	render() {
		return (
			<div id="loading" className={this.props.loaded ? "loaded" : "notLoaded"}>
				<div className="loading-bar"></div>
			</div>
		);
	}
}
