import React, { Component } from 'react';

import './css/LinkGroup.css';

export default (props) => {
	const { disabled, name, children, expanded } = props;

	if(expanded) {
		return (
			<div className={disabled ? "linkGroup disabled" : "linkGroup"}>
				<div className="title">
					<span>{name}</span>
				</div>
				<div className="content">
					{children}
				</div>
			</div>
		);
	} else {
		return (
			<div className="linkGroup">
				<div className="content">
					{children}
				</div>
			</div>
		);
	}
}
