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
		surveyUserIdentity,
		surveyUserToken,
		type SurveyStartedWithType
	} from '@/stores/surveyTask';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import type { PageProps } from './$types';
	import { getAgencyReturnUrl } from '@/constants';

	let loading = $state(false);
	let userFound = $state(false);

	let { data }: PageProps = $props();

	const isIdentityValid = $derived(data.id !== null && data.id.length === 10);

	onMount(() => {
		if (!isIdentityValid) {
			redirectHardScreenout();

			return;
		}

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
			surveyUserIdentity.set(user.IdentityId);
			surveyUserToken.set(user.Token);
			surveyManager.setType(user.StartedWith);
		}

		loading = false;

		if ($surveyUserToken != null) {
			surveyManager.setState(SurveyState.Started);
			goto('/survey');
		}
	};

	const createParticipant = async () => {
		if (!isIdentityValid) {
			toast.error('Chyba při vytváření uživatele', {
				description: 'Neplatná identita'
			});

			return;
		}

		const res = await apiPost<{ Token: string; StartedWith: SurveyStartedWithType }>(
			'participants',
			{
				identity_id: data.id,
				resolution_width: window.screen.width,
				resolution_height: window.screen.height,
				resolution_inner_width: window.innerWidth,
				resolution_inner_height: window.innerHeight,
				user_agent: navigator.userAgent
			}
		);

		if (res.Status == 200) {
			surveyUserIdentity.set(data.id);
			surveyUserToken.set(res.Data.Token);
			surveyManager.setType(res.Data.StartedWith);

			saveToLocalStorage(
				'user',
				{
					IdentityId: data.id,
					Token: res.Data.Token,
					StartedWith: res.Data.StartedWith
				},
				3600
			);
		} else {
			toast.error('Chyba při vytváření uživatele', {
				description: res.Message
			});

			redirectHardScreenout();
		}
	};

	const redirectHardScreenout = () => {
		setTimeout(() => {
			window.location.href = getAgencyReturnUrl('hard_screenout', data.id);
		}, 500);
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

	{#if !isIdentityValid}
		<Alert.Root variant="destructive">
			<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5" />
			<Alert.Title>Neznámá identita!</Alert.Title>
			<Alert.Description>
				Tenhle dotazník je určen pouze pro specifické uživatele. Budete přesměrováni.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<div class="flex lg:hidden">
			<Alert.Root variant="destructive">
				<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5" />
				<Alert.Title>Mobilní zařízení detekováno!</Alert.Title>
				<Alert.Description>Tenhle dotazník je určen pouze pro PC zařízení s myší.</Alert.Description
				>
			</Alert.Root>
		</div>

		<p>
			Děkujeme Vám za účast ve výzkumu, který je realizován Psychologickým ústavem Akademie věd
			České republiky. Toto je druhé kolo testování, první proběhlo na konci roku 2025. Během
			testování prosím používejte počítač s připojenou klávesnicí a počítačovou myší, protože v
			některých úkolech budeme měřit reakční dobu Vašich odpovědí. V následující části naleznete
			několik výroků týkajících se Vašich názorů, prožívání a běžného fungování. Neexistují správné
			nebo špatné odpovědi, zajímá nás Vaše vlastní vnímání. Některé otázky jsou stejné jako v
			prvním kole testování, a proto se Vám může zdát, že jste na ně již odpovídali.
		</p>

		<p>Vaše odpovědi jsou anonymní a budou využity výhradně pro výzkumné účely.</p>

		<p>
			V případě jakýchkoliv dotazů nebo nejasností se prosím obraťte na odpovědného řešitele
			projektu, Mgr. Davida Lacka, PhD., lacko@psu.cas.cz
		</p>

		<div class="mt-2 hidden w-full justify-end space-x-2 lg:flex">
			<Button onclick={() => handleContinue(userFound)}>
				{#if loading}
					<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
				{/if}

				Další
			</Button>
		</div>
	{/if}
</section>
