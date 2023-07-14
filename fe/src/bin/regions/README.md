# Regions

## Bounding boxes

Step to run:
- `cd be`: enter the backend dir
- `npm run getBoundaries`: this will fetch the boundaries we use to generate tiles in `be/tiles/geojson` (a gitignored dir)
- `cd ../fe`: enter the frontend dir
- `npm run makeRegions`: this saves into `fe/src/lib/data/regions.json` which we'll import from the frontend

## Hierarchy

We're using [this lookup table](https://geoportal.statistics.gov.uk/datasets/ons::local-authority-district-april-2021-to-lau1-to-itl3-to-itl2-to-itl1-january-2021-lookup-in-united-kingdom/explore)

Regions currently in use form a hierarchy:

- country
- ITL1
- ITL2
- ITL3
- LAD

Step to run:
- `cd fe`: enter the frontend dir
- `npm run makeHierarchy`: this saves into `fe/src/lib/data/hierarchy.json` which we'll import from the frontend
