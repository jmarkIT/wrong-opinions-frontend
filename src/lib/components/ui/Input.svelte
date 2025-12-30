<script lang="ts">
	interface Props {
		type?: 'text' | 'email' | 'password' | 'search' | 'number';
		name: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		oninput?: (e: Event) => void;
	}

	let {
		type = 'text',
		name,
		label,
		placeholder = '',
		value = $bindable(''),
		error = '',
		required = false,
		disabled = false,
		class: className = '',
		oninput
	}: Props = $props();

	const inputId = $derived(`input-${name}`);
</script>

<div class="space-y-1.5 {className}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-stone-600 dark:text-stone-300">
			{label}
			{#if required}
				<span class="text-rose-500">*</span>
			{/if}
		</label>
	{/if}
	<input
		id={inputId}
		{type}
		{name}
		{placeholder}
		{required}
		{disabled}
		bind:value
		{oninput}
		class="w-full px-3.5 py-2.5 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-cream-100 disabled:cursor-not-allowed placeholder:text-stone-400
			{error
			? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
			: 'border-cream-300 dark:border-stone-600'}
			dark:bg-stone-800 dark:text-cream-100"
	/>
	{#if error}
		<p class="text-sm text-rose-500">{error}</p>
	{/if}
</div>
