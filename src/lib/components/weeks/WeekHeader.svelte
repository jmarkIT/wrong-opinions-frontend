<script lang="ts">
	import { formatWeekRange } from '$lib/utils/dates';

	interface Props {
		year: number;
		weekNumber: number;
		ownerUsername?: string;
		isOwner?: boolean;
	}

	let { year, weekNumber, ownerUsername, isOwner = false }: Props = $props();

	const weekDisplay = $derived(formatWeekRange(year, weekNumber));
</script>

<div class="mb-8">
	<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif">
		{weekDisplay}
	</h1>
	{#if ownerUsername}
		<p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
			{#if isOwner}
				Your selections
			{:else}
				Selections by <span class="font-medium text-stone-700 dark:text-stone-300">{ownerUsername}</span>
			{/if}
		</p>
	{/if}
</div>
