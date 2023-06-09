import {createMachine, interpret} from 'xstate';

import {browser} from '$app/environment';
import {_isViewReady} from '$lib/stores/view.js';

import * as actions from './actions/index.js';
import * as services from './actors.js';
import {config} from './config.js';
import {context} from './context.js';
import * as guards from './guards.js';
import {isViewReady} from './utils.js';

export const machine = createMachine(
	{...config, context},
	{actions, guards, services}
);
export const explorerActor = interpret(machine).start();

if (browser) {
	explorerActor.subscribe((state) => {
		// console.log('🤖🤖🤖', JSON.stringify(state.value));

		const isViewStateReady = isViewReady(state.value);
		_isViewReady.set(isViewStateReady);
		console.log(
			'_isViewReady',
			isViewStateReady ? `🟩` : '⬛️',
			JSON.stringify(state.value)
		)
	});

	explorerActor.send({type: 'CLIENT_DETECTED'});
}
