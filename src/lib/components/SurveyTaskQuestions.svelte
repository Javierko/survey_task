<script lang="ts">
import QUESTIONS from "$lib/data/questions.json";
import {
	surveyFinished,
	surveyQuestion,
	surveySlide,
	surveyUserId,
} from "$lib/stores/surveyTask";
import SurveyTaskQuestion from "./SurveyTaskQuestion.svelte";
import { getQuestionId } from "$lib/utils/questions";
import answerRepository from "$lib/database/repositories/answer.repository";
import aoiRepository from "$lib/database/repositories/aoi.repository";
import { fade } from "svelte/transition";
import clickRepository from "$lib/database/repositories/click.repository";
import { onMount } from "svelte";
import { Button } from "$lib/shadcn/ui/button";

export let headers: string[];
export let questions: {
	id: number;
	question: string;
}[];

let loadTime: number | null = null;

const initValues = () => new Array(questions.length);
const initAois = () => new Array(questions.length + 1).fill(0).map(() => []);

let values: string[] = initValues();
let aois: HTMLDivElement[][] = initAois();

// biome-ignore lint/style/noCommaOperator: <explanation>
$: questions, reset();
$: questions.length === 1 &&
	$surveyQuestion.has(questions.length) &&
	onNextSlide($surveySlide === QUESTIONS.length - 1);

function reset() {
	values = initValues();
	aois = initAois();
	loadTime = Date.now();

	surveyQuestion.set(new Set([0]));
}

async function onNextSlide(last = false) {
	for (let aoiRow of aois) {
		for (let aoi of aoiRow) {
			const aoiRect = aoi.getBoundingClientRect();

			await aoiRepository.create({
				userId: $surveyUserId as string,
				aoiId: aoi.id,
				leftBotPos: {
					x: aoiRect.left,
					y: aoiRect.bottom,
				},
				rightTopPos: {
					x: aoiRect.right,
					y: aoiRect.top,
				},
			});
		}
	}

	if (loadTime) {
		await answerRepository.create({
			userId: $surveyUserId as string,
			questionId: -1,
			answer: -1,
			timestamp: loadTime,
		});
	}

	for (let i = 0; i < questions.length; i++) {
		const question = questions[i];
		const answer = +values[i];

		const click = await clickRepository.read(
			$surveyUserId as string,
			getQuestionId($surveySlide, i, answer),
		);

		await answerRepository.create({
			userId: $surveyUserId as string,
			questionId: question.id,
			answer: answer || -1,
			timestamp: click?.timestamp || null,
		});
	}

	if (last) {
		surveyFinished.set(true);
	} else {
		surveySlide.update((slide) => slide + 1);
	}
}

onMount(() => {
	loadTime = Date.now();
});
</script>

<div class="flex items-center justify-center h-screen">
	<div class="max-w-[86rem] w-full p-4 shadow">
		{#key $surveySlide}
			<div in:fade>
				<div class="flex items-center border-b border-gray-200">
					<div
						id={getQuestionId($surveySlide, 'header', 0)}
						class="col-item col-item--title"
						bind:this={aois[0][0]}
					/>

					{#each headers as header, i}
						<div
							id={getQuestionId($surveySlide, 'header', i + 1)}
							class="col-item"
							bind:this={aois[0][i + 1]}
						>
							{header}
						</div>
					{/each}
				</div>

				<div class="flex flex-col divide-y divide-gray-200/60">
					{#each questions as question, i}
						<SurveyTaskQuestion
							question={question.question}
							rowId={i}
							totalOptions={headers.length}
							aoi={aois[i + 1]}
							bind:value={values[i]}
							disabled={!$surveyQuestion.has(i)}
						/>
					{/each}
				</div>

				<div class="flex justify-end mt-8">
					{#if $surveySlide === QUESTIONS.length - 1}
						<Button
							on:click={() => onNextSlide(true)}
							disabled={!$surveyQuestion.has(questions.length)}
						>
							Dokončit
						</Button>
					{:else}
						<Button
							on:click={() => onNextSlide(false)}
							disabled={!$surveyQuestion.has(questions.length)}
						>
							Další
						</Button>
					{/if}
				</div>
			</div>
		{/key}
	</div>
</div>
