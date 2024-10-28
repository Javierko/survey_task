<script lang="ts">
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
			identifier: user.identifier
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
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<div class="flex flex-col gap-2">
		<Alert.Root>
			<Icon icon="mdi:information-variant-circle-outline" class="mr-2 h-4 w-4" />
			<Alert.Description>
				V následujících otázkách se bude kromě vašich odpovědí měřit i váš reakční čas. Z toho
				důvodu není možné při odpovídání přeskakovat ani se vracet zpět, ale je nutné odpovídat na
				otázky postupně.
			</Alert.Description>
		</Alert.Root>

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
			<Alert.Root variant="success">
				<Icon icon="material-symbols:check-circle-outline-rounded" class="mr-2 h-4 w-4" />
				<Alert.Title>Uživatel úspěšně nalezen!</Alert.Title>
				<Alert.Description>
					K zadanému identifikátoru byl nalezen uživatel. Pokračujte stisknutím tlačítka níže.
				</Alert.Description>
			</Alert.Root>
		{/if}
	</div>

	<div class="flex items-center justify-end">
		{#if $gazeState == GazeState.CONNECTED}
			<Button on:click={handleNextSlide} disabled={$surveyUserId == null}>Spustit dotazník</Button>
		{/if}
	</div>
</div>
