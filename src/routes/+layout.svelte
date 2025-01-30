<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center" id="app">
	<main>
		{@render children()}
	</main>
</div>
