<script lang="ts">
	import type { Week } from '$lib/api/types';
	import { formatWeekShort } from '$lib/utils/dates';
	import { auth } from '$lib/stores/auth';

	interface Props {
		week: Week;
	}

	let { week }: Props = $props();

	const isOwner = $derived(auth.isOwner(week.user_id));
	const weekLabel = $derived(formatWeekShort(week.year, week.week_number));
</script>

<a
	href="/weeks/{week.id}"
	class="block bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 transition-colors p-4"
>
	<div class="flex items-start justify-between">
		<div>
			<h3 class="font-semibold text-stone-800 dark:text-cream-100">
				{weekLabel}
			</h3>
			<p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
				by {week.owner?.username || 'Unknown'}
				{#if isOwner}
					<span class="ml-2 inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs rounded">
						You
					</span>
				{/if}
			</p>
		</div>
		<span class="text-stone-400 dark:text-stone-500">→</span>
	</div>
	{#if week.notes}
		<p class="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">
			{week.notes}
		</p>
	{/if}
</a>
