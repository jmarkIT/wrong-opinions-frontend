<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { albumsApi } from '$lib/api/albums';
	import { weeksApi } from '$lib/api/weeks';
	import type { AlbumDetails, AlbumCredits, Artist, WeekWithSelections } from '$lib/api/types';
	import { ALBUM_PLACEHOLDER } from '$lib/utils/images';
	import { formatReleaseDate } from '$lib/utils/dates';
	import { toasts } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import WeekPicker from '$lib/components/weeks/WeekPicker.svelte';

	let album = $state<AlbumDetails | null>(null);
	let credits = $state<AlbumCredits | null>(null);
	let selectedWeek = $state<WeekWithSelections | null>(null);
	let isLoading = $state(true);
	let isAdding = $state(false);
	let error = $state('');

	function formatArtistCredits(artists: Artist[] | undefined): string {
		if (!artists || artists.length === 0) return '';
		return artists
			.slice()
			.sort((a, b) => a.order - b.order)
			.map((artist, i, arr) => artist.name + (artist.join_phrase || (i < arr.length - 1 ? ', ' : '')))
			.join('');
	}

	const musicbrainzId = $derived($page.params.musicbrainzId ?? '');

	// Deduplicate artists by musicbrainz_id (API may return same artist multiple times for different roles)
	const uniqueArtists = $derived(
		credits?.artists
			? [...new Map(credits.artists.map((a) => [a.musicbrainz_id, a])).values()]
			: []
	);

	const availablePositions = $derived(() => {
		if (!selectedWeek) return [];
		const usedPositions = selectedWeek.albums.map((a) => a.position);
		return ([1, 2] as const).filter((p) => !usedPositions.includes(p));
	});

	function handleWeekChange(week: WeekWithSelections) {
		selectedWeek = week;
	}

	onMount(async () => {
		await loadAlbum();
	});

	async function loadAlbum() {
		isLoading = true;
		error = '';

		if (!musicbrainzId) {
			error = 'Invalid album ID';
			isLoading = false;
			return;
		}

		const [albumRes, creditsRes] = await Promise.all([
			albumsApi.details(musicbrainzId),
			albumsApi.credits(musicbrainzId, 10)
		]);

		if (albumRes.error) {
			error = albumRes.error.detail;
		} else {
			album = albumRes.data!;
		}

		if (creditsRes.data) {
			credits = creditsRes.data;
		}

		isLoading = false;
	}

	async function addToWeek() {
		if (!album || !selectedWeek) return;

		const positions = availablePositions();
		if (positions.length === 0) {
			toasts.error('Both album slots are full. Remove an album first.');
			return;
		}

		isAdding = true;

		const response = await weeksApi.addAlbum(selectedWeek.id, {
			musicbrainz_id: album.musicbrainz_id,
			position: positions[0]
		});

		if (response.error) {
			if (response.error.status === 429) {
				toasts.error('Rate limited. Please wait a moment and try again.');
			} else {
				toasts.error(response.error.detail);
			}
		} else {
			toasts.success(`"${album.title}" added to position ${positions[0]}`);
			// Refresh week data to update button state
			const weekRes = await weeksApi.get(selectedWeek.id);
			if (weekRes.data) {
				selectedWeek = weekRes.data;
			}
		}

		isAdding = false;
	}
</script>

<svelte:head>
	<title>{album?.title || 'Album Details'} - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
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
	{:else if album}
		<div class="flex flex-col md:flex-row gap-8">
			<!-- Cover Art -->
			<div class="shrink-0">
				<img
					src={album.cover_art_url || ALBUM_PLACEHOLDER}
					alt={album.title}
					class="w-64 h-64 object-cover rounded-md shadow-lg mx-auto md:mx-0"
					onerror={(e) => { (e.currentTarget as HTMLImageElement).src = ALBUM_PLACEHOLDER; }}
				/>
			</div>

			<!-- Info -->
			<div class="flex-1">
				<h1 class="text-3xl font-bold text-stone-800 dark:text-cream-100 font-serif">
					{album.title}
				</h1>

				<p class="text-xl text-stone-600 dark:text-stone-400 mt-2">
					{album.artist || formatArtistCredits(credits?.artists) || 'Unknown Artist'}
				</p>

				<div class="flex flex-wrap gap-4 mt-4 text-sm text-stone-500 dark:text-stone-400">
					{#if album.release_date}
						<span>{formatReleaseDate(album.release_date)}</span>
					{/if}
					{#if album.country}
						<span>{album.country}</span>
					{/if}
					{#if album.status}
						<span>{album.status}</span>
					{/if}
				</div>

				<a
					href="https://musicbrainz.org/release/{album.musicbrainz_id}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-block mt-6 text-amber-700 dark:text-amber-500 hover:underline"
				>
					View on MusicBrainz →
				</a>

				<div class="mt-6">
					<WeekPicker
						selectedWeek={selectedWeek}
						onWeekChange={handleWeekChange}
						mediaType="albums"
					/>

					{#if selectedWeek}
						{@const positions = availablePositions()}
						{#if positions.length > 0}
							<div class="mt-4">
								<Button onclick={addToWeek} loading={isAdding}>
									Add to Week
								</Button>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>

		<!-- Artists -->
		{#if uniqueArtists.length > 0}
			<section class="mt-12">
				<h2 class="text-xl font-semibold text-stone-800 dark:text-cream-100 font-serif mb-4">Artists</h2>
				<div class="space-y-3">
					{#each uniqueArtists as artist}
						<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 p-4">
							<p class="font-medium text-stone-800 dark:text-cream-100">
								{artist.sort_name || artist.name}
							</p>
							{#if artist.sort_name && artist.sort_name !== artist.name}
								<p class="text-sm text-stone-500 dark:text-stone-400">
									{artist.name}
								</p>
							{/if}
							<div class="flex flex-wrap gap-3 mt-1 text-sm text-stone-500 dark:text-stone-400">
								{#if artist.artist_type}
									<span>{artist.artist_type}</span>
								{/if}
								{#if artist.country}
									<span>{artist.country}</span>
								{/if}
								{#if artist.disambiguation}
									<span class="italic">{artist.disambiguation}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
