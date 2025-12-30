<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { albumsApi } from '$lib/api/albums';
	import type { AlbumDetails, AlbumCredits } from '$lib/api/types';
	import { ALBUM_PLACEHOLDER } from '$lib/utils/images';
	import { formatReleaseDate } from '$lib/utils/dates';

	let album = $state<AlbumDetails | null>(null);
	let credits = $state<AlbumCredits | null>(null);
	let isLoading = $state(true);
	let error = $state('');

	const musicbrainzId = $derived($page.params.musicbrainzId ?? '');

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
</script>

<svelte:head>
	<title>{album?.title || 'Album Details'} - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
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
	{:else if album}
		<div class="flex flex-col md:flex-row gap-8">
			<!-- Cover Art -->
			<div class="shrink-0">
				<img
					src={album.cover_art_url || ALBUM_PLACEHOLDER}
					alt={album.title}
					class="w-64 h-64 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
				/>
			</div>

			<!-- Info -->
			<div class="flex-1">
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
					{album.title}
				</h1>

				<p class="text-xl text-gray-600 dark:text-gray-400 mt-2">
					{album.artist || 'Unknown Artist'}
				</p>

				<div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
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
					class="inline-block mt-6 text-blue-600 hover:underline"
				>
					View on MusicBrainz →
				</a>
			</div>
		</div>

		<!-- Artists -->
		{#if credits?.artists && credits.artists.length > 0}
			<section class="mt-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Artists</h2>
				<div class="space-y-3">
					{#each credits.artists as artist}
						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
							<p class="font-medium text-gray-900 dark:text-white">
								{artist.name}
							</p>
							<div class="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
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
