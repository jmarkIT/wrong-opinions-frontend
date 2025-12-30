<script lang="ts">
	import { onMount } from 'svelte';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import type { Week } from '$lib/api/types';
	import Button from '$lib/components/ui/Button.svelte';
	import WeekCard from '$lib/components/weeks/WeekCard.svelte';

	let weeks = $state<Week[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalCount = $state(0);
	let selectedYear = $state<number | undefined>(undefined);

	const pageSize = 20;

	// Generate year options (current year and 5 years back)
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

	onMount(async () => {
		await loadWeeks();
	});

	async function loadWeeks() {
		isLoading = true;
		error = '';

		const response = await weeksApi.list(currentPage, pageSize, selectedYear);

		if (response.error) {
			error = response.error.detail;
		} else {
			weeks = response.data!.results;
			totalCount = response.data!.total;
			totalPages = Math.ceil(totalCount / pageSize);
		}

		isLoading = false;
	}

	function handleYearChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedYear = target.value ? parseInt(target.value, 10) : undefined;
		currentPage = 1;
		loadWeeks();
	}

	async function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			await loadWeeks();
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			await loadWeeks();
		}
	}
</script>

<svelte:head>
	<title>All Weeks - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif">All Weeks</h1>

		<select
			onchange={handleYearChange}
			class="px-3 py-2.5 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
		>
			<option value="">All Years</option>
			{#each yearOptions as year}
				<option value={year}>{year}</option>
			{/each}
		</select>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-12">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"
			></div>
		</div>
	{:else if error}
		<div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">
			{error}
		</div>
	{:else if weeks.length > 0}
		<p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
			{totalCount} week{totalCount === 1 ? '' : 's'} found
		</p>

		<div class="space-y-3">
			{#each weeks as week (week.id)}
				<WeekCard {week} />
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="flex justify-center items-center gap-4 mt-6">
				<Button variant="secondary" onclick={prevPage} disabled={currentPage <= 1}>
					Previous
				</Button>
				<span class="text-stone-500 dark:text-stone-400">
					Page {currentPage} of {totalPages}
				</span>
				<Button variant="secondary" onclick={nextPage} disabled={currentPage >= totalPages}>
					Next
				</Button>
			</div>
		{/if}
	{:else}
		<p class="text-center text-stone-500 dark:text-stone-400 py-12">
			No weeks found
		</p>
	{/if}
</div>
