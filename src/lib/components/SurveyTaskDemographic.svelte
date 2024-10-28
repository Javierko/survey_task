<script lang="ts">
	import { Input } from '$lib/shadcn/ui/input';
	import { surveyUserData } from '$lib/stores/surveyTask';
	import SurveyTaskStartButton from './SurveyTaskStartButton.svelte';
	import { GazeState, gazeState } from '$lib/stores/gazeInput';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Alert.Root>
		<Icon icon="mdi:information-variant-circle-outline" class="mr-2 h-4 w-4" />
		<Alert.Description>
			V následujících otázkách se bude kromě vašich odpovědí měřit i váš reakční čas. Z toho důvodu
			není možné při odpovídání přeskakovat ani se vracet zpět, ale je nutné odpovídat na otázky
			postupně.
		</Alert.Description>
	</Alert.Root>

	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Váš identifikátor</small>
			<Input type="text" placeholder="Identifikátor" bind:value={$surveyUserData.identifier} />
		</div>
	</div>

	<div class="flex items-center justify-end">
		{#if $gazeState == GazeState.CONNECTED}
			<SurveyTaskStartButton />
		{/if}
	</div>
</div>
