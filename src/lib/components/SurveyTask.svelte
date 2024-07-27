<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/shadcn/ui/button';
	import { inputWindowFieldsConfig, setConfigWindowFields } from '$lib/stores/gazeInput';
	import type { GazeDataPoint, GazeInputConfigGazePoint } from '@473783/develex-core';
	import { createGazeInput, type GazeInput } from '@473783/develex-core';
	import { onMount } from 'svelte';
	import { surveyUserId, surveyFinished } from '$lib/stores/surveyTask';
	import SurveyTaskSlider from '$lib/components/SurveyTaskSlider.svelte';
	import pointRepository from '$lib/database/repositories/point.repository';
	import SurveyTaskFinished from '$lib/components/SurveyTaskFinished.svelte';
	import SurveyTaskStartButton from '$lib/components/SurveyTaskStartButton.svelte';
	import SurveyTaskErrors from './SurveyTaskErrors.svelte';

	let gazeInput: GazeInput<GazeInputConfigGazePoint>;
	let state: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
	let errorMessages: string[];
	$: errorMessages = [];

	const handleError = (event: Event) => {
		const error = event instanceof ErrorEvent ? event.error : event;
		const message = error instanceof Error ? error.message : error.toString();
		errorMessages.push(message);
		state = 'error';
	};

	const onClick = async (e: MouseEvent) => {
		state = 'connecting';
		setConfigWindowFields(e, window);

		const inputFields = $inputWindowFieldsConfig;
		if (inputFields) {
			gazeInput.setWindowCalibration(inputFields.mouse, inputFields.window);
		}

		await gazeInput.connect();
		await gazeInput.start();
		state = 'connected';
	};

	const onDataRecieve = async (point: GazeDataPoint) => {
		if ($surveyUserId === null) return;

		await pointRepository.create({
			...point,
			userId: $surveyUserId as string
		});
	};

	const closeBridgeConnection = async () => {
		if (gazeInput) {
			gazeInput.off('data', onDataRecieve);

			await gazeInput.stop();
			await gazeInput.disconnect();
			state = 'disconnected';
		}
	};

	onMount(() => {
		gazeInput = createGazeInput({
			tracker: 'opengaze',
			uri: 'ws://localhost:13892',
			fixationDetection: 'none'
		});

		gazeInput.on('data', onDataRecieve);

		return async () => await closeBridgeConnection();
	});
</script>

{#if state != 'connected' || $surveyUserId === null}
	<div class="flex h-screen w-full items-center justify-center gap-2">
		<div
			class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm"
		>
			<SurveyTaskErrors {errorMessages} />

			<div>
				<Button on:click={onClick} disabled={state == 'connecting' || state == 'connected'}>
					{#if state == 'connecting'}
						<Icon icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
						Připojuji
					{:else if state == 'disconnected'}
						<Icon icon="lucide:play" class="mr-2 h-4 w-4" />
						Připojit eyetracker
					{:else if state == 'error'}
						<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
						Chyba
					{:else}
						Připojeno
					{/if}
				</Button>

				{#if state == 'connected'}
					<SurveyTaskStartButton />
				{/if}
			</div>
		</div>
	</div>
{:else if $surveyFinished}
	<SurveyTaskFinished />
{:else}
	<SurveyTaskSlider />
{/if}

<svelte:window
	on:error|capture={handleError}
	on:unhandledrejection|capture={(e) => handleError(e.reason)}
	on:beforeunload|capture={closeBridgeConnection}
/>
