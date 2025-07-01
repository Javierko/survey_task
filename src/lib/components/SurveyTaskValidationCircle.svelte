<script lang="ts">
	import type {
		GazeInteractionObjectValidationSettings,
		GazeManager
	} from 'develex-js-sdk';
	import { onDestroy, onMount } from 'svelte';

	export let validationSettings: Partial<GazeInteractionObjectValidationSettings> & {
		validationDuration: number;
	};
	export let validator: GazeManager;
	export let centerCoordinates: { x: number; y: number };

	let element: HTMLElement;

	onMount(() => {
		validator.register({
			interaction: "validation",
			element,
			settings: validationSettings,
		})
	});

	onDestroy(() => {
		validator.unregister({
            interaction: "validation",
            element,
        });
	});
</script>

<div
	bind:this={element}
	class="validation-circle absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-700/20"
	style="left: {centerCoordinates.x}px; top: {centerCoordinates.y}px;"
></div>

<style>
	.validation-circle {
		animation: circle-bigger 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes circle-bigger {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}
		100% {
			opacity: 0.75;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
