import {createMachine, interpret} from 'xstate';
import isEqual from 'just-compare';

import {browser} from '$app/environment';
import {_isViewReady} from '$lib/stores/view.js';

import * as actions from './actions/index.js';
import * as services from './actors.js';
import {config, viewDataReadyState} from './config.js';
import {context} from './context.js';
import * as guards from './guards.js';

export const machine = createMachine(
	{...config, context},
	{actions, guards, services}
);
export const explorerActor = interpret(machine).start();

if (browser) {
	explorerActor.subscribe((state) => {
		// console.log('🤖🤖🤖', JSON.stringify(state.value));

		_isViewReady.set(isEqual(state.value, viewDataReadyState));
		console.log(
			'_isViewReady',
			isEqual(state.value, viewDataReadyState) ? `🟩` : '⬛️',
			JSON.stringify(state.value)
		)
	});

	explorerActor.send({type: 'CLIENT_DETECTED'});
}
