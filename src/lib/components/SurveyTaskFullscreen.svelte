<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let isFullscreen = false;

	const handleKeyDown = () => {
		isFullscreen = document.documentElement.clientHeight == screen.height;
	};

	onMount(() => {
		isFullscreen = document.documentElement.clientHeight == screen.height;
	});
</script>

{#if isFullscreen}
	<Alert.Root variant="success">
		<Icon icon="material-symbols:warning-outline-rounded" class="mr-2 h-4 w-4" />
		<Alert.Title>Aplikace je ve fullscreen režimu.</Alert.Title>
	</Alert.Root>
{:else}
	<Alert.Root variant="warning">
		<Icon icon="material-symbols:warning-outline-rounded" class="mr-2 h-4 w-4" />
		<Alert.Title>Aplikace <strong>není</strong> ve fullscreen režimu!</Alert.Title>
		<Alert.Description>
			Fullscreen režim zapnete pomocí klávesové zkratky <strong>F11</strong>.
		</Alert.Description>
	</Alert.Root>
{/if}

<svelte:window on:resize={handleKeyDown} />
