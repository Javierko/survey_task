<script lang="ts">
	import { Input } from '$lib/shadcn/ui/input/index.js';
	import { Label } from '$lib/shadcn/ui/label/index.js';
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import Button from '@/shadcn/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { apiPost } from '@/services/apiService';
	import { surveyManager, SurveyState, surveyUserToken } from '@/stores/surveyTask';
	import { goto } from '$app/navigation';
	import { Slider } from 'bits-ui';
	import { get } from 'svelte/store';
	import { removeFromLocalStorage } from '@/services/localStorageService';

	const genders = [
		{ value: 'male', label: 'Muž' },
		{ value: 'female', label: 'Žena' },
		{ value: 'other', label: 'Jiné' }
	];

	const educations = [
		{ value: 'primary', label: 'Základní' },
		{ value: 'high', label: 'Středoškolské' },
		{ value: 'college', label: 'Vysokoškolské' }
	];

	const repres = [
		{ value: '10', label: '10 - Nejvyšší stupínek' },
		{ value: '9', label: '9' },
		{ value: '8', label: '8' },
		{ value: '7', label: '7' },
		{ value: '6', label: '6' },
		{ value: '5', label: '5' },
		{ value: '4', label: '4' },
		{ value: '3', label: '3' },
		{ value: '2', label: '2' },
		{ value: '1', label: '1 - Nejnižší stupínek' }
	];

	const regions = [
		{ value: 'CZ010', label: 'Hlavní město Praha' },
		{ value: 'CZ020', label: 'Středočeský kraj' },
		{ value: 'CZ031', label: 'Jihočeský kraj' },
		{ value: 'CZ032', label: 'Plzeňský kraj' },
		{ value: 'CZ041', label: 'Karlovarský kraj' },
		{ value: 'CZ042', label: 'Ústecký kraj' },
		{ value: 'CZ051', label: 'Liberecký kraj' },
		{ value: 'CZ052', label: 'Královéhradecký kraj' },
		{ value: 'CZ053', label: 'Pardubický kraj' },
		{ value: 'CZ063', label: 'Kraj Vysočina' },
		{ value: 'CZ064', label: 'Jihomoravský kraj' },
		{ value: 'CZ071', label: 'Olomoucký kraj' },
		{ value: 'CZ072', label: 'Zlínský kraj' },
		{ value: 'CZ080', label: 'Moravskoslezský kraj' }
	];

	let age = $state<number>();
	let gender = $state('');
	let education = $state('');
	let representation = $state('');
	let region = $state('');
	let side = $state(5);
	let sideClicked = $state(false);
	let loading = $state(false);
	let error = $state<null | 'missingFields' | 'quotaFull'>(null);

	const genderContent = $derived(
		genders.find((f) => f.value === gender)?.label ?? 'Jaké je Vaše pohlaví?'
	);
	const educationContent = $derived(
		educations.find((f) => f.value === education)?.label ??
			'Jaké je Vaše nejvyšší dosažené vzdělání?'
	);
	const representationContent = $derived(
		repres.find((f) => f.value === representation)?.label ?? 'Jaká je Vaše reprezentace?'
	);
	const regionContent = $derived(
		regions.find((f) => f.value === region)?.label ?? 'Jaký je Váš region?'
	);

	const handleSubmit = async () => {
		if (
			!sideClicked ||
			gender === '' ||
			education === '' ||
			representation === '' ||
			region === ''
		) {
			error = 'missingFields';

			return;
		}

		loading = true;

		const res = await apiPost(
			'participants/demographic',
			{
				age,
				gender,
				education,
				region,
				social_representation: +representation,
				political_side: side
			},
			$surveyUserToken
		);

		if (res.Status === 200) {
			surveyManager.setState(SurveyState.Started);
			goto('/survey');
		} else {
			if ('errors' in res) {
				error = 'missingFields';
			} else if (res.Message.includes('quota exceeded')) {
				error = 'quotaFull';
				removeFromLocalStorage('user');

				window.location.href = `https://return-to.enp.world/respondent-research-status/research/40966/?status=quota_full&id=${get(surveyUserToken)}`;
			}
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
				placeholder="Kolik je Vám let?"
				min="18"
				max="65"
				bind:value={age}
				required
			/>
		</div>

		<div class="5 flex w-full flex-col gap-1">
			<Label for="gender">Jaké je Vaše pohlaví?</Label>
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
			<Label for="education">Jaké je Vaše nejvyšší dosažené vzdělání?</Label>
			<Select.Root type="single" name="education" bind:value={education} required>
				<Select.Trigger>
					{educationContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each educations as education}
							<Select.Item value={education.value} label={education.label}>
								{education.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="5 flex w-full flex-col gap-1">
			<Label for="region">Jaký je Váš region?</Label>
			<Select.Root type="single" name="region" bind:value={region} required>
				<Select.Trigger>
					{regionContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each regions as region}
							<Select.Item value={region.value} label={region.label}>
								{region.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="5 flex w-full flex-col gap-1">
			<Label for="repre">
				Představte si žebříček, který reprezentuje postavení lidí v České republice. Na nejvyšším
				stupínku jsou lidé, kteří se mají nejlépe - ti, kteří mají nejvíce peněz, nejvyšší vzdělání
				a/nebo nejprestižnější zaměstnání. Na nejnižším stupínku jsou lidé, kteří se mají nejhůře -
				ti, kteří mají nejméně peněz, nejnižší vzdělání a/nebo nejméně prestižní či žádné
				zaměstnání. Čím výše na tomto žebříčku jste, tím více se blížíte k lidem na nejvyšším
				stupínku; čím níže jste, tím více se blížíte k lidem na nejnižším stupínku. Kam na tomto
				žebříčku byste sám/sama sebe umístil/a?
			</Label>
			<Select.Root type="single" name="repre" bind:value={representation} required>
				<Select.Trigger>
					{representationContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each repres as representation}
							<Select.Item value={representation.value} label={representation.label}>
								{representation.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex w-full flex-col gap-1">
			<Label for="side">
				Mnoho lidí používá pojmy "levice" a "pravice", když chtějí popsat rozdílné politické názory.
				Zde máme k dispozici škálu běžící od levice k pravici. Když se zamyslíte nad Vašimi
				vlastními politickými názory, kde na této škále byste se umístil/a?
			</Label>
		</div>

		<div class="mt-8">
			<Slider.Root
				step={1}
				min={0}
				max={10}
				type="single"
				bind:value={side}
				class="relative flex w-full touch-none select-none items-center"
				trackPadding={2}
				onValueCommit={() => (sideClicked = true)}
			>
				{#snippet children({ tickItems, thumbItems })}
					<span
						class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-secondary"
					>
						<Slider.Range class="absolute h-full bg-primary" />
					</span>
					{#each thumbItems as { index } (index)}
						<Slider.Thumb
							{index}
							class="block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						/>
					{/each}
					{#each tickItems as { index, value } (index)}
						<Slider.Tick {index} class="z-1 h-2 w-[1px] bg-background dark:bg-background/20" />
						<Slider.TickLabel
							{index}
							class="data-bounded:text-foreground mb-5 text-sm font-medium leading-none text-muted-foreground"
							position="top"
						>
							{value}
						</Slider.TickLabel>
					{/each}
				{/snippet}
			</Slider.Root>

			<div class="mt-5 flex items-center justify-between">
				<div class="rounded-md bg-gray-300 px-2 py-1 text-center text-sm font-medium text-gray-700">
					Levice
				</div>

				<div class="rounded-md bg-gray-300 px-2 py-1 text-center text-sm font-medium text-gray-700">
					Střed
				</div>

				<div class="rounded-md bg-gray-300 px-2 py-1 text-center text-sm font-medium text-gray-700">
					Pravice
				</div>
			</div>

			{#if error === 'missingFields' && !sideClicked}
				<small class="text-red-500">Prosím zvolte svou pozici na škále.</small>
			{/if}
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
