import {writable} from 'svelte/store';
import * as _ from "lamb";

export const _pointerSupport = writable({
    touch: false,
    mouse: false,
    both: false,
    onlyTouch: false,
    onlyMouse: false
});

const optionsByBaseMediaQuery = {
    pointer: ['coarse', 'fine', 'none'],
    hover: ['hover', 'none'],
};

const optionsByMediaQuery = {
    'pointer': optionsByBaseMediaQuery.pointer,
    'any-pointer': optionsByBaseMediaQuery.pointer,
    'hover': optionsByBaseMediaQuery.hover,
    'any-hover': optionsByBaseMediaQuery.hover
};

const mediaQueryListeners = new Map();

const doMediaQueries = ([type, options]) => [
    type,
    _.pipe([
        _.mapWith(option => {
            const mq = matchMedia(`(${type}: ${option})`);
            // Register new listener and store in map for later removal
            mq.addEventListener('change', updateStore);
            mediaQueryListeners.set(mq, updateStore);
            return [option, mq.matches];
        }),
        _.fromPairs
    ])(options)
];

const getMediaQueries = _.pipe([
    _.pairs,
    _.mapWith(doMediaQueries),
    _.fromPairs
]);

const unregisterMediaQueryListeners = () => {
    mediaQueryListeners.forEach((listener, mq) => {
        mq.removeEventListener('change', listener);
    });
    mediaQueryListeners.clear();
};

const updateStore = () => {
    unregisterMediaQueryListeners(); // Remove old listeners

    const results = getMediaQueries(optionsByMediaQuery);

    const touch = results.pointer.coarse || results['any-pointer'].coarse;
    const mouse = results.hover.hover || results['any-hover'].hover;

    _pointerSupport.set({
        touch,
        mouse,
        both: touch && mouse,
        onlyTouch: touch && !mouse,
        onlyMouse: !touch && mouse,
    });
};

// Initialize with the current media query state
globalThis?.window && updateStore();
