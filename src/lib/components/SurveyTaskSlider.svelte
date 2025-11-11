<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import HEADERS from '$lib/data/headers.json';
	import { surveyManager, SurveyState } from '$lib/stores/surveyTask';
	import { derived } from 'svelte/store';
	import SurveyTaskQuestions from './SurveyTaskQuestions.svelte';

	const questionsList = derived(surveyManager, ($surveyManager) => {
		return $surveyManager.state == SurveyState.Started
			? QUESTIONS['start'][$surveyManager.slide]
			: QUESTIONS['rest'][$surveyManager.slide] || [];
	});

	const headers = derived(questionsList, ($questionsList) => {
		return HEADERS[$questionsList.header_id] || [];
	});

	const questions = derived(questionsList, ($questionsList) => {
		return $questionsList.questions || [];
	});

	const slides = derived(surveyManager, ($surveyManager) => {
		return $surveyManager.state == SurveyState.Started
			? QUESTIONS['start'].length
			: QUESTIONS['rest'].length;
	});
</script>

<SurveyTaskQuestions
	questions={$questions}
	headers={$headers}
	slides={$slides}
	title={$questionsList.title}
/>
