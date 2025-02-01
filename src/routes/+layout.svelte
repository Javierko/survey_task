<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/shadcn/ui/sonner/index.js';

	let { children } = $props();
</script>

<Toaster />

<main class="flex w-full items-center justify-center py-6" id="app">
	{@render children()}
</main>
