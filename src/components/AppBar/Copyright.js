import React, { Component } from 'react';
import FaCaretLeft from 'react-icons/lib/fa/caret-left';
import FaCaretRight from 'react-icons/lib/fa/caret-right';


class Copyright extends Component {
	render() {
		const { expanded, toggleExpand } = this.props
		let icon

		if(expanded) icon = <FaCaretLeft onClick={toggleExpand} style={{ cursor: 'pointer'}} size={20} />
		else icon = <FaCaretRight onClick={toggleExpand} style={{ cursor: 'pointer'}} size={20}/>

		return (
			<div className="copyright">
				{icon}
				<p>&copy;2016 AxonAI, Inc.</p>
			</div>
		);
	}
}

export default Copyright;
