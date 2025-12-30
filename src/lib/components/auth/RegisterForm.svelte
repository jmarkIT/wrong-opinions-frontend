<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { toasts } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let isLoading = $state(false);

	function validate(): boolean {
		fieldErrors = {};

		if (username.length < 3) {
			fieldErrors.username = 'Username must be at least 3 characters';
		}

		if (!email.includes('@')) {
			fieldErrors.email = 'Please enter a valid email address';
		}

		if (password.length < 8) {
			fieldErrors.password = 'Password must be at least 8 characters';
		}

		if (password !== confirmPassword) {
			fieldErrors.confirmPassword = 'Passwords do not match';
		}

		return Object.keys(fieldErrors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!validate()) {
			return;
		}

		isLoading = true;

		const result = await auth.register({ username, email, password });

		isLoading = false;

		if (result.success) {
			toasts.success('Account created! Please sign in.');
			goto('/login');
		} else {
			error = result.error || 'Registration failed';
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
			{error}
		</div>
	{/if}

	<Input
		name="username"
		label="Username"
		placeholder="Choose a username"
		bind:value={username}
		error={fieldErrors.username}
		required
		disabled={isLoading}
	/>

	<Input
		type="email"
		name="email"
		label="Email"
		placeholder="Enter your email"
		bind:value={email}
		error={fieldErrors.email}
		required
		disabled={isLoading}
	/>

	<Input
		type="password"
		name="password"
		label="Password"
		placeholder="Choose a password (min 8 characters)"
		bind:value={password}
		error={fieldErrors.password}
		required
		disabled={isLoading}
	/>

	<Input
		type="password"
		name="confirmPassword"
		label="Confirm Password"
		placeholder="Confirm your password"
		bind:value={confirmPassword}
		error={fieldErrors.confirmPassword}
		required
		disabled={isLoading}
	/>

	<Button type="submit" loading={isLoading} class="w-full">
		Create Account
	</Button>

	<p class="text-center text-sm text-gray-600 dark:text-gray-400">
		Already have an account?
		<a href="/login" class="text-blue-600 hover:underline">Sign in</a>
	</p>
</form>
