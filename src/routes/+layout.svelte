<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { getFromLocalStorage } from '@/services/localStorageService';

	let { children } = $props();

	onMount(async () => {
		const user = getFromLocalStorage("user");

		if (user == null) {
			
		}
	});
</script>

<div class="flex h-screen w-full items-center justify-center" id="app">
	<main>
		{@render children()}
	</main>
</div>
