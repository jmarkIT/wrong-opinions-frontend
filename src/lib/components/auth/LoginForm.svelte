<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isLoading = true;

		const result = await auth.login({ username, password });

		isLoading = false;

		if (result.success) {
			toasts.success('Welcome back!');
			goto('/weeks/current');
		} else {
			error = result.error || 'Login failed';
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
			{error}
		</div>
	{/if}

	<Input
		name="username"
		label="Username or Email"
		placeholder="Enter your username or email"
		bind:value={username}
		required
		disabled={isLoading}
	/>

	<Input
		type="password"
		name="password"
		label="Password"
		placeholder="Enter your password"
		bind:value={password}
		required
		disabled={isLoading}
	/>

	<Button type="submit" loading={isLoading} class="w-full">
		Sign In
	</Button>

	<p class="text-center text-sm text-stone-500 dark:text-stone-400">
		Don't have an account?
		<a href="/register" class="text-amber-700 dark:text-amber-500 hover:underline">Sign up</a>
	</p>
</form>
