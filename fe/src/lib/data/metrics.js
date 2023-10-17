import {getId, makeMergeAppliedFnMap, transformValues} from '@svizzle/utils';
import {format} from 'd3-format';
import * as _ from 'lamb';

import {counts, fields} from 'nesta_hpmt_shared/index.js';

const getEntity = _.getKey('entity');
const getMetrics = _.pipe([
	_.filterWith(_.not(_.hasKey('use'))),
	_.mapWith(
		_.when(
			_.hasKey('formatSpecifier'),
			makeMergeAppliedFnMap({
				formatFn: _.pipe([_.getKey('formatSpecifier'), format])
			})
		)
	)
]);

export const allItems = _.sort(fields.concat(counts), [getEntity]);
export const metrics = getMetrics(allItems);
export const metricById = _.index(metrics, getId);
export const metricLabelById = _.mapValues(metricById, _.getKey('label'));
export const metricTitleById = _.mapValues(
	metricById,
	({entity, label, title}) => title ?? `${entity} ${label.toLowerCase()}`
);

export const numericMetrics = _.filter(metrics, _.hasKeyValue('type', 'number'));
export const numericMetricsById = _.index(numericMetrics, getId);

export const categoricalMetrics = _.filter(metrics, _.hasKeyValue('type', 'category'));
export const categoricalMetricsById = _.index(categoricalMetrics, getId);

export const dateMetrics = _.filter(allItems, _.hasKeyValue('type', 'date'));
export const dateMetricsById = _.index(dateMetrics, getId);

export const metricIdsGroups = [
	{
		key: 'Installation',
		value: [
			'installations',
			'installation_cost',
			'installation_cost_sum',
		]
	},
	{
		key: 'Installation company',
		value: [
			'installers',
			'installations_per_installer',
			'installers_certified',
			'installers_new_certifications',
			'installers_dropped_certifications',
		]
	},
	{
		key: 'Property features',
		value: [
			'property_feature_age_band',
			'property_feature_built_form',
			'property_feature_type',
			'property_tenure',
			'property_energy_rating_current',
			'property_energy_rating_potential',
			'property_feature_total_floor_area',
			'property_feature_number_habitable_rooms',
			'property_supply_mains_gas_flag',
			'property_energy_efficiency_floor',
			'property_energy_efficiency_hot_water',
			'property_energy_efficiency_lighting',
			'property_energy_efficiency_main_heat',
			'property_energy_efficiency_roof',
			'property_energy_efficiency_walls',
			'property_energy_efficiency_windows',
			'property_feature_glazed_area',
			'property_feature_glazed_type',
			'property_supply_photovoltaic',
		]
	},
	{
		key: 'Heat pump features',
		value: [
			'hp_id_brand',
			'hp_id_model',
			'hp_feature_flow_temperature',
			'hp_feature_power_capacity',
			'hp_feature_power_capacity_sum',
			'hp_feature_power_generation',
			'hp_feature_power_generation_sum',
			'hp_feature_scop',
			'hp_feature_design',
		]
	},
];

export const metricGroups = _.map(metricIdsGroups, transformValues({
	value: _.mapWith(id => metricById[id])
}));

export const defaultMetricId = metricIdsGroups[0].value[0];

// TODO add function checking no fields have been forgotten (if (isDev))
