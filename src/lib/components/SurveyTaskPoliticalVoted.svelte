<script lang="ts">
	import { Label } from '$lib/shadcn/ui/label/index.js';
	import * as Select from '$lib/shadcn/ui/select/index.js';
	import Button from '@/shadcn/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { apiPost } from '@/services/apiService';
	import { surveyManager, SurveyState, surveyUserToken } from '@/stores/surveyTask';
	import { removeFromLocalStorage } from '@/services/localStorageService';
	import { onMount } from 'svelte';
	import { errorToast } from '@/utils';

	const politicalSides = [
		{ value: '1', label: 'ANO 2011' },
		{ value: '2', label: 'SPOLU' },
		{ value: '3', label: 'Svoboda a Přímá Demokracie (SPD)' },
		{ value: '4', label: 'Motoristé sobě' },
		{ value: '5', label: 'Česká pirátská strana' },
		{ value: '6', label: 'Starostové a nezávislí' },
		{ value: '7', label: 'Stačilo!' },
		{ value: '8', label: 'PŘÍSAHA občanské hnutí' },
		{ value: '9', label: 'Ostatní' },
		{ value: '10', label: 'Nevolil/a jsem' }
	];

	let voted = $state('');
	let error = $state(false);
	let loadTime: number | null = null;
	let clicks = $state<
		{
			aoi: string;
			x: number;
			y: number;
			value: number;
			timestamp: number;
		}[]
	>([]);
	let lastPosition = $state<{ x: number; y: number } | null>(null);

	const votedContent = $derived(
		politicalSides.find((f) => f.value === voted)?.label ??
			'Koho jste volil ve volbách do poslanecké sněmovny v roce 2025?'
	);

	const handleValueChange = (value: string) => {
		clicks = [
			...clicks,
			{
				aoi: 'voted-select',
				x: lastPosition?.x || 0,
				y: lastPosition?.y || 0,
				value: +value,
				timestamp: Date.now()
			}
		];
	};

	const handleMouseMove = (e: MouseEvent) => {
		lastPosition = { x: e.clientX, y: e.clientY };
	};

	onMount(() => {
		loadTime = Date.now();
	});

	const handleSubmit = async () => {
		if (loadTime) {
			const loadTimeRes = await apiPost(
				'pageLoads',
				{
					slide: $surveyManager.slide,
					page_loaded_at: new Date(loadTime).toISOString()
				},
				$surveyUserToken
			);

			if (loadTimeRes.Status != 200) {
				errorToast(
					'Chyba při ukládání dat',
					'Nepodařilo se uložit data o načtení stránky. Kontaktujte admina.'
				);
			}
		}

		if (clicks.length > 0) {
			const clicksRes = await apiPost(
				'clicks',
				clicks.map((click) => ({
					question: 79,
					aoi: click.aoi,
					x: click.x,
					y: click.y,
					value: click.value,
					clicked_at: new Date(click.timestamp).toISOString()
				})),
				$surveyUserToken
			);

			if (clicksRes.Status != 200) {
				errorToast(
					'Chyba při ukládání dat',
					'Nepodařilo se uložit data o kliknutí. Kontaktujte admina.'
				);
			}
		}

		const lastClick = clicks.at(-1);

		if (lastClick && loadTime) {
			const answer = {
				question: 79,
				answer: lastClick.value,
				reaction: (lastClick.timestamp - loadTime) / 1000,
				answered_at: new Date(lastClick.timestamp).toISOString()
			};

			const answersRes = await apiPost('answers', [answer], $surveyUserToken);

			if (answersRes.Status != 200) {
				errorToast(
					'Chyba při ukládání dat',
					'Nepodařilo se uložit data o odpovědích. Kontaktujte admina.'
				);
			}
		}

		await apiPost(
			'participants/complete',
			{
				completed_at: new Date().toISOString()
			},
			$surveyUserToken
		);

		surveyManager.setState(SurveyState.Finished);
	};
</script>

<section class="card card--sm">
	{#if error}
		<Alert.Root variant="destructive">
			<Icon icon="material-symbols:warning-outline-rounded" class="h-5 w-5 text-red-400" />
			<Alert.Title>Nastala chyba!</Alert.Title>
			<Alert.Description>Zkontrolujte zda máte vyplněná všechny pole.</Alert.Description>
		</Alert.Root>
	{/if}

	<form class="mt-2 flex flex-col gap-4">
		<div class="5 flex w-full flex-col gap-1">
			<Label for="repre">Koho jste volil ve volbách do poslanecké sněmovny v roce 2025?</Label>

			<Select.Root
				type="single"
				name="repre"
				bind:value={voted}
				required
				onValueChange={handleValueChange}
			>
				<Select.Trigger>
					{votedContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each politicalSides as politicalSide}
							<Select.Item value={politicalSide.value} label={politicalSide.label}>
								{politicalSide.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex justify-end">
			<Button type="submit" disabled={voted === ''} onclick={handleSubmit}>Další</Button>
		</div>
	</form>
</section>

<svelte:window onmousemove={(e) => handleMouseMove(e)} />
