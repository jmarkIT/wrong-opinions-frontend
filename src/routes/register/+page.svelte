<script lang="ts">
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
</script>

<svelte:head>
	<title>Create Account - Wrong Opinions</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
	<div class="w-full max-w-md">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
				<p class="text-gray-600 dark:text-gray-400 mt-2">Join Wrong Opinions today</p>
			</div>

			<RegisterForm />
		</div>
	</div>
</div>
