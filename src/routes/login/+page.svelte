<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

<svelte:head>
	<title>Sign In - Wrong Opinions</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
	<div class="w-full max-w-md">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
				<p class="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
			</div>

			<LoginForm />
		</div>
	</div>
</div>
