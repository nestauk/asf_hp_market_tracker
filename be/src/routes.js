import {
	getDateHistogram,
	getHistogram,
	getTerms,
	getTermsTerms,
	getTerms_Histogram,
	getTerms_Stats,
} from './routes/index.js';
import {
	dateHistogramSchema,
	histogramSchema,
	termsHistogramSchema,
	termsSchema,
	termsTermsSchema,
	terms_StatsSchema
} from './schemas/index.js';

export const routes = (fastify, options, done) => {

	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms_histogram', termsHistogramSchema, getTerms_Histogram);
	fastify.get('/terms_stats', terms_StatsSchema, getTerms_Stats);
	fastify.get('/terms_terms', termsTermsSchema, getTermsTerms);

	done();
};
