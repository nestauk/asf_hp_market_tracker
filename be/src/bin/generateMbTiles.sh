cd tiles
for file in `ls geojson`; do
	echo $file
	name=${file%.geojson}
	tippecanoe -o mbtiles/$name.mbtiles -z14 geojson/$file --force
done

name=nuts21_0_country21_itl21_1_itl21_2_itl21_3_lad21_msoa11_lsoa11

tile-join -o $name.mbtiles mbtiles/* --force -pk
pmtiles convert $name.mbtiles $name.pmtiles