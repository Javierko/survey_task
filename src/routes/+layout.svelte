<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/shadcn/ui/sonner';
</script>

<Toaster position="top-right" richColors duration={10000} />

<div class="flex h-screen w-full items-center justify-center">
	<slot></slot>
</div>
