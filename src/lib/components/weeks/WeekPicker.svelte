<script lang="ts">
	import { onMount } from 'svelte';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import { auth, currentUser } from '$lib/stores/auth';
	import { getCurrentISOWeek, getWeeksInYear, formatWeekRange } from '$lib/utils/dates';
	import type { Week, WeekWithSelections } from '$lib/api/types';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		selectedWeek: WeekWithSelections | null;
		onWeekChange: (week: WeekWithSelections) => void;
		mediaType: 'movies' | 'albums';
	}

	let { selectedWeek, onWeekChange, mediaType }: Props = $props();

	let weeks = $state<Week[]>([]);
	let isLoading = $state(true);
	let isLoadingWeek = $state(false);
	let showCreateForm = $state(false);
	let isCreating = $state(false);

	// Get current user ID
	const userId = $derived($currentUser?.id ?? null);

	// Filter weeks to only show editable ones (owned by user or unclaimed)
	const editableWeeks = $derived(
		weeks
			.filter((w) => w.user_id === null || w.user_id === userId)
			.sort((a, b) => {
				if (a.year !== b.year) return b.year - a.year;
				return b.week_number - a.week_number;
			})
	);

	// Calculate available slots for a week
	function getAvailableSlots(week: Week): number {
		// We only have basic Week info from list, not full WeekWithSelections
		// The slot info will be updated when a week is actually selected
		return 2; // Default to showing 2 available since we don't have selection data
	}

	// Week creation state
	const { year: currentISOYear, week: currentISOWeek } = getCurrentISOWeek();
	const weeksInCurrentYear = getWeeksInYear(currentISOYear);
	const maxAllowedWeek =
		currentISOWeek >= weeksInCurrentYear
			? { year: currentISOYear + 1, week: 1 }
			: { year: currentISOYear, week: currentISOWeek + 1 };

	let selectedCreateYear = $state(maxAllowedWeek.year);
	let selectedCreateWeek = $state(maxAllowedWeek.week);

	const createYearOptions = Array.from({ length: 12 }, (_, i) => currentISOYear + 1 - i);
	const weeksInSelectedYear = $derived(getWeeksInYear(selectedCreateYear));
	const createWeekOptions = $derived(Array.from({ length: weeksInSelectedYear }, (_, i) => i + 1));
	const dateRangePreview = $derived(formatWeekRange(selectedCreateYear, selectedCreateWeek));
	const isValidFutureWeek = $derived(
		selectedCreateYear < maxAllowedWeek.year ||
			(selectedCreateYear === maxAllowedWeek.year && selectedCreateWeek <= maxAllowedWeek.week)
	);

	onMount(async () => {
		await loadWeeks();
	});

	async function loadWeeks() {
		isLoading = true;
		// Load multiple pages to get a good selection of weeks
		const response = await weeksApi.list(1, 50);
		if (response.data) {
			weeks = response.data.results;
		}
		isLoading = false;

		// Auto-select current week if none selected
		if (!selectedWeek && editableWeeks.length > 0) {
			// Try to find current week
			const current = editableWeeks.find(
				(w) => w.year === currentISOYear && w.week_number === currentISOWeek
			);
			if (current) {
				await selectWeek(current.id);
			} else {
				// Select most recent editable week
				await selectWeek(editableWeeks[0].id);
			}
		}
	}

	async function selectWeek(weekId: number) {
		isLoadingWeek = true;
		const response = await weeksApi.get(weekId);
		if (response.data) {
			onWeekChange(response.data);
		}
		isLoadingWeek = false;
	}

	function handleWeekSelect(e: Event) {
		const target = e.target as HTMLSelectElement;
		const value = target.value;
		if (value === 'create') {
			showCreateForm = true;
		} else {
			showCreateForm = false;
			selectWeek(parseInt(value, 10));
		}
	}

	function handleCreateYearChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedCreateYear = parseInt(target.value, 10);
		const maxWeeks = getWeeksInYear(selectedCreateYear);
		if (selectedCreateWeek > maxWeeks) {
			selectedCreateWeek = maxWeeks;
		}
	}

	function handleCreateWeekChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedCreateWeek = parseInt(target.value, 10);
	}

	async function handleCreateWeek() {
		if (!isValidFutureWeek) {
			toasts.error('Cannot create weeks more than 1 week in the future');
			return;
		}

		isCreating = true;

		const response = await weeksApi.create({
			year: selectedCreateYear,
			week_number: selectedCreateWeek
		});

		if (response.error) {
			if (response.error.status === 409) {
				toasts.error('This week already exists');
				// Reload weeks and try to select the existing one
				await loadWeeks();
				const existing = weeks.find(
					(w) => w.year === selectedCreateYear && w.week_number === selectedCreateWeek
				);
				if (existing) {
					await selectWeek(existing.id);
				}
			} else {
				toasts.error(response.error.detail);
			}
		} else {
			toasts.success('Week created!');
			// Fetch the full week data and select it
			const weekResponse = await weeksApi.get(response.data!.id);
			if (weekResponse.data) {
				onWeekChange(weekResponse.data);
				weeks = [response.data!, ...weeks];
			}
			showCreateForm = false;
		}

		isCreating = false;
	}

	function cancelCreate() {
		showCreateForm = false;
		// Reset dropdown to selected week if there is one
	}

	// Get slot info for selected week
	const selectedSlots = $derived(() => {
		if (!selectedWeek) return { used: 0, available: 2 };
		const selections = mediaType === 'movies' ? selectedWeek.movies : selectedWeek.albums;
		const used = selections.length;
		return { used, available: 2 - used };
	});

	function formatWeekOption(week: Week): string {
		const { year: cy, week: cw } = getCurrentISOWeek();
		const isCurrent = week.year === cy && week.week_number === cw;
		const label = formatWeekRange(week.year, week.week_number);
		return isCurrent ? `${label} (current)` : label;
	}
</script>

<div class="space-y-3">
	{#if isLoading}
		<div class="flex items-center gap-2 text-stone-500 dark:text-stone-400">
			<div
				class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-amber-600 border-r-transparent"
			></div>
			<span class="text-sm">Loading weeks...</span>
		</div>
	{:else}
		<div>
			<label
				for="week-picker"
				class="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1.5"
			>
				Add to week
			</label>
			<select
				id="week-picker"
				onchange={handleWeekSelect}
				disabled={isLoadingWeek || isCreating}
				class="w-full px-3 py-2.5 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
			>
				{#each editableWeeks as week (week.id)}
					<option value={week.id} selected={selectedWeek?.id === week.id}>
						{formatWeekOption(week)}
					</option>
				{/each}
				<option value="create">+ Create new week...</option>
			</select>
		</div>

		{#if isLoadingWeek}
			<p class="text-sm text-stone-500 dark:text-stone-400">Loading week details...</p>
		{:else if selectedWeek && !showCreateForm}
			{@const slots = selectedSlots()}
			<p class="text-sm text-stone-500 dark:text-stone-400">
				{#if slots.available === 0}
					<span class="text-rose-500">No slots available</span> - remove a {mediaType === 'movies'
						? 'movie'
						: 'album'} first
				{:else if slots.available === 1}
					1 slot available
				{:else}
					2 slots available
				{/if}
			</p>
		{/if}

		{#if showCreateForm}
			<div
				class="bg-cream-50 dark:bg-stone-900 rounded-md border border-cream-200 dark:border-stone-700 p-4 space-y-3"
			>
				<div class="flex gap-3">
					<div class="flex-1">
						<label
							for="create-year"
							class="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1"
						>
							Year
						</label>
						<select
							id="create-year"
							value={selectedCreateYear}
							onchange={handleCreateYearChange}
							disabled={isCreating}
							class="w-full px-3 py-2 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 text-sm"
						>
							{#each createYearOptions as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</div>

					<div class="flex-1">
						<label
							for="create-week"
							class="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1"
						>
							Week
						</label>
						<select
							id="create-week"
							value={selectedCreateWeek}
							onchange={handleCreateWeekChange}
							disabled={isCreating}
							class="w-full px-3 py-2 border border-cream-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 text-sm"
						>
							{#each createWeekOptions as week}
								<option value={week}>Week {week}</option>
							{/each}
						</select>
					</div>
				</div>

				<p class="text-sm text-stone-500 dark:text-stone-400">{dateRangePreview}</p>

				{#if !isValidFutureWeek}
					<p class="text-sm text-rose-500">Cannot create weeks more than 1 week in the future</p>
				{/if}

				<div class="flex gap-2">
					<Button onclick={handleCreateWeek} loading={isCreating} disabled={!isValidFutureWeek}>
						Create
					</Button>
					<Button variant="secondary" onclick={cancelCreate} disabled={isCreating}>Cancel</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
