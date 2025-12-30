<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { weeksApi } from '$lib/api/weeks';
	import { auth } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toast';
	import type { WeekWithSelections, WeekMovieSelection, WeekAlbumSelection } from '$lib/api/types';
	import WeekHeader from '$lib/components/weeks/WeekHeader.svelte';
	import MovieSlot from '$lib/components/movies/MovieSlot.svelte';
	import AlbumSlot from '$lib/components/albums/AlbumSlot.svelte';

	let week = $state<WeekWithSelections | null>(null);
	let isLoading = $state(true);
	let error = $state('');

	const isOwner = $derived(week ? auth.isOwner(week.user_id) : false);

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

		const response = await weeksApi.current();

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
</script>

<svelte:head>
	<title>This Week - Wrong Opinions</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if week}
		<WeekHeader
			year={week.year}
			weekNumber={week.week_number}
			ownerUsername={week.owner?.username}
			{isOwner}
		/>

		<div class="grid md:grid-cols-2 gap-6">
			<section>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Movies</h2>
				<div class="space-y-4">
					<MovieSlot
						position={1}
						selection={movie1}
						{isOwner}
						onRemove={() => removeMovie(1)}
						onAdd={goToMovieSearch}
					/>
					<MovieSlot
						position={2}
						selection={movie2}
						{isOwner}
						onRemove={() => removeMovie(2)}
						onAdd={goToMovieSearch}
					/>
				</div>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Albums</h2>
				<div class="space-y-4">
					<AlbumSlot
						position={1}
						selection={album1}
						{isOwner}
						onRemove={() => removeAlbum(1)}
						onAdd={goToAlbumSearch}
					/>
					<AlbumSlot
						position={2}
						selection={album2}
						{isOwner}
						onRemove={() => removeAlbum(2)}
						onAdd={goToAlbumSearch}
					/>
				</div>
			</section>
		</div>

		{#if week.notes}
			<section class="mt-8">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h2>
				<p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{week.notes}</p>
			</section>
		{/if}
	{/if}
</div>
