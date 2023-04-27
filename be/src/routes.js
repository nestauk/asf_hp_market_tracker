import { getHistogram } from './routes/histogram.js';
import { getTerms } from './routes/terms.js';
import { getTermsTerms } from './routes/terms_terms.js';
import { schema as histogramSchema } from './schemas/histogram.js';
import { schema as termsSchema } from './schemas/terms.js';
import { schema as termsTermsSchema } from './schemas/terms_terms.js';

export const routes = (fastify, options, done) => {

	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms_terms', termsTermsSchema, getTermsTerms);

	done();
};
