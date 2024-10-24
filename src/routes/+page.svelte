<script>
	import { goto } from '$app/navigation';
	import { Button } from '$lib/shadcn/ui/button';
</script>

<!-- <SurveyTask /> -->

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<div class="flex items-center justify-end">
		<Button variant="outline" on:click={() => goto('/survey-data')}>Všechna data</Button>
	</div>

	<div class="flex items-center justify-center gap-2">
		<Button on:click={() => goto('/stage/1')}>Stage 1</Button>
		<Button on:click={() => goto('/stage/2')}>Stage 2</Button>
	</div>
</div>
