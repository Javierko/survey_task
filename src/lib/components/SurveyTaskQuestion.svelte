<script lang="ts">
	import clickRepository from '$lib/database/repositories/click.repository';
	import { surveyQuestion, surveySlide, surveyUserId } from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils/questions';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';

	export let question: string;
	export let totalOptions: number;
	export let aoi: HTMLDivElement[];
	export let value: string;
	export let rowId: number;
	export let disabled: boolean;

	const options = Array(totalOptions)
		.fill(0)
		.map((_, i) => i + 1);

	const handleOptionClick = (e: CustomEvent, option: number) => {
		const mouseEvent = e.detail.originalEvent as PointerEvent;

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

		const aoiElement = (mouseEvent.target as HTMLElement)?.parentElement;

		if (!aoiElement) {
			console.warn('Unable to get AOI element from click!');
			return;
		}

		clickRepository.create({
			userId: $surveyUserId as string,
			aoiId: aoiElement.id,
			x: mouseEvent.clientX,
			y: mouseEvent.clientY,
			value: option,
			timestamp: Date.now()
		});
	};
</script>

<div class="question-row" class:question-row--disabled={disabled}>
	<div
		id={getQuestionId($surveySlide, rowId, 0)}
		class="col-item col-item--title"
		bind:this={aoi[0]}
	>
		{question}
	</div>

	<RadioGroup.Root data-orientation="horizontal" class="flex items-center gap-0" bind:value>
		{#each options as option, j}
			<div id={getQuestionId($surveySlide, rowId, j + 1)} class="col-item" bind:this={aoi[j + 1]}>
				<RadioGroup.Item
					value={option.toString()}
					on:click={(e) => handleOptionClick(e, option)}
					{disabled}
				/>
			</div>
		{/each}
	</RadioGroup.Root>
</div>
