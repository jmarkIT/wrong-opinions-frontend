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
		'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
		secondary:
			'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
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
