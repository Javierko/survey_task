<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import { surveyCurrentType, surveySlide } from '$lib/stores/surveyTask';
	import { derived } from 'svelte/store';
	import SurveyTaskQuestions from './SurveyTaskQuestions.svelte';

	const headers = [
		'Rozhodně nesouhlasím',
		'Nesouhlasím',
		'Spíše nesouhlasím',
		'Nevím',
		'Spíše souhlasím',
		'Souhlasím',
		'Rozhodně souhlasím'
	];

	const headersAlternative = [
		'Velmi náročný',
		'Náročný',
		'Spíše náročný',
		'Ani nenáročný, ani náročný',
		'Spíše nenáročný',
		'Nenáročný',
		'Velmi nenáročný'
	];

	const questions = derived(
		[surveyCurrentType, surveySlide],
		([$surveyCurrentType, $surveySlide]) => {
			return QUESTIONS[$surveyCurrentType][$surveySlide].questions || [];
		}
	);
</script>

<SurveyTaskQuestions
	questions={$questions}
	headers={$questions.length === 1 && [17, 26].includes($questions[0].id)
		? headersAlternative
		: headers}
/>
