import React, { Component } from 'react';
import './css/MapKey.css';

// React/Redux
import { connect } from 'react-redux';

// Helpers
import _ from 'lodash';

class MapKey extends Component {
	constructor(props) {
		super(props);
	}

	// _.isEmpty(this.props.map.get(objTitle).get('layers'))

	render() {
		const types = [
			{ obj: 'past', title: 'Past Events', shape: 'circle'},
			{ obj: 'pastPreview', title: 'Past Events (Preview)', shape: 'circle'},
			{ obj: 'future', title: 'Future Events', shape: 'circle'},
			{ obj: 'futurePreview', title: 'Future Events (Preview)', shape: 'circle'},
			{ obj: 'origin', title: 'Origin Grid', shape: 'rectangle'},
			{ obj: 'advanced', title: 'Risk (ERF) Grid', shape: 'rectangle'},
			{ obj: 'naive', title: 'Risk (SotA) Grid', shape: 'rectangle'}
		];

		const keys = types.map((type) => {
			//  className={if(_.isEmpty(this.props.map.get(type.obj).get('layers'))) ? "hidden" : null}
			const empty = _.isEmpty(this.props.map.get(type.obj).get('layers'));
			if(!empty) {
				return (
					<div key={type.obj}>
						<div className={`${type.shape} ${type.obj}`}></div>
						<p>{type.title}</p><br />
					</div>
				);
			}
		});

		return (
			<div className="key">
				{keys}
			</div>
		);
	}
}

function mapStateToProps({ map }) {
	return { map };
}

export default connect(mapStateToProps, null)(MapKey);
