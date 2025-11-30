<script lang="ts">
	import { takeIatPictures, takeWords, type Category, type Key } from '@/utils';
	import IatTaskQuestion from './IatTaskQuestion.svelte';
	import { onMount } from 'svelte';
	import { surveyManager, SurveyState } from '@/stores/surveyTask';

	let currentPart = $state(1);
	let currentPartCount = $state(1);
	let currentPartOrder = $state([7, 6, 5, 4, 3, 2]);
	let isFirst = $state(true);

	onMount(() => {
		if ($surveyManager.type == 'many') {
			currentPartOrder = [7, 6, 5, 4, 3, 2, 1];
			currentPart = currentPartOrder.pop() ?? 1;
		} else {
			currentPartOrder = [4, 3, 1, 7, 6, 2, 5];
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
			surveyManager.setSlide(0);
			surveyManager.setState(SurveyState.Rest);
		}
	};

	const handleSkipIat = async () => {
		surveyManager.setSlide(0);
		surveyManager.setState(SurveyState.Rest);
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
			info: string;
		}
	> = {
		1: {
			categories: {
				e: { title: 'Lidé_černé_pleti', category: 'good' },
				i: { title: 'Lidé_bílé_pleti', category: 'bad' }
			},
			data: {
				good: takeIatPictures('black', 10),
				bad: takeIatPictures('white', 10)
			},
			info: 'V této části budete třídít zobrazované položky pomocí kláves „E“ pro Lidé černé pleti a „I“ pro Lidé bílé pleti. Postupujte prosím co nejrychleji a zároveň co nejpřesněji.'
		},
		2: {
			categories: {
				e: { title: 'Dobré', category: 'good' },
				i: { title: 'Špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good'),
				bad: takeWords(10, 'bad')
			},
			info: 'V této části budete třídít slova pomocí kláves „E“ pro Dobré a „I“ pro Špatné. Snažte se reagovat co nejrychleji a zároveň co nejpřesněji.'
		},
		3: {
			categories: {
				e: { title: 'Lidé_černé_pleti nebo dobré', category: 'good' },
				i: { title: 'Lidé_bílé_pleti nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(5, 'good').concat(takeIatPictures('black', 5)),
				bad: takeWords(5, 'bad').concat(takeIatPictures('white', 5))
			},
			info: 'V této části budete třídít položky pomocí kláves „E“ pro Lidé černé pleti nebo dobré a „I“ pro Lidé bílé pleti nebo špatné. Postupujte prosím co nejrychleji a zároveň co nejpřesněji.'
		},
		4: {
			categories: {
				e: { title: 'Lidé_černé_pleti nebo dobré', category: 'good' },
				i: { title: 'Lidé_bílé_pleti nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good').concat(takeIatPictures('black', 10)),
				bad: takeWords(10, 'bad').concat(takeIatPictures('white', 10))
			},
			info: 'V této části budete třídít položky pomocí kláves „E“ pro Lidé černé pleti nebo dobré a „I“ pro Lidé bílé pleti nebo špatné. Snažte se reagovat co nejrychleji a zároveň udržet maximální přesnost.'
		},
		5: {
			categories: {
				e: { title: 'Lidé_bílé_pleti', category: 'good' },
				i: { title: 'Lidé_černé_pleti', category: 'bad' }
			},
			data: {
				good: takeIatPictures('white', 10),
				bad: takeIatPictures('black', 10)
			},
			info: 'V následující části budete pomocí kláves „E“ pro Lidé bílé pleti a „I“ pro Lidé černé pleti třídít zobrazované obrázky do správných kategorií. Postupujte prosím co nejrychleji a zároveň co nejpřesněji'
		},
		6: {
			categories: {
				e: { title: 'Lidé_bílé_pleti nebo dobré', category: 'good' },
				i: { title: 'Lidé_černé_pleti nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(5, 'good').concat(takeIatPictures('white', 10)),
				bad: takeWords(5, 'bad').concat(takeIatPictures('black', 10))
			},
			info: 'V této části budete pomocí kláves „E“ pro Lidé bílé pleti nebo dobré a „I“ pro Lidé černé pleti nebo špatné třídít zobrazované položky do odpovídajících kategorií. Postupujte prosím co nejrychleji a zároveň co nejpřesněji.'
		},
		7: {
			categories: {
				e: { title: 'Lidé_bílé_pleti nebo dobré', category: 'good' },
				i: { title: 'Lidé_černé_pleti nebo špatné', category: 'bad' }
			},
			data: {
				good: takeWords(10, 'good').concat(takeIatPictures('white', 10)),
				bad: takeWords(10, 'bad').concat(takeIatPictures('black', 10))
			},
			info: 'V této části budete opět třídít položky pomocí kláves „E“ pro Lidé bílé pleti nebo dobré a „I“ pro Lidé černé pleti nebo špatné. Snažte se postupovat co nejrychleji a zároveň s maximální přesností.'
		}
	};
</script>

<IatTaskQuestion
	categories={dataset[currentPart].categories}
	data={dataset[currentPart].data}
	info={dataset[currentPart].info}
	{currentPart}
	{currentPartCount}
	slideCompleted={handleSlideComplete}
	skipIat={handleSkipIat}
	{isFirst}
/>
