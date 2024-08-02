<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/shadcn/ui/button';
	import DataTable from './data-table.svelte';
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div
		class="flex w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-md border border-gray-200 px-4 pt-4"
	>
		<div class="flex w-full items-center justify-end">
			<Button variant="outline" on:click={() => goto('/')}>Zpět na dotazníky</Button>
		</div>

		<DataTable />
	</div>
</div>
