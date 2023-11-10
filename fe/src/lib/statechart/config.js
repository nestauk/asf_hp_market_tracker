import {isDev} from '$lib/env.js';

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
					},
					states: {
						CheckURL: {
							always: [
								{
									target: '#HPMT.PageInteractive.ViewData.Dirty.CheckViewData',
									cond: 'hasFullSearchParams',
									actions: [
										'updateCtxSelectionFromPage',
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
													...(isDev ? ['logViewData'] : []),
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
							initial: 'CheckStaticData',
							states: {
								CheckStaticData: {
									always: [
										{
											target: '#HPMT.PageInteractive.StaticData.Ready',
											cond: 'hasStaticData'
										},
										{
											target: 'QueryingStaticData'
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
													...(isDev ? ['logStaticData'] : []),
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
						Ready: {}
					}
				}
			}
		}
	}
};
