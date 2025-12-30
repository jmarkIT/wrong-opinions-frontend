<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { moviesApi } from '$lib/api/movies';
	import type { MovieWithSelections } from '$lib/api/types';
	import Button from '$lib/components/ui/Button.svelte';
	import { getPosterUrl, MOVIE_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear, formatWeekShort } from '$lib/utils/dates';

	let movies = $state<MovieWithSelections[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalCount = $state(0);

	const pageSize = 20;

	onMount(async () => {
		await loadMovies();
	});

	async function loadMovies() {
		isLoading = true;
		error = '';

		const response = await moviesApi.selections(currentPage, pageSize);

		if (response.error) {
			error = response.error.detail;
		} else {
			movies = response.data!.results;
			totalCount = response.data!.total;
			totalPages = Math.ceil(totalCount / pageSize);
		}

		isLoading = false;
	}

	async function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			await loadMovies();
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			await loadMovies();
		}
	}
</script>

<svelte:head>
	<title>All Movies - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif mb-6">All Movies</h1>

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
	{:else if movies.length > 0}
		<p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
			{totalCount} movie{totalCount === 1 ? '' : 's'} selected
		</p>

		<div class="space-y-4">
			{#each movies as movie (movie.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => goto(`/movies/${movie.tmdb_id}`)}
					onkeydown={(e) => e.key === 'Enter' && goto(`/movies/${movie.tmdb_id}`)}
					class="flex gap-4 p-4 bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 transition-colors cursor-pointer"
				>
					<img
						src={getPosterUrl(movie.poster_path, 'w154') ?? MOVIE_PLACEHOLDER}
						alt={movie.title}
						class="w-20 h-30 object-cover rounded flex-shrink-0"
					/>
					<div class="flex-1 min-w-0">
						<h2 class="text-lg font-semibold text-stone-800 dark:text-cream-100 truncate">
							{movie.title}
						</h2>
						{#if movie.release_date}
							<p class="text-sm text-stone-500 dark:text-stone-400">
								{extractYear(movie.release_date)}
							</p>
						{/if}
						<div class="mt-2">
							<p class="text-xs text-stone-500 dark:text-stone-500 mb-1">Selected in:</p>
							<div class="flex flex-wrap gap-1">
								{#each movie.selections as selection}
									<a
										href="/weeks/{selection.week_id}"
										onclick={(e) => e.stopPropagation()}
										class="inline-block px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-800/50"
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
			No movies have been selected yet
		</p>
	{/if}
</div>
