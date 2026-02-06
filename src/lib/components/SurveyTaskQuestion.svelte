<script lang="ts">
	import { surveyManager, surveyQuestion, type SurveyOptionClick } from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';
	import Slider from '@/shadcn/ui/slider/slider.svelte';
	import { Input } from '@/shadcn/ui/input';

	interface Props {
		question: string;
		range?: [number, number];
		default?: number;
		unit?: string;
		totalOptions: number;
		rowId: number;
		disabled: boolean;
		optionClick: (rowId: number, click: SurveyOptionClick, isQuestionWithText: boolean) => void;
	}

	let {
		question,
		range,
		default: defaultValue,
		unit,
		totalOptions,
		rowId,
		disabled,
		optionClick
	}: Props = $props();

	let textValue = $state('');
	let sliderValue = $state(defaultValue);
	let radioValue = $state('');
	let lastPosition = $state<{ x: number; y: number } | null>(null);

	const isSpecialQuestion = question.includes(
		'některé otázky týkají nějaké etnické či národnostní menšiny'
	);

	$effect(() => {
		if (textValue.trim() === '') {
			return;
		}

		radioValue = '';

		const timer = setTimeout(() => {
			optionClick(
				rowId,
				{
					aoiId: `${getQuestionId($surveyManager.slide, rowId, totalOptions)}-text`,
					x: lastPosition?.x || 0,
					y: lastPosition?.y || 0,
					value: textValue,
					timestamp: Date.now()
				},
				isSpecialQuestion
			);
		}, 250);

		return () => clearTimeout(timer);
	});

	const options = Array(totalOptions)
		.fill(0)
		.map((_, i) => i + 1);

	const handleOptionClick = (e: MouseEvent, option: number) => {
		if ($surveyQuestion.has(rowId - 1)) {
			surveyQuestion.update((prev) => {
				prev.delete(rowId - 1);
				return prev;
			});
		}

		if (!$surveyQuestion.has(rowId + 1)) {
			surveyQuestion.update((prev) => {
				prev.add(rowId + 1);
				return prev;
			});
		}

		const aoiElement = (e.target as HTMLElement)?.parentElement;

		if (!aoiElement) {
			console.warn('Unable to get AOI element from click!');
			return;
		}

		if (isSpecialQuestion) {
			textValue = '';
		}

		optionClick(
			rowId,
			{
				aoiId: aoiElement.id,
				x: e.clientX,
				y: e.clientY,
				value: option.toString(),
				timestamp: Date.now()
			},
			isSpecialQuestion
		);
	};

	const handleSliderFinish = (val: number) => {
		if ($surveyQuestion.has(rowId - 1)) {
			surveyQuestion.update((prev) => {
				prev.delete(rowId - 1);
				return prev;
			});
		}

		if (!$surveyQuestion.has(rowId + 1)) {
			surveyQuestion.update((prev) => {
				prev.add(rowId + 1);
				return prev;
			});
		}

		optionClick(
			rowId,
			{
				aoiId: `${getQuestionId($surveyManager.slide, rowId, 0)}-slider`,
				x: lastPosition?.x || 0,
				y: lastPosition?.y || 0,
				value: val.toString(),
				timestamp: Date.now()
			},
			isSpecialQuestion
		);
	};

	const handleMouseMove = (e: MouseEvent) => {
		lastPosition = { x: e.clientX, y: e.clientY };
	};
</script>

<div class="question-row" class:question-row--disabled={disabled}>
	<div id={getQuestionId($surveyManager.slide, rowId, 0)} class="col-item col-item--title">
		{question}
	</div>

	{#if range && defaultValue !== undefined}
		<div class="flex w-full flex-col items-center gap-3 pr-2 disabled:cursor-not-allowed">
			<Slider
				class={disabled ? 'cursor-not-allowed' : ''}
				type="single"
				bind:value={sliderValue}
				min={range[0]}
				max={range[1]}
				onValueCommit={(e) => handleSliderFinish(e)}
				{disabled}
			/>

			<div class="flex w-full items-center justify-between">
				<div
					class="inline-flex h-8 items-center justify-center rounded-md bg-gray-200 px-2 font-sans text-sm font-medium text-gray-800"
				>
					{range[0]}{unit ? ` ${unit}` : ''}
				</div>

				<div
					class={`inline-flex h-8 items-center justify-center rounded-md px-2 text-sm ${disabled ? 'bg-slate-600' : 'bg-slate-800'} p-2 font-sans font-medium text-gray-100`}
				>
					{sliderValue}{unit ? ` ${unit}` : ''}
				</div>

				<div
					class="inline-flex h-8 items-center justify-center rounded-md bg-gray-200 p-2 px-2 font-sans text-sm font-medium text-gray-800"
				>
					{range[1]}{unit ? ` ${unit}` : ''}
				</div>
			</div>
		</div>
	{:else}
		<RadioGroup.Root
			bind:value={radioValue}
			data-orientation="horizontal"
			class="relative z-10 flex items-center gap-0"
		>
			{#each options as option, j}
				<div id={getQuestionId($surveyManager.slide, rowId, j + 1)} class="col-item">
					{#if j == options.length - 1 && isSpecialQuestion}
						<Input type="text" bind:value={textValue} {disabled} />
					{:else}
						<RadioGroup.Item
							value={option.toString()}
							onclick={(e) => handleOptionClick(e, option)}
							{disabled}
						/>
					{/if}
				</div>
			{/each}
		</RadioGroup.Root>
	{/if}
</div>

<svelte:window onmousemove={(e) => handleMouseMove(e)} />
