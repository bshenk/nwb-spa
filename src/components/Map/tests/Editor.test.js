import React from 'react';
import chai from 'chai';
import { mount, shallow, render } from 'enzyme';
import { Editor } from '../Editor';
import EditorToolbar from '../EditorToolbar';
import Immutable from 'immutable';
import chaiImmutable from 'chai-immutable';
import { localData } from '../../../constants/Links';

let expect = chai.expect;
chai.use(chaiImmutable);

const data = Immutable.Map({
	streaming: false,
	rootUrl: localData,
	current: Immutable.Map({}),
	preview: Immutable.Map({}), // data received from /events
	categories: Immutable.Map({}), // data received from /categories
	currentRequest: Immutable.Map({
		fieldCoverage: 0.1,
		sendOnly: {
            events: { past:null, future:null },
            fields: { Origin:'AllEvents', NaiveRisk:'AllEvents', AdvancedRisk:'AllEvents' }
        }
	}),
	previewRequest: Immutable.Map({
		ignoreDate: false,
		startEndNowDates: [undefined, undefined, undefined],
		ignoreFatalities: false,
		fatalities: [],
		allowedCountryCodes: [],
		allowedEventTypeCodes: [],
		allowedActor1TypeCodes: [],
		allowedActor2TypeCodes: [],
		allowedInteractionTypeCodes: [],
		withinGeometry: {}
	})
});

const scenario = Immutable.Map({
	minYear: 1997,
	maxYear: 2016,
	active: false,
	step: 0,
	selectedCountryObjs: [],
	selectedEventObjs: [],
	selectedActor1Objs: [],
	selectedActor2Objs: [],
	selectedInteractionObjs: [],
	countryOptions: [],
	actor1Options: [],
	actor2Options: [],
	eventOptions: [],
	interactionOptions: []
});

const wrapper = mount(<Editor data={data} scenario={scenario}/>);

describe('Editor', function() {
	it('should should have 4 editor sections', () => {
		expect(wrapper.find('EditorSection')).to.have.length(4)
	})

	it('should have 1 editor toolbar', () => {
		expect(wrapper.find('EditorToolbar')).to.have.length(1)
	})
})
