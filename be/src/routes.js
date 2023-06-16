import {
	getCardinality,
	getCount,
	getDateHistogram,
	getDateHistogram1Cardinality2,
	getDateHistogram1Certified2,
	getDateHistogram1Histogram2,
	getDateHistogram1Stats2,
	getDateHistogram1Terms2,
	getHistogram,
	getStats,
	getTerms,
	getTerms1Certified2,
	getTerms1Cardinality2,
	getTerms1Histogram2,
	getTerms1Stats2,
	getTerms1Terms2,
	getCertified,
} from './routes/index.js';
import {
	cardinalitySchema,
	certifiedSchema,
	dateHistogram1Cardinality2,
	dateHistogram1Certified2,
	dateHistogram1Histogram2Schema,
	dateHistogram1Stats2Schema,
	dateHistogram1Terms2Schema,
	dateHistogramSchema,
	histogramSchema,
	statsSchema,
	terms1Cardinality2Schema,
	terms1Certified2Schema,
	terms1Histogram2Schema,
	terms1Stats2Schema,
	terms1Terms2Schema,
	termsSchema,
} from './schemas/index.js';

export const routes = (fastify, options, done) => {
	fastify.get('/cardinality', cardinalitySchema, getCardinality);
	fastify.get('/certified', certifiedSchema, getCertified);
	fastify.get('/count', getCount);
	fastify.get('/date_histogram', dateHistogramSchema, getDateHistogram);
	fastify.get('/date_histogram1_cardinality2', dateHistogram1Cardinality2, getDateHistogram1Cardinality2);
	fastify.get('/date_histogram1_certified2', dateHistogram1Certified2, getDateHistogram1Certified2);
	fastify.get('/date_histogram1_histogram2', dateHistogram1Histogram2Schema, getDateHistogram1Histogram2);
	fastify.get('/date_histogram1_stats2', dateHistogram1Stats2Schema, getDateHistogram1Stats2);
	fastify.get('/date_histogram1_terms2', dateHistogram1Terms2Schema, getDateHistogram1Terms2);
	fastify.get('/histogram', histogramSchema, getHistogram);
	fastify.get('/stats', statsSchema, getStats);
	fastify.get('/terms', termsSchema, getTerms);
	fastify.get('/terms1_cardinality2', terms1Cardinality2Schema, getTerms1Cardinality2);
	fastify.get('/terms1_certified2', terms1Certified2Schema, getTerms1Certified2);
	fastify.get('/terms1_histogram2', terms1Histogram2Schema, getTerms1Histogram2);
	fastify.get('/terms1_stats2', terms1Stats2Schema, getTerms1Stats2);
	fastify.get('/terms1_terms2', terms1Terms2Schema, getTerms1Terms2);
	done();
};
