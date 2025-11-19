<script lang="ts">
	import {
		surveyManager,
		surveyQuestion,
		SurveyState,
		surveyUserToken,
		type SurveyOptionClick
	} from '$lib/stores/surveyTask';
	import { errorToast, getQuestionId } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Button } from '$lib/shadcn/ui/button';
	import SurveyTaskQuestion from './SurveyTaskQuestion.svelte';
	import { apiPost } from '@/services/apiService';
	import Icon from '@iconify/svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		headers: string[];
		questions: {
			id: number;
			question: string;
			range?: [number, number];
			default?: number;
		}[];
		slides: number;
		title: string;
	}

	let { headers, questions, slides, title }: Props = $props();

	let loadTime: number | null = null;

	const initClicks = () => Array.from({ length: questions.length }, () => new Array());

	let clicks = $state<SurveyOptionClick[][]>(initClicks());
	let loading = $state(false);

	const handleNextSlide = async (last = false) => {
		loading = true;

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

		const finalAnswers = [];
		let finalClicks: {
			aoi: string;
			x: number;
			y: number;
			value: number;
			clicked_at: string;
		}[] = [];

		for (let i = 0; i < clicks.length; i++) {
			const question = questions[i];
			const questionClicks = clicks[i];

			const clicksData = questionClicks.map((click) => ({
				question: question.id,
				aoi: click.aoiId == '' ? 'unknown' : click.aoiId,
				x: click.x,
				y: click.y,
				value: click.value,
				clicked_at: new Date(click.timestamp).toISOString()
			}));

			finalClicks = finalClicks.concat(clicksData);

			const lastClick = questionClicks.slice(-1)[0];

			if (lastClick != undefined && loadTime != null) {
				const answersData = {
					question: question.id,
					answer: lastClick?.value || -1,
					reaction:
						(i == 0
							? lastClick.timestamp - loadTime
							: lastClick.timestamp - clicks[i - 1].slice(-1)[0].timestamp) / 1000,
					answered_at: new Date(lastClick.timestamp).toISOString()
				};

				finalAnswers.push(answersData);
			}
		}

		if (finalClicks.length > 0) {
			const clicksRes = await apiPost('clicks', finalClicks, $surveyUserToken);

			if (clicksRes.Status != 200) {
				errorToast(
					'Chyba při ukládání dat',
					'Nepodařilo se uložit data o kliknutí. Kontaktujte admina.'
				);
			}
		}

		if (finalAnswers.length > 0) {
			const answersRes = await apiPost('answers', finalAnswers, $surveyUserToken);

			if (answersRes.Status != 200) {
				errorToast(
					'Chyba při ukládání dat',
					'Nepodařilo se uložit data o odpovědích. Kontaktujte admina.'
				);
			}
		}

		loading = false;

		if (last) {
			if ($surveyManager.state == SurveyState.Started) {
				surveyManager.setSlide(0);
				surveyManager.setState(SurveyState.Iat);
			} else if ($surveyManager.state == SurveyState.Rest) {
				surveyManager.setSlide($surveyManager.slide + 1);
				surveyManager.setState(SurveyState.Voted);
			}
		} else {
			surveyManager.setSlide($surveyManager.slide + 1);
		}
	};

	const handleOptionClick = (rowId: number, click: SurveyOptionClick) => {
		clicks[rowId].push(click);

		const currentQuestion = questions[rowId];
		if (currentQuestion && currentQuestion.range && currentQuestion.default !== undefined) {
			return;
		}

		if (
			(questions.length === 1 && $surveyQuestion.has(questions.length)) ||
			(questions.length > 1 &&
				rowId === questions.length - 1 &&
				$surveyQuestion.has(questions.length))
		) {
			handleNextSlide($surveyManager.slide === slides - 1);
		}
	};

	const reset = () => {
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

<div class="flex h-full w-full items-center justify-center">
	<div class="w-full max-w-[108rem] px-4 py-2.5 shadow">
		{#key $surveyManager.slide}
			<div in:fade>
				{#if questions.length > 0}
					<div
						class="question-row sticky top-0 z-[999999] flex items-center overflow-hidden border-b border-gray-200 bg-white"
					>
						<div
							id={getQuestionId($surveyManager.slide, 'header', 0)}
							class="col-item col-item--title flex font-medium text-gray-700"
						>
							{title}
						</div>

						<div class="flex w-full items-center justify-end gap-0">
							{#each headers as header, i}
								<div
									id={getQuestionId($surveyManager.slide, 'header', i + 1)}
									class="col-item hyphens-auto"
									lang="cs"
								>
									{header}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex w-full items-center justify-center">
						{@html title}
					</div>
				{/if}

				<div class="flex flex-col divide-y divide-gray-200/60">
					{#each questions as question, i}
						<SurveyTaskQuestion
							question={question.question}
							range={question.range}
							default={question.default}
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
							onclick={() => handleNextSlide($surveyManager.slide === slides - 1)}
							disabled={!$surveyQuestion.has(questions.length) || loading}
						>
							{#if loading}
								<Icon icon="line-md:loading-twotone-loop" class="!h-5 !w-5 text-gray-50" />
							{/if}

							{#if $surveyManager.state === SurveyState.Rest && $surveyManager.slide === slides - 1}
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
