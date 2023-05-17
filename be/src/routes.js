import {
	getDateHistogram,
	getDateHistogram1Histogram2,
	getDateHistogram1Stats2,
	getDateHistogram1Terms2,
	getHistogram,
	getTerms,
	getTerms1Histogram2,
	getTerms1Stats2,
	getTerms1Terms2,
} from './routes/index.js';
import {
	dateHistogram1Histogram2Schema,
	dateHistogram1Stats2Schema,
	dateHistogram1Terms2Schema,
	dateHistogramSchema,
	histogramSchema,
	terms1Histogram2Schema,
	terms1Stats2Schema,
	terms1Terms2Schema,
	termsSchema
} from './schemas/index.js';

export const routes = (fastify, options, done) => {

	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/date_histogram1_histogram2', dateHistogram1Histogram2Schema, getDateHistogram1Histogram2);
	fastify.get('/date_histogram1_stats2', dateHistogram1Stats2Schema, getDateHistogram1Stats2);
	fastify.get('/date_histogram1_terms2', dateHistogram1Terms2Schema, getDateHistogram1Terms2);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms1_histogram2', terms1Histogram2Schema, getTerms1Histogram2);
	fastify.get('/terms1_stats2', terms1Stats2Schema, getTerms1Stats2);
	fastify.get('/terms1_terms2', terms1Terms2Schema, getTerms1Terms2);
	done();
};
