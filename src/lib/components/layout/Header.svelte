<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth, currentUser } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';

	function handleLogout() {
		auth.logout();
		goto('/login');
	}

	const navSections = [
		{
			label: 'Weeks',
			links: [
				{ href: '/weeks/current', label: 'This Week' },
				{ href: '/weeks', label: 'All Weeks' }
			]
		},
		{
			label: 'Media',
			links: [
				{ href: '/movies/all', label: 'Movies' },
				{ href: '/albums/all', label: 'Albums' }
			]
		},
		{
			label: 'Search',
			links: [
				{ href: '/movies', label: 'Movies' },
				{ href: '/albums', label: 'Albums' }
			]
		}
	];

	// Track which mobile section is expanded
	let mobileOpenSection = $state<string | null>(null);

	function toggleMobileSection(label: string) {
		mobileOpenSection = mobileOpenSection === label ? null : label;
	}

	function isSectionActive(section: typeof navSections[0]): boolean {
		return section.links.some((link) => isLinkActive(link.href));
	}

	function isLinkActive(href: string): boolean {
		const pathname = $page.url.pathname;

		// Exact match always works
		if (pathname === href) return true;

		// Special handling for routes that share prefixes
		switch (href) {
			case '/movies':
			case '/albums':
				// Search pages: exact match only (don't match /movies/all, /movies/123, etc.)
				return false;

			case '/weeks/current':
				// This Week: exact match only
				return false;

			case '/weeks':
				// All Weeks: also matches /weeks/[id] but NOT /weeks/current
				return pathname.startsWith('/weeks/') && pathname !== '/weeks/current';

			case '/movies/all':
			case '/albums/all':
				// Media lists: exact match or sub-paths
				return pathname.startsWith(href + '/');

			default:
				return false;
		}
	}

	// Close mobile menu when navigating
	$effect(() => {
		$page.url.pathname;
		mobileOpenSection = null;
	});
</script>

<header class="bg-cream-100 dark:bg-stone-800 border-b border-cream-200 dark:border-stone-700">
	<div class="max-w-5xl mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/weeks/current" class="text-xl font-bold text-stone-800 dark:text-cream-100 font-serif tracking-tight hover:text-amber-700 dark:hover:text-amber-500">
					Wrong Opinions
				</a>

				{#if $currentUser}
					<nav class="hidden md:flex items-center gap-1">
						{#each navSections as section}
							<div class="relative group">
								<button
									type="button"
									class="px-3 py-2 text-sm font-medium transition-colors rounded-md
										{isSectionActive(section)
										? 'text-amber-700 dark:text-amber-500'
										: 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-cream-100'}"
									aria-haspopup="true"
								>
									{section.label}
									<svg class="inline-block w-3 h-3 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								<div class="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
									<div class="bg-cream-50 dark:bg-stone-800 border border-cream-200 dark:border-stone-700 rounded-md shadow-md py-1 min-w-32">
										{#each section.links as link}
											<a
												href={link.href}
												class="block px-4 py-2 text-sm transition-colors
													{isLinkActive(link.href)
													? 'text-amber-700 dark:text-amber-500 bg-cream-100 dark:bg-stone-700'
													: 'text-stone-600 hover:text-stone-800 hover:bg-cream-100 dark:text-stone-300 dark:hover:text-cream-100 dark:hover:bg-stone-700'}"
											>
												{link.label}
											</a>
										{/each}
									</div>
								</div>
							</div>
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
			<nav class="md:hidden mt-3 pt-3 border-t border-cream-200 dark:border-stone-700">
				<div class="flex items-center gap-4">
					{#each navSections as section}
						<button
							type="button"
							onclick={() => toggleMobileSection(section.label)}
							class="text-sm font-medium transition-colors
								{isSectionActive(section)
								? 'text-amber-700 dark:text-amber-500'
								: 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-cream-100'}"
							aria-expanded={mobileOpenSection === section.label}
							aria-haspopup="true"
						>
							{section.label}
							<svg
								class="inline-block w-3 h-3 ml-1 transition-transform {mobileOpenSection === section.label ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
					{/each}
				</div>

				{#each navSections as section}
					{#if mobileOpenSection === section.label}
						<div class="flex gap-4 mt-2 pl-2">
							{#each section.links as link}
								<a
									href={link.href}
									class="text-sm transition-colors
										{isLinkActive(link.href)
										? 'text-amber-700 dark:text-amber-500'
										: 'text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-cream-100'}"
								>
									{link.label}
								</a>
							{/each}
						</div>
					{/if}
				{/each}
			</nav>
		{/if}
	</div>
</header>
