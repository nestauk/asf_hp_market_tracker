import {getId, makeMergeAppliedFnMap, objectToKeyValueArray} from '@svizzle/utils';
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
export const [defaultMetric] = metrics;

export const metricById = _.index(metrics, getId);
export const metricLabelById = _.mapValues(metricById, _.getKey('label'));
export const metricTitleById = _.mapValues(
	metricById,
	({entity, label, title}) => title ?? `${entity} ${label.toLowerCase()}`
);

const getMetricGroups = _.pipe([
	_.groupBy(getEntity),
	_.mapValuesWith(_.sortWith([getId])),
	objectToKeyValueArray
]);
export const metricGroups = getMetricGroups(metrics);

export const numericMetrics = _.filter(metrics, _.hasKeyValue('type', 'number'));
export const numericMetricsById = _.index(numericMetrics, getId);

export const categoricalMetrics = _.filter(metrics, _.hasKeyValue('type', 'category'));
export const categoricalMetricsById = _.index(categoricalMetrics, getId);

export const dateMetrics = _.filter(allItems, _.hasKeyValue('type', 'date'));
export const dateMetricsById = _.index(dateMetrics, getId);
