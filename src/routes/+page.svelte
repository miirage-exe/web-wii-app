<script lang="ts">
	import { getBluetoothContext } from '$lib/context/bluetooth.svelte.ts';
	import WiiCursor from '$lib/components/WiiCursor.svelte';

	let blt = getBluetoothContext();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#if blt.receivedData !== null}
	<div>x: {blt.receivedData.x}</div>
	<div>y: {blt.receivedData.y}</div>
	<div>roll: {blt.receivedData.roll}</div>
	<div>buttonMask: {blt.receivedData.buttonMask}</div>
{/if}
<div>isConnected: {blt.isConnected}</div>
<div>Error: {blt.error}</div>
<button
onclick={() => blt.connect()}
>
	Connection
</button>

<WiiCursor />

<div class="crosshair"></div>

<style>
	.crosshair {
		position: fixed;
		top: 50vh;
		left: 50vw;
		width: 20px;
		height: 20px;
		translate: -50% -50%;
		pointer-events: none;
	}

	.crosshair::before,
	.crosshair::after {
		content: '';
		position: absolute;
		background: red;
	}

	.crosshair::before {
		width: 100%;
		height: 2px;
		top: 50%;
		left: 0;
		translate: 0 -50%;
	}

	.crosshair::after {
		width: 2px;
		height: 100%;
		left: 50%;
		top: 0;
		translate: -50% 0;
	}
</style>