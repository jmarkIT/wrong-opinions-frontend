<script lang="ts">
	import { toasts } from '$lib/stores/toast';

	const typeClasses = {
		success: 'bg-sage-600 border-sage-500',
		error: 'bg-rose-600 border-rose-500',
		info: 'bg-amber-600 border-amber-500'
	};

	const typeIcons = {
		success: '✓',
		error: '✕',
		info: 'ℹ'
	};
</script>

{#if $toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
		{#each $toasts as toast (toast.id)}
			<div
				class="flex items-center gap-3 px-4 py-3 rounded-md text-white shadow-md border-l-4 min-w-64 {typeClasses[
					toast.type
				]}"
				role="alert"
			>
				<span class="text-base font-semibold">{typeIcons[toast.type]}</span>
				<span class="flex-1 text-sm">{toast.message}</span>
				<button
					onclick={() => toasts.remove(toast.id)}
					class="text-white/70 hover:text-white ml-2"
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}
