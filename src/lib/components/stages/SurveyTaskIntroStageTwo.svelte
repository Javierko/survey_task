<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';
</script>

<Alert.Root>
	<Icon icon="lucide:info" class="mr-2 h-4 w-4" />
	<Alert.Title>Vítejte v pokračování dotazníkové aplikace</Alert.Title>
	<Alert.Description>
		Před spuštěním dotazníků je nutné mít <strong>spuštěný controller</strong> pro daný Eye-Tracker
		(př. GazePoint Control) a následně zapněte staženou aplikaci
		<strong>develex-bridge.exe</strong>. Poté klikněte na tlačítko
		<strong>Připojit Eye-Tracker</strong> a postupujte podle pokynů.
	</Alert.Description>
</Alert.Root>
