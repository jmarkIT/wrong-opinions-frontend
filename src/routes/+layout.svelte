<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import Header from '$lib/components/layout/Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { children } = $props();

	const publicPaths = ['/login', '/register'];

	onMount(() => {
		auth.initialize();
	});

	$effect(() => {
		if (!browser) return;

		const isPublicPath = publicPaths.includes($page.url.pathname);
		const authState = $auth;

		if (!authState.isInitialized) return;

		if (!$isAuthenticated && !isPublicPath) {
			goto('/login');
		} else if ($isAuthenticated && isPublicPath) {
			goto('/weeks/current');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !$auth.isInitialized}
	<div class="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-stone-900">
		<div class="text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"
			></div>
			<p class="mt-4 text-stone-500 dark:text-stone-400">Loading...</p>
		</div>
	</div>
{:else}
	{#if $isAuthenticated}
		<Header />
	{/if}

	<main>
		{@render children()}
	</main>

	<Toast />
{/if}
