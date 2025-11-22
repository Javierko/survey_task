<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import { removeFromLocalStorage } from '@/services/localStorageService';
	import { surveyUserIdentity } from '@/stores/surveyTask';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	onMount(() => {
		const identityId = get(surveyUserIdentity);
		removeFromLocalStorage('user');

		setInterval(() => {
			window.location.href = `https://return-to.enp.world/respondent-research-status/research/40966/?status=filled&id=${identityId}`;
		}, 5000);
	});
</script>

<section class="card">
	<Alert.Root variant="success">
		<Icon icon="clarity:success-standard-line" class="h-4 w-4 text-green-500" />
		<Alert.Title>Děkujeme za Váš čas a cenné odpovědi!</Alert.Title>
		<Alert.Description>
			<p>
				Váš příspěvek pro Psychologický ústav AV ČR je klíčový pro náš výzkum a všechny Vaše
				odpovědi zůstávají zcela anonymní.
			</p>

			<p>Tímto je dotazník úspěšně dokončen. Nyní ho můžete uzavřít.</p>

			<p>V případě dotazů kontaktujte: Mgr. Davida Lacka, PhD. (lacko@psu.cas.cz).</p>
		</Alert.Description>
	</Alert.Root>

	<Alert.Root variant="warning">
		<Icon icon="material-symbols-light:warning-outline-rounded" class="h-4 w-4 text-orange-500" />
		<Alert.Title>Nezavírejte stránku!</Alert.Title>
		<Alert.Description>
			<p>Za pár sekund budete přesmerování.</p>
		</Alert.Description>
	</Alert.Root>
</section>
