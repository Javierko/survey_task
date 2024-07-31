<script lang="ts">
	import { surveyUserId } from '$lib/stores/surveyTask';
	import { downloadData } from '$lib/utils/downloadSurveyData';
	import { Button } from '$lib/shadcn/ui/button';
	import Icon from '@iconify/svelte';

	const download = async () => {
		await downloadData([$surveyUserId as string]);
	};
</script>

<div
	class="m-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-md border border-gray-100 bg-white p-4 shadow"
>
	<div class="flex w-full items-center gap-4 rounded-md border border-green-600 bg-green-50 p-4">
		<Icon icon="lucide:badge-check" class="h-6 w-6 flex-shrink-0 text-green-600" />

		<p class="text-gray-700">Dotazník byl úspěšně vyřešen, nezapomeňte si stáhnout data.</p>
	</div>

	<Button on:click={download}>Stáhnout data</Button>
</div>
