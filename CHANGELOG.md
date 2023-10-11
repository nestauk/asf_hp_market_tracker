## 0.7.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/18?closed=1))

### Improvements

- Sort some categories with a predefined order (#441, #470)
- Geo views tooltips:
	- Hovering a map region or treemap leaf highlights the correspondent bar in the
		bar chart (#464)
	- Hovering a bar chart's bar highlights the correspondent region in the map (#466)
- Stacked bar chart:
	- show the sum of values on each bar (#448)
	- added axes labels (#467)
- Adopting a single color scale that won't show bright colors (#460)
- Added tooltips to the coverage widget (#446)
- Trends: highlight the hero curve only if there are more than one curves (#458)

### Fixes

- Fixed navigating to a filter that returns no data (#444)
- Fixed navigating to a metric with more categories errors in `category/stats` (#450)
- Various small fixes (#456)
	- coverage: removed `(if any)` from the `filtered` tooltp (this can appear only
		when filtering)
	- flow temp tooltip: reworded
	- filter navigator: hidden the 'Scroll to:' tooltip for `installation_date`
		on `medium`
	- in `category/time` the vertical axis label is now `Number of installations`
	- fixed not showing the tooltip `value` when it's equal to zero
	- updated some `count` metrics to show as integeres
	- reduced the padding on maps

### Accessibility

- Updated the Lighthouse auditing setup (#445)

## 0.6.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/17?closed=1))

### Improvements

- Sorted metrics and filters bars as per feedback (#436)
- Added tooltips on `medium` devices to:
	- all selectors (#429)
	- the metrics bar (#415, #427, #433)
- Added labels near selectors (e.g. Region Type, Graph type) (#431)
- Temporal charts:
	- Added chart axes labels (#411)
	- Enhanced tooltips usability by automatically detecting and highlighting
		the nearest point and curve (#402)
- Treemaps: improved readability by trying rotating labels to fit them or
	hiding them otherwise (#392)
- Maps: improved readability in dark mode by using darker borders (#419)
- Set the `LoadingView` background to opaque (#417)
- Responsiveness:
	- Added touch support to all charts (#404)
	- Moved the legend to its own view on `small` devices in the `string/geo`
		view (#393)
	- Inverted the filter and metrics buttons on mobile devices to keep consistency
		with the desktop app (#424)
	- Show tooltips above finger on screen so that they're not occluded by the
		hand (#405)

### Fixes

- Fixed percentiles chart's legend color scheme being inverted (#416)
- Fixed other occurrences of no data being returned (#396, #438)
- Centered the Nesta logo on mobile navigation menu (#422)

### Back-end

- Created a script to ingest to all of the ES domains we have for our
		different environments (#359)

### Tech debt

- Unified Mapbox components (#425)
- Adopted an uniform event naming convention (#409)


## 0.5.1

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/16?closed=1))

### Fixes

- Fixed the filters navigator on `small` devices (#398)
- Prevent the app from freezing when no data is returned (#396)

### Back-end

- Add Github actions for AWS ECS CI/CD (#368)


## 0.5.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/15?closed=1))

### Features

- Added tooltips to all charts (#343, #365, #370)
- Added the timeline to the filters bar on `small` devices (#297)
- Added temporal filters to the filters navigator (#300)
- Added quick stats to `small` devices (#374)
- Added filter panes to enhance filters bar UX (#376)
- Enhanced `count/stats` readability (#390)

### Improvements

- Filter navigator: use tooltips on `medium` devices and moved the
	"reset all" button on top on `small` devices (#380)
- Don't visualise unknown data (#382)
- Inverted filters and metrics columns (#389)

### Fixes

- Fixed a bug that was preventing some LAD regions to render data (#391)

### Tech debt

- Updated dependencies (notably upgraded to Svelte 4) (#367)
- Moved some components to the appropriate directories (#322)


## 0.4.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/12?closed=1))

### Data

- Updates some metrics (#346):
	- Estimated annual generation: updated unit of measure to `kWh`
	- Property Photovoltaic supply: this is the photovoltaic area as a
		percentage of total roof area.
		0% indicates that a Photovoltaic Supply is not present in the property.
	- Removed Total property Photovoltaic supply as given the above point
		it doesn't make sense to sum it
	- Removed `property_feature_total_floor_area_sum`

### Fixes

- Fixed the app freezing when selected place names contain the `&` char
	(e.g `Barking & Dagenham and Havering`) (#348)
- Back-end: fixed CI/CD (#339)
- Unified `be/src/filter.js` and `shared/fields.js`, which fixes
	not being able to filter LAD regions (#354)

### Improvements

- Categ/geo: moved the category navigator to the top on `medium` devices (#342)

### Docs

- Added the methodology page for data processing (#344)

### Back-end

- Dockerised the back-end (#340)


## 0.3.1

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/13?closed=1))

### Fixes

- Fix quick view failing when no data is returned from the back-end (#333)

## 0.3.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/11?closed=1))

### Data

- Ingested the latest data (#314, which also fixed #258)
- Re-enable photovoltaic supply in the schema (#323)

### Features

- Added 'quick stats' for `medium` desktop screens (#42, #302, #312, #320):
	- the number of installations we're looking at any moment
	- the data coverage for the current metric, view and filter,
		useful to interpret the changes in the number of installations
		on the left

- Added partial support for `small` screens (tablets, mobile) (#269, #280, #304, #309, #316, #318):
	- Caveats:
		- on a `small` screens, the timeline and the quick stats are not
			displayed yet
		- touch might not work everywhere yet

### Fixes

- Geo views: fixed maps not consistently updating colors (#255)
- Num/Geo views: fixed the legend not displaying properly when we have a
	single region (#317)

### Improvements

- In the filters navigator, filters have now the same style as other selection UIs (#294)

## 0.2.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/9?closed=1))

### Features

- Added titles to filters and metrics bars (#286)
- Added a filters navigator (#290)
- `category/geo` now shows a map and a selector to choose the category to visualise (#274)

### Fixes

- Geographic and temporal selectors now show labels instead of ids (#282)

## 0.1.1

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/8?closed=1))

### Fixes

- Fixed treemaps flickering (#271)
- Timeline: selecting first or last bin was throws an error (#272)
- Removed `Unknown` from categories widget in the filters bar (#270)

### Features

- Added dots to trend charts (#272)

## 0.1.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/1?closed=1))

## 0.0.1

Barebone app
