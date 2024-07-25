<script lang="ts">
import { Button } from "$lib/shadcn/ui/button";
import {
	inputWindowFieldsConfig,
	setConfigWindowFields,
} from "$lib/stores/gazeInput";
import type {
	GazeDataPoint,
	GazeInputConfigGazePoint,
} from "@473783/develex-core";
import { createGazeInput, type GazeInput } from "@473783/develex-core";
import { onMount } from "svelte";

let gazeInput: GazeInput<GazeInputConfigGazePoint>;

const onClick = async (e: MouseEvent) => {
	setConfigWindowFields(e, window);

	const inputFields = $inputWindowFieldsConfig;
	if (inputFields) {
		gazeInput.setWindowCalibration(inputFields.mouse, inputFields.window);
	}

	await gazeInput.connect();
	await gazeInput.start();
};

const onDataRecieve = (point: GazeDataPoint) => {
	console.log(point);
};

onMount(() => {
	gazeInput = createGazeInput({
		tracker: "opengaze",
		uri: "ws://localhost:13892",
		fixationDetection: "device",
	});

	gazeInput.on("data", onDataRecieve);

	return async () => {
		if (gazeInput) {
			gazeInput.off("data", onDataRecieve);

			await gazeInput.stop();
			await gazeInput.disconnect();
		}
	};
});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Button on:click={onClick}>Click me</Button>