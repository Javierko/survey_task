<script lang="ts">
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import {
		gazeLatestConfig,
		gazeValidation,
		setupGazeInput,
		gazeManagerStore
	} from '$lib/stores/gazeInput';
	import { surveyCurrentType, surveyStage, SurveyState, surveyState, switchCurrentType } from '$lib/stores/surveyTask';
	import * as Alert from '$lib/shadcn/ui/alert/index';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	export let switchStage: boolean = true;
	export let switchType: boolean = true;
	export let switchTo: SurveyState = SurveyState.SecondPhase;

	let loading = false;

	const onContinueHandle = async (e: MouseEvent) => {
		if ($gazeLatestConfig != null && $gazeManagerStore.input == null) {
			loading = true;

			await setupGazeInput($gazeLatestConfig, e, window);

			if ($gazeManagerStore.input != null) {
				await $gazeManagerStore.start();
			}

			loading = false;
		}

		if (switchStage) {
			surveyStage.set(1);
		}

		surveyState.set(switchTo);
		gazeValidation.set(true);
	};

	onMount(() => {
		if (switchType) {
			switchCurrentType();
		}
	})
</script>

<div class="flex w-full max-w-4xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Alert.Root>
		<Icon icon="lucide:triangle-alert" class="mr-2 h-4 w-4" />
		<Alert.Title>Pozorně si přečtěte zadání</Alert.Title>
		<Alert.Description>
			<p class="mt-2">
				{#if $surveyCurrentType == "many"}
					Představte si, že se ucházíte o práci středoškolského učitele. U přijímacího pohovoru vám předloží dotazník s několika výroky o vaší osobnosti. Vaším cílem je udělat co nejlepší dojem na členy výběrové komise a zvýšit tak své šance na přijetí. Prosíme vás proto, abyste odpovídali způsobem, který podle vás ukáže, že jste ideálním kandidátem na tuto pozici.
				{:else}
					Tento dotazník obsahuje výroky o vaší osobnosti. Neexistují žádné správné nebo špatné odpovědi. Prosíme vás, abyste odpovídali co nejupřímněji a podle vašeho skutečného přesvědčení.
				{/if}
			</p>
		</Alert.Description>
	</Alert.Root>

	<div class="flex items-center justify-end gap-2">
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
