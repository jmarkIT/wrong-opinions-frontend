<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';

	onMount(() => {
		// Redirect based on auth state
		// This is a fallback - the layout should handle most redirects
		if ($isAuthenticated) {
			goto('/weeks/current');
		} else {
			goto('/login');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
	<div class="text-center">
		<div
			class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
		></div>
		<p class="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
	</div>
</div>
