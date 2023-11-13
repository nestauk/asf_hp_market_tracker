import {applyFnMap, getKey} from '@svizzle/utils';
import * as _ from 'lamb';

export const ageBandOrder = [
	'England and Wales: before 1900',
	'Scotland: before 1919',
	'1900-1929',
	'1930-1949',
	'1950-1966',
	'1965-1975',
	'1976-1983',
	'1983-1991',
	'1991-1998',
	'1996-2002',
	'2003-2007',
	'2007 onwards',
];
export const energyEfficiencyOrder = [
	'Very Good',
	'Good',
	'Average',
	'Poor',
	'Very Poor',
];
const energyRatingOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const orderedCategoriesByFieldId = {
	hp_feature_design: [
		'Space heat and DHW',
		'Space heat only',
		'Space Heat, DHW and another purpose',
		'DHW and another purpose',
		'Space Heat and another purpose',
		'DHW only',
		'Another purpose only',
	],
	property_energy_efficiency_floor: energyEfficiencyOrder,
	property_energy_efficiency_hot_water: energyEfficiencyOrder,
	property_energy_efficiency_lighting: energyEfficiencyOrder,
	property_energy_efficiency_main_heat: energyEfficiencyOrder,
	property_energy_efficiency_roof: energyEfficiencyOrder,
	property_energy_efficiency_walls: energyEfficiencyOrder,
	property_energy_efficiency_windows: energyEfficiencyOrder,
	property_energy_rating_current: energyRatingOrder,
	property_energy_rating_potential: energyRatingOrder,
	property_feature_age_band: ageBandOrder,
	property_feature_glazed_type: [
		'single glazing',
		'double glazing',
		'triple glazing',
	],
};

const makeItemsSorter = orderedKeys => array => {
	const index = _.index(array, getKey);

	return _.reduce(orderedKeys, (acc, key) => {
		if (_.has(index, key)) {
			acc.push(index[key]);
		}

		return acc;
	}, []);
};

const makeKeysSorter = orderedKeys => array => {
	const index = _.index(array, _.identity);

	return _.filter(orderedKeys, key => _.has(index, key));
};

export const sorters = _.mapValues(orderedCategoriesByFieldId, applyFnMap({
	itemsSorter: makeItemsSorter,
	keySorter: makeKeysSorter,
}));

const defaultSorters = {
	itemsSorter: _.sortWith([getKey]),
	keySorter: _.sortWith([]),
}

export const getSorters = fieldId => fieldId in sorters
	? sorters[fieldId]
	: defaultSorters;
