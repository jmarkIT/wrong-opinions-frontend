<script lang="ts">
	import type { AlbumSearchResult } from '$lib/api/types';
	import { ALBUM_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear } from '$lib/utils/dates';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		album: AlbumSearchResult;
		onSelect?: (album: AlbumSearchResult) => void;
		showAddButton?: boolean;
		isAdding?: boolean;
	}

	let { album, onSelect, showAddButton = true, isAdding = false }: Props = $props();
</script>

<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 overflow-hidden flex hover:border-cream-300 dark:hover:border-stone-600 transition-colors">
	<a href="/albums/{album.musicbrainz_id}" class="shrink-0">
		<img
			src={album.cover_art_url || ALBUM_PLACEHOLDER}
			alt={album.title}
			class="w-24 h-24 object-cover hover:opacity-90 transition-opacity"
		/>
	</a>
	<div class="p-4 flex-1 min-w-0 flex flex-col">
		<a href="/albums/{album.musicbrainz_id}" class="hover:text-amber-700 dark:hover:text-amber-500">
			<h3 class="font-semibold text-stone-800 dark:text-cream-100 truncate">
				{album.title}
			</h3>
		</a>
		<p class="text-sm text-stone-600 dark:text-stone-400 truncate">
			{album.artist || 'Unknown Artist'}
		</p>
		<p class="text-sm text-stone-500 dark:text-stone-500">
			{extractYear(album.release_date)}
			{#if album.country}
				<span class="ml-2">{album.country}</span>
			{/if}
		</p>
		{#if showAddButton && onSelect}
			<div class="mt-auto pt-3">
				<Button
					variant="primary"
					onclick={() => onSelect(album)}
					loading={isAdding}
					class="text-sm px-3 py-1.5"
				>
					Add to Week
				</Button>
			</div>
		{/if}
	</div>
</div>
