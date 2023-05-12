import {
	getDateHistogram,
	getDateHistogram_stats,
	getHistogram,
	getTerms,
	getTermsTerms,
	getTerms_Histogram
} from './routes/index.js';
import {
	dateHistogramSchema,
	dateHistogram_statsSchema,
	histogramSchema,
	termsHistogramSchema,
	termsSchema,
	termsTermsSchema
} from './schemas/index.js';

export const routes = (fastify, options, done) => {

	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/datehistogram_stats', dateHistogram_statsSchema, getDateHistogram_stats);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms_histogram', termsHistogramSchema, getTerms_Histogram);
	fastify.get('/terms_terms', termsTermsSchema, getTermsTerms);

	done();
};
