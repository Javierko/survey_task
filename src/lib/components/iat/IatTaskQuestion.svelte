<script lang="ts">
	import { apiPost } from '@/services/apiService';
	import { surveyUserToken } from '@/stores/surveyTask';
	import { shuffleArray, type Category, type Key } from '@/utils';
	import Icon from '@iconify/svelte';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';

	interface IatAnswer {
		block: number;
		trial: number;
		aoi: string;
		answer: Key;
		answer_type: 'correct' | 'incorrect';
		reaction: number;
		showed_at: string;
		answered_at: string;
	}

	interface Props {
		categories: Record<
			Key,
			{
				title: string;
				category: Category;
			}
		>;
		data: Record<Category, string[]>;
		currentPart: number;
		currentPartCount: number;
		isFirst: boolean;
		slideCompleted: () => void;
	}

	const LIMIT_IN_ROW = 3;

	let { categories, data, currentPart, currentPartCount, isFirst, slideCompleted }: Props =
		$props();
	let preparation = $state(false);
	let itemShowedAt = $state<number>(Date.now());
	let finalAnswers = $state<IatAnswer[]>([]);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'e') {
			if (!preparation) {
				return;
			}

			handleKey(event.key.toLowerCase());
		} else if (event.key === ' ') {
			preparation = true;
			itemShowedAt = Date.now();
		}
	};

	const handleKey = async (key: string) => {
		if (!currentItem) return;

		let keyCategory = categories[key as Key].category;

		if (data[keyCategory].includes(currentItem)) {
			incorrect = false;

			finalAnswers.push({
				block: currentPart,
				trial: currentItemIndex,
				aoi: `block-${currentPart}-trial-${currentItemIndex}-item-${currentItem}`,
				answer: key.toLowerCase() as Key,
				answer_type: 'correct',
				reaction: Date.now() - itemShowedAt,
				showed_at: new Date(itemShowedAt).toISOString(),
				answered_at: new Date().toISOString()
			});

			currentItemIndex++;

			if (currentItemIndex >= items.length) {
				preparation = false;

				if (finalAnswers.length > 0) {
					const answersRes = await apiPost('iat/answers', finalAnswers, $surveyUserToken);

					if (answersRes.Status != 200) {
						errorToast(
							'Chyba při ukládání dat',
							'Nepodařilo se uložit data o odpovědích. Kontaktujte admina.'
						);
					}
				}

				slideCompleted();
				currentItemIndex = 0;
			}
		} else {
			incorrect = true;
		}
	};

	let currentItemIndex = $state(0);
	let incorrect = $state(false);

	let items = $derived.by(() => {
		let currentData = shuffleArray(data.good.concat(data.bad));
		let sortedMixedData = [];

		if ([3, 4, 6, 7].includes(currentPart)) {
			const withJpg = currentData.filter((item) => item.endsWith('.jpg'));
			const withoutJpg = currentData.filter((item) => !item.endsWith('.jpg'));

			let withIndex = 0;
			let withCountInRow = 0;
			let withoutIndex = 0;
			let withoutCountInRow = 0;

			for (let i = 0; i < withJpg.length + withoutJpg.length; i++) {
				let random = Math.random() < 0.5;

				if (random && withCountInRow >= LIMIT_IN_ROW) {
					random = false;
				} else if (!random && withoutCountInRow >= LIMIT_IN_ROW) {
					random = true;
				}

				if (random && withIndex < withJpg.length) {
					sortedMixedData.push(withJpg[withIndex]);
					withIndex++;
					withCountInRow++;
					withoutCountInRow = 0;
				} else if (!random && withoutIndex < withoutJpg.length) {
					sortedMixedData.push(withoutJpg[withoutIndex]);
					withoutIndex++;
					withoutCountInRow++;
					withCountInRow = 0;
				}

				if (withIndex >= withJpg.length) {
					sortedMixedData.push(...withoutJpg.slice(withoutIndex));
					break;
				} else if (withoutIndex >= withoutJpg.length) {
					sortedMixedData.push(...withJpg.slice(withIndex));
					break;
				}
			}

			return sortedMixedData;
		}

		return currentData;
	});

	const currentItem = $derived(items[currentItemIndex]);

	$effect(() => {
		if (currentItem) {
			itemShowedAt = Date.now();
		}
	});

	const errorToast = (message: string, description: string) => {
		toast.error(message, {
			description: description
		});
	};
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col">
	<div class="flex items-center justify-between">
		{#each Object.entries(categories) as [key, value]}
			<div
				class="flex w-64 flex-col items-center gap-2 rounded-md border border-gray-300/60 p-4 shadow-sm"
			>
				<span>Zmáčkni <kbd>{key.toUpperCase()}</kbd> pro</span>

				<div class="flex flex-col items-center justify-center gap-0.5">
					{#each value.title.split(' ') as titleItem}
						{#if titleItem === 'nebo'}
							<span class="text-lg font-semibold text-gray-700">{titleItem.replace('_', ' ')}</span>
						{:else}
							<span class="text-2xl font-semibold text-green-600">
								{titleItem.replace('_', ' ')}
							</span>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div
		class="mt-32 flex items-center justify-center transition-all duration-200 ease-in-out"
		class:opacity-0={!preparation}
	>
		<div
			class:border-red-400={incorrect}
			class="relative flex w-72 flex-col items-center gap-2 rounded-md border border-gray-300/60 p-4 shadow-sm"
		>
			{#if incorrect}
				<div
					in:fade
					class="absolute inset-0 -left-4 -top-4 flex h-8 w-8 items-center justify-center rounded-full border border-red-600/30 bg-red-50 text-red-700"
				>
					<Icon icon="heroicons:x-mark" class="h-5 w-5" />
				</div>
			{/if}

			{#if currentItem && currentItem.endsWith('.jpg')}
				<img src={`/iat/${currentItem}`} alt="Current Item" class="max-h-48" />
			{:else}
				<span class="text-2xl font-semibold text-green-600">{currentItem}</span>
			{/if}
		</div>
	</div>

	<div
		class="mt-28 flex flex-col gap-4 transition-all duration-200 ease-in-out"
		class:opacity-0={preparation}
	>
		{#if isFirst && !preparation}
			<div transition:fade class="-mt-16">
				<Alert.Root>
					<Icon icon="mdi:information-slab-circle-outline" class="h-5 w-5 text-orange-400" />
					<Alert.Title>IAT</Alert.Title>

					<Alert.Description>
						<p>
							V této studii vyplníte test implicitních asociací (IAT), v němž budete vyzváni, abyste
							roztřídili obrázky a slova do skupin co nejrychleji dokážete. Vyplnění této studie by
							mělo trvat asi 10 minut. Na konci obdržíte výsledek testu IAT spolu s informacemi o
							tom, co znamená.
						</p>

						<p>
							Déle budete používat počítačové klávesy „E“ a „I“ ke kategorizaci položek do skupin co
							nejrychleji dokážete.
						</p>
					</Alert.Description>
				</Alert.Root>
			</div>
		{/if}

		<span class="text-center font-semibold">Část {currentPartCount} z 7</span>

		<div class="flex flex-col gap-0.5">
			<span>
				Dejte levý prst na klávesu <kbd>E</kbd> pro položky, které patří do kategorie:
				<span class="text-green-600">{categories.e.title.replace('_', ' ')}</span>
			</span>

			<span>
				Dejte pravý prst na klávesu <kbd>I</kbd> pro položky, které patří do kategorie:
				<span class="text-green-600">{categories.i.title.replace('_', ' ')}</span>
			</span>
		</div>

		<span>
			Pokud uděláte chybu, zobrazí se červené <span class="text-red-600">X</span>. Pro pokračování
			stiskněte druhou klávesu. Jeďte co nejrychleji a zároveň přesně.
		</span>

		<span>
			Stiskněte <kbd>mezerník</kbd>, až budete připraveni začít.
		</span>
	</div>
</div>

<svelte:window on:keydown={handleKeyDown} />

<style>
	kbd {
		@apply mx-0.5 rounded-sm bg-gray-800 px-1.5 py-0.5 text-gray-100;
	}
</style>
