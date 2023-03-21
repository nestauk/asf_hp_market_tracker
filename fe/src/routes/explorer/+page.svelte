<script>

	import { selectedBeURL } from '$lib/env';
	import {io} from 'socket.io-client';

	import {toolName} from '$lib/config';

	let result = '';
	let value;

	const socket = io(selectedBeURL);

	socket.on('result', data => {
		result = data
	});

	const handleClick = () => {
		socket.emit('data', value);
	}
</script>

<svelte:head>
	<title>Explorer - {toolName}</title>
	<meta
		name='description'
		content='The {toolName} data explorer'
	>
</svelte:head>

<div class='content'>
	<input type=number bind:value={value}>
	<button on:click={handleClick}>Send</button>
	<div id='result'>Result: {result}</div>
</div>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.content > * {
		margin: 5px 0;
	}
</style>
