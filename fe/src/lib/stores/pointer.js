import * as _ from 'lamb';
import {writable} from 'svelte/store';

export const _pointerSupport = writable({
	both: false,
	mouse: false,
	mouseOnly: false,
	touch: false,
	touchOnly: false,
});

const mqListenersMap = new Map();
let matchesByType = {};

const optionsByBaseMediaQuery = {
	hover: ['hover', 'none'],
	pointer: ['coarse', 'fine', 'none'],
};
const optionsByMediaQuery = {
	'pointer': optionsByBaseMediaQuery.pointer, // primary device supporting pointer
	'any-pointer': optionsByBaseMediaQuery.pointer, // secondary device supporting pointer
	'hover': optionsByBaseMediaQuery.hover, // primary device supporting hover
	'any-hover': optionsByBaseMediaQuery.hover // secondary device supporting hover
};

const setMediaQueryListeners = () => {
	const typeToOptions = _.pairs(optionsByMediaQuery);

	_.forEach(typeToOptions, ([type, options]) => {
		matchesByType[type] = {};

		_.forEach(options, option => {
			const mqList = matchMedia(`(${type}: ${option})`);

			// register new listener and store in map for later removal
			mqList.addEventListener('change', update);
			mqListenersMap.set(mqList, update);

			matchesByType[type][option] = mqList.matches;
		});
	});
}

const resetMediaQueryListeners = () => {
	mqListenersMap.forEach((listener, mqList) => {
		mqList.removeEventListener('change', listener);
	});
	mqListenersMap.clear();
	matchesByType = {};
};

const updateStore = () => {
	const touch =
		matchesByType.pointer.coarse ||
		matchesByType['any-pointer'].coarse;

	const mouse =
		matchesByType.hover.hover ||
		matchesByType['any-hover'].hover;

	_pointerSupport.set({
		touch,
		mouse,
		both: touch && mouse,
		touchOnly: touch && !mouse,
		mouseOnly: !touch && mouse,
	});
};

const update = () => {
	resetMediaQueryListeners();
	setMediaQueryListeners();
	updateStore();
};

// initialize with the current media query state
globalThis?.window && update();
