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
	Explorer_category_geo: '/explorer/category/geo/hp_feature_design?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_category_stats: '/explorer/category/stats/hp_feature_design?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_category_time: '/explorer/category/time/hp_feature_design?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_count_geo: '/explorer/count/geo/installations?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=country21&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=progressive&viewId=',
	Explorer_count_stats: '/explorer/count/stats/installations?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=progressive&viewId=',
	Explorer_count_time: '/explorer/count/time/installations?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=progressive&viewId=',
	Explorer_number_geo: '/explorer/number/geo/installation_cost?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_number_stats: '/explorer/number/stats/installation_cost?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_number_time: '/explorer/number/time/installation_cost?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_string_geo: '/explorer/string/geo/hp_id_brand?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_string_stats: '/explorer/string/stats/hp_id_brand?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
	Explorer_string_time: '/explorer/string/time/hp_id_brand?categsGeoSortBy=total&categsStreamgraphsSorting=off&categsTimeGraph=trends&filters=(installerRegionNames:!(),installerRegionType:country21,propertyRegionNames:!(),propertyRegionType:country21)&interval=1y&numTimeGraph=percentiles&regionType=itl21_3&regionTypes=!(country21,itl21_1,itl21_2,itl21_3,lad21)&stackedBarsExtents=absolute&stringsGeoSortBy=total&stringsStreamgraphsSorting=off&stringsTimeGraph=trends&stringsTopCount=10&trendType=cumulative&viewId=',
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
