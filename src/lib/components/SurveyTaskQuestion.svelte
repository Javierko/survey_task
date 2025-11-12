<script lang="ts">
	import { surveyManager, surveyQuestion, type SurveyOptionClick } from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';
	import Slider from '@/shadcn/ui/slider/slider.svelte';

	interface Props {
		question: string;
		range?: [number, number];
		default?: number;
		totalOptions: number;
		rowId: number;
		disabled: boolean;
		optionClick: (rowId: number, click: SurveyOptionClick) => void;
	}

	let {
		question,
		range,
		default: defaultValue,
		totalOptions,
		rowId,
		disabled,
		optionClick
	}: Props = $props();

	let sliderValue = $state(defaultValue);
	let lastPosition = $state<{ x: number; y: number } | null>(null);

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

		optionClick(rowId, {
			aoiId: aoiElement.id,
			x: e.clientX,
			y: e.clientY,
			value: option,
			timestamp: Date.now()
		});
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

		optionClick(rowId, {
			aoiId: `${getQuestionId($surveyManager.slide, rowId, 0)}-slider`,
			x: lastPosition?.x || 0,
			y: lastPosition?.y || 0,
			value: val,
			timestamp: Date.now()
		});
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
					class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 font-sans text-sm font-medium text-gray-800"
				>
					{range[0]}
				</div>

				<div
					class={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm ${disabled ? 'bg-slate-600' : 'bg-slate-800'} p-2 font-sans font-medium text-gray-100`}
				>
					{sliderValue}
				</div>

				<div
					class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 p-2 font-sans text-sm font-medium text-gray-800"
				>
					{range[1]}
				</div>
			</div>
		</div>
	{:else}
		<RadioGroup.Root data-orientation="horizontal" class="flex items-center gap-0">
			{#each options as option, j}
				<div id={getQuestionId($surveyManager.slide, rowId, j + 1)} class="col-item">
					<RadioGroup.Item
						value={option.toString()}
						onclick={(e) => handleOptionClick(e, option)}
						{disabled}
					/>
				</div>
			{/each}
		</RadioGroup.Root>
	{/if}
</div>

<svelte:window onmousemove={(e) => handleMouseMove(e)} />
