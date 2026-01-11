<script lang="ts">
	import { albumsApi } from '$lib/api/albums';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import type { AlbumSearchResult, WeekWithSelections } from '$lib/api/types';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AlbumCard from '$lib/components/albums/AlbumCard.svelte';
	import WeekPicker from '$lib/components/weeks/WeekPicker.svelte';

	let query = $state('');
	let results = $state<AlbumSearchResult[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let offset = $state(0);
	let totalCount = $state(0);
	const limit = 25;

	let selectedWeek = $state<WeekWithSelections | null>(null);
	let addingAlbumId = $state<string | null>(null);

	let selectedAlbum = $state<AlbumSearchResult | null>(null);

	// Manual lookup state
	let manualInput = $state('');
	let isLookingUp = $state(false);
	let lookupResult = $state<AlbumSearchResult | null>(null);
	let lookupError = $state<string | null>(null);

	const availablePositions = $derived(() => {
		if (!selectedWeek) return [];
		const usedPositions = selectedWeek.albums.map((a) => a.position);
		return ([1, 2] as const).filter((p) => !usedPositions.includes(p));
	});

	const hasMore = $derived(offset + limit < totalCount);

	function handleWeekChange(week: WeekWithSelections) {
		selectedWeek = week;
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

		// Always add to first available position
		addAlbumToWeek(album, positions[0]);
	}

	async function addAlbumToWeek(album: AlbumSearchResult, position: 1 | 2) {
		if (!selectedWeek) return;

		addingAlbumId = album.musicbrainz_id;

		const response = await weeksApi.addAlbum(selectedWeek.id, {
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
			// Refresh the selected week to update available positions
			const weekRes = await weeksApi.get(selectedWeek.id);
			if (weekRes.data) {
				selectedWeek = weekRes.data;
			}
			// Clear lookup result if this was a manually looked-up album
			if (lookupResult?.musicbrainz_id === album.musicbrainz_id) {
				lookupResult = null;
				manualInput = '';
			}
		}

		addingAlbumId = null;
		selectedAlbum = null;
	}

	async function loadMore() {
		offset += limit;
		await search(false);
	}

	function parseMusicBrainzId(input: string): string | null {
		const trimmed = input.trim();

		// UUID regex pattern
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

		// If it's already a UUID, return it
		if (uuidPattern.test(trimmed)) {
			return trimmed.toLowerCase();
		}

		// Try to extract UUID from MusicBrainz URL
		// Handles: https://musicbrainz.org/release/UUID and variations
		const urlMatch = trimmed.match(
			/musicbrainz\.org\/release\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
		);
		if (urlMatch) {
			return urlMatch[1].toLowerCase();
		}

		return null;
	}

	function handleLookupSubmit(e: Event) {
		e.preventDefault();
		lookupAlbum();
	}

	async function lookupAlbum() {
		if (isLookingUp) return;

		const id = parseMusicBrainzId(manualInput);
		if (!id) {
			lookupError = 'Please enter a valid MusicBrainz release ID or URL';
			return;
		}

		isLookingUp = true;
		lookupError = null;
		lookupResult = null;

		const response = await albumsApi.details(id);

		if (response.error) {
			if (response.error.status === 404) {
				lookupError = 'Album not found. Check the ID and try again.';
			} else if (response.error.status === 429) {
				lookupError = 'Rate limited. Please wait a moment and try again.';
			} else {
				lookupError = response.error.detail;
			}
		} else {
			// Convert AlbumDetails to AlbumSearchResult format
			lookupResult = {
				musicbrainz_id: response.data!.musicbrainz_id,
				title: response.data!.title,
				artist: response.data!.artist,
				release_date: response.data!.release_date,
				country: response.data!.country,
				score: 100,
				cover_art_url: response.data!.cover_art_url
			};
		}

		isLookingUp = false;
	}
</script>

<svelte:head>
	<title>Add Album - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif mb-6">Add Album</h1>

	<div class="mb-6">
		<WeekPicker
			selectedWeek={selectedWeek}
			onWeekChange={handleWeekChange}
			mediaType="albums"
		/>
	</div>

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

	<div class="border-t border-cream-200 dark:border-stone-700 pt-6 mt-2 mb-6">
		<p class="text-sm text-stone-600 dark:text-stone-400 mb-3">
			Or paste a MusicBrainz release URL or ID:
		</p>
		<form onsubmit={handleLookupSubmit} class="flex gap-3 mb-4">
			<Input
				name="manualInput"
				placeholder="e.g., e38b19cd-6599-4d41-bc4d-eb50b9b3749d"
				bind:value={manualInput}
				class="flex-1"
			/>
			<Button type="submit" variant="secondary" loading={isLookingUp}>
				Look Up
			</Button>
		</form>

		{#if lookupError}
			<p class="text-sm text-rose-600 dark:text-rose-400 mb-4">{lookupError}</p>
		{/if}

		{#if lookupResult}
			<AlbumCard
				album={lookupResult}
				onSelect={handleAlbumSelect}
				isAdding={addingAlbumId === lookupResult.musicbrainz_id}
			/>
		{/if}
	</div>

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

