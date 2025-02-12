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

	const consent = [
		{
			title: 'O čem je tento výzkumná studie?',
			description:
				'Studie se zaměřuje na zpřesnění psychologického měření při zohlednění reakčních časů odpovídání na postojové škály.'
		},
		{
			title: 'Jak bude účast probíhat?',
			description:
				'Studie probíhá online. Prosíme, abyste dotazník vyplňovali v soukromí, na počítači s dostatečně velkým monitorem (min. fullHD rozlišení) a s připojenou počítačovou myší. Celkově bude studie trvat přibližně 15 minut.  '
		},
		{
			title: 'Co brání účasti v tomto výzkumu? ',
			description:
				'V rámci studie chceme sbírat data pouze od studentů vysokých škol (mimo obor psychologie).'
		},
		{
			title: 'Jaké jsou výhody/odměny za účast v tomto výzkumu? ',
			description:
				'S účastí ve studii není spojena žádná finanční odměna. Nicméně zapojením do výzkumu přispějete k rozvoji vědeckého poznání a vývoji nových metod měření reakčních časů, což může být pro vás obohacující a zajímavá zkušenost.'
		},
		{
			title: 'Jaké jsou nevýhody/rizika účasti v tomto výzkumu? ',
			description:
				'S účastí ve studii nejsou spojena žádná významná rizika přesahující běžnou práci na počítači. '
		},
		{
			title: 'Jaké osobní údaje jsou v tomto výzkumném projektu sbírány?',
			description:
				'Základní demografické údaje (věk, pohlaví), odpovědi z dotazníků, reakční časy odpovídání.'
		},
		{
			title: 'Jak budou osobní údaje zpracovávány?',
			description:
				'Získané údaje budou zcela anonymizovány a nebude možné je spojit s Vaší IP adresou, která se neukládá. K získaným zaheslovaným údajům bude mít přístup hlavní řešitel projektu a členové výzkumného týmu a budou bezpečně uloženy na zabezpečeném úložišti na PSU AV ČR. Data, která během procedury od Vás získáme, budou bez propojení s Vašimi identifikačními údaji sdílena k dalšímu využití s vědeckou komunitou. '
		},
		{
			title: 'Je účast v tomto výzkumu povinná?',
			description:
				'Účast na výzkumu je zcela dobrovolná a máte právo odstoupit z výzkumu bez udání důvodu.'
		},
		{
			title: 'Kde se dozvědět více?',
			description:
				'Pokud máte jakékoliv doplňující dotazy ohledně tohoto výzkumu, můžete se obrátit na Davida Lacka, PSU AV ČR, Veveří 97, 602 00 Brno, email: lacko@psu.cas.cz. Pokud jste si přečetli výše uvedené informace a souhlasíte s účastí zaškrtněte prosím příslušné políčko níže a můžete začít.'
		}
	];
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
		Souhlas s účastí ve výzkumu a zpracováním osobních údajů
	</h3>

	<div class="flex lg:hidden">
		<Alert.Root variant="destructive">
			<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5" />
			<Alert.Title>Mobilní zařízení detekováno!</Alert.Title>
			<Alert.Description>Tenhle dotazník je určen pouze pro PC zařízení s myší.</Alert.Description>
		</Alert.Root>
	</div>

	{#each consent as item}
		<div class="flex flex-col gap-1">
			<h4 class="font-semibold text-gray-800">{item.title}</h4>
			<p class="text-gray-600">
				{item.description}
			</p>
		</div>
	{/each}

	<div class="mt-2 hidden w-full justify-end space-x-2 lg:flex">
		<Button onclick={() => goto('completed')} variant="destructive">
			Ne, nesouhlasím s účástí
		</Button>

		<Button onclick={() => handleContinue(userFound)}>
			{#if loading}
				<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
			{/if}

			Ano, souhlasím s účástí
		</Button>
	</div>
</section>
