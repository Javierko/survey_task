<script lang="ts">
	import '../app.css';
	import { Toaster } from "$lib/shadcn/ui/sonner/index.js";

	let { children } = $props();
</script>

<Toaster />

<main class="flex h-screen w-full items-center justify-center" id="app">
	{@render children()}
</main>
