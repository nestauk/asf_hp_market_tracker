import {getId, objectToKeyValueArray} from '@svizzle/utils';
import * as _ from 'lamb';

import {counts, fields} from 'nesta_hpmt_shared/index.js';

const getEntity = _.getKey('entity');

export const all = _.sort(fields.concat(counts), [getEntity]);
export const metrics = _.filter(all, _.not(_.hasKey('use')));
export const defaultMetric = metrics[0];

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
