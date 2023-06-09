import * as _ from 'lamb';
import {_staticData} from '$lib/stores/data.js';

export const logStaticData = (ctx, {data}) => {
	console.log('[logStaticData] response:', data);
}

const indexTimelines = _.pipe([
	_.indexBy(_.getPath('request.agg.params.calendar_interval')),
	_.mapValuesWith(_.getPath('data.date_histogram.buckets'))
]);
export const updateStaticDataStore = (ctx, {data}) => {
	_staticData.set({
		timelines: indexTimelines(data)
	});
}
