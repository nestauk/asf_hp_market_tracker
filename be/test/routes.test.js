import assert from 'assert';
import querystring from 'querystring';

import terms_terms_response from './api/terms_terms/response.json' assert { type: 'json' }

const endpoint = 'http://localhost:3000'

describe('routes', function () {
	describe('terms_terms', async function () {
		let response;
		before(async function () {
			const route = 'terms_terms'
			let requestOptions = {
				method: 'GET',
			};
			const query = querystring.stringify({
				field1: 'property_geo_region_country.keyword',
				field2: 'property_feature_type.keyword'

			})
			const url = `${endpoint}/${route}?${query}`
			response = await fetch(url, requestOptions)
		});

		it('should return a 2xx http response code', function () {
			assert.equal(response.status, 200)
		});
		it('should have the correct response body', async function () {
			const body = await response.json();
			assert.deepEqual(body.hits, terms_terms_response.hits)
		})
	});
});
