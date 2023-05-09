import {
	getDateHistogram,
	getHistogram,
	getTerms,
	getTermsTerms
} from './routes/index.js';
import {
	dateHistogramSchema,
	histogramSchema,
	termsSchema,
	termsTermsSchema
} from './schemas/index.js';

export const routes = (fastify, options, done) => {

	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms_terms', termsTermsSchema, getTermsTerms);

	done();
};
