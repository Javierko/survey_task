<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Participant } from '@/models/Participant';
	import { apiPost } from '@/services/apiService';
	import {
		getFromLocalStorage,
		removeFromLocalStorage,
		saveToLocalStorage
	} from '@/services/localStorageService';
	import Button from '@/shadcn/ui/button/button.svelte';
	import {
		surveyManager,
		SurveyState,
		surveyUserToken,
		type SurveyStartedWithType
	} from '@/stores/surveyTask';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';

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
			removeFromLocalStorage('surveyManager');
			await createParticipant();
		} else if (user != null) {
			surveyUserToken.set(user.Token);
			surveyManager.setType(user.StartedWith);
		}

		loading = false;

		if ($surveyUserToken != null) {
			surveyManager.setState(SurveyState.Demographic);
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
			surveyManager.setType(res.Data.StartedWith);

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
	<title>Dotazník</title>
	<meta
		name="description"
		content="Studie se zaměřuje na zpřesnění psychologického měření při zohlednění reakčních časů odpovídání na postojové škály."
	/>
</svelte:head>

<section class="card card--lg">
	<h3 class="text-lg font-semibold text-gray-800">
		Vítejte v dotazníku Psychologického ústavu Akademie věd České republiky
	</h3>

	<div class="flex lg:hidden">
		<Alert.Root variant="destructive">
			<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5" />
			<Alert.Title>Mobilní zařízení detekováno!</Alert.Title>
			<Alert.Description>Tenhle dotazník je určen pouze pro PC zařízení s myší.</Alert.Description>
		</Alert.Root>
	</div>

	<p>
		Děkujeme Vám za účast ve výzkumu, který je realizován Psychologickým ústavem Akademie věd České
		republiky. V následující části naleznete několik výroků týkajících se Vašich názorů, prožívání a
		běžného fungování. Neexistují správné nebo špatné odpovědi, zajímá nás Vaše vlastní vnímání.
	</p>

	<p>Vaše odpovědi jsou anonymní a budou využity výhradně pro výzkumné účely.</p>

	<p>
		V případě jakýchkoli dotazů nebo nejasností se prosím obraťte na odpovědného řešitele projektu,
		Mgr. Davida Lacka, PhD., lacko@psu.cas.cz
	</p>

	<div class="mt-2 hidden w-full justify-end space-x-2 lg:flex">
		<Button onclick={() => handleContinue(userFound)}>
			{#if loading}
				<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
			{/if}

			Další
		</Button>
	</div>
</section>
