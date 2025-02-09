<script lang="ts">
	import { Input } from '$lib/shadcn/ui/input/index.js';
	import { Label } from '$lib/shadcn/ui/label/index.js';
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import { Checkbox } from '$lib/shadcn/ui/checkbox/index.js';
	import Button from '@/shadcn/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { apiPost } from '@/services/apiService';
	import { surveyManager, SurveyState, surveyUserToken } from '@/stores/surveyTask';
	import { goto } from '$app/navigation';

	const genders = [
		{ value: 'male', label: 'Man' },
		{ value: 'female', label: 'Woman' },
		{ value: 'other', label: 'Other' }
	];

	const pcExperiences = [
		{ value: 'less_than_month', label: 'Méně než jednou za měsíc' },
		{ value: 'several_per_month', label: 'Několikrát za měsíc' },
		{ value: 'once_week', label: 'Jednou týdně' },
		{ value: 'several_per_week', label: 'Několikrát za týden' },
		{ value: 'once_day', label: 'Každý den' },
		{ value: 'several_per_day', label: 'Několikrát denně' }
	];

	let age = $state<number>();
	let gender = $state('');
	let pcExperience = $state('');
	let student = $state(false);
	let loading = $state(false);
	let error = $state(false);

	const genderContent = $derived(genders.find((f) => f.value === gender)?.label ?? 'Jste?');
	const pcExperienceContent = $derived(
		pcExperiences.find((f) => f.value === pcExperience)?.label ?? 'Jak často pracujete na počítači?'
	);

	const handleSubmit = async () => {
		loading = true;

		const res = await apiPost(
			'participants/demographic',
			{
				age,
				gender,
				pc_experience: pcExperience,
				student
			},
			$surveyUserToken
		);

		if (res.Status === 200) {
			surveyManager.setState(SurveyState.Started);
			goto('/survey');
		} else {
			error = true;
		}

		loading = false;
	};
</script>

<section class="card card--sm">
	<div class="flex flex-col gap-1">
		<h3 class="text-lg font-semibold text-gray-800">Demografické údaje</h3>
		<p class="text-gray-600">
			Prosím vyplňte následující demografické údaje. Tato data nám pomohou lépe pochopit, kdo naši
			aplikaci používá.
		</p>
	</div>

	{#if error}
		<Alert.Root variant="destructive">
			<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5 text-red-400" />
			<Alert.Title>Nastala chyba!</Alert.Title>
			<Alert.Description>Zkontrolujte zda máte vyplněná všechny pole.</Alert.Description>
		</Alert.Root>
	{/if}

	<form class="mt-2 flex flex-col gap-4">
		<div class="flex w-full flex-col gap-1.5">
			<Label for="number">Věk</Label>
			<Input
				type="number"
				id="number"
				placeholder="Věk"
				min="0"
				max="99"
				bind:value={age}
				required
			/>
		</div>

		<div class="5 flex w-full flex-col gap-1">
			<Label for="gender">Jste?</Label>
			<Select.Root type="single" name="gender" bind:value={gender} required>
				<Select.Trigger>
					{genderContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each genders as gender}
							<Select.Item value={gender.value} label={gender.label}>{gender.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="5 flex w-full flex-col gap-1">
			<Label for="number">Jak často pracujete na počítači?</Label>
			<Select.Root type="single" name="pc_experience" bind:value={pcExperience} required>
				<Select.Trigger>
					{pcExperienceContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each pcExperiences as experience}
							<Select.Item value={experience.value} label={experience.label}>
								{experience.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex items-center space-x-2">
			<Checkbox id="terms" bind:checked={student} aria-labelledby="terms-label" />
			<Label
				id="terms-label"
				for="terms"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Jste student VŠ?
			</Label>
		</div>

		<div class="flex justify-end">
			<Button type="submit" disabled={loading} onclick={handleSubmit}>
				{#if loading}
					<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
				{/if}

				Pokračovat
			</Button>
		</div>
	</form>
</section>
