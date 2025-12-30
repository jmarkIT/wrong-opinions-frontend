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
	class="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4"
>
	<div class="flex items-start justify-between">
		<div>
			<h3 class="font-semibold text-gray-900 dark:text-white">
				{weekLabel}
			</h3>
			<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
				by {week.owner?.username || 'Unknown'}
				{#if isOwner}
					<span class="ml-2 inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
						You
					</span>
				{/if}
			</p>
		</div>
		<span class="text-gray-400 dark:text-gray-500">→</span>
	</div>
	{#if week.notes}
		<p class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
			{week.notes}
		</p>
	{/if}
</a>
