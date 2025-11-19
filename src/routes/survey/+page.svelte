<script lang="ts">
	import { goto } from '$app/navigation';
	import IatTaskSlider from '@/components/iat/IatTaskSlider.svelte';
	import SurveyTaskDemographic from '@/components/SurveyTaskDemographic.svelte';
	import SurveyTaskFinished from '@/components/SurveyTaskFinished.svelte';
	import SurveyTaskPoliticalVoted from '@/components/SurveyTaskPoliticalVoted.svelte';
	import SurveyTaskSlider from '@/components/SurveyTaskSlider.svelte';
	import type { Participant } from '@/models/Participant';
	import { getFromLocalStorage, removeFromLocalStorage } from '@/services/localStorageService';
	import {
		surveyManager,
		SurveyState,
		surveyUserToken,
		type SurveyManager
	} from '@/stores/surveyTask';
	import { onMount } from 'svelte';

	onMount(() => {
		const getLocalParticipant = getFromLocalStorage<Participant>('user');

		if (getLocalParticipant != null) {
			surveyUserToken.set(getLocalParticipant.Token);
		} else {
			goto('/');
		}

		const getLocalManager = getFromLocalStorage<SurveyManager>('surveyManager');

		if (getLocalManager != null) {
			surveyManager.set(getLocalManager);
		}

		const unsubscribe = surveyManager.subscribe((value) => {
			if (value.state === SurveyState.Finished) {
				removeFromLocalStorage('surveyManager');
			} else {
				surveyManager.save();
			}
		});

		return () => unsubscribe();
	});
</script>

{#if $surveyManager.state == SurveyState.Finished}
	<SurveyTaskFinished />
{:else if $surveyManager.state == SurveyState.Demographic}
	<SurveyTaskDemographic />
{:else if $surveyManager.state == SurveyState.Iat}
	<IatTaskSlider />
{:else if $surveyManager.state == SurveyState.Voted}
	<SurveyTaskPoliticalVoted />
{:else}
	<SurveyTaskSlider />
{/if}
