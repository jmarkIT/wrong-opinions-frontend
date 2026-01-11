<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import { getCurrentISOWeek, getWeeksInYear, formatWeekRange } from '$lib/utils/dates';
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

	// Create week state
	let isCreating = $state(false);
	let createError = $state('');
	const { year: currentISOYear, week: currentISOWeek } = getCurrentISOWeek();
	const weeksInCurrentYear = getWeeksInYear(currentISOYear);

	// Max allowed week is next week (one week into future)
	const maxAllowedWeek =
		currentISOWeek >= weeksInCurrentYear
			? { year: currentISOYear + 1, week: 1 }
			: { year: currentISOYear, week: currentISOWeek + 1 };

	// Default selection to next week
	let selectedCreateYear = $state(maxAllowedWeek.year);
	let selectedCreateWeek = $state(maxAllowedWeek.week);

	// Year options for creation (10 years back, +1 for next year edge case)
	const createYearOptions = Array.from({ length: 12 }, (_, i) => currentISOYear + 1 - i);

	// Weeks in selected year (52 or 53)
	const weeksInSelectedYear = $derived(getWeeksInYear(selectedCreateYear));
	const createWeekOptions = $derived(Array.from({ length: weeksInSelectedYear }, (_, i) => i + 1));

	// Date range preview
	const dateRangePreview = $derived(formatWeekRange(selectedCreateYear, selectedCreateWeek));

	// Validation: selected week must not exceed max allowed
	const isValidFutureWeek = $derived(
		selectedCreateYear < maxAllowedWeek.year ||
			(selectedCreateYear === maxAllowedWeek.year && selectedCreateWeek <= maxAllowedWeek.week)
	);

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

	function handleCreateYearChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedCreateYear = parseInt(target.value, 10);
		// Reset week if it exceeds the new year's weeks
		const maxWeeks = getWeeksInYear(selectedCreateYear);
		if (selectedCreateWeek > maxWeeks) {
			selectedCreateWeek = maxWeeks;
		}
		createError = '';
	}

	function handleCreateWeekChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedCreateWeek = parseInt(target.value, 10);
		createError = '';
	}

	async function handleCreateWeek() {
		if (!isValidFutureWeek) {
			createError = 'Cannot create weeks more than 1 week in the future';
			return;
		}

		isCreating = true;
		createError = '';

		const response = await weeksApi.create({
			year: selectedCreateYear,
			week_number: selectedCreateWeek
		});

		if (response.error) {
			isCreating = false;
			if (response.error.status === 409) {
				createError = 'This week already exists. Check the list below or try a different week.';
				await loadWeeks();
			} else {
				createError = response.error.detail;
			}
		} else {
			toasts.success('Week created successfully!');
			goto(`/weeks/${response.data!.id}`);
		}
	}
</script>

<svelte:head>
	<title>All Weeks - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<!-- Create Week Section -->
	<div
		class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 p-4 mb-8"
	>
		<h2 class="text-lg font-semibold text-stone-800 dark:text-cream-100 font-serif mb-4">
			Create Week
		</h2>

		<div class="space-y-4">
			<!-- Year and Week dropdowns -->
			<div class="flex gap-3">
				<div class="flex-1">
					<label
						for="create-year"
						class="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5"
					>
						Year
					</label>
					<select
						id="create-year"
						value={selectedCreateYear}
						onchange={handleCreateYearChange}
						disabled={isCreating}
						class="w-full px-3 py-2.5 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
					>
						{#each createYearOptions as year}
							<option value={year}>{year}</option>
						{/each}
					</select>
				</div>

				<div class="flex-1">
					<label
						for="create-week"
						class="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5"
					>
						Week
					</label>
					<select
						id="create-week"
						value={selectedCreateWeek}
						onchange={handleCreateWeekChange}
						disabled={isCreating}
						class="w-full px-3 py-2.5 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
					>
						{#each createWeekOptions as week}
							<option value={week}>Week {week}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Date range preview -->
			<p
				class="text-sm text-stone-500 dark:text-stone-400 bg-cream-50 dark:bg-stone-900 px-3 py-2 rounded-md"
			>
				{dateRangePreview}
			</p>

			<!-- Validation/error messages -->
			{#if !isValidFutureWeek}
				<p class="text-sm text-rose-500">Cannot create weeks more than 1 week in the future</p>
			{/if}

			{#if createError}
				<div
					class="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-3 py-2 rounded-md text-sm"
				>
					{createError}
				</div>
			{/if}

			<!-- Create button -->
			<Button onclick={handleCreateWeek} loading={isCreating} disabled={!isValidFutureWeek}>
				Create Week
			</Button>
		</div>
	</div>

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
