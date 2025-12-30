<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { moviesApi } from '$lib/api/movies';
	import { toasts } from '$lib/stores/toast';
	import type { MovieDetails, MovieCredits } from '$lib/api/types';
	import { MOVIE_PLACEHOLDER, getBackdropUrl } from '$lib/utils/images';
	import { formatReleaseDate } from '$lib/utils/dates';

	let movie = $state<MovieDetails | null>(null);
	let credits = $state<MovieCredits | null>(null);
	let isLoading = $state(true);
	let error = $state('');

	const tmdbId = $derived(parseInt($page.params.tmdbId ?? '0', 10));

	onMount(async () => {
		await loadMovie();
	});

	async function loadMovie() {
		isLoading = true;
		error = '';

		const [movieRes, creditsRes] = await Promise.all([
			moviesApi.details(tmdbId),
			moviesApi.credits(tmdbId, 10)
		]);

		if (movieRes.error) {
			error = movieRes.error.detail;
		} else {
			movie = movieRes.data!;
		}

		if (creditsRes.data) {
			credits = creditsRes.data;
		}

		isLoading = false;
	}

	const backdropUrl = $derived(movie?.backdrop_url ? getBackdropUrl(movie.backdrop_url) : null);
</script>

<svelte:head>
	<title>{movie?.title || 'Movie Details'} - Wrong Opinions</title>
</svelte:head>

{#if isLoading}
	<div class="flex justify-center items-center h-64">
		<div
			class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
		></div>
	</div>
{:else if error}
	<div class="max-w-4xl mx-auto px-4 py-8">
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	</div>
{:else if movie}
	<!-- Backdrop -->
	{#if backdropUrl}
		<div class="relative h-64 md:h-96 overflow-hidden">
			<img
				src={backdropUrl}
				alt=""
				class="w-full h-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
		</div>
	{/if}

	<div class="max-w-4xl mx-auto px-4 py-8 {backdropUrl ? '-mt-32 relative z-10' : ''}">
		<div class="flex flex-col md:flex-row gap-8">
			<!-- Poster -->
			<div class="shrink-0">
				<img
					src={movie.poster_url || MOVIE_PLACEHOLDER}
					alt={movie.title}
					class="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
				/>
			</div>

			<!-- Info -->
			<div class="flex-1">
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
					{movie.title}
				</h1>

				{#if movie.tagline}
					<p class="text-gray-600 dark:text-gray-400 italic mt-1">
						"{movie.tagline}"
					</p>
				{/if}

				<div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
					{#if movie.release_date}
						<span>{formatReleaseDate(movie.release_date)}</span>
					{/if}
					{#if movie.runtime}
						<span>{movie.runtime} min</span>
					{/if}
					{#if movie.vote_average > 0}
						<span>★ {movie.vote_average.toFixed(1)} ({movie.vote_count?.toLocaleString()} votes)</span>
					{/if}
					{#if movie.status}
						<span>{movie.status}</span>
					{/if}
				</div>

				{#if movie.overview}
					<p class="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed">
						{movie.overview}
					</p>
				{/if}

				{#if movie.imdb_id}
					<a
						href="https://www.imdb.com/title/{movie.imdb_id}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-block mt-4 text-blue-600 hover:underline"
					>
						View on IMDb →
					</a>
				{/if}
			</div>
		</div>

		<!-- Cast -->
		{#if credits?.cast && credits.cast.length > 0}
			<section class="mt-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cast</h2>
				<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
					{#each credits.cast as member}
						<div class="text-center">
							<div class="w-20 h-20 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
								{#if member.profile_url}
									<img
										src={member.profile_url}
										alt={member.name}
										class="w-full h-full object-cover"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center text-2xl">👤</div>
								{/if}
							</div>
							<p class="mt-2 font-medium text-gray-900 dark:text-white text-sm truncate">
								{member.name}
							</p>
							{#if member.character}
								<p class="text-xs text-gray-600 dark:text-gray-400 truncate">
									{member.character}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Crew -->
		{#if credits?.crew && credits.crew.length > 0}
			<section class="mt-12">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Crew</h2>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
					{#each credits.crew as member}
						<div class="bg-white dark:bg-gray-800 rounded p-3">
							<p class="font-medium text-gray-900 dark:text-white">{member.name}</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">{member.job}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
