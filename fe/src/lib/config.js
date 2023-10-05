/* tool */

export const toolName = 'Nesta HPMT';
export const toolLongName = 'Nesta Heat Pump Market Tracker';
export const contactEmail = 'dataanalytics@nesta.org.uk';
export const changelogUrl = 'https://github.com/nestauk/asf_hp_market_tracker/blob/staging/CHANGELOG.md';

/* banners */

export const bannersDefaultFooterText = 'Click on background to dismiss';

/* feedback forms */

// survey

// source: https://docs.google.com/forms/d/1PbnHV3HCqy19aL-05HmZQNdKx5tnUfYrgpH2LKvbmok/edit
export const surveyFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdavNF1dIsBnwZh_8G1gnNH9R0aTiZTH5Pls_axK4WMkQyhuQ/viewform?embedded=true';

// survey 2

// source: FIXME add if needed
// FIXME `survey2FormUrl` unused, same as surveyFormUrl for now
export const survey2FormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdavNF1dIsBnwZh_8G1gnNH9R0aTiZTH5Pls_axK4WMkQyhuQ/viewform?embedded=true'; // FIXME update

/* logos */

export const LOGOS = {
	themeLight: {
		nesta: '/logos/Nesta-light.svg',
	},
	themeDark: {
		nesta: '/logos/Nesta-dark.svg',
	}
}

/* testing */

export const lighthouseUrls = {
	Home: '/',
	Guides: '/guides/app',
	Methodology: '/methodology/dataProcessing',
	Explorer: '/explorer/count/geo/installations?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=country21&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=progressive&viewId='
};

export const fontsInfo = [
	{
		family: 'Avenir Next Variable',
		faces: [
			{
				src: 'url(/font/AvenirNext/Variable.ttf) format("truetype")'
			}
		]
	},
	{
		family: 'Archivo',
		faces: [
			{
				src: 'url(/font/Archivo/VariableFont_wdth,wght.ttf) format("truetype")',
				descriptors: {
					style: 'normal'
				}
			},
			{
				src: 'url(/font/Archivo/Italic-VariableFont_wdth,wght.ttf) format("truetype")',
				descriptors: {
					style: 'italic'
				}
			},
		]
	},
	{
		family: 'Noboto Flex',
		faces: [
			{
				src: 'url(/font/NobotoFlex/Variable.woff2)',
				descriptors: {
					weight: 140
				}
			}
		]
	},
	{
		family: 'Courier New'
	},
	{
		family: 'Open Dyslexia',
		faces: [
			{
				src: 'url(/font/OpenDyslexic/Regular.otf) format("opentype")',
				descriptors: {
					weight: 400,
					style: 'normal'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/Italic.otf) format("opentype")',
				descriptors: {
					weight: 400,
					style: 'italic'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/Bold.otf) format("opentype")',
				descriptors: {
					weight: 700,
					style: 'normal'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/BoldItalic.otf) format("opentype")',
				descriptors: {
					weight: 700,
					style: 'italic'
				}
			}
		]
	}
];
