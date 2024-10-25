<script lang="ts">
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import { closeGazeInput, gazeInput } from '$lib/stores/gazeInput';
	import * as Alert from '$lib/shadcn/ui/alert/index';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let loading = false;

	onMount(async () => {
		await closeGazeInput();
	});
</script>

<div class="flex w-full max-w-2xl flex-col gap-4 rounded-md border border-gray-200 p-4 shadow-sm">
	<Alert.Root>
		<Icon icon="lucide:triangle-alert" class="mr-2 h-4 w-4" />
		<Alert.Title>Pauza!</Alert.Title>
		<Alert.Description>
			Momentálně jste došli do fáze, kdy je nutné přejít na druhý úkol. Zavolejte administrátora,
			aby jste mohli pokračovat.
		</Alert.Description>
	</Alert.Root>

	<!-- <div class="flex items-center justify-end gap-2">
		<a href="/stage/2" target="_blank">
			<Button disabled={loading}>
				{#if loading}
					<Icon icon="lucide:loader-circle" class="mr-2 h-4 w-4 animate-spin" />
					Připojuji k ET
				{:else}
					<Icon icon="lucide:play" class="mr-2 h-4 w-4" />
					Pokračovat
				{/if}
			</Button>
		</a>
	</div> -->
</div>
