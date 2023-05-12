import {
	getDateHistogram,
	getDateHistogram_stats,
	getDateHistogram_histogram,
	getHistogram,
	getTerms,
	getTermsTerms,
	getTerms_Histogram,
	getTerms_Stats,
} from './routes/index.js';
import {
	dateHistogramSchema,
	dateHistogram_statsSchema,
	dateHistogram_histogramSchema,
	histogramSchema,
	termsHistogramSchema,
	termsSchema,
	termsTermsSchema,
	terms_StatsSchema
} from './schemas/index.js';

export const routes = (fastify, options, done) => {

	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/datehistogram_stats', dateHistogram_statsSchema, getDateHistogram_stats);
	fastify.get('/datehistogram_histogram', dateHistogram_histogramSchema, getDateHistogram_histogram);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms_histogram', termsHistogramSchema, getTerms_Histogram);
	fastify.get('/terms_stats', terms_StatsSchema, getTerms_Stats);
	fastify.get('/terms_terms', termsTermsSchema, getTermsTerms);

	done();
};
