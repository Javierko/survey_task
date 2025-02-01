<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Participant } from '@/models/Participant';
	import { apiPost } from '@/services/apiService';
	import { getFromLocalStorage, saveToLocalStorage } from '@/services/localStorageService';
	import * as Alert from '@/shadcn/ui/alert/index';
	import Button from '@/shadcn/ui/button/button.svelte';
	import {
		surveyCurrentType,
		SurveyState,
		surveyState,
		surveyUserToken,
		type SurveyStartedWithType
	} from '@/stores/surveyTask';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let loading = $state(false);
	let userFound = $state(false);

	onMount(() => {
		const user = getFromLocalStorage<Participant>('user');
		userFound = user !== null;
	});

	const handleContinue = async (createNew: boolean) => {
		loading = true;

		const user = getFromLocalStorage<Participant>('user');

		if (user == null || createNew) {
			await createParticipant();
		} else if (user != null) {
			surveyUserToken.set(user.Token);
			surveyCurrentType.set(user.StartedWith);
		}

		loading = false;

		if ($surveyUserToken != null) {
			surveyState.set(SurveyState.Started);
			goto('/survey');
		}
	};

	const createParticipant = async () => {
		const res = await apiPost<{ Token: string; StartedWith: SurveyStartedWithType }>(
			'participants',
			{
				resolution_width: window.screen.width,
				resolution_height: window.screen.height,
				resolution_inner_width: window.innerWidth,
				resolution_inner_height: window.innerHeight,
				user_agent: navigator.userAgent
			}
		);

		if (res.Status == 200) {
			surveyUserToken.set(res.Data.Token);
			surveyCurrentType.set(res.Data.StartedWith);

			saveToLocalStorage(
				'user',
				{
					Token: res.Data.Token,
					StartedWith: res.Data.StartedWith
				},
				3600
			);
		} else {
			toast.error('Chyba při vytváření uživatele', {
				description: res.Message
			});
		}
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="card">
	<Alert.Root>
		<Icon icon="lucide:info" class="mr-2 h-4 w-4" />
		<Alert.Title>Vítejte v dotazníku!</Alert.Title>
		<Alert.Description>Kliknutím na tlačítko pokračovat aplikaci spustíte!</Alert.Description>
	</Alert.Root>

	<div class="flex w-full justify-end space-x-2">
		{#if userFound}
			<Button onclick={() => handleContinue(true)} variant="secondary">
				{#if loading}
					<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-800" />
				{/if}

				Pokračovat jako nový participant
			</Button>
		{/if}

		<Button onclick={() => handleContinue(false)}>
			{#if loading}
				<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
			{/if}

			Pokračovat
		</Button>
	</div>
</section>
