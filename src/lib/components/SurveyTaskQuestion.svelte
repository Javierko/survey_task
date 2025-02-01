<script lang="ts">
	import {
		surveyQuestion,
		surveySlide,
		surveyStage,
		type SurveyOptionClick
	} from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';

	interface Props {
		question: string;
		totalOptions: number;
		rowId: number;
		disabled: boolean;
		optionClick: (rowId: number, click: SurveyOptionClick) => void;
	}

	let { question, totalOptions, rowId, disabled, optionClick }: Props = $props();

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
</script>

<div class="question-row" class:question-row--disabled={disabled}>
	<div id={getQuestionId($surveyStage, $surveySlide, rowId, 0)} class="col-item col-item--title">
		{question}
	</div>

	<RadioGroup.Root data-orientation="horizontal" class="flex items-center gap-0">
		{#each options as option, j}
			<div id={getQuestionId($surveyStage, $surveySlide, rowId, j + 1)} class="col-item">
				<RadioGroup.Item
					value={option.toString()}
					onclick={(e) => handleOptionClick(e, option)}
					{disabled}
				/>
			</div>
		{/each}
	</RadioGroup.Root>
</div>
