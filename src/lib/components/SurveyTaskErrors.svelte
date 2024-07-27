<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';

	export let errorMessages: string[];
</script>

{#if errorMessages.length > 0}
	<Alert.Root variant="destructive">
		<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
		<Alert.Title>Nastala chyba</Alert.Title>
		{#each errorMessages as message}
			<Alert.Description>{message}</Alert.Description>
		{/each}
	</Alert.Root>
{/if}
