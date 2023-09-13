# 0.3.1

- Staging version for internal review ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/13?closed=1)):
	- Fixes:
		- Fix quick view failing when no data is returned from the backend (#333)

# 0.3.0

- Staging version for internal review ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/11?closed=1)):
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

- Staging version for internal review ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/9?closed=1)):
	- Features:
		- Added titles to filters and metrics bars (#286)
		- Added a filters navigator (#290)
		- `category/geo` now shows a map and a selector to choose the category to visualise (#274)

	- Fixes:
		- Geographic and temporal selectors now show labels instead of ids (#282)

# 0.1.1

- Staging version for internal review ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/8?closed=1)):
	- Fixes:
		- Fixed treemaps flickering (#271)
		- Timeline: selecting first or last bin was throws an error (#272)
		- Removed `Unknown` from categories widget in the filters bar (#270)

	- Features:
		- Added dots to trend charts (#272)

# 0.1.0

- Staging version for internal review ([milestone](https://github.com/nestauk/asf_hp_market_tracker/milestone/1?closed=1))

# 0.0.1

- Barebone app
