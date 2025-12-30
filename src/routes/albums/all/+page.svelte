<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { albumsApi } from '$lib/api/albums';
	import type { AlbumWithSelections } from '$lib/api/types';
	import Button from '$lib/components/ui/Button.svelte';
	import { ALBUM_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear, formatWeekShort } from '$lib/utils/dates';

	let albums = $state<AlbumWithSelections[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalCount = $state(0);

	const pageSize = 20;

	onMount(async () => {
		await loadAlbums();
	});

	async function loadAlbums() {
		isLoading = true;
		error = '';

		const response = await albumsApi.selections(currentPage, pageSize);

		if (response.error) {
			error = response.error.detail;
		} else {
			albums = response.data!.results;
			totalCount = response.data!.total;
			totalPages = Math.ceil(totalCount / pageSize);
		}

		isLoading = false;
	}

	async function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			await loadAlbums();
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			await loadAlbums();
		}
	}
</script>

<svelte:head>
	<title>All Albums - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Albums</h1>

	{#if isLoading}
		<div class="flex justify-center py-12">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
		</div>
	{:else if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if albums.length > 0}
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
			{totalCount} album{totalCount === 1 ? '' : 's'} selected
		</p>

		<div class="space-y-4">
			{#each albums as album (album.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => goto(`/albums/${album.musicbrainz_id}`)}
					onkeydown={(e) => e.key === 'Enter' && goto(`/albums/${album.musicbrainz_id}`)}
					class="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
				>
					<img
						src={album.cover_art_url ?? ALBUM_PLACEHOLDER}
						alt={album.title}
						class="w-20 h-20 object-cover rounded flex-shrink-0"
					/>
					<div class="flex-1 min-w-0">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
							{album.title}
						</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 truncate">
							{album.artist}
							{#if album.release_date}
								<span class="text-gray-400 dark:text-gray-500">
									({extractYear(album.release_date)})
								</span>
							{/if}
						</p>
						<div class="mt-2">
							<p class="text-xs text-gray-500 dark:text-gray-500 mb-1">Selected in:</p>
							<div class="flex flex-wrap gap-1">
								{#each album.selections as selection}
									<a
										href="/weeks/{selection.week_id}"
										onclick={(e) => e.stopPropagation()}
										class="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
									>
										{formatWeekShort(selection.year, selection.week_number)}
									</a>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="flex justify-center items-center gap-4 mt-6">
				<Button variant="secondary" onclick={prevPage} disabled={currentPage <= 1}>
					Previous
				</Button>
				<span class="text-gray-600 dark:text-gray-400">
					Page {currentPage} of {totalPages}
				</span>
				<Button variant="secondary" onclick={nextPage} disabled={currentPage >= totalPages}>
					Next
				</Button>
			</div>
		{/if}
	{:else}
		<p class="text-center text-gray-600 dark:text-gray-400 py-12">
			No albums have been selected yet
		</p>
	{/if}
</div>
