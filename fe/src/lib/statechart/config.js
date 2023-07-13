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
								'setCtxNextValues',
								'navigateToNextParams',
								// 'sendEdited',
								// 'sendCommitted',
							]
						},
						PAGE_CHANGED: {
							target: '.CheckURL',
							actions: 'updateNavStores',
						},
						STATIC_DATA_CHANGED: {
							target: '.CheckURL',
						}
					},
					states: {
						CheckURL: {
							always: [
								{
									target: '#HPMT.PageInteractive.ViewData.Dirty.CheckViewData',
									cond: 'hasFullSearchParams',
									actions: [
										'updateCtxSelectionFromPage',
										'updateFilters',
										'updateSelectionStore'
									]
								},
								{
									target: '#HPMT.PageInteractive.ViewData',
									actions: 'navigateToFullSearchParams',
								}
							]
						},
						Dirty: {
							entry: 'showViewLoadingIcon',
							initial: 'Idle',
							states: {
								Idle: {},
								CheckViewData: {
									entry: 'generateQueryPathFromSelectionStores',
									always: [
										{
											target: '#HPMT.PageInteractive.ViewData.Ready',
											cond: 'isViewDataCached',
											actions: 'updateViewDataStoreFromCache'
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
												target: '#HPMT.PageInteractive.ViewData.Ready',
												actions: [
													'logViewData',
													'cacheViewData',
													'updateViewDataStore'
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
						Ready: {
							entry: 'hideViewLoadingIcon'
						}
					}
				},
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
											target: '#HPMT.PageInteractive.StaticData.Ready',
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
												target: '#HPMT.PageInteractive.StaticData.Ready',
												actions: [
													'logStaticData',
													'updateStaticDataStore'
												]
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
						Ready: {
							entry: [
								'hideFiltersAndTimelineLoadingIcon',
								'sendStaticDataChanged'
							]
						}
					}
				},
				/*
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
