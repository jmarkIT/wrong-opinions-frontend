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

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex">
	<a href="/albums/{album.musicbrainz_id}" class="shrink-0">
		<img
			src={album.cover_art_url || ALBUM_PLACEHOLDER}
			alt={album.title}
			class="w-24 h-24 object-cover hover:opacity-80 transition-opacity"
		/>
	</a>
	<div class="p-4 flex-1 min-w-0 flex flex-col">
		<a href="/albums/{album.musicbrainz_id}" class="hover:text-blue-600">
			<h3 class="font-semibold text-gray-900 dark:text-white truncate">
				{album.title}
			</h3>
		</a>
		<p class="text-sm text-gray-600 dark:text-gray-400 truncate">
			{album.artist || 'Unknown Artist'}
		</p>
		<p class="text-sm text-gray-500 dark:text-gray-500">
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
					class="text-sm px-3 py-1"
				>
					Add to Week
				</Button>
			</div>
		{/if}
	</div>
</div>
