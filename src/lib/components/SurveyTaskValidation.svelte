<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import {
		GazeInteractionObjectValidation,
		type GazeInteractionObjectValidationSettings
	} from '@473783/develex-core';
	import Icon from '@iconify/svelte';
	import { onMount, SvelteComponent } from 'svelte';
	import SurveyTaskValidationCircle from './SurveyTaskValidationCircle.svelte';
	import { fade } from 'svelte/transition';
	import { Button } from '$lib/shadcn/ui/button';
	import { gazeInput, gazeValidation } from '$lib/stores/gazeInput';
	import aoiRepository from '$lib/database/repositories/aoi.repository';
	import { surveyUserId } from '$lib/stores/surveyTask';

	let validator = new GazeInteractionObjectValidation();
	let validating = false;
	let element: HTMLElement;
	let validationCircleElement: SvelteComponent | null;
	const validationSettings: Partial<GazeInteractionObjectValidationSettings> & {
		validationDuration: number;
	} = {
		validationDuration: 1000,
		accuracyTolerance: 100
	};
	let validationResult: {
		isValid: boolean;
		accuracy: number;
		precision: number;
	} | null;

	const originalOnValidation = validationSettings.onValidation;
	validationSettings.onValidation = (result) => {
		if (originalOnValidation) {
			originalOnValidation(result);
		}

		if (validationCircleElement) {
			validationCircleElement.$destroy();
		}

		validationResult = result;

		if (result.isValid) {
			setTimeout(() => {
				gazeValidation.set(false);
			}, 2000);
		}
	};

	const handleTryAgain = async () => {
		if ($gazeInput && !$gazeInput.isEmitting) {
			await $gazeInput.start();
		}

		validationResult = null;
		validating = false;
	};

	const handleCalibrate = async () => {
		if ($gazeInput) {
			await $gazeInput.stop();
			await $gazeInput.calibrate();
		}
	};

	const onKeyPress = async (e: KeyboardEvent) => {
		if (e.code === 'Space') {
			if ($gazeInput && !$gazeInput.isEmitting) {
				await $gazeInput.start();
			}

			gazeValidation.set(false);
		}
	};

	onMount(() => {
		if (!$gazeInput) {
			return;
		}

		async function createAoiCross() {
			const elementPos = element.getBoundingClientRect();

			await aoiRepository.create({
				userId: $surveyUserId as string,
				aoiId: element.id,
				leftBotPos: {
					x: elementPos.left,
					y: elementPos.bottom
				},
				rightTopPos: {
					x: elementPos.right,
					y: elementPos.top
				}
			});
		}

		if (element) {
			createAoiCross();
		}

		validator.connect($gazeInput);
		window.addEventListener('keypress', onKeyPress);

		return () => {
			window.removeEventListener('keypress', onKeyPress);
			validator.disconnect($gazeInput);

			if (validationCircleElement) {
				validationCircleElement.$destroy();
			}
		};
	});

	const handleValidationClick = (e: MouseEvent) => {
		if (validating) return;

		validationCircleElement = new SurveyTaskValidationCircle({
			target: document.body,
			props: {
				validator,
				validationSettings,
				centerCoordinates: {
					x: e.x,
					y: e.y
				}
			}
		});

		validating = true;
	};
</script>

<div class="absolute left-8 top-8">
	<button
		id="aoi-validation-cross"
		bind:this={element}
		class="flex items-center justify-center"
		on:click={handleValidationClick}
	>
		<Icon icon="ph:plus" class="h-32 w-32 text-gray-600" />
	</button>
</div>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Alert.Root
		variant={validationResult == null
			? 'default'
			: validationResult.isValid
				? 'success'
				: 'destructive'}
	>
		<Icon icon="lucide:info" class="mr-2 h-4 w-4" />
		<Alert.Title>Validace</Alert.Title>
		<Alert.Description>
			Tohle je validační slajd. Pro začátek validace klikněte na střed kříže a počkejte na signál.
			Po úspěšně validaci budete automaticky přesměrování na dotazník (2 sekundy).
		</Alert.Description>
	</Alert.Root>

	{#if validationResult}
		<div class="grid grid-cols-2 gap-4" transition:fade>
			<div class="flex flex-col gap-1 rounded-md border border-gray-200 p-4 text-gray-700">
				<h3>Accuraccy</h3>
				<h2 class="text-xl font-semibold">{validationResult.accuracy}</h2>
				<small>Průměrná vzdálenost bodů od středu šedého kruhu.</small>
			</div>

			<div class="flex flex-col gap-1 rounded-md border border-gray-200 p-4 text-gray-700">
				<h3>Precision</h3>
				<h2 class="text-xl font-semibold">{validationResult.precision}</h2>
				<small>Standardní odchylka vzdáleností od jejich těžiště.</small>
			</div>
		</div>

		{#if !validationResult.isValid}
			<div class="flex justify-center gap-4">
				<Button variant="secondary" on:click={handleTryAgain}>
					<Icon icon="akar-icons:refresh" class="mr-2 h-4 w-4" />
					Zkusit znovu
				</Button>

				<Button variant="outline" on:click={handleCalibrate}>Kalibrace</Button>
			</div>
		{/if}
	{/if}
</div>
