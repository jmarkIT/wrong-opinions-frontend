<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		type = 'button',
		variant = 'primary',
		disabled = false,
		loading = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const baseClasses =
		'px-4 py-2.5 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-sm hover:shadow',
		secondary:
			'bg-cream-200 text-stone-700 hover:bg-cream-300 focus:ring-stone-400 dark:bg-stone-700 dark:text-cream-100 dark:hover:bg-stone-600',
		danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 shadow-sm hover:shadow'
	};
</script>

<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="{baseClasses} {variantClasses[variant]} {className}"
>
	{#if loading}
		<span class="inline-flex items-center gap-2">
			<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
					fill="none"
				/>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			{@render children()}
		</span>
	{:else}
		{@render children()}
	{/if}
</button>
