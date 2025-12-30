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

<header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
	<div class="max-w-6xl mx-auto px-4 py-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/weeks/current" class="text-xl font-bold text-gray-900 dark:text-white">
					Wrong Opinions
				</a>

				{#if $currentUser}
					<nav class="hidden md:flex items-center gap-6">
						{#each navLinks as link}
							<a
								href={link.href}
								class="text-sm font-medium transition-colors
									{$page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')
									? 'text-blue-600 dark:text-blue-400'
									: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
							>
								{link.label}
							</a>
						{/each}
					</nav>
				{/if}
			</div>

			{#if $currentUser}
				<div class="flex items-center gap-4">
					<span class="text-sm text-gray-600 dark:text-gray-400">
						{$currentUser.username}
					</span>
					<Button variant="secondary" onclick={handleLogout}>
						Logout
					</Button>
				</div>
			{/if}
		</div>

		{#if $currentUser}
			<nav class="md:hidden flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium transition-colors
							{$page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')
							? 'text-blue-600 dark:text-blue-400'
							: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</header>
