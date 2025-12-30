<script lang="ts">
	import { toasts } from '$lib/stores/toast';

	const typeClasses = {
		success: 'bg-green-500',
		error: 'bg-red-500',
		info: 'bg-blue-500'
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
				class="flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg min-w-72 {typeClasses[
					toast.type
				]}"
				role="alert"
			>
				<span class="text-lg font-bold">{typeIcons[toast.type]}</span>
				<span class="flex-1">{toast.message}</span>
				<button
					onclick={() => toasts.remove(toast.id)}
					class="text-white/80 hover:text-white"
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}
