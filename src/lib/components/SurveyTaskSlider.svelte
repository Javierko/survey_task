<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import { surveySlide, surveyUserId } from '$lib/stores/surveyTask';
	import {
		GazeInteractionScreenFixation,
		GazeInteractionObjectFixation
	} from '@473783/develex-core';
	import SurveyTaskQuestions from './SurveyTaskQuestions.svelte';
	import { onMount } from 'svelte';
	import { gazeInput } from '$lib/stores/gazeInput';
	import fixationRepository from '$lib/database/repositories/fixation.repository';
	import type { Fixation } from '$lib/database/models/Fixation';

	const headers = [
		'Naprosto souhlasím',
		'Souhlasím',
		'Spíše souhlasím',
		'Nevím',
		'Spíše nesouhlasím',
		'Nesouhlasím',
		'Naprosto nesouhlasím'
	];

	$: questions = QUESTIONS[$surveySlide];

	const fixationStore = new GazeInteractionScreenFixation();
	const fixationObjectStore = new GazeInteractionObjectFixation();

	const registerFixation = (element: HTMLElement) => {
		fixationObjectStore.register(element);
	};

	const unregisterFixation = (element: HTMLElement) => {
		fixationObjectStore.unregister(element);
	};

	fixationObjectStore.on('fixationObjectStart', (event) => addFixationEvent(event));
	fixationObjectStore.on('fixationObjectEnd', (event) => addFixationEvent(event));

	const addFixationEvent = (event) => {
		const { type, timestamp, duration, gazeData, target, fixationId } = event;

		const aois = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

		const fixation: Fixation = {
			userId: $surveyUserId as string,
			fixationId,
			aois,
			duration,
			gazeData,
			type,
			timestamp
		};

		fixationRepository.create(fixation);
	};

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

<SurveyTaskQuestions
	{questions}
	{headers}
	registerFn={registerFixation}
	unregisterFn={unregisterFixation}
/>
