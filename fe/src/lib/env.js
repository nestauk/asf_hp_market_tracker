export const isDev = import.meta.env.DEV;


const backendEnv = import.meta.env?.VITE_BE_ENV || 'dev'; // local, dev, prod
const beURLs = {
	dev: 'https://hpmt.be.dev.dap-tools.uk',
	local: 'http://localhost:3000',
	staging: 'https://hpmt.be.staging.dap-tools.uk'
};
export const selectedBeURL = beURLs[backendEnv];
