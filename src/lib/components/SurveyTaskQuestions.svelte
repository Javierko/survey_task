<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import {
		surveyCurrentType,
		surveyQuestion,
		surveySlide,
		surveyStage,
		surveyState,
		SurveyState,
		type SurveyOptionClick
	} from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Button } from '$lib/shadcn/ui/button';
	// import SurveyTaskStageTwoWaitButton from './SurveyTaskStageTwoWaitButton.svelte';
	import SurveyTaskQuestion from './SurveyTaskQuestion.svelte';

	interface Props {
		headers: string[];
		questions: {
			id: number;
			question: string;
		}[];
	}

	let { headers, questions }: Props = $props();

	let loadTime: number | null = null;

	const initValues = () => new Array(questions.length).fill('');
	const initClicks = () => Array.from({ length: questions.length }, () => new Array());

	let values = $state<string[]>(initValues());
	let clicks = $state<SurveyOptionClick[][]>(initClicks());

	const handleNextSlide = (last = false) => {
		if (loadTime) {
			// await pageLoadRepository.create({
			// 	userId: $surveyUserId as string,
			// 	stage: $surveyStage,
			// 	slide: $surveySlide,
			// 	timestamp: loadTime
			// });
			// await answerRepository.create({
			// 	userId: $surveyUserId as string,
			// 	questionId: -1,
			// 	answer: -1,
			// 	timestamp: loadTime
			// });
		}

		for (let i = 0; i < clicks.length; i++) {
			const question = questions[i];
			const answer = +values[i];
			const questionClicks = clicks[i];

			// const click = await clickRepository.read(
			// 	$surveyUserId as string,
			// 	getQuestionId($surveyStage, $surveySlide, i, answer)
			// );

			// await answerRepository.create({
			// 	userId: $surveyUserId as string,
			// 	questionId: question.id,
			// 	answer: answer || -1,
			// 	timestamp: click?.timestamp || null
			// });
		}

		if (last) {
			// if ($surveyState === SurveyState.SecondPhase) {
			// 	surveyState.set(SurveyState.Finished);
			// } else if ($surveyState === SurveyState.FirstPhase) {
			// 	surveyState.set(SurveyState.PitStop);
			// 	surveySlide.set(0);
			// }
		} else {
			surveySlide.update((slide) => slide + 1);
		}
	};

	const handleOptionClick = (rowId: number, click: SurveyOptionClick) => {
		clicks[rowId].push(click);

		if (questions.length === 1 && $surveyQuestion.has(questions.length)) {
			handleNextSlide($surveySlide === QUESTIONS[$surveyCurrentType].length - 1);
		}
	};

	const reset = () => {
		values = initValues();
		clicks = initClicks();
		loadTime = Date.now();
		surveyQuestion.set(new Set([0]));
	};

	$effect.pre(() => {
		if (questions) {
			reset();
		}
	});

	onMount(() => {
		loadTime = Date.now();
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="w-full max-w-[108rem] px-4 py-2.5 shadow">
		{#key $surveySlide}
			<div in:fade>
				{#if questions.length > 0}
					<div class="question-row flex items-center border-b border-gray-200">
						<div
							id={getQuestionId($surveyStage, $surveySlide, 'header', 0)}
							class="col-item col-item--title flex font-medium text-gray-700"
						>
							{QUESTIONS[$surveyCurrentType][$surveySlide].title}
						</div>

						<div class="flex w-full items-center justify-end gap-0">
							{#each headers as header, i}
								<div
									id={getQuestionId($surveyStage, $surveySlide, 'header', i + 1)}
									class="col-item"
								>
									{header}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="flex flex-col divide-y divide-gray-200/60">
					{#each questions as question, i}
						<SurveyTaskQuestion
							question={question.question}
							rowId={i}
							totalOptions={headers.length}
							bind:value={values[i]}
							disabled={!$surveyQuestion.has(i)}
							optionClick={handleOptionClick}
						/>
					{/each}
				</div>

				<div
					class={`mt-4 flex ${questions.length > 0 ? 'justify-end' : 'flex-col items-center justify-center gap-4'}`}
				>
					{#if questions.length === 0}
						{#if $surveyStage === 2}
							<span
								>Nyní prosím jednu minutu odpočívejte, poté bude možné pokračovat kliknutím na
								tlačítko <strong>Další</strong>.</span
							>
						{:else}
							<span>Pro pokračování klikněte na tlačítko <strong>Další</strong>.</span>
						{/if}
					{/if}

					<div>
						{#if $surveySlide === QUESTIONS[$surveyCurrentType].length - 1}
							<Button
								onclick={() => handleNextSlide(true)}
								disabled={!$surveyQuestion.has(questions.length)}
							>
								<!-- {#if $surveyState === SurveyState.SecondPhase}
									Dokončit
								{:else}
									Další
								{/if} -->
								asd
							</Button>
						{:else if questions.length === 0 && $surveyStage == 2}
							<!-- <SurveyTaskStageTwoWaitButton on:click={() => onNextSlide(false)} /> -->
						{:else}
							<Button
								onclick={() => handleNextSlide(false)}
								disabled={!$surveyQuestion.has(questions.length)}
							>
								Další
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/key}
	</div>
</div>
