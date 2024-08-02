<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { gazeErrors } from '$lib/stores/gazeError';
	import Icon from '@iconify/svelte';
</script>

{#if $gazeErrors.length > 0}
	<Alert.Root variant="destructive">
		<Icon icon="lucide:alert-circle" class="mr-2 h-4 w-4" />
		<Alert.Title>Nastala chyba</Alert.Title>
		{#each $gazeErrors as message}
			<Alert.Description>{message}</Alert.Description>
		{/each}
	</Alert.Root>
{/if}
