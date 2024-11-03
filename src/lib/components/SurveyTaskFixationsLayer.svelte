<script lang="ts">
	import { gazeInput } from '$lib/stores/gazeInput';
	import { addFixationEvent } from '$lib/utils/fixationEvent';
	import {
		GazeInteractionObjectFixation,
		GazeInteractionScreenFixation
	} from '@473783/develex-core';
	import { onMount } from 'svelte';

	const fixationStore = new GazeInteractionScreenFixation();
	const fixationObjectStore = new GazeInteractionObjectFixation();
	const fixationObjectSettings = {
		bufferSize: 10
	};

	const registerFixation = (element: HTMLElement) => {
		fixationObjectStore.register(element, fixationObjectSettings);
	};

	const unregisterFixation = (element: HTMLElement) => {
		fixationObjectStore.unregister(element);
	};

	fixationObjectStore.on('fixationObjectStart', (event) => addFixationEvent(event));
	fixationObjectStore.on('fixationObjectEnd', (event) => addFixationEvent(event));

	onMount(() => {
		if (!$gazeInput) {
			return;
		}

		fixationStore.connect($gazeInput);
		fixationObjectStore.connect(fixationStore);

		return () => {
			fixationObjectStore.disconnect(fixationStore);
			fixationStore.disconnect($gazeInput);
		};
	});
</script>

<slot {registerFixation} {unregisterFixation} />
