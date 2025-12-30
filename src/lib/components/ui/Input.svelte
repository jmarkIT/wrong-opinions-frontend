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

<div class="space-y-1 {className}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
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
		class="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed
			{error
			? 'border-red-500 focus:ring-red-500 focus:border-red-500'
			: 'border-gray-300 dark:border-gray-600'}
			dark:bg-gray-800 dark:text-white"
	/>
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
