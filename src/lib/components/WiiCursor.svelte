<script lang="ts">
	import { getBluetoothContext } from '$lib/context/bluetooth.svelte.ts';

	// Position of the finger tip within the image, as percentages.
	// Adjust these two values to precisely place the rotation center.
	const FINGER_TIP_X = 45; // % from left edge of the image
	const FINGER_TIP_Y = 0;  // % from top edge of the image

	const blt = getBluetoothContext();
</script>

<!--
	The wrapper is a zero-size fixed element placed at (x, y).
	Rotating it rotates around (x, y) exactly — no offset needed on the wrapper.
	The image is then shifted so its finger tip lands on that same (x, y) point.
-->
{#if blt.receivedData !== null}
	<div
		class="cursor-anchor"
		style="left: calc({blt.receivedData.x} * 0.01vw); top: calc({blt.receivedData.y} * 0.01vh); transform: rotate({blt.receivedData.roll}deg);"
	>
		<img
			src={blt.receivedData.buttonMask & 1 ? '/cursor/hand_closed.png' : '/cursor/hand_point_n.png'}
			style="transform: translate(-{FINGER_TIP_X}%, -{FINGER_TIP_Y}%);"
			alt=""
			draggable="false"
		/>
	</div>
{/if}

<style>
	.cursor-anchor {
		position: fixed;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 9999;
	}

	.cursor-anchor img {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		user-select: none;
	}
</style>
