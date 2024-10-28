<script lang="ts">
	import { Button } from '$lib/shadcn/ui/button';
	import { onMount } from 'svelte';

	let interval: number;
	let countdown = 60;

	onMount(() => {
		interval = setInterval(() => {
			countdown--;

			if (countdown === 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Button on:click disabled={countdown > 0}>
	{#if countdown > 0}
		Zbývá 00:{countdown.toString().padStart(2, '0')}
	{:else}
		Další
	{/if}
</Button>
