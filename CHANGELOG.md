# 0.5.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/15?closed=1)):

- Features:
	- Added tooltips to all charts (#343, #365, #370)
	- Added the timeline to the filters bar on `small` devices (#297)
	- Added temporal filters to the filters navigator (#300)
	- Added quick stats to `small` devices (#374)
	- Added filter panes to enhance filters bar UX (#376)
	- Enhanced `count/stats` readability (#390)

- Improvements:
	- Filter navigator: use tooltips on `medium` devices and moved the
		"reset all" button on top on `small` devices (#380)
	- Don't visualise unknown data (#382)
	- Inverted filters and metrics columns (#389)

- Fixes:
	- Fixed a bug that was preventing some LAD regions to render data (#391)

- Tech debt:
	- Updated dependencies (notably upgraded to Svelte 4) (#367)
	- Moved some components to the appropriate directories (#322)


# 0.4.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/12?closed=1)):

- Data:
	- Updates some metrics (#346):
		- Estimated annual generation: updated unit of measure to `kWh`
		- Property Photovoltaic supply: this is the photovoltaic area as a
			percentage of total roof area.
			0% indicates that a Photovoltaic Supply is not present in the property.
		- Removed Total property Photovoltaic supply as given the above point
			it doesn't make sense to sum it
		- Removed `property_feature_total_floor_area_sum`

- Fixes:
	- Fixed the app freezing when selected place names contain the `&` char
		(e.g `Barking & Dagenham and Havering`) (#348)
	- Back-end: fixed CI/CD (#339)
	- Unified `be/src/filter.js` and `shared/fields.js`, which fixes
		not being able to filter LAD regions (#354)

- Improvements:
	- Categ/geo: moved the category navigator to the top on `medium` devices (#342)

- Docs:
	- Added the methodology page for data processing (#344)

- Back-end:
	- Dockerised the back-end (#340)


# 0.3.1

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/13?closed=1)):

- Fixes:
	- Fix quick view failing when no data is returned from the backend (#333)

# 0.3.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/11?closed=1)):

- Data:
	- Ingested the latest data (#314, which also fixed #258)
	- Re-enable photovoltaic supply in the schema (#323)

- Features:
	- Added 'quick stats' for `medium` desktop screens:
		- it shows:
			- the number of installations we're looking at any moment
			- the data coverage for the current metric, view and filter,
				useful to interpret the changes in the number of installations
				on the left
		- see #42, #302, #312, #320

	- Added partial support for `small` screens (tablets, mobile)
		- Caveats:
			- on a `small` screens, the timeline and the quick stats are not
				displayed yet
			- touch might not work everywhere yet
		- See #269, #280, #304, #309, #316, #318

- Fixes:
	- Geo views: fixed maps not consistently updating colors (#255)
	- Num/Geo views: fixed the legend not displaying properly when we have a
		single region (#317)

- Improvements:
	- In the filters navigator, filters have now the same style as other selection UIs (#294)

# 0.2.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/9?closed=1)):

- Features:
	- Added titles to filters and metrics bars (#286)
	- Added a filters navigator (#290)
	- `category/geo` now shows a map and a selector to choose the category to visualise (#274)

- Fixes:
	- Geographic and temporal selectors now show labels instead of ids (#282)

# 0.1.1

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/8?closed=1)):

- Fixes:
	- Fixed treemaps flickering (#271)
	- Timeline: selecting first or last bin was throws an error (#272)
	- Removed `Unknown` from categories widget in the filters bar (#270)

- Features:
	- Added dots to trend charts (#272)

# 0.1.0

Staging release ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/1?closed=1))

# 0.0.1

Barebone app
