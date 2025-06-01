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
			<p>
				V rámci tohoto dotazníku vás požádáme, abyste dvakrát odpověděli na stejnou sadu tří výroků. V každém případě dostanete jiné instrukce, které popisují rozdílnou situaci, ve které si máte představit, že se nacházíte. 
			</p>
			<p>
				<strong>Prosíme vás, abyste se vždy nejprve důkladně seznámili s instrukcemi</strong>, a poté odpovídali co nejpřesněji podle toho, jak byste v dané situaci skutečně jednali nebo přemýšleli.
			</p>
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
