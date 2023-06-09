import * as _ from 'lamb';

import {intervals} from '$lib/config/time.js';
import {selectedBeURL} from '$lib/env.js';

const query = backendPath =>
	fetch(`${selectedBeURL}/${backendPath}`)
	.then(response => response.json());

export const queryViewData = ({viewQueryPath}) => query(viewQueryPath);

export const queryStaticData = () => Promise.all(
	_.map(intervals, calendar_interval => {
		const endpoint = 'date_histogram';
		const params = {
			calendar_interval,
			field: 'installation_date'
		};
		const staticDataQueryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(staticDataQueryPath);

		return promise;
	})
);
