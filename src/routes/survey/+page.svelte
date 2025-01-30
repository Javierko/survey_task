<script lang="ts">
	import SurveyTaskFinished from "@/components/SurveyTaskFinished.svelte";
	import SurveyTaskSlider from "@/components/SurveyTaskSlider.svelte";
	import { SurveyState, surveyState } from "@/stores/surveyTask";
</script>

{#if $surveyState == SurveyState.Finished}
	<SurveyTaskFinished />
{:else}
	<SurveyTaskSlider />
{/if}