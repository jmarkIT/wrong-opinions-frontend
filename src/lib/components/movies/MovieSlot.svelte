<script lang="ts">
	import type { WeekMovieSelection } from '$lib/api/types';
	import { getPosterUrl, MOVIE_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear } from '$lib/utils/dates';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		position: 1 | 2;
		selection?: WeekMovieSelection;
		isOwner?: boolean;
		onRemove?: () => void;
		onAdd?: () => void;
	}

	let { position, selection, isOwner = false, onRemove, onAdd }: Props = $props();

	const posterUrl = $derived(
		selection?.movie.poster_path
			? getPosterUrl(selection.movie.poster_path, 'w342')
			: null
	);
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
	<div class="p-4">
		<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
			Movie {position}
		</h3>

		{#if selection}
			<div class="flex gap-4">
				<img
					src={posterUrl || MOVIE_PLACEHOLDER}
					alt={selection.movie.title}
					class="w-24 h-36 object-cover rounded"
				/>
				<div class="flex-1 min-w-0">
					<h4 class="font-semibold text-gray-900 dark:text-white truncate">
						{selection.movie.title}
					</h4>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{extractYear(selection.movie.release_date)}
					</p>
					{#if selection.movie.overview}
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
							{selection.movie.overview}
						</p>
					{/if}
					{#if isOwner && onRemove}
						<Button variant="danger" onclick={onRemove} class="mt-3 text-sm px-3 py-1">
							Remove
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<div
				class="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
			>
				<p class="text-gray-500 dark:text-gray-400 mb-3">No movie selected</p>
				{#if isOwner && onAdd}
					<Button variant="secondary" onclick={onAdd}>
						Add Movie
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
