<script lang="ts">
	import { albumsApi } from '$lib/api/albums';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import type { AlbumSearchResult, WeekWithSelections } from '$lib/api/types';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AlbumCard from '$lib/components/albums/AlbumCard.svelte';

	let query = $state('');
	let results = $state<AlbumSearchResult[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let offset = $state(0);
	let totalCount = $state(0);
	const limit = 25;

	let currentWeek = $state<WeekWithSelections | null>(null);
	let addingAlbumId = $state<string | null>(null);

	// Position selection modal
	let showPositionModal = $state(false);
	let selectedAlbum = $state<AlbumSearchResult | null>(null);

	const availablePositions = $derived(() => {
		if (!currentWeek) return [];
		const usedPositions = currentWeek.albums.map((a) => a.position);
		return ([1, 2] as const).filter((p) => !usedPositions.includes(p));
	});

	const hasMore = $derived(offset + limit < totalCount);

	async function loadCurrentWeek() {
		const response = await weeksApi.current();
		if (response.data) {
			currentWeek = response.data;
		}
	}

	async function search(resetOffset = true) {
		if (!query.trim()) return;

		if (resetOffset) {
			offset = 0;
		}

		isSearching = true;
		hasSearched = true;

		const response = await albumsApi.search(query, limit, offset);

		if (response.error) {
			if (response.error.status === 429) {
				toasts.error('Rate limited. Please wait a moment and try again.');
			} else {
				toasts.error(response.error.detail);
			}
		} else {
			if (resetOffset) {
				results = response.data!.results;
			} else {
				results = [...results, ...response.data!.results];
			}
			totalCount = response.data!.count;
		}

		isSearching = false;

		// Also load current week if not loaded
		if (!currentWeek) {
			await loadCurrentWeek();
		}
	}

	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		search(true);
	}

	function handleAlbumSelect(album: AlbumSearchResult) {
		selectedAlbum = album;

		const positions = availablePositions();
		if (positions.length === 0) {
			toasts.error('Both album slots are full. Remove an album first.');
			return;
		}

		if (positions.length === 1) {
			// Only one position available, add directly
			addAlbumToWeek(album, positions[0]);
		} else {
			// Show position selection modal
			showPositionModal = true;
		}
	}

	async function addAlbumToWeek(album: AlbumSearchResult, position: 1 | 2) {
		if (!currentWeek) return;

		addingAlbumId = album.musicbrainz_id;
		showPositionModal = false;

		const response = await weeksApi.addAlbum(currentWeek.id, {
			musicbrainz_id: album.musicbrainz_id,
			position
		});

		if (response.error) {
			if (response.error.status === 429) {
				toasts.error('Rate limited. Please wait a moment and try again.');
			} else {
				toasts.error(response.error.detail);
			}
		} else {
			toasts.success(`"${album.title}" added to position ${position}`);
			await loadCurrentWeek();
		}

		addingAlbumId = null;
		selectedAlbum = null;
	}

	async function loadMore() {
		offset += limit;
		await search(false);
	}
</script>

<svelte:head>
	<title>Add Album - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif mb-6">Add Album</h1>

	<form onsubmit={handleSearchSubmit} class="flex gap-3 mb-6">
		<Input
			name="query"
			placeholder="Search for an album..."
			bind:value={query}
			class="flex-1"
		/>
		<Button type="submit" loading={isSearching && offset === 0}>
			Search
		</Button>
	</form>

	<p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
		Note: Album search uses MusicBrainz which has rate limiting. Results may take a moment.
	</p>

	{#if isSearching && offset === 0}
		<div class="flex justify-center py-12">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"
			></div>
		</div>
	{:else if results.length > 0}
		<div class="space-y-4">
			{#each results as album (album.musicbrainz_id)}
				<AlbumCard
					{album}
					onSelect={handleAlbumSelect}
					isAdding={addingAlbumId === album.musicbrainz_id}
				/>
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center mt-6">
				<Button variant="secondary" onclick={loadMore} loading={isSearching}>
					Load More
				</Button>
			</div>
		{/if}
	{:else if hasSearched}
		<p class="text-center text-stone-500 dark:text-stone-400 py-12">
			No albums found for "{query}"
		</p>
	{:else}
		<p class="text-center text-stone-500 dark:text-stone-400 py-12">
			Enter a search term to find albums
		</p>
	{/if}
</div>

<!-- Position Selection Modal -->
{#if showPositionModal && selectedAlbum}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog">
		<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 shadow-lg p-6 max-w-sm w-full mx-4">
			<h2 class="text-lg font-semibold text-stone-800 dark:text-cream-100 font-serif mb-4">
				Select Position
			</h2>
			<p class="text-stone-600 dark:text-stone-400 mb-4">
				Add "{selectedAlbum.title}" to which position?
			</p>
			<div class="flex gap-3">
				{#each availablePositions() as position}
					<Button
						onclick={() => addAlbumToWeek(selectedAlbum!, position)}
						class="flex-1"
					>
						Position {position}
					</Button>
				{/each}
			</div>
			<Button
				variant="secondary"
				onclick={() => {
					showPositionModal = false;
					selectedAlbum = null;
				}}
				class="w-full mt-3"
			>
				Cancel
			</Button>
		</div>
	</div>
{/if}
