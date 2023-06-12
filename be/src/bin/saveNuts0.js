import NUTS_RG_03M_2021_4326_LEVL_0 from '@svizzle/atlas/data/dist/NUTS/topojson/NUTS_RG_03M_2021_4326_LEVL_0.js'
import { saveObj } from '@svizzle/file';
import { topoToGeo } from '@svizzle/geo';


try {
	const geojson = topoToGeo(NUTS_RG_03M_2021_4326_LEVL_0, 'NUTS');
	const save = saveObj('tiles/geojson/nuts21_0.geojson');
	await save(geojson);
	console.log("Saved nuts0 successfully")
} catch (e) {
	console.error(e);
	throw new Error('Saving nuts0 failed');
}

