import * as _ from 'lamb';

export const getCardinalityValue = _.getPath('cardinality.value');
export const getCertifiedValue = _.getPath('certified.value');
export const getCount = _.getKey('count');
export const getDocCount = _.getKey('doc_count');
export const getKeyAsString = _.getKey('key_as_string');
export const getStatsAvg = _.getPath('stats.avg');
export const getStatsSum = _.getPath('stats.sum');
export const getTermsBuckets = _.getPath('terms.buckets');
