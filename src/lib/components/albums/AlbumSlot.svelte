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

<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 overflow-hidden">
	<div class="p-4">
		<h3 class="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3">
			Album {position}
		</h3>

		{#if selection}
			<div class="flex gap-4 h-36">
				<div class="w-24 h-36 flex items-center justify-center flex-shrink-0">
					<img
						src={selection.album.cover_art_url || ALBUM_PLACEHOLDER}
						alt={selection.album.title}
						class="w-24 h-24 object-cover rounded"
					/>
				</div>
				<div class="flex-1 min-w-0 flex flex-col">
					<div class="flex-1 overflow-hidden">
						<h4 class="font-semibold text-stone-800 dark:text-cream-100 truncate">
							{selection.album.title}
						</h4>
						<p class="text-sm text-stone-600 dark:text-stone-400 truncate">
							{selection.album.artist}
						</p>
						<p class="text-sm text-stone-500 dark:text-stone-500">
							{extractYear(selection.album.release_date)}
						</p>
					</div>
					{#if isOwner && onRemove}
						<Button variant="danger" onclick={onRemove} class="mt-2 text-sm px-3 py-1.5 self-start">
							Remove
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<div
				class="flex flex-col items-center justify-center h-36 border-2 border-dashed border-cream-300 dark:border-stone-600 rounded-md bg-cream-50 dark:bg-stone-800/50"
			>
				<p class="text-stone-500 dark:text-stone-400 mb-3">No album selected</p>
				{#if isOwner && onAdd}
					<Button variant="secondary" onclick={onAdd}>
						Add Album
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
