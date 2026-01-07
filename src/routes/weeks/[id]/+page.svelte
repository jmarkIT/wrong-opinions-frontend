<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { weeksApi } from '$lib/api/weeks';
	import { auth } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toast';
	import type { WeekWithSelections } from '$lib/api/types';
	import WeekHeader from '$lib/components/weeks/WeekHeader.svelte';
	import MovieSlot from '$lib/components/movies/MovieSlot.svelte';
	import AlbumSlot from '$lib/components/albums/AlbumSlot.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let week = $state<WeekWithSelections | null>(null);
	let isLoading = $state(true);
	let error = $state('');
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);

	const weekId = $derived(parseInt($page.params.id ?? '0', 10));
	const isOwner = $derived(week ? auth.isOwner(week.user_id) : false);
	const isUnclaimed = $derived(week?.user_id === null);
	// Users can edit if they own the week OR if the week is unclaimed (they'll claim it on first add)
	const canEdit = $derived(isOwner || isUnclaimed);

	const movie1 = $derived(week?.movies.find((m) => m.position === 1));
	const movie2 = $derived(week?.movies.find((m) => m.position === 2));
	const album1 = $derived(week?.albums.find((a) => a.position === 1));
	const album2 = $derived(week?.albums.find((a) => a.position === 2));

	onMount(async () => {
		await loadWeek();
	});

	async function loadWeek() {
		isLoading = true;
		error = '';

		const response = await weeksApi.get(weekId);

		if (response.error) {
			error = response.error.detail;
		} else {
			week = response.data!;
		}

		isLoading = false;
	}

	async function removeMovie(position: 1 | 2) {
		if (!week) return;

		const response = await weeksApi.removeMovie(week.id, position);

		if (response.error) {
			toasts.error(response.error.detail);
		} else {
			toasts.success('Movie removed');
			await loadWeek();
		}
	}

	async function removeAlbum(position: 1 | 2) {
		if (!week) return;

		const response = await weeksApi.removeAlbum(week.id, position);

		if (response.error) {
			toasts.error(response.error.detail);
		} else {
			toasts.success('Album removed');
			await loadWeek();
		}
	}

	function goToMovieSearch() {
		goto('/movies');
	}

	function goToAlbumSearch() {
		goto('/albums');
	}

	async function deleteWeek() {
		if (!week) return;

		isDeleting = true;
		const response = await weeksApi.delete(week.id);

		if (response.error) {
			toasts.error(response.error.detail);
			isDeleting = false;
			showDeleteConfirm = false;
		} else {
			toasts.success('Week deleted');
			goto('/weeks');
		}
	}
</script>

<svelte:head>
	<title>{week ? `Week ${week.week_number}, ${week.year}` : 'Week Details'} - Wrong Opinions</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-8">
	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"
			></div>
		</div>
	{:else if error}
		<div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md">
			{error}
		</div>
	{:else if week}
		<WeekHeader
			year={week.year}
			weekNumber={week.week_number}
			ownerUsername={week.owner?.username}
			{isOwner}
			{isUnclaimed}
		/>

		{#if isOwner}
			<div class="mb-6">
				<Button variant="danger" onclick={() => (showDeleteConfirm = true)}>
					Delete Week
				</Button>
			</div>
		{/if}

		{#if !canEdit}
			<div class="mb-6 p-3 bg-cream-100 dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400">
				This week belongs to {week.owner?.username}. You can view but not edit.
			</div>
		{/if}

		<div class="grid md:grid-cols-2 gap-6">
			<section>
				<h2 class="text-lg font-semibold text-stone-700 dark:text-cream-100 mb-4 font-serif">Movies</h2>
				<div class="space-y-4">
					<MovieSlot
						position={1}
						selection={movie1}
						isOwner={canEdit}
						onRemove={() => removeMovie(1)}
						onAdd={goToMovieSearch}
					/>
					<MovieSlot
						position={2}
						selection={movie2}
						isOwner={canEdit}
						onRemove={() => removeMovie(2)}
						onAdd={goToMovieSearch}
					/>
				</div>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-stone-700 dark:text-cream-100 mb-4 font-serif">Albums</h2>
				<div class="space-y-4">
					<AlbumSlot
						position={1}
						selection={album1}
						isOwner={canEdit}
						onRemove={() => removeAlbum(1)}
						onAdd={goToAlbumSearch}
					/>
					<AlbumSlot
						position={2}
						selection={album2}
						isOwner={canEdit}
						onRemove={() => removeAlbum(2)}
						onAdd={goToAlbumSearch}
					/>
				</div>
			</section>
		</div>

		{#if week.notes}
			<section class="mt-8">
				<h2 class="text-lg font-semibold text-stone-700 dark:text-cream-100 mb-2 font-serif">Notes</h2>
				<p class="text-stone-600 dark:text-stone-400 whitespace-pre-wrap">{week.notes}</p>
			</section>
		{/if}
	{/if}
</div>

{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-stone-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
			<h2 class="text-lg font-semibold text-stone-800 dark:text-cream-100 mb-3 font-serif">
				Delete Week?
			</h2>
			<p class="text-stone-600 dark:text-stone-400 mb-6">
				All selections will be removed and another user can claim this week.
			</p>
			<div class="flex gap-3 justify-end">
				<Button variant="secondary" onclick={() => (showDeleteConfirm = false)} disabled={isDeleting}>
					Cancel
				</Button>
				<Button variant="danger" onclick={deleteWeek} loading={isDeleting}>
					Delete
				</Button>
			</div>
		</div>
	</div>
{/if}
