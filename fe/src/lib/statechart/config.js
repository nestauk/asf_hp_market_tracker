// https://stately.ai/registry/editor/ed39daf7-c390-45bd-8a86-9aefbeb8a736

export const config = {
	id: 'HPMT',
	initial: 'PlatformUnknown',
	predictableActionArguments: true,
	preserveActionOrder: true,
	states: {
		PlatformUnknown: {
			on: {
				CLIENT_DETECTED: {
					target: 'PageLoading'
				}
			}
		},
		PageLoading: {
			on: {
				MOUNTED: {
					target: 'PageInteractive'
				}
			}
		},
		PageInteractive: {
			type: 'parallel',
			states: {
				ViewData: {
					initial: 'Dirty',
					on: {
						SELECTION_CHANGED: {
							target: '.Dirty',
							actions: [
								'setCxtNextValues',
								'navigateToNextParams',
								// 'sendEdited',
								// 'sendCommitted',
							]
						},
						PAGE_CHANGED: [
							{
								target: '.Dirty.CheckViewData',
								cond: 'hasFullSearchParams',
								actions: 'updateNavStoresAndCtxSelectionFromPage',
							},
							{
								actions: 'navigateToFullSearchParams',
							}
						]
					},
					states: {
						Dirty: {
							entry: 'showViewLoadingIcon',
							initial: 'Idle',
							states: {
								Idle: {},
								CheckViewData: {
									entry: 'generateQueryPathFromSelectionStores',
									always: [
										{
											target: '#HPMT.PageInteractive.ViewData.Clean',
											cond: 'isViewDataCached',
											actions: 'updateDataStoresFromCache'
										},
										{
											target: 'QueryingViewData',
										}
									]
								},
								QueryingViewData: {
									invoke: {
										src: 'queryViewData',
										id: 'viewData',
										onError: [
											{
												target: 'ErrorViewData'
											}
										],
										onDone: [
											{
												target: '#HPMT.PageInteractive.ViewData.Clean',
												actions: [
													'logViewData',
													'cacheViewData',
													'updateDataStores'
												]
											}
										]
									}
								},
								ErrorViewData: {
									entry: 'showViewError',
									exit: 'hideViewError'
								}
							}
						},
						Clean: {
							entry: 'hideViewLoadingIcon'
						}
					}
				},
				/*
				StaticData: {
					initial: 'Dirty',
					states: {
						Dirty: {
							entry: 'showFiltersAndTimelineLoadingIcon',
							initial: 'CheckStaticData',
							states: {
								CheckStaticData: {
									always: [
										{
											target: '#HPMT.PageInteractive.StaticData.Clean',
											cond: 'hasStaticData'
										},
										{
											target: 'QueryingStaticData',
											actions: 'generateStaticDataQueryFromFieldsMapping'
										}
									]
								},
								QueryingStaticData: {
									invoke: {
										src: 'queryStaticData',
										id: 'staticData',
										onDone: [
											{
												target: '#HPMT.PageInteractive.StaticData.Clean',
												actions: 'responseToStaticDataStores'
											}
										],
										onError: [
											{
												target: 'ErrorStaticData'
											}
										]
									}
								},
								ErrorStaticData: {
									entry: 'showFiltersAndTimelineError',
									exit: 'hideFiltersAndTimelineError'
								}
							}
						},
						Clean: {
							entry: 'hideFiltersAndTimelineLoadingIcon'
						}
					}
				},
				History: {
					initial: 'Saved',
					states: {
						Saved: {
							on: {
								EDITED: {
									target: 'Editing',
									actions: 'initEntry'
								}
							}
						},
						Editing: {
							on: {
								EDITED: {
									target: 'Editing',
									actions: 'updateEntry',
									internal: false
								},
								COMMITTED: {
									target: 'Saved',
									actions: 'commitURL'
								}
							}
						}
					}
				},
				*/
			},
		}
	}
};
