<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/shadcn/ui/button';
	import { onMount } from 'svelte';
	import { surveyUserId, surveyFinished } from '$lib/stores/surveyTask';
	import SurveyTaskSlider from '$lib/components/SurveyTaskSlider.svelte';
	import SurveyTaskFinished from '$lib/components/SurveyTaskFinished.svelte';
	import SurveyTaskStartButton from '$lib/components/SurveyTaskStartButton.svelte';
	import SurveyTaskErrors from './SurveyTaskErrors.svelte';
	import SurveyTaskIntro from './SurveyTaskIntro.svelte';
	import SurveyTaskValidation from './SurveyTaskValidation.svelte';
	import { handleGazeError } from '$lib/stores/gazeError';
	import {
		closeGazeInput,
		gazeInput,
		GazeState,
		gazeState,
		gazeValidation,
		setupGazeInput
	} from '$lib/stores/gazeInput';
	import { beforeNavigate, goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	const onClick = async (e: MouseEvent) => {
		await setupGazeInput(
			{
				tracker: 'dummy',
				fixationDetection: 'none',
				frequency: 30,
				precisionMinimalError: 0.5,
				precisionMaximumError: 1.5, // todo fix
				precisionDecayRate: 0.5
			},
			e,
			window
		);

		if ($gazeInput) {
			await $gazeInput.start();
		}
	};

	onMount(() => {
		return async () => await closeGazeInput();
	});

	beforeNavigate(({ cancel }) => {
		// cancel();
	});
</script>

{#if $gazeState != GazeState.CONNECTED || $surveyUserId === null}
	<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
		<div class="flex items-center justify-end">
			<Button variant="outline" on:click={() => goto('survey-data')}>Všechna data</Button>
		</div>

		<SurveyTaskIntro />

		<SurveyTaskErrors />

		<div class="flex items-center gap-2">
			<Button
				on:click={onClick}
				disabled={$gazeState == GazeState.CONNECTING || $gazeState == GazeState.CONNECTED}
			>
				{#if $gazeState == GazeState.CONNECTING}
					<Icon icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
					Připojuji
				{:else if $gazeState == GazeState.DISCONNECTED}
					<Icon icon="lucide:play" class="mr-2 h-4 w-4" />
					Připojit Eye-Tracker
				{:else if $gazeState == GazeState.ERROR}
					<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
					Chyba
				{:else}
					<Icon icon="lucide:check" class="mr-2 h-4 w-4" />
					Připojeno
				{/if}
			</Button>

			{#if $gazeState == GazeState.CONNECTED}
				<SurveyTaskStartButton />
			{/if}
		</div>
	</div>
{:else if $surveyFinished}
	<SurveyTaskFinished />
{:else if $gazeValidation}
	<div in:fade>
		<SurveyTaskValidation />
	</div>
{:else}
	<div in:fade>
		<SurveyTaskSlider />
	</div>
{/if}

<svelte:window
	on:error|capture={handleGazeError}
	on:unhandledrejection|capture={(e) => handleGazeError(e.reason)}
	on:unload={closeGazeInput}
/>
