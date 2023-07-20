// eslint-disable-next-line no-process-env
const esEnv = process.env.BE_ENV || 'dev'; // dev, staging, production
const domains = {
	dev: 'https://hpmt.es.dev.dap-tools.uk:9200',
	staging: 'https://hpmt.es.staging.dap-tools.uk:9200',
	production: 'https://hpmt.es.production.dap-tools.uk:9200'
};
export const domain = domains[esEnv];
export const index = 'hpmt_gold_interim_v5';
// fingerprint generated from cert file created during ES installation
export const fingerprint = '8D:AC:F2:E3:92:C9:59:FB:E5:77:3A:82:3B:2E:11:C9:68:43:21:2E:CF:57:05:CB:5A:C6:84:12:E9:22:69:E4';

export const maxBins = 50;
export const maxBuckets = 65536;
export const maxEndDate='2024-02-01';
export const minDocCount = 5;
export const minStartDate='2008-10-24';
