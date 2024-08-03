<script lang="ts">
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/shadcn/ui/button';
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
		gazeStop,
		gazeStopTimeout,
		gazeValidation,
		setupGazeInput
	} from '$lib/stores/gazeInput';
	import { beforeNavigate, goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	const trackers = [
		{ value: 'dummy', label: 'Myš' },
		{ value: 'opengaze', label: 'GazePoint' }
	];

	$: selectedTrackerValue = '';
	$: selectedTracker = selectedTrackerValue
		? {
				label: trackers.find((t) => t.value === selectedTrackerValue)?.label,
				value: trackers.find((t) => t.value === selectedTrackerValue)?.label
			}
		: undefined;

	const onClick = async (e: MouseEvent) => {
		if (selectedTrackerValue === 'dummy') {
			await setupGazeInput(
				{
					tracker: 'dummy',
					fixationDetection: 'none',
					frequency: 30,
					precisionMinimalError: 0.5,
					precisionMaximumError: 1.5,
					precisionDecayRate: 0.5
				},
				e,
				window
			);
		} else if (selectedTrackerValue === 'opengaze') {
			await setupGazeInput(
				{
					tracker: 'opengaze',
					fixationDetection: 'none',
					uri: 'ws://localhost:13892'
				},
				e,
				window
			);
		}

		if ($gazeInput) {
			await $gazeInput.start();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if ($surveyUserId && !$surveyFinished) {
			if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
				e.preventDefault();
			}
		}
	};

	beforeNavigate(({ cancel }) => {
		gazeStop.set(true);
		$gazeInput?.stop();

		if ($surveyUserId && !$surveyFinished) {
			cancel();
		}
	});
</script>

{#if $gazeState != GazeState.CONNECTED || $surveyUserId === null}
	<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
		<div class="flex items-center justify-end">
			<Button variant="outline" on:click={() => goto('survey-data')}>Všechna data</Button>
		</div>

		<SurveyTaskIntro />

		<SurveyTaskErrors />

		<Select.Root
			selected={selectedTracker}
			onSelectedChange={(v) => {
				v && v.value != null && (selectedTrackerValue = v.value);
			}}
		>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Vyberte eye-tracker" />
			</Select.Trigger>
			<Select.Content>
				{#each trackers as tracker}
					<Select.Item value={tracker.value} label={tracker.label}>{tracker.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

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
	on:keydown={handleKeyDown}
	on:focus={() => {
		if ($gazeStop) {
			const timeout = setTimeout(() => {
				$gazeInput?.start();
			}, 5000);
			gazeStopTimeout.set(timeout);
			gazeStop.set(false);
		}
	}}
	on:pagehide={() => {
		if ($gazeStopTimeout) {
			clearTimeout($gazeStopTimeout);
		}
		closeGazeInput();
	}}
/>
