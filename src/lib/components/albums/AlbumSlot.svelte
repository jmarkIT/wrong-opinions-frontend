<script lang="ts">
	import { goto } from '$app/navigation';
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

	function navigateToAlbum(): void {
		if (selection) {
			goto(`/albums/${selection.album.musicbrainz_id}`);
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			navigateToAlbum();
		}
	}
</script>

<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 overflow-hidden">
	<div class="p-4">
		{#if selection}
			<div class="flex gap-4 h-36">
				<div
					role="button"
					tabindex="0"
					onclick={navigateToAlbum}
					onkeydown={handleKeydown}
					class="w-24 h-36 flex items-center justify-center flex-shrink-0 cursor-pointer"
				>
					<img
						src={selection.album.cover_art_url || ALBUM_PLACEHOLDER}
						alt={selection.album.title}
						class="w-24 h-24 object-cover rounded hover:ring-2 hover:ring-amber-400 transition-shadow"
						onerror={(e) => { (e.currentTarget as HTMLImageElement).src = ALBUM_PLACEHOLDER; }}
					/>
				</div>
				<div class="flex-1 min-w-0 flex flex-col">
					<div
						role="button"
						tabindex="0"
						onclick={navigateToAlbum}
						onkeydown={handleKeydown}
						class="flex-1 overflow-hidden cursor-pointer group"
					>
						<h4 class="font-semibold text-stone-800 dark:text-cream-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
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
