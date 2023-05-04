import {createMachine, interpret} from 'xstate';

import {browser} from '$app/environment';

import * as actions from './actions/index.js';
import * as services from './actors.js';
import {config} from './config.js';
import {context} from './context.js';
import * as guards from './guards.js';

export const machine = createMachine(
	{...config, context},
	{actions, guards, services}
);
export const explorerActor = interpret(machine).start();

if (browser) {
	// const {unsubscribe} =
	explorerActor.subscribe((state) => {
		console.log(state);
	});

	explorerActor.send({type: 'CLIENT_DETECTED'});
}
