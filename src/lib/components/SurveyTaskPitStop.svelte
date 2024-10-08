<script lang="ts">
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import {
		closeGazeInput,
		gazeInput,
		gazeLatestConfig,
		gazeValidation,
		setupGazeInput
	} from '$lib/stores/gazeInput';
	import { SurveyState, surveyState, switchCurrentType } from '$lib/stores/surveyTask';
	import * as Alert from '$lib/shadcn/ui/alert/index';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let loading = false;

	onMount(async () => {
		await closeGazeInput();
	});

	export const onContinueHandle = async (e: MouseEvent) => {
		if ($gazeLatestConfig != null) {
			loading = true;

			await setupGazeInput($gazeLatestConfig, e, window);

			if ($gazeInput) {
				await $gazeInput.start();
			}

			loading = false;
		}

		surveyState.set(SurveyState.SecondPhase);
		gazeValidation.set(true);
		switchCurrentType();
	};
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Alert.Root>
		<Icon icon="lucide:triangle-alert" class="mr-2 h-4 w-4" />
		<Alert.Title>Pauza!</Alert.Title>
		<Alert.Description>
			Momentálně jste došli do fáze, kdy je nutné přejít na druhý úkol. Jakmile jej budete mít,
			vraťte se zpět a klikněte na tlačítko "Pokračovat".
		</Alert.Description>
	</Alert.Root>

	<div class="flex items-center justify-end">
		<Button on:click={onContinueHandle} disabled={loading}>
			{#if loading}
				<Icon icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
				Připojuji k ET
			{:else}
				<Icon icon="lucide:play" class="mr-2 h-4 w-4" />
				Pokračovat
			{/if}
		</Button>
	</div>
</div>
