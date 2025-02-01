<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import HEADERS from '$lib/data/headers.json';
	import { surveyManager } from '$lib/stores/surveyTask';
	import { derived } from 'svelte/store';
	import SurveyTaskQuestions from './SurveyTaskQuestions.svelte';

	const headers = derived(surveyManager, ($surveyManager) => {
		return HEADERS[QUESTIONS[$surveyManager.type][$surveyManager.slide].header_id] || [];
	});

	const questions = derived(surveyManager, ($surveyManager) => {
		return QUESTIONS[$surveyManager.type][$surveyManager.slide].questions || [];
	});
</script>

<SurveyTaskQuestions questions={$questions} headers={$headers} />
