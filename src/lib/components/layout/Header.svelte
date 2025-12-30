<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth, currentUser } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';

	function handleLogout() {
		auth.logout();
		goto('/login');
	}

	const navLinks = [
		{ href: '/weeks/current', label: 'This Week' },
		{ href: '/weeks', label: 'All Weeks' },
		{ href: '/movies/all', label: 'All Movies' },
		{ href: '/albums/all', label: 'All Albums' },
		{ href: '/movies', label: 'Add Movie' },
		{ href: '/albums', label: 'Add Album' }
	];
</script>

<header class="bg-cream-100 dark:bg-stone-800 border-b border-cream-200 dark:border-stone-700">
	<div class="max-w-5xl mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/weeks/current" class="text-xl font-bold text-stone-800 dark:text-cream-100 font-serif tracking-tight hover:text-amber-700 dark:hover:text-amber-500">
					Wrong Opinions
				</a>

				{#if $currentUser}
					<nav class="hidden md:flex items-center gap-5">
						{#each navLinks as link}
							<a
								href={link.href}
								class="text-sm font-medium transition-colors
									{$page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')
									? 'text-amber-700 dark:text-amber-500'
									: 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-cream-100'}"
							>
								{link.label}
							</a>
						{/each}
					</nav>
				{/if}
			</div>

			{#if $currentUser}
				<div class="flex items-center gap-4">
					<span class="text-sm text-stone-500 dark:text-stone-400">
						{$currentUser.username}
					</span>
					<Button variant="secondary" onclick={handleLogout}>
						Logout
					</Button>
				</div>
			{/if}
		</div>

		{#if $currentUser}
			<nav class="md:hidden flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-cream-200 dark:border-stone-700">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium transition-colors
							{$page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')
							? 'text-amber-700 dark:text-amber-500'
							: 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-cream-100'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</header>
