<script lang="ts">
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import { Input } from '$lib/shadcn/ui/input';
	import {
		surveyAllowValidations,
		surveyCurrentType,
		SurveyState,
		surveyState,
		surveyUserData,
		surveyUserId,
		switchCurrentType
	} from '$lib/stores/surveyTask';
	import { GazeState, gazeState, gazeValidation } from '$lib/stores/gazeInput';
	import userRepository from '$lib/database/repositories/user.repository';
	import { Button } from '$lib/shadcn/ui/button';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';

	let identifier: string = '';

	const genders: { [key in 'male' | 'female' | 'other']: string } = {
		male: 'Muž',
		female: 'Žena',
		other: 'Jiné / Nechci odpovídat'
	};

	$: handleIdentifierChange(identifier);

	const handleIdentifierChange = async (identifier: string) => {
		if (identifier.length < 4) {
			surveyUserId.set(null);
			return;
		}

		var user = await userRepository.getByIdentifier(identifier);

		if (user == null) {
			surveyUserId.set(null);
			return;
		}

		surveyUserId.set(user.id);
		surveyUserData.set({
			identifier: user.identifier,
			age: user.age,
			experience: user.experience,
			gender: user.gender
		});
		surveyCurrentType.set(user.startedWith);
	};

	const handleNextSlide = () => {
		switchCurrentType();
		surveyState.set(SurveyState.FirstPhase);

		if ($surveyAllowValidations) {
			gazeValidation.set(true);
		}
	};

	$: selectedGender = $surveyUserData.identifier
		? {
				value: $surveyUserData.gender,
				label: genders[$surveyUserData.gender as 'male' | 'female' | 'other']
			}
		: undefined;
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-1">
			<small class="font-medium text-gray-700">Váš identifikátor</small>
			<Input type="text" placeholder="Identifikátor" bind:value={identifier} />
		</div>

		{#if $surveyUserId == null && identifier.length > 0}
			<Alert.Root variant="destructive">
				<Icon icon="ic:round-warning-amber" class="mr-2 h-4 w-4" />
				<Alert.Title>Uživatel nebyl nalezen!</Alert.Title>
				<Alert.Description>
					K zadanému identifikátoru nebyl nalezen žádný uživatel. Zkontrolujte zadaný identifikátor
					a zkuste to znovu.
				</Alert.Description>
			</Alert.Root>
		{/if}

		{#if $surveyUserId != null}
			<div class="flex flex-col gap-1">
				<small class="font-medium text-gray-700">Jaký je Vás věk?</small>
				<Input
					disabled
					type="number"
					placeholder="Věk"
					min="0"
					max="99"
					bind:value={$surveyUserData.age}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<small class="font-medium text-gray-700">Jaký je Váš gender?</small>
				<Select.Root disabled selected={selectedGender}>
					<Select.Trigger>
						<Select.Value placeholder="Vyberte gender" />
					</Select.Trigger>

					<Select.Content>
						{#each Object.entries(genders) as [key, value]}
							<Select.Item value={key} label={value}>{value}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-1">
				<small class="font-medium text-gray-700">Jaká je Vaše zkušenost s PC?</small>
				<Select.Root
					disabled
					selected={{ value: $surveyUserData.experience, label: $surveyUserData.experience }}
				>
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
		{/if}
	</div>

	<div class="flex items-center justify-end">
		{#if $gazeState == GazeState.CONNECTED}
			<Button on:click={handleNextSlide} disabled={$surveyUserId == null}>Spustit dotazník</Button>
		{/if}
	</div>
</div>
