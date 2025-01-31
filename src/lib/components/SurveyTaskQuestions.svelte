<script lang="ts">
	import QUESTIONS from '$lib/data/questions.json';
	import {
		surveyCurrentType,
		surveyQuestion,
		surveySlide,
		surveyStage,
		surveyState,
		SurveyState,
		surveyUserToken,
		switchCurrentType,
		type SurveyOptionClick
	} from '$lib/stores/surveyTask';
	import { getQuestionId } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Button } from '$lib/shadcn/ui/button';
	import SurveyTaskQuestion from './SurveyTaskQuestion.svelte';
	import { apiPost } from '@/services/apiService';
	import Icon from '@iconify/svelte';
	import { removeFromLocalStorage } from '@/services/localStorageService';
	import {toast} from "svelte-sonner";

	interface Props {
		headers: string[];
		questions: {
			id: number;
			question: string;
		}[];
	}

	let { headers, questions }: Props = $props();

	let loadTime: number | null = null;

	const initClicks = () => Array.from({ length: questions.length }, () => new Array());

	let clicks = $state<SurveyOptionClick[][]>(initClicks());
	let loading = $state(false);

	const handleNextSlide = async (last = false) => {
		loading = true;

		if (loadTime) {
			const loadTimeRes = await apiPost('pageLoads', {
				slide: $surveySlide,
				stage: $surveyStage,
				page_loaded_at: new Date(loadTime).toISOString()
			}, $surveyUserToken);

			if (loadTimeRes.Status != 200) {
				errorToast("Chyba při ukládání dat", "Nepodařilo se uložit data o načtení stránky. Kontaktujte admina.");
			}
		}

		const answers = [];

		for (let i = 0; i < clicks.length; i++) {
			const question = questions[i];
			const questionClicks = clicks[i];

			const clicksData = questionClicks.map((click) => ({
				aoi: click.aoiId,
				x: click.x,
				y: click.y,
				value: click.value,
				clicked_at: new Date(click.timestamp).toISOString()
			}));

			const clicksRes = await apiPost('clicks', clicksData, $surveyUserToken);

			if (clicksRes.Status != 200) {
				errorToast("Chyba při ukládání dat", "Nepodařilo se uložit data o kliknutí. Kontaktujte admina.");
			}
			const lastClick = questionClicks.slice(-1)[0];

			if (lastClick != undefined && loadTime != null) {
				const answersData = {
					question: question.id,
					answer: lastClick?.value || -1,
					reaction: (i == 0 ? lastClick.timestamp - loadTime : lastClick.timestamp - clicks[i-1].slice(-1)[0].timestamp) / 1000,
					answered_at: new Date(lastClick.timestamp).toISOString(),
				};

				answers.push(answersData);
			}
		}

		if (answers.length > 0) {
			const answersRes = await apiPost('answers', answers, $surveyUserToken);

			if (answersRes.Status != 200) {
				errorToast("Chyba při ukládání dat", "Nepodařilo se uložit data o odpovědích. Kontaktujte admina.");
			}
		}

		loading = false;

		if (last) {
			if ($surveyState == SurveyState.TypeSwitched) {
				surveyState.set(SurveyState.Finished);
				removeFromLocalStorage("user");

				await apiPost('participants/complete', {
					completed_at: new Date().toISOString()
				}, $surveyUserToken);
			} else if ($surveyState == SurveyState.Started) {
				surveyState.set(SurveyState.TypeSwitched);
				surveySlide.set(0);
				switchCurrentType();
			}
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
		clicks = initClicks();
		loadTime = Date.now();
		surveyQuestion.set(new Set([0]));
	};

	const errorToast = (message: string, description: string) => {
		toast.error(message, {
			description: description,
		});
	}

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
							disabled={!$surveyQuestion.has(i)}
							optionClick={handleOptionClick}
						/>
					{/each}
				</div>

				<div
					class={`mt-4 flex ${questions.length > 0 ? 'justify-end' : 'flex-col items-center justify-center gap-4'}`}
				>
					<div>
						<Button
							onclick={() => handleNextSlide($surveySlide === QUESTIONS[$surveyCurrentType].length - 1)}
							disabled={!$surveyQuestion.has(questions.length) || loading}
						>
							{#if loading}
								<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
							{/if}

							{#if $surveyState === SurveyState.TypeSwitched && $surveySlide === QUESTIONS[$surveyCurrentType].length - 1}
								Dokončit
							{:else}
								Další
							{/if}
						</Button>
					</div>
				</div>
			</div>
		{/key}
	</div>
</div>
