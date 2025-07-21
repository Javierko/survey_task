<script lang="ts">
	import { takeIatPictures, takeWords, type Category, type Key } from '@/utils';
	import IatTaskQuestion from './IatTaskQuestion.svelte';
	import { onMount } from 'svelte';
	import { surveyManager, SurveyState, surveyUserToken } from '@/stores/surveyTask';
	import { removeFromLocalStorage } from '@/services/localStorageService';
	import { apiPost } from '@/services/apiService';

	let currentPart = $state(1);
	let currentPartCount = $state(1);
	let currentPartOrder = $state([7, 6, 5, 4, 3, 2]);
	let isFirst = $state(true);

	onMount(() => {
		if ($surveyManager.type == 'many') {
			currentPartOrder = [7, 6, 5, 4, 3, 2, 1];
			currentPart = currentPartOrder.pop() ?? 1;
		} else {
			currentPartOrder = [4, 3, 2, 1, 7, 6, 5];
			currentPart = currentPartOrder.pop() ?? 5;
		}
	});

	const handleSlideComplete = async () => {
		let popped = currentPartOrder.pop();
		isFirst = false;

		if (popped) {
			currentPart = popped;
			currentPartCount++;
		} else {
			surveyManager.setState(SurveyState.Finished);
			removeFromLocalStorage('user');

			await apiPost(
				'participants/complete',
				{
					completed_at: new Date().toISOString()
				},
				$surveyUserToken
			);
		}
	};

	const dataset: Record<
		number,
		{
			categories: Record<
				Key,
				{
					title: string;
					category: Category;
				}
			>;
			data: Record<Category, string[]>;
		}
	> = {
		1: {
			categories: {
				e: { title: 'Černí_lidé', category: 'good' },
				i: { title: 'Bílí_lidé', category: 'bad' }
			},
			data: {
				good: takeIatPictures('black', 10),
				bad: takeIatPictures('white', 10)
			}
		},
		2: {
			categories: {
				e: { title: 'Dobré', category: 'good' },
				i: { title: 'Špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good'),
				bad: takeWords(10, 'bad')
			}
		},
		3: {
			categories: {
				e: { title: 'Černí_lidé nebo dobré', category: 'good' },
				i: { title: 'Bílí_lidé nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(5, 'good').concat(takeIatPictures('black', 5)),
				bad: takeWords(5, 'bad').concat(takeIatPictures('white', 5))
			}
		},
		4: {
			categories: {
				e: { title: 'Černí_lidé nebo dobré', category: 'good' },
				i: { title: 'Bílí_lidé nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good').concat(takeIatPictures('black', 10)),
				bad: takeWords(10, 'bad').concat(takeIatPictures('white', 10))
			}
		},
		5: {
			categories: {
				e: { title: 'Bílí_lidé', category: 'good' },
				i: { title: 'Černí_lidé', category: 'bad' }
			},
			data: {
				good: takeIatPictures('white', 10),
				bad: takeIatPictures('black', 10)
			}
		},
		6: {
			categories: {
				e: { title: 'Bílí_lidé nebo dobré', category: 'good' },
				i: { title: 'Černí_lidé nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(5, 'good').concat(takeIatPictures('white', 10)),
				bad: takeWords(5, 'bad').concat(takeIatPictures('black', 10))
			}
		},
		7: {
			categories: {
				e: { title: 'Bílí_lidé nebo dobré', category: 'good' },
				i: { title: 'Černí_lidé nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good').concat(takeIatPictures('white', 10)),
				bad: takeWords(10, 'bad').concat(takeIatPictures('black', 10))
			}
		}
	};
</script>

<IatTaskQuestion
	categories={dataset[currentPart].categories}
	data={dataset[currentPart].data}
	{currentPart}
	{currentPartCount}
	slideCompleted={handleSlideComplete}
	{isFirst}
/>
