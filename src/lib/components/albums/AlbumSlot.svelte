<script lang="ts">
	import type { WeekAlbumSelection } from '$lib/api/types';
	import { ALBUM_PLACEHOLDER } from '$lib/utils/images';
	import { extractYear } from '$lib/utils/dates';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		position: 1 | 2;
		selection?: WeekAlbumSelection;
		isOwner?: boolean;
		onRemove?: () => void;
		onAdd?: () => void;
	}

	let { position, selection, isOwner = false, onRemove, onAdd }: Props = $props();
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
	<div class="p-4">
		<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
			Album {position}
		</h3>

		{#if selection}
			<div class="flex gap-4">
				<img
					src={selection.album.cover_art_url || ALBUM_PLACEHOLDER}
					alt={selection.album.title}
					class="w-24 h-24 object-cover rounded"
				/>
				<div class="flex-1 min-w-0">
					<h4 class="font-semibold text-gray-900 dark:text-white truncate">
						{selection.album.title}
					</h4>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{selection.album.artist}
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-500">
						{extractYear(selection.album.release_date)}
					</p>
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
				<p class="text-gray-500 dark:text-gray-400 mb-3">No album selected</p>
				{#if isOwner && onAdd}
					<Button variant="secondary" onclick={onAdd}>
						Add Album
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
