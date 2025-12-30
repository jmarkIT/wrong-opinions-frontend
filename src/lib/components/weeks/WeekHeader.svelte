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

<div class="mb-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
		{weekDisplay}
	</h1>
	{#if ownerUsername}
		<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
			{#if isOwner}
				Your selections
			{:else}
				Selections by <span class="font-medium">{ownerUsername}</span>
			{/if}
		</p>
	{/if}
</div>
