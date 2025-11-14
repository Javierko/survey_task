<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';
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
</section>
