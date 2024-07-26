<script lang="ts">
import Icon from "@iconify/svelte";
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
import * as Alert from "$lib/shadcn/ui/alert/index.js";
import { surveyUserId } from "$lib/stores/surveyTask";
import userRepository from "$lib/database/repositories/user.repository";
import { v4 } from "uuid";
import SurveyTaskSlider from "$lib/components/SurveyTaskSlider.svelte";

let gazeInput: GazeInput<GazeInputConfigGazePoint>;
let state: "disconnected" | "connecting" | "connected" | "error" =
	"disconnected";
let errorMessages: string[];
$: errorMessages = [];

const handleError = (event: Event) => {
	const error = event instanceof ErrorEvent ? event.error : event;
	const message = error instanceof Error ? error.message : error.toString();
	errorMessages.push(message);
	state = "error";
};

const onClick = async (e: MouseEvent) => {
	state = "connecting";
	setConfigWindowFields(e, window);

	const inputFields = $inputWindowFieldsConfig;
	if (inputFields) {
		gazeInput.setWindowCalibration(inputFields.mouse, inputFields.window);
	}

	await gazeInput.connect();
	await gazeInput.start();
	state = "connected";
};

const handleStartSurvey = async () => {
	const uId = await userRepository.create({
		id: v4(),
		resolution: {
			width: window.screen.width,
			height: window.screen.height,
		},
		userAgent: navigator.userAgent,
		timestamp: Date.now(),
	});

	surveyUserId.set(uId);
};

const onDataRecieve = (point: GazeDataPoint) => {
	//
};

onMount(() => {
	gazeInput = createGazeInput({
		tracker: "opengaze",
		uri: "ws://localhost:13892",
		fixationDetection: "none",
	});

	gazeInput.on("data", onDataRecieve);

	return async () => {
		if (gazeInput) {
			gazeInput.off("data", onDataRecieve);

			await gazeInput.stop();
			await gazeInput.disconnect();
			state = "disconnected";
		}
	};
});
</script>

{#if state != "connected" || $surveyUserId === null}
	<div class="w-full h-screen flex items-center justify-center gap-2">
		<div class="max-w-2xl w-full rounded-md shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
			{#if errorMessages.length > 0}
				<Alert.Root variant="destructive">
					<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
					<Alert.Title>Nastala chyba</Alert.Title>
					{#each errorMessages as message}
						<Alert.Description>{message}</Alert.Description>
					{/each}
				</Alert.Root>
			{/if}

			<div>
				<Button on:click={onClick} disabled={state == "connecting" || state == "connected"}>
					{#if state == "connecting"}
						<Icon icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
						Připojuji
					{:else if state == "disconnected"}
						<Icon icon="lucide:play" class="mr-2 h-4 w-4" />
						Připojit eyetracker
					{:else if state == "error"}
						<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
						Chyba
					{:else}
						Připojeno
					{/if}
				</Button>

				{#if state == "connected"}
					<Button on:click={handleStartSurvey}>
						Spustit dotazník
					</Button>
				{/if}
			</div>
		</div>
	</div>
{:else}
<SurveyTaskSlider />
{/if}

<svelte:window
	on:error|capture={handleError}
	on:unhandledrejection|capture={(e) => handleError(e.reason)}
/>
