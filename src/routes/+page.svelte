<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "@/shadcn/ui/button/button.svelte";

	const handleContinue = () => {
		goto("/survey");
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="card">
	<Button onclick={handleContinue}>Pokračovat</Button>
</section>