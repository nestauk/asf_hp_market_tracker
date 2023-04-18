import { Client } from '@elastic/elasticsearch'

import { domain, fingerprint } from './conf.js'

// eslint-disable-next-line no-process-env
const password = process.env.ELASTICSEARCH_PASSWORD || false
if (!password) {
	throw new Error('Elasticsearch password environment variable not set')
}

export const client = new Client({
	node: domain,
	auth: {
		username: 'elastic',
		password
	},
	tls: {
		caFingerprint: fingerprint,
		rejectUnauthorized: false
	}
})
