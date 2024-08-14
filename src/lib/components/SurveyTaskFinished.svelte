<script lang="ts">
	import { resetSurvey, surveyUserId } from '$lib/stores/surveyTask';
	import { downloadData } from '$lib/utils/downloadSurveyData';
	import { Button } from '$lib/shadcn/ui/button';
	import Icon from '@iconify/svelte';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { goto } from '$app/navigation';

	const download = async () => {
		await downloadData([$surveyUserId as string]);
	};

	const handleStartAgain = () => {
		resetSurvey();
	};
</script>

<div
	class="m-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-md border border-gray-100 bg-white p-4 shadow"
>
	<Alert.Root variant="success">
		<Icon icon="lucide:check" class="mr-2 h-4 w-4" />
		<Alert.Title>Hotovo!</Alert.Title>
		<Alert.Description>
			Dotazník byl úspěšně vyřešen, nezapomeňte si stáhnout data.
		</Alert.Description>
	</Alert.Root>

	<div class="flex w-full items-center justify-between">
		<div class="flex items-center gap-2">
			<Button variant="secondary" on:click={() => goto('survey-data')}>Všechna data</Button>
			<Button variant="secondary" on:click={handleStartAgain}>Začít znovu</Button>
		</div>
		<Button on:click={download}>Stáhnout data</Button>
	</div>
</div>
