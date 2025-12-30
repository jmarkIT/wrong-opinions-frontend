<script lang="ts">
	import type { MovieSearchResult } from '$lib/api/types';
	import { MOVIE_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear } from '$lib/utils/dates';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		movie: MovieSearchResult;
		onSelect?: (movie: MovieSearchResult) => void;
		showAddButton?: boolean;
		isAdding?: boolean;
	}

	let { movie, onSelect, showAddButton = true, isAdding = false }: Props = $props();
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex">
	<a href="/movies/{movie.tmdb_id}" class="shrink-0">
		<img
			src={movie.poster_url || MOVIE_PLACEHOLDER}
			alt={movie.title}
			class="w-24 h-36 object-cover hover:opacity-80 transition-opacity"
		/>
	</a>
	<div class="p-4 flex-1 min-w-0 flex flex-col">
		<a href="/movies/{movie.tmdb_id}" class="hover:text-blue-600">
			<h3 class="font-semibold text-gray-900 dark:text-white truncate">
				{movie.title}
			</h3>
		</a>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			{extractYear(movie.release_date)}
			{#if movie.vote_average > 0}
				<span class="ml-2">★ {movie.vote_average.toFixed(1)}</span>
			{/if}
		</p>
		{#if movie.overview}
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 flex-1">
				{movie.overview}
			</p>
		{/if}
		{#if showAddButton && onSelect}
			<div class="mt-3">
				<Button
					variant="primary"
					onclick={() => onSelect(movie)}
					loading={isAdding}
					class="text-sm px-3 py-1"
				>
					Add to Week
				</Button>
			</div>
		{/if}
	</div>
</div>
