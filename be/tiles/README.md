## Tiles

This directory stores the protomaps tiles used to render the maps used in the frontend.

### Requirements

The system was tested using the following versions:

- [pmtiles v1.7.1](https://github.com/protomaps/go-pmtiles/releases)
- [tippecanoe v1.36.0](https://github.com/mapbox/tippecanoe)

### Getting the source Geojson

To populate this directory, first run `npm run getBoundaries`. This uses the `config.json`
file along with the `downloadBoundaries` script provided by `dap_dv_backends_utils` to source 
the relevant geojson boundaries from the ONS Arcgis servers. It also uses `@svizzle/atlas`
to save the `NUTS0` boundaries. All resulting geojson files are saved in the `geojson`
directory.

### Converting to Mapbox and Protomaps tilesets

Once the geojson is saved, use `npm run getTiles` to generate the corresponding `mbtiles`
and `pmtiles`. This works by first generating a Mapbox tileset (mbtile) for each geojson
downloaded in the previous script, then using `tile-join` to create a single tileset where
each layer is a tileset corresponding to the boundaries listed in `config.json`. Finally,
using `pmtiles`, we convert the joined Mapbox tileset to a Protomaps tileset.

### Uploading to s3

To upload to an s3 bucket, use `npm run uploadTiles`. You will probably need to 
specify your own bucket on which you have the correct access rights. To set up
a CDN using AWS Cloudront and Lambda functions, you can follow 
[this documentation](https://protomaps.com/docs/cdn/aws).