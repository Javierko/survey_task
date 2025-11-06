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
		{ value: '0', label: '0' },
		{ value: '1', label: '1' },
		{ value: '2', label: '2' },
		{ value: '3', label: '3' },
		{ value: '4', label: '4' },
		{ value: '5', label: '5' },
		{ value: '6', label: '6' },
		{ value: '7', label: '7' },
		{ value: '8', label: '8' },
		{ value: '9', label: '9' },
		{ value: '10', label: '10' }
	];

	const sides = [
		{ value: '0', label: '0 - Levice' },
		{ value: '1', label: '1' },
		{ value: '2', label: '2' },
		{ value: '3', label: '3' },
		{ value: '4', label: '4' },
		{ value: '5', label: '5' },
		{ value: '6', label: '6' },
		{ value: '7', label: '7' },
		{ value: '8', label: '8' },
		{ value: '9', label: '9' },
		{ value: '10', label: '10 - Pravice' }
	];

	let age = $state<number>();
	let gender = $state('');
	let education = $state('');
	let representation = $state('');
	let side = $state('');
	let loading = $state(false);
	let error = $state(false);

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
	const sideContent = $derived(
		sides.find((f) => f.value === side)?.label ?? 'Jaká je Vaše politická orientace?'
	);

	const handleSubmit = async () => {
		loading = true;

		const res = await apiPost(
			'participants/demographic',
			{
				age,
				gender,
				education,
				social_representation: +representation,
				political_side: +side
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
				placeholder="Kolik je Vám let?"
				min="0"
				max="99"
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

		<div class="5 flex w-full flex-col gap-1">
			<Label for="side">
				Mnoho lidí používá pojmy "levice" a "pravice", když chtějí popsat rozdílné politické názory.
				Zde máme k dispozici škálu běžící od levice k pravici. Když se zamyslíte nad Vašimi
				vlastními politickými názory, kde na této škále byste se umístil/a?
			</Label>
			<Select.Root type="single" name="side" bind:value={side} required>
				<Select.Trigger>
					{sideContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each sides as side}
							<Select.Item value={side.value} label={side.label}>{side.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
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
