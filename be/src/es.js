import { Client as EsClient } from '@elastic/elasticsearch';
import { Client as OsClient } from '@opensearch-project/opensearch'

import { esEnv, domain, index, fingerprint } from './conf.js';

// eslint-disable-next-line no-process-env
const password = process.env.ELASTICSEARCH_PASSWORD || false;
if (!password) {
	throw new Error('Elasticsearch password environment variable not set');
}

export const client = esEnv === 'production'
	? new OsClient({
		node: domain,
		auth: {
			username: 'elastic',
			password
		}
	})
	: new EsClient({
		node: domain,
		auth: {
			username: 'elastic',
			password
		},
		tls: {
			caFingerprint: fingerprint,
			rejectUnauthorized: false
		}
	});

// override search function to match the ES client
if (esEnv === 'production') {
	client.search = (function(_super) {
		return async function() {
			const result = await _super.apply(this, arguments);

			if ('body' in result) {
				return result.body;
			}
			if ('aggregations' in result) {
				return result.aggregations;
			}

			throw new Error('Unexpected result from ES client');
		};

	}(client.search));
}

export const getDocumentCount = async filter => {
	const { count } = await client.count({ index, body: filter });
	return count;
};
