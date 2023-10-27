export const isDev = import.meta.env.DEV;

const backendEnv = import.meta.env?.VITE_BE_ENV || 'dev'; // see `fe/netlify.toml`
const beURLs = {
	local: 'http://localhost:3000',
	dev: 'https://hpmt.be.dev.dap-tools.uk',
	staging: 'https://hpmt.be.staging.dap-tools.uk',
	production: 'https://hpmt.be.production.dap-tools.uk'
};
export const selectedBeURL = beURLs[backendEnv];

export const themeOverride = import.meta.env?.VITE_THEME_OVERRIDE;
