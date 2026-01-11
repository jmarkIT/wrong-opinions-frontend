<script lang="ts">
	import { goto } from '$app/navigation';
	import { moviesApi } from '$lib/api/movies';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import type { MovieSearchResult, WeekWithSelections } from '$lib/api/types';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MovieCard from '$lib/components/movies/MovieCard.svelte';
	import WeekPicker from '$lib/components/weeks/WeekPicker.svelte';

	let query = $state('');
	let results = $state<MovieSearchResult[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(0);

	let selectedWeek = $state<WeekWithSelections | null>(null);
	let addingMovieId = $state<number | null>(null);

	let selectedMovie = $state<MovieSearchResult | null>(null);

	// Manual lookup state
	let manualInput = $state('');
	let isLookingUp = $state(false);
	let lookupResult = $state<MovieSearchResult | null>(null);
	let lookupError = $state<string | null>(null);

	const availablePositions = $derived(() => {
		if (!selectedWeek) return [];
		const usedPositions = selectedWeek.movies.map((m) => m.position);
		return ([1, 2] as const).filter((p) => !usedPositions.includes(p));
	});

	function handleWeekChange(week: WeekWithSelections) {
		selectedWeek = week;
	}

	async function search() {
		if (!query.trim()) return;

		isSearching = true;
		hasSearched = true;

		const response = await moviesApi.search(query, currentPage);

		if (response.error) {
			toasts.error(response.error.detail);
		} else {
			results = response.data!.results;
			totalPages = response.data!.total_pages;
		}

		isSearching = false;
	}

	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		currentPage = 1;
		search();
	}

	function handleMovieSelect(movie: MovieSearchResult) {
		selectedMovie = movie;

		const positions = availablePositions();
		if (positions.length === 0) {
			toasts.error('Both movie slots are full. Remove a movie first.');
			return;
		}

		// Always add to first available position
		addMovieToWeek(movie, positions[0]);
	}

	async function addMovieToWeek(movie: MovieSearchResult, position: 1 | 2) {
		if (!selectedWeek) return;

		addingMovieId = movie.tmdb_id;

		const response = await weeksApi.addMovie(selectedWeek.id, {
			tmdb_id: movie.tmdb_id,
			position
		});

		if (response.error) {
			toasts.error(response.error.detail);
		} else {
			toasts.success(`"${movie.title}" added to position ${position}`);
			// Refresh the selected week to update available positions
			const weekRes = await weeksApi.get(selectedWeek.id);
			if (weekRes.data) {
				selectedWeek = weekRes.data;
			}
			// Clear lookup result if this was a manually looked-up movie
			if (lookupResult?.tmdb_id === movie.tmdb_id) {
				lookupResult = null;
				manualInput = '';
			}
		}

		addingMovieId = null;
		selectedMovie = null;
	}

	async function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			await search();
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			await search();
		}
	}

	function parseTmdbId(input: string): number | null {
		const trimmed = input.trim();

		// If it's already a number, return it
		const directNum = parseInt(trimmed, 10);
		if (!isNaN(directNum) && String(directNum) === trimmed) {
			return directNum;
		}

		// Try to extract ID from TMDB URL
		// Handles: https://www.themoviedb.org/movie/83533-avatar-fire-and-ash
		const urlMatch = trimmed.match(/themoviedb\.org\/movie\/(\d+)/i);
		if (urlMatch) {
			return parseInt(urlMatch[1], 10);
		}

		return null;
	}

	function handleLookupSubmit(e: Event) {
		e.preventDefault();
		lookupMovie();
	}

	async function lookupMovie() {
		if (isLookingUp) return;

		const id = parseTmdbId(manualInput);
		if (!id) {
			lookupError = 'Please enter a valid TMDB movie ID or URL';
			return;
		}

		isLookingUp = true;
		lookupError = null;
		lookupResult = null;

		const response = await moviesApi.details(id);

		if (response.error) {
			if (response.error.status === 404) {
				lookupError = 'Movie not found. Check the ID and try again.';
			} else {
				lookupError = response.error.detail;
			}
		} else {
			// Convert MovieDetails to MovieSearchResult format
			lookupResult = {
				tmdb_id: response.data!.tmdb_id,
				title: response.data!.title,
				original_title: response.data!.original_title,
				release_date: response.data!.release_date,
				poster_url: response.data!.poster_url,
				overview: response.data!.overview,
				vote_average: response.data!.vote_average
			};
		}

		isLookingUp = false;
	}
</script>

<svelte:head>
	<title>Add Movie - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif mb-6">Add Movie</h1>

	<div class="mb-6">
		<WeekPicker
			selectedWeek={selectedWeek}
			onWeekChange={handleWeekChange}
			mediaType="movies"
		/>
	</div>

	<form onsubmit={handleSearchSubmit} class="flex gap-3 mb-6">
		<Input
			name="query"
			placeholder="Search for a movie..."
			bind:value={query}
			class="flex-1"
		/>
		<Button type="submit" loading={isSearching}>
			Search
		</Button>
	</form>

	<div class="border-t border-cream-200 dark:border-stone-700 pt-6 mt-2 mb-6">
		<p class="text-sm text-stone-600 dark:text-stone-400 mb-3">
			Or paste a TMDB movie URL or ID:
		</p>
		<form onsubmit={handleLookupSubmit} class="flex gap-3 mb-4">
			<Input
				name="manualInput"
				placeholder="e.g., 83533 or themoviedb.org/movie/83533"
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
			<MovieCard
				movie={lookupResult}
				onSelect={handleMovieSelect}
				isAdding={addingMovieId === lookupResult.tmdb_id}
			/>
		{/if}
	</div>

	{#if isSearching}
		<div class="flex justify-center py-12">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"
			></div>
		</div>
	{:else if results.length > 0}
		<div class="space-y-4">
			{#each results as movie (movie.tmdb_id)}
				<MovieCard
					{movie}
					onSelect={handleMovieSelect}
					isAdding={addingMovieId === movie.tmdb_id}
				/>
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
	{:else if hasSearched}
		<p class="text-center text-stone-500 dark:text-stone-400 py-12">
			No movies found for "{query}"
		</p>
	{:else}
		<p class="text-center text-stone-500 dark:text-stone-400 py-12">
			Enter a search term to find movies
		</p>
	{/if}
</div>

