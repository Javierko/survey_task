<script lang="ts">
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/shadcn/ui/button';
	import {
		surveyUserId,
		surveyAllowValidations,
		surveyState,
		SurveyState,
		surveyStage
	} from '$lib/stores/surveyTask';
	import SurveyTaskSlider from '$lib/components/SurveyTaskSlider.svelte';
	import SurveyTaskFinished from '$lib/components/SurveyTaskFinished.svelte';
	import SurveyTaskValidation from '../SurveyTaskValidation.svelte';
	import { handleGazeError } from '$lib/stores/gazeError';
	import {
		closeGazeInput,
		dummyConfig,
		gazeInput,
		gazePointConfig,
		GazeState,
		gazeState,
		gazeStop,
		gazeStopTimeout,
		gazeValidation,
		setupGazeInput
	} from '$lib/stores/gazeInput';
	import { beforeNavigate, goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { GazeInputConfig } from '@473783/develex-core';
	import { Switch } from '$lib/shadcn/ui/switch';
	import SurveyTaskDemographicStageTwo from './SurveyTaskDemographicStageTwo.svelte';
	import SurveyTaskIntroStageTwo from './SurveyTaskIntroStageTwo.svelte';
	import SurveyTaskFixationsLayer from '../SurveyTaskFixationsLayer.svelte';

	const trackers: Record<string, string> = {
		dummy: 'Dummy',
		opengaze: 'GazePoint'
	};

	$: selectedTrackerValue = '';
	$: selectedTracker = selectedTrackerValue
		? {
				label: trackers[selectedTrackerValue],
				value: trackers[selectedTrackerValue]
			}
		: undefined;

	const onClick = async (e: MouseEvent) => {
		let config: GazeInputConfig | undefined;

		if (selectedTrackerValue === 'dummy') {
			config = dummyConfig;
		} else if (selectedTrackerValue === 'opengaze') {
			config = gazePointConfig;
		}

		if (!config) {
			return;
		}

		await setupGazeInput(config, e, window);

		if ($gazeInput) {
			await $gazeInput.start();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if ($surveyUserId && $surveyState !== SurveyState.Finished) {
			if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
				e.preventDefault();
			}
		}
	};

	const handleContinue = () => {
		surveyState.set(SurveyState.Demographic);
		surveyStage.set(2);
	};

	const handleDisconnect = async () => {
		await closeGazeInput();
	};

	beforeNavigate(({ cancel }) => {
		gazeStop.set(true);
		$gazeInput?.stop();

		if (
			$surveyUserId &&
			$surveyState !== SurveyState.Finished &&
			$surveyState !== SurveyState.PitStop
		) {
			cancel();
		}
	});
</script>

{#if $surveyState === SurveyState.Demographic}
	<SurveyTaskDemographicStageTwo />
{:else if $gazeState != GazeState.CONNECTED || $surveyUserId === null}
	<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
		<div class="flex items-center justify-end">
			<Button variant="outline" on:click={() => goto('/survey-data')}>Všechna data</Button>
		</div>

		<SurveyTaskIntroStageTwo />

		<div class="flex items-center gap-4">
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
					{#each Object.keys(trackers) as trackerKey}
						<Select.Item value={trackerKey} label={trackers[trackerKey]}
							>{trackers[trackerKey]}</Select.Item
						>
					{/each}
				</Select.Content>
			</Select.Root>

			<div class="flex items-center gap-2">
				<Switch id="allow-validations" bind:checked={$surveyAllowValidations} />

				<label for="allow-validations" class="text-sm text-gray-800">Povolit validace</label>
			</div>
		</div>

		<div class="flex items-center justify-between gap-2">
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
					<Button on:click={handleContinue}>Pokračovat</Button>
				{/if}
			</div>

			{#if $gazeState == GazeState.CONNECTED}
				<Button variant="destructive" on:click={handleDisconnect}>Odpojit eye-tracker</Button>
			{/if}
		</div>
	</div>
{:else if $surveyState === SurveyState.PitStop}
	<SurveyTaskFinished />
{:else if $gazeValidation}
	<div in:fade>
		<SurveyTaskFixationsLayer let:registerFixation let:unregisterFixation>
			<SurveyTaskValidation {registerFixation} {unregisterFixation} />
		</SurveyTaskFixationsLayer>
	</div>
{:else}
	<div in:fade class="w-full">
		<SurveyTaskFixationsLayer let:registerFixation let:unregisterFixation>
			<SurveyTaskSlider {registerFixation} {unregisterFixation} />
		</SurveyTaskFixationsLayer>
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
