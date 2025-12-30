<script lang="ts">
	import { goto } from '$app/navigation';
	import { moviesApi } from '$lib/api/movies';
	import { weeksApi } from '$lib/api/weeks';
	import { toasts } from '$lib/stores/toast';
	import type { MovieSearchResult, WeekWithSelections } from '$lib/api/types';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import MovieCard from '$lib/components/movies/MovieCard.svelte';

	let query = $state('');
	let results = $state<MovieSearchResult[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(0);

	let currentWeek = $state<WeekWithSelections | null>(null);
	let addingMovieId = $state<number | null>(null);

	// Position selection modal
	let showPositionModal = $state(false);
	let selectedMovie = $state<MovieSearchResult | null>(null);

	const availablePositions = $derived(() => {
		if (!currentWeek) return [];
		const usedPositions = currentWeek.movies.map((m) => m.position);
		return ([1, 2] as const).filter((p) => !usedPositions.includes(p));
	});

	async function loadCurrentWeek() {
		const response = await weeksApi.current();
		if (response.data) {
			currentWeek = response.data;
		}
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

		// Also load current week if not loaded
		if (!currentWeek) {
			await loadCurrentWeek();
		}
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

		if (positions.length === 1) {
			// Only one position available, add directly
			addMovieToWeek(movie, positions[0]);
		} else {
			// Show position selection modal
			showPositionModal = true;
		}
	}

	async function addMovieToWeek(movie: MovieSearchResult, position: 1 | 2) {
		if (!currentWeek) return;

		addingMovieId = movie.tmdb_id;
		showPositionModal = false;

		const response = await weeksApi.addMovie(currentWeek.id, {
			tmdb_id: movie.tmdb_id,
			position
		});

		if (response.error) {
			toasts.error(response.error.detail);
		} else {
			toasts.success(`"${movie.title}" added to position ${position}`);
			await loadCurrentWeek();
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
</script>

<svelte:head>
	<title>Add Movie - Wrong Opinions</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif mb-6">Add Movie</h1>

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

<!-- Position Selection Modal -->
{#if showPositionModal && selectedMovie}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog">
		<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 shadow-lg p-6 max-w-sm w-full mx-4">
			<h2 class="text-lg font-semibold text-stone-800 dark:text-cream-100 font-serif mb-4">
				Select Position
			</h2>
			<p class="text-stone-600 dark:text-stone-400 mb-4">
				Add "{selectedMovie.title}" to which position?
			</p>
			<div class="flex gap-3">
				{#each availablePositions() as position}
					<Button
						onclick={() => addMovieToWeek(selectedMovie!, position)}
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
					selectedMovie = null;
				}}
				class="w-full mt-3"
			>
				Cancel
			</Button>
		</div>
	</div>
{/if}
