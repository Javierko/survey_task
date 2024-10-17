<script lang="ts">
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import { Input } from '$lib/shadcn/ui/input';
	import { surveyUserData } from '$lib/stores/surveyTask';
	import SurveyTaskStartButton from './SurveyTaskStartButton.svelte';
	import { GazeState, gazeState } from '$lib/stores/gazeInput';

	const handleGenderSelect = (value: any) => {
		if (!value || value.value == null) {
			return;
		}

		surveyUserData.update((data) => {
			data.gender = value.value as string;
			return data;
		});
	};

	const handleExpirienceSelect = (value: any) => {
		if (!value || value.value == null) {
			return;
		}

		surveyUserData.update((data) => {
			data.experience = value.value as string;
			return data;
		});
	};
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Váš identifikátor</small>
			<Input type="text" placeholder="Identifikátor" bind:value={$surveyUserData.identifier} />
		</div>

		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Jaký je Vás věk?</small>
			<Input type="number" placeholder="Věk" min="0" max="99" bind:value={$surveyUserData.age} />
		</div>

		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Jaký je Váš gender?</small>
			<Select.Root onSelectedChange={handleGenderSelect}>
				<Select.Trigger>
					<Select.Value placeholder="Vyberte gender" />
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="male" label="Muž">Muž</Select.Item>
					<Select.Item value="female" label="Žena">Žena</Select.Item>
					<Select.Item value="other" label="Jiné / Nechci odpovídat">
						Jiné / Nechci odpovídat
					</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Jaká je Vaše zkušenost s PC?</small>
			<Select.Root onSelectedChange={handleExpirienceSelect}>
				<Select.Trigger>
					<Select.Value placeholder="Vyberte zkušenost s PC" />
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="Méně než jednou za měsíc" label="Méně než jednou za měsíc"
						>Méně než jednou za měsíc</Select.Item
					>
					<Select.Item value="Několikrát za měsíc" label="Několikrát za měsíc"
						>Několikrát za měsíc</Select.Item
					>
					<Select.Item value="Jednou týdně" label="Jednou týdně">Jednou týdně</Select.Item>
					<Select.Item value="Několikrát za týden" label="Několikrát za týden"
						>Několikrát za týden</Select.Item
					>
					<Select.Item value="Každý den" label="Každý den">Každý den</Select.Item>
					<Select.Item value="Několikrát denně" label="Několikrát denně"
						>Několikrát denně</Select.Item
					>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="flex items-center justify-end">
		{#if $gazeState == GazeState.CONNECTED}
			<SurveyTaskStartButton />
		{/if}
	</div>
</div>
