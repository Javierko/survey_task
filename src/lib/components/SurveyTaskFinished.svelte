<script lang="ts">
	import * as Alert from '$lib/shadcn/ui/alert/index.js';
	import Icon from '@iconify/svelte';
</script>

<section class="card">
    <Alert.Root variant="success">
        <Icon icon="clarity:success-standard-line" class="h-4 w-4 text-green-500" />
        <Alert.Title>Hotovo!</Alert.Title>
        <Alert.Description>
            Děkujeme za účast v dotazníku.
        </Alert.Description>
    </Alert.Root>
</section>