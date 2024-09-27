<script>
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import { gazeValidation } from '$lib/stores/gazeInput';
	import { SurveyState, surveyState, switchCurrentType } from '$lib/stores/surveyTask';

	export const onContinueHandle = () => {
		surveyState.set(SurveyState.SecondPhase);
		gazeValidation.set(true);
		switchCurrentType();
	};
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Button on:click={onContinueHandle}>Pokračovat</Button>
</div>
