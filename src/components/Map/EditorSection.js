import React, { Component } from 'react';
import FaChevronRight from 'react-icons/lib/fa/chevron-right';
import FaEdit from 'react-icons/lib/fa/edit';

export default class EditorSection extends Component {
	render() {
		let numberStyle = {};
		let editOnClick = null;
		const { className, number, title, children,
			active, nextStep, step, currentStep, previewEvents,
			resetEvents, countries } = this.props;

		editOnClick = this.props.editOnClick;
		numberStyle = this.props.numberStyle;

		let nextStepIcon = null;

		if(step !== 4) {
			nextStepIcon = <FaChevronRight
				style={{color: 'white'}}
				className={currentStep > step || Object.keys(countries).length === 0 ? "disabled" : null}
				onClick={nextStep} />;
		}

		return (
			<div className={active ? `editor-section ${className}` : `editor-section ${className} hide-off-screen`}>
				<div className="number-bg"><h1 style={numberStyle}>{number}</h1></div>
				<div className="title-bg">
					<h2>{title}</h2>
				</div>
				<div className="content">
					{children}
				</div>
				<div className="footer">
					<span style={{"float":"right"}}>
						{typeof editOnClick === 'function' ? <FaEdit onClick={editOnClick} /> : null}
						{nextStepIcon}
					</span>
				</div>
			</div>
		);
	}
}
